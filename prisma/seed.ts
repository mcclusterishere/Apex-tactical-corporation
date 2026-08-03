/**
 * Seed the register with the Kingdom's founding records.
 *
 * Run with `npm run seed`. Safe to run repeatedly: it will not duplicate the
 * genesis entry or re-create records that already exist, so it can be used to
 * bring an existing deployment up to date after new founding records are added
 * here.
 *
 * What is seeded is deliberately conservative. Only facts evidenced by the
 * documents actually in hand are recorded — the executed Charter and the
 * Connecticut General Assembly citation. Everything else is left for the
 * Registrar to enter, because a register pre-populated with plausible-looking
 * entries nobody actually verified is worse than an empty one.
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes, createHash, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const GENESIS_PREV_HASH = "0".repeat(64);
const CHAIN_COUNTER_KEY = "ledger:sequence";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

/** Duplicated from src/lib/canonical.ts — the seed must not import app code. */
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

async function append(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  input: {
    eventType: string;
    payload: unknown;
    recordId?: string | null;
    actorId?: string | null;
    actorLabel: string;
  },
) {
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

  const prevHash = previous?.entryHash ?? GENESIS_PREV_HASH;
  const createdAt = new Date();
  const payload = canonicalise(input.payload);
  const payloadHash = sha256Hex(payload);

  return tx.ledgerEntry.create({
    data: {
      sequence,
      eventType: input.eventType,
      recordId: input.recordId ?? null,
      payload,
      payloadHash,
      prevHash,
      entryHash: computeEntryHash({
        prevHash,
        sequence,
        createdAt,
        eventType: input.eventType,
        payloadHash,
      }),
      actorId: input.actorId ?? null,
      actorLabel: input.actorLabel,
      createdAt,
    },
  });
}

