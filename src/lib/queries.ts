import { prisma } from "@/lib/db";
import { classificationRank } from "@/lib/classification";
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
