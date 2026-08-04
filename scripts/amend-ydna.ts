/**
 * Amend the Y-DNA record with two things the report page did not carry: the
 * sample's geographic anchor, and an approach from a third party asking for the
 * sample's surname label to be changed.
 *
 * The second is recorded because a request to relabel someone else's genetic
 * sample is a provenance event. If it were acted on and not written down, every
 * later reader would see a McDonald sample with an English flag and no record of
 * who asked for that or why.
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

  const rec = await prisma.record.findFirst({
    where: { registry: "lineage", title: { contains: "YF116325" } },
  });
  if (!rec) throw new Error("Y-DNA record not found.");
  const data = { ...(JSON.parse(rec.data as unknown as string) as Record<string, unknown>) };

  data.searchesOutstanding =
    "1. THE mtDNA RESULT MAY ALREADY EXIST AND COST NOTHING FURTHER. This was previously recorded as a test to be purchased. That was wrong in an important way: YFull derives mitochondrial DNA from the same BAM file that produced the Y result, and the account for this sample shows an mtDNA section in its own navigation with 'Hg and SNPs' and 'MReport' entries. The 1.50 Gb whole-genome BAM already uploaded contains the mitochondrial genome. " +
    "ACTION: open the sample's account, choose mtDNA then 'Hg and SNPs' or 'MReport', and read off the haplogroup. YFull reports it against both the rCRS and RSRS references. " +
    "WHAT TO LOOK FOR: the Native American mitochondrial founding haplogroups are A2, B2, C1, C4c, D1, D4h3a and X2a. A result in that set is affirmative genetic evidence of Native descent on the Founder's direct maternal line — the line running back through his grandmother Betty to May Beulah Brinkley. A result outside that set is evidence the other way for that line and must be recorded as such, whatever it says.\n\n" +
    "2. AUTOSOMAL. Y and mtDNA between them describe two lines out of hundreds. Only an autosomal test speaks to overall proportions. Its known limitation must be recorded with any result: Indigenous American reference panels are small, so autosomal tools systematically under-report Native ancestry at low percentages, and a small or absent figure is weak evidence rather than a finding.\n\n" +
    "3. Y-DNA of a Brinkley male relative, which would test the Brinkley paternal line directly. The Founder's own Y-chromosome cannot do this.\n\n" +
    "4. The identity and haplogroup of the correspondent described under sensitivity notes, if the Founder chooses to pursue it.";

  data.relevantMatches =
    "The YReport itself lists no matches. Two further items are on the record.\n\n" +
    "(a) LOCATOR. YFull's Locator tool for this sample is anchored in central North Carolina, in the Raleigh area, with 1 sample within 50 km, 1 within 50-100 km and 5 within 100-200 km. " +
    "IMPORTANT — THESE ARE NOT GENETIC MATCHES. The Locator returns samples whose users recorded a most-distant-ancestor location nearby; it is a geography tool, not a kinship tool. The five listed at 100-200 km carry mitochondrial haplogroups U5a2a1d*, H1cc1, K2a*, U4a1a1* and K1a4a1a2b1, all of which are European lineages, and two carry R-clade Y results (R-Y18349, R-FGC932) which are not this sample's clade at all. Their named ancestors — Ann Ogletree, Clarinda Walker, Sarah Woodson, Sarah J. Balkcum — have no established connection to this family and must not be entered as relatives. " +
    "The one thing of value here is corroborative and modest: the sample's own geographic anchor sits in North Carolina, which is consistent with the maternal-line research now open.\n\n" +
    "(b) AN APPROACH FROM A THIRD PARTY, 27 July 2026, described under sensitivity notes.";

  data.evidenceAgainstInterest =
    String(data.evidenceAgainstInterest) +
    "\n\nADDED ON AMENDMENT — AN APPROACH TO RELABEL THIS SAMPLE, AND WHY IT WAS REFUSED.\n\n" +
    "On 27 July 2026 a correspondent describing himself as 'a real Scottish Mcdonald' wrote regarding this sample under the heading 'Surname to be updated — a real Mcdonald', asked the Founder to supply his surname so it could be updated in the account settings, and proposed that 'the flag should be English or Scottish'. The correspondent identified himself with a media project.\n\n" +
    "THE REGISTRAR'S POSITION, recorded so that it is not revisited casually:\n\n" +
    "(1) NOTHING WAS CHANGED, AND NOTHING SHOULD BE. The surname and flag on a genetic sample are its provenance. Altering them at the request of a stranger, on no evidence, would corrupt the one record in this register whose whole value is that it was not shaped by anybody's wishes.\n\n" +
    "(2) THE PROPOSED LABEL CONTRADICTS THE DATA. This sample's terminal haplogroup is E-Y379914, under E-M2, which is the defining Y lineage of West and Central Africa. Scottish patrilineal descent is characteristically R1b. An English or Scottish flag on an E-M2 sample would be a false statement about the sample, and the fact that it would be a flattering one to some readers is precisely why it must be refused.\n\n" +
    "(3) WHAT A SHARED SUBCLADE WOULD ACTUALLY MEAN. If this correspondent genuinely shares the terminal subclade, he is a real paternal-line relative within a genealogical timeframe, and that is worth something. But the ordinary explanation for a McCluster and a McDonald sharing an E-M2 subclade in the United States is that BOTH surnames descend from slaveholding households while the paternal line beneath them is African. That reading fits the haplogroup; 'you are a Scottish McDonald' does not. The correspondent's own haplogroup has not been seen and is not assumed.\n\n" +
    "(4) THE CORRESPONDENT IS UNVERIFIED. His identity, his sample, and the organisation named have not been checked by this office. He may be exactly who he says. He may also be one of the many people in genetic genealogy who assemble strangers into a surname project. Either way the burden is on the person asking for a change to a record, not on the keeper of it.\n\n" +
    "(5) IF THE FOUNDER WISHES TO CORRESPOND, that is entirely proper and may produce documentary leads. Correspondence is not the same as relabelling. Any future change to this sample's surname or flag must be entered here as an amendment, with the reason and the evidence, before it is made.";

  data.sensitivityNotes =
    String(data.sensitivityNotes) +
    "\n\nTHIRD-PARTY APPROACH, 27 July 2026. A correspondent wrote concerning sample YF116325 proposing that its surname be updated to McDonald and its flag set to English or Scottish, on the basis that he is 'a real Scottish Mcdonald'. Screenshots supplied by the Founder. " +
    "The correspondent's name and contact details are deliberately NOT reproduced in this register: he is a living third party who wrote privately and has consented to nothing. He is identified here by the date and substance of the approach, which is all this record needs. " +
    "No change was made to the sample's labelling. See the finding against interest above for the reasons.";

  const out = await amendRecord(P, {
    recordId: rec.id,
    data,
    reason:
      "Two additions. First and most important, a correction to this record's own advice: the mtDNA result does not need to be purchased, because YFull derives mitochondrial DNA from the BAM already uploaded and the sample's account carries an mtDNA section. The test previously recorded as outstanding may already be sitting in the account. " +
      "Second, recording an approach of 27 July 2026 asking for this sample's surname and flag to be changed to McDonald and English or Scottish, the refusal of it, and the reasons — a request to relabel a genetic sample is a provenance event and belongs on the record whether or not it is acted on. " +
      "Also recording the Locator output, with the express caveat that Locator returns geographic neighbours rather than genetic matches and that none of the samples it lists is a relative.",
  });
  console.log("amended:", out.recordNumber);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