async function nextNumber(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  registrySlug: string,
  prefix: string,
): Promise<string> {
  const counter = await tx.counter.upsert({
    where: { key: `registry:${registrySlug}` },
    create: { key: `registry:${registrySlug}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `AK-${prefix}-${String(counter.value).padStart(6, "0")}`;
}

interface SeedRecord {
  registry: string;
  prefix: string;
  title: string;
  classification: string;
  status: string;
  effectiveDate?: string;
  data: Record<string, unknown>;
}

const SEED_RECORDS: SeedRecord[] = [
  {
    registry: "instruments",
    prefix: "INST",
    title: "Charter of Apex Kingdom",
    classification: "PUBLIC",
    status: "IN_FORCE",
    effectiveDate: "2010-10-30",
    data: {
      instrumentType: "CHARTER",
      citation: "Charter of Apex Kingdom (2025)",
      promulgatingAuthority: "Matthew McCluster, Founder and Sovereign Head",
      dateExecuted: "2025-05-29",
      dateEffective: "2010-10-30",
      notarised: true,
      notary: "Joyiesha F. Smoak, Notary Public, State of Connecticut, I.D. SNPC 0185844",
      witnesses: "Stephanie Arevalo",
      summary:
        "The supreme governing instrument of Apex Kingdom. Nine articles constituting the Kingdom as a combined tribal government, ecclesiastical body, and charitable trust; defining membership and beneficiary status; asserting sovereignty and jurisdiction; enumerating twelve powers; reserving territorial and land claims; declaring external relations and non-interference; vesting supreme authority in the Founder with a succession plan; reserving the amendment power; and adopting the whole nunc pro tunc to 30 October 2010.",
      notes:
        "EXECUTED 29 MAY 2025; DECLARED EFFECTIVE 30 OCTOBER 2010. Always describe it in exactly those terms. The retroactive effective date is an ordinary declaration of the community's founding and is defensible; presenting the document as though it were written in 2010 is not. Attach the executed, witnessed, and notarised original to this record.",
    },
  },
  {
    registry: "government-contacts",
    prefix: "G2G",
    title: "Official Citation, Connecticut General Assembly",
    classification: "PUBLIC",
    status: "CLOSED",
    effectiveDate: "2025-10-05",
    data: {
      counterpartBody: "Connecticut General Assembly",
      level: "STATE",
      agencyOffice: "Office of the President Pro Tempore; Office of the Speaker of the House",
      official:
        "Introduced by Sen. Herron Gaston (23rd), Sen. Sujata Gadkar-Wilcox (22nd), Sen. Tony Hwang (28th), Rep. Andre F. Baker Jr. (124th), Rep. Christopher Rosario (128th), Rep. Cristin McCarthy Vahey (133rd), Rep. Steven J. Stafstrom (129th), Rep. Antonio Felipe (130th), Rep. Fred Gee Jr. (126th)",
      direction: "INCOMING",
      mode: "OTHER",
      date: "2025-10-05",
      subject: "Official Citation recognising Apex Kingdom",
      summary:
        "Citation issued at the State Capitol, Hartford, congratulating Apex Kingdom and recognising it for advancing cultural heritage, civic education, and community empowerment. Signed by the President Pro Tempore, the Speaker of the House, and the Secretary of the State, under seal.",
      outcome:
        "Received. A ceremonial legislative honour, genuinely creditable as recognition of community contribution and of standing with the Bridgeport delegation.",
      notes:
        "IMPORTANT — how to present this. A General Assembly citation is a ceremonial courtesy issued routinely by legislators for anniversaries, retirements, community service, and business openings. It is real, it is signed and sealed, and it evidences a genuine relationship with nine state legislators. It is NOT state recognition of tribal status, confers no legal status, and creates no government-to-government relationship. Present it as what it is — recognition of community contribution. Officials who deal with citations every week will know immediately if it is characterised as anything more, and the cost of that in credibility is far greater than anything the overstatement could gain. The nine legislators who signed it are the most valuable thing this record contains: that is a working relationship worth maintaining.",
    },
  },
];

async function main() {
  console.log("Seeding the register of Apex Kingdom…\n");

  // --- The Sovereign's account -------------------------------------------
  const founderEmail = process.env.SEED_FOUNDER_EMAIL ?? "matthew@mccluster.org";
  const provided = process.env.SEED_FOUNDER_PASSWORD;
  const initialPassword = provided ?? `apex-${randomBytes(9).toString("base64url")}`;

  let founder = await prisma.user.findUnique({ where: { email: founderEmail } });
  if (!founder) {
    founder = await prisma.user.create({
      data: {
        email: founderEmail,
        displayName: "Matthew McCluster",
        officeTitle: "Founder and Sovereign Head of Apex Kingdom",
        role: "SOVEREIGN",
        passwordHash: await hashPassword(initialPassword),
        mustResetPw: !provided,
      },
    });
    console.log(`  Commissioned the Sovereign: ${founderEmail}`);
    if (!provided) {
      console.log(`\n  ┌─────────────────────────────────────────────────────────┐`);
      console.log(`  │ INITIAL PASSWORD — shown once, change it at first login  │`);
      console.log(`  │ ${initialPassword.padEnd(55)} │`);
      console.log(`  └─────────────────────────────────────────────────────────┘\n`);
    }
  } else {
    console.log(`  The Sovereign's account already exists (${founderEmail}).`);
  }

  const actorLabel = "Matthew McCluster (SOVEREIGN)";

  // --- Open the ledger ----------------------------------------------------
  const existingGenesis = await prisma.ledgerEntry.findFirst({ where: { sequence: 1 } });
  if (!existingGenesis) {
    await prisma.$transaction(async (tx) => {
      await append(tx, {
        eventType: "GENESIS",
        actorId: founder.id,
        actorLabel,
        payload: {
          declaration:
            "The ledger of the Office of the Registrar of Apex Kingdom is hereby opened. Every subsequent entry is bound by cryptographic hash to this one. No entry is ever altered or removed; corrections are made by amendment and by void notation, both of which are themselves recorded.",
          charter: "Charter of Apex Kingdom, executed 2025-05-29, effective nunc pro tunc 2010-10-30",
          openedBy: actorLabel,
        },
      });
    });
    console.log("  Opened the ledger (genesis entry written).");
  } else {
    console.log("  The ledger is already open.");
  }

  // --- Founding records ---------------------------------------------------
  let created = 0;
  for (const seed of SEED_RECORDS) {
    const existing = await prisma.record.findFirst({
      where: { registry: seed.registry, title: seed.title },
    });
    if (existing) {
      console.log(`  Already on file: ${existing.recordNumber} — ${seed.title}`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const recordNumber = await nextNumber(tx, seed.registry, seed.prefix);
      const record = await tx.record.create({
        data: {
          registry: seed.registry,
          recordNumber,
          title: seed.title,
          data: canonicalise(seed.data),
          classification: seed.classification,
          status: seed.status,
          effectiveDate: seed.effectiveDate ? new Date(`${seed.effectiveDate}T00:00:00Z`) : null,
        },
      });

      await append(tx, {
        eventType: "RECORD_CREATED",
        recordId: record.id,
        actorId: founder.id,
        actorLabel,
        payload: {
          registry: seed.registry,
          recordNumber,
          title: seed.title,
          classification: seed.classification,
          status: seed.status,
          effectiveDate: seed.effectiveDate ?? null,
          data: seed.data,
        },
      });

      console.log(`  Recorded ${recordNumber} — ${seed.title}`);
      created += 1;
    });
  }

  // --- The founding issue of the gazette ----------------------------------
  const gazetteExists = await prisma.gazetteIssue.findFirst({ where: { number: 1 } });
  if (!gazetteExists) {
    const head = await prisma.ledgerEntry.findFirst({
      orderBy: { sequence: "desc" },
      select: { sequence: true, entryHash: true },
    });

    await prisma.$transaction(async (tx) => {
      const body = `## The register is opened

The Office of the Registrar of Apex Kingdom is constituted under Article IV of the Charter and begins its register on this date.

Every act of the Registrar is committed to an append-only ledger in which each entry is bound by cryptographic hash to the entry before it. Any alteration of a historical entry changes every hash that follows it and is detectable by anyone, including anyone outside the Kingdom.

## What is published in this issue

The ledger head hash printed at the foot of this issue is a public, dated commitment to the state of the register at the moment of publication. Every entry at or below that position existed on this date.

## Standing notice as to the Kingdom's character

Apex Kingdom is a religious society, cultural institution, and charitable trust. Its registers record its own instruments, offices, holdings, and dealings. They are not filings with any government and assert no authority over any person or property outside the Kingdom's own membership and holdings.

The Kingdom asserts its intellectual property rights — its copyrights, its marks, and its name — under the ordinary law of the United States, against any party, in the ordinary forums. Those rights are real and they will be enforced.`;

      const issue = await tx.gazetteIssue.create({
        data: {
          number: 1,
          title: "Opening of the Register",
          summary:
            "The Office of the Registrar is constituted; the ledger is opened; the founding instruments are recorded.",
          body,
          chainHead: head?.entryHash ?? null,
          chainSeq: head?.sequence ?? null,
        },
      });

      await append(tx, {
        eventType: "GAZETTE_PUBLISHED",
        actorId: founder.id,
        actorLabel,
        payload: {
          issueId: issue.id,
          number: 1,
          title: issue.title,
          summary: issue.summary,
          body,
          headAtPublication: head?.entryHash ?? null,
        },
      });
    });
    console.log("  Published Gazette No. 1.");
  }

  const [records, entries] = await Promise.all([
    prisma.record.count(),
    prisma.ledgerEntry.count(),
  ]);

  console.log(`\nDone. ${records} record(s) on file, ${entries} ledger entries.`);
  if (created > 0) {
    console.log("\nNext: attach the executed originals to the founding records, then run");
    console.log("`npm run chain:anchor` to fix the ledger head somewhere outside the Kingdom.");
  }
}

main()
  .catch((error) => {
    console.error("\nSeeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
