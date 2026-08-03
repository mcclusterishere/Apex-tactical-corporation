"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPrincipal, assertPermission } from "@/lib/auth";
import { can } from "@/lib/authz";
import { canWriteRegistry } from "@/lib/authz";
import { getRegistry } from "@/registries";
import {
  createRecord,
  amendRecord,
  voidRecord,
  supersedeRecord,
  RecordError,
} from "@/lib/records";
import { appendToChain } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import { isClassification } from "@/lib/classification";

// A "use server" module may only export async functions, so this type is the
// only non-function export permitted here — types are erased at compile time.
export interface FormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Preserved so a rejected form re-renders with what the user typed. */
  values?: Record<string, string | string[]>;
}

/**
 * Pull a registry's declared fields out of FormData.
 *
 * Only declared keys are read. Anything else a client posts is ignored rather
 * than stored, so a crafted request cannot smuggle extra keys into the payload
 * that then get hashed into the chain as though the Registrar had entered them.
 */
function collect(
  registrySlug: string,
  formData: FormData,
): { data: Record<string, unknown>; values: Record<string, string | string[]> } {
  const registry = getRegistry(registrySlug);
  const data: Record<string, unknown> = {};
  const values: Record<string, string | string[]> = {};
  if (!registry) return { data, values };

  for (const field of registry.fields) {
    if (field.type === "multiselect") {
      const all = formData.getAll(field.key).map(String);
      data[field.key] = all;
      values[field.key] = all;
    } else if (field.type === "boolean") {
      const present = formData.get(field.key) !== null;
      data[field.key] = present;
      values[field.key] = present ? "on" : "";
    } else {
      const raw = formData.get(field.key);
      const text = raw === null ? "" : String(raw);
      data[field.key] = text;
      values[field.key] = text;
    }
  }
  return { data, values };
}

function failure(error: unknown, values: Record<string, string | string[]>): FormState {
  if (error instanceof RecordError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors, values };
  }
  console.error("[records] unexpected failure", error);
  return {
    ok: false,
    message: "The entry could not be recorded. The fault has been logged.",
    values,
  };
}

export async function createRecordAction(
  registrySlug: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const registry = getRegistry(registrySlug);
  if (!registry) return { ok: false, message: "No such register." };

  if (!canWriteRegistry(principal.role, registry.restrictedTo)) {
    return {
      ok: false,
      message: `The office of ${principal.role} may not enter records in the ${registry.title}.`,
    };
  }

  const { data, values } = collect(registrySlug, formData);
  const classification = String(formData.get("_classification") ?? registry.defaultClassification);
  const status = String(formData.get("_status") ?? registry.defaultStatus);
  const effectiveDate = String(formData.get("_effectiveDate") ?? "") || null;
  const title = String(formData.get("_title") ?? "");

  let recordId: string;
  try {
    const record = await createRecord(principal, {
      registrySlug,
      data,
      title,
      classification: isClassification(classification) ? classification : undefined,
      status: registry.statuses.some((candidate) => candidate.value === status) ? status : undefined,
      effectiveDate,
    });
    recordId = record.id;
  } catch (error) {
    return failure(error, values);
  }

  revalidatePath(`/registry/${registrySlug}`);
  revalidatePath("/");
  redirect(`/record/${recordId}`);
}

export async function amendRecordAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const existing = await prisma.record.findUnique({ where: { id: recordId } });
  if (!existing) return { ok: false, message: "No such record." };

  const registry = getRegistry(existing.registry);
  if (!registry) return { ok: false, message: "No such register." };

  if (!canWriteRegistry(principal.role, registry.restrictedTo)) {
    return {
      ok: false,
      message: `The office of ${principal.role} may not amend records in the ${registry.title}.`,
    };
  }

  const { data, values } = collect(existing.registry, formData);
  const classification = String(formData.get("_classification") ?? existing.classification);
  const status = String(formData.get("_status") ?? existing.status);
  const effectiveDate = String(formData.get("_effectiveDate") ?? "") || null;
  const title = String(formData.get("_title") ?? "");
  const reason = String(formData.get("_reason") ?? "");

  // Reclassification is a distinct power from amendment: moving a record down a
  // level is a disclosure decision, not a clerical one.
  if (classification !== existing.classification && !can(principal.role, "record:seal")) {
    return {
      ok: false,
      message: "Changing a record's classification requires the power to seal.",
      values,
    };
  }

  try {
    await amendRecord(principal, {
      recordId,
      data,
      title,
      classification: isClassification(classification) ? classification : undefined,
      status: registry.statuses.some((candidate) => candidate.value === status) ? status : undefined,
      effectiveDate,
      reason,
    });
  } catch (error) {
    return failure(error, values);
  }

  revalidatePath(`/record/${recordId}`);
  revalidatePath(`/registry/${existing.registry}`);
  redirect(`/record/${recordId}`);
}

export async function voidRecordAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "record:void");
    await voidRecord(principal, recordId, String(formData.get("reason") ?? ""));
  } catch (error) {
    return failure(error, {});
  }
  revalidatePath(`/record/${recordId}`);
  return { ok: true, message: "The record has been marked void. Its history remains on file." };
}

