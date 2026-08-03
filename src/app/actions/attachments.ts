"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertPermission } from "@/lib/auth";
import { canView, isClassification } from "@/lib/classification";
import { storeFile, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { appendToChainTx } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

/**
 * Attach material to a record.
 *
 * The digest is computed over the exact bytes received and committed to the
 * ledger in the same transaction as the attachment row. From that moment the
 * Kingdom can prove what it holds; without it, "this is the file we were sent"
 * is an assertion rather than a fact.
 */
export async function addAttachmentAction(
  recordId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "attachment:add");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const record = await prisma.record.findUnique({ where: { id: recordId } });
  if (!record) return { ok: false, message: "No such record." };
  if (!canView(principal.clearance, record.classification)) {
    return { ok: false, message: "No such record." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to attach.", fieldErrors: { file: "Required." } };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is ${(
        MAX_UPLOAD_BYTES /
        1024 /
        1024
      ).toFixed(0)} MB.`,
    };
  }

  const acquiredFrom = String(formData.get("acquiredFrom") ?? "").trim();
  const acquiredAtRaw = String(formData.get("acquiredAt") ?? "").trim();
  const collectionNote = String(formData.get("collectionNote") ?? "").trim();
  const classificationRaw = String(formData.get("classification") ?? record.classification);
  const classification = isClassification(classificationRaw)
    ? classificationRaw
    : record.classification;

  if (!collectionNote) {
    return {
      ok: false,
      message: "Describe how this item was obtained.",
      fieldErrors: {
        collectionNote:
          "Required. Without it, nobody can later testify to where the item came from.",
      },
    };
  }

  let stored;
  try {
    stored = await storeFile(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The file could not be stored.",
    };
  }

  const acquiredAt =
    acquiredAtRaw && /^\d{4}-\d{2}-\d{2}$/.test(acquiredAtRaw)
      ? new Date(`${acquiredAtRaw}T00:00:00Z`)
      : null;

  try {
    await prisma.$transaction(async (tx) => {
      const attachment = await tx.attachment.create({
        data: {
          recordId,
          filename: file.name.slice(0, 255) || "untitled",
          contentType: file.type || "application/octet-stream",
          byteSize: stored.byteSize,
          sha256: stored.sha256,
          storageKey: stored.storageKey,
          acquiredFrom: acquiredFrom || null,
          acquiredAt,
          collectionNote,
          classification,
          uploadedById: principal.id,
        },
      });

      // Receipt is the first link in the custody record.
      await tx.custodyEvent.create({
        data: {
          attachmentId: attachment.id,
          action: "RECEIVED",
          actor: `${principal.displayName} (${principal.role})`,
          counterparty: acquiredFrom || null,
          occurredAt: acquiredAt ?? new Date(),
          note: collectionNote,
        },
      });

      await appendToChainTx(tx, {
        eventType: "ATTACHMENT_ADDED",
        recordId,
        actorId: principal.id,
        actorLabel: `${principal.displayName} (${principal.role})`,
        payload: {
          attachmentId: attachment.id,
          recordNumber: record.recordNumber,
          filename: attachment.filename,
          contentType: attachment.contentType,
          byteSize: attachment.byteSize,
          sha256: attachment.sha256,
          acquiredFrom: acquiredFrom || null,
          acquiredAt: acquiredAt ? acquiredAt.toISOString().slice(0, 10) : null,
          collectionNote,
        },
      });
    });
  } catch (error) {
    console.error("[attachments] failed", error);
    return { ok: false, message: "The attachment could not be recorded." };
  }

  await recordAudit(principal, "attachment.add", record.recordNumber, file.name);
  revalidatePath(`/record/${recordId}`);

  return {
    ok: true,
    message: stored.deduplicated
      ? `Attached. This file is byte-identical to one already held; both entries reference the same content, digest ${stored.sha256.slice(0, 16)}…`
      : `Attached and digested. SHA-256 ${stored.sha256.slice(0, 16)}…`,
  };
}

export async function logCustodyAction(
  attachmentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "custody:log");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const action = String(formData.get("action") ?? "").trim().toUpperCase();
  const counterparty = String(formData.get("counterparty") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const occurredRaw = String(formData.get("occurredAt") ?? "").trim();

  const permitted = new Set([
    "RECEIVED",
    "TRANSFERRED",
    "EXAMINED",
    "COPIED",
    "PRODUCED",
    "RETURNED",
    "SEALED",
  ]);
  if (!permitted.has(action)) {
    return { ok: false, message: "Choose a custody action." };
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { record: true },
  });
  if (!attachment) return { ok: false, message: "No such attachment." };

  const occurredAt =
    occurredRaw && /^\d{4}-\d{2}-\d{2}$/.test(occurredRaw)
      ? new Date(`${occurredRaw}T00:00:00Z`)
      : new Date();

  await prisma.$transaction(async (tx) => {
    const event = await tx.custodyEvent.create({
      data: {
        attachmentId,
        action,
        actor: `${principal.displayName} (${principal.role})`,
        counterparty: counterparty || null,
        occurredAt,
        note: note || null,
      },
    });

    await appendToChainTx(tx, {
      eventType: "CUSTODY_EVENT",
      recordId: attachment.recordId,
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        custodyEventId: event.id,
        attachmentId,
        sha256: attachment.sha256,
        action,
        counterparty: counterparty || null,
        occurredAt: occurredAt.toISOString(),
        note: note || null,
      },
    });
  });

  await recordAudit(principal, "custody.log", attachment.record.recordNumber, action);
  revalidatePath(`/record/${attachment.recordId}`);
  return { ok: true, message: "Custody event recorded." };
}
