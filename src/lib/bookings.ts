/**
 * The zome booking engine.
 *
 * A booking system has exactly one thing it cannot get wrong: it must never let
 * two guests hold the same bed on the same night. Everything else here is
 * convenience; this is the load-bearing wall, and it is built twice over — once
 * in the overlap arithmetic below, and once in the fact that a CONFIRMED booking
 * is written in the same database transaction that re-checks availability, so
 * two requests racing for the last free night cannot both win.
 *
 * The date convention, stated once and depended on everywhere:
 *
 *   A stay is the half-open interval [checkIn, checkOut).
 *   The guest occupies every night from checkIn up to but NOT including checkOut.
 *   So one guest's checkOut day is the next guest's checkIn day, and that is not
 *   a conflict — it is a turnover. Two intervals overlap if and only if
 *   a.checkIn < b.checkOut AND b.checkIn < a.checkOut.
 *
 * Money is whole US cents, integers only, the same discipline the Treasury
 * keeps, so a booking total and its journal entry can never round apart.
 */
import { prisma } from "./db";
import { appendToChainTx } from "./chain";
import { spendStaysTx } from "./stays";
import type { CanonicalValue } from "./canonical";
import type { Principal } from "./auth";

export class BookingError extends Error {}

/** A calendar date at UTC midnight. Booking maths must never touch local time. */
export function parseNight(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BookingError(`"${value}" is not a date. Use YYYY-MM-DD.`);
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new BookingError(`"${value}" is not a real date.`);
  return d;
}

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

/** Whole nights between two UTC-midnight dates. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime();
  if (diff <= 0) {
    throw new BookingError("Check-out must be after check-in — a stay is at least one night.");
  }
  if (diff % MS_PER_NIGHT !== 0) {
    // Both ends are constructed at UTC midnight, so this only fires on a bug.
    throw new BookingError("Booking dates must fall on whole nights.");
  }
  return diff / MS_PER_NIGHT;
}

/**
 * The overlap test, isolated so it can be tested exhaustively on its own.
 *
 * True when the two half-open intervals share at least one night. Adjacency —
 * one stay's checkout equal to the other's check-in — is deliberately NOT an
 * overlap.
 */
export function intervalsOverlap(
  aIn: Date,
  aOut: Date,
  bIn: Date,
  bOut: Date,
): boolean {
  return aIn.getTime() < bOut.getTime() && bIn.getTime() < aOut.getTime();
}

/** What blocks a night: a live booking, or a manual hold. */
const BLOCKING_STATUSES = ["CONFIRMED", "COMPLETED"] as const;

/**
 * Find everything that would collide with a proposed stay on one zome.
 *
 * Runs inside a caller-supplied transaction when given one, so the check and the
 * subsequent write are atomic. The database query is the coarse filter (index
 * on zomeId + dates); `intervalsOverlap` is the exact adjudicator, because SQL
 * BETWEEN semantics are a classic source of off-by-one turnover bugs and this
 * code will not trust them.
 */
