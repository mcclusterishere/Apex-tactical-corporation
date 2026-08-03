"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Publishing…" : "Publish issue"}
    </button>
  );
}

export function GazetteForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-3">
      {state.message ? (
        <p
          role="status"
          className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="gz-title" className="overline mb-1 block">
          Title
        </label>
        <input
          id="gz-title"
          name="title"
          className={INPUT}
          defaultValue={typeof values.title === "string" ? values.title : ""}
          placeholder="Promulgation of the Ordinance on Records and Registers"
        />
        {state.fieldErrors?.title ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.title}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="gz-summary" className="overline mb-1 block">
          Summary
        </label>
        <input
          id="gz-summary"
          name="summary"
          className={INPUT}
          defaultValue={typeof values.summary === "string" ? values.summary : ""}
          placeholder="One line, shown beneath the heading."
        />
      </div>

      <div>
        <label htmlFor="gz-body" className="overline mb-1 block">
          Body
        </label>
        <textarea
          id="gz-body"
          name="body"
          rows={10}
          className={INPUT}
          defaultValue={typeof values.body === "string" ? values.body : ""}
          placeholder="Markdown. Set out what is being published and cite the record numbers it concerns."
        />
        {state.fieldErrors?.body ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.body}</p>
        ) : null}
      </div>

      <p className="muted text-xs">
        An issue cannot be edited once published. The full text is committed to the ledger, so a
        later change to the stored text would break the chain — which is the property that makes
        publication worth anything.
      </p>

      <Submit />
    </form>
  );
}
