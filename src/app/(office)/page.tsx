import Link from "next/link";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { getChainHead } from "@/lib/chain";
import { prisma } from "@/lib/db";
import { countsByRegistry, recentRecords, upcomingDeadlines, openHolds } from "@/lib/queries";
import { getRegistry, REGISTRIES, groupedRegistries } from "@/registries";
import { REGISTRY_GROUP_LABELS, REGISTRY_GROUP_BLURBS } from "@/registries/types";
import { can } from "@/lib/authz";
import {
  Hero,
  ActionCard,
  Panel,
  Stat,
  StatusBadge,
  ClassificationBadge,
  ButtonLink,
  EmptyState,
  Caution,
} from "@/components/ui";
import {
  IconVerify,
  IconSearch,
  IconCharter,
  IconGazette,
  IconLedger,
  IconIdentity,
  IconStay,
  IconRegisters,
  IconTreasury,
  IconAccount,
} from "@/components/Icons";
import { formatDateShort, formatTimestamp, shortHash, daysUntil, describeDueIn } from "@/lib/format";
import { Seal } from "@/components/Seal";

export const dynamic = "force-dynamic";

export default async function RegistrarsDesk() {
  const principal = await getPrincipal();
  const signedIn = isAuthenticated(principal);
  const firstName = principal.displayName?.trim().split(/\s+/)[0];
  const canMoney = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";

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
      <Hero
        eyebrow="Apex Kingdom · Office of the Registrar"
        seal={<Seal size={96} />}
        title={signedIn && firstName ? `Welcome, ${firstName}.` : "The register of Apex Kingdom"}
        lede={
          signedIn ? (
            <>
              This is the Kingdom&rsquo;s system of record. Everything entered here is sealed into a
              chain that cannot be quietly changed. Choose what you&rsquo;d like to do &mdash; or use
              the sections in the menu for anything more detailed.
            </>
          ) : (
            <>
              This is the public register of Apex Kingdom, a religious society and cultural
              institution. Every entry is sealed into an unbroken chain, so anyone holding a
              certified copy can prove it is genuine. Start with one of the doors below.
            </>
          )
        }
        actions={
          signedIn ? null : (
            <ButtonLink href="/sign-in" tone="primary">
              Sign in
            </ButtonLink>
          )
        }
      />

      {/* The front door: a few big, plain doors anyone can read at a glance. */}
      <section aria-label="What would you like to do?" className="mb-9">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard href="/verify" icon={<IconVerify />} title="Verify a document" tone="gilt">
            Check that a certified copy is genuine and unaltered.
          </ActionCard>
          <ActionCard href="/search" icon={<IconSearch />} title="Search the records">
            Find a person, a filing, or a record by name or number.
          </ActionCard>
          <ActionCard href="/charter" icon={<IconCharter />} title="Read the Charter">
            The founding document that constitutes the Kingdom.
          </ActionCard>

          {signedIn ? (
            <>
              <ActionCard href="/claim" icon={<IconIdentity />} title="Claim your identity">
                Prove who you are and link yourself to your record.
              </ActionCard>
              <ActionCard href="/zomes" icon={<IconStay />} title="Book a stay">
                Reserve a zome on the Kingdom&rsquo;s land.
              </ActionCard>
              <ActionCard href="/account" icon={<IconAccount />} title="Your account">
                Your office, your password, and your sign-in security.
              </ActionCard>
            </>
          ) : (
            <>
              <ActionCard href="/gazette" icon={<IconGazette />} title="The official gazette">
                Notices the Kingdom has published to the public.
              </ActionCard>
              <ActionCard href="/chain" icon={<IconLedger />} title="The ledger chain">
                See the sealed chain and check it for yourself.
              </ActionCard>
              <ActionCard href="/claim" icon={<IconIdentity />} title="Claim your identity">
                Prove who you are and link yourself to your record.
              </ActionCard>
            </>
          )}
        </div>
      </section>

      {/* Alerts that genuinely need a person's attention come before anything else. */}
      {!lastAnchor && head ? (
        <div className="mb-6">
          <Caution title="The chain has never been anchored outside the Kingdom">
            An internal hash chain proves the register has not been rewritten. It does not, on its
            own, prove <em>when</em> anything was recorded &mdash; the dates rest on the
            Kingdom&rsquo;s own assertion until a head hash is fixed somewhere it does not control.
            Publish the current head in the gazette, mail it to yourself by certified mail, or obtain
            an RFC 3161 timestamp. Run <code className="tabular">npm run chain:anchor</code> for the
            procedure, and see the{" "}
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

      {/* Trust signals — the same four figures, framed as reassurance rather than a cockpit. */}
      <div className="mb-2">
        <h2 className="overline mb-3 flex items-center gap-1.5">
          <span aria-hidden className="h-px w-3 bg-[var(--gilt-line)]" />
          The register at a glance
        </h2>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Panel title="Recently recorded" actions={<ButtonLink href="/search">Search all</ButtonLink>}>
            {recent.length === 0 ? (
              <EmptyState title="The registers are empty">
                Nothing has been recorded yet. Open a register from the menu and make the first
                entry, or run <code className="tabular">npm run seed</code> to load the founding
                instruments.
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

          {canMoney ? (
            <Panel title="Treasury">
              <p className="muted text-sm">
                The Kingdom&rsquo;s double-entry books, the chart of accounts, and the Mint.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href="/treasury">
                  <span className="inline-flex items-center gap-1.5">
                    <IconTreasury size="1em" /> Open the Treasury
                  </span>
                </ButtonLink>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <Panel
        title="The registers"
        description="Every register kept under the Charter, with the count of entries you may read"
        actions={
          <span className="muted hidden items-center gap-1.5 text-xs sm:inline-flex">
            <IconRegisters size="1em" /> {REGISTRIES.length} registers
          </span>
        }
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
                    className="block rounded-md border border-[var(--rule)] px-3 py-2.5 transition-colors hover:surface-tint"
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
