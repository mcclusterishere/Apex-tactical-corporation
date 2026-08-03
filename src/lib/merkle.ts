import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * A Merkle transparency log over the ledger.
 *
 * The problem this solves
 * -----------------------
 * The hash chain lets a verifier confirm the ledger is internally consistent —
 * but only by reading every entry. For a register where most entries are member
 * data, sealed discipline files, or financial detail, that is unacceptable: the
 * Kingdom cannot hand a municipal clerk the whole ledger to prove one deed.
 *
 * A Merkle tree over the same entries gives an *inclusion proof*: log2(n) hashes
 * that prove one specific entry is in a tree with a published root, disclosing
 * nothing about any other entry. Publish the root once; prove any entry forever.
 *
 * It also gives a *consistency proof*: evidence that a later tree is an
 * append-only extension of an earlier one, so the Kingdom cannot quietly issue
 * a new root that drops or rewrites history a third party already saw.
 *
 * This follows RFC 6962 (Certificate Transparency), including its domain
 * separation: leaves are hashed with a 0x00 prefix and internal nodes with 0x01.
 * Without that prefixing, an attacker who controls leaf content can present an
 * internal node as a leaf and forge proofs. It is the single most important
 * detail in the construction and the one most often left out.
 */

const LEAF_PREFIX = Buffer.from([0x00]);
const NODE_PREFIX = Buffer.from([0x01]);

/**
 * Node's Buffer became generic over its backing store in recent @types/node.
 * `createHash().digest()` yields Buffer<ArrayBuffer> while `Buffer.from()` yields
 * Buffer<ArrayBufferLike>, so any variable holding both needs the wider type.
 */
type Bytes = Buffer<ArrayBufferLike>;

function sha256(...parts: Bytes[]): Bytes {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part);
  return hash.digest();
}

export function leafHash(data: string): Bytes {
  return sha256(LEAF_PREFIX, Buffer.from(data, "utf8"));
}

export function nodeHash(left: Bytes, right: Bytes): Bytes {
  return sha256(NODE_PREFIX, left, right);
}

/**
 * The RFC 6962 root of a list of leaves.
 *
 * The tree is not padded to a power of two. The split point is the largest
 * power of two strictly less than n, which is what makes consistency proofs
 * work across appends.
 */
export function merkleRoot(leaves: Bytes[]): Bytes {
  if (leaves.length === 0) return sha256(Buffer.alloc(0));
  if (leaves.length === 1) return leaves[0];
  const k = largestPowerOfTwoBelow(leaves.length);
  return nodeHash(merkleRoot(leaves.slice(0, k)), merkleRoot(leaves.slice(k)));
}

function largestPowerOfTwoBelow(n: number): number {
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}

export interface InclusionProof {
  /** Zero-based index of the leaf in the tree. */
  leafIndex: number;
  treeSize: number;
  rootHash: string;
  leafHash: string;
  /** Sibling hashes from the leaf upward, hex. */
  path: string[];
}

/** Build an inclusion proof for `index` within `leaves`. */
export function inclusionProof(leaves: Bytes[], index: number): string[] {
  if (index < 0 || index >= leaves.length) {
    throw new RangeError(`Leaf index ${index} is outside a tree of ${leaves.length}.`);
  }
  return buildPath(leaves, index).map((buffer) => buffer.toString("hex"));
}

function buildPath(leaves: Bytes[], index: number): Bytes[] {
  if (leaves.length <= 1) return [];
  const k = largestPowerOfTwoBelow(leaves.length);
  if (index < k) {
    return [...buildPath(leaves.slice(0, k), index), merkleRoot(leaves.slice(k))];
  }
  return [...buildPath(leaves.slice(k), index - k), merkleRoot(leaves.slice(0, k))];
}

/**
 * Recompute a root from a leaf and its proof.
 *
 * This is the function a third party runs. It needs no database, no network,
 * and no cooperation from the Kingdom — only the leaf, the path, the index, and
 * the published root. Deliberately self-contained so it can be reimplemented in
 * thirty lines by anyone who wants to check the Kingdom's arithmetic.
 */
export function verifyInclusion(
  leaf: Bytes,
  leafIndex: number,
  treeSize: number,
  path: string[],
  expectedRoot: string,
): boolean {
  if (leafIndex < 0 || leafIndex >= treeSize) return false;

  // RFC 6962 §2.1.1. The audit path is ordered leaf-first, so verification
  // walks upward from the leaf, tracking the node's index (fn) and the index of
  // the last node at the same level (sn). When fn is odd the sibling is on the
  // left; when fn equals sn the node is the rightmost at its level and its
  // sibling also sits on the left.
  let hash: Bytes = leaf;
  let fn = leafIndex;
  let sn = treeSize - 1;

  for (const siblingHex of path) {
    if (sn === 0) return false; // more path than the tree can justify
    const sibling = Buffer.from(siblingHex, "hex");

    if (fn % 2 === 1 || fn === sn) {
      hash = nodeHash(sibling, hash);
      while (fn !== 0 && fn % 2 === 0) {
        fn >>= 1;
        sn >>= 1;
      }
    } else {
      hash = nodeHash(hash, sibling);
    }

    fn >>= 1;
    sn >>= 1;
  }

  // sn must have been consumed exactly: a short path leaves sn > 0.
  return sn === 0 && hash.toString("hex") === expectedRoot;
}

