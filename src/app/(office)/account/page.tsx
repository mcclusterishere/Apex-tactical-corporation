import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, asRole, permissionsOf } from "@/lib/authz";
import { CLASSIFICATION_DESCRIPTIONS } from "@/lib/classification";
import { PageHeader, Panel, Field, Caution } from "@/components/ui";
import { PasswordForm } from "@/components/PasswordForm";
import { changePasswordAction } from "@/app/actions/auth";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Faccount");

  const role = asRole(principal.role);
  const sessions = await prisma.session.findMany({
    where: { userId: principal.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

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
