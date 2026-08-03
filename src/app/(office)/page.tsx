import Link from "next/link";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { getChainHead } from "@/lib/chain";
import { prisma } from "@/lib/db";
import { countsByRegistry, recentRecords, upcomingDeadlines, openHolds } from "@/lib/queries";
import { groupedRegistries, getRegistry, REGISTRIES } from "@/registries";
import { REGISTRY_GROUP_LABELS, REGISTRY_GROUP_BLURBS } from "@/registries/types";
import { PageHeader, Panel, Stat, StatusBadge, ClassificationBadge, ButtonLink, EmptyState, Caution } from "@/components/ui";
import { formatDateShort, formatTimestamp, shortHash, daysUntil, describeDueIn } from "@/lib/format";
import { Seal } from "@/components/Seal";

export const dynamic = "force-dynamic";

export default async function RegistrarsDesk() {
  const principal = await getPrincipal();
  const signedIn = isAuthenticated(principal);

  const [head, counts, recent, deadlines, holds, totalRecords, lastAnchor] = await Promise.all([
    getChainHead(),
    countsByRegistry(principal),
    recentRecords(principal, 10),
    upcomingDeadlines(principal, 180, 8),
    openHolds(principal),
    prisma.record.count({ where: { voidedAt: null } }),
    prisma.chainAnchor.findFirst({ orderBy: { sequence: "desc" } }),
  ]);

  const overdue = deadlines.filter((deadline) => daysUntil(deadline.dueOn) < 0);
  const critical = deadlines.filter(
    (deadline) => deadline.severity === "CRITICAL" && daysUntil(deadline.dueOn) >= 0,
  );

  const unanchored = head ? head.sequence - (lastAnchor?.sequence ?? 0) : 0;

  return (
    <>
      <PageHeader
        overline="Apex Tactical Corporation"
        title="The Registrar&rsquo;s desk"
        lede={
          signedIn ? (
            <>
              Signed in as <strong>{principal.displayName}</strong>
              {principal.officeTitle ? `, ${principal.officeTitle}` : ""}. You hold{" "}
              <strong>{principal.clearance.toLowerCase()}</strong> clearance.
            </>
          ) : (
            <>
              You are viewing the public register. Sign in to reach member, officer, and sealed
              material.
            </>
          )
        }
        actions={
          signedIn ? (
            <>
              <ButtonLink href="/chain">Ledger chain</ButtonLink>
              <ButtonLink href="/search" tone="primary">
                Search
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href="/sign-in" tone="primary">
              Sign in
            </ButtonLink>
          )
        }
      />

      {!signedIn ? (
        <section className="surface mb-6 rounded-sm border border-[var(--rule-strong)] px-5 py-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Seal size={92} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg">The register of Apex Kingdom</h2>
              <p className="muted mt-1.5 text-sm">
                This is the system of record of Apex Kingdom, a religious society and cultural
                institution constituted by Charter on 30 October 2010 and reduced to writing on 29
                May 2025. It keeps the Kingdom&rsquo;s instruments, its offices, its property, its
                intellectual property, its dealings with outside governments, and the evidence
                supporting its claims.
              </p>
              <p className="muted mt-2 text-sm">
                Every entry is committed to an append-only chain of cryptographic hashes. Anyone
                holding a certified extract can confirm, without an account and without the
                Kingdom&rsquo;s cooperation, that the document they hold is the document that was
                recorded.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/verify" tone="primary">
                  Verify a certified copy
                </ButtonLink>
                <ButtonLink href="/charter">Read the Charter</ButtonLink>
                <ButtonLink href="/gazette">Official gazette</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Records on file"
          value={totalRecords.toLocaleString()}
          detail={`Across ${REGISTRIES.length} registers`}
          href="/search"
        />
        <Stat
          label="Ledger entries"
          value={head ? head.sequence.toLocaleString() : "—"}
          detail={head ? `Head ${shortHash(head.entryHash)}` : "The ledger has not been opened"}
          href="/chain"
        />
        <Stat
          label="Overdue"
          value={overdue.length}
          detail={
            overdue.length > 0
              ? "Deadlines past due — rights may be forfeiting"
              : critical.length > 0
                ? `${critical.length} critical ahead`
                : "Nothing past due"
          }
          tone={overdue.length > 0 ? "danger" : critical.length > 0 ? "warning" : "success"}
          href="/calendar"
        />
        <Stat
          label="Unanchored entries"
          value={unanchored}
          detail={
            lastAnchor
              ? `Last anchored ${formatDateShort(lastAnchor.anchoredAt)}`
              : "Never anchored externally"
          }
          tone={unanchored > 25 || !lastAnchor ? "warning" : "success"}
          href="/chain"
        />
      </div>

      {!lastAnchor && head ? (
        <div className="mb-6">
          <Caution title="The chain has never been anchored outside the Kingdom">
            An internal hash chain proves the register has not been rewritten. It does not, on its
            own, prove when anything was recorded — the dates rest on the Kingdom&rsquo;s own
            assertion until a head hash is fixed somewhere it does not control. Publish the current
            head in the gazette, mail it to yourself by certified mail, or obtain an RFC 3161
            timestamp. Run{" "}
            <code className="tabular">npm run chain:anchor</code> for the procedure, and see the{" "}
            <Link href="/doctrine/05-EVIDENCE-AND-CHAIN-OF-CUSTODY" className="underline">
              evidence manual
            </Link>
            .
          </Caution>
        </div>
      ) : null}

      {overdue.length > 0 ? (
        <Panel
          title="Past due"
          description="Statutory and administrative deadlines that have passed"
          tone="seal"
          actions={<ButtonLink href="/calendar">All deadlines</ButtonLink>}
        >
          <ul className="divide-y divide-[var(--rule)]">
            {overdue.map((deadline) => (
              <li key={deadline.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                <span className="tabular text-seal-600">
                  {describeDueIn(daysUntil(deadline.dueOn))}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  {deadline.record ? (
                    <Link href={`/record/${deadline.record.id}`} className="underline underline-offset-2">
                      {deadline.title}
                    </Link>
                  ) : (
                    deadline.title
                  )}
                  {deadline.authority ? (
                    <span className="muted"> &middot; {deadline.authority}</span>
                  ) : null}
                </span>
                {deadline.record ? (
                  <span className="tabular muted">{deadline.record.recordNumber}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {holds.length > 0 ? (
        <Panel
          title="Records under legal hold"
          description="Preservation obligations are in force; these records cannot be voided"
          tone="caution"
        >
          <ul className="divide-y divide-[var(--rule)]">
            {holds.map((hold) => (
              <li key={hold.id} className="py-2 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <Link
                    href={`/record/${hold.record.id}`}
                    className="tabular underline underline-offset-2"
                  >
                    {hold.record.recordNumber}
                  </Link>
                  <span className="min-w-0 flex-1">{hold.record.title}</span>
                  <span className="muted text-xs">{formatDateShort(hold.issuedAt)}</span>
                </div>
                <p className="muted mt-0.5 text-xs">
                  <strong>{hold.matter}</strong> — {hold.reason}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Panel
            title="Recently recorded"
            actions={<ButtonLink href="/search">Search all</ButtonLink>}
          >
            {recent.length === 0 ? (
              <EmptyState title="The registers are empty">
                Nothing has been recorded yet. Open a register from the navigation and make the
                first entry, or run <code className="tabular">npm run seed</code> to load the
                founding instruments.
              </EmptyState>
            ) : (
              <div className="scroll-x">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--rule-strong)]">
                      <th className="overline pb-1.5 pr-3">Number</th>
                      <th className="overline pb-1.5 pr-3">Entry</th>
                      <th className="overline pb-1.5 pr-3">Register</th>
                      <th className="overline pb-1.5 pr-3">Status</th>
                      <th className="overline pb-1.5">Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)]">
                    {recent.map((record) => {
                      const registry = getRegistry(record.registry);
                      return (
                        <tr key={record.id}>
                          <td className="py-2 pr-3 align-top">
                            <Link
                              href={`/record/${record.id}`}
                              className="tabular underline underline-offset-2"
                            >
                              {record.recordNumber}
                            </Link>
                          </td>
                          <td className="py-2 pr-3 align-top">
                            <Link href={`/record/${record.id}`}>{record.title}</Link>
                            {record.voidedAt ? (
                              <span className="ml-2 text-xs text-seal-600">VOID</span>
                            ) : null}
                          </td>
                          <td className="muted py-2 pr-3 align-top text-xs">
                            {registry?.shortTitle ?? record.registry}
                          </td>
                          <td className="py-2 pr-3 align-top">
                            {registry ? (
                              <StatusBadge status={record.status} statuses={registry.statuses} />
                            ) : (
                              record.status
                            )}
                          </td>
                          <td className="tabular muted py-2 align-top">
                            {formatDateShort(record.recordedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel title="Ledger status">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="overline">Chain head</dt>
                <dd className="digest mt-0.5">{head?.entryHash ?? "The ledger has not been opened."}</dd>
              </div>
              <div>
                <dt className="overline">Last entry</dt>
                <dd className="mt-0.5">
                  {head ? (
                    <>
                      #{head.sequence} &middot; {head.eventType.replaceAll("_", " ").toLowerCase()}
                      <span className="muted block text-xs">{formatTimestamp(head.createdAt)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="overline">External anchor</dt>
                <dd className="mt-0.5">
                  {lastAnchor ? (
                    <>
                      #{lastAnchor.sequence} via {lastAnchor.method.replaceAll("_", " ").toLowerCase()}
                      <span className="muted block text-xs">
                        {formatTimestamp(lastAnchor.anchoredAt)}
                      </span>
                    </>
                  ) : (
                    <span className="text-gilt-700 dark:text-gilt-300">None recorded</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <ButtonLink href="/chain">Inspect and verify</ButtonLink>
            </div>
          </Panel>

          {deadlines.length > 0 ? (
            <Panel title="Ahead" description="Next deadlines on the calendar">
              <ul className="space-y-2.5 text-sm">
                {deadlines.slice(0, 6).map((deadline) => {
                  const days = daysUntil(deadline.dueOn);
                  return (
                    <li key={deadline.id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="tabular text-xs">{formatDateShort(deadline.dueOn)}</span>
                        <span
                          className={`text-xs ${
                            days < 0
                              ? "text-seal-600"
                              : deadline.severity === "CRITICAL"
                                ? "text-gilt-700 dark:text-gilt-300"
                                : "muted"
                          }`}
                        >
                          {describeDueIn(days)}
                        </span>
                      </div>
                      {deadline.record ? (
                        <Link
                          href={`/record/${deadline.record.id}`}
                          className="underline underline-offset-2"
                        >
                          {deadline.title}
                        </Link>
                      ) : (
                        deadline.title
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4">
                <ButtonLink href="/calendar">Full calendar</ButtonLink>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <Panel
        title="The registers"
        description="Every register kept under the Charter, with the count of entries you may read"
      >
        <div className="space-y-6">
          {groupedRegistries().map((entry) => (
            <div key={entry.group}>
              <h3 className="text-sm font-semibold">{REGISTRY_GROUP_LABELS[entry.group]}</h3>
              <p className="muted mb-2.5 text-xs">{REGISTRY_GROUP_BLURBS[entry.group]}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {entry.registries.map((registry) => (
                  <Link
                    key={registry.slug}
                    href={`/registry/${registry.slug}`}
                    className="block border border-[var(--rule)] px-3 py-2.5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">{registry.shortTitle}</span>
                      <span className="tabular muted">{counts.get(registry.slug) ?? 0}</span>
                    </div>
                    <p className="muted mt-0.5 line-clamp-2 text-xs">{registry.description}</p>
                    <div className="mt-1.5">
                      <ClassificationBadge value={registry.defaultClassification} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
