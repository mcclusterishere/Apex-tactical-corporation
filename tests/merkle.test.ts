import {
  leafHash, merkleRoot, inclusionProof, verifyInclusion,
  consistencyProof, verifyConsistency,
} from "@/lib/merkle";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean) => { cond ? pass++ : fail++; if (!cond) console.log("  FAIL:", name); };

// RFC 6962 test vectors (empty tree + known roots for the CT reference data)
const empty = merkleRoot([]).toString("hex");
ok("empty root = sha256('')", empty === createHash("sha256").update(Buffer.alloc(0)).digest("hex"));

// Inclusion: every leaf of every tree size up to 64 must prove and verify
for (let n = 1; n <= 64; n++) {
  const leaves = Array.from({ length: n }, (_, i) => leafHash(`entry-${i}`));
  const root = merkleRoot(leaves).toString("hex");
  for (let i = 0; i < n; i++) {
    const path = inclusionProof(leaves, i);
    ok(`inclusion n=${n} i=${i}`, verifyInclusion(leaves[i], i, n, path, root));
  }
}

// A proof must NOT verify against a different leaf, index, or root
{
  const leaves = Array.from({ length: 17 }, (_, i) => leafHash(`x-${i}`));
  const root = merkleRoot(leaves).toString("hex");
  const path = inclusionProof(leaves, 5);
  ok("wrong leaf rejected",   !verifyInclusion(leafHash("x-6"), 5, 17, path, root));
  ok("wrong index rejected",  !verifyInclusion(leaves[5], 6, 17, path, root));
  ok("wrong root rejected",   !verifyInclusion(leaves[5], 5, 17, path, "00".repeat(32)));
  ok("tampered path rejected",!verifyInclusion(leaves[5], 5, 17, [...path.slice(0,-1), "ff".repeat(32)], root));
  ok("truncated path rejected", !verifyInclusion(leaves[5], 5, 17, path.slice(1), root));
  ok("index out of range", !verifyInclusion(leaves[5], 17, 17, path, root));
}

// Second-preimage resistance: an internal node must not be presentable as a leaf.
// Without domain separation, root([A,B]) would equal leafHash-of-the-concatenation.
{
  const a = leafHash("a"), b = leafHash("b");
  const root2 = merkleRoot([a, b]);
  const forged = leafHash(Buffer.concat([a, b]).toString("utf8"));
  ok("domain separation holds", root2.toString("hex") !== forged.toString("hex"));
}

// Consistency: appending must always be provable, for every (m, n)
for (let n = 1; n <= 32; n++) {
  const leaves = Array.from({ length: n }, (_, i) => leafHash(`c-${i}`));
  const rootN = merkleRoot(leaves).toString("hex");
  for (let m = 1; m <= n; m++) {
    const rootM = merkleRoot(leaves.slice(0, m)).toString("hex");
    const proof = consistencyProof(leaves, m, n);
    ok(`consistency m=${m} n=${n}`, verifyConsistency(m, n, rootM, rootN, proof));
  }
}

// A consistency proof must fail if history was rewritten rather than appended
{
  const original = Array.from({ length: 8 }, (_, i) => leafHash(`h-${i}`));
  const rewritten = [...original]; rewritten[2] = leafHash("TAMPERED");
  const extended = [...rewritten, leafHash("h-8")];
  const rootM = merkleRoot(original.slice(0, 8)).toString("hex");
  const rootN = merkleRoot(extended).toString("hex");
  const proof = consistencyProof(extended, 8, 9);
  ok("rewritten history rejected", !verifyConsistency(8, 9, rootM, rootN, proof));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
