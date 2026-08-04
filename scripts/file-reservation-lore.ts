/**
 * File the tested family tradition: that May Beulah Brinkley lived on a
 * reservation and married a white man to get off it.
 *
 * Filed at the Founder's direction. The tradition is recorded as what it is —
 * a tradition — together with the evidence that defeats it as literally told
 * and the evidence that keeps a narrower version open. Both halves, as always.
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

  d.reclassificationAnalysis =
    "THE FAMILY TRADITION, AND THE TEST OF IT (recorded 4 August 2026).\n\n" +
    "THE TRADITION, as the Founder reports it and as he says the whole family tells it: that May Beulah Brinkley " +
    "lived ON A RESERVATION and MARRIED A WHITE MAN TO GET OFF IT.\n\n" +
    "TESTED AND DEFEATED AS LITERALLY TOLD. Four independent findings:\n\n" +
    "(1) NO RESERVATION HAS EVER EXISTED IN HALIFAX COUNTY, nor in Warren, Northampton or Nash. Not in her lifetime, " +
    "not before it. North Carolina's only reservation is the QUALLA BOUNDARY of the Eastern Band of Cherokee Indians, " +
    "recomputed at 327 miles from Weldon — the full width of the state. The nearest places that ever WERE reservations " +
    "are Indian Woods (Tuscarora, Bertie County), title surrendered 1828, and the Meherrin reservation in Hertford " +
    "County, lost to encroachment by the 1740s: roughly 93 and 180 years dead respectively before she was born.\n\n" +
    "(2) THE HALIWA-SAPONI HAVE NO RESERVATION AND NEVER HAVE. State recognition (15 April 1965) conveys no land " +
    "whatever. North Carolina's Department of Administration's own marker describes their school as 'the only " +
    "NON-RESERVATION, tribally supported school in the state'. There is no place a state-recognised North Carolina " +
    "tribal member could have lived 'on'. This is the cleanest single disproof of the tradition as told.\n\n" +
    "(3) HER HUSBAND WAS NOT WHITE. Jimmie Brinkley is recorded 'Neg' in the 1950 federal census, as is she and as is " +
    "every person on that page.\n\n" +
    "(4) THE MARRIAGE THE TRADITION DESCRIBES WAS ILLEGAL IN NORTH CAROLINA AT THE TIME. The state prohibited " +
    "marriage between white and non-white persons until Loving v. Virginia, 388 U.S. 1 (1967). She married around 1940.\n\n" +
    "WHAT THE TRADITION IS MOST LIKELY A MEMORY OF, and this is inference, labelled as such: not a reservation but a " +
    "SEGREGATED INDIAN COMMUNITY 21 MILES AWAY. The Haliwa-Saponi coalesced in 'The Meadows' across southwestern " +
    "Halifax and southeastern Warren; 1,898 of their members live in Halifax County's Brinkleyville Township, with the " +
    "tribal centre at Hollister, about 21 miles from Weldon. They maintained their own school and church. And in 1965 " +
    "NEARLY 400 PEOPLE SUED IN HALIFAX COUNTY COURT to change their racial designation on birth certificates, marriage " +
    "licences and driver's licences from colored to INDIAN. A worn third-hand memory of 'the Indian community, the " +
    "Indian school, before they made us colored' is the shape this tradition most plausibly started as.\n\n" +
    "AGAINST THAT INFERENCE, recorded so it is not overread: BRINKLEY IS NOT ON THE PUBLISHED HALIWA-SAPONI CORE OR " +
    "ASSOCIATED SURNAME LISTS, and neither is FORTT or ROYAL. The coincidence that the tribe's principal Halifax " +
    "township is named BRINKLEYVILLE is almost certainly meaningless: the place is named for a nineteenth-century white " +
    "landowning family, and Brinkley is common among Black families in the county by the ordinary route of enslavers' " +
    "surnames. Geography is not descent.";

  d.evidenceAgainstInterest =
    String(d.evidenceAgainstInterest) +
    "\n\nTHE ONE FINDING THAT CUTS THE OTHER WAY, and it is a real one. The 1950 census enumerator instructions, " +
    "verbatim: 'Write \"W\" for white; \"Neg\" for Negro; \"Ind\" for American Indian…' and then, decisively: " +
    "'A PERSON OF MIXED INDIAN AND NEGRO BLOOD SHOULD BE RETURNED AS A NEGRO, UNLESS THE INDIAN BLOOD VERY DEFINITELY " +
    "PREDOMINATES AND HE IS ACCEPTED IN THE COMMUNITY AS AN INDIAN.' " +
    "So the federal instruction POSITIVELY DIRECTED enumerators to write 'Neg' for people of mixed Indian and Black " +
    "ancestry. The 'Neg' entry on this family's census page therefore does NOT exclude Native ancestry and must never " +
    "be cited as though it did. " +
    "It is not evidentiary zero either: 'Ind' was an available code, enumerators in eastern North Carolina did use it, " +
    "and scholarship records that around 1940 some Haliwa families persuaded enumerators to write it. The correct " +
    "weight is WEAK EVIDENCE AGAINST, not proof against and not nothing.";

  d.searchesOutstanding =
    "1. MAY BEULAH'S OWN MOTHER — the Founder's great-great-grandmother — is UNIDENTIFIED, and she is where the " +
    "tradition most plausibly belongs if it belongs anywhere. The Founder himself described the tradition as attaching " +
    "to a 'great-great-grandmother'. Identifying her is now the highest-value genealogical objective in this register.\n\n" +
    "2. THE 1965 HALIFAX COUNTY RECLASSIFICATION SUIT. Nearly 400 people petitioned to have their designation changed " +
    "from colored to Indian. The case file names them. If anyone of this family's blood is on it, that is documentary " +
    "evidence of exactly the reclassification this register exists to test. Halifax County Clerk of Superior Court.\n\n" +
    "3. THE 1930 AND 1940 CENSUSES for May Beulah as a child, and her North Carolina death certificate. The race " +
    "column across successive enumerations is the only way to see a classification change over time. The 1940 census " +
    "is name-searchable free.\n\n" +
    "4. The Indian Census Rolls (NARA M595) cover the CHEROKEE AGENCY ONLY in North Carolina, rolls 23-26. No eastern " +
    "North Carolina agency existed. Her absence from them would prove essentially nothing and must not be cited as a " +
    "negative finding.\n\n" +
    "5. AUTOSOMAL DNA — still the only test that can reach a line other than the two already tested, both African.";

  d.lastReviewedDate = new Date().toISOString().slice(0, 10);

  const out = await amendRecord(P, {
    recordId: rec.id,
    data: d,
    reason:
      "Filing the tested family tradition at the Founder's direction: that May Beulah Brinkley lived on a reservation " +
      "and married a white man to leave it. Defeated as literally told on four independent grounds — no reservation " +
      "ever existed in Halifax County, the Haliwa-Saponi have never held one, her husband is recorded Negro, and the " +
      "marriage described was illegal in North Carolina until 1967. Recording alongside it the finding that cuts the " +
      "other way: the 1950 enumerator instructions directed that mixed Indian and Negro persons be written 'Neg', so " +
      "that entry does not exclude Native ancestry. Redirecting the work to May Beulah's own mother, who is " +
      "unidentified and is where the tradition would have to belong, and to the 1965 Halifax County reclassification suit.",
  });
  console.log("filed:", out.recordNumber);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
