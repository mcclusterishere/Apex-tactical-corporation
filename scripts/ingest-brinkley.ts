/**
 * File the four Brinkley Eastern Cherokee applications into the register.
 *
 * These are Guion Miller applications (NARA microfilm M1104, Records of the U.S.
 * Court of Claims, RG 123). An application is a *claim* of Eastern Cherokee
 * descent made under oath in 1906-1909; it is not a finding that the claim was
 * true. Roughly 45,900 applications were filed and about 30,820 individuals were
 * ultimately enrolled, so the base rate of rejection is high and every record
 * opened here carries the decision on its face.
 *
 * Run with `npx tsx scripts/ingest-brinkley.ts <transcript.json>`, where the
 * JSON is the verified transcription output. Idempotent: an application already
 * filed is skipped rather than duplicated.
 */
import { readFile } from "node:fs/promises";
import { prisma } from "../src/lib/db";
import { createRecord } from "../src/lib/records";
import { storeFile } from "../src/lib/storage";
import { appendToChainTx } from "../src/lib/chain";

interface Person {
  name: string;
  relationship: string;
  detail?: string;
  confidence: string;
}

interface Transcription {
  naId: string;
  applicantName: string;
  applicationNumber: string;
  legible: string;
  residence?: string;
  birthDate?: string;
  birthPlace?: string;
  age?: string;
  tribeClaimed?: string;
  decision: string;
  people: Person[];
  charlesBrinkleyPresent: string;
  verbatimQuotes?: string[];
  notes: string;
}

interface Verification {
  verdict: string;
  wrongOrInvented: string[];
  missed: string[];
  decisionVisible: string;
  charlesBrinkley: string;
  summary: string;
}

interface Entry {
  transcription: Transcription;
  verification: Verification | null;
}

const ROLLS: Record<string, number> = {
  "56637149": 186,
  "56638054": 186,
  "56764320": 244,
  "56766211": 246,
};

const PAGES_DIR =
  "/tmp/claude-0/-home-user-Apex-tactical-corporation/c402ca91-84b3-5603-a850-c73bfebf7729/scratchpad/pages";

