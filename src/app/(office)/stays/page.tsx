import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { balanceOf, ledgerOf, openTasks, formatStays, NIGHTS_PER_STAY } from "@/lib/stays";
import { PageHeader, Panel, Stat, EmptyState, Caution } from "@/components/ui";
import { NewTaskForm, ProposeTaskForm, GiftForm, TaskActions } from "@/components/StayForms";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = { title: "Apex Stays" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  EARN: "Earned",
  GIFT_OUT: "Gifted away",
  GIFT_IN: "Received",
  SPEND: "Spent",
  ADJUST: "Adjusted",
};

export default async function StaysPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Fstays");

  const steward = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";

  const [balance, ledger, tasks, members, verifiedCount] = await Promise.all([
    balanceOf(principal.id),
    ledgerOf(principal.id, 30),
    openTasks(),
    prisma.user.findMany({
      where: { active: true, id: { not: principal.id } },
      select: { id: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.apexTask.count({ where: { status: "VERIFIED" } }),
  ]);

  const nameOf = new Map(members.map((member) => [member.id, member.displayName]));

  return (
    <>
      <PageHeader
        overline="Lands &amp; Lettings"
        title="Apex Stays"
        lede={
          <>
            The family&rsquo;s contribution ledger. Work on a family property earns <strong>Stays</strong>{" "}
            — one Apex Stay is <strong>two nights</strong>: an afternoon check-in, the whole day
            between, out by midday. Earn them, gift them to family, and spend them on nights at any
            property in the network. Stays are never bought, never cashed out, and never touch the
            Mark.
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Your balance"
          value={formatStays(balance)}
          detail={`${balance} night${balance === 1 ? "" : "s"} on the ledger`}
        />
        <Stat
          label="Open tasks"
          value={tasks.filter((task) => task.status === "OPEN").length}
          detail="Claim one and earn"
        />
        <Stat label="Tasks completed" value={verifiedCount} detail="Verified, two-person rule" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <Panel
            title="The task board"
            description="Work posted against the family's properties. Claim, do, mark done; a second person verifies and the Stays are credited."
          >
            {tasks.length === 0 ? (
              <EmptyState title="No open tasks">
                {steward
                  ? "Post the first task below — the mowing, the gutters, the tax run."
                  : "Nothing posted right now. Check back."}
              </EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--rule)]">
                {tasks.map((task) => (
                  <li key={task.id} className="py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{task.title}</span>
                      <span className="tabular text-sm">{formatStays(task.rewardNights)}</span>
                    </div>
                    <p className="muted mt-0.5 text-xs">
                      {task.propertyLabel}
                      {task.detail ? <> — {task.detail}</> : null}
                    </p>
                    <p className="muted mt-0.5 text-xs">
                      {task.status === "PROPOSED"
                        ? `Proposed by ${task.postedById === principal.id ? "you" : (nameOf.get(task.postedById) ?? "a member")} — awaiting a Keeper's approval`
                        : task.status === "OPEN"
                          ? "Open to claim"
                          : task.status === "CLAIMED"
                            ? `Claimed by ${nameOf.get(task.claimedById ?? "") ?? (task.claimedById === principal.id ? "you" : "a member")}`
                            : `Done — awaiting verification`}
                    </p>
                    <div className="mt-2">
                      <TaskActions
                        taskId={task.id}
                        status={task.status}
                        mine={task.claimedById === principal.id}
                        steward={steward}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {steward ? (
            <Panel
              title="Post a task"
              description="Name the work, the property, and the reward in nights. Two nights make one Stay."
            >
              <NewTaskForm />
            </Panel>
          ) : (
            <Panel
              title="Propose a goal"
              description="See something the family's places need? Propose it. A Keeper approves it, and then it's real — youth propose, elders sanction."
            >
              <ProposeTaskForm />
            </Panel>
          )}
        </div>

        <div className="min-w-0">
          <Panel
            title="Gift Stays"
            description="Send Stays to any member so they can stay. A gift is hospitality moving through the family — it can never be sold or cashed."
          >
            <GiftForm members={members} />
          </Panel>

          <Panel title="Your ledger" description="Every movement on your balance, newest first.">
            {ledger.length === 0 ? (
              <EmptyState title="Nothing yet">
                Claim a task from the board — the first verified job starts the ledger.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--rule)] text-sm">
                {ledger.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 py-2">
                    <span className="tabular text-xs">{formatDateShort(entry.createdAt)}</span>
                    <span className="min-w-0 flex-1">
                      {KIND_LABEL[entry.kind] ?? entry.kind}
                      {entry.counterpartyId ? (
                        <> {entry.kind === "GIFT_OUT" ? "to" : "from"}{" "}
                          {nameOf.get(entry.counterpartyId) ?? "a member"}</>
                      ) : null}
                      {entry.memo ? <span className="muted"> — {entry.memo}</span> : null}
                    </span>
                    <span
                      className={`tabular ${
                        entry.kind === "GIFT_OUT" || entry.kind === "SPEND"
                          ? "text-seal-700 dark:text-seal-300"
                          : "text-moss-700 dark:text-moss-100"
                      }`}
                    >
                      {entry.kind === "GIFT_OUT" || entry.kind === "SPEND" ? "−" : "+"}
                      {formatStays(entry.nights)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Caution title="What a Stay is, and is not">
            A Stay is {NIGHTS_PER_STAY} nights of family hospitality, earned by work. It has no
            dollar value, cannot be bought, cannot be cashed out, and cannot be converted to the
            Apex Mark — those functions do not exist in this system, deliberately. Keep it that
            way: gift Stays freely, never sell them.
          </Caution>
        </div>
      </div>
    </>
  );
}
