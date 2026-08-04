/**
 * File the Founder's Y-chromosome result, YFull sample YF116325.
 *
 * A Y-DNA test answers exactly one question — the unbroken father's-father's-
 * father line — and answers it about as definitively as genetics answers
 * anything. It says nothing whatever about the rest of a person's ancestry, and
 * the register has to state both halves of that in the same breath, because the
 * first half read alone is a false negative and the second half read alone is an
 * excuse.
 *
 * Run with `npx tsx scripts/ingest-ydna.ts`. Idempotent.
 */
import { prisma } from "../src/lib/db";
import { createRecord } from "../src/lib/records";

const PATH = [
  "A1", "A1b", "BT", "CT", "DE", "E", "E-M5479", "E-P147", "E-P177", "E-M5557",
  "E-V38", "E-M2", "E-Y1705", "E-V43", "E-M4732", "E-M4895", "E-M4706",
  "E-CTS8098", "E-L485", "E-L514", "E-M4694", "E-FGC91110", "E-M191", "E-U174",
  "E-M4670", "E-Z1643", "E-CTS553", "E-Y32546", "E-Y379914",
];

async function main() {
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

  const existing = await prisma.record.findFirst({
    where: { registry: "lineage", title: { contains: "YF116325" } },
  });
  if (existing) {
    console.log(`skip — already filed as ${existing.recordNumber}`);
    await prisma.$disconnect();
    return;
  }

  const data: Record<string, unknown> = {
    ancestorName: "The Founder's direct paternal line (Y-chromosome, YFull YF116325)",
    nameVariants:
      "Recorded as a lineage rather than a person: a Y-chromosome result describes the unbroken male line, not any one man in it.",
    sex: "MALE",
    birthConfidence: "UNKNOWN",
    generation: 0,
    relationshipPath:
      "The Founder's own direct paternal line — his father, his father's father, and so on without a break. This is the line the McCluster surname travels down, so far as the surname has been carried patrilineally.",
    descentThroughChild: "Not applicable; this is the Founder's own line.",
    parentageEvidence:
      "Genetic, not documentary. YFull sample YF116325, 1.50 Gb BAM, 99.86% of length covered at 74X median depth, placed against YTree version 14.04.0 (15 July 2026). Coverage and depth at that level mean the terminal placement is not a coin toss; it is about as firm as this kind of result gets.",
    classificationsRecorded: ["NONE_RECORDED"],
    classificationLog:
      "A DNA report carries no administrative racial classification and cannot be quoted as one. What it carries is a position on a phylogenetic tree, which is a different kind of fact and is not the same thing as how any clerk, census taker or registrar recorded this family.",
    classificationChanged: false,
    reclassificationAnalysis:
      "Not applicable. This document is evidence about biological descent, not about how the state recorded anyone.",
    recordingOfficials: "YFull (commercial laboratory analysis of a submitted BAM file).",
    recordSetsSearched: ["FEDERAL_CENSUS"],
    searchLog:
      "YFull YReport for sample YF116325 retrieved from the shared report URL supplied by the Founder and read in full on 4 August 2026. " +
      "Terminal haplogroup and the complete subclade path were taken verbatim from the report.",
    nilReturns:
      "THE REPORT CONTAINS NO mtDNA RESULT. None. It is a Y-chromosome report and nothing else. " +
      "It also states NO age estimates, NO geographic origin, NO population associations, and lists NO matches — all four of those were checked for and are absent from the document itself. " +
      "Anything said below about what haplogroup E-M2 means geographically comes from the published literature on Y-chromosome phylogeography, NOT from this report, and must be cited that way.",
    searchesOutstanding:
      "1. THE mtDNA TEST. This is the single most important outstanding item and it bears directly on the line currently being researched. " +
      "mtDNA traces the mother's mother's mother line without a break. The Native American mtDNA founding haplogroups are A2, B2, C1, C4c, D1, D4h3a and X2a. " +
      "If the Founder's direct maternal line carries one of those, that is affirmative genetic evidence of Native descent on that line — and the Founder's maternal line is the Brinkley line now under research. This test has not been done. Do it.\n" +
      "2. AUTOSOMAL. Y and mtDNA between them cover two lines out of hundreds. An autosomal test estimates the whole genome and is the only test that speaks to overall ancestry proportions. Note its known limitation: Indigenous American reference panels are small, so autosomal tools systematically under-report Native ancestry at low percentages. Treat a small or absent Native figure as weak evidence, not as a finding.\n" +
      "3. Y-DNA of a Brinkley male relative. A Brinkley cousin's Y result would test the Brinkley paternal line directly, which the Founder's own Y-chromosome cannot do.",
    keySourceType: "ORIGINAL",
    keyInformationType: "PRIMARY",
    keyEvidenceType: "NEGATIVE",
    evidenceCorrelation:
      "Original laboratory result, high coverage, current tree version. As to the paternal line it is direct and primary evidence. As to every other ancestral line it is silent — not weak, silent.",
    conflictStatus: "RESOLVED",
    conflictingEvidence:
      "This result conflicts with any claim that the Founder's PATERNAL line is Indigenous American. It does not conflict with a claim of Native ancestry elsewhere in the family, because it says nothing at all about elsewhere.",
    conflictResolution:
      "Resolved in favour of the genetic evidence for the paternal line specifically, and only for the paternal line. The conflict is narrower than it first appears, and the register records its exact width.",
    evidenceAgainstInterest:
      "RECORDED PLAINLY, AND IT IS THE MOST IMPORTANT ENTRY IN THIS FILE.\n\n" +
      "The terminal haplogroup is E-Y379914, and the path to it runs through E-V38 and then E-M2. " +
      "E-M2 (also written E1b1a1) is the defining Y-chromosome lineage of West and Central Africa; it is carried by the large majority of men in West Africa and by the large majority of African-descended men in the Americas. " +
      "The downstream branches here, E-M191 and E-U174, sit within that same West/Central African cluster.\n\n" +
      "The Y-chromosome haplogroups found in Indigenous American men are Q — overwhelmingly Q-M3 (Q1b1a1a) and its relatives under Q-L54 — together with C-P39 in some northern populations. They are not E, and E is not a borderline case: E and Q diverge tens of thousands of years back and on different continents.\n\n" +
      "SO: the Founder's direct paternal line is West or Central African in origin. It is NOT Indigenous American. That is what this test says, it is said with high confidence, and no reading of the report changes it.\n\n" +
      "WHAT IT DOES NOT SAY, which matters just as much: a Y-chromosome is one line out of an enormous number. Going back ten generations a person has up to 1,024 ancestors, and the Y-chromosome reports exactly one of them per generation. A man can carry substantial documented Native ancestry and still show an African or European Y-line — this is ordinary, not exceptional, and it is especially ordinary in American families whose paternal surname line was set by slavery. This result therefore closes the paternal question and leaves every other line completely open, including the maternal Brinkley line that is the actual subject of the current research.",
    downstreamImpact:
      "Closes one specific line of inquiry: no claim of Indigenous descent should be built on the Founder's paternal line, and any document suggesting otherwise now has to answer this result. Redirects the research to the maternal line, where the test that would actually be probative has not yet been run.",
    dnaTestTypes: ["Y_DNA"],
    testingCompany: "YFull (analysis of a submitted whole-genome BAM file)",
    kitReference: "YF116325",
    haplogroup:
      "E-Y379914 (SNPs Y379914 • FTG75238). Full path as published: ROOT (Y-chromosomal Adam) > " +
      PATH.join(" > ") +
      ". Placed against YTree v14.04.0, 15 July 2026.",
    relevantMatches:
      "None listed in the report. The absence of listed matches is a fact about this report, not about the world; YFull lists matches only among its own sampled users.",
    dnaInterpretation:
      "The paternal line is West/Central African in origin (E-M2 clade) and is not Indigenous American (which would require haplogroup Q or C). " +
      "High coverage and current tree placement mean this is a firm result rather than a provisional one. " +
      "Its scope is one line only. The maternal line is untested and is where the probative test now lies.",
    claimedTribe: "None. This record supports no tribal claim and is filed as evidence against one.",
    claimBasis: "DNA_ONLY",
    claimBasisDetail:
      "Filed as a negative finding on the paternal line. It is entered because a register that files only the evidence pointing one way is not a register, and because a claim built on a line this test has closed would be defeated the moment anyone asked for the report.",
    appearsOnRoll: "NO_RELEVANT_ROLL",
    descendantEnrollmentStatus: "NOT_APPLICABLE",
    enrolmentNotes:
      "No tribal enrolment turns on a haplogroup. No federally recognised tribe in the United States admits members on the basis of a DNA test, and none uses haplogroup evidence as a criterion; enrolment turns on documented descent from a specific historical roll under that tribe's own law. This record is genealogical evidence, not a credential.",
    researcher: "Office of the Registrar",
    researchOpenedDate: new Date().toISOString().slice(0, 10),
    lastReviewedDate: new Date().toISOString().slice(0, 10),
    livingRelativesConsent: false,
    sensitivityNotes:
      "SEALED-grade material by nature: this is the genetic data of a living person, the Founder himself. " +
      "It is the Founder's own result and his to disclose, but it also carries information about every male relative on his paternal line, none of whom consented. " +
      "It must not appear in a gazette, an extract, a petition, or any external correspondence without a specific written decision by the Founder recorded in this register.",
  };

  const created = await createRecord(P, {
    registrySlug: "lineage",
    data,
    title: "Y-chromosome result, YFull YF116325 — the Founder's paternal line",
    classification: "SEALED",
    status: "RESEARCHING",
  });
  console.log(`filed ${created.recordNumber}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
