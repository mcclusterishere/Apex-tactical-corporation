import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { getChainHead } from "@/lib/chain";
import { PageHeader, Panel, EmptyState } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { GazetteForm } from "@/components/GazetteForm";
import { publishGazetteAction } from "@/app/actions/gazette";
import { formatDate, formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Official gazette" };
export const dynamic = "force-dynamic";

/**
 * The gazette.
 *
 * Publication does work that internal recording does not: it puts the world on
 * notice. An outside party who later claims not to have known of an instrument,
 * a name, or a claim has a harder time saying so when it was published, dated,
 * and numbered in a serial the Kingdom has kept continuously.
 *
 * Each issue carries the ledger head hash at the moment of publication. That
 * makes the gazette itself a lightweight anchoring mechanism — weaker than an
 * external timestamp because the Kingdom controls the gazette, but a real
 * improvement over nothing, and free.
 */
export default async function GazettePage() {
  const principal = await getPrincipal();
  const [issues, head] = await Promise.all([
    prisma.gazetteIssue.findMany({ orderBy: { number: "desc" }, take: 50 }),
    getChainHead(),
  ]);

  return (
    <>
      <PageHeader
        overline="Published by authority"
        title="The Apex Kingdom Gazette"
        lede="The Kingdom's serial of record. Instruments promulgated, offices filled, claims asserted, and the state of the ledger, published and dated."
      />

      {can(principal.role, "gazette:publish") ? (
        <Panel
          title="Publish an issue"
          description={
            head
              ? `The current chain head (#${head.sequence}) will be printed in the issue, fixing a public, dated commitment to the state of the register.`
              : "The ledger is empty; the issue will carry no chain head."
          }
        >
          <GazetteForm action={publishGazetteAction} />
        </Panel>
      ) : null}

      {issues.length === 0 ? (
        <EmptyState title="No issues published">
          The gazette begins with its first issue. Publishing an instrument here is what creates
          public, dated notice of it.
        </EmptyState>
      ) : (
        issues.map((issue) => (
          <article
            key={issue.id}
            className="surface avoid-break mb-6 rounded-sm border border-[var(--rule)]"
          >
            <header className="border-b border-[var(--rule)] px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">
                  <span className="tabular muted mr-2">No. {issue.number}</span>
                  {issue.title}
                </h2>
                <span className="muted tabular text-xs">{formatDate(issue.publishedAt)}</span>
              </div>
              {issue.summary ? <p className="muted mt-1 text-sm">{issue.summary}</p> : null}
            </header>
            <div className="px-4 py-4">
              <Markdown source={issue.body} />
            </div>
            {issue.chainHead ? (
              <footer className="border-t border-[var(--rule)] px-4 py-2.5">
                <p className="overline">
                  Ledger head at publication — position #{issue.chainSeq}
                </p>
                <p className="digest mt-0.5">{issue.chainHead}</p>
                <p className="muted mt-1 text-xs">
                  Published {formatTimestamp(issue.publishedAt)}. Every ledger entry at or below
                  this position existed as of that date.
                </p>
              </footer>
            ) : null}
          </article>
        ))
      )}
    </>
  );
}
