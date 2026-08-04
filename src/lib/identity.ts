/**
 * Identity claims — letting a person prove they are who they say they are.
 *
 * The Kingdom does not inspect anybody's passport. A third-party verifier
 * (Didit) runs the document check, the liveness check and the face match, and
 * this module keeps only the verdict. That division is deliberate and it is the
 * whole security design:
 *
 *   - The register never receives, stores, or transmits an identity document
 *     image, a portrait, a selfie, or a biometric template.
 *   - It stores a document TYPE and issuing COUNTRY, and a SHA-256 digest of the
 *     document number. The digest lets the Registrar notice one document being
 *     used to claim two identities; it cannot be turned back into a number.
 *   - It stores a birth YEAR, not a birth date. A full date of birth is a strong
 *     identifier and a poor thing to lose.
 *
 * Why so careful: holding face geometry exposes an organisation to the Illinois
 * Biometric Information Privacy Act, which carries a private right of action and
 * statutory damages per violation, and to comparable statutes in Texas and
 * Washington. Letting the vendor hold the biometrics and keeping only their
 * answer is what keeps the Kingdom outside that exposure.
 *
 * And the ledger constraint that shapes everything else: THIS CHAIN IS
 * APPEND-ONLY. Anything written into a chain payload is written permanently.
 * So no chain payload here carries a name, an email, a document number or a
 * date of birth — only opaque identifiers, a status, and digests. The erasable
 * personal data lives in a row that can actually be erased, and the chain proves
 * *that a thing happened* without immortalising *who it happened to*.
 *
 * Finally: verification confers nothing. A machine saying "this licence is
 * genuine and matches this face" is not the Kingdom saying "this person is one
 * of ours". Every verified claim lands in a queue for an officer, who decides.
 */
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma } from "./db";
import { appendToChainTx } from "./chain";
import type { CanonicalValue } from "./canonical";

const DIDIT_BASE = "https://verification.didit.me";

/** The account's default "Free KYC" workflow: OCR + liveness + face match. */
export const DEFAULT_WORKFLOW_ID = "88d4f1d3-bdf4-4411-a802-d72cdc4b3c60";

/**
 * Session lifecycle values, verbatim from the verifier.
 *
 * Kept as a literal list rather than a loose string so that an unexpected value
 * is noticed rather than silently treated as a pass. A verifier that invents a
 * new status must not be able to walk somebody into the register.
 */
