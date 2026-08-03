"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type AuthState } from "@/app/actions/auth";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-2 text-sm outline-none focus:border-ink-500";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-sm border border-ink-800 bg-ink-800 px-4 py-2 text-sm font-medium text-ink-50 transition-colors hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-white"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(signInAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />

      {state.error ? (
        <div
          role="alert"
          className="border-l-[3px] border-seal-600 bg-seal-50 px-3 py-2 text-[13px] text-seal-900 dark:bg-transparent dark:text-seal-300"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="overline mb-1 block">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="password" className="overline mb-1 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT}
        />
      </div>

      <Submit />
    </form>
  );
}
