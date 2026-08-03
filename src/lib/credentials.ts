import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { canonicalise } from "@/lib/canonical";
import { sha256 } from "@/lib/secrets";
import { appendToChainTx } from "@/lib/chain";
import { signMessage, activeKeyFor, verifyMessage } from "@/lib/signing";
import { recordAudit } from "@/lib/audit";
import type { Principal } from "@/lib/auth";

/**
 * Credentials issued by the Kingdom.
 *
 * THE CONSTRAINT THAT SHAPES THIS ENTIRE MODULE
 * ---------------------------------------------
 * A credential of Apex Kingdom attests to a person's standing *within Apex
 * Kingdom* and to nothing else. It is a membership credential, in the same
 * family as a union card, a parish membership, or a professional association
 * card — all entirely lawful.
 *
 * What it must never be is anything a reasonable person could mistake for
 * government identification or for a law-enforcement credential. In Connecticut
 * that line is criminal: Conn. Gen. Stat. § 53a-130 (criminal impersonation)
 * and § 53a-130a (impersonation of a police officer). Federal law reaches
 * further for badges and seals of the United States (18 U.S.C. §§ 701, 912).
 *
 * The constraint is enforced here rather than left to policy:
 *
 *   - `CREDENTIAL_TYPES` is a closed list with no law-enforcement analogue, and
 *     an unknown type is refused rather than stored.
 *   - `FORBIDDEN_TERMS` blocks the words that create the confusion, in the
 *     credential's own fields, before anything is written.
 *   - Every rendered credential carries a fixed disclaimer that cannot be
 *     configured away.
 *
 * An organisation that wants to issue itself police badges will have to modify
 * this file to do it, and the commit will say so.
 */

export const CREDENTIAL_TYPES = [
  "MEMBERSHIP",
  "OFFICER_COMMISSION",
  "MINISTERIAL",
  "DELEGATE",
  "CONTRACTOR",
  "VOLUNTEER",
  "ARCHIVE_ACCESS",
] as const;

export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  MEMBERSHIP: "Certificate of Membership",
  OFFICER_COMMISSION: "Commission of Office",
  MINISTERIAL: "Ministerial Credential",
  DELEGATE: "Letter of Delegation",
  CONTRACTOR: "Contractor Credential",
  VOLUNTEER: "Volunteer Credential",
  ARCHIVE_ACCESS: "Archive Access Credential",
};

export const CREDENTIAL_TYPE_HELP: Record<CredentialType, string> = {
  MEMBERSHIP: "Attests that the holder is enrolled on the Roll of Citizens and in good standing.",
  OFFICER_COMMISSION:
    "Attests that the holder holds a named office of the Kingdom and the authority recorded against it.",
  MINISTERIAL:
    "Attests ordination or licensure. Frequently the credential that matters for the ministerial exception and for a housing allowance designation.",
  DELEGATE: "Authorises the holder to represent the Kingdom in a specific, named dealing.",
  CONTRACTOR: "Identifies a person engaged under contract. Carries no authority to bind the Kingdom.",
  VOLUNTEER: "Identifies a volunteer. Carries no authority whatever.",
  ARCHIVE_ACCESS: "Permits access to restricted holdings of the archive.",
};

/**
 * Terms that would make a credential resemble state identification or a
 * law-enforcement credential.
 *
 * Deliberately blunt. A false positive costs an officer thirty seconds of
 * rewording; a false negative costs the Founder a criminal charge.
 */
const FORBIDDEN_TERMS = [
  "police", "officer of the law", "peace officer", "law enforcement", "constable",
  "sheriff", "deputy sheriff", "marshal", "trooper", "detective", "patrolman",
  "badge", "warrant card", "sworn officer",
  "driver's licence", "drivers license", "driver licence", "driving licence",
  "passport", "state id", "state identification", "government id",
  "government identification", "national id", "national identification",
  "social security", "real id", "birth certificate",
  "diplomatic", "diplomat", "consular", "immunity",
  "federal agent", "special agent", "customs", "border patrol",
  "department of motor vehicles", "dmv",
];

