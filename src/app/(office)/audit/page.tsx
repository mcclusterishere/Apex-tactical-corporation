import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { canReadRecord } from "@/lib/access";
import { PageHeader, Panel, EmptyState, Caution } from "@/components/ui";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; actor?: string; action?: string }>;
}) {
  const principal = await getPrincipal();
  if (!can(principal.role, "audit:read")) {
    return (
      <>
        <PageHeader
          overline="Administration"
          title="Audit log"
          lede="Reading the audit log is reserved to the Sovereign, the Registrar, Counsel, and the Auditor."
        />
      </>
    );
  }

  const { page: pageRaw, actor, action } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const where = {
    ...(actor ? { actorLabel: { contains: actor } } : {}),
    ...(action ? { action: { contains: action } } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /*
   * Redact rows whose subject is a record the reader may not see.
   *
   * The audit log names records by number and carries free-text detail written
   * when the act was performed — an amendment reason, an evidence filename, a
   * hold's matter. Counsel holds `audit:read` but only OFFICERS clearance, so an
   * unfiltered log discloses the existence, the numbering, and often the content
   * of sealed records to an officer barred from opening them. Redaction happens
   * here rather than in the query because a subject is a record NUMBER, not an
   * id, and the join has to be resolved either way.
   */
  const subjects = [...new Set(events.map((e) => e.subject).filter((s): s is string => Boolean(s)))];
  const referenced = subjects.length
    ? await prisma.record.findMany({
        where: { recordNumber: { in: subjects } },
        select: { id: true, recordNumber: true, registry: true, classification: true },
      })
    : [];
  const byNumber = new Map(referenced.map((r) => [r.recordNumber, r]));

  let redactedCount = 0;
  const rows = events.map((event) => {
    const record = event.subject ? byNumber.get(event.subject) : undefined;
    // A subject that names no record (an email address, a fingerprint, a tree
    // size) is not redacted — there is no record whose classification to honour.
    if (record && !canReadRecord(principal, record)) {
      redactedCount += 1;
      return { ...event, subject: "—", detail: null, redacted: true };
    }
    return { ...event, redacted: false };
  });

  return (
    <>
      <PageHeader
        overline="Administration"
        title="Audit log"
        lede="Who signed in, who looked at restricted material, and who changed what. Distinct from the ledger chain: the chain records the Kingdom's acts, this records the handling of its records."
      />

      <form className="mb-4 flex flex-wrap items-end gap-2" action="/audit">
        <div className="min-w-0 flex-1">
          <label htmlFor="actor" className="overline mb-1 block">
            Actor
          </label>
          <input
            id="actor"
            name="actor"
            defaultValue={actor ?? ""}
            className="surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="action" className="overline mb-1 block">
            Action
          </label>
          <input
            id="action"
            name="action"
            defaultValue={action ?? ""}
            placeholder="record.view, auth.signin, hold.issue"
            className="surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-sm border border-[var(--rule-strong)] px-3 py-1.5 text-[13px]"
        >
          Filter
        </button>
        {actor || action ? (
          <Link href="/audit" className="muted px-2 py-1.5 text-[13px] underline underline-offset-2">
            Clear
          </Link>
        ) : null}
      </form>

      {redactedCount > 0 ? (
        <div className="mb-6">
          <Caution title={`${redactedCount} entries on this page are redacted`}>
            Those acts concern records above your clearance. That an act occurred is shown; its
            subject and detail are withheld. The Sovereign, the Registrar, and the Auditor see the
            log unredacted.
          </Caution>
        </div>
      ) : null}

      <Panel title={`${total.toLocaleString()} events`}>
        {events.length === 0 ? (
          <EmptyState title="Nothing logged">
            Audit events are written as officers sign in, read restricted records, and make changes.
          </EmptyState>
        ) : (
          <>
            <div className="scroll-x">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rule-strong)]">
                    <th className="overline pb-1.5 pr-3">When</th>
                    <th className="overline pb-1.5 pr-3">Actor</th>
                    <th className="overline pb-1.5 pr-3">Action</th>
                    <th className="overline pb-1.5 pr-3">Subject</th>
                    <th className="overline pb-1.5">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {rows.map((event) => (
                    <tr key={event.id} className={event.redacted ? "opacity-60" : undefined}>
                      <td className="tabular muted whitespace-nowrap py-1.5 pr-3 align-top text-xs">
                        {formatTimestamp(event.createdAt)}
                      </td>
                      <td className="py-1.5 pr-3 align-top text-xs">{event.actorLabel}</td>
                      <td className="tabular py-1.5 pr-3 align-top text-xs">{event.action}</td>
                      <td className="tabular py-1.5 pr-3 align-top text-xs">
                        {event.subject ?? "—"}
                      </td>
                      <td className="muted py-1.5 align-top text-xs">
                        {event.redacted ? (
                          <span className="italic">redacted — above your clearance</span>
                        ) : (
                          (event.detail ?? "—")
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 ? (
              <nav className="mt-4 flex items-center justify-between text-sm">
                <span className="muted">
                  Page {page} of {pages}
                </span>
                <span className="flex gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/audit?page=${page - 1}`}
                      className="rounded-sm border border-[var(--rule-strong)] px-3 py-1"
                    >
                      Newer
                    </Link>
                  ) : null}
                  {page < pages ? (
                    <Link
                      href={`/audit?page=${page + 1}`}
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
