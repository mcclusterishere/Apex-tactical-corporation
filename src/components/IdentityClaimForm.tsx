"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { beginIdentityClaimAction } from "@/app/actions/identity";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Opening the check…" : "Begin identity check"}
    </button>
  );
}

export function IdentityClaimForm() {
  const [state, action] = useActionState<FormState, FormData>(beginIdentityClaimAction, {
    ok: false,
  });

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Your full legal name</span>
        <input name="claimedName" required className={INPUT} autoComplete="name" />
        <span className="muted mt-1 block text-xs">
          As it appears on the identity document you will present.
        </span>
        {state.fieldErrors?.claimedName ? (
          <span className="mt-1 block text-xs text-seal-700 dark:text-seal-300">
            {state.fieldErrors.claimedName}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">
          Email <span className="muted font-normal">(optional)</span>
        </span>
        <input name="claimedEmail" type="email" className={INPUT} autoComplete="email" />
        <span className="muted mt-1 block text-xs">
          Only so the Registrar can reach you about this claim.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">
          Who you say you are <span className="muted font-normal">(optional)</span>
        </span>
        <textarea name="claimedBasis" rows={3} className={INPUT} />
        <span className="muted mt-1 block text-xs">
          For example, a family connection, or a record you believe concerns you.
        </span>
      </label>

      <label className="flex gap-2.5 text-sm">
        <input name="consent" type="checkbox" value="yes" className="mt-0.5" />
        <span>
          I agree that my identity document and a photograph of my face may be sent to Didit, an
          independent identity verification service, to confirm my identity. I understand Apex
          Kingdom will receive only the result.
        </span>
      </label>
      {state.fieldErrors?.consent ? (
        <p className="text-xs text-seal-700 dark:text-seal-300">{state.fieldErrors.consent}</p>
      ) : null}

      {state.message ? (
        <p className="text-sm text-seal-700 dark:text-seal-300">{state.message}</p>
      ) : null}

      <Submit />
    </form>
  );
}
