/**
 * Resolve the Betty/Molly question. The Founder confirms: his maternal
 * grandmother is MOLLY FORTT (née Brinkley); "Betty" is Betty McCluster, his
 * PATERNAL grandmother — a different person. The earlier "Betty" on the maternal
 * line was a confusion between his two grandmothers, now cleared.
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
  if (!rec) throw new Error("not found");
  const d = { ...(JSON.parse(rec.data as unknown as string) as Record<string, unknown>) };

  d.relationshipPath =
    "THE FOUNDER'S DIRECT MATERNAL LINE, DOCUMENTED. Gen 0: the Founder. " +
    "Gen 1: his mother, born to Paul Royal. " +
    "Gen 2: MOLLY FORTT (née Brinkley), maternal grandmother — bore the Founder's mother by Paul Royal, married Charlie Fortt; = 'Molly J Brinkley' in the 1950 census and 'Molly B Ford' (mis-indexed Fortt) in the 1978 deed, May Beulah's daughter. " +
    "Gen 3: MAY BEULAH BRINKLEY, this record. " +
    "RESOLVED: 'Betty' named earlier is a DIFFERENT person — Betty McCluster, on the paternal side.";

  d.conflictStatus = "PARTIALLY_RESOLVED";
  d.conflictingEvidence =
    "One item resolved, one open. RESOLVED — BETTY vs MOLLY: the Founder confirms his maternal grandmother is MOLLY FORTT (née Brinkley); the 'Betty' he named earlier is Betty McCluster, his PATERNAL grandmother, an unrelated person. The earlier 'Betty' on this maternal line was a confusion between his two grandmothers and is withdrawn. " +
    "OPEN — FORD vs FORTT: the 1978 deed index spells the grandmother's married surname 'Ford'; the Founder gives 'Fortt' (and named Charlie Fortt). 'Fortt' is treated as correct and the index as a mis-transcription; the Fortt marriage record will settle it.";
  d.conflictResolution =
    "Betty/Molly resolved on the Founder's own correction: Molly is maternal, Betty McCluster is paternal. Ford/Fortt resolves when the deed image or the Charlie Fortt–Molly Brinkley marriage record is obtained; both spellings searched until then.";

  const out = await amendRecord(P, {
    recordId: rec.id,
    data: d,
    reason:
      "Resolve Betty/Molly on the Founder's confirmation: his maternal grandmother is Molly Fortt (née Brinkley); 'Betty' is Betty McCluster on the paternal side, a different person. The earlier 'Betty' on the maternal line is withdrawn as a confusion between his two grandmothers.",
  });
  console.log("resolved:", out.recordNumber, "| relationshipPath len:", String(d.relationshipPath).length);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
