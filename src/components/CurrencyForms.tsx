"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-[5px] border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--link)]";

function Submit({ label, tone = "primary" }: { label: string; tone?: "primary" | "default" | "danger" }) {
  const { pending } = useFormStatus();
  const cls =
    tone === "danger"
      ? "border-seal-600 text-seal-700 dark:text-seal-300 hover:bg-seal-50 dark:hover:bg-seal-500/10"
      : tone === "default"
        ? "surface border-[var(--rule-strong)] hover:surface-tint"
        : "border-[var(--accent)] bg-[var(--accent)] text-[var(--page-raised)] hover:opacity-90";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[5px] border px-3.5 py-1.5 text-[13px] font-medium transition-all disabled:opacity-50 ${cls}`}
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

export function OpenWalletForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1">
        <label htmlFor="holderName" className="overline mb-1 block">
          Holder&rsquo;s name
        </label>
        <input id="holderName" name="holderName" className={INPUT} placeholder="A member of the Kingdom" />
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor="holderRecordId" className="overline mb-1 block">
          Roll record (optional)
        </label>
        <input id="holderRecordId" name="holderRecordId" className={`${INPUT} tabular`} placeholder="citizens record id" />
      </div>
      <Submit label="Open wallet" />
      <div className="w-full">
        <Result state={state} />
      </div>
    </form>
  );
}

/** One movement form: issue, spend, or redeem, differing only in label and tone. */
export function MovementForm({
  action,
  walletId,
  verb,
  label,
  help,
  tone = "primary",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  walletId: string;
  verb: string;
  label: string;
  help: string;
  tone?: "primary" | "default" | "danger";
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="walletId" value={walletId} />
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor={`${verb}-amount`} className="overline mb-1 block">
            Amount (Marks)
          </label>
          <input
            id={`${verb}-amount`}
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            className={`${INPUT} tabular w-32 text-right`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor={`${verb}-memo`} className="overline mb-1 block">
            Memo
          </label>
          <input id={`${verb}-memo`} name="memo" className={INPUT} placeholder="What this is for" />
        </div>
        <Submit label={label} tone={tone} />
      </div>
      <p className="muted text-xs">{help}</p>
      <Result state={state} />
    </form>
  );
}

export function FreezeForm({
  action,
  walletId,
  frozen,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  walletId: string;
  frozen: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="frozen" value={frozen ? "true" : "false"} />
      <div className="min-w-0 flex-1">
        <label htmlFor="freeze-reason" className="overline mb-1 block">
          Reason
        </label>
        <input id="freeze-reason" name="reason" className={INPUT} placeholder={frozen ? "Why this wallet is being frozen" : "Why it is being released"} />
      </div>
      <Submit label={frozen ? "Freeze wallet" : "Release wallet"} tone={frozen ? "danger" : "default"} />
      <div className="w-full">
        <Result state={state} />
      </div>
    </form>
  );
}
