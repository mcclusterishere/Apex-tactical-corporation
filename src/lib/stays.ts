/**
 * Apex Stays — the contribution ledger.
 *
 * The constant unit of measurement is the APEX STAY: two nights — check in the
 * first afternoon, the whole day between, out by midday. Two nights, a day and
 * a half. Internally everything is stored in whole NIGHTS (integers), because
 * the booking engine already thinks in nights and integers cannot round apart.
 * 2 nights = 1 Stay; odd nights display as halves ("1½ Stays").
 *
 * The firewall, stated once and enforced by omission everywhere:
 *
 *   - A Stay is NEVER denominated in dollars. No field in this module, its
 *     models, or its chain payloads carries a monetary amount.
 *   - Stays cannot be BOUGHT. There is no function that accepts money and
 *     produces Stays.
 *   - Stays cannot be REDEEMED for money or converted to the Apex Mark. There
 *     is no function that consumes Stays and produces dollars, cents, or
 *     Marks. This mirrors the Mint's own discipline (docs/16): the dangerous
 *     function is not guarded — it is absent, and tests assert its absence.
 *   - Stays move only inside the family: earned from the Kingdom for work,
 *     gifted member-to-member, spent back to the Kingdom for nights. A
 *     closed loop of hospitality, not a currency.
 *
 * Earn: an ApexTask is posted, claimed, done, and VERIFIED by someone other
 * than the person who did it (two-person rule). Verification credits the
 * worker's balance and writes STAY_EARNED to the chain.
 * Gift: any member may send Stays to another member. Both sides are written
 * as a pair (GIFT_OUT / GIFT_IN) in one transaction.
 * Spend: nights at a family property. Spending checks the balance inside the
 * same transaction that writes the entry, so a balance can never go negative
 * in a race.
 */
import { prisma } from "./db";
import { appendToChainTx } from "./chain";
import type { CanonicalValue } from "./canonical";
import type { Principal } from "./auth";

export class StayError extends Error {}

/** Nights per Apex Stay. The constant the whole system is measured in. */
export const NIGHTS_PER_STAY = 2;

/** "4 nights" -> "2 Stays"; "3 nights" -> "1½ Stays"; "1 night" -> "½ Stay". */
export function formatStays(nights: number): string {
  if (!Number.isInteger(nights) || nights < 0) return "—";
  const whole = Math.floor(nights / NIGHTS_PER_STAY);
  const half = nights % NIGHTS_PER_STAY === 1;
  const n = half ? (whole === 0 ? "½" : `${whole}½`) : String(whole);
  const one = n === "1" || n === "½";
  return `${n} ${one ? "Stay" : "Stays"}`;
}

export function assertNights(nights: number, label = "Nights"): void {
  if (!Number.isInteger(nights) || nights < 1 || !Number.isSafeInteger(nights)) {
    throw new StayError(`${label} must be a whole, positive number of nights.`);
  }
}

const ENTRY_KINDS = ["EARN", "GIFT_OUT", "GIFT_IN", "SPEND", "ADJUST"] as const;
export type StayEntryKind = (typeof ENTRY_KINDS)[number];

/** Which entry kinds add to a balance, and which subtract. Pure, testable. */
export function entrySign(kind: string): 1 | -1 {
  switch (kind) {
    case "EARN":
    case "GIFT_IN":
    case "ADJUST":
      return 1;
    case "GIFT_OUT":
    case "SPEND":
      return -1;
    default:
      throw new StayError(`Unknown stay entry kind "${kind}".`);
  }
}

/** Balance from a list of entries. Pure, so the arithmetic is testable alone. */
export function balanceFromEntries(entries: { kind: string; nights: number }[]): number {
  return entries.reduce((sum, entry) => sum + entrySign(entry.kind) * entry.nights, 0);
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function balanceInTx(tx: Tx, userId: string): Promise<number> {
  const entries = await tx.stayEntry.findMany({
    where: { userId },
    select: { kind: true, nights: true },
  });
  return balanceFromEntries(entries);
}

export async function balanceOf(userId: string): Promise<number> {
  const entries = await prisma.stayEntry.findMany({
    where: { userId },
    select: { kind: true, nights: true },
  });
  return balanceFromEntries(entries);
}

// ---------------------------------------------------------------- tasks

const TASK_STATUSES = ["OPEN", "CLAIMED", "DONE", "VERIFIED", "CANCELLED"] as const;

export interface PostTaskInput {
  title: string;
  detail?: string | null;
  propertyLabel: string;
  zomeId?: string | null;
  rewardNights: number;
}

/** Post a task the family can earn Stays by completing. */
export async function postTask(principal: Principal, input: PostTaskInput) {
  const title = input.title?.trim();
  const propertyLabel = input.propertyLabel?.trim();
  if (!title) throw new StayError("A task needs a title.");
  if (!propertyLabel) throw new StayError("Name the property or business the work is for.");
  assertNights(input.rewardNights, "The reward");

  return prisma.$transaction(async (tx) => {
    const task = await tx.apexTask.create({
      data: {
        title,
        detail: input.detail?.trim() || null,
        propertyLabel,
        zomeId: input.zomeId || null,
        rewardNights: input.rewardNights,
        status: "OPEN",
        postedById: principal.id,
      },
    });
    await appendToChainTx(tx, {
      eventType: "APEX_TASK_POSTED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        taskId: task.id,
        title,
        propertyLabel,
        rewardNights: input.rewardNights,
      } satisfies CanonicalValue,
    });
    return task;
  });
}

/** Claim an open task. First come, first serve — enforced in the transaction. */
export async function claimTask(principal: Principal, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.apexTask.findUnique({ where: { id: taskId } });
    if (!task) throw new StayError("No such task.");
    if (task.status !== "OPEN") throw new StayError("That task is not open to claim.");
    return tx.apexTask.update({
      where: { id: taskId },
      data: { status: "CLAIMED", claimedById: principal.id, claimedAt: new Date() },
    });
  });
}

