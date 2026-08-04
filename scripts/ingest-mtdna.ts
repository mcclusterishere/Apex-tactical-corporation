/**
 * File the Founder's mitochondrial (maternal-line) result.
 *
 * mtDNA answers one line — the mother's-mother's-mother line — and answers it
 * definitively. For this Founder that line runs back through his grandmother
 * Betty to his great-grandmother May Beulah Brinkley (record AK-LIN-000015), so
 * this result bears directly on the line that was opened as the most promising
 * in the register. It is filed with the same rule the Y-DNA record was filed
 * under: both halves in the same breath, because the flattering half read alone
 * is a lie and the unflattering half read alone is a bludgeon.
 *
 * Run with `npx tsx scripts/ingest-mtdna.ts`. Idempotent.
 */
import { prisma } from "../src/lib/db";
import { createRecord } from "../src/lib/records";

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
    where: { registry: "lineage", title: { contains: "mitochondrial" } },
  });
  if (existing) {
    console.log(`skip — already filed as ${existing.recordNumber}`);
    await prisma.$disconnect();
    return;
  }

  const data: Record<string, unknown> = {
    ancestorName: "The Founder's direct maternal line (mitochondrial, YFull YF116325)",
    nameVariants:
      "Recorded as a lineage, not a person. A mitochondrial result describes the unbroken mother-to-mother line, not any single woman in it.",
    sex: "FEMALE",
    birthConfidence: "UNKNOWN",
    generation: 0,
    relationshipPath:
      "THE FOUNDER'S DIRECT MATERNAL LINE, the same line as record AK-LIN-000015: " +
      "the Founder <- his mother <- Betty <- May Beulah Brinkley <- and back. " +
      "The Founder carries this mtDNA unaltered from every woman in that line, so this single result reads all of them, including May Beulah Brinkley.",
    descentThroughChild: "Not applicable; this is the Founder's own maternal line.",
    parentageEvidence:
      "Genetic. YFull sample YF116325. Two reference reports were supplied — rCRS and RSRS — plus the full reconstructed FASTA sequence of the mitochondrial genome. The RSRS report, which reads against the reconstructed ancestral human sequence, gives the lineage path directly.",
    classificationsRecorded: ["NONE_RECORDED"],
    classificationLog:
      "A DNA result carries no administrative racial classification and cannot be quoted as one. It is a position on the mitochondrial phylogenetic tree. That is not the same fact as how any clerk recorded this family, which is a separate and still-open question pursued through the census and vital records.",
    classificationChanged: false,
    reclassificationAnalysis:
      "Not applicable to this document, and this distinction matters. This result speaks to biological descent on one line. It does not speak to whether officials mis-recorded this family's race, which is the reclassification question and is answered by paper, not by haplogroups.",
    recordingOfficials: "YFull (laboratory analysis of a submitted whole-genome BAM).",
    recordSetsSearched: ["FEDERAL_CENSUS"],
    searchLog:
      "YFull mtDNA output for sample YF116325 read in full on 4 August 2026: the rCRS variant CSV, the RSRS variant CSV, and the reconstructed mitochondrial FASTA. The terminal haplogroup and its subclade path were taken from the RSRS report.",
    nilReturns:
      "THE MITOCHONDRIAL FOUNDING HAPLOGROUPS OF INDIGENOUS AMERICA ARE A2, B2, C1, C4c, D1, D4h3a AND X2a. This sample is L2a1a3, which is in none of them and is not near any of them. " +
      "That is a checked negative, stated as a negative, on the Founder's direct maternal line specifically.",
    searchesOutstanding:
      "1. AUTOSOMAL. This is now the only DNA test left that can speak to Native ancestry for this family, because both of the Founder's direct lines are now tested and both are African. An autosomal test samples across all ancestral lines, not just two, and it is the only test that could detect Native ancestry sitting on an untested line — in particular the line of the Founder's maternal grandfather, Paul Royal, whom neither the Y-DNA nor this mtDNA touches at all. RECORD ITS KNOWN LIMITATION WITH ANY RESULT: Indigenous American reference panels are small, so autosomal tools under-report Native ancestry at low percentages; a small or absent figure is weak evidence, not proof of absence.\n\n" +
      "2. THE PAPER TRAIL IS UNAFFECTED BY THIS RESULT AND IS STILL WORTH PURSUING ON ITS OWN TERMS. Whether an official mis-recorded May Beulah Brinkley's or Betty's race is a documentary question. A death certificate and the census race column across enumerations answer it, and a haplogroup does not touch it either way. See record AK-LIN-000015.",
    keySourceType: "ORIGINAL",
    keyInformationType: "PRIMARY",
    keyEvidenceType: "NEGATIVE",
    evidenceCorrelation:
      "Original laboratory result over the full mitochondrial genome, read against both standard references. As to the maternal line it is direct, primary evidence. As to every other ancestral line it is silent.",
    conflictStatus: "RESOLVED",
    conflictingEvidence:
      "This result conflicts with any claim that the Founder's DIRECT MATERNAL LINE — his mother's mother's mother's line, through May Beulah Brinkley — is Indigenous American. It does not conflict with a claim of Native ancestry on any other line, because it says nothing about any other line.",
    conflictResolution:
      "Resolved in favour of the genetic evidence for the maternal line specifically, and only for that line. As with the paternal result, the conflict is narrower than it first looks, and the register records its exact width rather than letting it stand for more than it proves.",
    evidenceAgainstInterest:
      "RECORDED PLAINLY. This is the result the maternal line was opened to find, and it is not the hoped-for one.\n\n" +
      "The terminal haplogroup is L2a1a3. L2 is the deepest and most distinctively Sub-Saharan African branch of the human mitochondrial tree. L2a1 is one of the single most common maternal lineages among African Americans and is West and West-Central African in origin. So the Founder's direct maternal line — his mother, Betty, May Beulah Brinkley, and the women before her — is African.\n\n" +
      "IT IS NOT INDIGENOUS AMERICAN. The Native maternal founding haplogroups are A2, B2, C1, C4c, D1, D4h3a and X2a; L2a1a3 is none of them, and this is not a borderline reading. The result is definitive for this line.\n\n" +
      "TAKEN WITH THE Y-DNA RESULT (record AK-LIN-000014, E-M2, West/Central African), BOTH of the Founder's directly traceable lines are African. That is the honest state of the genetic evidence and the register will not soften it.\n\n" +
      "WHAT THIS STILL DOES NOT SAY, stated with equal weight because it is equally true: mtDNA and Y-DNA between them read exactly two lines out of a whole tree. At the Founder's great-grandparents' level there are eight lines; these two tests see two of them. The Founder's maternal grandfather PAUL ROYAL is on NEITHER test — his entire ancestry is invisible here — and so are the fathers of every woman on the maternal line. A person can carry documented Native ancestry on one of those untested lines and show African results on both direct lines; that is ordinary. What has been closed is two specific lines. What remains open is everything else, and only an autosomal test or a documentary paper trail can reach it. The register states this not as consolation but because it is accurate.",
    downstreamImpact:
      "Closes the maternal line as a route to a Native claim, the same way the Y result closed the paternal line. Redirects any remaining genetic inquiry to autosomal testing, and leaves the documentary reclassification question (record AK-LIN-000015) standing on its own, unaffected.",
    dnaTestTypes: ["MTDNA"],
    testingCompany: "YFull (analysis of a submitted whole-genome BAM file)",
    kitReference: "YF116325",
    haplogroup:
      "L2a1a3 (RSRS). Path as published in the RSRS report: L2a1a3 > L2a1a > L2a1 > L2a1'2'3'4 > L2a > L2a'b'c'd > L2 > L2'3'4'6 > L2'3'4'5'6'7 > L1'2'3'4'5'6'7. " +
      "NOTE ON THE TWO REFERENCE FILES: the rCRS report terminates at H2a2a1, which is the European reference sequence itself, NOT this sample's haplogroup; rCRS lists a sample's differences from that reference and must never be read as the result. The RSRS report gives the true lineage. This sample is L2a1a3.",
    relevantMatches:
      "None listed. YFull lists mitochondrial matches only among its own sampled users, so their absence is a fact about the database, not about the family.",
    dnaInterpretation:
      "The maternal line is Sub-Saharan African, specifically the West/West-Central African L2a1 cluster, one of the most common African-American maternal lineages. It is not Indigenous American, which would require haplogroup A, B, C, D or X2a. The result is definitive for this one line and silent on all others.",
    claimedTribe: "None. This record supports no tribal claim and is filed as evidence against one on this line.",
    claimBasis: "DNA_ONLY",
    claimBasisDetail:
      "Filed as a negative finding on the maternal line. Entered because a register that keeps only the evidence pointing the way its keeper hoped is worth nothing, and because a claim built on a line this test has closed would be defeated by the report the moment anyone asked to see it.",
    appearsOnRoll: "NO_RELEVANT_ROLL",
    descendantEnrollmentStatus: "NOT_APPLICABLE",
    enrolmentNotes:
      "No tribal enrolment turns on a haplogroup. No federally recognised tribe admits members on the basis of a DNA test; enrolment turns on documented descent under the tribe's own law. This record is genealogical evidence, not a credential.",
    researcher: "Office of the Registrar",
    researchOpenedDate: new Date().toISOString().slice(0, 10),
    lastReviewedDate: new Date().toISOString().slice(0, 10),
    livingRelativesConsent: false,
    sensitivityNotes:
      "SEALED. This is the genetic data of a living person, the Founder, and it also carries information about every person on his direct maternal line, none of whom consented. It is his to disclose and no one else's. It must not appear in any gazette, extract, petition, or external correspondence without a specific written decision by the Founder recorded in this register. " +
      "Cross-references: the maternal line narrative and the documentary work outstanding are at AK-LIN-000015 (May Beulah Brinkley); the paternal genetic result is at AK-LIN-000014.",
  };

  const created = await createRecord(P, {
    registrySlug: "lineage",
    data,
    title: "Mitochondrial result, YFull YF116325 — the Founder's maternal line (L2a1a3)",
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