export const CLAIM_STATUSES = [
  "Not Started",
  "In Progress",
  "Awaiting User",
  "In Review",
  "Approved",
  "Declined",
  "Resubmitted",
  "Expired",
  "Kyc Expired",
  "Abandoned",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export function isClaimStatus(value: unknown): value is ClaimStatus {
  return typeof value === "string" && (CLAIM_STATUSES as readonly string[]).includes(value);
}

/** The one status that means the document and the face both passed. */
export function isApproved(status: string): boolean {
  return status === "Approved";
}

/** Terminal states — nothing further will happen to the session. */
export function isTerminal(status: string): boolean {
  return ["Approved", "Declined", "Expired", "Kyc Expired", "Abandoned"].includes(status);
}

export class IdentityError extends Error {}

function apiKey(): string {
  const key = process.env.DIDIT_API_KEY;
  if (!key) {
    throw new IdentityError(
      "DIDIT_API_KEY is not set. Identity verification is unavailable until it is.",
    );
  }
  return key;
}

/**
 * One-way digest for a document number.
 *
 * Normalised first so that "D1234567" and "d123 4567" collide as they should —
 * the point is to catch the same document twice, and a stray space must not
 * defeat that.
 */
export function documentDigest(documentNumber: string): string {
  const normalised = documentNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return createHash("sha256").update(normalised, "utf8").digest("hex");
}

/** Digest of a person's name, for chain payloads that must not carry the name. */
export function nameDigest(name: string): string {
  const normalised = name.trim().replace(/\s+/g, " ").toLowerCase();
  return createHash("sha256").update(normalised, "utf8").digest("hex");
}

/**
 * A fresh, opaque reference for one claim.
 *
 * This exists because of a sharp edge in the verifier's API: creating a session
 * with a `vendor_data` value that already has an UNFINISHED session returns THAT
 * SESSION instead of a new one. A constant value would therefore hand the second
 * claimant the first claimant's session — two people verifying into one record.
 *
 * So every claim gets its own random reference. It is deliberately opaque: the
 * verifier is a third party and has no business being told the claimant's name,
 * their email, or anything else the Kingdom knows about them.
 */
export function newVendorReference(): string {
  return `apex-claim-${randomUUID()}`;
}

export interface OpenClaimInput {
  claimedName: string;
  claimedEmail?: string | null;
  claimedBasis?: string | null;
  /** Where the verifier returns the person when they are done. */
  callbackUrl: string;
  workflowId?: string;
}

/**
 * Open a claim: record the assertion, ask the verifier for a session, and hand
 * back the URL the person must visit.
 *
 * The row is written BEFORE the verifier is called only in memory — the actual
 * write happens after, in one transaction with the chain entry, so a failed API
 * call cannot leave a dangling claim with no session behind it.
 */
export async function openClaim(input: OpenClaimInput) {
  const claimedName = input.claimedName.trim();
  if (claimedName.length < 2) {
    throw new IdentityError("State the name you are claiming.");
  }
  const callback = input.callbackUrl.trim();
  if (!/^https?:\/\//.test(callback)) {
    throw new IdentityError("The return address must be an absolute URL.");
  }

  const workflowId = input.workflowId ?? DEFAULT_WORKFLOW_ID;

  let response: Response;
  try {
    response = await fetch(`${DIDIT_BASE}/v3/session/`, {
      method: "POST",
      headers: { "x-api-key": apiKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: workflowId,
        // Unique per claim, and opaque. See newVendorReference: a shared value
        // would make the verifier hand a second claimant the first one's
        // session, and the verifier has no business knowing who this is.
        vendor_data: newVendorReference(),
        callback,
      }),
    });
  } catch (cause) {
    throw new IdentityError(
      "The identity verifier could not be reached. Nothing was recorded; try again.",
      { cause },
    );
  }

  if (!response.ok) {
    throw new IdentityError(
      `The identity verifier refused the request (HTTP ${response.status}). Nothing was recorded.`,
    );
  }

  const body = (await response.json()) as {
    session_id?: string;
    url?: string;
    status?: string;
  };
  if (!body.session_id || !body.url) {
    throw new IdentityError("The identity verifier returned an unusable session.");
  }

  const status = isClaimStatus(body.status) ? body.status : "Not Started";

  const claim = await prisma.$transaction(async (tx) => {
    const created = await tx.identityClaim.create({
      data: {
        claimedName,
        claimedEmail: input.claimedEmail?.trim() || null,
        claimedBasis: input.claimedBasis?.trim() || null,
        sessionId: body.session_id!,
        status,
        workflow: workflowId,
      },
    });

    await appendToChainTx(tx, {
      eventType: "IDENTITY_CLAIM_OPENED",
      actorId: null,
      actorLabel: "Public claimant",
      // No name, no email. Only opaque identifiers and a digest.
      payload: {
        claimId: created.id,
        sessionId: created.sessionId,
        workflow: workflowId,
        claimedNameDigest: nameDigest(claimedName),
        status,
      } satisfies CanonicalValue,
    });

    return created;
  });

  return { claim, verificationUrl: body.url };
}

/** Shape of the fields this module is prepared to read out of a decision. */
interface DecisionShape {
  status?: unknown;
  id_verifications?: unknown;
}

