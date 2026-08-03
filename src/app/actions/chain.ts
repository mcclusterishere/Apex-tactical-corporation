"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertPermission } from "@/lib/auth";
import { appendToChain, getChainHead } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

const METHODS = new Set([
  "GAZETTE",
  "RFC3161",
  "CERTIFIED_MAIL",
  "GIT_COMMIT",
  "EXTERNAL_FILING",
  "MANUAL",
]);

/**
 * Record that the chain head has been published outside the Kingdom.
 *
 * The anchor row is itself committed to the chain. That is deliberate: it means
 * the claim "we published head H on date D" is as tamper-evident as everything
 * else, and a later attempt to fabricate an anchor cannot be slipped in without
 * breaking the sequence.
 */
export async function recordAnchorAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "chain:anchor");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const method = String(formData.get("method") ?? "MANUAL");
  const externalRef = String(formData.get("externalRef") ?? "").trim();
  const externalNote = String(formData.get("externalNote") ?? "").trim();

  if (!METHODS.has(method)) {
    return { ok: false, message: "Unrecognised anchoring method." };
  }
  if (!externalRef) {
    return {
      ok: false,
      message: "Record the external reference — the tracking number, commit, receipt, or token.",
      fieldErrors: {
        externalRef:
          "Required. An anchor nobody can look up is not an anchor.",
      },
    };
  }

  /**
   * Anchor the head the officer actually published, not the head as it stands
   * now.
   *
   * These are not the same. The officer reads a head hash off this page, prints
   * it, mails it, gets the timestamp token — that takes minutes at best and days
   * for certified mail. Meanwhile the register keeps moving. Reading
   * `getChainHead()` at submit time would record the anchor against entries that
   * were never in the published document, and the anchor's whole value is the
   * claim "every entry at or below this position existed by this date". Anchor
   * the wrong head and that claim is false — which is worse than not anchoring,
   * because it is a false statement about evidence.
   *
   * So the hash comes from the form, and it must be a hash this ledger actually
   * produced.
   */
  const publishedHash = String(formData.get("headHash") ?? "").trim();
  if (!/^[0-9a-f]{64}$/.test(publishedHash)) {
    return { ok: false, message: "The head hash is missing or malformed. Reload and try again." };
  }

  const anchored = await prisma.ledgerEntry.findUnique({
    where: { entryHash: publishedHash },
    select: { sequence: true, entryHash: true },
  });
  if (!anchored) {
    return {
      ok: false,
      message:
        "No entry in this ledger bears that hash. Either the published head came from a " +
        "different database, or the ledger has been altered since it was read. Do not record " +
        "this anchor — run `npm run chain:verify` first.",
    };
  }

  const head = await getChainHead();
  if (!head) {
    return { ok: false, message: "The ledger is empty; there is nothing to anchor." };
  }

  try {
    const anchor = await prisma.chainAnchor.create({
      data: {
        sequence: anchored.sequence,
        headHash: anchored.entryHash,
        method,
        externalRef,
        externalNote: externalNote || null,
      },
    });

    await appendToChain({
      eventType: "CHAIN_ANCHORED",
      actorId: principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        anchorId: anchor.id,
        sequence: anchored.sequence,
        headHash: anchored.entryHash,
        // How far the ledger had already moved past the published head when the
        // anchor was recorded. Zero is the ideal; a large number means the
        // anchoring routine is running late and those entries are still resting
        // on the Kingdom's own word.
        entriesAppendedSincePublication: head.sequence - anchored.sequence,
        method,
        externalRef,
        externalNote: externalNote || null,
      },
    });

    await recordAudit(
      principal,
      "chain.anchor",
      `#${anchored.sequence}`,
      `${method} ref ${externalRef}`,
    );
  } catch (error) {
    console.error("[chain] anchor failed", error);
    return { ok: false, message: "The anchor could not be recorded." };
  }

  revalidatePath("/chain");
  revalidatePath("/");
  return {
    ok: true,
    message:
      `Anchor recorded at position #${anchored.sequence}. Every entry at or below that position ` +
      `is now provably older than today.` +
      (head.sequence > anchored.sequence
        ? ` ${head.sequence - anchored.sequence} entr${head.sequence - anchored.sequence === 1 ? "y has" : "ies have"} been ` +
          `committed since that head was published and ${head.sequence - anchored.sequence === 1 ? "is" : "are"} not covered — anchor again to reach the current head.`
        : ""),
  };
}
