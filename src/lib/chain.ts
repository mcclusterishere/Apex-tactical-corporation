import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { canonicalise, type CanonicalValue } from "@/lib/canonical";

/**
 * The append-only, hash-linked ledger.
 *
 * Every act of the Registrar — recording an instrument, amending a register,
 * adding evidence, serving a notice — is committed here as a link in a chain.
 * Each link binds the one before it, so altering or removing any historical
 * entry changes every hash after it and is detectable by `verifyChain`.
 *
 * What this does and does not prove
 * ---------------------------------
 * It proves INTERNAL CONSISTENCY: that the sequence of records has not been
 * quietly rewritten since it was written. On its own it does NOT prove that a
 * record existed on the date it claims, because whoever controls the database
 * could in principle regenerate the entire chain from scratch with new dates.
 *
 * What closes that gap is anchoring: publishing the head hash somewhere outside
 * the Kingdom's control (see `ChainAnchor` and scripts/anchor-chain.ts). Once
 * head hash H is fixed in an external record on date D, every entry at or below
 * that sequence is provably older than D. Anchor regularly. An unanchored chain
 * is a filing cabinet with a good index; an anchored chain is evidence.
 */

export const GENESIS_PREV_HASH = "0".repeat(64);
const CHAIN_COUNTER_KEY = "ledger:sequence";

export type LedgerEventType =
  | "GENESIS"
  | "RECORD_CREATED"
  | "RECORD_AMENDED"
  | "RECORD_VOIDED"
  | "RECORD_RESTORED"
  | "RECORD_SUPERSEDED"
  | "ATTACHMENT_ADDED"
  | "CUSTODY_EVENT"
  | "INSTRUMENT_PROMULGATED"
  | "NOTICE_SERVED"
  | "GAZETTE_PUBLISHED"
  | "HOLD_ISSUED"
  | "HOLD_RELEASED"
  | "CHAIN_ANCHORED"
  | "CHECKPOINT_CUT"
  | "JOURNAL_POSTED"
  | "JOURNAL_REVERSED"
  | "CREDENTIAL_ISSUED"
  | "CREDENTIAL_REVOKED"
  | "KEY_ENROLLED"
  | "KEY_REVOKED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  | "CURRENCY_ACCOUNT_OPENED"
  | "CURRENCY_ISSUED"
  | "CURRENCY_SPENT"
  | "CURRENCY_REDEEMED"
  | "CURRENCY_FROZEN"
  | "CURRENCY_ADJUSTED"
  // Identity. The payload for these carries NO personal data — only the
  // claim id, the verifier's session id, the status, and a digest. The chain
  // is append-only, so anything written here is written forever; a name in a
  // ledger payload is a name that can never be erased on request.
  | "IDENTITY_CLAIM_OPENED"
  | "IDENTITY_CLAIM_DECIDED"
  | "IDENTITY_CLAIM_REVIEWED"
  | "IDENTITY_CLAIM_LINKED"
  // The land earns. These record a zome being listed and a booking moving
  // through its life, so the calendar and the revenue are as tamper-evident
  // as everything else the Kingdom keeps.
  | "ZOME_LISTED"
  | "ZOME_RETIRED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_COMPLETED"
  // Apex Stays. Contribution credit denominated in NIGHTS only — never dollars,
  // never convertible to the Mark, never redeemable for money. The payloads
  // carry nights, principal ids, and task ids; no monetary field exists.
  | "APEX_TASK_POSTED"
  | "APEX_TASK_VERIFIED"
  | "STAY_EARNED"
  | "STAY_GIFTED"
  | "STAY_SPENT";

export function sha256Hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Bind an entry to its predecessor.
 *
 * The timestamp is inside the digest deliberately: without it, two entries with
 * identical payloads at different times would be indistinguishable, and an entry
 * could be back-dated after the fact without breaking the chain.
 */
