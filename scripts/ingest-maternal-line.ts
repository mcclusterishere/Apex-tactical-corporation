/**
 * Open the Founder's direct maternal line.
 *
 * This is the line that matters most and the one the register has had least of.
 * It is also the line the Y-chromosome result cannot touch and the mtDNA test
 * would reach in a single step, so it is filed now, before any test, so that the
 * test has something to be tested against.
 *
 * Source: the Founder's own oral testimony, given 4 August 2026. That is a real
 * class of evidence and the register treats it as what it is — a starting point
 * with names spelled phonetically, not a documented pedigree.
 *
 * Run with `npx tsx scripts/ingest-maternal-line.ts`. Idempotent.
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
    where: { registry: "lineage", title: { contains: "May Beulah Brinkley" } },
  });
  if (existing) {
    console.log(`skip — already filed as ${existing.recordNumber}`);
    await prisma.$disconnect();
    return;
  }

  const data: Record<string, unknown> = {
    ancestorName: "May Beulah Brinkley",
    nameVariants:
      'RECORDED PHONETICALLY AND UNVERIFIED. The Founder has only ever heard this name spoken, never seen it written. Candidate spellings, none preferred: May Beulah Brinkley; May Bueller Brinkley; Mae Beulah Brinkley; Mae Bueler Brinkley; Mary Beulah Brinkley (Mae/May is frequently a familiar form of Mary in this period and region); Beulah May Brinkley (given names reversed). Any search must run all of these, and must also run Brinkley against Brinkly and Brinckley. Treating one spelling as correct at this stage is the most likely way to miss her.',
    sex: "FEMALE",
    birthConfidence: "RANGE_ESTIMATED",
    birthPlace:
      'Not documented. The Founder recalls she lived at a place he has only heard spoken as "WALDEN, NORTH CAROLINA". No incorporated place of that name has been confirmed in North Carolina; see the reclassification and search notes below for the candidate identifications, of which Weldon in Halifax County is the leading one and is an inference, not a finding.',
    generation: 3,
    relationshipPath:
      "THE FOUNDER'S DIRECT MATERNAL LINE, unbroken mother to mother. Gen 0: the Founder. " +
      "Gen 1: his mother, living or recently living, no particulars recorded here, born out of wedlock to Paul Royal. " +
      "Gen 2: BETTY, maternal grandmother, who bore that daughter by PAUL ROYAL and afterwards married CHARLIE FORTT. " +
      "Gen 3: MAY BEULAH BRINKLEY, maternal great-grandmother — this record. " +
      "Unbroken female descent is the point: see the mtDNA note under searches outstanding.",
    descentThroughChild:
      "Through her daughter Betty, and through Betty's daughter, to the Founder. Both intervening links are stated on the Founder's own testimony and neither is yet documented.",
    parentageEvidence:
      "None. Her own parents are unknown and are the next objective. A North Carolina death certificate, if she died in the state after 1913, would name both of them and is the single most efficient document to obtain.",
    classificationsRecorded: ["NONE_RECORDED"],
    classificationLog:
      "NO RECORD OF HER RACIAL CLASSIFICATION HAS BEEN OBTAINED, and none may be assumed in either direction. This field will be filled from the census race column across successive enumerations and from her death certificate, and from nothing else. Until then it stays empty, because a classification the register invented would be worth less than no classification at all.",
    classificationChanged: false,
    reclassificationAnalysis:
      "OPEN, AND THIS IS THE CENTRAL QUESTION OF THE FILE.\n\n" +
      'The place the Founder names phonetically as "Walden, North Carolina" has a strong candidate: WELDON, in HALIFAX COUNTY, North Carolina. Two independent facts make Halifax County worth the attention:\n\n' +
      "(1) Halifax County contains a township and unincorporated community actually named BRINKLEYVILLE, and there is a documented African American Brinkley family there — Berry Brinkley and his wife Cora (Wilkins) Brinkley, both formerly enslaved, of Brinkleyville. A surname that is also a place name in the same county is a strong locality signal.\n\n" +
      "(2) Halifax County, together with Warren County next to it, is the homeland of the HALIWA-SAPONI INDIAN TRIBE — the name is built from HALIfax and WArren — recognised by the North Carolina General Assembly in 1965, with its tribal centre at Hollister. The documented history of that community is precisely the administrative reclassification pattern this register exists to test: families recorded by clerks as 'colored', 'mulatto' or 'free persons of colour' who identified as Indian throughout, and who spent generations getting the record corrected. There is scholarly work on exactly this, including a University of North Carolina study titled 'Racial Choices: The Emergence of the Haliwa-Saponi Indian Tribe, 1835-1971'.\n\n" +
      "STATED AGAINST INTEREST IN THE SAME BREATH: BRINKLEY IS NOT AMONG THE PUBLISHED HALIWA-SAPONI CORE FAMILY SURNAMES. Those are given as Jefferies, Haith, Goings, Collins, Bunch, Gibson, Haithcock, Liggons, Stewart, Harris, Jones, Guy, Corn, Whitmore, Watkins, Hays, Pettiford, Scott, Burnett, Parker and Chavis, with a wider associated list including Richardson, Lynch, Hedgpeth, Mills, Rudd, West, Hawkins, Cordell, Green, Howell, Bibbet, Boone, Silver, Dale, Copeland, Ansell, Evans, Manly and Coleman. Neither FORTT nor ROYAL appears either. Being in the right county is not the same as being in the tribe, and the register will not blur the two.",
    recordingOfficials:
      "None. This record originates in family testimony, not in any official act, and is filed as such.",
    recordSetsSearched: ["FEDERAL_CENSUS"],
    searchLog:
      "4 August 2026 — line opened on the Founder's oral testimony. No archival search for this individual has been completed yet. " +
      "Preliminary locality work only: the surname FORT/FORTT is documented in Edgecombe and Halifax Counties, North Carolina, which is consistent with the Halifax County hypothesis; and Halifax County contains a Brinkleyville township. Both are locality signals, neither identifies this woman.",
    nilReturns:
      "NOTHING HAS BEEN SEARCHED FOR THIS WOMAN. That is stated plainly so that no absence in this file is ever read as a negative finding. " +
      "It is also worth recording why the searches already run in this register could not have found her: the National Archives Catalog does not index federal census population schedules by personal name, so every Brinkley search run here was structurally incapable of reaching a woman whose only likely federal record is a census line. Her absence from those results means nothing whatever.",
    searchesOutstanding:
      "IN PRIORITY ORDER.\n\n" +
      "1. mtDNA TEST ON THE FOUNDER. Mitochondrial DNA passes from a mother to all her children, so the Founder carries the mtDNA of his mother, of Betty, and of May Beulah Brinkley unaltered. No other line in this register has that property. A single test therefore reads this woman's maternal haplogroup directly, in one step, with no paperwork. The Native American mitochondrial founding haplogroups are A2, B2, C1, C4c, D1, D4h3a and X2a. A result in that set is affirmative genetic evidence of Native descent on this exact line. Nothing else available is this direct, and it can be started today.\n\n" +
      "2. NORTH CAROLINA DEATH CERTIFICATE. Statewide registration began in 1913. A certificate gives her parents' names, her birth date and place, and a race entry made by an official — which is the raw material of the reclassification question. Held by the North Carolina State Archives; indexed free on FamilySearch.\n\n" +
      "3. THE CENSUS, READ ACROSS ENUMERATIONS, 1900 to 1950. The point is not to find her once. It is to follow the household through five or six enumerations and watch the RACE COLUMN. A family recorded Indian in one year and colored in the next is documented reclassification, and that is the proof this register is built to hold. The 1950 schedules are open and name-searchable free at the National Archives 1950 census site.\n\n" +
      "4. CHARLIE FORTT and PAUL ROYAL. Fortt is an uncommon surname and uncommon surnames locate families fast. Draft registration cards — WWI for men born roughly 1873-1900, WWII for men born roughly 1877-1929 — are name-indexed, give a birth date, a residence and next of kin, and are free.\n\n" +
      "5. SOCIAL SECURITY APPLICATION (SS-5) for Betty or for the Founder's mother. The application names BOTH parents, including the mother's maiden name, which would settle whether Betty was born a Brinkley.\n\n" +
      "6. HALIWA-SAPONI. Only after the above. Approach the tribe with documents in hand, not with a claim; enrolment is governed by the tribe's own law and is the tribe's decision alone.",
    keySourceType: "AUTHORED_NARRATIVE",
    keyInformationType: "SECONDARY",
    keyEvidenceType: "INDIRECT",
    evidenceCorrelation:
      "Family testimony from a descendant two generations removed, recalling a name he has never seen written and a place name he has only heard aloud. This is genuine evidence and it is how nearly every family research project properly begins; it is not documentation, and the register does not dress it as documentation. Every element requires independent confirmation before it is relied on.",
    conflictStatus: "UNRESOLVED",
    conflictingEvidence:
      'The place name as given, "Walden, North Carolina", does not correspond to a confirmed North Carolina municipality. Candidates include Weldon (Halifax County), Walkertown (Forsyth County), Walstonburg (Greene County), Walnut Cove (Stokes County), Wallburg (Davidson County) and Valdese (Burke County). Until one is confirmed the place is unresolved, and the Halifax County reasoning above stands or falls with it.',
    conflictResolution:
      "Unresolved and correctly so. It will be resolved by a document that puts this family in a named county, not by choosing the candidate that suits the argument. Note in particular that the SURRY COUNTY Brinkleys already filed in this register — the Guion Miller applicants at Mount Airy — are at the OPPOSITE END of North Carolina from Halifax County, roughly 200 miles away, and no connection between them and this line has been established or should be assumed.",
    evidenceAgainstInterest:
      "(1) EVERY NAME IN THIS RECORD IS PHONETIC. The Founder has never seen 'May Beulah Brinkley' written down. The register is starting from a sound.\n\n" +
      "(2) NO DATE IS KNOWN for her birth, marriage or death, and none is estimated in the dated fields, because a guessed date propagates into every search that follows it.\n\n" +
      "(3) BETTY'S MAIDEN NAME IS PRESUMED, NOT ESTABLISHED. That she was born a Brinkley is an inference from her mother's surname. If Betty was a stepdaughter, or if May Beulah's Brinkley surname came from a husband rather than her father, the line moves.\n\n" +
      "(4) NO NATIVE ANCESTRY IS DOCUMENTED ON THIS LINE. Not one document yet obtained records anyone in it as Indian. The Halifax County and Haliwa-Saponi material above is CONTEXT about a place, not evidence about this family, and it must never be quoted as though it were.\n\n" +
      "(5) BRINKLEY, FORTT AND ROYAL ARE ALL ABSENT from the published Haliwa-Saponi core and associated surname lists.\n\n" +
      "(6) THE FOUNDER'S PATERNAL LINE IS DOCUMENTED WEST/CENTRAL AFRICAN by Y-DNA (see the YF116325 record). That says nothing about this maternal line — different line entirely — but a reader is entitled to both facts at once, and gets them.",
    downstreamImpact:
      "Substantial if it holds. This is the only line in the register that an mtDNA test can address directly, and it is the line the Founder's own account of his family actually runs through. Nothing may be built on it until at least one document exists.",
    dnaTestTypes: ["NONE"],
    dnaInterpretation:
      "No test has been run on this line. This is the gap that most limits the register, and it is the cheapest gap to close.",
    claimedTribe:
      "None claimed. The Haliwa-Saponi are named in this record as the tribe whose homeland covers the candidate county, not as a tribe this family belongs to.",
    claimBasis: "FAMILY_TRADITION_ONLY",
    claimBasisDetail:
      "Oral family history only, at this stage. Recorded honestly as the weakest class of basis in the register's own scheme, and recorded anyway, because an undocumented starting point that is labelled as one is the proper beginning of research and is worth more than silence.",
    appearsOnRoll: "NOT_SEARCHED",
    descendantEnrollmentStatus: "NONE",
    enrolmentNotes:
      "No approach has been made to any tribe and none should be made until documents exist. Enrolment is decided by each tribe under its own law; it is not conferred by this register, by a DNA result, or by anything the Kingdom can issue.",
    researcher: "Office of the Registrar",
    researchOpenedDate: new Date().toISOString().slice(0, 10),
    lastReviewedDate: new Date().toISOString().slice(0, 10),
    livingRelativesConsent: false,
    sensitivityNotes:
      "SEALED. This record describes the Founder's own close family, including a parent and a grandmother who may be living, and it records a birth outside marriage. " +
      "The particulars of living persons are deliberately kept out of this record: generation 1 is described only as 'the Founder's mother'. " +
      "Nothing in this file goes into a gazette, an extract, a petition or any external correspondence. It is research about a family, not a statement about them, and the people in it have not consented to anything.",
  };

  const created = await createRecord(P, {
    registrySlug: "lineage",
    data,
    title: "May Beulah Brinkley — the Founder's maternal great-grandmother (line opened)",
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
