"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

/**
 * The small forms on a record page: void, supersede, hold, release.
 *
 * Each is a disclosure that stays closed by default. These are consequential
 * acts and none of them should be one stray click away — but they also should
 * not be hidden somewhere an officer cannot find them under pressure.
 */

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label, tone = "default" }: { label: string; tone?: "default" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center rounded-sm border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        tone === "danger"
          ? "border-seal-600 text-seal-700 hover:bg-seal-50 dark:text-seal-300 dark:hover:bg-seal-900/30"
          : "border-ink-800 bg-ink-800 text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-white"
      }`}
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
      className={`mt-2 text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
    >
      {state.message}
    </p>
  );
}

function Disclosure({
  summary,
  hint,
  children,
}: {
  summary: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <details className="border-t border-[var(--rule)] py-2.5 first:border-t-0">
      <summary className="cursor-pointer text-[13px] font-medium">
        {summary}
        <span className="muted ml-2 font-normal">{hint}</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function VoidRecordForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <Disclosure summary="Void this record" hint="— the entry stays on file with a void notation">
      <form action={formAction} className="space-y-2">
        <label htmlFor="void-reason" className="overline block">
          Reason
        </label>
        <input
          id="void-reason"
          name="reason"
          className={INPUT}
          placeholder="e.g. Entered in error; duplicate of AK-IP-000012."
        />
        <p className="muted text-xs">
          Nothing is deleted. The record, its history, and its attachments remain and the void is
          committed to the ledger. Records under legal hold cannot be voided.
        </p>
        <Submit label="Record the void" tone="danger" />
        <Result state={state} />
      </form>
    </Disclosure>
  );
}

export function SupersedeForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <Disclosure summary="Mark as superseded" hint="— point to the record that replaces it">
      <form action={formAction} className="space-y-2">
        <label htmlFor="replacementNumber" className="overline block">
          Number of the replacing record
        </label>
        <input
          id="replacementNumber"
          name="replacementNumber"
          className={`${INPUT} tabular`}
          placeholder="AK-INST-000004"
        />
        {state.fieldErrors?.replacementNumber ? (
          <p className="text-xs text-seal-600">{state.fieldErrors.replacementNumber}</p>
        ) : null}
        <label htmlFor="supersede-note" className="overline block pt-1">
          Note
        </label>
        <input id="supersede-note" name="note" className={INPUT} placeholder="Optional." />
        <p className="muted text-xs">
          Preserves the chain of title. The superseded record stays readable and cites its
          replacement.
        </p>
        <Submit label="Record supersession" />
        <Result state={state} />
      </form>
    </Disclosure>
  );
}

const RELATIONS = [
  { value: "CITES", label: "cites", hint: "This record refers to or relies on the other." },
  { value: "EVIDENCES", label: "evidences", hint: "This record is proof of something in the other." },
  { value: "CONCERNS", label: "concerns", hint: "General subject-matter connection." },
  { value: "SERVED_ON", label: "was served on", hint: "For a notice and the party or matter it went to." },
  { value: "RESPONDS_TO", label: "responds to", hint: "This record answers the other." },
  { value: "AUTHORIZES", label: "authorises", hint: "An instrument and the act it permits." },
  { value: "AMENDS", label: "amends", hint: "For instruments that modify an earlier one." },
  { value: "DERIVES_FROM", label: "derives from", hint: "A work made from an earlier work." },
];

export function RelateForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <Disclosure summary="Link to another record" hint="— builds the trail between registers">
      <form action={formAction} className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="rel-kind" className="overline mb-1 block">
              This record…
            </label>
            <select id="rel-kind" name="kind" className={INPUT} defaultValue="CITES">
              {RELATIONS.map((relation) => (
                <option key={relation.value} value={relation.value}>
                  {relation.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rel-target" className="overline mb-1 block">
              …this record
            </label>
            <input
              id="rel-target"
              name="targetNumber"
              className={`${INPUT} tabular`}
              placeholder="AK-EVD-000031"
            />
            {state.fieldErrors?.targetNumber ? (
              <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.targetNumber}</p>
            ) : null}
          </div>
        </div>
        <input name="note" className={INPUT} placeholder="Note (optional)" aria-label="Note" />
        <p className="muted text-xs">
          An enforcement matter cites the intellectual property it defends, which cites the evidence
          of first use, which is served on a respondent by a recorded notice. That trail is what a
          lawyer needs, in the order they need it.
        </p>
        <Submit label="Record the link" />
        <Result state={state} />
      </form>
    </Disclosure>
  );
}

export function IssueHoldForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <Disclosure summary="Issue a legal hold" hint="— blocks voiding while a dispute is live">
      <form action={formAction} className="space-y-2">
        <label htmlFor="hold-matter" className="overline block">
          Matter
        </label>
        <input
          id="hold-matter"
          name="matter"
          className={INPUT}
          placeholder="e.g. Anticipated claim against Northgate Media LLC"
        />
        {state.fieldErrors?.matter ? (
          <p className="text-xs text-seal-600">{state.fieldErrors.matter}</p>
        ) : null}
        <label htmlFor="hold-reason" className="overline block pt-1">
          Why preservation is required
        </label>
        <input
          id="hold-reason"
          name="reason"
          className={INPUT}
          placeholder="e.g. Litigation reasonably anticipated as of 14 March; this record evidences first use."
        />
        {state.fieldErrors?.reason ? (
          <p className="text-xs text-seal-600">{state.fieldErrors.reason}</p>
        ) : null}
        <p className="muted text-xs">
          Issue holds early and broadly. The duty to preserve attaches as soon as litigation is
          reasonably anticipated, and destroying evidence after that point can produce an
          adverse-inference instruction that loses a case the facts would have won.
        </p>
        <Submit label="Issue hold" />
        <Result state={state} />
      </form>
    </Disclosure>
  );
}

export function ReleaseHoldForm({
  action,
  matter,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  matter: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="mt-2 space-y-2">
      <label htmlFor={`release-${matter}`} className="overline block">
        Reason for release
      </label>
      <input
        id={`release-${matter}`}
        name="reason"
        className={INPUT}
        placeholder="e.g. Matter settled and closed; no appeal period remains."
      />
      {state.fieldErrors?.reason ? (
        <p className="text-xs text-seal-600">{state.fieldErrors.reason}</p>
      ) : null}
      <Submit label="Release hold" tone="danger" />
      <Result state={state} />
    </form>
  );
}

export function CompleteDeadlineForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="inline">
      <button
        type="submit"
        className="muted text-xs underline underline-offset-2 hover:text-[var(--text)]"
      >
        {state.ok ? "Done" : "Mark done"}
      </button>
    </form>
  );
}