export function computeEntryHash(input: {
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

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface AppendInput {
  eventType: LedgerEventType;
  payload: CanonicalValue;
  recordId?: string | null;
  actorId?: string | null;
  actorLabel: string;
}

/**
 * Append one entry inside an existing transaction.
 *
 * Sequence allocation goes through the `Counter` row first. That write takes a
 * row lock, which serialises concurrent appends and prevents two entries from
 * claiming the same sequence — a gap or a duplicate would both be fatal to
 * verification.
 */
export async function appendToChainTx(tx: TxClient, input: AppendInput) {
  const counter = await tx.counter.upsert({
    where: { key: CHAIN_COUNTER_KEY },
    create: { key: CHAIN_COUNTER_KEY, value: 1 },
    update: { value: { increment: 1 } },
  });
  const sequence = counter.value;

  const previous =
    sequence === 1
      ? null
      : await tx.ledgerEntry.findFirst({
          where: { sequence: sequence - 1 },
          select: { entryHash: true },
        });

  if (sequence > 1 && !previous) {
    throw new Error(
      `Ledger integrity failure: entry ${sequence - 1} is missing; refusing to append ${sequence}.`,
    );
  }

  const prevHash = previous?.entryHash ?? GENESIS_PREV_HASH;
  const createdAt = new Date();
  const canonicalPayload = canonicalise(input.payload);
  const payloadHash = sha256Hex(canonicalPayload);
  const entryHash = computeEntryHash({
    prevHash,
    sequence,
    createdAt,
    eventType: input.eventType,
    payloadHash,
  });

  return tx.ledgerEntry.create({
    data: {
      sequence,
      eventType: input.eventType,
      recordId: input.recordId ?? null,
      payload: canonicalPayload,
      payloadHash,
      prevHash,
      entryHash,
      actorId: input.actorId ?? null,
      actorLabel: input.actorLabel,
      createdAt,
    },
  });
}

/** Append a standalone entry in its own transaction. */
export async function appendToChain(input: AppendInput) {
  return prisma.$transaction((tx) => appendToChainTx(tx as TxClient, input));
}

export interface ChainVerificationIssue {
  sequence: number;
  entryId: string;
  problem:
    | "SEQUENCE_GAP"
    | "PAYLOAD_HASH_MISMATCH"
    | "PREV_HASH_MISMATCH"
    | "ENTRY_HASH_MISMATCH";
  detail: string;
}

export interface ChainVerificationResult {
  ok: boolean;
  entriesChecked: number;
  headSequence: number | null;
  headHash: string | null;
  issues: ChainVerificationIssue[];
  /** Highest sequence covered by an external anchor, if any. */
  lastAnchoredSequence: number | null;
  lastAnchoredAt: Date | null;
}

/**
 * Recompute the entire chain from stored payloads.
 *
 * Streams in pages so that verifying a large ledger does not require loading it
 * all into memory. Reports every problem found rather than stopping at the
 * first, because the shape of the damage tells you what happened.
 */
export async function verifyChain(pageSize = 500): Promise<ChainVerificationResult> {
  const issues: ChainVerificationIssue[] = [];
  let expectedPrevHash = GENESIS_PREV_HASH;
  let expectedSequence = 1;
  let checked = 0;
  let headSequence: number | null = null;
  let headHash: string | null = null;
  let cursor: string | undefined;

  for (;;) {
    const page = await prisma.ledgerEntry.findMany({
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { sequence: "asc" },
    });
    if (page.length === 0) break;

    for (const entry of page) {
      if (entry.sequence !== expectedSequence) {
        issues.push({
          sequence: entry.sequence,
          entryId: entry.id,
          problem: "SEQUENCE_GAP",
          detail: `Expected sequence ${expectedSequence} but found ${entry.sequence}. Entries between these positions are missing.`,
        });
        // Resynchronise so one gap does not cascade into an error per entry.
        expectedSequence = entry.sequence;
      }

      const payloadHash = sha256Hex(entry.payload);
      if (payloadHash !== entry.payloadHash) {
        issues.push({
          sequence: entry.sequence,
          entryId: entry.id,
          problem: "PAYLOAD_HASH_MISMATCH",
          detail: `Stored payload digests to ${payloadHash} but the entry records ${entry.payloadHash}. The payload was altered after it was committed.`,
        });
      }

      if (entry.prevHash !== expectedPrevHash) {
        issues.push({
          sequence: entry.sequence,
          entryId: entry.id,
          problem: "PREV_HASH_MISMATCH",
          detail: `Entry links to ${entry.prevHash} but the preceding entry hashes to ${expectedPrevHash}.`,
        });
      }

      const recomputed = computeEntryHash({
        prevHash: entry.prevHash,
        sequence: entry.sequence,
        createdAt: entry.createdAt,
        eventType: entry.eventType,
        payloadHash: entry.payloadHash,
      });
      if (recomputed !== entry.entryHash) {
        issues.push({
          sequence: entry.sequence,
          entryId: entry.id,
          problem: "ENTRY_HASH_MISMATCH",
          detail: `Entry recomputes to ${recomputed} but stores ${entry.entryHash}. Its timestamp, type, or linkage was altered.`,
        });
      }

      expectedPrevHash = entry.entryHash;
      expectedSequence = entry.sequence + 1;
      headSequence = entry.sequence;
      headHash = entry.entryHash;
      checked += 1;
    }

    cursor = page[page.length - 1].id;
    if (page.length < pageSize) break;
  }

  const anchor = await prisma.chainAnchor.findFirst({
    orderBy: { sequence: "desc" },
  });

  return {
    ok: issues.length === 0,
    entriesChecked: checked,
    headSequence,
    headHash,
    issues,
    lastAnchoredSequence: anchor?.sequence ?? null,
    lastAnchoredAt: anchor?.anchoredAt ?? null,
  };
}

export interface RecordDivergence {
  recordId: string;
  recordNumber: string;
  field: string;
  inRegister: string;
  inLedger: string;
}

/**
 * Check that the registers still say what the ledger says they say.
 *
 * The hash chain proves the *log* has not been rewritten. It does not, by
 * itself, prove that the `Record` rows the application displays still match what
 * was committed — someone with a SQL client could edit a record in place, leave
 * the ledger untouched, and the chain would verify perfectly while the register
 * showed something that was never recorded.
 *
 * This closes that gap by replaying each record's most recent committed state
 * out of the chain and comparing it to the row. The ledger is authoritative:
 * where the two disagree, the ledger is what the Kingdom actually recorded.
 */
export async function verifyRecordsAgainstLedger(
  pageSize = 200,
): Promise<RecordDivergence[]> {
  const divergences: RecordDivergence[] = [];
  let cursor: string | undefined;

  for (;;) {
    const records = await prisma.record.findMany({
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        recordNumber: true,
        title: true,
        data: true,
        status: true,
        classification: true,
      },
    });
    if (records.length === 0) break;

    for (const record of records) {
      // All entries that committed state for this record, newest first.
      const entries = await prisma.ledgerEntry.findMany({
        where: {
          recordId: record.id,
          eventType: { in: ["RECORD_CREATED", "RECORD_AMENDED"] },
        },
        orderBy: { sequence: "desc" },
        select: { payload: true, eventType: true },
      });

      /**
       * Whether the ledger says this record was voided or superseded.
       *
       * This must be read from the LEDGER, never from the register row. An
       * earlier version exempted a record from the status check whenever the
       * *register* said VOID or SUPERSEDED — which is the value the check exists
       * to verify. Writing "VOID" directly into the row therefore switched off
       * the only check that would have caught it, and a record could be
       * suppressed from every list view with nothing to show for it. A test
       * covers this precise case; see tests/chain-exemption.test.ts.
       */
      const lifecycle = await prisma.ledgerEntry.findFirst({
        where: {
          recordId: record.id,
          eventType: { in: ["RECORD_VOIDED", "RECORD_SUPERSEDED"] },
        },
        orderBy: { sequence: "desc" },
        select: { eventType: true },
      });
      const statusFromLifecycle =
        lifecycle?.eventType === "RECORD_VOIDED"
          ? "VOID"
          : lifecycle?.eventType === "RECORD_SUPERSEDED"
            ? "SUPERSEDED"
            : null;

      if (entries.length === 0) {
        divergences.push({
          recordId: record.id,
          recordNumber: record.recordNumber,
          field: "(whole record)",
          inRegister: "present",
          inLedger: "no committed entry — this record was inserted outside the application",
        });
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
          // Malformed payloads are reported by verifyChain, not here.
        }
      }
      if (payloads.length === 0) continue;

      /**
       * The most recently committed value of a field.
       *
       * An amendment payload carries only what changed, so a field that has not
       * been touched since creation is absent from every amendment and must be
       * read from the creation entry. Walking newest-first and taking the first
       * defined value gives the committed state in either case.
       */
      const committed = (onCreate: string, onAmend: string): unknown => {
        for (const { payload, eventType } of payloads) {
          const value = eventType === "RECORD_CREATED" ? payload[onCreate] : payload[onAmend];
          if (value !== undefined && value !== null) return value;
        }
        return undefined;
      };

      const committedData = committed("data", "dataAfter");
      if (committedData !== undefined) {
        const asCommitted = canonicalise(committedData as CanonicalValue);
        if (asCommitted !== record.data) {
          divergences.push({
            recordId: record.id,
            recordNumber: record.recordNumber,
            field: "data",
            inRegister: record.data.slice(0, 200),
            inLedger: asCommitted.slice(0, 200),
          });
        }
      }

      // Voiding and supersession move a record's status through their own event
      // types rather than through an amendment, so where the ledger records one
      // of those acts, IT supplies the expected status. Where it does not, the
      // amendment history does. Either way the expectation comes from the
      // ledger, so a status written straight into the row is caught.
      const expectedStatus = statusFromLifecycle ?? committed("status", "statusTo");

      const checks: [string, unknown, string][] = [
        ["title", committed("title", "titleTo"), record.title],
        ["status", expectedStatus, record.status],
        [
          "classification",
          committed("classification", "classificationTo"),
          record.classification,
        ],
      ];

      for (const [field, inLedger, inRegister] of checks) {
        if (typeof inLedger === "string" && inLedger !== inRegister) {
          divergences.push({
            recordId: record.id,
            recordNumber: record.recordNumber,
            field,
            inRegister,
            inLedger,
          });
        }
      }
    }

    cursor = records[records.length - 1].id;
    if (records.length < pageSize) break;
  }

  divergences.push(...(await findDeletions(pageSize)));
  return divergences;
}

