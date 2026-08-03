import { prisma } from "@/lib/db";
import { appendToChainTx, sha256Hex } from "@/lib/chain";
import { canonicalise, parseJson } from "@/lib/canonical";
import { validateRecordData, deriveTitle } from "@/lib/validation";
import { getRegistry } from "@/registries";
import type { RegistryDef } from "@/registries/types";
import type { Principal } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

/**
 * All mutation of the registers goes through this module.
 *
 * The invariant it enforces: no record changes without a corresponding link in
 * the hash chain, written in the same transaction. If the chain write fails the
 * record write rolls back with it. A register whose contents can drift out of
 * step with its own audit trail proves nothing.
 */

export class RecordError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "RecordError";
  }
}

/**
 * Allocate the next number in a registry's sequence.
 *
 * Numbers are gapless and never reused, including for records that are later
 * voided — a gap in a register invites the question of what used to be there.
 * A voided record keeps its number and carries a void notation instead.
 */
async function allocateRecordNumber(
  tx: Parameters<typeof appendToChainTx>[0],
  registry: RegistryDef,
): Promise<string> {
  const key = `registry:${registry.slug}`;
  const counter = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `AK-${registry.numberPrefix}-${String(counter.value).padStart(6, "0")}`;
}

/** Generate the deadlines a registry's rules imply for a record's data. */
function deadlinesFor(registry: RegistryDef, data: Record<string, unknown>) {
  const out: {
    title: string;
    detail: string | null;
    dueOn: Date;
    authority: string | null;
    severity: string;
  }[] = [];

  for (const rule of registry.deadlineRules ?? []) {
    if (rule.when && !rule.when(data)) continue;
    const from = data[rule.fromField];
    if (typeof from !== "string" || !from) continue;
    const base = new Date(`${from}T00:00:00Z`);
    if (Number.isNaN(base.getTime())) continue;
    const due = new Date(base.getTime() + rule.offsetDays * 86_400_000);
    out.push({
      title: rule.title,
      detail: rule.detail ?? null,
      dueOn: due,
      authority: rule.authority ?? null,
      severity: rule.severity,
    });
  }
  return out;
}

export interface CreateRecordInput {
  registrySlug: string;
  data: Record<string, unknown>;
  title?: string;
  classification?: string;
  status?: string;
  effectiveDate?: string | null;
}

export async function createRecord(principal: Principal, input: CreateRecordInput) {
  const registry = getRegistry(input.registrySlug);
  if (!registry) throw new RecordError(`No such register: ${input.registrySlug}`);

  const validated = validateRecordData(registry, input.data);
  if (!validated.ok) {
    throw new RecordError("The entry has problems that must be corrected.", validated.errors);
  }

  const title =
    input.title?.trim() ||
    deriveTitle(registry, validated.data, `Untitled ${registry.recordLabel}`);

  const effectiveDate =
    input.effectiveDate && /^\d{4}-\d{2}-\d{2}$/.test(input.effectiveDate)
      ? new Date(`${input.effectiveDate}T00:00:00Z`)
      : null;

  const result = await prisma.$transaction(async (tx) => {
    const recordNumber = await allocateRecordNumber(tx, registry);

    const record = await tx.record.create({
      data: {
        registry: registry.slug,
        recordNumber,
        title,
        data: canonicalise(validated.data as Record<string, never>),
        classification: input.classification ?? registry.defaultClassification,
        status: input.status ?? registry.defaultStatus,
        effectiveDate,
      },
    });

    const deadlines = deadlinesFor(registry, validated.data);
    if (deadlines.length > 0) {
      await tx.deadline.createMany({
        data: deadlines.map((deadline) => ({ ...deadline, recordId: record.id })),
      });
    }

    await appendToChainTx(tx, {
      eventType: "RECORD_CREATED",
      recordId: record.id,
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        registry: registry.slug,
        recordNumber,
        title,
        classification: record.classification,
        status: record.status,
        effectiveDate: effectiveDate ? effectiveDate.toISOString().slice(0, 10) : null,
        data: validated.data as Record<string, never>,
      },
    });

    return record;
  });

  await recordAudit(principal, "record.create", result.recordNumber, `${registry.title}: ${title}`);
  return result;
}

export interface AmendRecordInput {
  recordId: string;
  data: Record<string, unknown>;
  title?: string;
  classification?: string;
  status?: string;
  effectiveDate?: string | null;
  /** Why the amendment was made. Required — an unexplained change is a red flag. */
  reason: string;
}

