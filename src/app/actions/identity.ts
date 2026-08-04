"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrincipal, assertMfa } from "@/lib/auth";
import { assertPasswordChanged, AccessError } from "@/lib/access";
import { can } from "@/lib/authz";
import { openClaim, reviewClaim, IdentityError } from "@/lib/identity";
import { publicUrl } from "@/lib/origin";
import type { FormState } from "@/app/actions/records";

/**
 * Begin an identity claim from the public page.
 *
 * Anonymous by design — the whole point is that someone who is not yet in the
 * register can come forward. What it does NOT do is admit them: it opens a claim
 * and sends them to the verifier. An officer decides afterwards.
 */
export async function beginIdentityClaimAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const claimedName = String(formData.get("claimedName") ?? "").trim();
  const claimedEmail = String(formData.get("claimedEmail") ?? "").trim();
  const claimedBasis = String(formData.get("claimedBasis") ?? "").trim();
  const consent = formData.get("consent");

  if (!claimedName) {
    return {
      ok: false,
      message: "State the name you are claiming.",
      fieldErrors: { claimedName: "Required." },
    };
  }
  // Consent is not a formality here. An identity check sends a government
  // document and a face to a third party; doing that without a recorded,
  // affirmative agreement is the kind of thing that turns a register into a
  // defendant.
  if (!consent) {
    return {
      ok: false,
      message: "You must agree before an identity check can be started.",
      fieldErrors: { consent: "Required." },
    };
  }

  let verificationUrl: string;
  try {
    const result = await openClaim({
      claimedName,
      claimedEmail: claimedEmail || null,
      claimedBasis: claimedBasis || null,
      callbackUrl: await publicUrl("/claim/return"),
    });
    verificationUrl = result.verificationUrl;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof IdentityError || error instanceof Error
          ? error.message
          : "The claim could not be started.",
    };
  }

  // The verifier is hosted, so the person leaves the register here and comes
  // back to /claim/return afterwards.
  redirect(verificationUrl);
}

/** An officer accepting or refusing a verified claim. */
export async function reviewIdentityClaimAction(
  claimId: string,
  accept: boolean,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
    if (!can(principal.role, "record:amend")) {
      throw new AccessError("You do not hold the power to decide identity claims.");
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Refused.",
    };
  }

  const note = String(formData.get("note") ?? "").trim();
  const citizenRecordId = String(formData.get("citizenRecordId") ?? "").trim();

  try {
    await reviewClaim({
      claimId,
      accept,
      note: note || null,
      officerId: principal.id,
      officerLabel: `${principal.displayName} (${principal.role})`,
      citizenRecordId: citizenRecordId || null,
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The decision could not be recorded.",
    };
  }

  revalidatePath("/claims");
  return { ok: true, message: accept ? "Claim accepted." : "Claim refused." };
}
