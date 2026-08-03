"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

const METHODS = [
  {
    value: "CERTIFIED_MAIL",
    label: "Certified mail to the Registrar",
    hint: "Print the head hash, mail it to yourself, and file the sealed envelope unopened. The postmark is the date. Costs a few dollars and needs no technical infrastructure.",
  },
  {
    value: "RFC3161",
    label: "RFC 3161 timestamp authority",
    hint: "The strongest option and generally free. A timestamp authority signs the hash with the current time; the token is verifiable by anyone, forever, without trusting the Kingdom.",
  },
  {
    value: "GAZETTE",
    label: "Published in the official gazette",
    hint: "Publication creates a dated public record. Weakest on its own, since the Kingdom controls the gazette — pair it with another method.",
  },
  {
    value: "GIT_COMMIT",
    label: "Commit to a public repository",
    hint: "A commit to a hosted repository carries a third-party timestamp and is trivial to check.",
  },
  {
    value: "EXTERNAL_FILING",
    label: "Included in an external filing",
    hint: "The head hash appeared in something filed with a court, agency, or registry. Very strong, since the recipient's own records corroborate the date.",
  },
  { value: "MANUAL", label: "Other", hint: "Describe the method in the note." },
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Recording…" : "Record the anchor"}
    </button>
  );
}

export function AnchorForm({
  action,
  sequence,
  headHash,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  sequence: number;
  headHash: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sequence" value={sequence} />
      <input type="hidden" name="headHash" value={headHash} />

      {state.message ? (
        <p
          role="status"
          className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
        >
          {state.message}
        </p>
      ) : null}

      <fieldset>
        <legend className="overline mb-1.5">How was the head hash published?</legend>
        <div className="space-y-1.5">
          {METHODS.map((method) => (
            <label key={method.value} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="method"
                value={method.value}
                defaultChecked={method.value === "CERTIFIED_MAIL"}
                className="mt-1"
              />
              <span>
                {method.label}
                <span className="muted block text-xs">{method.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="externalRef" className="overline mb-1 block">
          External reference
        </label>
        <input
          id="externalRef"
          name="externalRef"
          className={`${INPUT} tabular`}
          placeholder="Tracking number, commit SHA, timestamp token filename, or docket number"
        />
        {state.fieldErrors?.externalRef ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.externalRef}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="externalNote" className="overline mb-1 block">
          Note
        </label>
        <input
          id="externalNote"
          name="externalNote"
          className={INPUT}
          placeholder="Where the physical or digital proof is kept."
        />
      </div>

      <Submit />
    </form>
  );
}
