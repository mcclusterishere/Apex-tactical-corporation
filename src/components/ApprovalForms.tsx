"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label, tone = "primary" }: { label: string; tone?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center rounded-sm border px-3 py-1.5 text-[13px] font-medium disabled:opacity-60 ${
        tone === "danger"
          ? "border-seal-600 text-seal-700 hover:bg-seal-50 dark:text-seal-300"
          : "border-ink-800 bg-ink-800 text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
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
      role={state.ok ? "status" : "alert"}
      className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
    >
      {state.message}
    </p>
  );
}

export function ApprovalRequestForm({
  action,
  subjectTypes,
  roles,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  subjectTypes: { value: string; label: string }[];
  roles: { value: string; label: string }[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-type" className="overline mb-1 block">
            What is being approved
          </label>
          <select id="ap-type" name="subjectType" className={INPUT}>
            {subjectTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ap-ref" className="overline mb-1 block">
            Reference
          </label>
          <input
            id="ap-ref"
            name="subjectId"
            className={`${INPUT} tabular`}
            placeholder="Record or entry number, if any"
          />
        </div>
      </div>
      <div>
        <label htmlFor="ap-summary" className="overline mb-1 block">
          Summary
        </label>
        <input
          id="ap-summary"
          name="summary"
          className={INPUT}
          placeholder="What a second officer needs to know to decide."
        />
        {state.fieldErrors?.summary ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.summary}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="ap-reason" className="overline mb-1 block">
          Reason
        </label>
        <textarea id="ap-reason" name="reason" rows={2} className={INPUT} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-count" className="overline mb-1 block">
            Approvals required
          </label>
          <select id="ap-count" name="requiredCount" className={INPUT} defaultValue="2">
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <p className="muted mt-1 text-xs">Yours does not count toward this.</p>
        </div>
        <fieldset>
          <legend className="overline mb-1">Who may decide</legend>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {roles.map((role) => (
              <label key={role.value} className="flex items-center gap-2 text-xs">
                <input type="checkbox" name="eligibleRoles" value={role.value} />
                {role.label}
              </label>
            ))}
          </div>
          <p className="muted mt-1 text-xs">Leave empty for any officer.</p>
        </fieldset>
      </div>
      <Submit label="Raise request" />
      <Result state={state} />
    </form>
  );
}

export function ApprovalVoteForm({
  action,
  approvalId,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  approvalId: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="approvalId" value={approvalId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="note" className={INPUT} placeholder="Note (optional)" aria-label="Note" />
        <input
          name="signingPassphrase"
          type="password"
          autoComplete="off"
          className={INPUT}
          placeholder="Signing passphrase — signs your decision"
          aria-label="Signing passphrase"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="APPROVE"
          className="rounded-sm border border-moss-500 px-3 py-1.5 text-[13px] font-medium text-moss-700 hover:bg-moss-100 dark:text-moss-100 dark:hover:bg-transparent"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECT"
          className="rounded-sm border border-seal-600 px-3 py-1.5 text-[13px] font-medium text-seal-700 hover:bg-seal-50 dark:text-seal-300"
        >
          Reject
        </button>
      </div>
      <Result state={state} />
    </form>
  );
}
