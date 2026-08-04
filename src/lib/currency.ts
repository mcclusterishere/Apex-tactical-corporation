import { prisma } from "@/lib/db";
import type { Principal } from "@/lib/auth";
import { appendToChainTx } from "@/lib/chain";
import { postJournalTx, isDebitNormal } from "@/lib/treasury";

/**
 * The Apex Mark — the Kingdom's own unit of account.
 *
 * This is "our own currency" in the only sense that is lawful, and the design is
 * shaped entirely by the three lines it must not cross. Read docs/16 before
 * changing anything here.
 *
 *   1. It is not coin or note. Nothing in this module mints a physical object
 *      intended to circulate as current money. Minting metal or paper money —
 *      even of original design — is a federal crime under 18 U.S.C. § 486; that
 *      is the statute the Liberty Dollar was prosecuted under. The Mark exists
 *      only as an entry in this ledger.
 *
 *   2. It is a closed loop. Value moves only between the Kingdom and a member:
 *      the Kingdom ISSUES Marks to a member against dollars, the member SPENDS
 *      them on the Kingdom's own goods and services, and the member REDEEMS the
 *      rest back to dollars. There is deliberately NO member-to-member transfer.
 *      Moving value between third parties for a fee is money transmission under
 *      18 U.S.C. § 1960 and the state analogue at Conn. Gen. Stat. § 36a-595 et
 *      seq., a felony that needs no victim, and the surest way to keep clear of
 *      it is to make it unrepresentable — so there is no function here to do it.
 *
 *   3. It is fully reserved and redeemable, never an investment. Every Mark
 *      outstanding is backed one-for-one by a United States dollar held in a
 *      reserve the Kingdom does not spend, and is redeemable at par on demand.
 *      There is no interest, no yield, and no expectation of profit, so it is
 *      not a security under Howey. The peg is a policy the Kingdom sets, fixed
 *      here at parity for safety: a non-par peg introduces rounding on
 *      redemption that can leave a Mark unbacked, and an unbacked Mark is the
 *      one thing this system may not produce.
 *
 * Every issuance, spend and redemption is double-entered in the Treasury and
 * committed to the hash chain in the same transaction, so the money supply is as
 * tamper-evident as the register, and the wallets and the books can never be
 * reconciled to two different answers.
 */

export const MARK = {
  name: "Apex Mark",
  plural: "Apex Marks",
  code: "AXM",
  symbol: "₳",
  /** Cents of USD backing one Mark. Fixed at par; see the note above. */
  pegUsdCents: 100,
  /** Minor units in one Mark, mirroring cents. */
  minorPerUnit: 100,
} as const;

/** Ledger accounts and the reserve fund the Mark runs on. Ensured idempotently. */
const RESERVE_FUND = { code: "AXM-RES", name: "Apex Mark Reserve" };
const ACCT = {
  operatingCash: { code: "1000", name: "Operating cash", type: "ASSET" },
  reserveCash: { code: "1090", name: "Apex Mark reserve (dollars held to back Marks)", type: "ASSET" },
  outstanding: { code: "2400", name: "Apex Marks in circulation (member credit outstanding)", type: "LIABILITY" },
  redemptionRevenue: { code: "4600", name: "Marks redeemed for goods and services", type: "REVENUE" },
} as const;

export class CurrencyError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "CurrencyError";
  }
}

type Tx = Parameters<typeof appendToChainTx>[0];

/** Marks-and-pence string ("125.50") to minor units. Reuses no float. */
export function parseMarks(input: string): number {
  const cleaned = input.replace(/[₳$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new CurrencyError(`"${input}" is not an amount in Marks. Use digits with at most two decimal places.`);
  }
  const [whole, fraction = ""] = cleaned.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) {
    throw new CurrencyError("That amount is larger than this ledger can represent.");
  }
  return minor;
}

export function formatMarks(minor: number): string {
  const negative = minor < 0;
  const absolute = Math.abs(minor);
  const text = `${Math.floor(absolute / 100).toLocaleString()}.${String(absolute % 100).padStart(2, "0")}`;
  return negative ? `(${text})` : text;
}

/** USD value of an amount of Marks, in cents, at the fixed par peg. */
export function usdCentsFor(minor: number): number {
  // Par peg keeps this exact: one Mark-penny is one US cent.
  return Math.round((minor * MARK.pegUsdCents) / MARK.minorPerUnit);
}

