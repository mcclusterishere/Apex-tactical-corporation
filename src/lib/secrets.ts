import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  createHash,
  timingSafeEqual,
} from "node:crypto";

/**
 * Envelope encryption for material that must not be readable in a database dump.
 *
 * Two distinct wrapping keys are used and they are not interchangeable:
 *
 *   - The APPLICATION MASTER KEY (env `APEX_MASTER_KEY`) seals things the server
 *     must be able to read unattended: TOTP secrets, sealed field values. If the
 *     database and the environment are both taken, this material is exposed —
 *     which is the honest limit of server-side encryption, and the reason the
 *     master key belongs in a secret store rather than beside the database.
 *
 *   - A PASSPHRASE-DERIVED KEY seals an officer's private signing key. The
 *     server cannot derive it without the officer typing their passphrase. A
 *     stolen database plus a stolen environment still yields no ability to sign.
 *     That asymmetry is the point of having signatures at all.
 *
 * AES-256-GCM throughout: authenticated, so tampering with ciphertext fails
 * loudly at decrypt rather than silently producing garbage.
 */

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;

// Cost parameters for passphrase-derived wrapping keys. Deliberately expensive:
// an attacker with the sealed private key must pay this per guess.
const WRAP_SCRYPT = { N: 1 << 16, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

export class SecretsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretsError";
  }
}

let cachedMasterKey: Buffer | null = null;

/**
 * The application master key.
 *
 * In production a missing or short key is fatal at first use rather than
 * silently falling back to something weak — a system that quietly encrypts with
 * a default key is worse than one that does not encrypt, because it reports
 * success.
 */
export function masterKey(): Buffer {
  if (cachedMasterKey) return cachedMasterKey;

  const raw = process.env.APEX_MASTER_KEY;
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new SecretsError(
        "APEX_MASTER_KEY is not set, or is shorter than 32 characters. " +
          "Generate one with `openssl rand -base64 48` and set it in the environment. " +
          "Refusing to start with a weak key.",
      );
    }
    // Development only, and loudly. Anything sealed under this key is
    // unrecoverable once the process restarts, which is the intended nuisance.
    console.warn(
      "[secrets] APEX_MASTER_KEY is unset. Using an ephemeral development key; " +
        "sealed values will not survive a restart.",
    );
    cachedMasterKey = randomBytes(KEY_BYTES);
    return cachedMasterKey;
  }

  // A single fixed salt is correct here: the input is already high-entropy, and
  // a per-value salt would make the key underivable.
  cachedMasterKey = scryptSync(raw, "apex-kingdom:master:v1", KEY_BYTES, WRAP_SCRYPT);
  return cachedMasterKey;
}

/** Encrypt with an explicit key. Returns `iv.ciphertext.tag`, all base64url. */
export function sealWithKey(plaintext: string | Buffer, key: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const body = Buffer.concat([
    cipher.update(typeof plaintext === "string" ? Buffer.from(plaintext, "utf8") : plaintext),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), body.toString("base64url"), tag.toString("base64url")].join(".");
}

/** Decrypt a value produced by `sealWithKey`. Throws if it was tampered with. */
export function openWithKey(sealed: string, key: Buffer): Buffer {
  const parts = sealed.split(".");
  if (parts.length !== 3) throw new SecretsError("Malformed sealed value.");

  const iv = Buffer.from(parts[0], "base64url");
  const body = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new SecretsError("Malformed sealed value.");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(body), decipher.final()]);
  } catch {
    // GCM authentication failed: the ciphertext, IV, or tag was altered, or the
    // wrong key was supplied. Both are the same answer to the caller.
    throw new SecretsError("Sealed value failed authentication. It was altered, or the key is wrong.");
  }
}

/** Seal under the application master key. */
export function seal(plaintext: string): string {
  return sealWithKey(plaintext, masterKey());
}

/** Open a value sealed under the application master key. */
export function open(sealed: string): string {
  return openWithKey(sealed, masterKey()).toString("utf8");
}

/**
 * Derive a wrapping key from a passphrase. The salt is stored alongside the
 * ciphertext; it is not a secret, it exists so that two officers with the same
 * passphrase do not produce the same key.
 */
export function deriveWrappingKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, KEY_BYTES, WRAP_SCRYPT);
}

export function newSalt(): Buffer {
  return randomBytes(16);
}

export function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Constant-time comparison of two hex digests of equal length. */
export function digestsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