/**
 * Walk the ledger and check that everything it says exists still does.
 *
 * The loop above walks register → ledger, which catches a row that was *edited*
 * but is blind to one that was *deleted*: with no row there is nothing to
 * compare, and a register missing an inconvenient entry verifies perfectly.
 *
 * That is the more attractive attack of the two. Editing a record leaves a
 * record that says the wrong thing; deleting it leaves nothing to argue with.
 * The `onDelete: Cascade` on Attachment, Hold, Deadline and RecordRelation
 * means one `DELETE FROM Record` also takes the evidence, the legal hold, and
 * the deadlines with it.
 *
 * The ledger is what makes this recoverable. Every creation and every
 * attachment is committed there, the chain proves the commitments were not
 * rewritten, and so absence becomes provable rather than invisible.
 */
async function findDeletions(pageSize: number): Promise<RecordDivergence[]> {
  const divergences: RecordDivergence[] = [];

  // --- records the ledger says were created -------------------------------
  //
  // Identity comes from the PAYLOAD, never from `LedgerEntry.recordId`. The
  // foreign key is not covered by the entry hash and, before the `Restrict`
  // that now guards it, a deletion would have silently nulled it — so a check
  // keyed on it would have been switched off by the very act it looks for. The
  // payload is inside `payloadHash`, which is inside `entryHash`, which is
  // chained. It cannot be edited without breaking verification.
  let cursor: string | undefined;
  for (;;) {
    const created = await prisma.ledgerEntry.findMany({
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { eventType: "RECORD_CREATED" },
      orderBy: { id: "asc" },
      select: { id: true, recordId: true, payload: true },
    });
    if (created.length === 0) break;

    const wanted: { number: string; recordId: string | null }[] = [];
    for (const entry of created) {
      try {
        const payload = JSON.parse(entry.payload) as { recordNumber?: unknown };
        if (typeof payload.recordNumber === "string") {
          wanted.push({ number: payload.recordNumber, recordId: entry.recordId });
        }
      } catch {
        // verifyChain reports malformed payloads; do not double-report here.
      }
    }

    if (wanted.length > 0) {
      const present = new Set(
        (
          await prisma.record.findMany({
            where: { recordNumber: { in: wanted.map((w) => w.number) } },
            select: { recordNumber: true },
          })
        ).map((record) => record.recordNumber),
      );
      for (const want of wanted) {
        if (present.has(want.number)) continue;
        divergences.push({
          recordId: want.recordId ?? want.number,
          recordNumber: want.number,
          field: "(whole record)",
          inRegister: "MISSING — the record was deleted after it was committed",
          inLedger: "created",
        });
      }
    }

    cursor = created[created.length - 1].id;
    if (created.length < pageSize) break;
  }

  // --- attachments the ledger says were filed ------------------------------
  // An exhibit removed from a record is the same problem in the form that
  // matters most: the record still reads correctly and the proof is gone.
  let attachmentCursor: string | undefined;
  for (;;) {
    const added = await prisma.ledgerEntry.findMany({
      take: pageSize,
      ...(attachmentCursor ? { skip: 1, cursor: { id: attachmentCursor } } : {}),
      where: { eventType: "ATTACHMENT_ADDED" },
      orderBy: { id: "asc" },
      select: { id: true, recordId: true, payload: true },
    });
    if (added.length === 0) break;

    const wanted: { attachmentId: string; recordNumber: string; filename: string; recordId: string | null }[] = [];
    for (const entry of added) {
      try {
        const payload = JSON.parse(entry.payload) as Record<string, unknown>;
        if (typeof payload.attachmentId === "string") {
          wanted.push({
            attachmentId: payload.attachmentId,
            recordNumber: typeof payload.recordNumber === "string" ? payload.recordNumber : "(unknown)",
            filename: typeof payload.filename === "string" ? payload.filename : "(unnamed)",
            recordId: entry.recordId,
          });
        }
      } catch {
        // Reported by verifyChain.
      }
    }

    if (wanted.length > 0) {
      const present = new Set(
        (
          await prisma.attachment.findMany({
            where: { id: { in: wanted.map((w) => w.attachmentId) } },
            select: { id: true },
          })
        ).map((attachment) => attachment.id),
      );
      for (const want of wanted) {
        if (present.has(want.attachmentId)) continue;
        divergences.push({
          recordId: want.recordId ?? want.attachmentId,
          recordNumber: want.recordNumber,
          field: `attachment ${want.filename}`,
          inRegister: "MISSING — the attachment was removed after it was filed",
          inLedger: want.attachmentId,
        });
      }
    }

    attachmentCursor = added[added.length - 1].id;
    if (added.length < pageSize) break;
  }

  return divergences;
}

