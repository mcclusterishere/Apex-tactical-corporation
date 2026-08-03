"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/authz";
import type { AuthState } from "@/app/actions/auth";

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
      {pending ? "Commissioning…" : "Commission"}
    </button>
  );
}

export function PrincipalForm({
  action,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p role="alert" className="text-[13px] text-seal-600">
          {state.error}
        </p>
      ) : null}
      {state.ok && state.message ? (
        <p role="status" className="text-[13px] text-moss-700 dark:text-moss-100">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="p-name" className="overline mb-1 block">
            Name
          </label>
          <input id="p-name" name="displayName" className={INPUT} />
        </div>
        <div>
          <label htmlFor="p-email" className="overline mb-1 block">
            Email address
          </label>
          <input id="p-email" name="email" type="email" className={INPUT} />
        </div>
        <div>
          <label htmlFor="p-office" className="overline mb-1 block">
            Office title
          </label>
          <input
            id="p-office"
            name="officeTitle"
            className={INPUT}
            placeholder="e.g. Registrar General of Apex Kingdom"
          />
        </div>
        <div>
          <label htmlFor="p-password" className="overline mb-1 block">
            Initial password
          </label>
          <input
            id="p-password"
            name="password"
            type="text"
            className={INPUT}
            placeholder="At least 12 characters"
            autoComplete="off"
          />
          <p className="muted mt-1 text-xs">
            Deliver this out of band — not in the same email as the address it belongs to.
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="overline mb-1.5">Office</legend>
        <div className="space-y-1.5">
          {ROLES.map((role) => (
            <label key={role} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="role"
                value={role}
                defaultChecked={role === "CLERK"}
                className="mt-1"
              />
              <span>
                {ROLE_LABELS[role]}
                <span className="muted block text-xs">{ROLE_DESCRIPTIONS[role]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Submit />
    </form>
  );
}
