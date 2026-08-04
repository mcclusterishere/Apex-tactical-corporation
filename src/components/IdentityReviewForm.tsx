"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reviewIdentityClaimAction } from "@/app/actions/identity";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label, tone }: { label: string; tone: "accept" | "refuse" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center rounded-sm border px-4 py-1.5 text-[13px] font-medium disabled:opacity-60 ${
        tone === "refuse"
          ? "border-seal-600 text-seal-700 hover:bg-seal-50 dark:text-seal-300 dark:hover:bg-seal-900/30"
          : "border-ink-800 bg-ink-800 text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      }`}
    >
      {pending ? "Recording…" : label}
    </button>
  );
}

export function IdentityReviewForm({
  claimId,
  canAccept,
}: {
  claimId: string;
  /** False when the verifier did not approve — acceptance is then impossible. */
  canAccept: boolean;
}) {
  const accept = reviewIdentityClaimAction.bind(null, claimId, true);
  const refuse = reviewIdentityClaimAction.bind(null, claimId, false);
  const [acceptState, acceptAction] = useActionState<FormState, FormData>(accept, { ok: false });
  const [refuseState, refuseAction] = useActionState<FormState, FormData>(refuse, { ok: false });
  const state = acceptState.message ? acceptState : refuseState;

  return (
    <div className="space-y-5">
      {canAccept ? (
        <form action={acceptAction} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">
              Roll of Citizens record <span className="muted font-normal">(optional)</span>
            </span>
            <input name="citizenRecordId" className={INPUT} placeholder="Record id to attach this person to" />
            <span className="muted mt-1 block text-xs">
              Leave empty to accept the claim without attaching it to anyone yet.
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">Note</span>
            <textarea name="note" rows={2} className={INPUT} />
          </label>
          <Submit label="Accept this claim" tone="accept" />
        </form>
      ) : (
        <p className="text-sm text-seal-700 dark:text-seal-300">
          The verifier did not approve this check, so it cannot be accepted. It can only be
          refused, or left standing while the claimant tries again.
        </p>
      )}

      <form action={refuseAction} className="space-y-3 border-t border-[var(--rule)] pt-4">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Reason for refusal</span>
          <textarea name="note" rows={2} className={INPUT} />
        </label>
        <Submit label="Refuse this claim" tone="refuse" />
      </form>

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-[var(--good)]" : "text-seal-700 dark:text-seal-300"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
