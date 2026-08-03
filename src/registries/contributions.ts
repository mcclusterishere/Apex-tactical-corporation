import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Contributions, Grants and Disbursements.
 *
 * A church files no Form 1023 and no Form 990, which means this ledger is the
 * only account of itself the Kingdom will ever have. It is kept to the standard
 * of a register that will one day be read by someone hostile: a donor's counsel,
 * an examining agent, or a member asking where the money went. Every field here
 * exists because its absence is what an examination fastens on.
 */

/** Money is held in integer cents throughout the ledger; thresholds follow suit. */
const CENTS = 100;

const contributions: RegistryDef = {
  slug: "contributions",
  title: "Register of Contributions, Grants and Disbursements",
  shortTitle: "Contributions",
  recordLabel: "Entry",
  recordLabelPlural: "Entries",
  group: "stewardship",
  numberPrefix: "FIN",
  order: 1,
  authority: "Charter Art. IV §7 (Economic Powers); 26 U.S.C. §§ 170(f)(8), 6001, 6115",
  description:
    "Every sum received and every sum paid out, with the substantiation the donor needs, the approval the Kingdom needs, and the trail an examination will follow.",
  guidance: `**Substantiation is the donor's problem and the Kingdom's duty.** For any single contribution of **250 dollars or more**, the donor may claim no deduction unless they hold a contemporaneous written acknowledgment stating the amount received and either that no goods or services were provided, or a description and good-faith estimate of the value of what was (26 U.S.C. § 170(f)(8)). "Contemporaneous" means held by the **earlier** of the date the donor files their return or its due date, so an acknowledgment sent in April is often already too late. Send them within thirty days and, without exception, by 31 January following the year of the gift. The test applies per contribution, not to the year's total, and a cancelled cheque does not satisfy it.

**Quid pro quo.** Where a payment over **75 dollars** is partly a gift and partly payment for goods or services — a banquet ticket, an auction lot, a retreat place — the Kingdom must state in writing, at solicitation or receipt, that only the excess over the value received is deductible, and give a good-faith estimate of that value (26 U.S.C. § 6115). Failure carries a penalty under § 6714.

**The Kingdom describes non-cash gifts; it does not value them** — valuation belongs to the donor and their appraiser. For a noncash deduction over 5,000 dollars the Kingdom signs Form 8283 acknowledging receipt only, and if it disposes of that property within three years it must file Form 8282 within 125 days.

**Private inurement is the existential risk, not an accounting nicety.** No part of net earnings may benefit any private individual, and unlike lobbying there is no "insubstantial" allowance. Where funds reach a founder, an officer, or their family without arm's-length terms, § 4958 imposes excise taxes on the recipient of 25 percent of the excess benefit (200 percent if uncorrected) and 10 percent on any manager who knowingly approved it; at the limit, exemption is lost. The protection is procedural and available: compensation and every related-party transaction approved in advance by **disinterested** persons, on comparability data for similar work at similar institutions, documented at the time. Never compensate anyone as a share of receipts. Never let a person approve a payment to themselves — a second signature on every disbursement and an honest related-party flag are what make an audit survivable.

**Political campaign intervention is absolutely prohibited,** churches included. The Kingdom may speak on issues, teach, and conduct non-partisan voter education; it may not endorse, oppose, or fund a candidate for public office, in a sermon, a newsletter, or a post. Lobbying is permitted only as an insubstantial part of activities.

**Being a church excuses filings, not obligations.** 26 U.S.C. § 508(c)(1)(A) excepts churches from the requirement to *apply* for recognition of exemption, and § 6033(a)(3)(A) from filing Form 990. Neither grants exemption; neither touches the rules above, state law, or employment taxes, and books adequate to show the Kingdom qualifies are still required (§ 6001). For **non-minister employees, income tax withholding and FICA apply in full**; ministers hold dual status, pay SECA on ministerial earnings, and may exclude a § 107 housing allowance only if it was designated in advance by official action. Treating employees as contractors to avoid withholding is the most expensive error a small religious institution makes.`,
  defaultClassification: "SEALED",
  defaultStatus: "RECORDED",
  restrictedTo: ["SOVEREIGN", "TREASURER"],
  titleField: "counterparty",
  listColumns: ["transactionType", "amount", "transactionDate", "fundOrPurpose"],

  statuses: [
    {
      value: "PENDING",
      label: "Pledged or committed",
      tone: "warning",
      help: "Promised but not yet received or paid. A pledge is not income and must not be acknowledged as a gift until the funds arrive.",
    },
    {
      value: "RECORDED",
      label: "Recorded",
      tone: "active",
      help: "Entered from a source document. Not yet matched against the bank record.",
    },
    {
      value: "RECONCILED",
      label: "Reconciled",
      tone: "success",
      help: "Matched to the statement of the account it passed through. This is the only state an auditor can rely on.",
    },
    {
      value: "QUERIED",
      label: "Queried",
      tone: "warning",
      help: "Flagged by the Treasurer or the Auditor pending explanation. Resolve in writing; do not simply amend and move on.",
    },
    {
      value: "RETURNED",
      label: "Returned or refunded",
      tone: "neutral",
      help: "Funds sent back to the payer. Withdraw any acknowledgment already issued, in writing, so the donor does not claim a deduction for a gift they no longer made.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "transactionType",
      label: "Type of transaction",
      type: "select",
      required: true,
      section: "The transaction",
      summary: true,
      options: [
        { value: "TITHE", label: "Tithe" },
        { value: "OFFERING", label: "Offering (unrestricted)" },
        {
          value: "DESIGNATED_GIFT",
          label: "Designated gift",
          help: "A gift given for a stated purpose. Once accepted on those terms the Kingdom must honour them; a gift designated for an individual rather than a purpose is generally not deductible at all.",
        },
        {
          value: "GRANT",
          label: "Grant received",
          help: "Usually carries conditions and reporting obligations. Record them, because a breached condition is repayable.",
        },
        {
          value: "IN_KIND",
          label: "In-kind gift of property or services",
          help: "Donated services are never deductible to the donor, however valuable. Donated property may be; the donor values it, not the Kingdom.",
        },
        { value: "DISBURSEMENT", label: "Disbursement (payment out)" },
        {
          value: "REIMBURSEMENT",
          label: "Reimbursement of expenses",
          help: "Reimburse only under an accountable plan — a business connection, substantiation within a reasonable period, and return of any excess — or the payment becomes taxable wages.",
        },
        {
          value: "COMPENSATION",
          label: "Compensation for services",
          help: "The highest-scrutiny entry in this register. Requires disinterested approval, comparability data, and contemporaneous documentation.",
        },
      ],
    },
    {
      key: "counterparty",
      label: "Donor or payee",
      type: "person",
      required: true,
      section: "The transaction",
      summary: true,
      help: "The person or entity on the other side of the transaction, in full legal name. Anonymous receipts are recorded as anonymous and acknowledged to no one; they are also the entries an examiner counts first.",
    },
    {
      key: "amount",
      label: "Amount",
      type: "money",
      required: true,
      section: "The transaction",
      summary: true,
      min: 0,
      help: "The gross sum, before any processing fee. Where a platform deducts a fee, record the gross here and the fee as its own disbursement — netting them hides a real expense.",
    },
    {
      key: "transactionDate",
      label: "Date received or paid",
      type: "date",
      required: true,
      section: "The transaction",
      summary: true,
      help: "The date the Kingdom received or parted with the funds. For a mailed cheque the postmark date governs the donor's deduction year; for a card gift, the date of the charge. This date starts every clock on this form.",
    },
    {
      key: "paymentMethod",
      label: "Method",
      type: "select",
      section: "The transaction",
      options: [
        {
          value: "CASH",
          label: "Cash",
          help: "Count and initial by two people at the point of receipt, before it leaves the room. Cash counted by one person is the single most-questioned item in any examination.",
        },
        { value: "CHECK", label: "Cheque" },
        { value: "ACH", label: "ACH or bank transfer" },
        { value: "CARD", label: "Card" },
        { value: "ONLINE_PLATFORM", label: "Online giving platform" },
        { value: "WIRE", label: "Wire" },
        { value: "IN_KIND", label: "In kind — no funds moved" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "depositReference",
      label: "Deposit or clearing reference",
      type: "text",
      section: "The transaction",
      help: "The batch, deposit slip, or transaction identifier that ties this entry to a line on a bank statement. Without it, reconciliation is guesswork.",
    },

    {
      key: "fundOrPurpose",
      label: "Fund or purpose",
      type: "text",
      required: true,
      section: "Purpose and restriction",
      help: "The fund credited or the purpose served. Vague purposes are how restricted money is spent by accident.",
    },
    {
      key: "restriction",
      label: "Donor restriction",
      type: "select",
      section: "Purpose and restriction",
      options: [
        {
          value: "UNRESTRICTED",
          label: "Unrestricted",
          help: "Available for any purpose within the Kingdom's mission.",
        },
        {
          value: "TEMPORARILY_RESTRICTED",
          label: "Restricted as to purpose or time",
          help: "Must be spent as the donor directed. Spending it otherwise is a breach of trust and, in Connecticut, a matter the Attorney General may pursue.",
        },
        {
          value: "PERMANENTLY_RESTRICTED",
          label: "Permanently restricted (endowment)",
          help: "Principal is held; only the return is available. Releasing principal requires the donor's written consent or a court order.",
        },
      ],
    },
    {
      key: "restrictionTerms",
      label: "Terms of the restriction",
      type: "textarea",
      section: "Purpose and restriction",
      help: "The donor's own words, quoted, and the document they appear in. If the Kingdom cannot honour a restriction it should decline the gift rather than accept it and improvise.",
    },
    {
      key: "grantReportDueDate",
      label: "Grant report due",
      type: "date",
      section: "Purpose and restriction",
      help: "Where a grant requires a narrative or financial report, the date the funder set. A missed report ends the relationship and can make the grant repayable.",
    },

    {
      key: "relatedParty",
      label: "The counterparty is a related party",
      type: "boolean",
      section: "Approval and related parties",
      summary: true,
      help: "Check for the Founder, any officer, any member of their family, and any entity they control. Related-party transactions are not forbidden; concealed ones are indefensible. Disclosing them is what makes the honest ones survivable.",
    },
    {
      key: "relatedPartyDetail",
      label: "Nature of the relationship",
      type: "text",
      section: "Approval and related parties",
      help: "State it plainly — \"spouse of the Sovereign\", \"company controlled by the Treasurer\". Record also that the interested person took no part in the approval.",
    },
    {
      key: "approvingOfficer",
      label: "Approving officer",
      type: "person",
      required: true,
      section: "Approval and related parties",
      help: "Who authorised this transaction. A person may never approve a payment to themselves or to their family, whatever office they hold.",
    },
    {
      key: "secondApproval",
      label: "Second approval",
      type: "person",
      section: "Approval and related parties",
      help: "A second signature, required for any disbursement over the threshold set by resolution, for any compensation, and for every related-party transaction without exception.",
    },
    {
      key: "authorisingInstrument",
      label: "Authorising resolution or instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Approval and related parties",
      help: "The resolution setting compensation, approving a budget line, or accepting a restricted gift. For compensation this is what evidences disinterested approval and the comparability data relied on — the difference between a defensible salary and an excess benefit.",
    },

    {
      key: "acknowledgmentIssued",
      label: "Written acknowledgment issued",
      type: "boolean",
      section: "Donor substantiation",
      help: "The receipt sent to the donor stating the amount and the goods-or-services position. Unchecked on a gift of 250 dollars or more means the donor cannot deduct it, and will discover that at filing time.",
    },
    {
      key: "acknowledgmentDate",
      label: "Date acknowledgment sent",
      type: "date",
      section: "Donor substantiation",
      help: "The date it went out, which is the date that decides whether it is contemporaneous under 26 U.S.C. § 170(f)(8). Keep a copy.",
    },
    {
      key: "goodsOrServicesProvided",
      label: "Goods or services were provided in return",
      type: "boolean",
      section: "Donor substantiation",
      help: "A meal, a ticket, merchandise, a retreat place, preferential seating. Token items of insubstantial value under the annual IRS thresholds may be disregarded; anything else must be described and valued.",
    },
    {
      key: "goodsOrServicesDescription",
      label: "Description of goods or services",
      type: "text",
      section: "Donor substantiation",
      help: "What the payer actually received, in the words that will appear on their receipt.",
    },
    {
      key: "goodsOrServicesValue",
      label: "Good-faith estimate of value",
      type: "money",
      section: "Donor substantiation",
      min: 0,
      help: "Fair market value of what the payer received — what they would pay for it commercially, not what it cost the Kingdom. The deductible portion is the excess of the payment over this figure.",
    },
    {
      key: "inKindDescription",
      label: "Description of donated property",
      type: "textarea",
      section: "Donor substantiation",
      help: "Describe the property received and its condition. Do not state a value: the Kingdom acknowledges receipt, the donor substantiates worth. Signing Form 8283 confirms receipt only and is not agreement with the donor's appraisal.",
    },

    {
      key: "payrollTreatment",
      label: "Employment tax treatment",
      type: "select",
      section: "Books and treatment",
      help: "Complete for compensation and for anything paid to a person for services. Getting this wrong is not an accounting error; it creates personal liability for the officers responsible for withholding.",
      options: [
        {
          value: "NOT_APPLICABLE",
          label: "Not applicable — not a payment for services",
        },
        {
          value: "W2_EMPLOYEE",
          label: "Employee — income tax and FICA withheld",
          help: "The default for anyone whose work the Kingdom directs as to what, when, and how.",
        },
        {
          value: "MINISTER",
          label: "Minister — dual status, SECA, no FICA withholding",
          help: "Employee for income tax purposes, self-employed for Social Security on ministerial earnings. Withholding is voluntary but usually wise.",
        },
        {
          value: "MINISTER_HOUSING",
          label: "Minister's housing allowance under § 107",
          help: "Excludable only to the extent of actual expenses and fair rental value, and only if designated in advance by official action. A retroactive designation is worth nothing.",
        },
        {
          value: "CONTRACTOR_1099",
          label: "Independent contractor — Form 1099-NEC",
          help: "Only where the worker genuinely controls how the work is done. Payments of 600 dollars or more in a year require an information return by 31 January.",
        },
      ],
    },
    {
      key: "supportingDocumentation",
      label: "Supporting documentation",
      type: "text",
      section: "Books and treatment",
      help: "Invoice, receipt, contract, grant letter, or deposit batch — identified well enough to be pulled without a search. An entry with no source document is an assertion, not a record.",
    },
    {
      key: "supportingRecord",
      label: "Filed document",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Books and treatment",
      help: "Where the underlying document has been lodged in the Evidence Vault, link it here so the entry and its proof travel together.",
    },
    {
      key: "notes",
      label: "Treasurer's notes",
      type: "textarea",
      section: "Books and treatment",
      classification: "SEALED",
      help: "Anything a successor Treasurer or an auditor would need in order to understand this entry without asking the person who made it.",
    },
  ],

  deadlineRules: [
    {
      id: "fin-ack-250",
      title: "Written acknowledgment outstanding on a gift of 250 dollars or more",
      fromField: "transactionDate",
      offsetDays: 30,
      severity: "HIGH",
      authority: "26 U.S.C. § 170(f)(8)",
      detail:
        "The donor cannot deduct this gift without a contemporaneous written acknowledgment, and contemporaneous means held by the earlier of the date they file or the due date of their return. Issue it now. An acknowledgment produced after the donor has filed does not cure the defect.",
      when: (data) =>
        typeof data.transactionType === "string" &&
        ["TITHE", "OFFERING", "DESIGNATED_GIFT", "IN_KIND"].includes(data.transactionType) &&
        Number(data.amount) >= 250 * CENTS &&
        data.acknowledgmentIssued !== true,
    },
    {
      id: "fin-quid-pro-quo",
      title: "Quid pro quo disclosure statement outstanding",
      fromField: "transactionDate",
      offsetDays: 7,
      severity: "HIGH",
      authority: "26 U.S.C. § 6115",
      detail:
        "A payment over 75 dollars made partly as a gift and partly for goods or services requires a written statement giving a good-faith estimate of the value received and telling the payer that only the excess is deductible. The statement is due at solicitation or receipt; a penalty applies per contribution under § 6714.",
      when: (data) =>
        data.goodsOrServicesProvided === true &&
        Number(data.amount) > 75 * CENTS &&
        data.acknowledgmentIssued !== true,
    },
    {
      id: "fin-grant-report",
      title: "Grant report falls due",
      fromField: "grantReportDueDate",
      offsetDays: -21,
      severity: "HIGH",
      detail:
        "A funder's reporting condition is contractual, not statutory, and is enforced by the funder rather than a regulator — which in practice means it is enforced absolutely. Late or missing reports end the relationship and can render the grant repayable.",
    },
    {
      id: "fin-restricted-review",
      title: "Annual review of a restricted fund",
      fromField: "transactionDate",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Confirm this money has been spent on the purpose the donor named, or is still held for it and identifiable as such. Restricted funds absorbed into general operating expense is the most common serious finding against small religious institutions, and it is a breach of trust rather than a bookkeeping slip.",
      when: (data) => data.restriction === "TEMPORARILY_RESTRICTED",
    },
  ],
};

export default contributions;
