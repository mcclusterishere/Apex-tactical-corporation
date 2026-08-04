import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Panel, EmptyState, Caution } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Identity claims" };
export const dynamic = "force-dynamic";

const TONE: Record<string, string> = {
  Approved: "text-[var(--good)]",
  Declined: "text-seal-700 dark:text-seal-300",
};

export default async function ClaimsPage() {
  const principal = await getPrincipal();

  // Claims carry personal data supplied by members of the public. Only officers
  // who can amend records may see the queue at all.
  if (!can(principal.role, "record:amend")) {
    return (
      <>
        <PageHeader overline="Office" title="Identity claims" />
        <EmptyState title="Not available to you">You do not hold the power to see identity claims.</EmptyState>
      </>
    );
  }

  const claims = await prisma.identityClaim.findMany({
    orderBy: [{ reviewState: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { reviewedBy: { select: { displayName: true } } },
  });

  const pending = claims.filter((c) => c.reviewState === "PENDING");
  const decided = claims.filter((c) => c.reviewState !== "PENDING");

  return (
    <>
      <PageHeader
        overline="Office"
        title="Identity claims"
        lede="People who have come forward and proved who they are. Verification is not admission: nothing here enrols anyone until an officer says so."
      />

      <Caution title="Handle as member data">
        These rows carry names and, where a check passed, the type and country of a government
        document. They are not published, not exported, and not discussed outside the Office.
      </Caution>

      <Panel title={`Awaiting a decision (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState title="Nothing is waiting">Every claim that has come in has been decided.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="py-2 font-medium">Claimed name</th>
                <th className="py-2 font-medium">Verified as</th>
                <th className="py-2 font-medium">Check</th>
                <th className="py-2 font-medium">Document</th>
                <th className="py-2 font-medium">Opened</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((c) => (
                <tr key={c.id} className="border-b border-[var(--rule)]">
                  <td className="py-2">
                    <Link href={`/claims/${c.id}`} className="underline">
                      {c.claimedName}
                    </Link>
                    {c.claimedEmail ? (
                      <span className="muted block text-xs">{c.claimedEmail}</span>
                    ) : null}
                  </td>
                  <td className="py-2">
                    {c.verifiedGivenName || c.verifiedFamilyName
                      ? `${c.verifiedGivenName ?? ""} ${c.verifiedFamilyName ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className={`py-2 ${TONE[c.status] ?? ""}`}>{c.status}</td>
                  <td className="py-2">
                    {c.documentType ? `${c.documentType}${c.documentCountry ? ` · ${c.documentCountry}` : ""}` : "—"}
                  </td>
                  <td className="py-2 tabular">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title={`Decided (${decided.length})`}>
        {decided.length === 0 ? (
          <EmptyState title="No decisions yet">Claims appear here once an officer has accepted or refused them.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="py-2 font-medium">Claimed name</th>
                <th className="py-2 font-medium">Check</th>
                <th className="py-2 font-medium">Decision</th>
                <th className="py-2 font-medium">By</th>
                <th className="py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {decided.map((c) => (
                <tr key={c.id} className="border-b border-[var(--rule)]">
                  <td className="py-2">
                    <Link href={`/claims/${c.id}`} className="underline">
                      {c.claimedName}
                    </Link>
                  </td>
                  <td className={`py-2 ${TONE[c.status] ?? ""}`}>{c.status}</td>
                  <td className="py-2">{c.reviewState}</td>
                  <td className="py-2">{c.reviewedBy?.displayName ?? "—"}</td>
                  <td className="py-2 tabular">{c.reviewedAt ? formatDate(c.reviewedAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
