import type { RegistryDef } from "@/registries/types";

/**
 * The Docket of the Courts of the Kingdom.
 *
 * Matters before the Ecclesiastical Court, the civil tribunal, the elders'
 * council, and any mediation held under the Kingdom's auspices. The consent
 * fields are the load-bearing ones: a determination reaches only those who
 * agreed in writing beforehand to be reached, and the route from a determination
 * to something a court will enforce runs through the Federal Arbitration Act.
 */

const tribunal: RegistryDef = {
  slug: "tribunal",
  title: "Docket of the Courts of the Kingdom",
  shortTitle: "Tribunal Docket",
  recordLabel: "Matter",
  recordLabelPlural: "Matters",
  group: "governance",
  numberPrefix: "TRIB",
  order: 2,
  authority: "Charter Art. III (Sovereignty & Jurisdiction); Art. IV (Powers)",
  description:
    "Every matter brought before a court or council of the Kingdom, the consent that grounds it, and what became of the determination.",
  guidance: `Keep this docket precisely. The difference between a determination a Connecticut judge will enforce and one they will disregard is decided by what this register can prove about consent.

**Begin from what is true.** A determination of this tribunal binds an outsider not at all. It binds a member only so far as that member agreed, in advance and in writing, to be bound. There is no jurisdiction to be asserted over a person who has not consented, and no quantity of service, notice, publication, or recital of default creates it. A matter opened against a non-consenting party is not a weak case. It is not a case, and proceeding to a determination in it manufactures a document that can only ever be used improperly.

**The route to enforceability is the Federal Arbitration Act.** Where the parties executed a written, pre-dispute agreement to arbitrate with a defined scope, and the tribunal decided a matter inside that scope, the prevailing party applies to a court to confirm the award and the court enters judgment on it (9 U.S.C. Sec. 9). That judgment, not the tribunal's own paper, is the thing with execution behind it. Courts confirm religious arbitration awards as a matter of course — rabbinical courts, Christian conciliation panels, denominational tribunals — and do not review the merits or the doctrine applied. What they review is the agreement. So: confirm that every party has a signed consent on file, link the record, and where the answer is no, say so in the file and stop rather than proceed as though the answer were yes.

**Never attempt to collect on an unconfirmed determination.** No lien, no levy, no garnishment, no notice to a bank or an employer, and nothing styled as a writ, warrant, judgment, or execution. Filing a false encumbrance is criminal in Connecticut, and filing one against a federal officer carries up to ten years under 18 U.S.C. Sec. 1521. This single act is what converts a lawful religious institution into a criminal defendant, and it is committed most often by people who had come to believe their own paper.

**What is genuinely protected, and it is a great deal.** Civil courts must abstain from resolving questions of religious doctrine, polity, and internal church governance. A determination on membership, discipline, ordination, or the meaning of the Kingdom's own religious law is very largely immune from second-guessing: a court asked to review it will decline (*Watson v. Jones*, 80 U.S. 679 (1871); *Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976)), and employment claims brought by ministers against the body that appointed them are barred outright (*Our Lady of Guadalupe School v. Morrissey-Berru*, 591 U.S. 732 (2020)). That protection is at its strongest when the record shows a religious body deciding a religious question by religious standards. It thins as a matter drifts toward money, property, and contract, where courts apply neutral principles of law and will look closely at what was actually agreed. Write the file so it shows which kind of matter this was.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "INTAKE",
  titleField: "matterTitle",
  listColumns: ["forum", "natureOfMatter", "everyPartyConsented", "dispositionDate"],

  statuses: [
    { value: "INTAKE", label: "Received — jurisdiction not established", tone: "neutral", help: "Opened for review. Nothing may be heard until consent is verified." },
    { value: "CONSENT_PENDING", label: "Consent outstanding", tone: "warning", help: "At least one party has no executed consent on file. The matter cannot proceed to a binding determination." },
    { value: "SET", label: "Set for hearing", tone: "active" },
    { value: "HEARD", label: "Heard — under advisement", tone: "active" },
    { value: "DECIDED", label: "Decided", tone: "success" },
    { value: "AWARD_ISSUED", label: "Written award issued", tone: "success", help: "A signed written award is the only form a court can confirm." },
    { value: "CONFIRMED", label: "Award confirmed by a civil court", tone: "success" },
    { value: "VACATED", label: "Award vacated or modified by a court", tone: "danger" },
    { value: "DISMISSED", label: "Dismissed", tone: "danger", help: "Including dismissal for want of consent, which is the correct disposition where consent is absent." },
    { value: "WITHDRAWN", label: "Withdrawn or settled", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "docketNumber",
      label: "Docket number",
      type: "text",
      required: true,
      section: "Docket",
      summary: true,
      placeholder: "EC-2026-007",
      help: "The tribunal's own sequential number, distinct from the register number. Cite it in every paper issued in the matter.",
    },
    {
      key: "matterTitle",
      label: "Style of the matter",
      type: "text",
      required: true,
      section: "Docket",
      summary: true,
      placeholder: "In re the Membership of A.B.",
      help: "How the matter is captioned. Avoid captions that imitate civil process against a named adversary where the proceeding is an internal ecclesiastical one.",
    },
    {
      key: "forum",
      label: "Forum",
      type: "select",
      required: true,
      section: "Docket",
      summary: true,
      options: [
        { value: "ECCLESIASTICAL", label: "Ecclesiastical Court", help: "Doctrine, discipline, membership, and office. The forum with the strongest protection from civil review." },
        { value: "CIVIL_TRIBUNAL", label: "Internal civil tribunal", help: "Contract and property matters between consenting members. Enforceable only through arbitration confirmation." },
        { value: "ELDERS", label: "Elders' council" },
        { value: "MEDIATION", label: "Mediation", help: "Non-binding by design. A mediated settlement is enforceable as a contract, not as an award." },
      ],
    },
    {
      key: "natureOfMatter",
      label: "Nature of the matter",
      type: "select",
      section: "Docket",
      summary: true,
      options: [
        { value: "DOCTRINE", label: "Doctrine or religious interpretation" },
        { value: "DISCIPLINE", label: "Discipline of a member" },
        { value: "MEMBERSHIP", label: "Membership, admission, or removal" },
        { value: "OFFICE", label: "Office, ordination, or commission" },
        { value: "CONTRACT", label: "Contract between members" },
        { value: "PROPERTY", label: "Property or stewardship of funds" },
        { value: "GRIEVANCE", label: "Grievance against an officer" },
        { value: "OTHER", label: "Other" },
      ],
      help: "Courts treat the first four categories very differently from the rest. Classify honestly at intake rather than reclassifying later when it becomes convenient.",
    },
    {
      key: "statementOfMatter",
      label: "Statement of the matter",
      type: "textarea",
      section: "Docket",
      help: "What is actually in dispute, in the parties' terms. Written at intake, before anyone knows the outcome, this is the most useful page in the file.",
    },

    {
      key: "petitioner",
      label: "Petitioner",
      type: "person",
      required: true,
      section: "Parties and consent",
      help: "The party bringing the matter. Where the Kingdom itself brings it, name the officer acting.",
    },
    {
      key: "respondent",
      label: "Respondent",
      type: "person",
      required: true,
      section: "Parties and consent",
      help: "The party answering. If this person has no executed consent on file, the tribunal has nothing over them and the matter should be dismissed, not defaulted.",
    },
    {
      key: "otherParties",
      label: "Other parties and their capacities",
      type: "textarea",
      section: "Parties and consent",
    },
    {
      key: "everyPartyConsented",
      label: "Every party has an executed consent on file",
      type: "boolean",
      section: "Parties and consent",
      summary: true,
      help: "Verified against the Register of Consents, party by party, before the first hearing. This is the fact on which everything downstream depends.",
    },
    {
      key: "consentInstrument",
      label: "Governing consent or arbitration agreement",
      type: "recordRef",
      refRegistry: "consents",
      section: "Parties and consent",
      help: "The instrument relied on for jurisdiction. Its scope clause, not the Charter, defines what this tribunal may decide in this matter.",
    },
    {
      key: "consentGap",
      label: "Consent defects noted",
      type: "textarea",
      section: "Parties and consent",
      help: "Any party without consent, any dispute falling outside the agreed scope, any agreement signed after the dispute arose. Recording a defect protects the Kingdom; concealing one hands an adversary the case.",
    },

    {
      key: "presidingOfficer",
      label: "Presiding officer",
      type: "person",
      section: "Panel and hearing",
      help: "Whoever presides must be disclosed to the parties in advance. Undisclosed partiality of the decision-maker is a statutory ground to vacate an award under 9 U.S.C. Sec. 10(a)(2).",
    },
    {
      key: "panelMembers",
      label: "Panel members",
      type: "textarea",
      section: "Panel and hearing",
      help: "One per line, with any relationship to a party stated beside the name. Disclose relationships rather than assume they are known.",
    },
    {
      key: "hearingDate",
      label: "Date of hearing",
      type: "date",
      section: "Panel and hearing",
      help: "Refusing to hear material evidence, or hearing a matter without giving a party a fair opportunity to appear, is a ground to vacate. Note continuances in the record.",
    },
    {
      key: "hearingRecord",
      label: "Record kept of the hearing",
      type: "select",
      section: "Panel and hearing",
      options: [
        { value: "NONE", label: "None" },
        { value: "MINUTES", label: "Written minutes" },
        { value: "AUDIO", label: "Audio recording" },
        { value: "TRANSCRIPT", label: "Transcript" },
      ],
      help: "A tribunal that keeps no record can only ask a court to take its word. Minutes signed by the presiding officer are the minimum worth keeping.",
    },

    {
      key: "dispositionDate",
      label: "Date of disposition",
      type: "date",
      section: "Disposition",
      summary: true,
    },
    {
      key: "disposition",
      label: "Disposition",
      type: "select",
      section: "Disposition",
      options: [
        { value: "GRANTED", label: "Relief granted" },
        { value: "DENIED", label: "Relief denied" },
        { value: "PARTIAL", label: "Granted in part" },
        { value: "DISMISSED_NO_CONSENT", label: "Dismissed — no consent to jurisdiction", help: "The correct and protective disposition where a party never agreed to submit." },
        { value: "DISMISSED_OTHER", label: "Dismissed on other grounds" },
        { value: "SETTLED", label: "Settled by the parties" },
        { value: "REFERRED", label: "Referred to civil authority", help: "Required where the matter discloses conduct that is a crime or triggers a mandatory reporting duty." },
      ],
    },
    {
      key: "remedyOrdered",
      label: "Remedy ordered",
      type: "textarea",
      section: "Disposition",
      help: "Remedies must fall inside the agreed scope and inside the tribunal's competence: ecclesiastical censure, restoration, restitution between consenting members, dissolution of an internal office. Never anything requiring seizure, encumbrance, or the compulsion of a third party.",
    },
    {
      key: "writtenAwardIssued",
      label: "Reduced to a signed written award",
      type: "boolean",
      section: "Disposition",
      help: "An oral determination cannot be confirmed. The award must be in writing, signed by the panel, and delivered to the parties.",
    },
    {
      key: "awardDate",
      label: "Date the award was made and delivered",
      type: "date",
      section: "Disposition",
      help: "Starts every clock that matters: the losing party's window to move to vacate, and the year in which confirmation may be sought.",
    },

    {
      key: "confirmationStatus",
      label: "Civil confirmation",
      type: "select",
      section: "Review and enforcement",
      options: [
        { value: "NOT_SOUGHT", label: "Not sought" },
        { value: "NOT_APPLICABLE", label: "Not applicable — purely ecclesiastical", help: "Discipline, membership, and doctrine need no confirmation and should not be taken to a court." },
        { value: "PETITION_FILED", label: "Petition to confirm filed" },
        { value: "CONFIRMED", label: "Confirmed — judgment entered" },
        { value: "DENIED", label: "Confirmation refused" },
        { value: "VACATED", label: "Award vacated" },
      ],
      help: "Until this reads Confirmed, the Kingdom holds a determination and not a judgment, and nothing may be done that only a judgment permits.",
    },
    {
      key: "civilCourtReference",
      label: "Civil court and docket",
      type: "text",
      section: "Review and enforcement",
      placeholder: "Conn. Super. Ct., Judicial District of Fairfield, FBT-CV-26-XXXXXXX-S",
    },
    {
      key: "appealStatus",
      label: "Internal appeal",
      type: "select",
      section: "Review and enforcement",
      options: [
        { value: "NONE", label: "No appeal taken" },
        { value: "PENDING", label: "Appeal pending" },
        { value: "AFFIRMED", label: "Affirmed" },
        { value: "REVERSED", label: "Reversed" },
        { value: "TIME_EXPIRED", label: "Time to appeal expired" },
      ],
      help: "An award is ordinarily not final for confirmation purposes while an internal appeal provided for by the agreement is still open.",
    },
    {
      key: "notes",
      label: "Panel notes",
      type: "textarea",
      section: "Review and enforcement",
      classification: "SEALED",
      help: "Deliberative material and anything touching the personal circumstances of a party. Sealed by default; disclosure requires a written order.",
    },
  ],

  deadlineRules: [
    {
      id: "trib-ct-vacatur-window",
      title: "Connecticut window to move to vacate the award closes",
      fromField: "awardDate",
      offsetDays: 30,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. Sec. 52-420(b)",
      detail:
        "No motion to vacate, modify, or correct an award may be made more than thirty days after notice of the award to the moving party. After this date a Connecticut challenge is ordinarily foreclosed, which is as important to know when the Kingdom has won as when it has lost.",
      when: (data) => data.writtenAwardIssued === true,
    },
    {
      id: "trib-faa-vacatur-window",
      title: "Federal three-month window to attack the award closes",
      fromField: "awardDate",
      offsetDays: 90,
      severity: "HIGH",
      authority: "9 U.S.C. Sec. 12",
      detail:
        "Notice of a motion to vacate, modify, or correct must be served within three months after the award is filed or delivered. Where the Kingdom holds the award, the file should be complete and the original preserved until this date passes.",
      when: (data) => data.writtenAwardIssued === true,
    },
    {
      id: "trib-faa-confirmation-window",
      title: "Time to apply for confirmation of the award is running out",
      fromField: "awardDate",
      offsetDays: 300,
      severity: "CRITICAL",
      authority: "9 U.S.C. Sec. 9",
      detail:
        "Application to confirm may be made within one year after the award is made. Courts differ on whether that year is an absolute bar, and it is not a question worth being the test case for. Sixty-five days remain from this reminder. Confirmation is what turns a determination into a judgment; without it there is nothing to enforce and nothing may be attempted.",
      when: (data) => data.writtenAwardIssued === true && data.confirmationStatus !== "CONFIRMED",
    },
  ],
};

export default tribunal;
