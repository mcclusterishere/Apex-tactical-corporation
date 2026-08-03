"use server";

import { revalidatePath } from "next/cache";
import { getPrincipal, assertPermission, assertMfa } from "@/lib/auth";
import { cutCheckpoint } from "@/lib/merkle";
import { appendToChain } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

/**
 * Cut a checkpoint over the transparency log.
 *
 * The checkpoint is itself committed to the chain, so the claim "root R covered
 * N entries at time T" is as tamper-evident as everything else. Without that, a
 * checkpoint would be a row anyone with database access could add after the fact.
 */
export async function cutCheckpointAction(
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPermission(principal, "chain:anchor");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const result = await cutCheckpoint();
  if (result.treeSize === 0) {
    return { ok: false, message: "The ledger is empty; there is nothing to checkpoint." };
  }
  if (!result.created) {
    return {
      ok: true,
      message: `A checkpoint already covers all ${result.treeSize} entries. Nothing has been recorded since.`,
    };
  }

  await appendToChain({
    eventType: "CHECKPOINT_CUT",
    actorId: principal.id,
    actorLabel: `${principal.displayName} (${principal.role})`,
    payload: { treeSize: result.treeSize, rootHash: result.rootHash },
  });

  await recordAudit(principal, "log.checkpoint", String(result.treeSize), result.rootHash);
  revalidatePath("/log");
  revalidatePath("/chain");

  return {
    ok: true,
    message: `Checkpoint cut over ${result.treeSize} entries. Publish this root in the gazette and anchor it externally — a root nobody outside the Kingdom has seen proves nothing.`,
  };
}
