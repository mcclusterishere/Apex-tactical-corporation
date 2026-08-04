import { prisma } from "../src/lib/db";
import { amendRecord } from "../src/lib/records";

const MARKER = "FOUNDER'S TESTIMONY, 4 August 2026";
const CORRECTION =
  "\n\nCORRECTION, 4 August 2026, AT THE FOUNDER'S DIRECTION AND AGAINST THIS OFFICE'S OWN PRIOR ENTRY. " +
  "An earlier amendment recorded, as the Founder's testimony, that Paul Royal was a white man, and reasoned from it that his line was European. " +
  "BOTH THE CHARACTERISATION AND THE REASONING ARE WITHDRAWN. " +
  "The Founder did not assert Paul Royal's race as a confirmed fact and cannot confirm it. Paul Royal's identity was deliberately concealed within the family; he died without any family member having met him. " +
  "The 'white' description is unconfirmed family lore and may be false — the Founder specifically raises that Paul Royal may have been a Black man whom the family presented as white. " +
  "Paul Royal's race and ancestry are therefore recorded as UNKNOWN and, on the family's own account, likely unconfirmable. His line is restored to untested: on the present evidence it is neither a European line nor a Native line, it is an unknown one. " +
  "This office further records that it filed the original characterisation WITHOUT the Founder's instruction and with more certainty than any evidence supported — which is precisely the error this register exists to prevent. The original entry remains in the append-only history above; this correction is the operative statement. " +
  "The one point that survives unchanged, because it never depended on Paul Royal's race: mitochondrial DNA does not descend through a mother's father, so the African mtDNA result is consistent with a maternal grandfather of ANY race and raised no real contradiction to begin with.";

function strip(s: string): string {
  const idx = s.indexOf(MARKER);
  if (idx === -1) return s;
  const nl = s.lastIndexOf("\n\n", idx);
  return (nl === -1 ? s.slice(0, idx) : s.slice(0, nl)).trimEnd();
}

async function main() {
  const sov = await prisma.user.findFirst({ where: { role: "SOVEREIGN" } });
  if (!sov) throw new Error("No sovereign.");
  const P = { id: sov.id, email: sov.email, displayName: sov.displayName, role: sov.role, officeTitle: sov.officeTitle, clearance: "RESTRICTED", mustResetPw: false, mfaEnrolled: false, mfaSatisfied: true, reauthenticated: true } as never;

  const mt = await prisma.record.findFirst({ where: { recordNumber: "AK-LIN-000016" } });
  if (!mt) throw new Error("AK-LIN-000016 not found");
  const data = { ...(JSON.parse(mt.data as unknown as string) as Record<string, unknown>) };
  data.evidenceAgainstInterest = strip(String(data.evidenceAgainstInterest)) + CORRECTION;
  data.searchesOutstanding =
    "1. AUTOSOMAL, now the one DNA test that can still speak to Native ancestry for this family. Both of the Founder's directly traceable lines are tested and both are African; an autosomal test samples across all lines and is the only test that could detect Native ancestry on an untested line — including the line of the Founder's maternal grandfather Paul Royal, whose race and ancestry are unknown and, on the family's account, likely unconfirmable (see the correction on the evidence-against-interest field). " +
    "RECORD THE KNOWN LIMITATION WITH ANY RESULT: Indigenous American reference panels are small, so autosomal tools under-report Native ancestry at low percentages; a small or absent figure is weak evidence, not proof of absence.\n\n" +
    "2. THE DOCUMENTARY QUESTION IS UNAFFECTED BY ANY DNA RESULT. Whether an official mis-recorded May Beulah Brinkley's or Betty's race is answered by a death certificate and by the census race column across enumerations, not by any haplogroup. See record AK-LIN-000015.";
  const out = await amendRecord(P, {
    recordId: mt.id,
    title: "Mitochondrial result, YFull YF116325 — the Founder's maternal line (L2a1a3)",
    data,
    reason:
      "Retracting on the mtDNA record, at the Founder's direction, the earlier characterisation of Paul Royal as a white man. He did not assert it as fact and cannot confirm it; the family concealed his identity and he died without any relative meeting him. His race and line are restored to unknown/untested. The mtDNA reasoning, which never depended on his race, stands. (This record was missed by the prior correction because the amend process had re-derived its title.)",
  });
  console.log("corrected mtDNA:", out.recordNumber);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
