"use server";

import { revalidatePath } from "next/cache";
import { getPrincipal, isAuthenticated, assertMfa } from "@/lib/auth";
import { assertPasswordChanged, AccessError } from "@/lib/access";
import { can } from "@/lib/authz";
import {
  postTask,
  claimTask,
  reportTaskDone,
  verifyTask,
  cancelTask,
  giftStays,
  spendStays,
  StayError,
} from "@/lib/stays";
import type { FormState } from "@/app/actions/records";

/** Posting and verifying tasks is stewardship of the family's properties —
 * gated like the lettings. Earning, gifting, and spending is open to every
 * signed-in member: the whole point is that anyone in the family can work,
 * give, and stay. */
function assertSteward(role: string | null | undefined) {
  if (!(can(role, "registry:financial") || role === "SOVEREIGN")) {
    throw new AccessError("You do not hold the power to post or verify Apex tasks.");
  }
}

async function guarded(
  fn: (principal: Awaited<ReturnType<typeof getPrincipal>>) => Promise<void>,
  steward = false,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    if (!isAuthenticated(principal)) throw new AccessError("Sign in first.");
    assertMfa(principal);
    assertPasswordChanged(principal);
    if (steward) assertSteward(principal.role);
    await fn(principal);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Refused.",
    };
  }
  revalidatePath("/stays");
  return { ok: true, message: "Done." };
}

export async function postTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async (principal) => {
    const nights = Math.trunc(Number(formData.get("rewardNights")));
    if (!Number.isFinite(nights)) throw new StayError("Set the reward in whole nights.");
    await postTask(principal, {
      title: String(formData.get("title") ?? ""),
      detail: String(formData.get("detail") ?? "") || null,
      propertyLabel: String(formData.get("propertyLabel") ?? ""),
      rewardNights: nights,
    });
  }, true);
}

export async function claimTaskAction(taskId: string, _prev: FormState): Promise<FormState> {
  return guarded((principal) => claimTask(principal, taskId).then(() => undefined));
}

export async function markDoneAction(
  taskId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return guarded((principal) =>
    reportTaskDone(principal, taskId, String(formData.get("note") ?? "") || undefined).then(
      () => undefined,
    ),
  );
}

export async function verifyTaskAction(taskId: string, _prev: FormState): Promise<FormState> {
  return guarded((principal) => verifyTask(principal, taskId).then(() => undefined), true);
}

export async function cancelTaskAction(taskId: string, _prev: FormState): Promise<FormState> {
  return guarded((principal) => cancelTask(principal, taskId).then(() => undefined));
}

export async function giftAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async (principal) => {
    const nights = Math.trunc(Number(formData.get("nights")));
    if (!Number.isFinite(nights)) throw new StayError("Set the gift in whole nights.");
    await giftStays(
      principal,
      String(formData.get("toUserId") ?? ""),
      nights,
      String(formData.get("memo") ?? "") || undefined,
    );
  });
}

export async function spendAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async (principal) => {
    const nights = Math.trunc(Number(formData.get("nights")));
    if (!Number.isFinite(nights)) throw new StayError("Set the spend in whole nights.");
    await spendStays(principal, nights, String(formData.get("memo") ?? ""));
  });
}
