import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, asRole, permissionsOf } from "@/lib/authz";
import { CLASSIFICATION_DESCRIPTIONS } from "@/lib/classification";
import { PageHeader, Panel, Field, Caution } from "@/components/ui";
import { PasswordForm } from "@/components/PasswordForm";
import { changePasswordAction } from "@/app/actions/auth";
import {
  TotpEnrolment,
  MfaPrompt,
  StepUpPrompt,
  SigningKeyForm,
  RevokeKeyForm,
} from "@/components/SecurityForms";
import {
  beginTotpEnrolmentAction,
  confirmTotpEnrolmentAction,
  verifyMfaAction,
  stepUpAction,
  enrolSigningKeyAction,
  revokeSigningKeyAction,
} from "@/app/actions/security";
import { shortFingerprint } from "@/lib/signing";
import { formatTimestamp, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Faccount");

  const role = asRole(principal.role);
  const [sessions, keys, recoveryRemaining] = await Promise.all([
    prisma.session.findMany({
      where: { userId: principal.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.signingKey.findMany({
      where: { userId: principal.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recoveryCode.count({ where: { userId: principal.id, usedAt: null } }),
  ]);
  const activeKey = keys.find((key) => key.revokedAt === null) ?? null;

  return (
    <>
      <PageHeader
        overline="Your commission"
        title={principal.displayName}
        lede={principal.officeTitle ?? ROLE_LABELS[role]}
      />

      {principal.mustResetPw ? (
        <div className="mb-6">
          <Caution title="Change your password now">
            This account is still using the password it was issued with. Whoever issued it knows
            that password, and it has almost certainly travelled through an email inbox. Change it
            before recording anything — every act you take is attributed to you in the ledger, and
            attribution is only worth something if nobody else can sign in as you.
          </Caution>
        </div>
      ) : null}

      {principal.mfaEnrolled && !principal.mfaSatisfied ? (
        <Panel title="Confirm your second factor" tone="caution">
          <p className="muted mb-3 text-sm">
            This session has not presented your authenticator. You can read what you are cleared to
            read, but you cannot record anything until you do.
          </p>
          <MfaPrompt action={verifyMfaAction} />
        </Panel>
      ) : null}

      <Panel
        title="Second factor"
        description={
          principal.mfaEnrolled
            ? `Enrolled. ${recoveryRemaining} recovery ${recoveryRemaining === 1 ? "code" : "codes"} unused.`
            : "Not enrolled. A stolen password is currently enough to act as you."
        }
        tone={principal.mfaEnrolled ? "default" : "caution"}
      >
        {principal.mfaEnrolled ? (
          <p className="muted text-sm">
            An authenticator is enrolled on this account. To replace it, revoke and re-enrol — which
            invalidates the existing recovery codes.
          </p>
        ) : (
          <TotpEnrolment begin={beginTotpEnrolmentAction} confirm={confirmTotpEnrolmentAction} />
        )}
      </Panel>

      <Panel
        title="Signing key"
        description={
          activeKey
            ? "Acts you sign can be attributed to you cryptographically, and acts you did not sign cannot."
            : "Without a key, the ledger records your name against an act but cannot prove it was you."
        }
      >
        {activeKey ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Fingerprint">
                <span className="tabular text-xs">{shortFingerprint(activeKey.fingerprint)}</span>
                <span className="digest muted mt-0.5 block">{activeKey.fingerprint}</span>
              </Field>
              <Field label="Enrolled">{formatDate(activeKey.createdAt)}</Field>
              <Field label="Label" wide>
                {activeKey.label ?? <span className="muted">none</span>}
              </Field>
            </dl>
            <RevokeKeyForm action={revokeSigningKeyAction.bind(null, activeKey.id)} />
          </>
        ) : (
          <SigningKeyForm action={enrolSigningKeyAction} />
        )}

        {keys.filter((key) => key.revokedAt).length > 0 ? (
          <div className="mt-4 border-t border-[var(--rule)] pt-3">
            <p className="overline mb-1">Revoked keys</p>
            <ul className="muted space-y-1 text-xs">
              {keys
                .filter((key) => key.revokedAt)
                .map((key) => (
                  <li key={key.id}>
                    <span className="tabular">{shortFingerprint(key.fingerprint)}</span> — revoked{" "}
                    {formatDate(key.revokedAt)}
                    {key.revokedReason ? ` (${key.revokedReason})` : ""}
                  </li>
                ))}
            </ul>
            <p className="muted mt-2 text-xs">
              Retained so signatures made before revocation stay verifiable.
            </p>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Step-up authentication"
        description={
          principal.stepUpValid
            ? "Active. Consequential actions are available."
            : "Required before moving money, issuing or revoking credentials, or unsealing material."
        }
      >
        {principal.stepUpValid ? (
          <p className="muted text-sm">
            You re-authenticated recently. This lapses automatically after fifteen minutes.
          </p>
        ) : (
          <StepUpPrompt action={stepUpAction} />
        )}
      </Panel>

      <Panel title="Change your password">
        <PasswordForm action={changePasswordAction} />
      </Panel>

      <Panel title="What this commission carries">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Office">{ROLE_LABELS[role]}</Field>
          <Field label="Clearance">{principal.clearance}</Field>
          <Field label="Email">{principal.email}</Field>
          <Field label="Clearance means" wide>
            {CLASSIFICATION_DESCRIPTIONS[principal.clearance]}
          </Field>
          <Field label="Description" wide>
            {ROLE_DESCRIPTIONS[role]}
          </Field>
          <Field label="Powers" wide>
            {permissionsOf(role).length === 0 ? (
              <span className="muted">Read-only. This office records nothing.</span>
            ) : (
              <span className="flex flex-wrap gap-1">
                {permissionsOf(role).map((permission) => (
                  <span
                    key={permission}
                    className="tabular rounded-sm border border-[var(--rule-strong)] px-1.5 py-0.5 text-xs"
                  >
                    {permission}
                  </span>
                ))}
              </span>
            )}
          </Field>
        </dl>
      </Panel>

      <Panel
        title="Active sessions"
        description="Changing your password signs out every session but the one you are using"
      >
        <ul className="divide-y divide-[var(--rule)]">
          {sessions.map((session) => (
            <li key={session.id} className="py-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="tabular text-xs">{session.ip ?? "address not recorded"}</span>
                <span className="muted text-xs">
                  started {formatTimestamp(session.createdAt)} · expires{" "}
                  {formatTimestamp(session.expiresAt)}
                </span>
              </div>
              {session.userAgent ? (
                <p className="muted mt-0.5 text-xs">{session.userAgent}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
