import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Time-based one-time passwords (RFC 6238) and HOTP (RFC 4226).
 *
 * Implemented directly on node:crypto rather than pulled in as a dependency:
 * the algorithm is forty lines, it is frozen by specification, and an
 * authentication factor is the last place to accept an unaudited transitive
 * dependency tree. It works with any standard authenticator app.
 *
 * A single shared secret and a 30-second window is not a hardware token. It is,
 * however, the difference between "a stolen password is enough" and "a stolen
 * password plus the officer's phone is enough", and that is most of the value.
 */

const DIGITS = 6;
const PERIOD_SECONDS = 30;
// One step either side. Wider windows are a common misconfiguration: each extra
// step is another valid code an attacker may guess or replay.
const DEFAULT_WINDOW = 1;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 in the authenticator secret.");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** HOTP: the counter-based code the time-based one is built on. */
export function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  // 64-bit big-endian counter. Written as two 32-bit halves because a JS number
  // cannot hold a 64-bit integer, and getting this wrong breaks silently at
  // large counters rather than immediately.
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);

  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function totp(secret: string, atMs: number = Date.now()): string {
  return hotp(secret, Math.floor(atMs / 1000 / PERIOD_SECONDS));
}

/**
 * Verify a submitted code.
 *
 * Returns the matched counter so the caller can store it and refuse to accept
 * the same counter twice — without that, a code observed over someone's
 * shoulder stays valid for the rest of its window.
 */
export function verifyTotp(
  secret: string,
  submitted: string,
  options?: { atMs?: number; window?: number; lastUsedCounter?: number },
): { valid: boolean; counter?: number } {
  const cleaned = submitted.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return { valid: false };

  const atMs = options?.atMs ?? Date.now();
  const window = options?.window ?? DEFAULT_WINDOW;
  const current = Math.floor(atMs / 1000 / PERIOD_SECONDS);

  for (let offset = -window; offset <= window; offset += 1) {
    const counter = current + offset;
    if (options?.lastUsedCounter !== undefined && counter <= options.lastUsedCounter) {
      continue; // already spent
    }
    const expected = hotp(secret, counter);
    // Constant-time comparison. The codes are short, but leaking position of
    // first difference is exactly the kind of thing that is free to avoid.
    if (
      expected.length === cleaned.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(cleaned))
    ) {
      return { valid: true, counter };
    }
  }
  return { valid: false };
}

/** The `otpauth://` URI an authenticator app scans. */
export function provisioningUri(secret: string, account: string, issuer = "Apex Kingdom"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Recovery codes, for when the second factor is lost. Shown once. */
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
  });
}

export function secondsRemaining(atMs: number = Date.now()): number {
  return PERIOD_SECONDS - Math.floor((atMs / 1000) % PERIOD_SECONDS);
}
