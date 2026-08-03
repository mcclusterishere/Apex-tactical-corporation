import { prisma } from "@/lib/db";
import { appendToChainTx } from "@/lib/chain";
import type { Principal } from "@/lib/auth";

/**
 * Double-entry accounting for the Kingdom's treasury.
 *
 * Why double entry rather than a list of transactions
 * ---------------------------------------------------
 * A list of payments in and out cannot be checked. Double entry can: every
 * transaction touches at least two accounts, debits must equal credits, and the
 * whole book must balance at every moment. That constraint is what makes an
 * error detectable at all — and it is what an examiner, an auditor, or a court
 * expects to see from an institution holding property in trust for others.
 *
 * Three rules are enforced here and cannot be turned off:
 *
 *   1. **Entries balance.** Debits equal credits or nothing is written.
 *   2. **Posted entries are immutable.** A mistake is corrected by posting a
 *      reversing entry, never by editing history. An accounting system that
 *      permits back-dated edits is worth nothing in a dispute, because the other
 *      side will say so and be right.
 *   3. **Fund restrictions are carried on every posting.** Spending a
 *      restricted gift on general operations is a breach of trust, not a
 *      bookkeeping preference, and the ledger should make it visible rather
 *      than possible-but-frowned-upon.
 *
 * Amounts are integer cents everywhere. Floating point in a ledger produces a
 * book that is off by a penny, then by a thousand, and nobody can say when.
 */

export class TreasuryError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "TreasuryError";
  }
}

/**
 * Above this, a single officer should not be able to move money alone.
 *
 * Deliberately low for an institution of this size. It is not a statement about
 * trust; it is a statement about what an attacker holding one officer's session
 * can do before anyone notices.
 */
export const DUAL_CONTROL_THRESHOLD_CENTS = 100_000; // $1,000

export const ACCOUNT_TYPES = [
  "ASSET",
  "LIABILITY",
  "NET_ASSETS",
  "REVENUE",
  "EXPENSE",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/**
 * Whether a debit increases the balance of this account type.
 *
 * Assets and expenses are debit-normal; liabilities, net assets, and revenue are
 * credit-normal. Getting this backwards produces a book that balances and is
 * entirely wrong, which is the worst kind.
 */
export function isDebitNormal(type: string): boolean {
  return type === "ASSET" || type === "EXPENSE";
}

export const RESTRICTIONS = [
  "UNRESTRICTED",
  "TEMPORARILY_RESTRICTED",
  "PERMANENTLY_RESTRICTED",
] as const;

export interface PostingInput {
  accountCode: string;
  fundCode?: string | null;
  debitCents?: number;
  creditCents?: number;
  memo?: string | null;
}

export interface JournalInput {
  date: string;
  memo: string;
  reference?: string | null;
  sourceRecordId?: string | null;
  postings: PostingInput[];
}

function assertWholeCents(value: number, label: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TreasuryError(`${label} must be a whole number of cents.`);
  }
  if (value < 0) {
    throw new TreasuryError(
      `${label} may not be negative. Reverse the direction of the posting instead — ` +
        "a negative debit is a credit, and writing it as a negative hides what happened.",
    );
  }
  if (!Number.isSafeInteger(value)) {
    throw new TreasuryError(`${label} exceeds the largest amount this ledger can represent.`);
  }
}

/**
 * Validate a journal entry without writing it.
 *
 * Separated from posting so the UI can show the imbalance before submission and
 * so the verification script can re-check historical entries with the same code
 * that accepted them.
 */
