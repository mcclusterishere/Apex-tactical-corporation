import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { visibleClassifications } from "@/lib/queries";
import {
  toDispatchItem,
  CORRESPONDENCE_SHAPES,
  DISPATCH_METHODS,
  DISPATCH_STATE_LABELS,
  DISPATCH_STATE_TONES,
  type DispatchItem,
  type DispatchState,
} from "@/lib/correspondence";
import { PageHeader, Panel, Stat, ButtonLink, Caution, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dispatch and delivery" };
export const dynamic = "force-dynamic";

const TONE_CLASS: Record<string, string> = {
  neutral: "border-[var(--rule-strong)] text-[var(--text-muted)]",
  active: "border-ink-500 text-ink-700 dark:text-ink-200",
  warning: "border-gilt-600 text-gilt-700 dark:text-gilt-300",
  danger: "border-seal-600 text-seal-600",
  success: "border-moss-600 text-moss-700 dark:text-moss-100",
};

/**
 * Everything the Kingdom has sent out, and what became of it.
 *
 * This page exists because of one specific, extremely common failure. An officer
 * writes to a planning office. Nothing comes back. Six months later the
 * institution's settled belief is "they ignore us" — which is an impression, not
 * a fact, and no tribunal can act on it.
 *
 * Nine dated letters, six of them unanswered, each with proof of delivery and a
 * recorded reply date that passed, is a fact. It is admissible, it is the
 * foundation of an equal-terms argument under RLUIPA, and it takes no more
 * effort to produce than the impression did — provided somebody recorded the
 * dispatch at the time. That is what this board is for.
 */
export default async function DispatchPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Fdispatch");

  const records = await prisma.record.findMany({
    where: {
      registry: { in: CORRESPONDENCE_SHAPES.map((shape) => shape.registry) },
      classification: { in: visibleClassifications(principal) },
    },
    orderBy: { recordedAt: "desc" },
    take: 400,
    select: {
      id: true,
      recordNumber: true,
      registry: true,
      title: true,
      status: true,
      data: true,
    },
  });

  const items = records
    .map(toDispatchItem)
    .filter((item): item is DispatchItem => item !== null);

  const byState = (state: DispatchState) => items.filter((item) => item.state === state);
  const overdue = byState("OVERDUE").sort((a, b) => (b.overdueBy ?? 0) - (a.overdueBy ?? 0));
  const unproven = byState("SENT_UNPROVEN");
  const ready = byState("AWAITING_DISPATCH");
  const answered = byState("ANSWERED").length;
  const unanswered = byState("CLOSED_UNANSWERED").length;

  const sent = items.filter((item) => item.sentOn !== null).length;
  const answerRate = sent > 0 ? Math.round((answered / sent) * 100) : null;

  return (
    <>
      <PageHeader
        overline="External affairs"
        title="Dispatch and delivery"
        lede="Everything sent to an outside body, how it went, whether it arrived, and whether anyone answered. An unanswered letter is only evidence if somebody recorded that it was sent."
        actions={<ButtonLink href="/standing">The standing packet</ButtonLink>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sent" value={sent.toLocaleString()} detail="Communications dispatched" />
        <Stat
          label="Reply overdue"
          value={overdue.length.toLocaleString()}
          detail="Past the date a reply was requested"
          tone={overdue.length > 0 ? "danger" : "success"}
        />
        <Stat
          label="Delivery unproven"
          value={unproven.length.toLocaleString()}
          detail="Sent by a method that cannot prove arrival"
          tone={unproven.length > 0 ? "warning" : "default"}
        />
        <Stat
          label="Answered"
          value={answerRate === null ? "—" : `${answerRate}%`}
          detail={`${answered} answered, ${unanswered} closed unanswered`}
          tone={answerRate !== null && answerRate < 40 ? "warning" : "default"}
        />
      </div>

      {overdue.length > 0 ? (
        <Panel title="Awaiting a reply that is now overdue" tone="seal">
          <p className="mb-3 text-sm">
            Each of these is a communication the Kingdom sent, asked for a reply to by a date, and
            did not get. Chase them in writing, reciting the original date and reference — the
            chase is what converts silence into a documented pattern. Where a statutory duty to
            respond exists, this is the point at which it is enforceable rather than merely
            disappointing.
          </p>
          <DispatchTable items={overdue} showOverdue />
        </Panel>
      ) : null}

      {ready.length > 0 ? (
        <Panel title="Prepared but not yet sent">
          <p className="muted mb-3 text-sm">
            Recorded and approved. Nothing has left the building. Send by a method matched to what
            the communication is doing, then record the date and the tracking reference.
          </p>
          <DispatchTable items={ready} />
        </Panel>
      ) : null}

      {unproven.length > 0 ? (
        <div className="mb-6">
          <Caution title="Sent, but nothing proves it arrived">
            These went by ordinary mail, email, or another method that produces no evidence of
            delivery. That is entirely adequate for routine liaison. It is not adequate where a
            right, a deadline, or a later argument depends on the recipient having received it —
            because the recipient&rsquo;s answer to that argument is simply that they did not.
          </Caution>
        </div>
      ) : null}

      <Panel
        title="All correspondence"
        description={`${items.length.toLocaleString()} entries across the correspondence registers`}
      >
        {items.length === 0 ? (
          <EmptyState title="Nothing has been sent yet">
            Open an entry in the Government-to-Government Contact Register, record what is being
            sent and to whom, then produce the letter from the entry. The register entry comes
            first — a letter that went out with no entry behind it cannot later be proved.
          </EmptyState>
        ) : (
          <DispatchTable items={items} />
        )}
      </Panel>

      <Panel
        title="What each method proves"
        description="Chosen at dispatch, argued about years later"
      >
        <div className="scroll-x">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rule-strong)]">
                <th className="overline pb-1.5 pr-3">Method</th>
                <th className="overline pb-1.5 pr-3">Proves</th>
                <th className="overline pb-1.5">Where it fails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)]">
              {[...DISPATCH_METHODS]
                .sort((a, b) => b.weight - a.weight)
                .map((method) => (
                  <tr key={method.value}>
                    <td className="min-w-0 py-2.5 pr-3 align-top">
                      <span className="font-medium">{method.label}</span>
                      <span className="muted mt-0.5 block text-xs">
                        {"●".repeat(method.weight)}
                        <span className="opacity-30">{"●".repeat(5 - method.weight)}</span>
                      </span>
                    </td>
                    <td className="muted py-2.5 pr-3 align-top text-xs leading-relaxed">
                      {method.proves}
                    </td>
                    <td className="muted py-2.5 align-top text-xs leading-relaxed">
                      {method.limitation}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function DispatchTable({ items, showOverdue }: { items: DispatchItem[]; showOverdue?: boolean }) {
  return (
    <div className="scroll-x">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--rule-strong)]">
            <th className="overline pb-1.5 pr-3">Reference</th>
            <th className="overline pb-1.5 pr-3">Subject</th>
            <th className="overline pb-1.5 pr-3">To</th>
            <th className="overline pb-1.5 pr-3">Sent</th>
            <th className="overline pb-1.5 pr-3">Method</th>
            <th className="overline pb-1.5">{showOverdue ? "Overdue by" : "State"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--rule)]">
          {items.slice(0, 120).map((item) => (
            <tr key={item.recordId}>
              <td className="py-2.5 pr-3 align-top">
                <Link
                  href={`/record/${item.recordId}`}
                  className="tabular underline underline-offset-2"
                >
                  {item.recordNumber}
                </Link>
                <Link
                  href={`/record/${item.recordId}/letter`}
                  className="muted mt-0.5 block text-xs underline underline-offset-2"
                >
                  letter
                </Link>
              </td>
              <td className="min-w-0 py-2.5 pr-3 align-top">
                {item.subject ?? item.title}
                <span className="muted mt-0.5 block text-xs">{item.registryTitle}</span>
              </td>
              <td className="py-2.5 pr-3 align-top">
                {item.recipient ?? <span className="muted">—</span>}
                {item.body ? <span className="muted mt-0.5 block text-xs">{item.body}</span> : null}
              </td>
              <td className="tabular muted whitespace-nowrap py-2.5 pr-3 align-top text-xs">
                {item.sentOn ? formatDate(item.sentOn) : "—"}
                {item.deliveredOn ? (
                  <span className="block">del. {formatDate(item.deliveredOn)}</span>
                ) : null}
              </td>
              <td className="py-2.5 pr-3 align-top text-xs">
                {item.method?.label ?? item.methodRaw ?? <span className="muted">—</span>}
                {item.tracking ? (
                  <span className="tabular muted mt-0.5 block">{item.tracking}</span>
                ) : null}
              </td>
              <td className="whitespace-nowrap py-2.5 align-top">
                {showOverdue && item.overdueBy !== null ? (
                  <span className="text-seal-600">
                    {item.overdueBy} {item.overdueBy === 1 ? "day" : "days"}
                  </span>
                ) : (
                  <span
                    className={`rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${
                      TONE_CLASS[DISPATCH_STATE_TONES[item.state]]
                    }`}
                  >
                    {DISPATCH_STATE_LABELS[item.state]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length > 120 ? (
        <p className="muted mt-3 text-xs">
          Showing the most recent 120 of {items.length.toLocaleString()}.
        </p>
      ) : null}
    </div>
  );
}