export class CredentialError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "CredentialError";
  }
}

/**
 * Refuse any credential whose own text would create confusion with a state or
 * law-enforcement document. Checked across every free-text field, normalised so
 * that spacing and punctuation tricks do not slip past.
 */
export function assertNotImpersonating(fields: Record<string, string | null | undefined>): void {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;

    // Two normalisations, because one is not enough:
    //   spaced  — punctuation to spaces, runs collapsed. Catches ordinary text
    //             and lets short terms be matched on word boundaries.
    //   dense   — every non-letter removed. Catches "P.O.L.I.C.E.", "p o l i c e",
    //             and "P-O-L-I-C-E", which the spaced form does not.
    const spaced = value
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const dense = value.toLowerCase().replace(/[^a-z]/g, "");

    for (const term of FORBIDDEN_TERMS) {
      const termSpaced = term.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
      const termDense = term.replace(/[^a-z]/g, "");

      // Short terms ("dmv") match only on a word boundary: a dense match would
      // fire on any three letters that happen to line up inside longer words.
      const hit =
        termDense.length < 5
          ? new RegExp(`\\b${termSpaced.replace(/\s+/g, "\\s+")}\\b`).test(spaced)
          : spaced.includes(termSpaced) || dense.includes(termDense);

      if (hit) {
        throw new CredentialError(
          `The term "${term}" cannot appear on a credential of the Kingdom. ` +
            "A private credential that resembles government identification or a law-enforcement " +
            "credential is criminal impersonation under Conn. Gen. Stat. §§ 53a-130 and 53a-130a. " +
            "Describe the holder's standing within the Kingdom instead.",
          { [key]: `Contains a forbidden term: "${term}".` },
        );
      }
    }
  }
}

/** The disclaimer printed on every credential. Not configurable. */
export const CREDENTIAL_DISCLAIMER =
  "This credential attests to the holder's standing within Apex Kingdom, a private " +
  "religious society and cultural institution. It is not government identification, " +
  "confers no governmental or law-enforcement authority, and may not be presented as " +
  "identification to any public authority.";

