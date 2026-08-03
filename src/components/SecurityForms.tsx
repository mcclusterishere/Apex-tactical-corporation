"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/records";
import type { AuthState } from "@/app/actions/auth";

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
          ? "border-seal-600 text-seal-700 hover:bg-seal-50 dark:text-seal-300 dark:hover:bg-seal-900/30"
          : "border-ink-800 bg-ink-800 text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      }`}
    >
      {pending ? "Working…" : label}
    </button>
  );
}

function Result({ state }: { state: { ok?: boolean; message?: string; error?: string } }) {
  const text = state.message ?? state.error;
  if (!text) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
    >
      {text}
    </p>
  );
}

/** Re-authenticate for a consequential act. */
export function StepUpPrompt({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1">
        <label htmlFor="stepup-pw" className="overline mb-1 block">
          Confirm your password
        </label>
        <input
          id="stepup-pw"
          name="password"
          type="password"
          autoComplete="current-password"
          className={INPUT}
        />
      </div>
      <Submit label="Re-authenticate" />
      <div className="w-full">
        <Result state={state} />
      </div>
    </form>
  );
}

/** Present the second factor for this session. */
export function MfaPrompt({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <label htmlFor="mfa-code" className="overline mb-1 block">
          Authenticator code
        </label>
        <input
          id="mfa-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          className={`${INPUT} tabular w-36 text-center text-lg tracking-widest`}
        />
      </div>
      <Submit label="Confirm" />
      <p className="muted w-full text-xs">
        A recovery code works here too, and is burned when used.
      </p>
      <div className="w-full">
        <Result state={state} />
      </div>
    </form>
  );
}

/** Enrol a second factor: show the secret, then confirm a generated code. */
export function TotpEnrolment({
  begin,
  confirm,
}: {
  begin: () => Promise<{ ok: boolean; secret?: string; uri?: string; message?: string }>;
  confirm: (
    prev: FormState & { recoveryCodes?: string[] },
    formData: FormData,
  ) => Promise<FormState & { recoveryCodes?: string[] }>;
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [state, formAction] = useActionState(confirm, { ok: false } as FormState & {
    recoveryCodes?: string[];
  });

  if (state.ok && state.recoveryCodes) {
    return (
      <div>
        <p className="text-[13px] text-moss-700 dark:text-moss-100">{state.message}</p>
        <div className="surface mt-3 rounded-sm border border-gilt-500 px-4 py-3">
          <p className="overline mb-2">Recovery codes — shown once</p>
          <ul className="tabular grid gap-1 text-sm sm:grid-cols-2">
            {state.recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <p className="muted mt-3 text-xs">
            Print these and keep them somewhere physical. They are the only way back into this
            account if the authenticator is lost, and they are stored here only as digests — nobody,
            including the Registrar, can recover them for you.
          </p>
        </div>
      </div>
    );
  }

  if (!secret) {
    return (
      <div>
        <p className="muted mb-3 text-sm">
          A second factor means a stolen password alone is not enough to act as you. It takes about
          a minute to set up.
        </p>
        <button
          type="button"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            const result = await begin();
            if (result.ok && result.secret) {
              setSecret(result.secret);
              setUri(result.uri ?? null);
            }
            setStarting(false);
          }}
          className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
        >
          {starting ? "Preparing…" : "Begin enrolment"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="overline mb-1">1. Add this secret to your authenticator</p>
        <p className="tabular select-all break-all rounded-sm border border-[var(--rule)] px-3 py-2 text-sm">
          {secret}
        </p>
        {uri ? (
          <p className="muted mt-1 break-all text-xs">
            Or use this URI directly: <span className="tabular select-all">{uri}</span>
          </p>
        ) : null}
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="enrol-code" className="overline mb-1 block">
            2. Enter the code it shows
          </label>
          <input
            id="enrol-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className={`${INPUT} tabular w-36 text-center text-lg tracking-widest`}
          />
        </div>
        <Submit label="Confirm enrolment" />
        <div className="w-full">
          <Result state={state} />
        </div>
      </form>
    </div>
  );
}

/** Enrol a signing key. */
export function SigningKeyForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <form action={formAction} className="max-w-md space-y-3">
      <p className="muted text-sm">
        Your signing key proves that an act in the ledger was yours. The private half is sealed
        under a passphrase the server never learns, so a stolen database cannot sign in your name —
        and you can truthfully deny an act you did not authorise.
      </p>
      <div>
        <label htmlFor="key-label" className="overline mb-1 block">
          Label
        </label>
        <input id="key-label" name="label" className={INPUT} placeholder="e.g. Registrar General, 2026" />
      </div>
      <div>
        <label htmlFor="key-pass" className="overline mb-1 block">
          Signing passphrase
        </label>
        <input
          id="key-pass"
          name="passphrase"
          type="password"
          autoComplete="new-password"
          className={INPUT}
        />
        {state.fieldErrors?.passphrase ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.passphrase}</p>
        ) : null}
        <p className="muted mt-1 text-xs">
          Different from your account password, and at least twelve characters. If it is lost the key
          cannot be recovered — that is the design.
        </p>
      </div>
      <div>
        <label htmlFor="key-confirm" className="overline mb-1 block">
          Confirm passphrase
        </label>
        <input
          id="key-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={INPUT}
        />
      </div>
      <Submit label="Enrol signing key" />
      <Result state={state} />
    </form>
  );
}

export function RevokeKeyForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-[13px] font-medium">Revoke this key</summary>
      <form action={formAction} className="mt-2 max-w-md space-y-2">
        <input
          name="reason"
          className={INPUT}
          placeholder="Why — e.g. passphrase forgotten; officer left the commission."
          aria-label="Reason"
        />
        <p className="muted text-xs">
          Signatures made before revocation stay valid and verifiable. Revocation is forward-looking.
        </p>
        <Submit label="Revoke" tone="danger" />
        <Result state={state} />
      </form>
    </details>
  );
}

export function ReverseJournalForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  return (
    <details className="mt-3 border-t border-[var(--rule)] pt-2">
      <summary className="cursor-pointer text-[13px] font-medium">
        Reverse this entry
        <span className="muted ml-2 font-normal">— posts a mirror entry; both remain</span>
      </summary>
      <form action={formAction} className="mt-2 max-w-lg space-y-2">
        <input
          name="reason"
          className={INPUT}
          placeholder="Why the entry was wrong."
          aria-label="Reason"
        />
        <Submit label="Post reversal" tone="danger" />
        <Result state={state} />
      </form>
    </details>
  );
}

export function AuthResultForm({
  action,
  label,
  fields,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  label: string;
  fields: { name: string; label: string; type?: string; placeholder?: string }[];
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  return (
    <form action={formAction} className="max-w-md space-y-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`f-${field.name}`} className="overline mb-1 block">
            {field.label}
          </label>
          <input
            id={`f-${field.name}`}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className={INPUT}
          />
        </div>
      ))}
      <Submit label={label} />
      <Result state={state} />
    </form>
  );
}
