#!/usr/bin/env node
/**
 * Standalone verifier for an Apex Kingdom inclusion proof.
 *
 * THIS FILE IS MEANT TO BE GIVEN AWAY.
 *
 * It has no dependencies beyond Node's standard library, does not touch the
 * Kingdom's database, makes no network request, and does not import a single
 * line of the Kingdom's application code. Anyone handed a certified extract can
 * run it, read it in five minutes, and satisfy themselves that the arithmetic
 * is what it claims to be.
 *
 * That is the entire point of publishing a transparency log. A verification
 * that requires the issuer's software, or the issuer's cooperation, verifies
 * nothing — it only moves the question of who to trust.
 *
 * Usage
 * -----
 *   node verify-proof.mjs --root <hex> --leaf <hex> --index <n> --size <n> \
 *                         --path <hex> [<hex> ...]
 *
 * The values are printed on every certified extract under "Merkle inclusion
 * proof". A single-entry tree has an empty path, which is normal.
 *
 * The construction is RFC 6962 (Certificate Transparency), §2.1.1.
 */

import { createHash } from "node:crypto";

const LEAF_PREFIX = Buffer.from([0x00]);
const NODE_PREFIX = Buffer.from([0x01]);

function sha256(...parts) {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part);
  return hash.digest();
}

/**
 * Hash an internal node.
 *
 * The 0x01 prefix is not decoration. Without domain separation between leaves
 * (0x00) and internal nodes (0x01), someone who controls leaf content could
 * present an internal node as a leaf and forge a proof. It is the single most
 * important detail in the construction.
 */
function nodeHash(left, right) {
  return sha256(NODE_PREFIX, left, right);
}

export function leafHash(entryHash) {
  return sha256(LEAF_PREFIX, Buffer.from(entryHash, "utf8"));
}

export function verifyInclusion(leaf, leafIndex, treeSize, path, expectedRoot) {
  if (leafIndex < 0 || leafIndex >= treeSize) return false;

  let hash = leaf;
  let fn = leafIndex;
  let sn = treeSize - 1;

  for (const siblingHex of path) {
    if (sn === 0) return false;
    const sibling = Buffer.from(siblingHex, "hex");
    if (sibling.length !== 32) return false;

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

  return sn === 0 && hash.toString("hex") === expectedRoot.toLowerCase();
}

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { path: [] };
  let key = null;
  for (const token of argv) {
    if (token.startsWith("--")) {
      key = token.slice(2);
      if (key !== "path") out[key] = true;
      continue;
    }
    if (key === "path") out.path.push(token);
    else if (key) out[key] = token;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.root || !args.leaf || args.index === undefined || args.size === undefined) {
    console.error(`Apex Kingdom — inclusion proof verifier

Usage:
  node verify-proof.mjs --root <hex> --leaf <hex> --index <n> --size <n> \\
                        --path <hex> [<hex> ...]

Every value is printed on the certified extract. Copy them exactly.
A single-entry tree has no path; omit --path in that case.`);
    process.exit(2);
  }

  const index = Number(args.index);
  const size = Number(args.size);

  if (!Number.isInteger(index) || !Number.isInteger(size) || size <= 0) {
    console.error("index and size must be whole numbers, and size must be positive.");
    process.exit(2);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(args.root) || !/^[0-9a-fA-F]{64}$/.test(args.leaf)) {
    console.error("root and leaf must each be 64 hexadecimal characters (a SHA-256 digest).");
    process.exit(2);
  }

  const ok = verifyInclusion(
    Buffer.from(args.leaf, "hex"),
    index,
    size,
    args.path,
    args.root,
  );

  console.log("");
  console.log("  Apex Kingdom — inclusion proof");
  console.log("  ─────────────────────────────────────────────────────────────");
  console.log(`  Tree size    ${size}`);
  console.log(`  Leaf index   ${index}`);
  console.log(`  Path length  ${args.path.length}`);
  console.log(`  Root         ${args.root}`);
  console.log("");

  if (ok) {
    console.log("  RESULT: VERIFIED");
    console.log("");
    console.log("  The leaf is in the log committed to by that root. Nothing about any");
    console.log("  other entry in the log is revealed by this proof, and none was needed.");
    console.log("");
    console.log("  This confirms the entry is in the Kingdom's log. It does NOT confirm");
    console.log("  that anything recorded in the entry is true, and the root itself is");
    console.log("  only as trustworthy as the place it was published. Ask where the root");
    console.log("  was anchored and on what date.");
  } else {
    console.log("  RESULT: FAILED");
    console.log("");
    console.log("  The leaf, index, path, and size do not recompute to that root. Either");
    console.log("  a value was transcribed incorrectly, or the extract was not issued by");
    console.log("  the Office of the Registrar.");
  }
  console.log("");

  process.exit(ok ? 0 : 1);
}

// Only run when invoked directly, so the functions above can be imported.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