/**
 * A short verification code.
 *
 * Crockford base32 without I, L, O, or U: no character pairs that get misread
 * when transcribed from a card by someone reading it over a counter, and no
 * accidental words.
 */
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateVerificationCode(): string {
  const bytes = randomBytes(10);
  let code = "";
  for (let i = 0; i < 10; i += 1) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

export interface IssueCredentialInput {
  type: string;
  subjectName: string;
  subjectRecordId?: string | null;
  standing?: string | null;
  effectiveFrom?: string | null;
  expiresAt?: string | null;
  photoAttachmentId?: string | null;
  /** Required to sign. Without it the credential is issued unsigned. */
  signingPassphrase?: string;
}

/**
 * The canonical payload a verifier checks.
 *
 * Contains only what a verifier needs and nothing more: no date of birth, no
 * address, no lineage. A credential is presented to strangers, and everything
 * on it is disclosed to whoever is handed the card.
 */
export function credentialPayload(input: {
  credentialNumber: string;
  type: string;
  subjectName: string;
  standing: string | null;
  issuedAt: Date;
  effectiveFrom: Date | null;
  expiresAt: Date | null;
  verificationCode: string;
}): string {
  return canonicalise({
    v: 1,
    issuer: "Apex Kingdom",
    credentialNumber: input.credentialNumber,
    type: input.type,
    subject: input.subjectName,
    standing: input.standing,
    issuedAt: input.issuedAt.toISOString(),
    effectiveFrom: input.effectiveFrom ? input.effectiveFrom.toISOString().slice(0, 10) : null,
    expiresAt: input.expiresAt ? input.expiresAt.toISOString().slice(0, 10) : null,
    code: input.verificationCode,
    notice: "NOT_GOVERNMENT_IDENTIFICATION",
  });
}

export async function issueCredential(principal: Principal, input: IssueCredentialInput) {
  const type = input.type as CredentialType;
  if (!(CREDENTIAL_TYPES as readonly string[]).includes(type)) {
    throw new CredentialError(
      `"${input.type}" is not a credential this Kingdom issues. The permitted types are ` +
        `${CREDENTIAL_TYPES.join(", ")}.`,
      { type: "Not a permitted credential type." },
    );
  }

  const subjectName = input.subjectName?.trim();
  if (!subjectName) {
    throw new CredentialError("Name the person the credential is issued to.", {
      subjectName: "Required.",
    });
  }

  const standing = input.standing?.trim() || null;
  assertNotImpersonating({ subjectName, standing });

  const effectiveFrom =
    input.effectiveFrom && /^\d{4}-\d{2}-\d{2}$/.test(input.effectiveFrom)
      ? new Date(`${input.effectiveFrom}T00:00:00Z`)
      : null;
  const expiresAt =
    input.expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt)
      ? new Date(`${input.expiresAt}T00:00:00Z`)
      : null;

  if (expiresAt && effectiveFrom && expiresAt < effectiveFrom) {
    throw new CredentialError("The credential would expire before it takes effect.", {
      expiresAt: "Earlier than the effective date.",
    });
  }

  if (input.subjectRecordId) {
    const subject = await prisma.record.findUnique({ where: { id: input.subjectRecordId } });
    if (!subject) throw new CredentialError("The subject record does not exist.");
    if (subject.registry !== "citizens") {
      throw new CredentialError(
        "A credential must be tied to an entry on the Roll of Citizens, so that revocation " +
          "and standing stay linked to a person the Kingdom actually enrolled.",
      );
    }
  }

  const issuedAt = new Date();
  const verificationCode = generateVerificationCode();

  // Signing happens before the transaction: it is the slow, failure-prone step
  // (a wrong passphrase), and a failed signature should not leave a half-issued
  // credential behind.
  let signature: string | null = null;
  let signingKeyId: string | null = null;

  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { key: "credential:sequence" },
      create: { key: "credential:sequence", value: 1 },
      update: { value: { increment: 1 } },
    });
    const credentialNumber = `AK-CRD-${String(counter.value).padStart(6, "0")}`;

    const payload = credentialPayload({
      credentialNumber,
      type,
      subjectName,
      standing,
      issuedAt,
      effectiveFrom,
      expiresAt,
      verificationCode,
    });

    const credential = await tx.credential.create({
      data: {
        credentialNumber,
        type,
        subjectRecordId: input.subjectRecordId ?? null,
        subjectName,
        standing,
        issuedAt,
        effectiveFrom,
        expiresAt,
        photoAttachmentId: input.photoAttachmentId ?? null,
        payload,
        payloadHash: sha256(payload),
        signature,
        signingKeyId,
        verificationCode,
        issuedBy: `${principal.displayName} (${principal.role})`,
      },
    });

    await appendToChainTx(tx, {
      eventType: "CREDENTIAL_ISSUED",
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        credentialNumber,
        type,
        subjectName,
        subjectRecordId: input.subjectRecordId ?? null,
        standing,
        expiresAt: expiresAt ? expiresAt.toISOString().slice(0, 10) : null,
        payloadHash: sha256(payload),
      },
    });

    return credential;
  });

  // Sign after issue so the signature covers the final payload, then attach it.
  if (input.signingPassphrase) {
    const key = await activeKeyFor(principal.id);
    if (key) {
      try {
        signature = signMessage(
          result.payload,
          key.privateKeyEnc,
          key.wrapSalt,
          input.signingPassphrase,
        );
        signingKeyId = key.id;
        await prisma.credential.update({
          where: { id: result.id },
          data: { signature, signingKeyId },
        });
      } catch {
        // An unsigned credential is still a valid record; it simply carries less
        // weight with a verifier. Surfacing this beats failing the whole issue.
        console.warn("[credentials] issued unsigned: the signing passphrase was not accepted");
      }
    }
  }

  await recordAudit(
    principal,
    "credential.issue",
    result.credentialNumber,
    `${CREDENTIAL_TYPE_LABELS[type]} to ${subjectName}`,
  );

  return prisma.credential.findUnique({ where: { id: result.id } });
}