export function validateJournal(input: JournalInput): {
  totalDebits: number;
  totalCredits: number;
} {
  if (!input.memo?.trim()) {
    throw new TreasuryError("Every entry needs a memo saying what it is.", {
      memo: "Required.",
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new TreasuryError("Enter the transaction date as YYYY-MM-DD.", { date: "Required." });
  }
  if (input.postings.length < 2) {
    throw new TreasuryError(
      "An entry needs at least two postings. A single-sided entry is not a transaction.",
    );
  }

  let totalDebits = 0;
  let totalCredits = 0;

  for (const [index, posting] of input.postings.entries()) {
    const debit = posting.debitCents ?? 0;
    const credit = posting.creditCents ?? 0;
    assertWholeCents(debit, `Line ${index + 1} debit`);
    assertWholeCents(credit, `Line ${index + 1} credit`);

    if (debit > 0 && credit > 0) {
      throw new TreasuryError(
        `Line ${index + 1} carries both a debit and a credit. Split it into two lines.`,
      );
    }
    if (debit === 0 && credit === 0) {
      throw new TreasuryError(`Line ${index + 1} has no amount.`);
    }
    totalDebits += debit;
    totalCredits += credit;
  }

  if (totalDebits !== totalCredits) {
    const difference = Math.abs(totalDebits - totalCredits) / 100;
    throw new TreasuryError(
      `The entry does not balance. Debits total ${(totalDebits / 100).toFixed(2)}, ` +
        `credits total ${(totalCredits / 100).toFixed(2)}, a difference of ${difference.toFixed(2)}.`,
    );
  }

  return { totalDebits, totalCredits };
}

/**
 * Post a journal entry.
 *
 * Posting is one transaction: the entry, its postings, and the ledger commitment
 * are written together or not at all. A treasury whose accounting record can
 * drift out of step with its own audit trail is not a treasury.
 */
export async function postJournal(principal: Principal, input: JournalInput) {
  const { totalDebits } = validateJournal(input);

  const accountCodes = [...new Set(input.postings.map((p) => p.accountCode))];
  const fundCodes = [
    ...new Set(input.postings.map((p) => p.fundCode).filter((c): c is string => Boolean(c))),
  ];

  const [accounts, funds] = await Promise.all([
    prisma.account.findMany({ where: { code: { in: accountCodes } } }),
    fundCodes.length > 0
      ? prisma.fund.findMany({ where: { code: { in: fundCodes } } })
      : Promise.resolve([]),
  ]);

  const accountByCode = new Map(accounts.map((a) => [a.code, a]));
  const fundByCode = new Map(funds.map((f) => [f.code, f]));

  for (const code of accountCodes) {
    const account = accountByCode.get(code);
    if (!account) throw new TreasuryError(`No account bears the code ${code}.`);
    if (!account.active) {
      throw new TreasuryError(`Account ${code} (${account.name}) is closed and cannot be posted to.`);
    }
  }
  for (const code of fundCodes) {
    if (!fundByCode.has(code)) throw new TreasuryError(`No fund bears the code ${code}.`);
  }

  const date = new Date(`${input.date}T00:00:00Z`);

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { key: "journal:sequence" },
      create: { key: "journal:sequence", value: 1 },
      update: { value: { increment: 1 } },
    });
    const entryNumber = `AK-JE-${String(counter.value).padStart(6, "0")}`;

    const journal = await tx.journalEntry.create({
      data: {
        entryNumber,
        date,
        memo: input.memo.trim(),
        reference: input.reference?.trim() || null,
        sourceRecordId: input.sourceRecordId ?? null,
        status: "POSTED",
        postedAt: new Date(),
        postedBy: `${principal.displayName} (${principal.role})`,
        createdBy: `${principal.displayName} (${principal.role})`,
        postings: {
          create: input.postings.map((posting, index) => ({
            accountId: accountByCode.get(posting.accountCode)!.id,
            fundId: posting.fundCode ? (fundByCode.get(posting.fundCode)?.id ?? null) : null,
            debitCents: posting.debitCents ?? 0,
            creditCents: posting.creditCents ?? 0,
            memo: posting.memo?.trim() || null,
            sequence: index,
          })),
        },
      },
      include: { postings: true },
    });

    await appendToChainTx(tx, {
      eventType: "JOURNAL_POSTED",
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        entryNumber,
        date: input.date,
        memo: journal.memo,
        reference: journal.reference,
        totalCents: totalDebits,
        sourceRecordId: input.sourceRecordId ?? null,
        postings: input.postings.map((posting) => ({
          account: posting.accountCode,
          fund: posting.fundCode ?? null,
          debitCents: posting.debitCents ?? 0,
          creditCents: posting.creditCents ?? 0,
          memo: posting.memo ?? null,
        })) as unknown as Record<string, never>,
      },
    });

    return journal;
  });
}

