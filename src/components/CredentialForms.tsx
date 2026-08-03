"use client";

import { useActionState, useState } from "react";
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
      className={`inline-flex items-center rounded-sm border px-4 py-1.5 text-[13px] font-medium disabled:opacity-60 ${
        tone === "danger"
          ? "border-seal-600 text-seal-700 hover:bg-seal-50 dark:text-seal-300 dark:hover:bg-seal-900/30"
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

export function CredentialForm({
  action,
  types,
  citizens,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  types: { value: string; label: string; help: string }[];
  citizens: { id: string; recordNumber: string; title: string }[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="overline mb-1.5">Type of credential</legend>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {types.map((type) => (
            <label key={type.value} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="type"
                value={type.value}
                defaultChecked={type.value === "MEMBERSHIP"}
                className="mt-1"
              />
              <span>
                {type.label}
                <span className="muted block text-xs">{type.help}</span>
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.type ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.type}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cred-subject" className="overline mb-1 block">
            Holder — from the Roll of Citizens
          </label>
          <select
            id="cred-subject"
            name="subjectRecordId"
            value={subjectId}
            onChange={(event) => {
              const id = event.target.value;
              setSubjectId(id);
              const match = citizens.find((c) => c.id === id);
              if (match) setName(match.title);
            }}
            className={INPUT}
          >
            <option value="">— not enrolled / external —</option>
            {citizens.map((citizen) => (
              <option key={citizen.id} value={citizen.id}>
                {citizen.recordNumber} · {citizen.title}
              </option>
            ))}
          </select>
          <p className="muted mt-1 text-xs">
            Tying a credential to an enrolment keeps standing and revocation linked to a real person.
          </p>
        </div>
        <div>
          <label htmlFor="cred-name" className="overline mb-1 block">
            Name as printed
          </label>
          <input
            id="cred-name"
            name="subjectName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT}
          />
          {state.fieldErrors?.subjectName ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.subjectName}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="cred-standing" className="overline mb-1 block">
          Standing as printed
        </label>
        <input
          id="cred-standing"
          name="standing"
          className={INPUT}
          placeholder="e.g. Citizen in good standing · Registrar General · Ordained Minister"
        />
        {state.fieldErrors?.standing ? (
          <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.standing}</p>
        ) : null}
        <p className="muted mt-1 text-xs">
          Describe standing within the Kingdom. Terms suggesting police, government identification,
          or diplomatic status are refused — that refusal is the protection, not an obstacle.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cred-from" className="overline mb-1 block">
            Effective from
          </label>
          <input id="cred-from" name="effectiveFrom" type="date" className={INPUT} />
        </div>
        <div>
          <label htmlFor="cred-until" className="overline mb-1 block">
            Expires
          </label>
          <input id="cred-until" name="expiresAt" type="date" className={INPUT} />
          {state.fieldErrors?.expiresAt ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.expiresAt}</p>
          ) : null}
          <p className="muted mt-1 text-xs">
            Set one. A credential with no expiry is one that never comes back.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="cred-pass" className="overline mb-1 block">
          Signing passphrase
        </label>
        <input
          id="cred-pass"
          name="signingPassphrase"
          type="password"
          autoComplete="off"
          className={INPUT}
        />
        <p className="muted mt-1 text-xs">
          Optional. Supplying it signs the credential under your key, so a forgery fails on
          signature rather than on appearance. Leave blank to issue unsigned.
        </p>
      </div>

      <Submit label="Issue credential" />
      <Result state={state} />
    </form>
  );
}

export function RevokeCredentialForm({
  credentials,
  action,
}: {
  credentials: { id: string; label: string }[];
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });

  // The target travels as a form field rather than a bound argument: a server
  // action cannot be re-bound on the client when the selection changes.
  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="revoke-pick" className="overline mb-1 block">
          Credential
        </label>
        <select id="revoke-pick" name="credentialId" className={INPUT} defaultValue={credentials[0]?.id ?? ""}>
          {credentials.map((credential) => (
            <option key={credential.id} value={credential.id}>
              {credential.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="revoke-reason" className="overline mb-1 block">
          Reason
        </label>
        <input
          id="revoke-reason"
          name="reason"
          className={INPUT}
          placeholder="e.g. Commission ended 3 March; card not returned."
        />
      </div>
      <Submit label="Revoke" tone="danger" />
      <Result state={state} />
    </form>
  );
}

export function CredentialLookupForm() {
  return (
    <form action="/credentials/verify" className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1">
        <label htmlFor="cred-code" className="overline mb-1 block">
          Verification code
        </label>
        <input
          id="cred-code"
          name="code"
          className={`${INPUT} tabular uppercase`}
          placeholder="XXXXX-XXXXX"
        />
      </div>
      <button
        type="submit"
        className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-sm font-medium text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      >
        Check
      </button>
    </form>
  );
}
