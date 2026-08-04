import type { RegistryDef } from "@/registries/types";

/**
 * The Roll of Citizens and Members.
 *
 * A maintained roll is the single most load-bearing record any body claiming
 * governmental or ecclesiastical character keeps: it is the difference between
 * an institution and a mailing list. It is also the register that holds the most
 * personal data on real people, including minors, so it is closed by default and
 * lineage is closed above that.
 */

const citizens: RegistryDef = {
  slug: "citizens",
  title: "Roll of Citizens and Members",
  shortTitle: "Roll of Citizens",
  recordLabel: "Enrolment",
  recordLabelPlural: "Enrolments",
  group: "people",
  numberPrefix: "CIT",
  order: 1,
  authority: "Charter Art. II (Membership & Beneficiaries); Art. VII §3 (Rolls)",
  description:
    "Every person admitted to the Kingdom, on what criteria, by what instrument, on what date, and with what consents on file.",
  guidance: `A roll is what separates an institution from a mailing list. Every body that claims governmental, ecclesiastical, or charitable-trust character is asked the same first question by any agency, court, insurer, or counterparty: **who are your members, and by what criteria.** A roll that can be produced, dated, and shown to have been kept as events happened answers that question. A roll assembled after the question is asked answers nothing, and anyone reading it will be able to tell.

**Write the criteria down before applying them, then apply them the same way every time.** Charter Art. II governs admission. Whatever the criteria are, they must exist in a promulgated instrument, be cited here against each admission, and be applied consistently. Inconsistent admission and expulsion is the fact pattern that pulls an internal membership dispute into a civil court, because a court asked only to enforce a body's own written rules is not resolving religious doctrine and will take the case.

**Record contemporaneously.** Enter the admission on the day it happens, with the admitting instrument and the sponsor's name. Backfilled entries are visible in the chain and are worth very little.

**Honour withdrawal without penalty.** Charter Art. II guarantees free withdrawal. When a member withdraws, record the date and their stated reason in their own words, change the status, and stop. No fee, no finding, no continuing obligation, no retention of them on any published list. A membership that cannot be left is not a membership, and coerced retention is the quickest route to an undue-influence or consumer-protection complaint.

**Privacy.** This register holds dates of birth, home addresses, family relationships, and in some cases the data of minors. It is classified MEMBERS; lineage and the personal data of minors belong at SEALED. None of it goes into a gazette, a website, a grant application, or a filing without the individual's specific written consent. Where a member is a minor, the consent on file is a guardian's, and it does not bind that person once they reach majority — the register raises that at eighteen.

**Lineage.** Record what is documented and cite the document: the census roll, vital record, deed, or church register, with its repository and page. Never record belief as descent. Two fields here carry a member's parentage and the sources for it, and they exist to point at a person's file in the Register of Lineage and Descent, not to hold the research. Anything beyond the immediate line belongs there, where the search log, the nil returns, and the findings against interest are required fields.

Be exact about what that work is for, because the wrong version of this sentence has done real damage to bodies in the Kingdom's position. **The Kingdom will not be acknowledged as an Indian tribe under 25 C.F.R. Part 83, and no entry in this register is made toward that.** Section 83.4(a) bars an entity formed in recent times unless it merely incorporated an existing politically autonomous community, and §§ 83.11(a) to (c) are measured from 1900; a body chartered in 2025 has no answer to either, and no amount of sourcing supplies a century that did not happen. What documented descent does open is a route belonging to the individual and not to the institution — enrolment under a tribe's own law, Freedmen citizenship where a treaty right exists, a lineal descendant's claim under NAGPRA. A file of sourced entries is what those routes ask for; an unsourced one forecloses them and, worse, becomes the exhibit an opponent uses. The position is set out at \`docs/18-DESCENT-RECOGNITION-AND-CITIZENSHIP.md\`.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "APPLICANT",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "CLERK"],
  titleField: "fullLegalName",
  listColumns: ["category", "dateAdmitted", "consentToJurisdiction", "residenceTown"],

  statuses: [
    { value: "APPLICANT", label: "Applicant", tone: "neutral", help: "Application received. Not yet admitted and not to be counted in the roll." },
    { value: "ADMITTED", label: "Admitted", tone: "active", help: "Admitted by instrument; oath or covenant not yet taken." },
    { value: "GOOD_STANDING", label: "In good standing", tone: "success" },
    { value: "INACTIVE", label: "Inactive", tone: "neutral", help: "Enrolled but not participating. Still a member; still owed every member right." },
    { value: "SUSPENDED", label: "Suspended", tone: "warning", help: "Internal ecclesiastical discipline among consenting members only. Cite the determination." },
    { value: "WITHDRAWN", label: "Withdrawn", tone: "neutral", help: "Left at their own election under Charter Art. II. No penalty attaches." },
    { value: "REMOVED", label: "Removed", tone: "danger", help: "Removed by determination. Record the instrument and the ground." },
    { value: "DECEASED", label: "Deceased", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "enrolmentNumber",
      label: "Enrolment number",
      type: "text",
      section: "Identity",
      help: "The number carried on the member's certificate, where the Kingdom issues one. Distinct from this record's registry number, which never changes.",
    },
    {
      key: "fullLegalName",
      label: "Full legal name",
      type: "text",
      required: true,
      summary: true,
      section: "Identity",
      help: "As it appears on government identification. This is the name that must match on any civil filing, benefit, or court paper, so it is recorded even where the person is known by another name.",
    },
    {
      key: "communityName",
      label: "Name used within the community",
      type: "text",
      section: "Identity",
      help: "A covenant, tribal, or ministry name. Recorded so correspondence and internal records can be tied back to the legal identity without either name displacing the other.",
    },
    {
      key: "dateOfBirth",
      label: "Date of birth",
      type: "date",
      section: "Identity",
      classification: "OFFICERS",
      help: "Establishes majority, which governs whether this person can consent for themselves. Also the field that drives the majority review for minor dependents.",
    },
    {
      key: "placeOfBirth",
      label: "Place of birth",
      type: "text",
      section: "Identity",
      classification: "OFFICERS",
      placeholder: "Town, State/Province, Country",
    },

    {
      key: "lineage",
      label: "Parentage and lineage as documented",
      type: "textarea",
      section: "Origin and lineage",
      classification: "SEALED",
      help: "Record only what a document proves, and name the document, its repository, and its page or certificate number. Never record family belief or oral tradition here as though it were descent — enter that, if at all, in the Traditional Knowledge register where it is properly labelled.",
    },
    {
      key: "lineageEvidence",
      label: "Documents relied on",
      type: "textarea",
      section: "Origin and lineage",
      classification: "SEALED",
      help: "Citations to the actual records: census schedules, vital records, deeds, church registers, probate files. Attach copies to the Evidence Vault. Where a line is being worked in earnest, open it in the Register of Lineage and Descent and cite the record number here rather than restating the research; that register requires the negative findings and the resolved conflicts, and a descent statement quoted out of this field without them is a claim rather than a proof.",
    },

    {
      key: "residenceAddress",
      label: "Residence",
      type: "textarea",
      section: "Contact and residence",
      classification: "OFFICERS",
      help: "Where notice can lawfully be served on the member. Keep it current: a member who never received notice of a determination has a real answer to it.",
    },
    {
      key: "residenceTown",
      label: "Town and state of residence",
      type: "text",
      section: "Contact and residence",
      summary: true,
      help: "Kept separately from the full address so the roll can be described geographically without disclosing anyone's home.",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      section: "Contact and residence",
      classification: "OFFICERS",
    },
    {
      key: "phone",
      label: "Telephone",
      type: "phone",
      section: "Contact and residence",
      classification: "OFFICERS",
    },
    {
      key: "churchAffiliation",
      label: "Church or congregation",
      type: "text",
      section: "Contact and residence",
      help: "The congregation through which the member is connected to the Kingdom's religious life. Relevant to church status under 501(c)(3), which depends on an identifiable congregation rather than a mailing list of adherents.",
    },

    {
      key: "category",
      label: "Category of membership",
      type: "select",
      required: true,
      summary: true,
      section: "Admission",
      options: [
        { value: "FOUNDING", label: "Founding member", help: "Present at or before adoption. The Charter is effective nunc pro tunc to 30 October 2010; record the actual date of that person's association, not the Charter date." },
        { value: "CITIZEN", label: "Citizen", help: "Full member with all rights and obligations under Charter Art. II." },
        { value: "AFFILIATE", label: "Affiliate", help: "Associated without full membership. Affiliates are not bound by, and cannot be held to, obligations they never accepted." },
        { value: "HONORARY", label: "Honorary member", help: "Recognition without obligation. Confers no vote, no beneficial interest, and no consent to jurisdiction." },
        { value: "MINOR", label: "Minor dependent", help: "Enrolled through a parent or guardian. Consents on file are the guardian's and expire in effect at majority." },
      ],
    },
    {
      key: "dateAdmitted",
      label: "Date admitted",
      type: "date",
      summary: true,
      section: "Admission",
      help: "The date the admitting act took effect, which is the date from which this person's rights and obligations run. Enter it the day it happens.",
    },
    {
      key: "admittingInstrument",
      label: "Admitting instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Admission",
      help: "The promulgated instrument, minute, or determination that admitted them and states the criteria applied. An admission with no instrument behind it cannot be shown to have followed any rule.",
    },
    {
      key: "sponsor",
      label: "Sponsor or proposer",
      type: "person",
      section: "Admission",
      help: "The member who vouched for the applicant. Recorded because sponsorship is evidence that admission followed a process rather than a mood.",
    },
    {
      key: "oathDate",
      label: "Date of oath or covenant",
      type: "date",
      section: "Admission",
      help: "When the member affirmed the covenant. Distinct from admission: a person may be admitted and not yet have affirmed, and the register should show which.",
    },

    {
      key: "consentToJurisdiction",
      label: "Signed consent to internal jurisdiction is on file",
      type: "boolean",
      summary: true,
      section: "Consents",
      help: "Only a signed, written, knowing agreement executed BEFORE a dispute arises, with a defined scope, makes an internal tribunal's decision enforceable in a civil court — and it does so through the Federal Arbitration Act, not through sovereignty. Unchecked means the Kingdom has no enforceable forum over this person, however clearly the Charter speaks.",
    },
    {
      key: "consentRecord",
      label: "Consent instrument on file",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Consents",
      help: "The executed consent or arbitration agreement itself. Record its scope: an agreement covering internal discipline does not reach a car accident or an employment claim, and courts will read it narrowly.",
    },
    {
      key: "dataProcessingConsent",
      label: "Consent to hold and process personal data is on file",
      type: "boolean",
      section: "Consents",
      help: "Written consent to the Kingdom holding the data on this page and to any specific onward use. Absent it, this record is held for the member's own benefit only and is disclosed to no one.",
    },
    {
      key: "guardianOfRecord",
      label: "Parent or guardian of record",
      type: "person",
      section: "Consents",
      classification: "OFFICERS",
      help: "Required for any minor dependent. The person whose signature stands behind every consent above until the member reaches majority.",
    },

    {
      key: "standingHistory",
      label: "History of standing",
      type: "textarea",
      section: "Standing and departure",
      classification: "OFFICERS",
      help: "Dated entries: admitted, affirmed, suspended, restored, withdrawn. Append; never overwrite. This column is what answers the question of what this person's standing was on a particular past date.",
    },
    {
      key: "withdrawalDate",
      label: "Date of withdrawal or removal",
      type: "date",
      section: "Standing and departure",
      help: "The date the member's own notice was received, not the date the Kingdom got around to acting on it. Withdrawal under Charter Art. II takes effect on the member's word.",
    },
    {
      key: "withdrawalReason",
      label: "Reason given",
      type: "textarea",
      section: "Standing and departure",
      help: "In the member's own words where they gave any, and marked as such where they gave none. Do not editorialise; a departing member's file is the one most likely to be read by an outsider.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Standing and departure",
      classification: "SEALED",
    },
  ],

  deadlineRules: [
    {
      id: "cit-majority-review",
      title: "Minor dependent reaches majority — consents must be re-executed",
      fromField: "dateOfBirth",
      offsetDays: 6575,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 1-1d",
      detail:
        "This member turns eighteen. Every consent on file was signed by a guardian and does not bind them as an adult — including consent to internal jurisdiction and consent to hold their data. Ask them, in writing, whether they wish to remain enrolled and on what terms. If they decline or do not answer, move them out of the active roll. Nothing about their childhood enrolment survives on its own.",
      when: (data) => data.category === "MINOR",
    },
    {
      id: "cit-oath-outstanding",
      title: "Admitted member has not affirmed the covenant",
      fromField: "dateAdmitted",
      offsetDays: 90,
      severity: "ROUTINE",
      detail:
        "Ninety days since admission with no oath or covenant date recorded. Either complete the affirmation and record it, or move the record to inactive. A roll that lists people who never completed admission overstates the membership, and overstatement is what an opposing party will look for first.",
      when: (data) => !data.oathDate,
    },
    {
      id: "cit-withdrawal-effect",
      title: "Give effect to a withdrawal",
      fromField: "withdrawalDate",
      offsetDays: 7,
      severity: "HIGH",
      authority: "Charter Art. II (free withdrawal without penalty)",
      detail:
        "Confirm the status is changed, the member is removed from every published list and mailing, any recurring contribution is stopped, and no fee or finding has been imposed. Send a short written acknowledgement of the withdrawal and keep a copy. Then stop processing their data except as needed to keep this closed record.",
    },
    {
      id: "cit-annual-roll-review",
      title: "Annual confirmation of enrolment",
      fromField: "dateAdmitted",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Kingdom practice, not statute: confirm annually that the address is current, the person still wishes to be enrolled, and the consents on file still reflect what they agreed to. A roll audited once a year is a roll that can be produced with confidence.",
    },
  ],
};

export default citizens;
