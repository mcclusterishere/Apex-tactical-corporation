import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLES, asRole } from "@/lib/authz";
import { PageHeader, Panel, Caution } from "@/components/ui";
import { PrincipalForm } from "@/components/PrincipalForm";
import { createPrincipalAction } from "@/app/actions/auth";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Principals & offices" };
export const dynamic = "force-dynamic";

export default async function PrincipalsPage() {
  const principal = await getPrincipal();
  if (!can(principal.role, "user:manage")) {
    return (
      <PageHeader
        overline="Administration"
        title="Principals &amp; offices"
        lede="Administering accounts is reserved to the Sovereign."
      />
    );
  }

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { displayName: "asc" }],
  });

  return (
    <>
      <PageHeader
        overline="Administration"
        title="Principals &amp; offices"
        lede="Accounts in this system, and the powers each carries. An account here should correspond to a commission recorded in the Register of Offices."
      />

      <div className="mb-6">
        <Caution title="One officer, one account">
          Shared logins destroy the audit trail, and the audit trail is most of what makes this
          register worth more than a filing cabinet. If two people need access, issue two accounts.
          If someone leaves, deactivate rather than delete — their historical acts must remain
          attributable.
        </Caution>
      </div>

      <Panel title={`${users.length} ${users.length === 1 ? "principal" : "principals"}`}>
        <div className="scroll-x">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rule-strong)]">
                <th className="overline pb-1.5 pr-3">Name</th>
                <th className="overline pb-1.5 pr-3">Email</th>
                <th className="overline pb-1.5 pr-3">Office</th>
                <th className="overline pb-1.5 pr-3">Role</th>
                <th className="overline pb-1.5 pr-3">Last sign-in</th>
                <th className="overline pb-1.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)]">
              {users.map((user) => (
                <tr key={user.id} className={user.active ? undefined : "opacity-60"}>
                  <td className="py-2 pr-3">{user.displayName}</td>
                  <td className="tabular py-2 pr-3 text-xs">{user.email}</td>
                  <td className="muted py-2 pr-3 text-xs">{user.officeTitle ?? "—"}</td>
                  <td className="py-2 pr-3 text-xs">{ROLE_LABELS[asRole(user.role)]}</td>
                  <td className="tabular muted whitespace-nowrap py-2 pr-3 text-xs">
                    {user.lastLoginAt ? formatTimestamp(user.lastLoginAt) : "never"}
                  </td>
                  <td className="py-2 text-xs">
                    {user.active ? "Active" : "Inactive"}
                    {user.mustResetPw ? (
                      <span className="muted block">must change password</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Commission a principal"
        description="Issue an account. The holder must change the password at first sign-in."
      >
        <PrincipalForm action={createPrincipalAction} />
      </Panel>

      <Panel title="The offices and what they carry">
        <dl className="space-y-3">
          {ROLES.map((role) => (
            <div key={role}>
              <dt className="text-sm font-semibold">{ROLE_LABELS[role]}</dt>
              <dd className="muted text-sm">{ROLE_DESCRIPTIONS[role]}</dd>
            </div>
          ))}
        </dl>
        <p className="muted mt-4 text-xs">
          The separation between these offices is deliberate. The Auditor exists so that someone can
          examine the register who has no power to alter it — an arrangement that is worth very
          little until the day it is worth everything.
        </p>
      </Panel>
    </>
  );
}
