/**
 * Upgrade the maternal-line record from oral testimony to documented evidence.
 *
 * Two independent records now confirm the line: the 1950 federal census (May
 * Beulah Brinkley's household in Weldon, Halifax County) and the Halifax County
 * deed index (Mae Beulah Brinkley + heirs, Deed Book 997 Page 151, 1978). The
 * Founder has identified his maternal grandmother as Molly Fortt, who is the
 * "Molly J Brinkley" of the census and the "Molly B [Fortt]" of the deed — May
 * Beulah's daughter. The line is now documented on paper back to the great-
 * grandmother.
 *
 * Recorded honestly: the only classification on record is NEGRO (1950), and the
 * mtDNA on this line is African. This documents a Black landowning family, not
 * Native descent. The Betty/Molly and Ford/Fortt questions are left OPEN.
 */
import { prisma } from "../src/lib/db";
import { amendRecord } from "../src/lib/records";

async function main() {
  const sov = await prisma.user.findFirst({ where: { role: "SOVEREIGN" } });
  if (!sov) throw new Error("No sovereign.");
  const P = { id: sov.id, email: sov.email, displayName: sov.displayName, role: sov.role,
    officeTitle: sov.officeTitle, clearance: "RESTRICTED", mustResetPw: false,
    mfaEnrolled: false, mfaSatisfied: true, reauthenticated: true } as never;

  const rec = await prisma.record.findFirst({ where: { recordNumber: "AK-LIN-000015" } });
  if (!rec) throw new Error("AK-LIN-000015 not found");
  const d = { ...(JSON.parse(rec.data as unknown as string) as Record<string, unknown>) };

  d.relationshipPath =
    "THE FOUNDER'S DIRECT MATERNAL LINE, mother to mother, now DOCUMENTED on paper. " +
    "Gen 0: the Founder. Gen 1: his mother, born to Paul Royal. " +
    "Gen 2: MOLLY FORTT (née Brinkley), maternal grandmother, married Charlie Fortt — documented as May Beulah's daughter in the 1950 census ('Molly J Brinkley') and the 1978 deed ('Molly B Ford', a mis-index of Fortt). " +
    "Gen 3: MAY BEULAH BRINKLEY, this record. " +
    "'Betty', given earlier for the grandmother, is to be reconciled — probably the same woman.";

  d.birthPlace =
    "WELDON, HALIFAX COUNTY, NORTH CAROLINA — now CONFIRMED, not inferred. The 1950 federal census places May Beulah Brinkley's household in Weldon township, Halifax County (ED 42-68). This is the place the Founder had only heard spoken as 'Walden'; Weldon is the real place.";

  d.classificationsRecorded = ["NEGRO"];
  d.classificationLog =
    "NOW HAS A RECORDED CLASSIFICATION. The 1950 federal census (Weldon twsp, Halifax Co, ED 42-68) records May Beulah Brinkley and her whole household as 'Neg' (Negro), as it does every household on that page. This is the first official racial classification obtained for her, and it is recorded as exactly that — one enumerator's 1950 entry, a single data point, not the whole racial history of the line. The 1900-1940 enumerations and her death certificate, not yet obtained, would show whether the classification was ever different. That is the reclassification question and it is not yet answered.";

  d.reclassificationAnalysis =
    "OPEN, and the evidence so far cuts against the Native hypothesis while confirming the genealogy. Weldon, Halifax County is now confirmed as the family seat, which keeps the Haliwa-Saponi context geographically in play (Halifax is the tribe's homeland). BUT the only official classification yet obtained — the 1950 census — records the family as NEGRO, not Indian. Recorded plainly: as of 1950 the state classified this family as Black. Whether any earlier enumeration or vital record ever classified them otherwise is unknown and is the open question. Nothing here establishes Native ancestry; it establishes a Black landowning family in the Haliwa-Saponi region, which is context, not proof.";

  d.recordSetsSearched = ["FEDERAL_CENSUS"];
  d.searchLog =
    "4 August 2026 — NOW DOCUMENTED across two independent record sets. " +
    "(1) 1950 US Census, Weldon twsp, Halifax Co, NC, ED 42-68, sheets 29-30: household of JIMMIE (James) BRINKLEY (head, paper-mill laborer), wife MAY [BEULAH], children Jimmie L, Charlie, Molly J, Earnest; Purnell added from the deed. All enumerated 'Neg'. Page images read directly by the Registrar and held. " +
    "(2) Halifax County Register of Deeds index: 'BRINKLEY, MAE BEULAH' together with children Ernest, Charles, Jimmie Lee, Purnell and daughter Molly (indexed 'FORD', really FORTT) — DEED Book 997 Page 151, 20 Jan 1978, Weldon twsp. " +
    "(3) 28 literal-Brinkley real-estate instruments 1976-1984, Weldon and Brinkleyville twsps; a court estate/partition, Special Proceeding 79-SP-323 (Commissioner's Deed Bk 1217/141; Report & Order Bk 1217/308, 1983). The family owned land. " +
    "The online searchable index bottoms out at 1976; earlier acquisitions are in the scanned Old Index Books (1732-1904, 1905-1934, 1934-1975).";

  d.nilReturns =
    "mtDNA IS NOW DONE (see AK-LIN-000016): terminal haplogroup L2a1a3, a Sub-Saharan / West-Central African maternal lineage, NOT one of the Native founding haplogroups. Because the line above is now documented (May Beulah -> Molly -> the Founder's mother -> the Founder), that result definitively describes THIS woman's direct maternal line. " +
    "Still not obtained for her personally: her own birth record, her parents' names, and the 1900-1940 census enumerations that would carry the race column back in time. Their absence proves nothing.";

  d.searchesOutstanding =
    "1. THE ESTATE FILE, Special Proceeding 79-SP-323, Halifax County Clerk of Superior Court. A partition of the family land; it should name every heir and recite the chain of title back to whoever first owned it. Single richest document for the origin.\n" +
    "2. DEED Book 997 Page 151, and the pre-1976 old-index-book deeds, to find when a Brinkley FIRST acquired this land. Free via FamilySearch's Halifax County deed books.\n" +
    "3. May Beulah Brinkley's DEATH CERTIFICATE (NC, if after 1913) and the 1900-1940 census across enumerations — to name her parents and to test whether the family's race entry was ever anything other than the 1950 'Negro'.\n" +
    "4. AUTOSOMAL DNA — the only remaining test that could reach a Native line other than the two direct lines already tested (both African).\n" +
    "5. Reconcile 'Betty' vs 'Molly' with the Founder; obtain the Fortt marriage record (also settles Ford vs Fortt).";

  d.keySourceType = "MIXED";
  d.keyInformationType = "MIXED";
  d.keyEvidenceType = "DIRECT";
  d.evidenceCorrelation =
    "Now built on original records, not testimony alone: the 1950 federal census (primary, an enumerator's contemporaneous record) and the Halifax County deed index and instruments (original public records). Together they document the household and the descent May Beulah -> Molly across two independent sources. The Founder's testimony supplies the living links (Molly is his grandmother; his mother is Molly's daughter), which are not yet in an obtained document.";

  d.conflictStatus = "PARTIALLY_RESOLVED";
  d.conflictingEvidence =
    "Two open items. (1) BETTY vs MOLLY: the Founder first named his maternal grandmother 'Betty' and now identifies her as Molly Fortt. The shared Charlie Fortt marriage strongly suggests one woman known by both names, but this is not yet confirmed and is not assumed. " +
    "(2) FORD vs FORTT: the 1978 deed index spells the grandmother's married surname 'Ford'; the Founder gives 'Fortt' (and earlier named Charlie Fortt). 'Fortt' is treated as correct and the index as a mis-transcription; future searches must run both.";
  d.conflictResolution =
    "(1) Reconcile Betty/Molly with the Founder directly — not to be decided by this office. (2) Ford/Fortt resolves when the deed image or the Fortt marriage record is obtained; until then both spellings are searched.";

  d.claimBasis = "DOCUMENTARY_RECORD";
  d.claimBasisDetail =
    "The LINE is now documented — census and deed place May Beulah Brinkley and her daughter Molly in Weldon, Halifax County, across two independent sources. This documents the family and its land. It does NOT document Native ancestry: the only classification on record is 'Negro' (1950 census), and the mtDNA on this line is African. The documentary basis is for the genealogy, not for a tribal claim.";

  d.evidenceAgainstInterest =
    String(d.evidenceAgainstInterest) +
    "\n\nUPDATED 4 Aug 2026 — the documentation cuts against the Native hypothesis as much as it supports the genealogy, and both halves are recorded. What is now PROVEN: a Black (per the 1950 census) landowning family in Weldon and Brinkleyville, Halifax County, headed by James/Jimmie Brinkley and May Beulah Brinkley, whose daughter Molly (Fortt) is the Founder's grandmother. That is a real and worthwhile thing to have proven. What is NOT proven, and is if anything now weaker: Native descent on this line — the recorded race is Negro and the mtDNA (L2a1a3) is West/Central African. Any earlier, different classification remains to be found and must not be assumed.";

  d.downstreamImpact =
    "This record now anchors the maternal line to documented ancestors — May Beulah Brinkley, and her daughter Molly Fortt (née Brinkley) — rather than to oral testimony alone. It fixes the family seat at Weldon / Brinkleyville, Halifax County, and identifies the estate file (79-SP-323) that should carry the line back further.";

  d.lastReviewedDate = new Date().toISOString().slice(0, 10);

  d.sensitivityNotes =
    String(d.sensitivityNotes) +
    "\n\nUPDATED: the grandmother Molly Fortt (née Brinkley) and the Founder's mother may be living; their particulars are kept out of this record. The documented ancestors named here (May Beulah Brinkley and her mid-century household) are of a generation now deceased. Cross-references: mtDNA at AK-LIN-000016; the deed and census citations are in the search log above.";

  const out = await amendRecord(P, {
    recordId: rec.id,
    data: d,
    reason:
      "Upgrade from oral testimony to documented evidence, at the Founder's direction. The 1950 census and the Halifax County deed index independently confirm May Beulah Brinkley's household in Weldon and her daughter Molly (the Founder's grandmother, whom he identifies as Molly Fortt — 'Molly J Brinkley' in the census, 'Molly B Ford' mis-indexed for Fortt in the deed). Recording the confirmed place (Weldon), the confirmed 1950 'Negro' classification, the deed citations (Book 997/151; estate 79-SP-323), and that the mtDNA is done (L2a1a3, African). The line is documented; Native descent is not, and the record says so. Betty/Molly and Ford/Fortt left open.",
  });
  console.log("upgraded:", out.recordNumber);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
