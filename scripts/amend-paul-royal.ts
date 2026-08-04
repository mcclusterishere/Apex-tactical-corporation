/**
 * Record the Founder's testimony that Paul Royal — his mother's biological
 * father — was a white man, and correct the two DNA records that had floated
 * Paul Royal's line as a possible source of Native ancestry.
 *
 * This is a correction against the register's own earlier framing, entered on
 * the Founder's direct testimony of 4 August 2026. It also settles a question
 * that could otherwise look like a contradiction: a white maternal grandfather
 * is entirely consistent with an African mtDNA result, because mtDNA does not
 * descend through a mother's father at all.
 */
import { prisma } from "../src/lib/db";
import { amendRecord } from "../src/lib/records";

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

  const TESTIMONY =
    "\n\nFOUNDER'S TESTIMONY, 4 August 2026 — PAUL ROYAL WAS A WHITE MAN. " +
    "The Founder states that Paul Royal, the biological father of the Founder's mother (and therefore the Founder's maternal grandfather), was white. " +
    "Two consequences, recorded plainly. " +
    "(1) IT RESOLVES AN APPARENT CONTRADICTION, NOT A REAL ONE. A white maternal grandfather is fully consistent with the African mtDNA result (L2a1a3), because mitochondrial DNA descends only through the unbroken female line — mother to mother to mother — and never passes through a mother's father. Paul Royal contributes nothing to the Founder's mtDNA. He contributes to the Founder's autosomal DNA only, roughly a quarter of it. " +
    "(2) IT NARROWS THE SEARCH RATHER THAN WIDENING IT. This office had previously named Paul Royal's line as one of the untested lines that could in principle carry Native ancestry. On the Founder's own testimony that line is European, so it is no longer an open route to a Native claim. Recorded as a correction of the register's earlier framing, against interest.";

  // -- mtDNA record (AK-LIN-000016) --
  const mt = await prisma.record.findFirst({
    where: { registry: "lineage", title: { contains: "Mitochondrial result" } },
  });
  if (mt) {
    const data = { ...(JSON.parse(mt.data as unknown as string) as Record<string, unknown>) };
    data.evidenceAgainstInterest = String(data.evidenceAgainstInterest) + TESTIMONY;
    data.searchesOutstanding =
      "1. AUTOSOMAL, and it is now the one test that can still speak to Native ancestry for this family. Both of the Founder's directly traceable lines are tested and both are African; an autosomal test samples across all lines and is the only test that could detect Native ancestry on an untested line. " +
      "NOTE, added on this amendment: the Founder has since stated that his maternal grandfather Paul Royal was a white man, so an autosomal test is expected to show substantial European ancestry from that line, and that European component must not be mistaken for evidence for or against a Native claim. RECORD THE KNOWN LIMITATION WITH ANY RESULT: Indigenous American reference panels are small, so autosomal tools under-report Native ancestry at low percentages; a small or absent figure is weak evidence, not proof of absence.\n\n" +
      "2. THE DOCUMENTARY QUESTION IS UNAFFECTED BY THIS RESULT AND STILL WORTH PURSUING. Whether an official mis-recorded May Beulah Brinkley's or Betty's race is answered by a death certificate and by the census race column across enumerations, not by any haplogroup. See record AK-LIN-000015.";
    const out = await amendRecord(P, {
      recordId: mt.id,
      data,
      reason:
        "Recording the Founder's testimony that his maternal grandfather Paul Royal was a white man. This resolves what looked like a contradiction — a white maternal grandfather is consistent with an African mtDNA result because mtDNA never descends through a mother's father — and it corrects this office's earlier framing, which had floated Paul Royal's line as a possible source of Native ancestry. On the Founder's own account that line is European, which narrows the search.",
    });
    console.log("amended mtDNA:", out.recordNumber);
  } else {
    console.log("mtDNA record not found");
  }

  // -- maternal-line record (AK-LIN-000015) --
  const line = await prisma.record.findFirst({
    where: { registry: "lineage", title: { contains: "May Beulah Brinkley" } },
  });
  if (line) {
    const data = { ...(JSON.parse(line.data as unknown as string) as Record<string, unknown>) };
    data.evidenceAgainstInterest = String(data.evidenceAgainstInterest) + TESTIMONY;
    const out = await amendRecord(P, {
      recordId: line.id,
      data,
      reason:
        "Recording the Founder's testimony that Paul Royal, the biological father of the Founder's mother, was a white man. Kept on this record because Paul Royal appears in its descent narrative; the substantive genetic reasoning is on the mtDNA record AK-LIN-000016.",
    });
    console.log("amended maternal line:", out.recordNumber);
  } else {
    console.log("maternal-line record not found");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