export async function amendRecord(principal: Principal, input: AmendRecordInput) {
  const existing = await prisma.record.findUnique({
    where: { id: input.recordId },
    include: { holds: { where: { releasedAt: null } } },
  });
  if (!existing) throw new RecordError("No such record.");

  const registry = getRegistry(existing.registry);
  if (!registry) throw new RecordError(`No such register: ${existing.registry}`);

  if (!input.reason?.trim()) {
    throw new RecordError("State the reason for the amendment.", {
      reason: "A reason is required for every amendment.",
    });
  }

  const validated = validateRecordData(registry, input.data);
  if (!validated.ok) {
    throw new RecordError("The amendment has problems that must be corrected.", validated.errors);
  }

  const before = parseJson<Record<string, unknown>>(existing.data, {});
  const after = validated.data;

  // Record only what actually moved. A diff of every field on every save buries
  // the one change that mattered.
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key];
    const to = after[key];
    if (JSON.stringify(from ?? null) !== JSON.stringify(to ?? null)) {
      changed[key] = { from: from ?? null, to: to ?? null };
    }
  }

  const title =
    input.title?.trim() || deriveTitle(registry, after, existing.title);
  const effectiveDate =
    input.effectiveDate && /^\d{4}-\d{2}-\d{2}$/.test(input.effectiveDate)
      ? new Date(`${input.effectiveDate}T00:00:00Z`)
      : existing.effectiveDate;

  const titleChanged = title !== existing.title;
  const statusChanged = (input.status ?? existing.status) !== existing.status;
  const classificationChanged =
    (input.classification ?? existing.classification) !== existing.classification;

  if (
    Object.keys(changed).length === 0 &&
    !titleChanged &&
    !statusChanged &&
    !classificationChanged &&
    effectiveDate?.getTime() === existing.effectiveDate?.getTime()
  ) {
    throw new RecordError("Nothing was changed.", {
      _form: "The submitted entry is identical to the one on file.",
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.record.update({
      where: { id: existing.id },
      data: {
        title,
        data: canonicalise(after as Record<string, never>),
        classification: input.classification ?? existing.classification,
        status: input.status ?? existing.status,
        effectiveDate,
      },
    });

    await appendToChainTx(tx, {
      eventType: "RECORD_AMENDED",
      recordId: record.id,
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        recordNumber: record.recordNumber,
        reason: input.reason.trim(),
        titleFrom: titleChanged ? existing.title : undefined,
        titleTo: titleChanged ? title : undefined,
        statusFrom: statusChanged ? existing.status : undefined,
        statusTo: statusChanged ? record.status : undefined,
        classificationFrom: classificationChanged ? existing.classification : undefined,
        classificationTo: classificationChanged ? record.classification : undefined,
        changed: changed as Record<string, never>,
        /**
         * The full post-amendment state is committed as well as the diff. A
         * chain of diffs alone cannot be independently reconstructed if any
         * single link is ever lost.
         */
        dataAfter: after as Record<string, never>,
      },
    });

    return record;
  });

  await recordAudit(
    principal,
    "record.amend",
    result.recordNumber,
    `${Object.keys(changed).length} field(s): ${input.reason.trim()}`,
  );
  return result;
}

/**
 * Void a record.
 *
 * Nothing is deleted. Voiding sets a notation and commits it to the chain; the
 * record, its history, and its attachments remain. This is not squeamishness —
 * destroying records once a dispute is foreseeable is spoliation, and a court
 * that finds it can instruct a jury to assume the destroyed material was
 * unfavourable. That single adverse inference loses more cases than the
 * underlying facts do.
 */
export async function voidRecord(principal: Principal, recordId: string, reason: string) {
  if (!reason?.trim()) {
    throw new RecordError("State the reason for voiding.", {
      reason: "A reason is required.",
    });
  }

  const existing = await prisma.record.findUnique({
    where: { id: recordId },
    include: { holds: { where: { releasedAt: null } } },
  });
  if (!existing) throw new RecordError("No such record.");
  if (existing.voidedAt) throw new RecordError("This record is already void.");

  if (existing.holds.length > 0) {
    const matters = existing.holds.map((hold) => hold.matter).join(", ");
    throw new RecordError(
      `Refused: this record is under legal hold (${matters}). Release the hold first, and record why.`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.record.update({
      where: { id: existing.id },
      data: { voidedAt: new Date(), voidReason: reason.trim(), status: "VOID" },
    });

    await appendToChainTx(tx, {
      eventType: "RECORD_VOIDED",
      recordId: record.id,
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        recordNumber: record.recordNumber,
        reason: reason.trim(),
        statusBefore: existing.status,
      },
    });

    return record;
  });

  await recordAudit(principal, "record.void", result.recordNumber, reason.trim());
  return result;
}

/** Mark `supersededId` as replaced by `replacementId`, preserving chain of title. */
export async function supersedeRecord(
  principal: Principal,
  supersededId: string,
  replacementId: string,
  note: string,
) {
  const [superseded, replacement] = await Promise.all([
    prisma.record.findUnique({ where: { id: supersededId } }),
    prisma.record.findUnique({ where: { id: replacementId } }),
  ]);
  if (!superseded || !replacement) throw new RecordError("Both records must exist.");
  if (superseded.id === replacement.id) {
    throw new RecordError("A record cannot supersede itself.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.record.update({
      where: { id: superseded.id },
      data: { supersededById: replacement.id, status: "SUPERSEDED" },
    });
    await appendToChainTx(tx, {
      eventType: "RECORD_SUPERSEDED",
      recordId: superseded.id,
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        supersededNumber: superseded.recordNumber,
        replacementNumber: replacement.recordNumber,
        note: note.trim() || null,
      },
    });
  });

  await recordAudit(
    principal,
    "record.supersede",
    superseded.recordNumber,
    `Superseded by ${replacement.recordNumber}`,
  );
}

/** Content digest of a record's committed state, for use on certificates. */
export function recordDigest(record: { recordNumber: string; title: string; data: string }) {
  return sha256Hex(canonicalise({
    recordNumber: record.recordNumber,
    title: record.title,
    data: parseJson<Record<string, never>>(record.data, {}),
  }));
}