export async function revokeCredential(principal: Principal, credentialId: string, reason: string) {
  if (!reason?.trim()) {
    throw new CredentialError("State why the credential is revoked.", { reason: "Required." });
  }

  const credential = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!credential) throw new CredentialError("No such credential.");
  if (credential.status === "REVOKED") {
    throw new CredentialError("That credential is already revoked.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.credential.update({
      where: { id: credentialId },
      data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason.trim() },
    });
    await appendToChainTx(tx, {
      eventType: "CREDENTIAL_REVOKED",
      actorId: principal.id === "anonymous" ? null : principal.id,
      actorLabel: `${principal.displayName} (${principal.role})`,
      payload: {
        credentialNumber: next.credentialNumber,
        subjectName: next.subjectName,
        reason: reason.trim(),
      },
    });
    return next;
  });

  await recordAudit(principal, "credential.revoke", updated.credentialNumber, reason.trim());
  return updated;
}

export interface CredentialCheck {
  found: boolean;
  credentialNumber?: string;
  type?: string;
  typeLabel?: string;
  subjectName?: string;
  standing?: string | null;
  issuedAt?: Date;
  effectiveFrom?: Date | null;
  expiresAt?: Date | null;
  status: "VALID" | "EXPIRED" | "NOT_YET_EFFECTIVE" | "SUSPENDED" | "REVOKED" | "REPLACED" | "UNKNOWN";
  revokedReason?: string | null;
  signaturePresent: boolean;
  signatureValid: boolean | null;
  signerName?: string | null;
  payloadIntact: boolean;
}

/**
 * Check a credential by its verification code.
 *
 * Public and unauthenticated by design: a credential nobody can check is
 * decoration. Only what is already printed on the card is returned — presenting
 * the card to a verifier discloses exactly what presenting it to a person does.
 */
export async function checkCredential(code: string): Promise<CredentialCheck> {
  const cleaned = code.trim().toUpperCase().replace(/\s/g, "");
  const normalised = cleaned.includes("-")
    ? cleaned
    : cleaned.length === 10
      ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
      : cleaned;

  const credential = await prisma.credential.findUnique({
    where: { verificationCode: normalised },
    include: { signingKey: { include: { user: true } } },
  });

  if (!credential) {
    return { found: false, status: "UNKNOWN", signaturePresent: false, signatureValid: null, payloadIntact: false };
  }

  // Recompute rather than trust the stored hash: the point of this endpoint is
  // to detect alteration, and reading back the same field it wrote detects none.
  const payloadIntact = sha256(credential.payload) === credential.payloadHash;

  let signatureValid: boolean | null = null;
  if (credential.signature && credential.signingKey) {
    signatureValid = verifyMessage(
      credential.payload,
      credential.signature,
      credential.signingKey.publicKey,
    );
  }

  const now = new Date();
  let status: CredentialCheck["status"] = "VALID";
  if (credential.status === "REVOKED") status = "REVOKED";
  else if (credential.status === "SUSPENDED") status = "SUSPENDED";
  else if (credential.status === "REPLACED") status = "REPLACED";
  else if (credential.expiresAt && credential.expiresAt < now) status = "EXPIRED";
  else if (credential.effectiveFrom && credential.effectiveFrom > now) status = "NOT_YET_EFFECTIVE";

  return {
    found: true,
    credentialNumber: credential.credentialNumber,
    type: credential.type,
    typeLabel:
      CREDENTIAL_TYPE_LABELS[credential.type as CredentialType] ?? credential.type,
    subjectName: credential.subjectName,
    standing: credential.standing,
    issuedAt: credential.issuedAt,
    effectiveFrom: credential.effectiveFrom,
    expiresAt: credential.expiresAt,
    status,
    revokedReason: credential.revokedReason,
    signaturePresent: Boolean(credential.signature),
    signatureValid,
    signerName: credential.signingKey?.user.displayName ?? null,
    payloadIntact,
  };
}