async function findConflicts(
  db: Pick<typeof prisma, "booking" | "zomeBlock">,
  zomeId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string,
): Promise<{ bookings: { id: string }[]; blocks: { id: string }[] }> {
  const candidateBookings = await db.booking.findMany({
    where: {
      zomeId,
      status: { in: [...BLOCKING_STATUSES] },
      // Coarse overlap at the DB level; refined below.
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true, checkIn: true, checkOut: true },
  });
  const candidateBlocks = await db.zomeBlock.findMany({
    where: { zomeId, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
    select: { id: true, checkIn: true, checkOut: true },
  });

  return {
    bookings: candidateBookings.filter((b) =>
      intervalsOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
    ),
    blocks: candidateBlocks.filter((b) =>
      intervalsOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
    ),
  };
}

/** Public availability check — is this zome free for this stay? */
export async function isAvailable(
  zomeId: string,
  checkInStr: string,
  checkOutStr: string,
  excludeBookingId?: string,
): Promise<boolean> {
  const checkIn = parseNight(checkInStr);
  const checkOut = parseNight(checkOutStr);
  nightsBetween(checkIn, checkOut); // validates ordering
  const { bookings, blocks } = await findConflicts(
    prisma,
    zomeId,
    checkIn,
    checkOut,
    excludeBookingId,
  );
  return bookings.length === 0 && blocks.length === 0;
}

export interface QuoteInput {
  nightlyCents: number;
  cleaningCents: number;
  nights: number;
}

/** The money for a stay. Pure arithmetic, integer cents, easy to test. */
export function quote({ nightlyCents, cleaningCents, nights }: QuoteInput): {
  nightlyCents: number;
  cleaningCents: number;
  nights: number;
  totalCents: number;
} {
  for (const [label, v] of [
    ["nightly rate", nightlyCents],
    ["cleaning fee", cleaningCents],
  ] as const) {
    if (!Number.isInteger(v) || v < 0 || !Number.isSafeInteger(v)) {
      throw new BookingError(`The ${label} must be a whole, non-negative number of cents.`);
    }
  }
  if (!Number.isInteger(nights) || nights < 1) {
    throw new BookingError("A stay is at least one night.");
  }
  const totalCents = nightlyCents * nights + cleaningCents;
  // Guard the product, not just the inputs: a safe rate times a long stay can
  // still overflow into an imprecise integer, and a booking total that money
  // cannot represent exactly must never be written.
  if (!Number.isSafeInteger(totalCents)) {
    throw new BookingError("That stay is too long or too costly for the ledger to represent exactly.");
  }
  return { nightlyCents, cleaningCents, nights, totalCents };
}

export interface CreateBookingInput {
  zomeId: string;
  guestName: string;
  guestContact?: string | null;
  channel?: string;
  checkIn: string;
  checkOut: string;
  /** Override the zome's rate for this booking (e.g. a negotiated price). */
  nightlyCentsOverride?: number | null;
  cleaningCentsOverride?: number | null;
  note?: string | null;
}

/**
 * FAMILY is the anti-squat channel: a family member stays by SPENDING Stays,
 * one per two nights, earned by working on the family's properties. The spend
 * and the booking commit in one transaction — no balance, no booking. Family
 * never pays money for family property; family pays contribution.
 */
const CHANNELS = ["DIRECT", "AIRBNB", "FAMILY", "OTHER"] as const;

/**
 * Confirm a booking.
 *
 * The availability re-check and the write happen in ONE transaction. This is the
 * whole defence against a race: if two people try to book the last free week at
 * the same moment, they serialise through the transaction, the second one's
 * re-check sees the first one's row, and it is refused. Optimistic UI checks
 * before this are a courtesy; this is the guarantee.
 */
export async function createBooking(principal: Principal, input: CreateBookingInput) {
  const guestName = input.guestName?.trim();
  if (!guestName) throw new BookingError("A booking needs a guest name.");

  const channel = CHANNELS.includes(input.channel as (typeof CHANNELS)[number])
    ? (input.channel as string)
    : "DIRECT";

  const checkIn = parseNight(input.checkIn);
  const checkOut = parseNight(input.checkOut);
  const nights = nightsBetween(checkIn, checkOut);

  return prisma.$transaction(async (tx) => {
    const zome = await tx.zome.findUnique({ where: { id: input.zomeId } });
    if (!zome) throw new BookingError("No such zome.");
    if (zome.status === "RETIRED") {
      throw new BookingError("That zome is retired and cannot be booked.");
    }

    // The re-check, inside the transaction. This is the guarantee.
    const { bookings, blocks } = await findConflicts(tx, input.zomeId, checkIn, checkOut);
    if (bookings.length > 0) {
      throw new BookingError(
        "Those nights are already booked. The calendar changed — reload and pick another date.",
      );
    }
    if (blocks.length > 0) {
      throw new BookingError("Those nights are blocked off (maintenance or owner use).");
    }

    // A family stay costs Stays, not money: the money side of the quote is
    // zero, and the Stays are spent below in this same transaction.
    const family = channel === "FAMILY";
    const priced = quote({
      nightlyCents: family ? 0 : (input.nightlyCentsOverride ?? zome.nightlyCents),
      cleaningCents: family ? 0 : (input.cleaningCentsOverride ?? zome.cleaningCents),
      nights,
    });

    const booking = await tx.booking.create({
      data: {
        zomeId: input.zomeId,
        guestName,
        guestContact: input.guestContact?.trim() || null,
        channel,
        checkIn,
        checkOut,
        nights,
        nightlyCents: priced.nightlyCents,
        cleaningCents: priced.cleaningCents,
        totalCents: priced.totalCents,
        status: "CONFIRMED",
        note: input.note?.trim() || null,
      },
    });

    // The anti-squat rule, enforced where it cannot be argued with: the
    // family booking pays its nights in Stays inside this transaction, or the
    // whole transaction — booking included — never happens.
    if (family) {
      await spendStaysTx(
        tx,
        principal,
        nights,
        `Family stay at ${zome.name}, ${input.checkIn} to ${input.checkOut}`,
        booking.id,
      );
    }

    await appendToChainTx(tx, {
      eventType: "BOOKING_CONFIRMED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        bookingId: booking.id,
        zomeId: input.zomeId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        nights,
        totalCents: priced.totalCents,
        channel,
      } satisfies CanonicalValue,
    });

    return booking;
  });
}