export async function supersedeRecordAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const replacementNumber = String(formData.get("replacementNumber") ?? "").trim();
  const note = String(formData.get("note") ?? "");

  try {
    assertPermission(principal, "record:amend");
    const replacement = await prisma.record.findUnique({
      where: { recordNumber: replacementNumber },
    });
    if (!replacement) {
      return {
        ok: false,
        message: `No record bears the number ${replacementNumber}.`,
        fieldErrors: { replacementNumber: "Not found." },
      };
    }
    await supersedeRecord(principal, recordId, replacement.id, note);
  } catch (error) {
    return failure(error, {});
  }

  revalidatePath(`/record/${recordId}`);
  return { ok: true, message: "Supersession recorded." };
}

const RELATION_KINDS = new Set([
  "CITES",
  "EVIDENCES",
  "AUTHORIZES",
  "AMENDS",
  "SERVED_ON",
  "DERIVES_FROM",
  "CONCERNS",
  "RESPONDS_TO",
]);

/**
 * Link two records.
 *
 * The links are what make the register answer real questions. "What does the
 * Kingdom own, who is using it, what did we send them, what proves it" is four
 * registers and a chain of relations, not a single row anywhere.
 */
export async function relateRecordAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const targetNumber = String(formData.get("targetNumber") ?? "").trim().toUpperCase();
  const kind = String(formData.get("kind") ?? "CITES").toUpperCase();
  const note = String(formData.get("note") ?? "").trim();

  if (!can(principal.role, "record:amend")) {
    return { ok: false, message: "Linking records requires recording authority." };
  }
  if (!RELATION_KINDS.has(kind)) {
    return { ok: false, message: "Unrecognised relation." };
  }
  if (!targetNumber) {
    return {
      ok: false,
      message: "Give the number of the record to link to.",
      fieldErrors: { targetNumber: "Required." },
    };
  }

  const target = await prisma.record.findUnique({ where: { recordNumber: targetNumber } });
  if (!target) {
    return {
      ok: false,
      message: `No record bears the number ${targetNumber}.`,
      fieldErrors: { targetNumber: "Not found." },
    };
  }
  if (target.id === recordId) {
    return { ok: false, message: "A record cannot be linked to itself." };
  }

  try {
    await prisma.recordRelation.create({
      data: { fromId: recordId, toId: target.id, kind, note: note || null },
    });
  } catch {
    // The unique constraint on (from, to, kind) makes a repeat a no-op, not an error.
    return { ok: false, message: "That link already exists." };
  }

  await recordAudit(principal, "record.relate", targetNumber, kind);
  revalidatePath(`/record/${recordId}`);
  revalidatePath(`/record/${target.id}`);
  return { ok: true, message: `Linked to ${targetNumber}.` };
}

export async function issueHoldAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const matter = String(formData.get("matter") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!matter || !reason) {
    return {
      ok: false,
      message: "Name the matter and state why preservation is required.",
      fieldErrors: {
        ...(matter ? {} : { matter: "Required." }),
        ...(reason ? {} : { reason: "Required." }),
      },
    };
  }

  try {
    assertPermission(principal, "hold:issue");
    const hold = await prisma.legalHold.create({
      data: {
        recordId,
        matter,
        reason,
        issuedBy: `${principal.displayName} (${principal.role})`,
      },
    });
    await appendToChain({
      eventType: "HOLD_ISSUED",
      recordId,
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { holdId: hold.id, matter, reason },
    });
    await recordAudit(principal, "hold.issue", recordId, matter);
  } catch (error) {
    return failure(error, {});
  }

  revalidatePath(`/record/${recordId}`);
  return {
    ok: true,
    message: "Legal hold issued. This record can no longer be voided until the hold is released.",
  };
}

export async function releaseHoldAction(
  holdId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return {
      ok: false,
      message: "State why the hold is being released.",
      fieldErrors: { reason: "Required — releasing a hold is a decision that gets questioned." },
    };
  }

  try {
    assertPermission(principal, "hold:release");
    const hold = await prisma.legalHold.update({
      where: { id: holdId },
      data: {
        releasedAt: new Date(),
        releasedBy: `${principal.displayName} (${principal.role})`,
      },
    });
    await appendToChain({
      eventType: "HOLD_RELEASED",
      recordId: hold.recordId,
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: { holdId, matter: hold.matter, reason },
    });
    await recordAudit(principal, "hold.release", hold.recordId, reason);
    revalidatePath(`/record/${hold.recordId}`);
  } catch (error) {
    return failure(error, {});
  }

  return { ok: true, message: "Hold released." };
}

export async function completeDeadlineAction(
  deadlineId: string,
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "deadline:manage");
    const deadline = await prisma.deadline.update({
      where: { id: deadlineId },
      data: {
        completedAt: new Date(),
        completedBy: `${principal.displayName} (${principal.role})`,
      },
    });
    await recordAudit(principal, "deadline.complete", deadline.recordId, deadline.title);
    if (deadline.recordId) revalidatePath(`/record/${deadline.recordId}`);
    revalidatePath("/calendar");
    revalidatePath("/");
  } catch (error) {
    return failure(error, {});
  }
  return { ok: true, message: "Marked done." };
}
