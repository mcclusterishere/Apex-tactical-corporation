import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { formatCents } from "@/lib/treasury";
import { PageHeader, Panel, EmptyState, ButtonLink } from "@/components/ui";
import { formatDate, formatTimestamp, oneParam } from "@/lib/format";
import { ReverseJournalForm } from "@/components/SecurityForms";
import { reverseJournalAction } from "@/app/actions/treasury";

export const metadata: Metadata = { title: "Journal" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getPrincipal();
  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";
  const mayRead = mayKeep || can(principal.role, "audit:read");

  if (!isAuthenticated(principal) || !mayRead) {
    return (
      <PageHeader
        overline="Treasury"
        title="Not within your commission"
        lede="The journal is read by the Treasurer, the Sovereign, and the Auditor."
      />
    );
  }

  const pageRaw = oneParam((await searchParams).page);
  const page = Math.max(1, Number(pageRaw) || 1);

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      orderBy: [{ date: "desc" }, { entryNumber: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        postings: { include: { account: true, fund: true }, orderBy: { sequence: "asc" } },
        reverses: { select: { entryNumber: true } },
        reversedBy: { select: { entryNumber: true } },
      },
    }),
    prisma.journalEntry.count(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        overline="Treasury"
        title="The journal"
        lede="Every entry in the order posted. Nothing here is edited; a correction is a reversal, and both remain."
        actions={mayKeep ? <ButtonLink href="/treasury/new" tone="primary">Post an entry</ButtonLink> : undefined}
      />

      {entries.length === 0 ? (
        <EmptyState title="The journal is empty">
          Post the first entry from the treasury.
        </EmptyState>
      ) : (
        entries.map((entry) => {
          const amount = entry.postings.reduce((sum, p) => sum + p.debitCents, 0);
          return (
            <Panel
              key={entry.id}
              title={`${entry.entryNumber} — ${entry.memo}`}
              description={`${formatDate(entry.date)} · ${formatCents(amount)} · ${entry.status.toLowerCase()}${
                entry.reference ? ` · ref ${entry.reference}` : ""
              }`}
              tone={entry.status === "REVERSED" ? "caution" : "default"}
            >
              {entry.reverses ? (
                <p className="muted mb-2 text-xs">Reverses {entry.reverses.entryNumber}.</p>
              ) : null}
              {entry.reversedBy ? (
                <p className="muted mb-2 text-xs">Reversed by {entry.reversedBy.entryNumber}.</p>
              ) : null}

              <div className="scroll-x">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--rule)]">
                      <th className="overline pb-1 pr-3">Account</th>
                      <th className="overline pb-1 pr-3">Fund</th>
                      <th className="overline pb-1 pr-3 text-right">Debit</th>
                      <th className="overline pb-1 pr-3 text-right">Credit</th>
                      <th className="overline pb-1">Memo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)]">
                    {entry.postings.map((posting) => (
                      <tr key={posting.id}>
                        <td className="py-1.5 pr-3">
                          <span className="tabular">{posting.account.code}</span> {posting.account.name}
                        </td>
                        <td className="tabular muted py-1.5 pr-3 text-xs">
                          {posting.fund?.code ?? "—"}
                        </td>
                        <td className="tabular py-1.5 pr-3 text-right">
                          {posting.debitCents ? formatCents(posting.debitCents) : ""}
                        </td>
                        <td className="tabular py-1.5 pr-3 text-right">
                          {posting.creditCents ? formatCents(posting.creditCents) : ""}
                        </td>
                        <td className="muted py-1.5 text-xs">{posting.memo ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="muted mt-2 text-xs">
                Posted {formatTimestamp(entry.postedAt)} by {entry.postedBy}
              </p>

              {mayKeep && entry.status === "POSTED" && !entry.reversedBy ? (
                <ReverseJournalForm action={reverseJournalAction.bind(null, entry.id)} />
              ) : null}
            </Panel>
          );
        })
      )}

      {pages > 1 ? (
        <nav className="flex items-center justify-between text-sm">
          <span className="muted">
            Page {page} of {pages}
          </span>
          <span className="flex gap-2">
            {page > 1 ? (
              <Link href={`/treasury/journal?page=${page - 1}`} className="rounded-sm border border-[var(--rule-strong)] px-3 py-1">
                Newer
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={`/treasury/journal?page=${page + 1}`} className="rounded-sm border border-[var(--rule-strong)] px-3 py-1">
                Older
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </>
  );
}