/** Cancel a booking, releasing its nights. */
export async function cancelBooking(principal: Principal, bookingId: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new BookingError("No such booking.");
    if (booking.status === "CANCELLED") return booking;
    if (booking.status === "COMPLETED") {
      throw new BookingError("A completed stay cannot be cancelled.");
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", note: reason?.trim() || booking.note },
    });

    await appendToChainTx(tx, {
      eventType: "BOOKING_CANCELLED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { bookingId, zomeId: booking.zomeId, reason: reason?.trim() ?? null } satisfies CanonicalValue,
    });

    return updated;
  });
}

/**
 * A month-grid view of one zome's calendar, for rendering.
 *
 * Returns, for each night in the window, whether it is free, booked, or blocked.
 * Read-only and cheap; the source of truth remains the rows themselves.
 */
export async function calendar(zomeId: string, fromStr: string, nights: number) {
  const from = parseNight(fromStr);
  const to = new Date(from.getTime() + nights * MS_PER_NIGHT);

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        zomeId,
        status: { in: [...BLOCKING_STATUSES] },
        checkIn: { lt: to },
        checkOut: { gt: from },
      },
      select: { id: true, guestName: true, checkIn: true, checkOut: true },
    }),
    prisma.zomeBlock.findMany({
      where: { zomeId, checkIn: { lt: to }, checkOut: { gt: from } },
      select: { id: true, reason: true, checkIn: true, checkOut: true },
    }),
  ]);

  const days: { date: string; state: "FREE" | "BOOKED" | "BLOCKED"; label?: string }[] = [];
  for (let i = 0; i < nights; i++) {
    const night = new Date(from.getTime() + i * MS_PER_NIGHT);
    const nightOut = new Date(night.getTime() + MS_PER_NIGHT);
    const booking = bookings.find((b) => intervalsOverlap(night, nightOut, b.checkIn, b.checkOut));
    const block = blocks.find((b) => intervalsOverlap(night, nightOut, b.checkIn, b.checkOut));
    days.push({
      date: night.toISOString().slice(0, 10),
      state: booking ? "BOOKED" : block ? "BLOCKED" : "FREE",
      label: booking?.guestName ?? block?.reason ?? undefined,
    });
  }
  return days;
}
