import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { canWriteRegistry } from "@/lib/authz";
import { getRegistry } from "@/registries";
import { visibleClassifications } from "@/lib/queries";
import { parseJson } from "@/lib/canonical";
import {
  PageHeader,
  Panel,
  StatusBadge,
  ClassificationBadge,
  ButtonLink,
  EmptyState,
} from "@/components/ui";
import { FieldValue } from "@/components/FieldValue";
import { Markdown } from "@/components/Markdown";
import { formatDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const registry = getRegistry(slug);
  return { title: registry?.title ?? "Register" };
}

export default async function RegistryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { q, status, page: pageRaw } = await searchParams;
  const registry = getRegistry(slug);
  if (!registry) notFound();

  const principal = await getPrincipal();
  const page = Math.max(1, Number(pageRaw) || 1);
  const query = q?.trim() ?? "";

  const where = {
    registry: registry.slug,
    classification: { in: visibleClassifications(principal) },
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { recordNumber: { contains: query } },
            { data: { contains: query } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: [{ recordedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.record.count({ where }),
  ]);

  const columns = registry.listColumns
    .map((key) => registry.fields.find((field) => field.key === key))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));

  const mayWrite = canWriteRegistry(principal.role, registry.restrictedTo);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        overline={`Register · ${registry.numberPrefix}`}
        title={registry.title}
        lede={registry.description}
        actions={
          mayWrite ? (
            <ButtonLink href={`/registry/${registry.slug}/new`} tone="primary">
              Record a new {registry.recordLabel.toLowerCase()}
            </ButtonLink>
          ) : isAuthenticated(principal) ? null : (
            <ButtonLink href="/sign-in">Sign in to record</ButtonLink>
          )
        }
      />

      {registry.authority ? (
        <p className="muted mb-5 text-xs">
          Kept under {registry.authority}. Entries are numbered{" "}
          <span className="tabular">AK-{registry.numberPrefix}-000000</span> in the order recorded.
        </p>
      ) : null}

      {registry.guidance ? (
        <details className="surface mb-6 rounded-sm border border-[var(--rule)]">
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold">
            How this register is kept
            <span className="muted ml-2 font-normal">
              — read before making the first entry
            </span>
          </summary>
          <div className="border-t border-[var(--rule)] px-4 py-4">
            <Markdown source={registry.guidance} />
          </div>
        </details>
      ) : null}

      <form className="no-print mb-4 flex flex-wrap items-end gap-2" action={`/registry/${registry.slug}`}>
        <div className="min-w-0 flex-1">
          <label htmlFor="q" className="overline mb-1 block">
            Search this register
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Number, title, or any recorded value"
            className="surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500"
          />
        </div>
        <div>
          <label htmlFor="status" className="overline mb-1 block">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="surface rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500"
          >
            <option value="">Any</option>
            {registry.statuses.map((candidate) => (
              <option key={candidate.value} value={candidate.value}>
                {candidate.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-sm border border-[var(--rule-strong)] px-3 py-1.5 text-[13px] transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          Filter
        </button>
        {query || status ? (
          <Link
            href={`/registry/${registry.slug}`}
            className="muted px-2 py-1.5 text-[13px] underline underline-offset-2"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <Panel
        title={`${total.toLocaleString()} ${
          total === 1 ? registry.recordLabel.toLowerCase() : registry.recordLabelPlural.toLowerCase()
        }`}
        description={
          principal.clearance !== "SEALED"
            ? `Showing entries within ${principal.clearance.toLowerCase()} clearance. Material above that level is not listed.`
            : undefined
        }
      >
        {records.length === 0 ? (
          <EmptyState
            title={query || status ? "Nothing matches" : `The ${registry.shortTitle} is empty`}
            action={
              mayWrite && !query && !status ? (
                <ButtonLink href={`/registry/${registry.slug}/new`} tone="primary">
                  Make the first entry
                </ButtonLink>
              ) : undefined
            }
          >
            {query || status
              ? "Adjust the filter, or clear it to see everything on file."
              : registry.description}
          </EmptyState>
        ) : (
          <>
            <div className="scroll-x">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rule-strong)]">
                    <th className="overline whitespace-nowrap pb-1.5 pr-3">Number</th>
                    <th className="overline pb-1.5 pr-3">{registry.recordLabel}</th>
                    {columns.map((field) => (
                      <th key={field.key} className="overline whitespace-nowrap pb-1.5 pr-3">
                        {field.label}
                      </th>
                    ))}
                    <th className="overline whitespace-nowrap pb-1.5 pr-3">Status</th>
                    <th className="overline whitespace-nowrap pb-1.5">Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {records.map((record) => {
                    const data = parseJson<Record<string, unknown>>(record.data, {});
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
                          {record.voidedAt ? (
                            <span className="ml-2 text-xs font-semibold text-seal-600">VOID</span>
                          ) : null}
                          <div className="mt-0.5">
                            <ClassificationBadge value={record.classification} />
                          </div>
                        </td>
                        {columns.map((field) => (
                          <td key={field.key} className="py-2 pr-3 align-top">
                            <FieldValue field={field} value={data[field.key]} compact />
                          </td>
                        ))}
                        <td className="py-2 pr-3 align-top">
                          <StatusBadge status={record.status} statuses={registry.statuses} />
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

            {pages > 1 ? (
              <nav className="no-print mt-4 flex items-center justify-between text-sm">
                <span className="muted">
                  Page {page} of {pages}
                </span>
                <span className="flex gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/registry/${registry.slug}?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}${status ? `&status=${status}` : ""}`}
                      className="rounded-sm border border-[var(--rule-strong)] px-3 py-1"
                    >
                      Previous
                    </Link>
                  ) : null}
                  {page < pages ? (
                    <Link
                      href={`/registry/${registry.slug}?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}${status ? `&status=${status}` : ""}`}
                      className="rounded-sm border border-[var(--rule-strong)] px-3 py-1"
                    >
                      Next
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
