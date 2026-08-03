"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Cutting…" : "Cut checkpoint"}
    </button>
  );
}

export function CheckpointForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="space-y-2">
      <Submit />
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