/** The claimant reports the work done, ready for verification. */
export async function reportTaskDone(principal: Principal, taskId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.apexTask.findUnique({ where: { id: taskId } });
    if (!task) throw new StayError("No such task.");
    if (task.status !== "CLAIMED") throw new StayError("Only a claimed task can be marked done.");
    if (task.claimedById !== principal.id) {
      throw new StayError("Only the person who claimed the task can mark it done.");
    }
    return tx.apexTask.update({
      where: { id: taskId },
      data: { status: "DONE", doneAt: new Date(), note: note?.trim() || task.note },
    });
  });
}

/**
 * Verify the work and credit the Stays. The two-person rule is absolute: the
 * verifier cannot be the person who did the work, however senior.
 */
export async function verifyTask(principal: Principal, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.apexTask.findUnique({ where: { id: taskId } });
    if (!task) throw new StayError("No such task.");
    if (task.status !== "DONE") throw new StayError("Only a task marked done can be verified.");
    if (!task.claimedById) throw new StayError("The task has no claimant to credit.");
    if (task.claimedById === principal.id) {
      throw new StayError("You cannot verify your own work. Two people, always.");
    }

    const updated = await tx.apexTask.update({
      where: { id: taskId },
      data: { status: "VERIFIED", verifiedById: principal.id, verifiedAt: new Date() },
    });

    await tx.stayEntry.create({
      data: {
        userId: task.claimedById,
        kind: "EARN",
        nights: task.rewardNights,
        taskId: task.id,
        memo: `${task.title} — ${task.propertyLabel}`,
      },
    });

    await appendToChainTx(tx, {
      eventType: "APEX_TASK_VERIFIED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { taskId: task.id, workerId: task.claimedById, rewardNights: task.rewardNights } satisfies CanonicalValue,
    });
    await appendToChainTx(tx, {
      eventType: "STAY_EARNED",
      actorId: task.claimedById,
      actorLabel: `credited for task ${task.id}`,
      payload: { taskId: task.id, nights: task.rewardNights } satisfies CanonicalValue,
    });

    return updated;
  });
}

/** Cancel an unfinished task. Poster only; a verified task is history, not cancellable. */
export async function cancelTask(principal: Principal, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.apexTask.findUnique({ where: { id: taskId } });
    if (!task) throw new StayError("No such task.");
    if (task.status === "VERIFIED") throw new StayError("A verified task cannot be cancelled.");
    if (task.postedById !== principal.id) throw new StayError("Only the poster can cancel a task.");
    return tx.apexTask.update({ where: { id: taskId }, data: { status: "CANCELLED" } });
  });
}

// ---------------------------------------------------------------- gift & spend

/**
 * Gift Stays to another member. Legal because a Stay is a night of family
 * hospitality, not monetary value — it cannot be bought or cashed out, so
 * moving it is moving a favour, not money. Both entries are written in one
 * transaction; the balance check is inside the same transaction, so two
 * simultaneous gifts cannot overdraw.
 */
export async function giftStays(
  principal: Principal,
  toUserId: string,
  nights: number,
  memo?: string,
) {
  assertNights(nights);
  if (toUserId === principal.id) throw new StayError("You cannot gift Stays to yourself.");

  return prisma.$transaction(async (tx) => {
    const recipient = await tx.user.findUnique({ where: { id: toUserId } });
    if (!recipient || !recipient.active) throw new StayError("No such member.");

    const balance = await balanceInTx(tx, principal.id);
    if (balance < nights) {
      throw new StayError(
        `You hold ${formatStays(balance)} and tried to gift ${formatStays(nights)}.`,
      );
    }

    const cleanMemo = memo?.trim() || null;
    await tx.stayEntry.create({
      data: {
        userId: principal.id,
        kind: "GIFT_OUT",
        nights,
        counterpartyId: toUserId,
        memo: cleanMemo,
      },
    });
    await tx.stayEntry.create({
      data: {
        userId: toUserId,
        kind: "GIFT_IN",
        nights,
        counterpartyId: principal.id,
        memo: cleanMemo,
      },
    });

    await appendToChainTx(tx, {
      eventType: "STAY_GIFTED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { toUserId, nights } satisfies CanonicalValue,
    });
  });
}

/**
 * Spend Stays on nights at a family property. The balance re-check lives in
 * the same transaction as the write — the same race discipline the booking
 * engine uses for double-booking.
 */
export async function spendStays(
  principal: Principal,
  nights: number,
  memo: string,
  bookingId?: string,
) {
  assertNights(nights);
  const cleanMemo = memo?.trim();
  if (!cleanMemo) throw new StayError("Say what the Stays are being spent on.");

  return prisma.$transaction(async (tx) => {
    const balance = await balanceInTx(tx, principal.id);
    if (balance < nights) {
      throw new StayError(
        `You hold ${formatStays(balance)} and tried to spend ${formatStays(nights)}.`,
      );
    }

    await tx.stayEntry.create({
      data: {
        userId: principal.id,
        kind: "SPEND",
        nights,
        bookingId: bookingId || null,
        memo: cleanMemo,
      },
    });

    await appendToChainTx(tx, {
      eventType: "STAY_SPENT",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { nights, bookingId: bookingId ?? null } satisfies CanonicalValue,
    });
  });
}

export async function ledgerOf(userId: string, take = 50) {
  return prisma.stayEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function openTasks(take = 100) {
  return prisma.apexTask.findMany({
    where: { status: { in: ["OPEN", "CLAIMED", "DONE"] } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export { TASK_STATUSES, ENTRY_KINDS };
