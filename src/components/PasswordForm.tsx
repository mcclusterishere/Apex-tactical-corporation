"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
      {pending ? "Changing…" : "Change password"}
    </button>
  );
}

export function PasswordForm({
  action,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-md space-y-3">
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

      <div>
        <label htmlFor="pw-current" className="overline mb-1 block">
          Current password
        </label>
        <input
          id="pw-current"
          name="current"
          type="password"
          autoComplete="current-password"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="pw-next" className="overline mb-1 block">
          New password
        </label>
        <input
          id="pw-next"
          name="next"
          type="password"
          autoComplete="new-password"
          className={INPUT}
        />
        <p className="muted mt-1 text-xs">
          At least twelve characters. Four unrelated words you can remember beats eight characters
          of punctuation you have to write down.
        </p>
      </div>

      <div>
        <label htmlFor="pw-confirm" className="overline mb-1 block">
          Confirm new password
        </label>
        <input
          id="pw-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={INPUT}
        />
      </div>

      <Submit />
    </form>
  );
}
