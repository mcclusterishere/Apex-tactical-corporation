import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Assistance and Benefits.
 *
 * Charitable relief given to individuals: emergency help, hardship grants,
 * education support, burial assistance, food, housing, and utilities. Relief of
 * the poor and distressed is a genuine charitable purpose and one of the oldest
 * things a religious body does. It is also the activity most likely to be
 * mistaken — by an examiner or by a disappointed member — for the founder
 * looking after his own. The difference between the two is entirely a matter of
 * record: written criteria, a disinterested second approver, a related-party
 * flag, and documented need. This register keeps those four things.
 */

const benefits: RegistryDef = {
  slug: "benefits",
  title: "Register of Assistance and Benefits",
  shortTitle: "Assistance & Benefits",
  recordLabel: "Grant of assistance",
  recordLabelPlural: "Grants of assistance",
  group: "people",
  numberPrefix: "BEN",
  order: 6,
  authority: "Charter Art. IV (Trust Property and Charitable Purposes); Art. VII §3 (Rolls)",
  description:
    "Every grant of charitable assistance made to an individual — the need, the criteria applied, the amount, who approved it, and whether the recipient is connected to any officer.",
  guidance: `Relief of the poor and distressed is a recognised charitable purpose in its own right (Treas. Reg. § 1.501(c)(3)-1(d)(2)), and an exempt organisation may lawfully give money and goods to individuals. What it may not do is give them to a pre-selected list of the founder's family and friends. The doctrine is the **charitable class**: assistance must be open to a group large or indefinite enough that helping its members benefits the community rather than particular people chosen in advance. Rev. Rul. 56-304, 1956-2 C.B. 306 states what the file must contain: the recipient's name and address, the amount, the purpose, the manner of selection, and the relationship, if any, to the organisation's members, officers, or trustees. Those are the fields on this page.

**Write the criteria first, then apply them the same way every time.** An instrument adopted before the need arises — who is eligible, what evidence of need is required, what the limits are — converts a discretionary favour into a programme. Cite it on every record. Assistance handed out case by case on the founder's assessment of who deserves it is indistinguishable in an examiner's file from private benefit, and it is how a congregation ends up in a fairness dispute nobody wins.

**Assistance to an insider is a different transaction.** A payment to a disqualified person — an officer, a founder, a substantial contributor, or a member of their family, which for this purpose means their spouse, ancestors, children, grandchildren, great-grandchildren, the spouses of those descendants, and their brothers and sisters and those siblings' spouses (26 U.S.C. § 4958(f)(1), (4)) — exceeding the value received in return is an **excess benefit transaction**. The tax falls on people, not the institution: 25% of the excess on the recipient, rising to 200% if uncorrected, and 10% on any manager who knowingly approved it, capped at $20,000 (§ 4958(a)–(d)). Separately, private inurement costs the organisation its exemption outright. The related-party flag on this form is mandatory, and the honest answer is always the right one.

**The protections are procedural and cheap.** Approval by people with no conflict of interest, reliance on appropriate comparability or need data, and concurrent documentation give rise to a rebuttable presumption that the transaction was reasonable (Treas. Reg. § 53.4958-6). Concurrent means by the later of the next meeting or sixty days after the action; the register raises that date on every related-party record. A disinterested second approver costs nothing and does more work than any argument made afterwards.

**Tax treatment.** Need-based assistance to a distressed individual is generally not taxable income to the recipient, being treated as a gift under 26 U.S.C. § 102 (see IRS Publication 3833; § 139 covers qualified disaster relief payments). Two exceptions swallow much of the comfort: payments to employees are ordinarily compensation, reportable and subject to withholding, and payments that look like disguised distributions to insiders are the ones that get examined. A contribution earmarked by the donor for a named individual is not deductible (Rev. Rul. 62-113, 1962-2 C.B. 10) — the Kingdom must keep full control and discretion over relief funds.

**On paying someone else's bill.** Paying a member's landlord or utility company out of the Kingdom's own charitable funds is the Kingdom disbursing its own money, and it is book-keeping. Taking money from one person to pass on to another is money transmission — a federal felony without a licence under 18 U.S.C. § 1960, with FinCEN registration under 31 C.F.R. § 1022.380 and Connecticut licensure under Conn. Gen. Stat. § 36a-595 et seq. Never accept a donor's money on the understanding that it goes to a named person: take the gift on the Kingdom's own terms, or decline it. Do not become the rails.`,
  defaultClassification: "SEALED",
  defaultStatus: "REQUESTED",
  restrictedTo: ["SOVEREIGN", "TREASURER", "REGISTRAR"],
  titleField: "recipientName",
  listColumns: ["assistanceType", "dateGranted", "amount", "relatedToOfficer"],

  statuses: [
    { value: "REQUESTED", label: "Requested", tone: "neutral", help: "A need has been reported. Nothing has been promised and nothing should be said to the applicant about the outcome." },
    { value: "UNDER_REVIEW", label: "Under review", tone: "neutral", help: "Need being verified against the adopted criteria." },
    { value: "APPROVED", label: "Approved", tone: "active", help: "Approved by the required approvers but not yet paid or delivered." },
    { value: "DISBURSED", label: "Disbursed", tone: "success", help: "Paid or delivered in full, with documentation on file." },
    { value: "PART_DISBURSED", label: "Partly disbursed", tone: "active", help: "Assistance running over a period. Record each instalment against the fund charged." },
    { value: "DECLINED", label: "Declined", tone: "warning", help: "Record the criterion that was not met, in a sentence. A declined applicant who is never told why is an applicant who will say the decision was personal." },
    { value: "WITHDRAWN", label: "Withdrawn by applicant", tone: "neutral" },
    { value: "CLOSED", label: "Closed", tone: "neutral", help: "Assistance complete and the follow-up done." },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Replaced by a later grant covering the same need." },
    { value: "VOID", label: "Void", tone: "danger", help: "Entered in error. Voided rather than deleted, so the ledger still accounts for every entry made." },
  ],

  fields: [
    {
      key: "recipientName",
      label: "Recipient",
      type: "text",
      required: true,
      summary: true,
      section: "Recipient",
      help: "The individual who received the assistance, by name. Required in every case, whether or not they are on the Roll — Rev. Rul. 56-304 expects the name and address of every recipient of charitable assistance to appear in the organisation's records.",
    },
    {
      key: "recipientRecord",
      label: "Recipient's enrolment record",
      type: "recordRef",
      refRegistry: "citizens",
      section: "Recipient",
      help: "Links to the Roll where the recipient is enrolled. Leave blank for a non-member; assistance to non-members is entirely proper and often strengthens the charitable-class position.",
    },
    {
      key: "recipientIsMember",
      label: "Recipient is a member of the Kingdom",
      type: "boolean",
      summary: true,
      section: "Recipient",
      help: "Recorded because a programme that has only ever helped its own members is one an examiner will ask about. A genuine charitable class is not the membership list.",
    },
    {
      key: "household",
      label: "Household",
      type: "recordRef",
      refRegistry: "households",
      section: "Recipient",
      help: "The household relieved by this grant, so that assistance is allocated with knowledge of what the house has already received rather than by who asked most recently.",
    },
    {
      key: "recipientAddress",
      label: "Recipient's address at the time of the grant",
      type: "textarea",
      section: "Recipient",
      classification: "SEALED",
      help: "Held because the record of a charitable distribution is expected to show it. Do not enter an address for a member flagged as address-protected; note the fact instead.",
    },

    {
      key: "assistanceType",
      label: "Type of assistance",
      type: "select",
      required: true,
      summary: true,
      section: "Assistance given",
      options: [
        { value: "EMERGENCY_RELIEF", label: "Emergency relief" },
        { value: "HARDSHIP_GRANT", label: "Hardship grant" },
        { value: "FOOD", label: "Food" },
        { value: "HOUSING", label: "Housing or rent" },
        { value: "UTILITIES", label: "Utilities" },
        { value: "MEDICAL", label: "Medical or dental" },
        { value: "EDUCATION", label: "Education support", help: "Scholarships and tuition support need criteria and a selection process set out in advance, and should not be directed to the children of officers." },
        { value: "BURIAL", label: "Burial or funeral assistance" },
        { value: "TRANSPORT", label: "Transport" },
        { value: "CLOTHING_HOUSEHOLD", label: "Clothing or household goods" },
        { value: "LEGAL_OR_ADMIN", label: "Legal or administrative costs" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "needDescription",
      label: "Description of need",
      type: "textarea",
      required: true,
      section: "Assistance given",
      classification: "SEALED",
      help: "The facts that made this person eligible, in plain terms — what happened, what it costs, what they have. This is the entry that shows the grant answered a need rather than a relationship. Write it factually and without commentary; it is the sentence most likely to be read back to the Kingdom.",
    },
    {
      key: "amount",
      label: "Amount",
      type: "money",
      summary: true,
      section: "Assistance given",
      help: "The cash value granted. Leave blank for purely in-kind assistance and describe it below.",
    },
    {
      key: "inKindDescription",
      label: "In-kind assistance given",
      type: "textarea",
      section: "Assistance given",
      help: "Goods, food, accommodation, or services, with an honest estimate of value. In-kind help is still a distribution and belongs in the accounts and in this register.",
    },
    {
      key: "dateGranted",
      label: "Date granted",
      type: "date",
      required: true,
      summary: true,
      section: "Assistance given",
      help: "The date of the approving act. It starts the sixty-day concurrent-documentation clock for any grant flagged as related-party.",
    },
    {
      key: "periodFrom",
      label: "Period covered from",
      type: "date",
      section: "Assistance given",
      help: "For assistance running over time — rent for three months, a term's tuition. Fixes what the grant was for, so a later request for the same period is visible as such.",
    },
    {
      key: "periodTo",
      label: "Period covered to",
      type: "date",
      section: "Assistance given",
    },

    {
      key: "approvingOfficer",
      label: "Approving officer",
      type: "person",
      required: true,
      section: "Approval and conflicts",
      help: "The officer who approved the grant, by name. Approval is a personal act with personal consequences — an organisation manager who knowingly approves an excess benefit transaction is taxed individually under 26 U.S.C. § 4958(a)(2).",
    },
    {
      key: "secondApprover",
      label: "Second approver",
      type: "person",
      section: "Approval and conflicts",
      help: "A second officer, required for any grant above the threshold in the adopted criteria and for every related-party grant. One person approving disbursements alone is the single most common finding in a charity examination.",
    },
    {
      key: "secondApproverDisinterested",
      label: "Second approver is disinterested",
      type: "boolean",
      section: "Approval and conflicts",
      help: "Confirms the second approver has no relationship to the recipient and no financial interest in the grant. A disinterested approving body is the first element of the rebuttable presumption of reasonableness under Treas. Reg. § 53.4958-6.",
    },
    {
      key: "relatedToOfficer",
      label: "Recipient is related to an officer, founder, or substantial contributor",
      type: "boolean",
      required: true,
      summary: true,
      section: "Approval and conflicts",
      help: "Answer honestly on every record. 26 U.S.C. § 4958(f) reaches spouses, ancestors, children, grandchildren, great-grandchildren, the spouses of those descendants, and brothers and sisters and their spouses. A flagged grant is not forbidden — it is simply one that must be approved by disinterested people, priced against comparable need, and documented within sixty days. An unflagged grant later found to be related-party is the fact that turns an examination into an assessment.",
    },
    {
      key: "relationshipDetail",
      label: "Nature of the relationship",
      type: "text",
      section: "Approval and conflicts",
      classification: "SEALED",
      help: "Who the recipient is related to and how. Recorded so that the Kingdom, not an opposing party, is the one that identified it.",
    },
    {
      key: "conflictRecusal",
      label: "Related officer recused from the decision",
      type: "boolean",
      section: "Approval and conflicts",
      help: "Whether the connected officer left the decision entirely — no vote, no advocacy, no presence for the discussion. Recusal recorded contemporaneously is worth a great deal; recusal asserted afterwards is worth little.",
    },

    {
      key: "criteriaInstrument",
      label: "Criteria instrument relied on",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Criteria and documentation",
      help: "The promulgated instrument setting out eligibility, evidence of need, and limits — adopted before this application, not written to fit it. Assistance given under written criteria is a charitable programme; assistance given without them is a favour.",
    },
    {
      key: "criteriaApplied",
      label: "How the criteria were applied",
      type: "textarea",
      section: "Criteria and documentation",
      help: "The manner of selection, which Rev. Rul. 56-304 expects the file to show: which criteria this applicant met, on what evidence, and how they came to the Kingdom's attention. Two sentences is enough; nothing is not.",
    },
    {
      key: "documentationHeld",
      label: "Documentation held",
      type: "multiselect",
      section: "Criteria and documentation",
      help: "What the file actually contains to substantiate the need. Attach copies to the Evidence Vault; a documented grant is defensible years later, an undocumented one is only a memory.",
      options: [
        { value: "APPLICATION", label: "Written application or request" },
        { value: "PROOF_OF_NEED", label: "Proof of need (bill, notice, order)" },
        { value: "INCOME_EVIDENCE", label: "Evidence of income or resources" },
        { value: "THIRD_PARTY_REFERRAL", label: "Third-party referral or verification" },
        { value: "INVOICE_OR_RECEIPT", label: "Invoice or receipt for the payment made" },
        { value: "APPROVAL_MINUTE", label: "Minute of the approving decision", help: "For a related-party grant this must be prepared by the later of the next meeting or sixty days after the action — Treas. Reg. § 53.4958-6(c)(3)(ii)." },
        { value: "NONE", label: "None held", help: "Say so rather than leaving the field empty. A gap the Kingdom identified is a gap it can close." },
      ],
    },

    {
      key: "fundCharged",
      label: "Fund charged",
      type: "text",
      section: "Payment and tax",
      placeholder: "e.g. BENEV-01",
      help: "The fund or account code the disbursement is posted against, so this register reconciles to the treasury ledger. A restricted fund may only be charged for the purpose the donor restricted it to.",
    },
    {
      key: "payee",
      label: "Paid to (if not the recipient)",
      type: "text",
      section: "Payment and tax",
      help: "Where the Kingdom paid a landlord, utility, funeral home, or school directly. Paying a vendor out of the Kingdom's own charitable funds for a beneficiary's benefit is the Kingdom's own disbursement and is ordinary book-keeping. Passing along money someone else gave you for a named person is money transmission — 18 U.S.C. § 1960, 31 C.F.R. § 1022.380, Conn. Gen. Stat. § 36a-595 et seq. — and the Kingdom does not do it.",
    },
    {
      key: "disbursementMethod",
      label: "Method of disbursement",
      type: "select",
      section: "Payment and tax",
      options: [
        { value: "CHECK", label: "Cheque drawn on the Kingdom's account" },
        { value: "ELECTRONIC", label: "Electronic transfer from the Kingdom's account" },
        { value: "DIRECT_TO_VENDOR", label: "Paid direct to a vendor or creditor", help: "Usually the best method: it documents the need, prevents diversion, and keeps the payment plainly within the charitable purpose." },
        { value: "IN_KIND", label: "Goods or services provided" },
        { value: "CASH", label: "Cash", help: "Avoid. Cash assistance is the hardest to substantiate and the first thing an examiner asks about. If it is unavoidable, obtain a signed receipt the same day." },
      ],
    },
    {
      key: "taxTreatment",
      label: "Tax treatment",
      type: "select",
      section: "Payment and tax",
      help: "Decide this before payment, not at year end. Getting it wrong creates a reporting failure and, where an employee is involved, a withholding liability that reaches responsible individuals personally under 26 U.S.C. § 6672.",
      options: [
        { value: "CHARITABLE_GIFT", label: "Charitable assistance to a needy individual — not income", help: "Generally excluded as a gift under 26 U.S.C. § 102 where given for charitable purposes on the basis of need." },
        { value: "COMPENSATION", label: "Compensation to an employee or worker", help: "Reportable and subject to withholding. A payment to someone the Kingdom pays for services is compensation whatever it is called." },
        { value: "SCHOLARSHIP", label: "Scholarship or fellowship", help: "Qualified tuition and required fees may be excludable under 26 U.S.C. § 117; amounts for room and board generally are not." },
        { value: "DISASTER_RELIEF", label: "Qualified disaster relief payment", help: "26 U.S.C. § 139, where a qualified disaster applies." },
        { value: "UNDETERMINED", label: "Not yet determined", help: "Do not disburse in this state where the recipient is an employee or a related party." },
      ],
    },

    {
      key: "followUpDate",
      label: "Follow-up date",
      type: "date",
      section: "Follow-up",
      help: "When someone will check whether the assistance did what it was meant to do. A programme that never looks back cannot show it works, and cannot improve its criteria.",
    },
    {
      key: "outcome",
      label: "Outcome",
      type: "textarea",
      section: "Follow-up",
      classification: "SEALED",
      help: "What happened: the eviction stopped, the term completed, the funeral held. This is the evidence that the Kingdom's charitable purpose is being carried out in fact, which is worth more in a grant application or an examination than any statement of intent.",
    },
    {
      key: "notes",
      label: "Treasurer's notes",
      type: "textarea",
      section: "Follow-up",
      classification: "SEALED",
      help: "Confined to what an officer administering this grant needs. Never a judgement about the recipient's character — this register concerns people at the worst point of their lives and will outlive the moment.",
    },
  ],

  deadlineRules: [
    {
      id: "ben-4958-concurrent-documentation",
      title: "Related-party grant — concurrent documentation due",
      fromField: "dateGranted",
      offsetDays: 60,
      severity: "CRITICAL",
      authority: "26 U.S.C. § 4958; 26 C.F.R. § 53.4958-6(c)(3)(ii)",
      detail:
        "This grant was flagged as going to an officer, founder, substantial contributor, or a family member of one. To claim the rebuttable presumption of reasonableness, the approving body's written record — who approved it, that they were disinterested, the basis for the amount, and any comparability or need data relied on — must exist by the later of the next meeting of that body or sixty days after the action. Documentation written after that window does not qualify, and cannot be made to qualify later. Excise taxes under § 4958 fall on the recipient personally at 25% of the excess and on any manager who knowingly approved it at 10%.",
      when: (data) => data.relatedToOfficer === true,
    },
    {
      id: "ben-follow-up",
      title: "Assistance follow-up due",
      fromField: "followUpDate",
      offsetDays: 0,
      severity: "ROUTINE",
      detail:
        "Kingdom practice, not statute. Confirm the assistance was delivered, record the outcome, and close the record. Where the need continues, open a fresh grant against the criteria rather than extending this one silently.",
    },
  ],
};

export default benefits;
