import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { canView } from "@/lib/classification";
import { readStoredFile } from "@/lib/storage";
import { recordAudit } from "@/lib/audit";

/**
 * Serve an attachment.
 *
 * Attachments carry their own classification, which may be stricter than the
 * record they hang from — an otherwise public property record can have a sealed
 * appraisal attached. Both are checked.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const principal = await getPrincipal();

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { record: { select: { recordNumber: true, classification: true } } },
  });

  if (
    !attachment ||
    !canView(principal.clearance, attachment.record.classification) ||
    !canView(principal.clearance, attachment.classification)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = await readStoredFile(attachment.storageKey);
  if (!bytes) {
    console.error("[attachment] stored file missing", {
      id: attachment.id,
      storageKey: attachment.storageKey,
    });
    return new NextResponse(
      "The record references this attachment, but the stored file is missing. Report this to the Registrar.",
      { status: 410 },
    );
  }

  await recordAudit(
    principal,
    "attachment.download",
    attachment.record.recordNumber,
    `${attachment.filename} (${attachment.sha256.slice(0, 16)}…)`,
  );

  // Everything is served as an attachment with a neutral content type. Rendering
  // uploaded material inline would let an evidence file execute script in the
  // context of this application, which is exactly the wrong place for it.
  //
  // The filename needs both forms. HTTP header values are Latin-1, so a name in
  // Cyrillic, Chinese, or Arabic — or one carrying a curly apostrophe — throws
  // when set, and the download 500s permanently with the file intact and
  // unreachable. `filename*` carries the real name per RFC 5987/6266; the plain
  // `filename` is an ASCII fallback for anything that does not understand it.
  const ascii = attachment.filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\\r\n]/g, "_");
  const disposition =
    `attachment; filename="${ascii || "attachment"}"; ` +
    `filename*=UTF-8''${encodeURIComponent(attachment.filename)}`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": disposition,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
      // The digest travels with the download so a recipient can check it.
      "X-Content-SHA256": attachment.sha256,
    },
  });
}
