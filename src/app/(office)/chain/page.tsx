import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { verifyChain, getChainHead, verifyRecordsAgainstLedger } from "@/lib/chain";
import { visibleClassifications } from "@/lib/queries";
import { PageHeader, Panel, Stat, ButtonLink, Caution, EmptyState } from "@/components/ui";
import { AnchorForm } from "@/components/AnchorForm";
import { recordAnchorAction } from "@/app/actions/chain";
import { formatTimestamp, formatDate, shortHash } from "@/lib/format";

export const metadata: Metadata = { title: "The ledger chain" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

export default async function ChainPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const principal = await getPrincipal();
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [verification, divergences, head, anchors, total] = await Promise.all([
    verifyChain(),
    verifyRecordsAgainstLedger(),
    getChainHead(),
    prisma.chainAnchor.findMany({ orderBy: { sequence: "desc" }, take: 12 }),
    prisma.ledgerEntry.count(),
  ]);

  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { sequence: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      record: {
        select: { id: true, recordNumber: true, title: true, classification: true },
      },
    },
  });

  const readable = new Set(visibleClassifications(principal));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const unanchored = head ? head.sequence - (verification.lastAnchoredSequence ?? 0) : 0;

  return (
    <>
      <PageHeader
        overline="Integrity"
        title="The ledger chain"
        lede="Every act of the Registrar is committed here as a link bound by hash to the link before it. Altering any historical entry changes every hash after it, and this page recomputes all of them from scratch on each load."
        actions={<ButtonLink href="/verify">Public verification</ButtonLink>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Chain state"
          value={verification.ok && divergences.length === 0 ? "Intact" : "Broken"}
          detail={`${verification.entriesChecked.toLocaleString()} entries recomputed, registers reconciled`}
          tone={verification.ok && divergences.length === 0 ? "success" : "danger"}
        />
        <Stat
          label="Head position"
          value={head ? `#${head.sequence.toLocaleString()}` : "—"}
          detail={head ? formatTimestamp(head.createdAt) : "The ledger has not been opened"}
        />
        <Stat
          label="Last anchored"
          value={
            verification.lastAnchoredSequence ? `#${verification.lastAnchoredSequence}` : "Never"
          }
          detail={
            verification.lastAnchoredAt
              ? formatDate(verification.lastAnchoredAt)
              : "No external publication on record"
          }
          tone={verification.lastAnchoredSequence ? "success" : "warning"}
        />
        <Stat
          label="Unanchored"
          value={unanchored.toLocaleString()}
          detail="Entries whose dates rest on internal attestation alone"
          tone={unanchored > 25 ? "warning" : "default"}
        />
      </div>

      {!verification.ok ? (
        <Panel title="Integrity failures" tone="seal">
          <p className="mb-3 text-sm">
            The chain does not recompute. Preserve the current database exactly as it is before
            making any further writes — the pattern of failures is itself evidence of what happened.
          </p>
          <ul className="space-y-2 text-sm">
            {verification.issues.slice(0, 40).map((issue, index) => (
              <li key={index} className="border-l-[3px] border-seal-600 pl-3">
                <span className="tabular">#{issue.sequence}</span>{" "}
                <strong>{issue.problem.replaceAll("_", " ").toLowerCase()}</strong>
                <span className="muted block text-xs">{issue.detail}</span>
              </li>
            ))}
          </ul>
          {verification.issues.length > 40 ? (
            <p className="muted mt-3 text-xs">
              {verification.issues.length - 40} further issues not shown. Run{" "}
              <code className="tabular">npm run chain:verify</code> for the full report.
            </p>
          ) : null}
        </Panel>
      ) : null}

      {divergences.length > 0 ? (
        <Panel title="Registers diverge from the ledger" tone="seal">
          <p className="mb-3 text-sm">
            The chain itself may be intact, but {divergences.length}{" "}
            {divergences.length === 1 ? "field does" : "fields do"} not match the state committed to
            it. That pattern means a record was altered directly against the database rather than
            through this application. The ledger is authoritative: what it committed is what the
            Kingdom recorded.
          </p>
          <ul className="space-y-2 text-sm">
            {divergences.slice(0, 30).map((divergence, index) => (
              <li key={index} className="border-l-[3px] border-seal-600 pl-3">
                <Link
                  href={`/record/${divergence.recordId}`}
                  className="tabular underline underline-offset-2"
                >
                  {divergence.recordNumber}
                </Link>{" "}
                <strong>{divergence.field}</strong>
                <span className="muted block text-xs">
                  register: {divergence.inRegister}
                </span>
                <span className="muted block text-xs">ledger: {divergence.inLedger}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {head && !verification.lastAnchoredSequence ? (
        <div className="mb-6">
          <Caution title="Anchor the chain, or its dates prove nothing">
            An internal hash chain proves the register has not been rewritten <em>relative to
            itself</em>. It cannot prove <em>when</em> anything was recorded, because whoever holds
            the database could regenerate the whole chain with different dates. Publishing the head
            hash somewhere the Kingdom does not control — the gazette, a certified letter mailed to
            the Registrar, a public repository commit, or an RFC 3161 timestamp authority — fixes
            every entry at or below that position as provably older than the publication date.
            Anchor monthly at minimum, and before sending any demand that relies on a recording
            date.
          </Caution>
        </div>
      ) : null}

      {head && can(principal.role, "chain:anchor") ? (
        <Panel
          title="Record an external anchor"
          description="After publishing the head hash somewhere outside the Kingdom's control, record where and how"
        >
          <div className="mb-4 border border-[var(--rule)] px-3 py-2.5">
            <p className="overline">Current head hash — this is the value to publish</p>
            <p className="digest mt-1 select-all">{head.entryHash}</p>
            <p className="muted mt-1 text-xs">
              Position #{head.sequence}, committed {formatTimestamp(head.createdAt)}.
            </p>
          </div>
          <AnchorForm action={recordAnchorAction} sequence={head.sequence} headHash={head.entryHash} />
        </Panel>
      ) : null}

      {anchors.length > 0 ? (
        <Panel title="Anchors on record">
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Position</th>
                  <th className="overline pb-1.5 pr-3">Method</th>
                  <th className="overline pb-1.5 pr-3">Reference</th>
                  <th className="overline pb-1.5 pr-3">Anchored</th>
                  <th className="overline pb-1.5">Head hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {anchors.map((anchor) => (
                  <tr key={anchor.id}>
                    <td className="tabular py-2 pr-3">#{anchor.sequence}</td>
                    <td className="py-2 pr-3">{anchor.method.replaceAll("_", " ").toLowerCase()}</td>
                    <td className="tabular py-2 pr-3 text-xs">{anchor.externalRef ?? "—"}</td>
                    <td className="tabular muted whitespace-nowrap py-2 pr-3 text-xs">
                      {formatDate(anchor.anchoredAt)}
                    </td>
                    <td className="tabular muted py-2 text-xs" title={anchor.headHash}>
                      {shortHash(anchor.headHash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Ledger entries"
        description={`${total.toLocaleString()} committed, most recent first`}
      >
        {entries.length === 0 ? (
          <EmptyState title="The ledger has not been opened">
            The first entry is written when the first record is created, or when the seed is run.
          </EmptyState>
        ) : (
          <>
            <div className="scroll-x">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rule-strong)]">
                    <th className="overline pb-1.5 pr-3">Seq</th>
                    <th className="overline pb-1.5 pr-3">Act</th>
                    <th className="overline pb-1.5 pr-3">Subject</th>
                    <th className="overline pb-1.5 pr-3">By</th>
                    <th className="overline pb-1.5 pr-3">Committed</th>
                    <th className="overline pb-1.5">Entry hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {entries.map((entry) => {
                    const subjectVisible =
                      entry.record !== null && readable.has(entry.record.classification);
                    return (
                      <tr key={entry.id}>
                        <td className="tabular py-2 pr-3 align-top">#{entry.sequence}</td>
                        <td className="py-2 pr-3 align-top">
                          {entry.eventType.replaceAll("_", " ").toLowerCase()}
                        </td>
                        <td className="py-2 pr-3 align-top">
                          {entry.record ? (
                            subjectVisible ? (
                              <Link
                                href={`/record/${entry.record.id}`}
                                className="tabular underline underline-offset-2"
                              >
                                {entry.record.recordNumber}
                              </Link>
                            ) : (
                              <span className="muted text-xs">restricted</span>
                            )
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td className="muted py-2 pr-3 align-top text-xs">{entry.actorLabel}</td>
                        <td className="tabular muted whitespace-nowrap py-2 pr-3 align-top text-xs">
                          {formatTimestamp(entry.createdAt)}
                        </td>
                        <td
                          className="tabular muted py-2 align-top text-xs"
                          title={entry.entryHash}
                        >
                          {shortHash(entry.entryHash)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pages > 1 ? (
              <nav className="no-print mt-4 flex items-center justify-between text-sm">
                <span className="muted">
                  Page {page} of {pages}
                </span>
                <span className="flex gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/chain?page=${page - 1}`}
                      className="rounded-sm border border-[var(--rule-strong)] px-3 py-1"
                    >
                      Newer
                    </Link>
                  ) : null}
                  {page < pages ? (
                    <Link
                      href={`/chain?page=${page + 1}`}
                      className="rounded-sm border border-[var(--rule-strong)] px-3 py-1"
                    >
                      Older
                    </Link>
                  ) : null}
                </span>
              </nav>
            ) : null}
          </>
        )}
      </Panel>
    </>
  );
}
