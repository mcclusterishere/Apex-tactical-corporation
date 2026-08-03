"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertMfa, assertStepUp } from "@/lib/auth";
import { can } from "@/lib/authz";
import {
  postJournal,
  reverseJournal,
  parseMoney,
  TreasuryError,
  ACCOUNT_TYPES,
  RESTRICTIONS,
  type PostingInput,
} from "@/lib/treasury";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

/**
 * Treasury actions.
 *
 * Every one of these is gated harder than a register entry, because the failure
 * mode is different: a wrong register entry is amended, a wrong disbursement is
 * gone. Posting requires the second factor; anything above the dual-control
 * threshold additionally requires step-up re-authentication.
 */

/**
 * Above this, a single officer should not be able to move money alone.
 *
 * The figure is deliberately low for an institution of this size. It is not a
 * statement about trust; it is a statement about what an attacker who obtains
 * one officer's session can do before anyone notices.
 */
export const DUAL_CONTROL_THRESHOLD_CENTS = 100_000; // $1,000

function fail(error: unknown): FormState {
  if (error instanceof TreasuryError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  console.error("[treasury] unexpected failure", error);
  return { ok: false, message: "The entry could not be posted. The fault has been logged." };
}

function guard(principal: Awaited<ReturnType<typeof getPrincipal>>): FormState | null {
  if (!can(principal.role, "registry:financial") && principal.role !== "SOVEREIGN") {
    return {
      ok: false,
      message: `The office of ${principal.role} does not keep the treasury.`,
    };
  }
  try {
    assertMfa(principal);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }
  return null;
}

export async function createFundAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const restriction = String(formData.get("restriction") ?? "UNRESTRICTED");
  const purpose = String(formData.get("purpose") ?? "").trim();

  if (!/^[A-Z0-9-]{2,12}$/.test(code)) {
    return { ok: false, message: "Fund codes are 2–12 characters, letters, digits, and hyphens." };
  }
  if (!name) return { ok: false, message: "Name the fund.", fieldErrors: { name: "Required." } };
  if (!(RESTRICTIONS as readonly string[]).includes(restriction)) {
    return { ok: false, message: "Unrecognised restriction." };
  }
  if (restriction !== "UNRESTRICTED" && !purpose) {
    return {
      ok: false,
      message:
        "A restricted fund must record the restriction's terms. The restriction binds the Kingdom, " +
        "and an unrecorded one cannot be honoured.",
      fieldErrors: { purpose: "Required for a restricted fund." },
    };
  }

  if (await prisma.fund.findUnique({ where: { code } })) {
    return { ok: false, message: `A fund already bears the code ${code}.` };
  }

  await prisma.fund.create({
    data: { code, name, restriction, purpose: purpose || null },
  });
  await recordAudit(principal, "treasury.fund.create", code, `${name} (${restriction})`);
  revalidatePath("/treasury");
  return { ok: true, message: `Fund ${code} opened.` };
}

export async function createAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const subtype = String(formData.get("subtype") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!/^\d{4,6}$/.test(code)) {
    return {
      ok: false,
      message: "Account codes are 4–6 digits. Conventionally 1xxx assets, 2xxx liabilities, 3xxx net assets, 4xxx revenue, 5xxx+ expenses.",
      fieldErrors: { code: "Four to six digits." },
    };
  }
  if (!name) return { ok: false, message: "Name the account.", fieldErrors: { name: "Required." } };
  if (!(ACCOUNT_TYPES as readonly string[]).includes(type)) {
    return { ok: false, message: "Choose an account type." };
  }
  if (await prisma.account.findUnique({ where: { code } })) {
    return { ok: false, message: `An account already bears the code ${code}.` };
  }

  await prisma.account.create({
    data: { code, name, type, subtype: subtype || null, description: description || null },
  });
  await recordAudit(principal, "treasury.account.create", code, `${name} (${type})`);
  revalidatePath("/treasury");
  return { ok: true, message: `Account ${code} — ${name} opened.` };
}

/**
 * Post a journal entry.
 *
 * Lines arrive as parallel arrays from the form. Anything that does not parse
 * is refused rather than coerced: a silently dropped line produces an entry that
 * balances and is wrong.
 */
export async function postJournalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  const accountCodes = formData.getAll("accountCode").map(String);
  const fundCodes = formData.getAll("fundCode").map(String);
  const debits = formData.getAll("debit").map(String);
  const credits = formData.getAll("credit").map(String);
  const memos = formData.getAll("lineMemo").map(String);

  const postings: PostingInput[] = [];
  try {
    for (let index = 0; index < accountCodes.length; index += 1) {
      const code = accountCodes[index]?.trim();
      const debitRaw = debits[index]?.trim() ?? "";
      const creditRaw = credits[index]?.trim() ?? "";
      // A wholly blank row is an empty form line, not an error.
      if (!code && !debitRaw && !creditRaw) continue;
      if (!code) {
        return { ok: false, message: `Line ${index + 1} has an amount but no account.` };
      }
      postings.push({
        accountCode: code,
        fundCode: fundCodes[index]?.trim() || null,
        debitCents: debitRaw ? parseMoney(debitRaw) : 0,
        creditCents: creditRaw ? parseMoney(creditRaw) : 0,
        memo: memos[index]?.trim() || null,
      });
    }
  } catch (error) {
    return fail(error);
  }

  const total = postings.reduce((sum, p) => sum + (p.debitCents ?? 0), 0);
  if (total >= DUAL_CONTROL_THRESHOLD_CENTS) {
    try {
      assertStepUp(
        principal,
        `Posting an entry of ${(total / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
      );
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Refused." };
    }
  }

  try {
    const journal = await postJournal(principal, {
      date: String(formData.get("date") ?? ""),
      memo: String(formData.get("memo") ?? ""),
      reference: String(formData.get("reference") ?? "") || null,
      sourceRecordId: String(formData.get("sourceRecordId") ?? "") || null,
      postings,
    });
    await recordAudit(
      principal,
      "treasury.journal.post",
      journal.entryNumber,
      `${(total / 100).toFixed(2)} — ${journal.memo}`,
    );
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/treasury");
  revalidatePath("/treasury/journal");
  return { ok: true, message: "Entry posted." };
}

export async function reverseJournalAction(
  journalId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  try {
    assertStepUp(principal, "Reversing a posted entry");
    const reversal = await reverseJournal(principal, journalId, String(formData.get("reason") ?? ""));
    await recordAudit(principal, "treasury.journal.reverse", reversal.entryNumber);
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/treasury");
  revalidatePath("/treasury/journal");
  return { ok: true, message: "Reversal posted. Both entries remain on the books." };
}
