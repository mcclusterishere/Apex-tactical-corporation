"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertPermission } from "@/lib/auth";
import { appendToChainTx, getChainHead } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

export async function publishGazetteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "gazette:publish");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) {
    return {
      ok: false,
      message: "An issue needs a title and a body.",
      fieldErrors: {
        ...(title ? {} : { title: "Required." }),
        ...(body ? {} : { body: "Required." }),
      },
      values: { title, summary, body },
    };
  }

  const head = await getChainHead();

  try {
    await prisma.$transaction(async (tx) => {
      const last = await tx.gazetteIssue.findFirst({
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const number = (last?.number ?? 0) + 1;

      const issue = await tx.gazetteIssue.create({
        data: {
          number,
          title,
          summary: summary || null,
          body,
          chainHead: head?.entryHash ?? null,
          chainSeq: head?.sequence ?? null,
        },
      });

      await appendToChainTx(tx, {
        eventType: "GAZETTE_PUBLISHED",
        actorId: principal.id,
        actorLabel: `${principal.displayName} (${principal.role})`,
        payload: {
          issueId: issue.id,
          number,
          title,
          summary: summary || null,
          // The body is digested into the payload, so a later edit to the stored
          // text would break the chain.
          body,
          headAtPublication: head?.entryHash ?? null,
        },
      });
    });
  } catch (error) {
    console.error("[gazette] publish failed", error);
    return { ok: false, message: "The issue could not be published.", values: { title, summary, body } };
  }

  await recordAudit(principal, "gazette.publish", title);
  revalidatePath("/gazette");
  revalidatePath("/");
  return { ok: true, message: "Issue published." };
}
