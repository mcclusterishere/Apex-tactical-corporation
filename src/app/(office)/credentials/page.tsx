import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { CREDENTIAL_TYPES, CREDENTIAL_TYPE_LABELS, CREDENTIAL_TYPE_HELP, type CredentialType } from "@/lib/credentials";
import { PageHeader, Panel, Stat, EmptyState, Caution, ButtonLink } from "@/components/ui";
import { CredentialForm, RevokeCredentialForm } from "@/components/CredentialForms";
import { issueCredentialAction, revokeCredentialAction } from "@/app/actions/credentials";
import { StepUpPrompt } from "@/components/SecurityForms";
import { stepUpAction } from "@/app/actions/security";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Credentials" };
export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) {
    return (
      <PageHeader
        overline="Identity"
        title="Credentials"
        lede="Sign in to see the credentials the Kingdom has issued. Anyone may check a single credential without an account."
      />
    );
  }

  const mayIssue = can(principal.role, "record:certify") || principal.role === "SOVEREIGN";

  const [credentials, active, revoked, citizens] = await Promise.all([
    prisma.credential.findMany({ orderBy: { issuedAt: "desc" }, take: 100 }),
    prisma.credential.count({ where: { status: "ACTIVE" } }),
    prisma.credential.count({ where: { status: "REVOKED" } }),
    prisma.record.findMany({
      where: { registry: "citizens", voidedAt: null },
      orderBy: { title: "asc" },
      take: 500,
      select: { id: true, recordNumber: true, title: true },
    }),
  ]);

  const expiringSoon = credentials.filter(
    (c) =>
      c.status === "ACTIVE" &&
      c.expiresAt &&
      c.expiresAt.getTime() - Date.now() < 30 * 86_400_000 &&
      c.expiresAt.getTime() > Date.now(),
  ).length;

  return (
    <>
      <PageHeader
        overline="Identity"
        title="Credentials of the Kingdom"
        lede="Credentials attest to a person's standing within Apex Kingdom. They are not government identification and confer no authority outside it."
        actions={<ButtonLink href="/credentials/verify">Check a credential</ButtonLink>}
      />

      <div className="mb-6">
        <Caution title="What these credentials are, and the line that must not be crossed">
          A credential of the Kingdom is lawful in exactly the way a union card, a parish membership
          card, or a professional association card is lawful. Anything resembling government
          identification or a law-enforcement credential is criminal impersonation under Conn. Gen.
          Stat. §§ 53a-130 and 53a-130a, with federal exposure under 18 U.S.C. §§ 701 and 912 for
          badges and insignia. This system refuses to issue a credential whose text contains such
          terms — that refusal protects the officer who would otherwise have signed it.
        </Caution>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Active" value={active} />
        <Stat
          label="Expiring within 30 days"
          value={expiringSoon}
          tone={expiringSoon > 0 ? "warning" : "default"}
        />
        <Stat label="Revoked" value={revoked} detail="Retained; revocation is the record" />
      </div>

      {mayIssue && !principal.stepUpValid ? (
        <Panel
          title="Re-authenticate to issue"
          description="Issuing a credential creates apparent authority in the world. It requires your password again."
        >
          <StepUpPrompt action={stepUpAction} />
        </Panel>
      ) : null}

      {mayIssue ? (
        <Panel title="Issue a credential">
          <CredentialForm
            action={issueCredentialAction}
            types={CREDENTIAL_TYPES.map((type) => ({
              value: type,
              label: CREDENTIAL_TYPE_LABELS[type],
              help: CREDENTIAL_TYPE_HELP[type],
            }))}
            citizens={citizens}
          />
        </Panel>
      ) : null}

      <Panel title="Issued" description={`${credentials.length} shown, most recent first`}>
        {credentials.length === 0 ? (
          <EmptyState title="No credentials issued" />
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Number</th>
                  <th className="overline pb-1.5 pr-3">Holder</th>
                  <th className="overline pb-1.5 pr-3">Type</th>
                  <th className="overline pb-1.5 pr-3">Issued</th>
                  <th className="overline pb-1.5 pr-3">Expires</th>
                  <th className="overline pb-1.5 pr-3">Status</th>
                  <th className="overline pb-1.5">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {credentials.map((credential) => (
                  <tr
                    key={credential.id}
                    className={credential.status === "ACTIVE" ? undefined : "opacity-60"}
                  >
                    <td className="tabular py-2 pr-3">
                      <Link href={`/credentials/${credential.id}`} className="underline underline-offset-2">
                        {credential.credentialNumber}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{credential.subjectName}</td>
                    <td className="muted py-2 pr-3 text-xs">
                      {CREDENTIAL_TYPE_LABELS[credential.type as CredentialType] ?? credential.type}
                    </td>
                    <td className="tabular muted py-2 pr-3 text-xs">
                      {formatDate(credential.issuedAt)}
                    </td>
                    <td className="tabular muted py-2 pr-3 text-xs">
                      {credential.expiresAt ? formatDate(credential.expiresAt) : "—"}
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {credential.status === "ACTIVE" ? (
                        <span className="text-moss-700 dark:text-moss-100">active</span>
                      ) : (
                        <span className="text-seal-600">{credential.status.toLowerCase()}</span>
                      )}
                    </td>
                    <td className="tabular muted py-2 text-xs">{credential.verificationCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {mayIssue && credentials.some((c) => c.status === "ACTIVE") ? (
        <Panel title="Revoke a credential" tone="caution">
          <RevokeCredentialForm
            credentials={credentials
              .filter((c) => c.status === "ACTIVE")
              .map((c) => ({
                id: c.id,
                label: `${c.credentialNumber} — ${c.subjectName}`,
              }))}
            action={revokeCredentialAction}
          />
        </Panel>
      ) : null}
    </>
  );
}