/** Current head of the chain, or null if the ledger has not been opened. */
export async function getChainHead() {
  const head = await prisma.ledgerEntry.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true, entryHash: true, createdAt: true, eventType: true },
  });
  return head;
}

/**
 * Proof that a specific record's history sits inside the chain, in a form that
 * can be handed to an outside party alongside a certified copy.
 */
export async function getRecordProof(recordId: string) {
  const entries = await prisma.ledgerEntry.findMany({
    where: { recordId },
    orderBy: { sequence: "asc" },
    select: {
      sequence: true,
      eventType: true,
      entryHash: true,
      prevHash: true,
      payloadHash: true,
      createdAt: true,
      actorLabel: true,
    },
  });
  if (entries.length === 0) return null;

  const firstSequence = entries[0].sequence;
  const anchor = await prisma.chainAnchor.findFirst({
    where: { sequence: { gte: entries[entries.length - 1].sequence } },
    orderBy: { sequence: "asc" },
  });

  return {
    entries,
    firstSequence,
    lastSequence: entries[entries.length - 1].sequence,
    /**
     * An anchor at or above the record's last sequence proves the record
     * existed no later than the anchor date. Without one, the record's date
     * rests on the Kingdom's own assertion.
     */
    coveringAnchor: anchor,
  };
}

export type LedgerTransaction = Prisma.TransactionClient;
