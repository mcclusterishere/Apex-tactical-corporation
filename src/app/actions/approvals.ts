"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertMfa, assertStepUp, isAuthenticated } from "@/lib/auth";
import { asRole, isRole, type Role } from "@/lib/authz";
import { assertPasswordChanged } from "@/lib/access";
import { appendToChain } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import { activeKeyFor, signMessage } from "@/lib/signing";
import { canonicalise } from "@/lib/canonical";
import { SUBJECT_TYPES } from "@/lib/approvals";
import type { FormState } from "@/app/actions/records";

/**
 * Dual control.
 *
 * Every institution that has lost money to an insider had one person who could
 * complete the whole transaction alone. This is the mechanism that stops that,
 * and its value is entirely in the constraints:
 *
 *   - An officer may not approve their own request. Enforced below and by a
 *     unique constraint on (approvalId, userId), so an officer cannot reach a
 *     quorum by voting twice either.
 *   - A rejection ends the request. Quorum is for approving, not for outvoting
 *     a colleague who saw a problem.
 *   - An approval may carry a detached signature, so consent is provable rather
 *     than merely recorded in a table someone could edit.
 */

export async function requestApprovalAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const subjectType = String(formData.get("subjectType") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const requiredRaw = Number(formData.get("requiredCount") ?? 2);
  const eligible = formData.getAll("eligibleRoles").map(String).filter(isRole);

  if (!(SUBJECT_TYPES as readonly string[]).includes(subjectType)) {
    return { ok: false, message: "Choose what is being approved." };
  }
  if (!summary) {
    return { ok: false, message: "Say what is being approved.", fieldErrors: { summary: "Required." } };
  }
  const requiredCount = Number.isInteger(requiredRaw) && requiredRaw >= 2 && requiredRaw <= 5 ? requiredRaw : 2;

  const approval = await prisma.approval.create({
    data: {
      subjectType,
      subjectId: subjectId || "—",
      summary,
      reason: reason || null,
      requiredCount,
      eligibleRoles: eligible.length > 0 ? eligible.join(",") : null,
      requestedBy: `${principal.displayName} (${principal.role})`,
      requestedById: principal.id,
      // A request that nobody acts on should lapse rather than sit as a live
      // authorisation indefinitely.
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await appendToChain({
    eventType: "APPROVAL_REQUESTED",
    actorId: principal.id,
    actorLabel: `${principal.displayName} (${principal.role})`,
    payload: {
      approvalId: approval.id,
      subjectType,
      subjectId: approval.subjectId,
      summary,
      requiredCount,
    },
  });

  await recordAudit(principal, "approval.request", approval.id, summary);
  revalidatePath("/approvals");
  return {
    ok: true,
    message: `Requested. ${requiredCount} approvals are needed, and yours does not count toward them.`,
  };
}

export async function voteApprovalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const approvalId = String(formData.get("approvalId") ?? "");
  const decision = String(formData.get("decision") ?? "").toUpperCase();
  const note = String(formData.get("note") ?? "").trim();
  const passphrase = String(formData.get("signingPassphrase") ?? "");

  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
    assertStepUp(principal, "Approving a controlled act");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  if (decision !== "APPROVE" && decision !== "REJECT") {
    return { ok: false, message: "Choose approve or reject." };
  }

  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { votes: true },
  });
  if (!approval) return { ok: false, message: "No such request." };
  if (approval.status !== "PENDING") {
    return { ok: false, message: `That request is already ${approval.status.toLowerCase()}.` };
  }
  if (approval.expiresAt && approval.expiresAt < new Date()) {
    await prisma.approval.update({ where: { id: approvalId }, data: { status: "EXPIRED" } });
    return { ok: false, message: "That request has lapsed. Raise it again if it is still needed." };
  }

  // The requester's own consent is implicit in having asked; counting it would
  // let one officer complete a two-officer control alone.
  if (approval.requestedById === principal.id) {
    return {
      ok: false,
      message:
        "You raised this request. Approving your own request would defeat the control it exists to provide.",
    };
  }

  if (approval.eligibleRoles) {
    const eligible = approval.eligibleRoles.split(",").filter(isRole) as Role[];
    if (eligible.length > 0 && !eligible.includes(asRole(principal.role))) {
      return {
        ok: false,
        message: `This request may be decided by ${eligible.join(", ").toLowerCase()} only.`,
      };
    }
  }

  if (approval.votes.some((vote) => vote.userId === principal.id)) {
    return { ok: false, message: "You have already voted on this request." };
  }

  // Sign the decision where the officer holds a key, so consent is provable.
  let signature: string | null = null;
  let keyId: string | null = null;
  if (passphrase) {
    const key = await activeKeyFor(principal.id);
    if (key) {
      try {
        signature = signMessage(
          canonicalise({
            v: 1,
            approvalId: approval.id,
            subjectType: approval.subjectType,
            subjectId: approval.subjectId,
            decision,
          }),
          key.privateKeyEnc,
          key.wrapSalt,
          passphrase,
        );
        keyId = key.id;
      } catch {
        return { ok: false, message: "The signing passphrase was not accepted." };
      }
    }
  }

  const outcome = await prisma.$transaction(async (tx) => {
    await tx.approvalVote.create({
      data: {
        approvalId: approval.id,
        userId: principal.id,
        decision,
        note: note || null,
        signature,
        keyId,
      },
    });

    const votes = await tx.approvalVote.findMany({ where: { approvalId: approval.id } });
    const approvals = votes.filter((vote) => vote.decision === "APPROVE").length;
    const rejected = votes.some((vote) => vote.decision === "REJECT");

    // One rejection ends it. Quorum is for approving, not for outvoting the
    // officer who spotted the problem.
    const status = rejected
      ? "REJECTED"
      : approvals >= approval.requiredCount
        ? "APPROVED"
        : "PENDING";

    if (status !== "PENDING") {
      await tx.approval.update({
        where: { id: approval.id },
        data: { status, decidedAt: new Date() },
      });
    }
    return { status, approvals };
  });

  await appendToChain({
    eventType: decision === "APPROVE" ? "APPROVAL_GRANTED" : "APPROVAL_REJECTED",
    actorId: principal.id,
    actorLabel: `${principal.displayName} (${principal.role})`,
    payload: {
      approvalId: approval.id,
      subjectType: approval.subjectType,
      subjectId: approval.subjectId,
      decision,
      note: note || null,
      signed: Boolean(signature),
      resultingStatus: outcome.status,
    },
  });

  await recordAudit(principal, `approval.${decision.toLowerCase()}`, approval.id, note || approval.summary);
  revalidatePath("/approvals");

  return {
    ok: true,
    message:
      outcome.status === "APPROVED"
        ? "Approved. The requesting officer may now proceed."
        : outcome.status === "REJECTED"
          ? "Rejected. The request is closed."
          : `Recorded. ${outcome.approvals} of ${approval.requiredCount} approvals received.`,
  };
}

export async function markExecutedAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  const approvalId = String(formData.get("approvalId") ?? "");

  if (!isAuthenticated(principal)) return { ok: false, message: "Sign in first." };

  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) return { ok: false, message: "No such request." };
  if (approval.status !== "APPROVED") {
    return { ok: false, message: "Only an approved request can be marked executed." };
  }

  await prisma.approval.update({
    where: { id: approvalId },
    data: { status: "EXECUTED", executedAt: new Date() },
  });
  await recordAudit(principal, "approval.executed", approvalId, approval.summary);
  revalidatePath("/approvals");
  return { ok: true, message: "Marked executed." };
}
