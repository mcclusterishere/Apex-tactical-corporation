import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { ROLES, ROLE_LABELS } from "@/lib/authz";
import { PageHeader, Panel, Stat, EmptyState, Caution } from "@/components/ui";
import { ApprovalRequestForm, ApprovalVoteForm } from "@/components/ApprovalForms";
import { requestApprovalAction, voteApprovalAction } from "@/app/actions/approvals";
import { SUBJECT_TYPES, SUBJECT_LABELS } from "@/lib/approvals";
import { StepUpPrompt } from "@/components/SecurityForms";
import { stepUpAction } from "@/app/actions/security";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Dual control" };
export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) {
    return (
      <PageHeader
        overline="Controls"
        title="Dual control"
        lede="Sign in to see requests awaiting a second officer."
      />
    );
  }

  const [pending, decided] = await Promise.all([
    prisma.approval.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "desc" },
      include: { votes: { include: { user: true } } },
    }),
    prisma.approval.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { requestedAt: "desc" },
      take: 25,
      include: { votes: { include: { user: true } } },
    }),
  ]);

  const awaitingMe = pending.filter(
    (a) => a.requestedById !== principal.id && !a.votes.some((v) => v.userId === principal.id),
  );

  return (
    <>
      <PageHeader
        overline="Controls"
        title="Dual control"
        lede="Acts that a single officer should not complete alone. An officer may not approve their own request, and one rejection ends it."
      />

      <div className="mb-6">
        <Caution title="Why this exists">
          Every institution that has lost money to an insider had one person who could
          complete the whole transaction alone. The value here is entirely in the
          constraints — the requester&rsquo;s consent does not count toward the quorum, no
          officer may vote twice, and a single rejection closes the request rather than
          being outvoted.
        </Caution>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Pending" value={pending.length} />
        <Stat
          label="Awaiting your decision"
          value={awaitingMe.length}
          tone={awaitingMe.length > 0 ? "warning" : "default"}
        />
        <Stat label="Decided recently" value={decided.length} />
      </div>

      {awaitingMe.length > 0 && !principal.stepUpValid ? (
        <Panel title="Re-authenticate to decide" description="Approving a controlled act requires your password again.">
          <StepUpPrompt action={stepUpAction} />
        </Panel>
      ) : null}

      <Panel title="Pending requests">
        {pending.length === 0 ? (
          <EmptyState title="Nothing awaiting approval" />
        ) : (
          <div className="space-y-5">
            {pending.map((approval) => {
              const approvals = approval.votes.filter((v) => v.decision === "APPROVE").length;
              const isMine = approval.requestedById === principal.id;
              const voted = approval.votes.some((v) => v.userId === principal.id);
              return (
                <div key={approval.id} className="border-l-[3px] border-gilt-500 pl-4">
                  <p className="text-sm font-semibold">
                    {SUBJECT_LABELS[approval.subjectType] ?? approval.subjectType} — {approval.summary}
                  </p>
                  {approval.reason ? <p className="muted mt-0.5 text-sm">{approval.reason}</p> : null}
                  <p className="muted mt-1 text-xs">
                    Requested by {approval.requestedBy} · {formatTimestamp(approval.requestedAt)} ·{" "}
                    {approvals} of {approval.requiredCount} approvals
                    {approval.eligibleRoles ? ` · ${approval.eligibleRoles.toLowerCase()} only` : ""}
                  </p>
                  {approval.votes.length > 0 ? (
                    <ul className="muted mt-1 space-y-0.5 text-xs">
                      {approval.votes.map((vote) => (
                        <li key={vote.id}>
                          {vote.decision === "APPROVE" ? "approved" : "rejected"} by{" "}
                          {vote.user.displayName}
                          {vote.signature ? " (signed)" : ""}
                          {vote.note ? ` — ${vote.note}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {isMine ? (
                    <p className="muted mt-2 text-xs italic">
                      You raised this. Your consent is implicit and does not count toward the quorum.
                    </p>
                  ) : voted ? (
                    <p className="muted mt-2 text-xs italic">You have already decided this one.</p>
                  ) : (
                    <ApprovalVoteForm action={voteApprovalAction} approvalId={approval.id} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Raise a request">
        <ApprovalRequestForm
          action={requestApprovalAction}
          subjectTypes={SUBJECT_TYPES.map((t) => ({ value: t, label: SUBJECT_LABELS[t] ?? t }))}
          roles={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
        />
      </Panel>

      {decided.length > 0 ? (
        <Panel title="Decided">
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">What</th>
                  <th className="overline pb-1.5 pr-3">Requested by</th>
                  <th className="overline pb-1.5 pr-3">Status</th>
                  <th className="overline pb-1.5">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {decided.map((approval) => (
                  <tr key={approval.id}>
                    <td className="py-2 pr-3">{approval.summary}</td>
                    <td className="muted py-2 pr-3 text-xs">{approval.requestedBy}</td>
                    <td className="py-2 pr-3 text-xs">
                      {approval.status === "APPROVED" || approval.status === "EXECUTED" ? (
                        <span className="text-moss-700 dark:text-moss-100">
                          {approval.status.toLowerCase()}
                        </span>
                      ) : (
                        <span className="text-seal-600">{approval.status.toLowerCase()}</span>
                      )}
                    </td>
                    <td className="tabular muted py-2 text-xs">
                      {formatTimestamp(approval.decidedAt ?? approval.requestedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </>
  );
}
