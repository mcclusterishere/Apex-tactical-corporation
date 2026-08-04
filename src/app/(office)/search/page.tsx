import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { visibleClassifications, filterSearchLeaks } from "@/lib/queries";
import { getRegistry, REGISTRIES } from "@/registries";
import { PageHeader, Panel, StatusBadge, ClassificationBadge, EmptyState } from "@/components/ui";
import { IconSearch } from "@/components/Icons";
import { formatDateShort, oneParam } from "@/lib/format";

export const metadata: Metadata = { title: "Search the registers" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getPrincipal();
  const params = await searchParams;
  const q = oneParam(params.q);
  const registryFilter = oneParam(params.registry);
  const query = q?.trim() ?? "";

  const candidates =
    query.length > 0
      ? await prisma.record.findMany({
          where: {
            classification: { in: visibleClassifications(principal) },
            ...(registryFilter ? { registry: registryFilter } : {}),
            OR: [
              { title: { contains: query } },
              { recordNumber: { contains: query } },
              { data: { contains: query } },
              { voidReason: { contains: query } },
            ],
          },
          orderBy: { recordedAt: "desc" },
          take: 200,
        })
      : [];

  // Remove hits that matched only inside a field above this reader's clearance.
  const records = filterSearchLeaks(principal, candidates, query).slice(0, 100);
  const suppressed = candidates.length - filterSearchLeaks(principal, candidates, query).length;

  return (
    <>
      <PageHeader
        overline="Across every register"
        title="Search the records"
        lede="Type anything — a person's name, a record number, a place, an agency. It looks through every recorded value, and only ever shows you what you're cleared to see."
      />

      <form className="mb-7" action="/search">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            >
              <IconSearch size="1.35em" />
            </span>
            <label htmlFor="q" className="sr-only">
              Search the records
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="A name, a number, a place…"
              className="surface w-full rounded-lg border border-[var(--rule-strong)] py-3.5 pl-12 pr-3 text-[17px] outline-none transition-colors focus:border-[var(--link)]"
            />
          </div>
          <select
            id="registry"
            name="registry"
            aria-label="Limit to one register"
            defaultValue={registryFilter ?? ""}
            className="surface rounded-lg border border-[var(--rule-strong)] px-3 py-3.5 text-[15px] outline-none focus:border-[var(--link)] sm:w-56"
          >
            <option value="">All registers</option>
            {REGISTRIES.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.shortTitle}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-6 py-3.5 text-[15px] font-medium text-[var(--page-raised)] transition-opacity hover:opacity-90"
          >
            <IconSearch size="1.1em" /> Search
          </button>
        </div>
      </form>

      {query.length === 0 ? (
        <EmptyState title="Enter a search">
          Everything recorded in the registers is searchable — titles, record numbers, and the
          contents of every field.
        </EmptyState>
      ) : records.length === 0 ? (
        <EmptyState title={`Nothing matches “${query}”`}>
          Try a shorter term, or clear the register filter. Material above your clearance is not
          searched.
        </EmptyState>
      ) : (
        <Panel
          title={`${records.length}${records.length === 100 ? "+" : ""} ${
            records.length === 1 ? "result" : "results"
          }`}
          description={
            suppressed > 0
              ? `${suppressed} further ${suppressed === 1 ? "record matched" : "records matched"} only in fields above your clearance and ${suppressed === 1 ? "is" : "are"} not shown.`
              : undefined
          }
        >
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
                {records.map((record) => {
                  const registry = getRegistry(record.registry);
                  return (
                    <tr key={record.id} className={record.voidedAt ? "opacity-60" : undefined}>
                      <td className="whitespace-nowrap py-2 pr-3 align-top">
                        <Link
                          href={`/record/${record.id}`}
                          className="tabular underline underline-offset-2"
                        >
                          {record.recordNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 align-top">
                        <Link href={`/record/${record.id}`}>{record.title}</Link>
                        <div className="mt-0.5">
                          <ClassificationBadge value={record.classification} />
                        </div>
                      </td>
                      <td className="muted py-2 pr-3 align-top text-xs">
                        {registry ? (
                          <Link
                            href={`/registry/${registry.slug}`}
                            className="underline underline-offset-2"
                          >
                            {registry.shortTitle}
                          </Link>
                        ) : (
                          record.registry
                        )}
                      </td>
                      <td className="py-2 pr-3 align-top">
                        {registry ? (
                          <StatusBadge status={record.status} statuses={registry.statuses} />
                        ) : (
                          record.status
                        )}
                      </td>
                      <td className="tabular muted whitespace-nowrap py-2 align-top">
                        {formatDateShort(record.recordedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}
