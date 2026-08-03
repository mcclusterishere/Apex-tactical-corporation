"use server";

import { revalidatePath } from "next/cache";
import { getPrincipal, assertStepUp, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { issueCredential, revokeCredential, CredentialError } from "@/lib/credentials";
import type { FormState } from "@/app/actions/records";

/**
 * Credential issuance and revocation.
 *
 * Both require step-up re-authentication. Issuing a credential creates apparent
 * authority in the world; revoking one withdraws it. Neither should be possible
 * from a session someone walked away from.
 */

function guard(principal: Awaited<ReturnType<typeof getPrincipal>>, act: string): FormState | null {
  if (!isAuthenticated(principal)) return { ok: false, message: "Sign in first." };
  if (!can(principal.role, "record:certify") && principal.role !== "SOVEREIGN") {
    return {
      ok: false,
      message: `The office of ${principal.role} does not issue credentials of the Kingdom.`,
    };
  }
  try {
    assertStepUp(principal, act);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }
  return null;
}

export async function issueCredentialAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal, "Issuing a credential");
  if (refused) return refused;

  try {
    const credential = await issueCredential(principal, {
      type: String(formData.get("type") ?? ""),
      subjectName: String(formData.get("subjectName") ?? ""),
      subjectRecordId: String(formData.get("subjectRecordId") ?? "") || null,
      standing: String(formData.get("standing") ?? "") || null,
      effectiveFrom: String(formData.get("effectiveFrom") ?? "") || null,
      expiresAt: String(formData.get("expiresAt") ?? "") || null,
      signingPassphrase: String(formData.get("signingPassphrase") ?? "") || undefined,
    });
    revalidatePath("/credentials");
    return {
      ok: true,
      message: `Issued ${credential?.credentialNumber}. Verification code ${credential?.verificationCode}.${
        credential?.signature ? " Signed." : " Unsigned — enrol a signing key to sign credentials."
      }`,
    };
  } catch (error) {
    if (error instanceof CredentialError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
    }
    console.error("[credentials] issue failed", error);
    return { ok: false, message: "The credential could not be issued." };
  }
}

export async function revokeCredentialAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const refused = guard(principal, "Revoking a credential");
  if (refused) return refused;

  const credentialId = String(formData.get("credentialId") ?? "");
  if (!credentialId) return { ok: false, message: "Choose a credential to revoke." };

  try {
    await revokeCredential(principal, credentialId, String(formData.get("reason") ?? ""));
  } catch (error) {
    if (error instanceof CredentialError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
    }
    return { ok: false, message: "The credential could not be revoked." };
  }

  revalidatePath("/credentials");
  return {
    ok: true,
    message:
      "Revoked. Tell anyone who relied on it — an unrevoked credential in a former officer's hands is apparent authority the Kingdom is bound by, and the register alone does not reach the outside world.",
  };
}