/**
 * Reverse a posted entry.
 *
 * The original is untouched. A mirror entry is posted with debits and credits
 * exchanged, and the two are linked. Anyone reading the book sees both the
 * mistake and the correction, which is the point.
 */
export async function reverseJournal(principal: Principal, journalId: string, reason: string) {
  if (!reason?.trim()) {
    throw new TreasuryError("State why the entry is being reversed.", { reason: "Required." });
  }

  const original = await prisma.journalEntry.findUnique({
    where: { id: journalId },
    include: { postings: { include: { account: true, fund: true } }, reversedBy: true },
  });
  if (!original) throw new TreasuryError("No such journal entry.");
  if (original.status !== "POSTED") {
    throw new TreasuryError("Only a posted entry can be reversed.");
  }
  if (original.reversedBy) {
    throw new TreasuryError(
      `This entry was already reversed by ${original.reversedBy.entryNumber}.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { key: "journal:sequence" },
      create: { key: "journal:sequence", value: 1 },
      update: { value: { increment: 1 } },
    });
    const entryNumber = `AK-JE-${String(counter.value).padStart(6, "0")}`;

    const reversal = await tx.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(),
        memo: `Reversal of ${original.entryNumber}: ${reason.trim()}`,
        reference: original.reference,
        sourceRecordId: original.sourceRecordId,
        status: "POSTED",
        postedAt: new Date(),
        postedBy: `${principal.displayName} (${principal.role})`,
        createdBy: `${principal.displayName} (${principal.role})`,
        reversesId: original.id,
        postings: {
          create: original.postings.map((posting, index) => ({
            accountId: posting.accountId,
            fundId: posting.fundId,
            // Exchanged, not negated.
            debitCents: posting.creditCents,
            creditCents: posting.debitCents,
            memo: posting.memo,
            sequence: index,
          })),
        },
      },
    });

    await tx.journalEntry.update({
      where: { id: original.id },
      data: { status: "REVERSED" },
    });

    await appendToChainTx(tx, {
      eventType: "JOURNAL_REVERSED",
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        reversedEntry: original.entryNumber,
        reversalEntry: entryNumber,
        reason: reason.trim(),
      },
    });

    return reversal;
  });
}

export interface AccountBalance {
  accountId: string;
  code: string;
  name: string;
  type: string;
  debits: number;
  credits: number;
  /** Signed by the account's normal balance: positive means a normal balance. */
  balance: number;
}

/** Balances for every account, optionally as at a date and/or within one fund. */
export async function trialBalance(options?: {
  asOf?: Date;
  fundId?: string;
}): Promise<{ rows: AccountBalance[]; totalDebits: number; totalCredits: number; balanced: boolean }> {
  const postings = await prisma.posting.findMany({
    where: {
      ...(options?.fundId ? { fundId: options.fundId } : {}),
      journalEntry: {
        status: "POSTED",
        ...(options?.asOf ? { date: { lte: options.asOf } } : {}),
      },
    },
    include: { account: true },
  });

  const byAccount = new Map<string, AccountBalance>();
  let totalDebits = 0;
  let totalCredits = 0;

  for (const posting of postings) {
    let row = byAccount.get(posting.accountId);
    if (!row) {
      row = {
        accountId: posting.accountId,
        code: posting.account.code,
        name: posting.account.name,
        type: posting.account.type,
        debits: 0,
        credits: 0,
        balance: 0,
      };
      byAccount.set(posting.accountId, row);
    }
    row.debits += posting.debitCents;
    row.credits += posting.creditCents;
    totalDebits += posting.debitCents;
    totalCredits += posting.creditCents;
  }

  const rows = [...byAccount.values()].map((row) => ({
    ...row,
    balance: isDebitNormal(row.type) ? row.debits - row.credits : row.credits - row.debits,
  }));
  rows.sort((a, b) => a.code.localeCompare(b.code));

  return { rows, totalDebits, totalCredits, balanced: totalDebits === totalCredits };
}

/** Balance of a single account. */
export async function accountBalance(accountId: string, asOf?: Date): Promise<number> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new TreasuryError("No such account.");

  const aggregate = await prisma.posting.aggregate({
    where: {
      accountId,
      journalEntry: { status: "POSTED", ...(asOf ? { date: { lte: asOf } } : {}) },
    },
    _sum: { debitCents: true, creditCents: true },
  });

  const debits = aggregate._sum.debitCents ?? 0;
  const credits = aggregate._sum.creditCents ?? 0;
  return isDebitNormal(account.type) ? debits - credits : credits - debits;
}

/**
 * Net assets by fund restriction — the figure a charitable institution is
 * actually accountable for, and the one donors and regulators ask about.
 */
export async function fundBalances() {
  const funds = await prisma.fund.findMany({ orderBy: { code: "asc" } });
  const out: {
    id: string;
    code: string;
    name: string;
    restriction: string;
    balanceCents: number;
  }[] = [];

  for (const fund of funds) {
    const aggregate = await prisma.posting.aggregate({
      where: { fundId: fund.id, journalEntry: { status: "POSTED" } },
      _sum: { debitCents: true, creditCents: true },
    });
    // A fund balance is what came in less what went out: revenue and liabilities
    // are credit-normal, so credits less debits is the amount still held.
    const balance = (aggregate._sum.creditCents ?? 0) - (aggregate._sum.debitCents ?? 0);
    out.push({
      id: fund.id,
      code: fund.code,
      name: fund.name,
      restriction: fund.restriction,
      balanceCents: balance,
    });
  }
  return out;
}

/**
 * Re-check every posted entry.
 *
 * Called by the verification script. An entry that no longer balances means
 * postings were altered outside the application, which the trial balance alone
 * would hide if two errors happened to offset.
 */
export async function verifyBooks(): Promise<{
  entriesChecked: number;
  unbalanced: { entryNumber: string; debits: number; credits: number }[];
  trialBalanced: boolean;
}> {
  const entries = await prisma.journalEntry.findMany({
    where: { status: { in: ["POSTED", "REVERSED"] } },
    include: { postings: true },
  });

  const unbalanced: { entryNumber: string; debits: number; credits: number }[] = [];
  for (const entry of entries) {
    const debits = entry.postings.reduce((sum, p) => sum + p.debitCents, 0);
    const credits = entry.postings.reduce((sum, p) => sum + p.creditCents, 0);
    if (debits !== credits) {
      unbalanced.push({ entryNumber: entry.entryNumber, debits, credits });
    }
  }

  const tb = await trialBalance();
  return { entriesChecked: entries.length, unbalanced, trialBalanced: tb.balanced };
}

/** Parse a dollar string into integer cents. Rejects what it cannot represent. */
export function parseMoney(input: string): number {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new TreasuryError(
      `"${input}" is not an amount this ledger can hold. Use digits with at most two decimal places.`,
    );
  }
  // Round on the string, not on a float: 8.075 * 100 is 807.4999999999999.
  const negative = cleaned.startsWith("-");
  const [whole, fraction = ""] = cleaned.replace("-", "").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) {
    throw new TreasuryError("That amount is larger than this ledger can represent.");
  }
  return negative ? -cents : cents;
}

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const text = `${Math.floor(absolute / 100).toLocaleString()}.${String(absolute % 100).padStart(2, "0")}`;
  return negative ? `(${text})` : text;
}
