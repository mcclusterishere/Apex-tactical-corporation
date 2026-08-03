import { prisma } from "@/lib/db";
import { classificationRank } from "@/lib/classification";
import { asRole } from "@/lib/authz";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import type { Principal } from "@/lib/auth";

/**
 * Read helpers shared across views.
 *
 * Every query that returns records takes the principal and filters by clearance
 * at the database level. Filtering in the view instead would mean sealed
 * material travelling to a component that merely declines to render it, which
 * is one refactor away from a disclosure.
 */

/** Classifications a principal may read, for use in a Prisma `in` filter. */
export function visibleClassifications(principal: Principal): string[] {
  const ceiling = classificationRank(principal.clearance);
  return ["PUBLIC", "MEMBERS", "OFFICERS", "SEALED"].filter(
    (level) => classificationRank(level) <= ceiling,
  );
}

/**
 * Visible classifications within one register.
 *
 * An officer named in a register's `restrictedTo` may read that register in
 * full. Without this the Treasurer — who keeps the sealed contributions
 * register but holds only OFFICERS clearance — could write entries they could
 * not then read, which is not a security property but a bug.
 */
export function visibleClassificationsIn(principal: Principal, registrySlug: string): string[] {
  const role = asRole(principal.role);
  const registry = getRegistry(registrySlug);
  if (role === "SOVEREIGN" || registry?.restrictedTo?.includes(role)) {
    return ["PUBLIC", "MEMBERS", "OFFICERS", "SEALED"];
  }
  return visibleClassifications(principal);
}

export async function countsByRegistry(principal: Principal): Promise<Map<string, number>> {
  const rows = await prisma.record.groupBy({
    by: ["registry"],
    where: {
      classification: { in: visibleClassifications(principal) },
      voidedAt: null,
    },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.registry, row._count._all]));
}

export async function recentRecords(principal: Principal, take = 8) {
  return prisma.record.findMany({
    where: { classification: { in: visibleClassifications(principal) } },
    orderBy: { recordedAt: "desc" },
    take,
    select: {
      id: true,
      registry: true,
      recordNumber: true,
      title: true,
      status: true,
      classification: true,
      recordedAt: true,
      voidedAt: true,
    },
  });
}

export async function upcomingDeadlines(principal: Principal, withinDays = 120, take = 50) {
  const horizon = new Date(Date.now() + withinDays * 86_400_000);
  return prisma.deadline.findMany({
    where: {
      completedAt: null,
      dueOn: { lte: horizon },
      OR: [
        { recordId: null },
        { record: { classification: { in: visibleClassifications(principal) } } },
      ],
    },
    orderBy: { dueOn: "asc" },
    take,
    include: {
      record: {
        select: { id: true, recordNumber: true, title: true, registry: true },
      },
    },
  });
}

export async function openHolds(principal: Principal) {
  return prisma.legalHold.findMany({
    where: {
      releasedAt: null,
      record: { classification: { in: visibleClassifications(principal) } },
    },
    orderBy: { issuedAt: "desc" },
    include: {
      record: { select: { id: true, recordNumber: true, title: true, registry: true } },
    },
  });
}

/** Records whose registry declares required fields that were left empty. */
export async function incompleteRecords(principal: Principal, take = 25) {
  return prisma.record.findMany({
    where: {
      classification: { in: visibleClassifications(principal) },
      voidedAt: null,
    },
    orderBy: { recordedAt: "desc" },
    take,
    select: {
      id: true,
      registry: true,
      recordNumber: true,
      title: true,
      data: true,
      status: true,
    },
  });
}

/**
 * Drop rows whose only match was in a field above the reader's clearance.
 *
 * Search runs `data: { contains: query }` against the stored JSON, which does
 * not know about field-level classification. Without this pass, a member-level
 * officer could confirm the contents of an OFFICERS-classified field on a
 * MEMBERS-level record by guessing values and watching what comes back — a
 * classic oracle. The database filter still does the heavy lifting; this
 * removes the leak the index cannot see.
 */
export function filterSearchLeaks<
  T extends { registry: string; title: string; recordNumber: string; data: string },
>(principal: Principal, rows: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;

  return rows.filter((row) => {
    // A match on the number or the title is always legitimate: both are shown
    // to anyone cleared for the record itself.
    if (
      row.recordNumber.toLowerCase().includes(needle) ||
      row.title.toLowerCase().includes(needle)
    ) {
      return true;
    }

    const registry = getRegistry(row.registry);
    if (!registry) return false;

    const data = parseJson<Record<string, unknown>>(row.data, {});
    const readable = registry.fields.filter(
      (field) =>
        !field.classification ||
        classificationRank(principal.clearance) >= classificationRank(field.classification),
    );

    return readable.some((field) => {
      const value = data[field.key];
      if (value === undefined || value === null) return false;
      const text = Array.isArray(value) ? value.join(" ") : String(value);
      return text.toLowerCase().includes(needle);
    });
  });
}
