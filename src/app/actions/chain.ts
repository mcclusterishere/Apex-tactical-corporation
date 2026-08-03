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

  const head = await getChainHead();
  if (!head) {
    return { ok: false, message: "The ledger is empty; there is nothing to anchor." };
  }

  try {
    const anchor = await prisma.chainAnchor.create({
      data: {
        sequence: head.sequence,
        headHash: head.entryHash,
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
        sequence: head.sequence,
        headHash: head.entryHash,
        method,
        externalRef,
        externalNote: externalNote || null,
      },
    });

    await recordAudit(
      principal,
      "chain.anchor",
      `#${head.sequence}`,
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
    message: `Anchor recorded at position #${head.sequence}. Every entry at or below that position is now provably older than today.`,
  };
}
