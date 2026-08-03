"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Panel } from "@/components/ui";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Opening…" : label}
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

const TYPE_HELP: Record<string, string> = {
  ASSET: "What the Kingdom owns or is owed. Debit-normal.",
  LIABILITY: "What the Kingdom owes. Credit-normal.",
  NET_ASSETS: "The residual — assets less liabilities. Credit-normal.",
  REVENUE: "What comes in: tithes, gifts, grants, fees. Credit-normal.",
  EXPENSE: "What goes out in the course of operations. Debit-normal.",
};

const RESTRICTION_HELP: Record<string, string> = {
  UNRESTRICTED: "May be applied to any purpose of the Kingdom.",
  TEMPORARILY_RESTRICTED:
    "Given for a stated purpose or period. Becomes unrestricted when the purpose is met.",
  PERMANENTLY_RESTRICTED:
    "The principal must be held in perpetuity; only the return may be spent. An endowment.",
};

export function ChartForms({
  accountAction,
  fundAction,
  accountTypes,
  restrictions,
}: {
  accountAction: (prev: FormState, formData: FormData) => Promise<FormState>;
  fundAction: (prev: FormState, formData: FormData) => Promise<FormState>;
  accountTypes: string[];
  restrictions: string[];
}) {
  const [accountState, accountFormAction] = useActionState<FormState, FormData>(accountAction, {
    ok: false,
  });
  const [fundState, fundFormAction] = useActionState<FormState, FormData>(fundAction, { ok: false });

  return (
    <>
      <Panel title="Open an account">
        <form action={accountFormAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="acct-code" className="overline mb-1 block">
                Code
              </label>
              <input id="acct-code" name="code" className={`${INPUT} tabular`} placeholder="1000" />
              {accountState.fieldErrors?.code ? (
                <p className="mt-1 text-xs text-seal-600">{accountState.fieldErrors.code}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="acct-name" className="overline mb-1 block">
                Name
              </label>
              <input id="acct-name" name="name" className={INPUT} placeholder="Cash at bank" />
            </div>
          </div>
          <fieldset>
            <legend className="overline mb-1.5">Type</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {accountTypes.map((type) => (
                <label key={type} className="flex items-start gap-2 text-sm">
                  <input type="radio" name="type" value={type} className="mt-1" />
                  <span>
                    {type.replace("_", " ")}
                    <span className="muted block text-xs">{TYPE_HELP[type]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="acct-desc" className="overline mb-1 block">
              Description
            </label>
            <input id="acct-desc" name="description" className={INPUT} />
          </div>
          <Submit label="Open account" />
          <Result state={accountState} />
        </form>
      </Panel>

      <Panel title="Open a fund">
        <form action={fundFormAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="fund-code" className="overline mb-1 block">
                Code
              </label>
              <input id="fund-code" name="code" className={`${INPUT} tabular`} placeholder="GEN" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="fund-name" className="overline mb-1 block">
                Name
              </label>
              <input id="fund-name" name="name" className={INPUT} placeholder="General fund" />
            </div>
          </div>
          <fieldset>
            <legend className="overline mb-1.5">Restriction</legend>
            <div className="space-y-1.5">
              {restrictions.map((restriction) => (
                <label key={restriction} className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="restriction"
                    value={restriction}
                    defaultChecked={restriction === "UNRESTRICTED"}
                    className="mt-1"
                  />
                  <span>
                    {restriction.replace("_", " ").toLowerCase()}
                    <span className="muted block text-xs">{RESTRICTION_HELP[restriction]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="fund-purpose" className="overline mb-1 block">
              Terms of the restriction
            </label>
            <textarea
              id="fund-purpose"
              name="purpose"
              rows={3}
              className={INPUT}
              placeholder="The donor's own words, as closely as possible. This is what binds the Kingdom."
            />
            {fundState.fieldErrors?.purpose ? (
              <p className="mt-1 text-xs text-seal-600">{fundState.fieldErrors.purpose}</p>
            ) : null}
          </div>
          <Submit label="Open fund" />
          <Result state={fundState} />
        </form>
      </Panel>
    </>
  );
}
