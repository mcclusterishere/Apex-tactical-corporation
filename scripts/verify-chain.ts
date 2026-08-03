/**
 * Full verification of the ledger and the evidence store.
 *
 * Run with `npm run chain:verify`. This should be run on a schedule — monthly
 * at minimum, and always before certifying anything for use outside the
 * Kingdom. The Registrar's annual report should record the result.
 *
 * Exits non-zero on any failure so it can be wired into a cron job or a
 * monitoring check without further scripting.
 */

import { PrismaClient } from "@prisma/client";
import { createHash, verify, createPublicKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { leafHash, merkleRoot } from "../src/lib/merkle";

const prisma = new PrismaClient();
const GENESIS_PREV_HASH = "0".repeat(64);
const STORAGE_ROOT = path.resolve(process.env.STORAGE_DIR ?? "./storage");

function sha256Hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Mirrors src/lib/canonical.ts. The script must not import application code. */
function canonicalise(value: unknown): string {
  if (value === null) return "null";
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) throw new TypeError("non-finite number");
      return Object.is(value, -0) ? "0" : JSON.stringify(value);
    case "undefined":
      throw new TypeError("undefined");
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => (item === undefined ? "null" : canonicalise(item))).join(",")}]`;
  }
  const source = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(source).sort()) {
    if (source[key] === undefined) continue;
    parts.push(`${JSON.stringify(key)}:${canonicalise(source[key])}`);
  }
  return `{${parts.join(",")}}`;
}

function computeEntryHash(input: {
  prevHash: string;
  sequence: number;
  createdAt: Date;
  eventType: string;
  payloadHash: string;
}): string {
  return sha256Hex(
    [
      input.prevHash,
      String(input.sequence),
      input.createdAt.toISOString(),
      input.eventType,
      input.payloadHash,
    ].join("\n"),
  );
}

async function main() {
  let failures = 0;

  console.log("Verifying the ledger of Apex Kingdom\n");

  // --- The hash chain -----------------------------------------------------
  const total = await prisma.ledgerEntry.count();
  console.log(`Chain: ${total.toLocaleString()} entries`);

  let expectedPrev = GENESIS_PREV_HASH;
  let expectedSeq = 1;
  let head: { sequence: number; entryHash: string } | null = null;
  let cursor: string | undefined;

  for (;;) {
    const page = await prisma.ledgerEntry.findMany({
      take: 500,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { sequence: "asc" },
    });
    if (page.length === 0) break;

    for (const entry of page) {
      if (entry.sequence !== expectedSeq) {
        console.error(
          `  FAIL  sequence gap: expected #${expectedSeq}, found #${entry.sequence}`,
        );
        failures += 1;
        expectedSeq = entry.sequence;
      }

      const payloadHash = sha256Hex(entry.payload);
      if (payloadHash !== entry.payloadHash) {
        console.error(
          `  FAIL  #${entry.sequence} payload altered — digests to ${payloadHash}, stored ${entry.payloadHash}`,
        );
        failures += 1;
      }

      if (entry.prevHash !== expectedPrev) {
        console.error(
          `  FAIL  #${entry.sequence} broken link — points at ${entry.prevHash.slice(0, 16)}…, predecessor is ${expectedPrev.slice(0, 16)}…`,
        );
        failures += 1;
      }

      const recomputed = computeEntryHash({
        prevHash: entry.prevHash,
        sequence: entry.sequence,
        createdAt: entry.createdAt,
        eventType: entry.eventType,
        payloadHash: entry.payloadHash,
      });
      if (recomputed !== entry.entryHash) {
        console.error(
          `  FAIL  #${entry.sequence} entry hash mismatch — timestamp, type, or linkage altered`,
        );
        failures += 1;
      }

      expectedPrev = entry.entryHash;
      expectedSeq = entry.sequence + 1;
      head = { sequence: entry.sequence, entryHash: entry.entryHash };
    }

    cursor = page[page.length - 1].id;
    if (page.length < 500) break;
  }

  if (failures === 0 && total > 0) {
    console.log(`  OK    all ${total.toLocaleString()} entries recompute correctly`);
    console.log(`  Head  #${head?.sequence} ${head?.entryHash}`);
  } else if (total === 0) {
    console.log("  ----  the ledger has not been opened");
  }

  // --- The registers against the ledger -----------------------------------
  //
  // The chain proves the LOG is intact. This proves the registers still say what
  // the log says they say — an edit made directly against the database would
  // otherwise leave a perfectly valid chain describing a record that no longer
  // matches it.
  const recordCount = await prisma.record.count();
  console.log(`\nRegisters: ${recordCount} record(s) checked against the ledger`);

  let divergences = 0;
  const records = await prisma.record.findMany({
    select: {
      id: true,
      recordNumber: true,
      title: true,
      data: true,
      status: true,
      classification: true,
    },
  });

  for (const record of records) {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        recordId: record.id,
        eventType: { in: ["RECORD_CREATED", "RECORD_AMENDED"] },
      },
      orderBy: { sequence: "desc" },
      select: { payload: true, eventType: true },
    });

    if (entries.length === 0) {
      console.error(
        `  FAIL  ${record.recordNumber} has no committed ledger entry — inserted outside the application`,
      );
      divergences += 1;
      failures += 1;
      continue;
    }

    const payloads: { payload: Record<string, unknown>; eventType: string }[] = [];
    for (const entry of entries) {
      try {
        payloads.push({
          payload: JSON.parse(entry.payload) as Record<string, unknown>,
          eventType: entry.eventType,
        });
      } catch {
        /* reported by the chain pass above */
      }
    }
    if (payloads.length === 0) continue;

    const committed = (onCreate: string, onAmend: string): unknown => {
      for (const { payload, eventType } of payloads) {
        const value = eventType === "RECORD_CREATED" ? payload[onCreate] : payload[onAmend];
        if (value !== undefined && value !== null) return value;
      }
      return undefined;
    };

    const committedData = committed("data", "dataAfter");
    if (committedData !== undefined && canonicalise(committedData) !== record.data) {
      console.error(`  FAIL  ${record.recordNumber} field data differs from the committed state`);
      divergences += 1;
      failures += 1;
    }

    const checks: [string, unknown, string][] = [
      ["title", committed("title", "titleTo"), record.title],
      ["status", committed("status", "statusTo"), record.status],
      ["classification", committed("classification", "classificationTo"), record.classification],
    ];
    for (const [field, inLedger, inRegister] of checks) {
      if (field === "status" && (inRegister === "VOID" || inRegister === "SUPERSEDED")) continue;
      if (typeof inLedger === "string" && inLedger !== inRegister) {
        console.error(
          `  FAIL  ${record.recordNumber} field ${field}: register says "${inRegister}", ledger committed "${inLedger}"`,
        );
        divergences += 1;
        failures += 1;
      }
    }
  }

  if (recordCount > 0 && divergences === 0) {
    console.log("  OK    every register entry matches its committed ledger state");
  }

  // --- The evidence store -------------------------------------------------
  const attachments = await prisma.attachment.findMany({
    select: { id: true, filename: true, sha256: true, storageKey: true },
  });
  console.log(`\nEvidence store: ${attachments.length} attachment(s) under ${STORAGE_ROOT}`);

  let missing = 0;
  let corrupt = 0;
  for (const attachment of attachments) {
    const bytes = await readFile(path.join(STORAGE_ROOT, attachment.storageKey)).catch(() => null);
    if (!bytes) {
      console.error(`  FAIL  missing file for ${attachment.filename} (${attachment.sha256.slice(0, 16)}…)`);
      missing += 1;
      failures += 1;
      continue;
    }
    if (sha256Hex(bytes) !== attachment.sha256) {
      console.error(`  FAIL  ${attachment.filename} does not match its recorded digest`);
      corrupt += 1;
      failures += 1;
    }
  }
  if (attachments.length > 0 && missing === 0 && corrupt === 0) {
    console.log("  OK    every stored file matches its recorded digest");
  }

  // --- The books ----------------------------------------------------------
  //
  // Double entry only detects errors if the constraint is actually re-checked.
  // A trial balance that foots can still hide two offsetting alterations, so
  // every entry is re-summed individually.
  const journals = await prisma.journalEntry.findMany({
    where: { status: { in: ["POSTED", "REVERSED"] } },
    include: { postings: true },
  });
  console.log(`\nTreasury: ${journals.length} posted entr${journals.length === 1 ? "y" : "ies"}`);

  let unbalanced = 0;
  let bookDebits = 0;
  let bookCredits = 0;
  for (const journal of journals) {
    const debits = journal.postings.reduce((sum, p) => sum + p.debitCents, 0);
    const credits = journal.postings.reduce((sum, p) => sum + p.creditCents, 0);
    bookDebits += debits;
    bookCredits += credits;
    if (debits !== credits) {
      console.error(
        `  FAIL  ${journal.entryNumber} does not balance: debits ${(debits / 100).toFixed(2)}, credits ${(credits / 100).toFixed(2)}`,
      );
      unbalanced += 1;
      failures += 1;
    }
    if (journal.postings.length < 2) {
      console.error(`  FAIL  ${journal.entryNumber} has fewer than two postings`);
      failures += 1;
    }
  }
  if (bookDebits !== bookCredits) {
    console.error(
      `  FAIL  trial balance does not foot: debits ${(bookDebits / 100).toFixed(2)}, credits ${(bookCredits / 100).toFixed(2)}`,
    );
    failures += 1;
  } else if (journals.length > 0 && unbalanced === 0) {
    console.log(`  OK    every entry balances; the book foots at ${(bookDebits / 100).toFixed(2)}`);
  }

  // --- Signatures ---------------------------------------------------------
  const signatures = await prisma.entrySignature.findMany({
    include: { key: true, entry: true },
  });
  console.log(`\nSignatures: ${signatures.length}`);
  let badSignatures = 0;
  for (const sig of signatures) {
    const message = [
      "apex-kingdom:ledger:v1",
      String(sig.entry.sequence),
      sig.entry.entryHash,
      sig.purpose,
    ].join("\n");
    let valid = false;
    try {
      valid = verify(
        null,
        Buffer.from(message, "utf8"),
        createPublicKey({
          key: Buffer.from(sig.key.publicKey, "base64"),
          format: "der",
          type: "spki",
        }),
        Buffer.from(sig.signature, "base64"),
      );
    } catch {
      valid = false;
    }
    if (!valid) {
      console.error(`  FAIL  signature on entry #${sig.entry.sequence} does not verify`);
      badSignatures += 1;
      failures += 1;
    }
  }
  if (signatures.length > 0 && badSignatures === 0) {
    console.log("  OK    every signature verifies against its key");
  } else if (signatures.length === 0) {
    console.log("  ----  no entries have been signed. Enrol a signing key to attribute acts cryptographically.");
  }

  // --- Transparency log ---------------------------------------------------
  const checkpoints = await prisma.merkleCheckpoint.findMany({ orderBy: { treeSize: "asc" } });
  console.log(`\nTransparency log: ${checkpoints.length} checkpoint(s)`);
  if (checkpoints.length > 0) {
    const allEntries = await prisma.ledgerEntry.findMany({
      orderBy: { sequence: "asc" },
      select: { entryHash: true },
    });
    let badCheckpoints = 0;
    for (const checkpoint of checkpoints) {
      const leaves = allEntries
        .slice(0, checkpoint.treeSize)
        .map((e) => leafHash(e.entryHash));
      if (leaves.length !== checkpoint.treeSize) {
        console.error(
          `  FAIL  checkpoint at size ${checkpoint.treeSize} but only ${leaves.length} entries exist`,
        );
        badCheckpoints += 1;
        failures += 1;
        continue;
      }
      const root = merkleRoot(leaves).toString("hex");
      if (root !== checkpoint.rootHash) {
        console.error(
          `  FAIL  checkpoint at size ${checkpoint.treeSize} recomputes to ${root.slice(0, 16)}… but stores ${checkpoint.rootHash.slice(0, 16)}…`,
        );
        badCheckpoints += 1;
        failures += 1;
      }
    }
    if (badCheckpoints === 0) {
      console.log("  OK    every published root recomputes from the log");
    }
    const head = checkpoints[checkpoints.length - 1];
    const behind = total - head.treeSize;
    if (behind > 0) {
      console.log(`  WARN  ${behind} entries are not covered by any published root.`);
    }
  } else if (total > 0) {
    console.log("  WARN  no checkpoint has been cut. Inclusion proofs cannot be issued.");
  }

  // --- External anchoring -------------------------------------------------
  const anchor = await prisma.chainAnchor.findFirst({ orderBy: { sequence: "desc" } });
  console.log("\nExternal anchoring:");
  if (!anchor) {
    console.log(
      "  WARN  the chain has never been anchored. Internal consistency is proved; the DATES are not.",
    );
    console.log("        Run `npm run chain:anchor` for the procedure.");
  } else {
    const behind = (head?.sequence ?? 0) - anchor.sequence;
    console.log(
      `  Last  #${anchor.sequence} via ${anchor.method} on ${anchor.anchoredAt.toISOString().slice(0, 10)}`,
    );
    if (behind > 0) {
      console.log(`  WARN  ${behind} entries recorded since the last anchor are not yet covered.`);
    } else {
      console.log("  OK    the head is covered by an anchor");
    }
  }

  console.log(
    failures === 0
      ? "\nVerification passed."
      : `\nVerification FAILED with ${failures} problem(s). Preserve the database as it stands before writing anything further — the pattern of failures is itself evidence.`,
  );

  if (failures > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("Verification could not complete:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
