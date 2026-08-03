import {
  generateKeyPairSync,
  sign as edSign,
  verify as edVerify,
  createPublicKey,
  createPrivateKey,
  type KeyObject,
} from "node:crypto";
import { prisma } from "@/lib/db";
import {
  deriveWrappingKey,
  newSalt,
  sealWithKey,
  openWithKey,
  sha256,
  SecretsError,
} from "@/lib/secrets";

/**
 * Officer signing keys and detached signatures.
 *
 * Why this exists
 * ---------------
 * The hash chain proves the register has not been rewritten. It does not prove
 * WHO did anything: `actorLabel` is a string the server wrote, and anyone with
 * database access could write a different one. For most of what a small
 * institution records that is acceptable. For issuing a credential, authorising
 * a disbursement, or sealing a checkpoint it is not — those are exactly the acts
 * that get disputed, and "the system says it was you" is a weak answer when the
 * system is one the accuser controls.
 *
 * An Ed25519 signature over the entry hash means the act could only have been
 * produced by someone holding the officer's passphrase. It also gives the
 * officer something they currently lack: the ability to truthfully deny an act
 * they did not perform, because a forged act would carry no valid signature.
 *
 * Ed25519 rather than RSA or ECDSA: small keys, small signatures, no parameter
 * choices to get wrong, deterministic (no dependence on the quality of a random
 * source at signing time — a defect that has broken real ECDSA deployments).
 */

export class SigningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SigningError";
  }
}

export interface GeneratedKey {
  publicKey: string;
  privateKeyEnc: string;
  wrapSalt: string;
  wrapIv: string;
  fingerprint: string;
}

/**
 * Mint a keypair for an officer and seal the private half under their
 * passphrase.
 *
 * The wrapping key is derived from the passphrase, so the server holds no means
 * of signing on the officer's behalf. That is a deliberate operational cost: an
 * officer who forgets their passphrase loses the key and must be issued a new
 * one, and every signature made under the old key remains verifiable because
 * revoked keys are retained rather than deleted.
 */
export function generateSigningKey(passphrase: string): GeneratedKey {
  if (passphrase.length < 12) {
    throw new SigningError("A signing passphrase must be at least 12 characters.");
  }

  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const spki = publicKey.export({ type: "spki", format: "der" }) as Buffer;
  const pkcs8 = privateKey.export({ type: "pkcs8", format: "der" }) as Buffer;

  const salt = newSalt();
  const wrappingKey = deriveWrappingKey(passphrase, salt);
  const sealed = sealWithKey(pkcs8, wrappingKey);

  return {
    publicKey: spki.toString("base64"),
    privateKeyEnc: sealed,
    wrapSalt: salt.toString("base64"),
    // The IV is inside the sealed envelope; this column records the format
    // version so a future change to the envelope is detectable rather than
    // silently mis-parsed.
    wrapIv: "v1",
    fingerprint: sha256(spki),
  };
}

/** Unseal a private key. Throws if the passphrase is wrong. */
function unsealPrivateKey(
  privateKeyEnc: string,
  wrapSalt: string,
  passphrase: string,
): KeyObject {
  const wrappingKey = deriveWrappingKey(passphrase, Buffer.from(wrapSalt, "base64"));
  let pkcs8: Buffer;
  try {
    pkcs8 = openWithKey(privateKeyEnc, wrappingKey);
  } catch (error) {
    if (error instanceof SecretsError) {
      throw new SigningError("The signing passphrase was not accepted.");
    }
    throw error;
  }
  return createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
}

export function publicKeyFrom(base64Spki: string): KeyObject {
  return createPublicKey({
    key: Buffer.from(base64Spki, "base64"),
    format: "der",
    type: "spki",
  });
}

/** Sign an arbitrary message. Ed25519 takes no digest argument. */
export function signMessage(
  message: string,
  privateKeyEnc: string,
  wrapSalt: string,
  passphrase: string,
): string {
  const key = unsealPrivateKey(privateKeyEnc, wrapSalt, passphrase);
  return edSign(null, Buffer.from(message, "utf8"), key).toString("base64");
}

/** Verify a detached signature. Never throws — a malformed input is just false. */
export function verifyMessage(
  message: string,
  signatureBase64: string,
  publicKeyBase64: string,
): boolean {
  try {
    return edVerify(
      null,
      Buffer.from(message, "utf8"),
      publicKeyFrom(publicKeyBase64),
      Buffer.from(signatureBase64, "base64"),
    );
  } catch {
    return false;
  }
}

/** The officer's current, unrevoked key, if they hold one. */
export async function activeKeyFor(userId: string) {
  return prisma.signingKey.findFirst({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Sign a ledger entry under an officer's key and record the signature.
 *
 * The signed message binds the entry hash to its sequence and purpose, so a
 * signature cannot be lifted from one entry and replayed onto another.
 */
export async function signLedgerEntry(input: {
  userId: string;
  entryId: string;
  passphrase: string;
  purpose?: "ATTESTATION" | "COUNTERSIGNATURE" | "CHECKPOINT" | "AUTHORISATION";
}) {
  const purpose = input.purpose ?? "ATTESTATION";
  const key = await activeKeyFor(input.userId);
  if (!key) {
    throw new SigningError(
      "You hold no signing key. Generate one from your account page before signing.",
    );
  }

  const entry = await prisma.ledgerEntry.findUnique({ where: { id: input.entryId } });
  if (!entry) throw new SigningError("No such ledger entry.");

  const message = signingPayload(entry.sequence, entry.entryHash, purpose);
  const signature = signMessage(message, key.privateKeyEnc, key.wrapSalt, input.passphrase);

  return prisma.entrySignature.upsert({
    where: { entryId_keyId_purpose: { entryId: entry.id, keyId: key.id, purpose } },
    create: { entryId: entry.id, keyId: key.id, signature, purpose },
    update: { signature, signedAt: new Date() },
  });
}

/** The exact bytes signed. Changing this invalidates every existing signature. */
export function signingPayload(sequence: number, entryHash: string, purpose: string): string {
  return `apex-kingdom:ledger:v1\n${sequence}\n${entryHash}\n${purpose}`;
}

export interface SignatureCheck {
  keyId: string;
  fingerprint: string;
  signerName: string;
  purpose: string;
  signedAt: Date;
  valid: boolean;
  keyRevoked: boolean;
  /** A signature made before the key was revoked is still meaningful. */
  madeBeforeRevocation: boolean;
}

/** Verify every signature on an entry, recomputing rather than trusting stored state. */
export async function verifyEntrySignatures(entryId: string): Promise<SignatureCheck[]> {
  const entry = await prisma.ledgerEntry.findUnique({
    where: { id: entryId },
    include: { signatures: { include: { key: { include: { user: true } } } } },
  });
  if (!entry) return [];

  return entry.signatures.map((sig) => {
    const message = signingPayload(entry.sequence, entry.entryHash, sig.purpose);
    return {
      keyId: sig.keyId,
      fingerprint: sig.key.fingerprint,
      signerName: sig.key.user.displayName,
      purpose: sig.purpose,
      signedAt: sig.signedAt,
      valid: verifyMessage(message, sig.signature, sig.key.publicKey),
      keyRevoked: sig.key.revokedAt !== null,
      madeBeforeRevocation:
        sig.key.revokedAt === null || sig.signedAt.getTime() < sig.key.revokedAt.getTime(),
    };
  });
}

/** Short, human-comparable form of a fingerprint, for reading aloud. */
export function shortFingerprint(fingerprint: string): string {
  return (fingerprint.match(/.{1,4}/g) ?? []).slice(0, 8).join(" ").toUpperCase();
}