function firstIdVerification(decision: DecisionShape): Record<string, unknown> | null {
  const raw = decision.id_verifications;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const first = list[0];
  return first && typeof first === "object" ? (first as Record<string, unknown>) : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Reduce a verifier decision to the few fields the register is willing to hold.
 *
 * Everything else the verifier returns — portrait URLs, document image URLs,
 * full addresses, raw document numbers — is dropped here and never leaves this
 * function. This is the choke point; if it stays narrow, the register cannot
 * accidentally start storing biometrics later.
 */
export function distil(decision: DecisionShape) {
  const status = isClaimStatus(decision.status) ? decision.status : null;
  const idv = firstIdVerification(decision);

  const dobRaw = idv ? str(idv.date_of_birth) : null;
  const yearMatch = dobRaw?.match(/(\d{4})/);
  const birthYear = yearMatch ? Number(yearMatch[1]) : null;

  const documentNumber = idv ? str(idv.document_number) : null;

  return {
    status,
    verifiedGivenName: idv ? str(idv.first_name) : null,
    verifiedFamilyName: idv ? str(idv.last_name) : null,
    documentType: idv ? str(idv.document_type) : null,
    documentCountry: idv ? str(idv.issuing_state) ?? str(idv.issuing_state_name) : null,
    documentDigest: documentNumber ? documentDigest(documentNumber) : null,
    birthYear: birthYear && birthYear > 1900 && birthYear < 2100 ? birthYear : null,
  };
}

/** Fetch a decision from the verifier. */
export async function fetchDecision(sessionId: string): Promise<DecisionShape> {
  const response = await fetch(`${DIDIT_BASE}/v3/session/${encodeURIComponent(sessionId)}/decision/`, {
    method: "GET",
    headers: { "x-api-key": apiKey(), Accept: "application/json" },
  });
  if (!response.ok) {
    throw new IdentityError(`The identity verifier returned HTTP ${response.status}.`);
  }
  return (await response.json()) as DecisionShape;
}

/**
 * Record a decision against a claim.
 *
 * Idempotent by design: webhooks retry, and a retry must not append a second
 * chain entry or overwrite an officer's review. If the status has not changed,
 * this does nothing at all.
 */
export async function recordDecision(sessionId: string, decision: DecisionShape) {
  const distilled = distil(decision);
  const status = distilled.status;
  // Narrowed into a local because the check below happens outside the
  // transaction closure, and TypeScript will not carry the narrowing across it.
  if (!status) {
    throw new IdentityError("The decision carried no recognisable status.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.identityClaim.findUnique({ where: { sessionId } });
    if (!existing) throw new IdentityError("No claim matches that session.");

    // Retry with nothing new to say.
    if (existing.status === status) return existing;

    const approved = isApproved(status);

    const updated = await tx.identityClaim.update({
      where: { sessionId },
      data: {
        status,
        // Personal fields are written ONLY on approval. A declined or abandoned
        // check leaves no trace of the person beyond what they typed themselves.
        verifiedGivenName: approved ? distilled.verifiedGivenName : null,
        verifiedFamilyName: approved ? distilled.verifiedFamilyName : null,
        documentType: approved ? distilled.documentType : null,
        documentCountry: approved ? distilled.documentCountry : null,
        documentDigest: approved ? distilled.documentDigest : null,
        birthYear: approved ? distilled.birthYear : null,
        verifiedAt: approved ? new Date() : null,
      },
    });

    await appendToChainTx(tx, {
      eventType: "IDENTITY_CLAIM_DECIDED",
      actorId: null,
      actorLabel: "Identity verifier",
      payload: {
        claimId: updated.id,
        sessionId,
        status,
        approved,
        // A digest, so the chain can later prove which document was accepted
        // without the ledger ever having held the number.
        documentDigest: approved ? distilled.documentDigest : null,
      } satisfies CanonicalValue,
    });

    return updated;
  });
}

/**
 * Verify a webhook signature.
 *
 * Two independent checks, both required:
 *   1. The timestamp is within five minutes, so a captured request cannot be
 *      replayed later.
 *   2. HMAC-SHA256 over the exact raw body matches, compared in constant time so
 *      the comparison itself does not leak the expected value a byte at a time.
 *
 * An unsigned or stale webhook is not a degraded case to be handled leniently.
 * It is someone trying to write into the register, and it is refused.
 */
export function verifyWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!signature || !timestamp || !secret) return false;

  const sent = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(sent) || Math.abs(now - sent) > 300) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export interface ReviewInput {
  claimId: string;
  accept: boolean;
  note?: string | null;
  officerId: string;
  officerLabel: string;
  /** On acceptance, the Roll of Citizens record this person is. */
  citizenRecordId?: string | null;
}

/**
 * An officer's disposition of a verified claim.
 *
 * Refuses to accept a claim the verifier did not approve. Otherwise the queue
 * becomes a way to admit anyone by clicking the right button, and the identity
 * check becomes decoration.
 */
export async function reviewClaim(input: ReviewInput) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.identityClaim.findUnique({ where: { id: input.claimId } });
    if (!claim) throw new IdentityError("No such claim.");
    if (claim.reviewState !== "PENDING") {
      throw new IdentityError("That claim has already been decided.");
    }
    if (input.accept && !isApproved(claim.status)) {
      throw new IdentityError(
        `The verifier did not approve this claim — its status is "${claim.status}". ` +
          "A claim that failed verification cannot be accepted.",
      );
    }

    const updated = await tx.identityClaim.update({
      where: { id: input.claimId },
      data: {
        reviewState: input.accept ? "ACCEPTED" : "REFUSED",
        reviewedById: input.officerId,
        reviewedAt: new Date(),
        reviewNote: input.note?.trim() || null,
        citizenRecordId: input.accept ? input.citizenRecordId ?? null : null,
      },
    });

    await appendToChainTx(tx, {
      eventType: "IDENTITY_CLAIM_REVIEWED",
      actorId: input.officerId,
      actorLabel: input.officerLabel,
      recordId: input.accept ? input.citizenRecordId ?? null : null,
      payload: {
        claimId: updated.id,
        sessionId: updated.sessionId,
        accepted: input.accept,
        citizenRecordId: updated.citizenRecordId,
      } satisfies CanonicalValue,
    });

    return updated;
  });
}

/**
 * Forget the personal data on a claim, keeping the chain intact.
 *
 * This is how an append-only ledger and a right to erasure coexist. The chain
 * entries stay exactly as they were — they carry no personal data, so there is
 * nothing in them to erase — while the row that did carry it is emptied. What
 * survives is the provable fact that a claim existed and how it was decided,
 * which is what a register is for, without the person's details.
 */
export async function forgetClaim(claimId: string) {
  return prisma.identityClaim.update({
    where: { id: claimId },
    data: {
      claimedName: "[erased]",
      claimedEmail: null,
      claimedBasis: null,
      verifiedGivenName: null,
      verifiedFamilyName: null,
      documentType: null,
      documentCountry: null,
      documentDigest: null,
      birthYear: null,
    },
  });
}
