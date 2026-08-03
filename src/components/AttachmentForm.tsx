"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CLASSIFICATIONS, CLASSIFICATION_LABELS } from "@/lib/classification";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm border border-ink-800 bg-ink-800 px-3 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Working…" : label}
    </button>
  );
}

function Result({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
    >
      {state.message}
    </p>
  );
}

export function AttachmentForm({
  action,
  defaultClassification,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultClassification: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });

  return (
    <details className="border-t border-[var(--rule)] py-2.5 first:border-t-0">
      <summary className="cursor-pointer text-[13px] font-medium">
        Attach a document or item
        <span className="muted ml-2 font-normal">
          — digested on receipt and committed to the ledger
        </span>
      </summary>

      <form action={formAction} className="mt-3 space-y-3">
        <Result state={state} />

        <div>
          <label htmlFor="att-file" className="overline mb-1 block">
            File
          </label>
          <input id="att-file" name="file" type="file" className={INPUT} />
          {state.fieldErrors?.file ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.file}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="att-from" className="overline mb-1 block">
              Received from
            </label>
            <input
              id="att-from"
              name="acquiredFrom"
              className={INPUT}
              placeholder="Person, agency, platform, or 'collected by the Registrar'"
            />
          </div>
          <div>
            <label htmlFor="att-when" className="overline mb-1 block">
              Date obtained
            </label>
            <input id="att-when" name="acquiredAt" type="date" className={INPUT} />
          </div>
        </div>

        <div>
          <label htmlFor="att-note" className="overline mb-1 block">
            How it was obtained
          </label>
          <textarea
            id="att-note"
            name="collectionNote"
            rows={3}
            className={INPUT}
            placeholder="e.g. Downloaded from https://example.com/page at 14:22 EST on 3 March 2026 using Firefox; full-page capture taken at the same time and filed as AK-EVD-000031."
          />
          {state.fieldErrors?.collectionNote ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.collectionNote}</p>
          ) : null}
          <p className="muted mt-1 text-xs">
            Write this as the person who collected it, in their own words. It is what they will be
            asked about if they ever have to authenticate the item, and memory of a routine
            collection does not survive two years.
          </p>
        </div>

        <div>
          <label htmlFor="att-class" className="overline mb-1 block">
            Classification
          </label>
          <select
            id="att-class"
            name="classification"
            className={INPUT}
            defaultValue={defaultClassification}
          >
            {CLASSIFICATIONS.map((level) => (
              <option key={level} value={level}>
                {CLASSIFICATION_LABELS[level]}
              </option>
            ))}
          </select>
          <p className="muted mt-1 text-xs">
            May be stricter than the record it hangs from. An appraisal or a medical note attached
            to an otherwise public record should be sealed.
          </p>
        </div>

        <Submit label="Attach and digest" />
      </form>
    </details>
  );
}

export function CustodyForm({
  action,
  attachmentLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  attachmentLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });

  return (
    <details className="mt-2">
      <summary className="muted cursor-pointer text-xs underline underline-offset-2">
        Log a custody event
      </summary>
      <form action={formAction} className="mt-2 space-y-2">
        <Result state={state} />
        <div className="grid gap-2 sm:grid-cols-3">
          <select name="action" className={INPUT} defaultValue="EXAMINED" aria-label="Custody action">
            <option value="RECEIVED">Received</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="EXAMINED">Examined</option>
            <option value="COPIED">Copied</option>
            <option value="PRODUCED">Produced</option>
            <option value="RETURNED">Returned</option>
            <option value="SEALED">Sealed</option>
          </select>
          <input
            name="counterparty"
            className={INPUT}
            placeholder="To or from whom"
            aria-label={`Counterparty for ${attachmentLabel}`}
          />
          <input name="occurredAt" type="date" className={INPUT} aria-label="Date" />
        </div>
        <input name="note" className={INPUT} placeholder="Note" aria-label="Note" />
        <Submit label="Record custody event" />
      </form>
    </details>
  );
}
