import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { visibleClassifications } from "@/lib/queries";
import { getRegistry, REGISTRIES } from "@/registries";
import { PageHeader, Panel, StatusBadge, ClassificationBadge, EmptyState } from "@/components/ui";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = { title: "Search the registers" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; registry?: string }>;
}) {
  const principal = await getPrincipal();
  const { q, registry: registryFilter } = await searchParams;
  const query = q?.trim() ?? "";

  const records =
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
          take: 100,
        })
      : [];

  return (
    <>
      <PageHeader
        overline="Across every register"
        title="Search"
        lede="Searches record numbers, titles, and every recorded value. Results are limited to material within your clearance."
      />

      <form className="mb-6 flex flex-wrap items-end gap-2" action="/search">
        <div className="min-w-0 flex-1">
          <label htmlFor="q" className="overline mb-1 block">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="A name, a number, a mark, a parcel, an agency"
            className="surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-2 text-sm outline-none focus:border-ink-500"
          />
        </div>
        <div>
          <label htmlFor="registry" className="overline mb-1 block">
            Register
          </label>
          <select
            id="registry"
            name="registry"
            defaultValue={registryFilter ?? ""}
            className="surface rounded-sm border border-[var(--rule-strong)] px-2.5 py-2 text-sm outline-none focus:border-ink-500"
          >
            <option value="">All registers</option>
            {REGISTRIES.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.shortTitle}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-2 text-sm font-medium text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
        >
          Search
        </button>
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
