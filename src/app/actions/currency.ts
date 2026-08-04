"use server";

import { revalidatePath } from "next/cache";
import { getPrincipal, assertMfa, assertStepUp } from "@/lib/auth";
import { can } from "@/lib/authz";
import { recordAudit } from "@/lib/audit";
import {
  openWallet,
  issue,
  spend,
  redeem,
  setFrozen,
  parseMarks,
  formatMarks,
  usdCentsFor,
  CurrencyError,
  MARK,
} from "@/lib/currency";
import { DUAL_CONTROL_THRESHOLD_CENTS } from "@/lib/treasury";
import type { FormState } from "@/app/actions/records";

/**
 * The mint counter.
 *
 * The Apex Mark is the Kingdom's money, so these actions are gated exactly as
 * the Treasury's are: keeping the mint is the Treasurer's office, everything
 * needs the second factor, and anything that moves real dollars out — redeeming
 * to cash — or freezes a member's wallet requires step-up re-authentication,
 * because those are the acts that cannot simply be reversed with an apology.
 */

function fail(error: unknown): FormState {
  if (error instanceof CurrencyError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  console.error("[currency] unexpected failure", error);
  return { ok: false, message: "The mint could not complete that. The fault has been logged." };
}

function guard(principal: Awaited<ReturnType<typeof getPrincipal>>): FormState | null {
  if (!can(principal.role, "registry:financial") && principal.role !== "SOVEREIGN") {
    return { ok: false, message: `The office of ${principal.role} does not keep the mint.` };
  }
  try {
    assertMfa(principal);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }
  return null;
}

export async function openWalletAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  const holderName = String(formData.get("holderName") ?? "").trim();
  const holderRecordId = String(formData.get("holderRecordId") ?? "").trim() || null;

  try {
    const wallet = await openWallet(principal, { holderName, holderRecordId });
    await recordAudit(principal, "currency.wallet.open", wallet.number, holderName);
    revalidatePath("/treasury/currency");
    return { ok: true, message: `Wallet ${wallet.number} opened for ${holderName}.` };
  } catch (error) {
    return fail(error);
  }
}

/** Shared parse for the three movements. */
function readMove(formData: FormData): { walletId: string; amountMinor: number; memo: string | null } {
  const walletId = String(formData.get("walletId") ?? "");
  const amountMinor = parseMarks(String(formData.get("amount") ?? ""));
  const memo = String(formData.get("memo") ?? "").trim() || null;
  return { walletId, amountMinor, memo };
}

export async function issueAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  let move;
  try {
    move = readMove(formData);
  } catch (error) {
    return fail(error);
  }

  // Issuing takes real dollars into the reserve; a large issuance is exactly the
  // sort of act dual control exists for.
  if (usdCentsFor(move.amountMinor) >= DUAL_CONTROL_THRESHOLD_CENTS) {
    try {
      assertStepUp(principal, `Issuing ${formatMarks(move.amountMinor)} ${MARK.plural}`);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Refused." };
    }
  }

  try {
    const result = await issue(principal, move);
    await recordAudit(principal, "currency.issue", result.wallet, formatMarks(move.amountMinor));
    revalidatePath("/treasury/currency");
    revalidatePath(`/treasury/currency/${move.walletId}`);
    return { ok: true, message: `Issued ${formatMarks(move.amountMinor)} ${MARK.plural}. Balance ${formatMarks(result.balanceAfter)}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function spendAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  let move;
  try {
    move = readMove(formData);
  } catch (error) {
    return fail(error);
  }

  try {
    const result = await spend(principal, move);
    await recordAudit(principal, "currency.spend", result.wallet, formatMarks(move.amountMinor));
    revalidatePath("/treasury/currency");
    revalidatePath(`/treasury/currency/${move.walletId}`);
    return { ok: true, message: `Spent ${formatMarks(move.amountMinor)} ${MARK.plural}. Balance ${formatMarks(result.balanceAfter)}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function redeemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  let move;
  try {
    move = readMove(formData);
  } catch (error) {
    return fail(error);
  }

  // Redemption pays real dollars out of the reserve. It always steps up, whatever
  // the amount, because it is the one movement that leaves the Kingdom.
  try {
    assertStepUp(principal, `Redeeming ${formatMarks(move.amountMinor)} ${MARK.plural} for dollars`);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  try {
    const result = await redeem(principal, move);
    await recordAudit(principal, "currency.redeem", result.wallet, formatMarks(move.amountMinor));
    revalidatePath("/treasury/currency");
    revalidatePath(`/treasury/currency/${move.walletId}`);
    return { ok: true, message: `Redeemed ${formatMarks(move.amountMinor)} ${MARK.plural} for dollars. Balance ${formatMarks(result.balanceAfter)}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function freezeWalletAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal);
  if (refused) return refused;

  const walletId = String(formData.get("walletId") ?? "");
  const frozen = String(formData.get("frozen") ?? "") === "true";
  const reason = String(formData.get("reason") ?? "").trim();

  try {
    assertStepUp(principal, frozen ? "Freezing a wallet" : "Unfreezing a wallet");
    const result = await setFrozen(principal, walletId, frozen, reason);
    await recordAudit(principal, `currency.${frozen ? "freeze" : "unfreeze"}`, result.wallet, reason);
    revalidatePath("/treasury/currency");
    revalidatePath(`/treasury/currency/${walletId}`);
    return { ok: true, message: frozen ? "Wallet frozen. Nothing moves until it is released." : "Wallet released." };
  } catch (error) {
    return fail(error);
  }
}