/**
 * Every ledger entry hash, in sequence order, as tree leaves.
 *
 * The leaf is the entry hash rather than the payload: the entry hash already
 * binds the payload, the sequence, the timestamp, and the previous entry, so
 * the tree inherits all of that without the leaves carrying private content.
 * A proof therefore discloses nothing but a digest.
 */
export async function ledgerLeaves(upToSequence?: number): Promise<Bytes[]> {
  const entries = await prisma.ledgerEntry.findMany({
    where: upToSequence ? { sequence: { lte: upToSequence } } : undefined,
    orderBy: { sequence: "asc" },
    select: { entryHash: true },
  });
  return entries.map((entry) => leafHash(entry.entryHash));
}

/** Current tree root and size. */
export async function currentTree(): Promise<{ size: number; root: string }> {
  const leaves = await ledgerLeaves();
  return { size: leaves.length, root: merkleRoot(leaves).toString("hex") };
}

/**
 * Cut a checkpoint: record the root over the current ledger.
 *
 * Checkpoints are what get published externally. Between checkpoints the tree
 * grows, so a proof is always issued against a specific tree size.
 */
export async function cutCheckpoint(): Promise<{ treeSize: number; rootHash: string; created: boolean }> {
  const { size, root } = await currentTree();
  if (size === 0) return { treeSize: 0, rootHash: root, created: false };

  const existing = await prisma.merkleCheckpoint.findUnique({ where: { treeSize: size } });
  if (existing) {
    return { treeSize: size, rootHash: existing.rootHash, created: false };
  }

  await prisma.merkleCheckpoint.create({ data: { treeSize: size, rootHash: root } });
  return { treeSize: size, rootHash: root, created: true };
}

/**
 * An inclusion proof for a specific ledger entry against a published checkpoint.
 *
 * Proofs are issued against the newest checkpoint that covers the entry, not
 * against the live tree — a proof against a root nobody has seen proves nothing.
 */
export async function proveEntry(sequence: number): Promise<InclusionProof | null> {
  const entry = await prisma.ledgerEntry.findFirst({
    where: { sequence },
    select: { entryHash: true },
  });
  if (!entry) return null;

  const checkpoint = await prisma.merkleCheckpoint.findFirst({
    where: { treeSize: { gte: sequence } },
    orderBy: { treeSize: "asc" },
  });
  if (!checkpoint) return null;

  const leaves = await ledgerLeaves(checkpoint.treeSize);
  const index = sequence - 1; // sequences are 1-based, leaves 0-based
  if (index >= leaves.length) return null;

  return {
    leafIndex: index,
    treeSize: checkpoint.treeSize,
    rootHash: checkpoint.rootHash,
    leafHash: leaves[index].toString("hex"),
    path: inclusionProof(leaves, index),
  };
}

/**
 * Consistency proof between two tree sizes (RFC 6962 §2.1.2).
 *
 * Proves that the tree of size `second` contains the tree of size `first`
 * unchanged — that the log only ever appended. This is what stops the Kingdom
 * publishing a root today and a different history tomorrow.
 */
export function consistencyProof(leaves: Bytes[], first: number, second: number): string[] {
  if (first <= 0 || first > second || second > leaves.length) return [];
  if (first === second) return [];
  return subproof(leaves.slice(0, second), first, true).map((b) => b.toString("hex"));
}

function subproof(leaves: Bytes[], m: number, isCompleteSubtree: boolean): Bytes[] {
  if (m === leaves.length) {
    return isCompleteSubtree ? [] : [merkleRoot(leaves)];
  }
  const k = largestPowerOfTwoBelow(leaves.length);
  if (m <= k) {
    return [...subproof(leaves.slice(0, k), m, isCompleteSubtree), merkleRoot(leaves.slice(k))];
  }
  return [...subproof(leaves.slice(k), m - k, false), merkleRoot(leaves.slice(0, k))];
}

export function verifyConsistency(
  first: number,
  second: number,
  firstRoot: string,
  secondRoot: string,
  proof: string[],
): boolean {
  if (first < 0 || first > second) return false;
  if (first === 0) return true; // an empty prefix is consistent with anything
  if (first === second) return proof.length === 0 && firstRoot === secondRoot;

  // RFC 6962 §2.1.2. When `first` is an exact power of two the first root is
  // itself a complete subtree of the second, so the proof omits it and the
  // verifier supplies it.
  const nodes = proof.map((hex) => Buffer.from(hex, "hex"));
  const isPowerOfTwo = (first & (first - 1)) === 0;
  const seq: Bytes[] = isPowerOfTwo ? [Buffer.from(firstRoot, "hex"), ...nodes] : nodes;
  if (seq.length === 0) return false;

  let fn = first - 1;
  let sn = second - 1;
  while (fn % 2 === 1) {
    fn >>= 1;
    sn >>= 1;
  }

  let index = 0;
  let fr: Bytes = seq[index];
  let sr: Bytes = seq[index];
  index += 1;

  while (sn !== 0) {
    if (index >= seq.length) return false;
    const node = seq[index];

    if (fn % 2 === 1 || fn === sn) {
      fr = nodeHash(node, fr);
      sr = nodeHash(node, sr);
      index += 1;
      while (fn !== 0 && fn % 2 === 0) {
        fn >>= 1;
        sn >>= 1;
      }
    } else {
      sr = nodeHash(sr, node);
      index += 1;
    }

    fn >>= 1;
    sn >>= 1;
  }

  return (
    index === seq.length &&
    fr.toString("hex") === firstRoot &&
    sr.toString("hex") === secondRoot
  );
}
