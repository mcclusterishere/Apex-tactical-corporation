import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { visibleClassifications } from "@/lib/queries";
import { getRegistry } from "@/registries";
import { PageHeader, Panel, Stat, EmptyState, Caution } from "@/components/ui";
import { CompleteDeadlineForm } from "@/components/RecordActions";
import { completeDeadlineAction } from "@/app/actions/records";
import { formatDate, daysUntil, describeDueIn } from "@/lib/format";

export const metadata: Metadata = { title: "Deadlines" };
export const dynamic = "force-dynamic";

/**
 * The tickler.
 *
 * Rights are lost to calendars far more often than to arguments. A copyright
 * registered a week past the three-month window still registers, but it can no
 * longer draw statutory damages or fees for an infringement that started first
 * — and that is usually the difference between a claim worth bringing and one
 * that is not. Nothing on this page is optional reading.
 */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const principal = await getPrincipal();
  const { show } = await searchParams;
  const includeDone = show === "all";

  const deadlines = await prisma.deadline.findMany({
    where: {
      ...(includeDone ? {} : { completedAt: null }),
      OR: [
        { recordId: null },
        { record: { classification: { in: visibleClassifications(principal) } } },
      ],
    },
    orderBy: [{ completedAt: "asc" }, { dueOn: "asc" }],
    include: {
      record: { select: { id: true, recordNumber: true, title: true, registry: true } },
    },
  });

  const open = deadlines.filter((deadline) => deadline.completedAt === null);
  const overdue = open.filter((deadline) => daysUntil(deadline.dueOn) < 0);
  const soon = open.filter((deadline) => {
    const days = daysUntil(deadline.dueOn);
    return days >= 0 && days <= 30;
  });
  const later = open.filter((deadline) => daysUntil(deadline.dueOn) > 30);
  const done = deadlines.filter((deadline) => deadline.completedAt !== null);
  const mayComplete = can(principal.role, "deadline:manage");

  const section = (
    title: string,
    description: string,
    items: typeof deadlines,
    tone?: "default" | "caution" | "seal",
  ) =>
    items.length === 0 ? null : (
      <Panel key={title} title={title} description={description} tone={tone}>
        <ul className="divide-y divide-[var(--rule)]">
          {items.map((deadline) => {
            const days = daysUntil(deadline.dueOn);
            const registry = deadline.record ? getRegistry(deadline.record.registry) : undefined;
            const isDone = deadline.completedAt !== null;
            return (
              <li key={deadline.id} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular whitespace-nowrap text-xs">
                    {formatDate(deadline.dueOn)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {isDone ? <s className="muted">{deadline.title}</s> : deadline.title}
                  </span>
                  {isDone ? (
                    <span className="muted whitespace-nowrap text-xs">
                      done {formatDate(deadline.completedAt)}
                      {deadline.completedBy ? ` — ${deadline.completedBy}` : ""}
                    </span>
                  ) : (
                    <>
                      <span
                        className={`whitespace-nowrap text-xs font-medium ${
                          days < 0
                            ? "text-seal-600"
                            : deadline.severity === "CRITICAL"
                              ? "text-gilt-700 dark:text-gilt-300"
                              : "muted"
                        }`}
                      >
                        {describeDueIn(days)}
                      </span>
                      {mayComplete ? (
                        <CompleteDeadlineForm
                          action={completeDeadlineAction.bind(null, deadline.id)}
                        />
                      ) : null}
                    </>
                  )}
                </div>

                {deadline.detail ? (
                  <p className="muted mt-1 text-xs">{deadline.detail}</p>
                ) : null}

                <p className="muted mt-1 flex flex-wrap gap-x-3 text-xs">
                  {deadline.authority ? <span>Authority: {deadline.authority}</span> : null}
                  {deadline.record ? (
                    <Link
                      href={`/record/${deadline.record.id}`}
                      className="tabular underline underline-offset-2"
                    >
                      {deadline.record.recordNumber}
                    </Link>
                  ) : null}
                  {registry ? <span>{registry.shortTitle}</span> : null}
                  {deadline.severity === "CRITICAL" && !isDone ? (
                    <span className="font-semibold text-gilt-700 dark:text-gilt-300">
                      Critical — a right is forfeited if this passes
                    </span>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      </Panel>
    );

  return (
    <>
      <PageHeader
        overline="Tickler"
        title="Deadlines"
        lede="Dates generated automatically from the registers, plus anything entered by hand. Deadlines marked critical forfeit a right if they pass."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Past due"
          value={overdue.length}
          tone={overdue.length > 0 ? "danger" : "success"}
          detail={overdue.length > 0 ? "Act today" : "Nothing overdue"}
        />
        <Stat
          label="Within 30 days"
          value={soon.length}
          tone={soon.length > 0 ? "warning" : "default"}
        />
        <Stat label="Further out" value={later.length} />
      </div>

      {overdue.some((deadline) => deadline.severity === "CRITICAL") ? (
        <div className="mb-6">
          <Caution title="A critical deadline has passed">
            Critical deadlines are the ones where lateness cannot be cured by paying a fee. Read the
            detail on each and establish what, if anything, is still available — for a missed
            copyright registration window the work can still be registered, and should be, but the
            remedies available for earlier infringement are now narrower.
          </Caution>
        </div>
      ) : null}

      {open.length === 0 && !includeDone ? (
        <EmptyState title="Nothing outstanding">
          No deadlines are open. They are generated automatically when records carrying statutory
          dates are entered — a published work, a registered mark, an agreement with a renewal
          window, a notice with a response date.
        </EmptyState>
      ) : null}

      {section(
        "Past due",
        "These dates have passed",
        overdue,
        "seal",
      )}
      {section("Within thirty days", "Act on these now", soon, "caution")}
      {section("Further out", "On the horizon", later)}
      {includeDone ? section("Completed", "Discharged deadlines, retained for the record", done) : null}

      <p className="muted text-sm">
        {includeDone ? (
          <Link href="/calendar" className="underline underline-offset-2">
            Hide completed
          </Link>
        ) : (
          <Link href="/calendar?show=all" className="underline underline-offset-2">
            Show completed deadlines
          </Link>
        )}
      </p>
    </>
  );
}