function assertAmount(minor: number, label = "amount"): void {
  if (!Number.isInteger(minor) || minor <= 0) {
    throw new CurrencyError(`The ${label} must be a positive amount of Marks.`, { amount: "Enter an amount." });
  }
  if (!Number.isSafeInteger(minor)) {
    throw new CurrencyError(`That ${label} is larger than this ledger can represent.`);
  }
}

/**
 * Create the reserve fund and the four ledger accounts the Mark posts to, if
 * they are not already present. Idempotent, so it is safe to call before any
 * operation rather than relying on a separate setup step.
 */
async function ensureLedger(tx: Tx): Promise<void> {
  await tx.fund.upsert({
    where: { code: RESERVE_FUND.code },
    create: {
      code: RESERVE_FUND.code,
      name: RESERVE_FUND.name,
      restriction: "TEMPORARILY_RESTRICTED",
      purpose:
        "Dollars held to back Apex Marks in circulation. Restricted: every dollar here answers a Mark a " +
        "member may redeem at any time, and it may not be spent while the Mark it backs is outstanding.",
    },
    update: {},
  });
  const reserve = await tx.fund.findUnique({ where: { code: RESERVE_FUND.code } });
  for (const spec of Object.values(ACCT)) {
    await tx.account.upsert({
      where: { code: spec.code },
      create: {
        code: spec.code,
        name: spec.name,
        type: spec.type,
        fundId: spec.code === ACCT.reserveCash.code ? (reserve?.id ?? null) : null,
      },
      update: {},
    });
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function allocateWalletNumber(tx: Tx): Promise<string> {
  const counter = await tx.counter.upsert({
    where: { key: "currency:wallet" },
    create: { key: "currency:wallet", value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${MARK.code}-${String(counter.value).padStart(6, "0")}`;
}

async function nextSeq(tx: Tx, accountId: string): Promise<number> {
  const last = await tx.currencyEntry.findFirst({
    where: { accountId },
    orderBy: { seq: "desc" },
    select: { seq: true },
  });
  return (last?.seq ?? 0) + 1;
}

function actorLabel(principal: Principal): string {
  return `${principal.displayName} (${principal.role})`;
}

// --- Open a wallet ----------------------------------------------------------

export async function openWallet(
  principal: Principal,
  input: { holderName: string; holderRecordId?: string | null },
) {
  const holderName = input.holderName.trim();
  if (!holderName) {
    throw new CurrencyError("Name the holder.", { holderName: "Required." });
  }

  return prisma.$transaction(async (tx) => {
    await ensureLedger(tx);
    const number = await allocateWalletNumber(tx);
    const wallet = await tx.currencyAccount.create({
      data: {
        number,
        holderName,
        holderRecordId: input.holderRecordId || null,
        openedBy: actorLabel(principal),
      },
    });
    await appendToChainTx(tx, {
      eventType: "CURRENCY_ACCOUNT_OPENED",
      actorId: principal.id,
      actorLabel: actorLabel(principal),
      payload: { wallet: number, holder: holderName, holderRecordId: input.holderRecordId || null },
    });
    return wallet;
  });
}

// --- The three movements ----------------------------------------------------

interface MoveInput {
  walletId: string;
  amountMinor: number;
  memo?: string | null;
  reference?: string | null;
}

async function loadActiveWallet(tx: Tx, walletId: string) {
  const wallet = await tx.currencyAccount.findUnique({ where: { id: walletId } });
  if (!wallet) throw new CurrencyError("No such wallet.");
  if (wallet.status !== "ACTIVE") {
    throw new CurrencyError(
      `Wallet ${wallet.number} is ${wallet.status.toLowerCase()}. Nothing can move until it is active again.`,
    );
  }
  return wallet;
}

async function writeEntry(
  tx: Tx,
  wallet: { id: string; balanceMinor: number },
  fields: {
    type: string;
    deltaMinor: number;
    usdCents: number;
    memo?: string | null;
    reference?: string | null;
    journalEntryId: string | null;
    createdBy: string;
  },
): Promise<number> {
  const balanceAfter = wallet.balanceMinor + fields.deltaMinor;
  if (balanceAfter < 0) {
    // Defence in depth: the callers check the balance, but a wallet must never
    // be able to go negative — a negative balance is an unbacked Mark by another
    // name.
    throw new CurrencyError("That would overdraw the wallet.");
  }
  const seq = await nextSeq(tx, wallet.id);
  await tx.currencyEntry.create({
    data: {
      accountId: wallet.id,
      seq,
      type: fields.type,
      deltaMinor: fields.deltaMinor,
      balanceAfterMinor: balanceAfter,
      usdCents: fields.usdCents,
      memo: fields.memo?.trim() || null,
      reference: fields.reference?.trim() || null,
      journalEntryId: fields.journalEntryId,
      createdBy: fields.createdBy,
    },
  });
  await tx.currencyAccount.update({
    where: { id: wallet.id },
    data: { balanceMinor: balanceAfter },
  });
  return balanceAfter;
}

/**
 * Issue Marks to a member against dollars received.
 *
 * The dollars enter the reserve and an equal liability is recognised, so the
 * Marks are backed the instant they exist:
 *   Dr reserve cash / Cr Marks in circulation.
 */
export async function issue(principal: Principal, input: MoveInput) {
  assertAmount(input.amountMinor);
  const usd = usdCentsFor(input.amountMinor);

  return prisma.$transaction(async (tx) => {
    await ensureLedger(tx);
    const wallet = await loadActiveWallet(tx, input.walletId);

    const journal = await postJournalTx(tx as Parameters<typeof postJournalTx>[0], principal, {
      date: today(),
      memo: `Issue ${formatMarks(input.amountMinor)} ${MARK.plural} to ${wallet.number}${input.memo ? ` — ${input.memo.trim()}` : ""}`,
      reference: input.reference ?? null,
      postings: [
        { accountCode: ACCT.reserveCash.code, fundCode: RESERVE_FUND.code, debitCents: usd },
        { accountCode: ACCT.outstanding.code, creditCents: usd },
      ],
    });

    const balanceAfter = await writeEntry(tx, wallet, {
      type: "ISSUE",
      deltaMinor: input.amountMinor,
      usdCents: usd,
      memo: input.memo,
      reference: input.reference,
      journalEntryId: journal.id,
      createdBy: actorLabel(principal),
    });

    await appendToChainTx(tx, {
      eventType: "CURRENCY_ISSUED",
      actorId: principal.id,
      actorLabel: actorLabel(principal),
      payload: {
        wallet: wallet.number,
        amountMinor: input.amountMinor,
        usdCents: usd,
        journal: journal.entryNumber,
        balanceAfterMinor: balanceAfter,
      },
    });

    return { wallet: wallet.number, balanceAfter, journal: journal.entryNumber };
  });
}

/**
 * A member spends Marks on the Kingdom's own goods or services.
 *
 * The credit is consumed: the liability is discharged into revenue, and the
 * dollar that backed it is released from the reserve into operating cash, so the
 * reserve continues to hold exactly one dollar per Mark still outstanding.
 *   Dr Marks in circulation / Cr redemption revenue
 *   Dr operating cash       / Cr reserve cash
 */
export async function spend(principal: Principal, input: MoveInput) {
  assertAmount(input.amountMinor);
  const usd = usdCentsFor(input.amountMinor);

  return prisma.$transaction(async (tx) => {
    await ensureLedger(tx);
    const wallet = await loadActiveWallet(tx, input.walletId);
    if (input.amountMinor > wallet.balanceMinor) {
      throw new CurrencyError(
        `The wallet holds ${formatMarks(wallet.balanceMinor)} ${MARK.plural}; it cannot spend ${formatMarks(input.amountMinor)}.`,
        { amount: "More than the balance." },
      );
    }

    const journal = await postJournalTx(tx as Parameters<typeof postJournalTx>[0], principal, {
      date: today(),
      memo: `Spend ${formatMarks(input.amountMinor)} ${MARK.plural} from ${wallet.number}${input.memo ? ` — ${input.memo.trim()}` : ""}`,
      reference: input.reference ?? null,
      postings: [
        { accountCode: ACCT.outstanding.code, debitCents: usd },
        { accountCode: ACCT.redemptionRevenue.code, creditCents: usd },
        { accountCode: ACCT.operatingCash.code, debitCents: usd },
        { accountCode: ACCT.reserveCash.code, fundCode: RESERVE_FUND.code, creditCents: usd },
      ],
    });

    const balanceAfter = await writeEntry(tx, wallet, {
      type: "SPEND",
      deltaMinor: -input.amountMinor,
      usdCents: 0,
      memo: input.memo,
      reference: input.reference,
      journalEntryId: journal.id,
      createdBy: actorLabel(principal),
    });

    await appendToChainTx(tx, {
      eventType: "CURRENCY_SPENT",
      actorId: principal.id,
      actorLabel: actorLabel(principal),
      payload: {
        wallet: wallet.number,
        amountMinor: input.amountMinor,
        journal: journal.entryNumber,
        balanceAfterMinor: balanceAfter,
      },
    });

    return { wallet: wallet.number, balanceAfter, journal: journal.entryNumber };
  });
}

/**
 * A member redeems Marks back to dollars.
 *
 * The liability is discharged and the dollars leave the reserve:
 *   Dr Marks in circulation / Cr reserve cash.
 * This is the promise that makes the Mark trustworthy — par, on demand — so it
 * is refused only for an inactive wallet or an amount above the balance, never
 * for the Kingdom's convenience.
 */
export async function redeem(principal: Principal, input: MoveInput) {
  assertAmount(input.amountMinor);
  const usd = usdCentsFor(input.amountMinor);

  return prisma.$transaction(async (tx) => {
    await ensureLedger(tx);
    const wallet = await loadActiveWallet(tx, input.walletId);
    if (input.amountMinor > wallet.balanceMinor) {
      throw new CurrencyError(
        `The wallet holds ${formatMarks(wallet.balanceMinor)} ${MARK.plural}; it cannot redeem ${formatMarks(input.amountMinor)}.`,
        { amount: "More than the balance." },
      );
    }

    const journal = await postJournalTx(tx as Parameters<typeof postJournalTx>[0], principal, {
      date: today(),
      memo: `Redeem ${formatMarks(input.amountMinor)} ${MARK.plural} from ${wallet.number} for USD${input.memo ? ` — ${input.memo.trim()}` : ""}`,
      reference: input.reference ?? null,
      postings: [
        { accountCode: ACCT.outstanding.code, debitCents: usd },
        { accountCode: ACCT.reserveCash.code, fundCode: RESERVE_FUND.code, creditCents: usd },
      ],
    });

    const balanceAfter = await writeEntry(tx, wallet, {
      type: "REDEEM",
      deltaMinor: -input.amountMinor,
      usdCents: usd,
      memo: input.memo,
      reference: input.reference,
      journalEntryId: journal.id,
      createdBy: actorLabel(principal),
    });

    await appendToChainTx(tx, {
      eventType: "CURRENCY_REDEEMED",
      actorId: principal.id,
      actorLabel: actorLabel(principal),
      payload: {
        wallet: wallet.number,
        amountMinor: input.amountMinor,
        usdCents: usd,
        journal: journal.entryNumber,
        balanceAfterMinor: balanceAfter,
      },
    });

    return { wallet: wallet.number, balanceAfter, journal: journal.entryNumber };
  });
}

export async function setFrozen(principal: Principal, walletId: string, frozen: boolean, reason: string) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.currencyAccount.findUnique({ where: { id: walletId } });
    if (!wallet) throw new CurrencyError("No such wallet.");
    if (wallet.status === "CLOSED") throw new CurrencyError("A closed wallet cannot be changed.");
    const status = frozen ? "FROZEN" : "ACTIVE";
    await tx.currencyAccount.update({ where: { id: walletId }, data: { status } });
    await appendToChainTx(tx, {
      eventType: "CURRENCY_FROZEN",
      actorId: principal.id,
      actorLabel: actorLabel(principal),
      payload: { wallet: wallet.number, status, reason: reason.trim() || null },
    });
    return { wallet: wallet.number, status };
  });
}

// --- Reading and proving ----------------------------------------------------

async function accountBalanceCentsByCode(code: string): Promise<number> {
  const account = await prisma.account.findUnique({ where: { code }, select: { id: true, type: true } });
  if (!account) return 0;
  const sums = await prisma.posting.aggregate({
    where: { accountId: account.id },
    _sum: { debitCents: true, creditCents: true },
  });
  const debits = sums._sum.debitCents ?? 0;
  const credits = sums._sum.creditCents ?? 0;
  return isDebitNormal(account.type) ? debits - credits : credits - debits;
}

export interface CurrencyState {
  outstandingMinor: number;
  reserveCents: number;
  liabilityCents: number;
  walletCount: number;
  activeWalletCount: number;
  /** True when every Mark outstanding is backed by a dollar in the reserve. */
  fullyReserved: boolean;
  /** Reserve dollars beyond what is owed, if any (from rounding or manual posts). */
  surplusCents: number;
}

/** The state of the money supply, for the mint overview. */
export async function currencyState(): Promise<CurrencyState> {
  const [agg, counts, reserveCents, liabilityCents] = await Promise.all([
    prisma.currencyAccount.aggregate({ _sum: { balanceMinor: true } }),
    prisma.currencyAccount.groupBy({ by: ["status"], _count: true }),
    accountBalanceCentsByCode(ACCT.reserveCash.code),
    accountBalanceCentsByCode(ACCT.outstanding.code),
  ]);
  const outstandingMinor = agg._sum.balanceMinor ?? 0;
  const outstandingCents = usdCentsFor(outstandingMinor);
  const walletCount = counts.reduce((n, c) => n + c._count, 0);
  const activeWalletCount = counts.find((c) => c.status === "ACTIVE")?._count ?? 0;
  return {
    outstandingMinor,
    reserveCents,
    liabilityCents,
    walletCount,
    activeWalletCount,
    fullyReserved: reserveCents >= outstandingCents,
    surplusCents: reserveCents - outstandingCents,
  };
}

export interface CurrencyProblem {
  kind: string;
  detail: string;
}

/**
 * Verify the money supply from first principles.
 *
 * Three equalities must hold, and they are checked against three independent
 * sources — the wallets, the double-entry books, and each wallet's own entry
 * history — so no single altered row can pass:
 *
 *   sum(wallet balances) == liability account == reserve cash
 *   and each wallet's cached balance == the running sum of its entries.
 *
 * A failure here means either the ledger was edited outside the application or a
 * bug let a Mark exist unbacked; both are reported rather than repaired.
 */
export async function verifyCurrency(): Promise<CurrencyProblem[]> {
  const problems: CurrencyProblem[] = [];
  const state = await currencyState();
  const outstandingCents = usdCentsFor(state.outstandingMinor);

  if (state.liabilityCents !== outstandingCents) {
    problems.push({
      kind: "LIABILITY_MISMATCH",
      detail:
        `The wallets hold ${formatMarks(state.outstandingMinor)} Marks (${(outstandingCents / 100).toFixed(2)} USD), ` +
        `but the books record a liability of ${(state.liabilityCents / 100).toFixed(2)} USD. The wallets and the books disagree.`,
    });
  }
  if (state.reserveCents < outstandingCents) {
    problems.push({
      kind: "UNDER_RESERVED",
      detail:
        `The reserve holds ${(state.reserveCents / 100).toFixed(2)} USD against ${(outstandingCents / 100).toFixed(2)} USD of Marks outstanding. ` +
        "Some Marks are not backed. No further issuance until the reserve is restored.",
    });
  }

  // Each wallet's cached balance must equal the running sum of its own entries,
  // and the last entry's balanceAfter must equal the cached balance.
  const wallets = await prisma.currencyAccount.findMany({ select: { id: true, number: true, balanceMinor: true } });
  for (const wallet of wallets) {
    const entries = await prisma.currencyEntry.findMany({
      where: { accountId: wallet.id },
      orderBy: { seq: "asc" },
      select: { seq: true, deltaMinor: true, balanceAfterMinor: true },
    });
    let running = 0;
    let expectedSeq = 1;
    for (const entry of entries) {
      if (entry.seq !== expectedSeq) {
        problems.push({ kind: "SEQUENCE_GAP", detail: `Wallet ${wallet.number} entry sequence jumps to ${entry.seq}.` });
      }
      expectedSeq = entry.seq + 1;
      running += entry.deltaMinor;
      if (entry.balanceAfterMinor !== running) {
        problems.push({
          kind: "RUNNING_BALANCE_MISMATCH",
          detail: `Wallet ${wallet.number} entry #${entry.seq} records a balance of ${formatMarks(entry.balanceAfterMinor)} where the running total is ${formatMarks(running)}.`,
        });
      }
    }
    if (running !== wallet.balanceMinor) {
      problems.push({
        kind: "CACHED_BALANCE_MISMATCH",
        detail: `Wallet ${wallet.number} caches a balance of ${formatMarks(wallet.balanceMinor)} but its entries sum to ${formatMarks(running)}.`,
      });
    }
  }

  return problems;
}