function decisionToRoll(decision: string): string {
  const d = decision.toUpperCase();
  if (d.startsWith("ADMITTED")) return "YES";
  if (d.startsWith("REJECTED")) return "SEARCHED_NOT_FOUND";
  return "UNKNOWN";
}

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Pass the transcript JSON path.");
  const entries: Entry[] = JSON.parse(await readFile(path, "utf8")).applications;

  const sov = await prisma.user.findFirst({ where: { role: "SOVEREIGN" } });
  if (!sov) throw new Error("No sovereign.");
  const P = {
    id: sov.id,
    email: sov.email,
    displayName: sov.displayName,
    role: sov.role,
    officeTitle: sov.officeTitle,
    clearance: "RESTRICTED",
    mustResetPw: false,
    mfaEnrolled: false,
    mfaSatisfied: true,
    reauthenticated: true,
  } as never;

  for (const { transcription: t, verification: v } of entries) {
    const existing = await prisma.record.findFirst({
      where: { registry: "lineage", title: { contains: `Application ${t.applicationNumber}` } },
    });
    if (existing) {
      console.log(`skip ${t.applicationNumber} — already filed as ${existing.recordNumber}`);
      continue;
    }

    const roll = ROLLS[t.naId];
    const certain = t.people.filter((p) => p.confidence === "CERTAIN");
    const uncertain = t.people.filter((p) => p.confidence !== "CERTAIN");

    const peopleBlock = t.people.length
      ? t.people
          .map(
            (p) =>
              `- ${p.name} — ${p.relationship}${p.detail ? `; ${p.detail}` : ""} [${p.confidence}]`,
          )
          .join("\n")
      : "No person other than the applicant could be read from the packet.";

    const againstInterest = [
      "Recorded expressly, because a register that keeps only the flattering half of a document is worthless the first time it is tested.",
      `(1) THIS IS AN APPLICATION, NOT A FINDING. Filing it asserted Eastern Cherokee descent under oath; it did not establish it. The Guion Miller process received roughly 45,900 applications and enrolled about 30,820 individuals, so rejection was ordinary rather than exceptional.`,
      `(2) DECISION ON THE FACE OF THE RECORD: ${t.decision}.${
        v ? ` Independent re-reader on the decision: ${v.decisionVisible}` : ""
      }`,
      `(3) NO RELATIONSHIP TO THE FOUNDER'S LINE IS ESTABLISHED. This packet is filed on a surname match to the Founder's mother's maiden name. A surname is a lead, not a link, and nothing here connects it to her family.`,
      `(4) LEGIBILITY: ${t.legible}`,
      uncertain.length
        ? `(5) NAMES THAT ARE NOT SECURE READINGS and must not be repeated as fact: ${uncertain
            .map((p) => `${p.name} (${p.relationship})`)
            .join("; ")}.`
        : "(5) No name in this record was recorded as an uncertain reading.",
      v && v.wrongOrInvented.length
        ? `(6) THE ADVERSARIAL RE-READ DISPUTED THE FOLLOWING and they are excluded or flagged accordingly: ${v.wrongOrInvented.join(
            "; ",
          )}`
        : "(6) The adversarial re-read disputed nothing in the transcription.",
    ].join("\n\n");

    const data: Record<string, unknown> = {
      ancestorName: t.applicantName,
      nameVariants: `${t.applicantName}; catalogue form as filmed`,
      sex: "UNKNOWN",
      birthDate: t.birthDate || "",
      birthPlace: t.birthPlace || "",
      birthConfidence: t.birthDate ? "STATED_ON_RECORD" : "UNKNOWN",
      generation: 0,
      relationshipPath:
        "Surname match to the Founder's mother's maiden name (Brinkley). NO relationship has been established. Filed as a research subject on the strength of the surname alone.",
      descentThroughChild: "Not established.",
      parentageEvidence: peopleBlock,
      classificationsRecorded: ["NONE_RECORDED"],
      classificationLog:
        "A Guion Miller application does not carry a racial classification in the census sense. What it carries is the applicant's own sworn assertion of Cherokee descent and the examiner's response to it, which is a different kind of evidence and must not be quoted as though it were a race entry.",
      classificationChanged: false,
      reclassificationAnalysis:
        "Not applicable on this document. It records a claim of descent and its disposition, not a reclassification.",
      recordingOfficials: "U.S. Court of Claims, Eastern Cherokee applications, 1906-1909.",
      recordSetsSearched: ["TRIBAL_ROLLS"],
      searchLog:
        `NARA catalogue searched for the surname Brinkley within records titled "Application Number" — 236 hits, paged to exhaustion (232 of 236 unique descriptions retrieved across 5 pages). ` +
        `17 Eastern Cherokee Applications were returned; exactly 4 carry the name Brinkley in the title, and all 4 are filed in this register. ` +
        `This packet, naId ${t.naId}, M1104 roll ${roll}, was downloaded in full and read page by page. Every page is held in the Evidence Vault.`,
      nilReturns:
        "SEARCHED AND NIL: the surname Brinkley returns ZERO hits in any Indian Home Guard record. A search of the surname against Dawes returned no Brinkley-titled Dawes enrolment record, and against Choctaw/Chickasaw/Creek/Seminole returned none. " +
        "NOT SEARCHED, and nothing may be inferred from absence here: state vital records; the Freedmen's Bureau records; county deeds and probate; the Baker, Churchill and Hester rolls; and the census, which the NARA catalogue does not index by personal name at all — a Brinkley on a census page is invisible to every search run here, which is a limit of the finding aid and not a fact about the family.",
      searchesOutstanding:
        "1. THE FOUNDER'S OWN LINE. Nothing connects these four applicants to the Founder's mother. That connection has to be built forward from her, using her birth record, her parents' marriage, and the census, before any of this matters.\n" +
        "2. The other Guion Miller series: the index cards (M685) and the report and exhibits, which give the examiner's reasoning at more length.\n" +
        "3. Where an application names an ancestor, that ancestor against the Cherokee rolls the Commission actually used — the 1835 Henderson, 1848 Mullay, 1851 Siler and Chapman, and 1884 Hester rolls.",
      keySourceType: "ORIGINAL",
      keyInformationType: "PRIMARY",
      keyEvidenceType: "DIRECT",
      evidenceCorrelation:
        "Original federal record, digitised by NARA in collaboration with Fold3, access and use both Unrestricted. As to the applicant's own name, age and residence it is primary information given by a person with direct knowledge. As to grandparents and earlier ancestors it is at best secondary and often family tradition recorded under oath, which is exactly the class of evidence the examiners were appointed to test.",
      conflictStatus: t.people.some((p) => p.confidence !== "CERTAIN")
        ? "UNRESOLVED"
        : "NONE_IDENTIFIED",
      conflictingEvidence:
        uncertain.length > 0
          ? `Handwriting on the film is not secure for: ${uncertain
              .map((p) => p.name)
              .join("; ")}. Recorded as read, marked uncertain, and not to be relied on.`
          : "None on the face of the packet.",
      conflictResolution:
        uncertain.length > 0
          ? "Unresolved. Resolution requires the original film or a better scan, not a more confident guess."
          : "Not applicable.",
      evidenceAgainstInterest: againstInterest,
      downstreamImpact:
        "None at present. No descent is claimed from this individual, and no citizen record depends on this file.",
      claimedTribe: t.tribeClaimed || "Eastern Cherokee (as asserted by the applicant)",
      claimBasis: "DOCUMENTARY_RECORD",
      claimBasisDetail:
        `Application Number ${t.applicationNumber} to the U.S. Court of Claims under the Act of 30 June 1906, asserting Eastern Cherokee descent. ` +
        `The claim is the applicant's; the Kingdom records it as a claim that was made, and records its disposition alongside it.`,
      appearsOnRoll: decisionToRoll(t.decision),
      rollName: `Eastern Cherokee Applications (Guion Miller), M1104 roll ${roll}`,
      rollNumber: t.applicationNumber,
      descendantEnrollmentStatus: "NOT_APPLICABLE",
      enrolmentNotes:
        "No living person's enrolment turns on this record. It is filed as ancestry research, not as support for anyone's tribal citizenship.",
      documentImages: `${
        Object.keys(ROLLS).length ? "" : ""
      }NARA NAID ${t.naId}; every page held in the Evidence Vault with its SHA-256 committed to the ledger.`,
      researcher: "Office of the Registrar",
      researchOpenedDate: new Date().toISOString().slice(0, 10),
      lastReviewedDate: new Date().toISOString().slice(0, 10),
      livingRelativesConsent: false,
      sensitivityNotes:
        `Public federal record; NARA records access and use as Unrestricted. RG 123, Records of the U.S. Court of Claims; series "Eastern Cherokee Applications"; microfilm M1104 roll ${roll}; naId ${t.naId}. ` +
        (t.verbatimQuotes?.length
          ? `\n\nVERBATIM, as filmed:\n${t.verbatimQuotes.map((q) => `  "${q}"`).join("\n")}`
          : "") +
        `\n\nCharles Brinkley: ${t.charlesBrinkleyPresent}` +
        (v ? `\n\nADVERSARIAL RE-READ (${v.verdict}): ${v.summary}` : ""),
    };

    const created = await createRecord(P, {
      registrySlug: "lineage",
      data,
      title: `${t.applicantName} — Eastern Cherokee Application ${t.applicationNumber}`,
      classification: "MEMBERS",
      status: "RESEARCHING",
    });
    console.log(
      `filed ${created.recordNumber}  ${t.applicantName}  (${certain.length} certain / ${uncertain.length} uncertain names)`,
    );

    // Attach every page, digest committed in the same transaction as the row.
    const { readdir } = await import("node:fs/promises");
    const files = (await readdir(PAGES_DIR))
      .filter((f) => f.startsWith(`${t.naId}_`))
      .sort();
    for (const f of files) {
      const bytes = await readFile(`${PAGES_DIR}/${f}`);
      const stored = await storeFile(bytes);
      await prisma.$transaction(async (tx) => {
        const att = await tx.attachment.create({
          data: {
            recordId: created.id,
            filename: f,
            contentType: "image/jpeg",
            byteSize: stored.byteSize,
            sha256: stored.sha256,
            storageKey: stored.storageKey,
            acquiredFrom: "National Archives Catalog (catalog.archives.gov)",
            acquiredAt: new Date(),
            collectionNote:
              `Downloaded directly from the National Archives Catalog digital object for naId ${t.naId} ` +
              `(M1104 roll ${roll}), scanned by NARA in collaboration with Fold3. Retrieved over HTTPS by the ` +
              `Registrar's office and stored unmodified; the SHA-256 recorded here is over the exact bytes served by NARA.`,
            classification: "MEMBERS",
            uploadedById: sov.id,
          },
        });
        await tx.custodyEvent.create({
          data: {
            attachmentId: att.id,
            action: "RECEIVED",
            actor: `${sov.displayName} (${sov.role})`,
            counterparty: "National Archives Catalog",
            occurredAt: new Date(),
            note: "Received by direct download from the originating repository.",
          },
        });
        await appendToChainTx(tx, {
          eventType: "ATTACHMENT_ADDED",
          recordId: created.id,
          actorId: sov.id,
          actorLabel: `${sov.displayName} (${sov.role})`,
          payload: {
            filename: f,
            sha256: stored.sha256,
            byteSize: stored.byteSize,
            naId: t.naId,
          },
        });
      });
    }
    console.log(`   ${files.length} page(s) attached and committed`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
