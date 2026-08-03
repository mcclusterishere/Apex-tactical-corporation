import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Attachment storage.
 *
 * Files are addressed by the SHA-256 of their contents, in a two-level fan-out
 * directory. Content addressing gives three properties that matter for an
 * evidence store:
 *
 *   - The same file received twice from two sources is stored once, and the
 *     identity is visible rather than inferred.
 *   - A file cannot be silently swapped, because its name IS its digest.
 *   - Verifying the whole store is a loop over filenames.
 *
 * Files are never overwritten and never deleted by this module. Removing
 * evidence is not an operation the application offers.
 */

const ROOT = path.resolve(process.env.STORAGE_DIR ?? "./storage");

// Bytes. Large enough for scanned instruments and photographs, small enough
// that a single upload cannot exhaust a modest host's disk.
export const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;

export interface StoredFile {
  sha256: string;
  storageKey: string;
  byteSize: number;
  deduplicated: boolean;
}

function keyFor(digest: string): string {
  return path.join(digest.slice(0, 2), digest.slice(2, 4), digest);
}

export async function storeFile(bytes: Buffer): Promise<StoredFile> {
  if (bytes.byteLength === 0) throw new Error("Refusing to store an empty file.");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File exceeds the ${(MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0)} MB limit for a single attachment.`,
    );
  }

  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const storageKey = keyFor(sha256);
  const target = path.join(ROOT, storageKey);

  const existing = await stat(target).catch(() => null);
  if (existing) {
    return { sha256, storageKey, byteSize: bytes.byteLength, deduplicated: true };
  }

  await mkdir(path.dirname(target), { recursive: true });
  // Exclusive create: if two uploads of the same content race, the loser gets
  // EEXIST rather than truncating a file another request is still writing.
  await writeFile(target, bytes, { flag: "wx" }).catch(async (error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });

  return { sha256, storageKey, byteSize: bytes.byteLength, deduplicated: false };
}

export async function readStoredFile(storageKey: string): Promise<Buffer | null> {
  // storageKey is derived from a digest we generated, but it arrives here from
  // the database, so it is still validated before touching the filesystem.
  if (!/^[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{64}$/.test(storageKey.replaceAll("\\", "/"))) {
    return null;
  }
  const target = path.join(ROOT, storageKey);
  const resolved = path.resolve(target);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return readFile(resolved).catch(() => null);
}

/** Verify that a stored file still digests to the value recorded against it. */
export async function verifyStoredFile(storageKey: string, expected: string): Promise<boolean> {
  const bytes = await readStoredFile(storageKey);
  if (!bytes) return false;
  return createHash("sha256").update(bytes).digest("hex") === expected;
}

export function storageRoot(): string {
  return ROOT;
}
