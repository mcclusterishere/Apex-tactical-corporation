import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Procurement and Vendors.
 *
 * Everyone the Kingdom buys from, on what terms, chosen how, and approved by
 * whom. No public bidding law binds a private association; this register exists
 * anyway, because the two things that ruin small charities are buying from
 * insiders without an arm's-length record and paying contractors without the
 * tax paperwork that had to be collected first. Both are prevented at the point
 * of purchase and neither can be repaired afterwards.
 */

const procurement: RegistryDef = {
  slug: "procurement",
  title: "Register of Procurement and Vendors",
  shortTitle: "Procurement",
  recordLabel: "Vendor Engagement",
  recordLabelPlural: "Vendor Engagements",
  group: "treasury",
  numberPrefix: "PRC",
  order: 4,
  authority:
    "Charter Art. IV §7 (Economic Powers); 26 U.S.C. §§ 4958, 6041, 6041A, 3406; 26 C.F.R. § 53.4958-6",
  description:
    "Every vendor the Kingdom engages, the process by which it was chosen, who approved the spend, and whether the tax and insurance paperwork was collected before the first payment.",
  guidance: `**Self-dealing is the central risk and the related-party flag is the point of this register.** A purchase from a business owned by an officer, a founder, or their family is an excess benefit transaction under **26 U.S.C. § 4958** unless the terms are genuinely arm's length. The excise tax falls on individuals, not the institution: 25 per cent of the excess benefit on the recipient, 200 per cent if uncorrected, and 10 per cent on any manager who knowingly approved it. At the limit the exemption itself is at risk.

The protection is procedural and costs nothing but discipline. **26 C.F.R. § 53.4958-6** describes a rebuttable presumption of reasonableness arising where three things are true: the transaction was approved **in advance** by a body of persons with **no conflict of interest** in it; that body relied on **appropriate comparability data** — what other vendors would charge for the same work; and it **documented the basis of its decision contemporaneously**. Get all three and the burden shifts to the government; miss one and it stays on the officer. An approval minuted after the invoice is paid is not advance approval, and a recollection written up a year later is not contemporaneous documentation.

Nobody may approve a payment to themselves, to their household, or to a business they control — not once, not for a small sum, not because it was urgent. That is what the second-approver field is for.

**Collect the Form W-9 before the first payment, without exception.** Once a vendor has been paid, the Kingdom has lost every point of leverage it had to obtain their taxpayer identification number. Payments of **600 dollars or more** in a calendar year for services performed by a person or an unincorporated business are reportable on **Form 1099-NEC** under 26 U.S.C. §§ 6041 and 6041A, due to both the recipient and the IRS by **31 January**. Payments to corporations are generally exempt from reporting — but not payments of attorneys' fees, and not medical or health-care payments, which are reportable regardless of the payee's form. Rent and certain other payments go on Form 1099-MISC instead.

Where a vendor has not furnished a certified taxpayer identification number, the Kingdom must apply **backup withholding at 24 per cent** under **26 U.S.C. § 3406** and remit it. An institution that pays gross instead becomes liable for the tax it failed to withhold, out of its own funds.

**Never record an actual taxpayer identification number in this register.** Record only that a W-9 is held, and keep the document itself in the sealed Evidence Vault under restricted access. A register of Social Security numbers is a breach-notification obligation waiting to happen and serves no purpose the boolean does not.

**Worker classification sits alongside this.** A "vendor" who works only for the Kingdom, on hours it sets, with its equipment and under its direction, is an employee whatever the invoice says. Misclassification produces liability for withholding never taken, and under 26 U.S.C. § 6672 the trust-fund portion reaches responsible individuals personally.

**A competitive process protects the officers who run it more than it protects the institution.** No procurement statute binds a private religious association, so this discipline is voluntary — which is exactly why it is persuasive. Three written quotes and a recorded reason for choosing one of them turns "why did the Treasurer's cousin get the roofing contract" from an accusation into a file. Sole-source purchasing is legitimate where genuinely justified; write the justification down at the time.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "PROSPECTIVE",
  restrictedTo: ["SOVEREIGN", "TREASURER", "REGISTRAR"],
  titleField: "vendorName",
  listColumns: ["vendorType", "isRelatedParty", "amountAuthorised", "amountPaidToDate"],

  statuses: [
    {
      value: "PROSPECTIVE",
      label: "Prospective",
      tone: "neutral",
      help: "Under consideration. Nothing ordered and nothing committed.",
    },
    {
      value: "UNDER_REVIEW",
      label: "Under review",
      tone: "warning",
      help: "Quotes being obtained, or a related-party transaction awaiting disinterested approval. Do not place the order from this state.",
    },
    {
      value: "APPROVED",
      label: "Approved, not yet engaged",
      tone: "active",
      help: "Selection made and approved. Collect the W-9 and the certificate of insurance before the first payment leaves.",
    },
    {
      value: "ACTIVE",
      label: "Active engagement",
      tone: "active",
      help: "Work in progress or goods being supplied. Track payments against the authorised amount.",
    },
    {
      value: "SUSPENDED",
      label: "Suspended",
      tone: "warning",
      help: "Payments stopped pending a performance question, a lapsed insurance certificate, or missing tax paperwork. Suspension is cheaper than recovery.",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      tone: "success",
      help: "Delivered and paid in full. Leave the performance notes for whoever buys the same thing next time.",
    },
    {
      value: "TERMINATED",
      label: "Terminated",
      tone: "danger",
      help: "Ended before completion. Record why, in the performance notes, and whether any sum remains in dispute.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    {
      value: "VOID",
      label: "Void",
      tone: "danger",
      help: "Entered in error, or an engagement that never came into existence. Voiding does not undo a payment already made.",
    },
  ],

  fields: [
    {
      key: "vendorName",
      label: "Vendor name",
      type: "text",
      required: true,
      section: "The vendor",
      summary: true,
      help: "The full legal name of the paying party, exactly as it appears on the W-9 and on the cheque. A trading name that differs from the legal name is how the same vendor ends up in the register three times.",
    },
    {
      key: "vendorType",
      label: "Type of vendor",
      type: "select",
      required: true,
      section: "The vendor",
      summary: true,
      help: "The category of spend. It drives what else must be collected — trades and construction need insurance certificates and licences, professional services need engagement letters, and technology vendors handling member data need a written data agreement.",
      options: [
        { value: "GOODS", label: "Goods and supplies" },
        { value: "PROFESSIONAL", label: "Professional services", help: "Legal, accounting, architectural, consulting." },
        {
          value: "CONSTRUCTION",
          label: "Construction and trades",
          help: "The category most likely to require insurance certificates, licensing, and lien-waiver discipline.",
        },
        { value: "FACILITIES", label: "Facilities, maintenance, and cleaning" },
        { value: "TECHNOLOGY", label: "Technology and software" },
        { value: "UTILITIES", label: "Utilities and telecommunications" },
        { value: "INSURANCE", label: "Insurance and risk" },
        { value: "MEDIA", label: "Media, printing, and design" },
        { value: "HOSPITALITY", label: "Catering, venues, and events" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "vendorEntityForm",
      label: "Vendor's legal form",
      type: "select",
      section: "The vendor",
      help: "This determines reporting. Payments to corporations are generally exempt from Form 1099 — except attorneys' fees and medical payments, which are reportable whatever the payee's form.",
      options: [
        { value: "SOLE_PROPRIETOR", label: "Individual or sole proprietor", help: "Reportable at 600 dollars." },
        { value: "PARTNERSHIP", label: "Partnership", help: "Reportable at 600 dollars." },
        { value: "LLC", label: "Limited liability company", help: "Depends on its tax classification. The W-9 states it; read the box the vendor ticked." },
        { value: "CORPORATION", label: "Corporation", help: "Generally exempt from reporting, with the attorney and medical exceptions." },
        { value: "NONPROFIT", label: "Non-profit or charity" },
        { value: "GOVERNMENT", label: "Government body" },
        { value: "UNKNOWN", label: "Not yet established", help: "Establish it from the W-9 before the first payment." },
      ],
    },
    {
      key: "vendorContact",
      label: "Vendor contact email",
      type: "email",
      section: "The vendor",
      help: "Where invoices, purchase orders, and the annual request for a renewed insurance certificate go.",
    },

    {
      key: "isRelatedParty",
      label: "Vendor is a related party",
      type: "boolean",
      required: true,
      section: "Related party and conflict",
      summary: true,
      help: "An officer, a founder, a member of their family or household, or any entity any of them owns or controls. This is the field the whole register exists for. Answering it wrongly is worse than the transaction it conceals.",
    },
    {
      key: "relationshipDescription",
      label: "Nature of the relationship",
      type: "text",
      section: "Related party and conflict",
      help: "Specific and plain — 'owned by the Treasurer's brother-in-law'. An examiner who finds a relationship the register did not disclose reads every other answer on the form differently.",
    },
    {
      key: "comparabilityDataObtained",
      label: "Comparability data obtained",
      type: "boolean",
      section: "Related party and conflict",
      help: "Evidence of what others charge for the same work — competing quotes, published rates, a survey. The second element of the rebuttable presumption under 26 C.F.R. § 53.4958-6. Keep the data itself, not merely the conclusion drawn from it.",
    },
    {
      key: "disinterestedApproval",
      label: "Approved in advance by disinterested persons",
      type: "boolean",
      section: "Related party and conflict",
      help: "Approved before the commitment, by people with no financial interest in it and no relationship to the vendor, who left the room during the vote if they had either. In advance is the operative phrase: ratification after payment does not raise the presumption.",
    },
    {
      key: "conflictApprovalDate",
      label: "Date of disinterested approval",
      type: "date",
      section: "Related party and conflict",
      help: "The date of the meeting or written consent. It must precede the engagement start date. Attach the minute recording the basis of the decision — contemporaneous documentation is the third element of the presumption.",
    },

    {
      key: "taxIdCollected",
      label: "Taxpayer identification number collected",
      type: "boolean",
      required: true,
      section: "Tax and reporting",
      help: "Whether the Kingdom holds a certified TIN for this vendor. Record only that it holds one. NEVER enter the number itself in this register or in any note on it — the document belongs in the sealed Evidence Vault, and a register full of identification numbers is a breach notification waiting to happen.",
    },
    {
      key: "w9OnFile",
      label: "Form W-9 on file",
      type: "boolean",
      required: true,
      section: "Tax and reporting",
      help: "Collected BEFORE the first payment, always. After a vendor is paid there is nothing left to withhold and no leverage to obtain it, and the Kingdom is the party the IRS looks to for the missing information return.",
    },
    {
      key: "reportable1099",
      label: "Form 1099 reporting",
      type: "select",
      section: "Tax and reporting",
      help: "Determined per calendar year against the aggregate paid. Returns are due to the recipient and to the IRS by 31 January.",
      options: [
        { value: "NEC", label: "Reportable on Form 1099-NEC", help: "Services of 600 dollars or more from an unincorporated payee, and attorneys' fees regardless of form." },
        { value: "MISC", label: "Reportable on Form 1099-MISC", help: "Rent, prizes, medical and health-care payments, and other categories." },
        { value: "NOT_REPORTABLE", label: "Not reportable", help: "Corporation, goods only, or under the threshold. Record which of those it is." },
        { value: "UNDETERMINED", label: "Not yet determined", help: "Resolve before the calendar year closes, not in January." },
      ],
    },
    {
      key: "backupWithholding",
      label: "Backup withholding applied",
      type: "boolean",
      section: "Tax and reporting",
      help: "Where no certified TIN was furnished, 24 per cent must be withheld from reportable payments and remitted under 26 U.S.C. § 3406. Paying gross instead makes the Kingdom liable for the tax out of its own funds.",
    },

    {
      key: "description",
      label: "Goods or services",
      type: "textarea",
      required: true,
      section: "The engagement",
      help: "What is being bought, in terms someone reading this in five years could verify against an invoice. Deliverables, quantities, and standards. Vague scopes are how disputes over performance become unresolvable.",
    },
    {
      key: "contractRef",
      label: "Contract or agreement",
      type: "recordRef",
      refRegistry: "agreements",
      section: "The engagement",
      help: "The written agreement in the Register of Agreements. Anything of substance should be in writing before work starts; an engagement with no contract has no scope, no term, no remedy, and no way out.",
    },
    {
      key: "engagementStartDate",
      label: "Engagement start date",
      type: "date",
      section: "The engagement",
      help: "When performance begins. Where the vendor is a related party this date must fall after the disinterested approval date.",
    },
    {
      key: "engagementEndDate",
      label: "Engagement end date",
      type: "date",
      section: "The engagement",
      help: "When it ends or falls for renewal. An engagement with no end date renews itself by inertia and is never re-tested against the market.",
    },
    {
      key: "paymentTerms",
      label: "Payment terms",
      type: "text",
      section: "The engagement",
      placeholder: "e.g. net 30 from invoice; 25% deposit, balance on completion",
      help: "When payment falls due and on what trigger. Never pay a large deposit to a trade vendor with no performance milestone attached to it.",
    },
    {
      key: "amountAuthorised",
      label: "Amount authorised",
      type: "money",
      required: true,
      section: "The engagement",
      summary: true,
      min: 0,
      help: "The ceiling approved, not an estimate. Payments beyond it require a fresh approval by the same standard as the original — a related-party engagement that quietly triples in value has not been approved at its real size.",
    },

    {
      key: "competitiveProcess",
      label: "Competitive process used",
      type: "select",
      required: true,
      section: "Selection",
      help: "How the vendor was chosen. No public bidding law binds the Kingdom; this discipline is adopted voluntarily, which is precisely what makes the record persuasive when someone asks why this vendor was picked.",
      options: [
        {
          value: "SOLE_SOURCE",
          label: "Sole source",
          help: "Legitimate where genuinely justified — a unique capability, an emergency, continuity on existing work. Write the justification down now. Sole-sourcing to a related party without comparability data is the transaction that produces § 4958 exposure.",
        },
        { value: "QUOTATIONS", label: "Quotations obtained", help: "Three written quotes is the working standard for anything material." },
        { value: "FORMAL_BID", label: "Formal bid or tender" },
        {
          value: "EMERGENCY",
          label: "Emergency purchase",
          help: "A burst pipe is an emergency; a deadline someone forgot is not. Emergency purchases are reviewed after the fact and ratified or not.",
        },
        { value: "FRAMEWORK", label: "Under an existing framework or standing arrangement" },
      ],
    },
    {
      key: "quotesObtained",
      label: "Number of quotes obtained",
      type: "number",
      section: "Selection",
      min: 0,
      help: "How many independent prices were actually in hand at the decision. Quotes solicited from firms that were never going to bid are not quotes.",
    },
    {
      key: "selectionRationale",
      label: "Reason this vendor was selected",
      type: "textarea",
      required: true,
      section: "Selection",
      help: "Written at the time of the decision. If the chosen vendor was not the cheapest, say why in terms of value rather than preference. This paragraph is what an officer relies on years later when the question is asked in a hostile setting.",
    },
    {
      key: "approvingOfficer",
      label: "Approving officer",
      type: "person",
      required: true,
      section: "Selection",
      help: "The officer who authorised the spend. They must have no interest in the vendor. Nobody approves a payment to themselves, their household, or a business they control, at any amount.",
    },
    {
      key: "secondApprover",
      label: "Second approver",
      type: "person",
      section: "Selection",
      help: "A second signature, required for anything material and for every related-party engagement without exception. Two signatures is the cheapest internal control that exists and the one whose absence auditors notice first.",
    },

    {
      key: "amountPaidToDate",
      label: "Amount paid to date",
      type: "money",
      section: "Performance and payment",
      summary: true,
      min: 0,
      help: "Cumulative payments in the current calendar year and in total. This figure drives the 600-dollar reporting threshold, so it must be kept current rather than reconstructed each January.",
    },
    {
      key: "insuranceCertificateOnFile",
      label: "Certificate of insurance on file",
      type: "boolean",
      section: "Performance and payment",
      help: "Required for any vendor working on the Kingdom's premises or with its people. Obtain the certificate directly from the insurer or broker, and ask to be named as an additional insured. An uninsured contractor's injury becomes the Kingdom's claim.",
    },
    {
      key: "insuranceExpiry",
      label: "Insurance expiry date",
      type: "date",
      section: "Performance and payment",
      help: "The expiry shown on the certificate. Coverage lapses silently and nobody notices until there is a claim. The register warns thirty days out.",
    },
    {
      key: "performanceNotes",
      label: "Performance notes",
      type: "textarea",
      section: "Performance and payment",
      classification: "OFFICERS",
      help: "How the vendor actually performed — delays, quality, disputes, whether the Kingdom would engage them again. Institutional memory about vendors otherwise lives in one person's head and leaves with them.",
    },
  ],

  deadlineRules: [
    {
      id: "prc-insurance-expiry",
      title: "Vendor's certificate of insurance expires",
      fromField: "insuranceExpiry",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Thirty days to expiry. Request a renewed certificate from the vendor's insurer or broker directly, not from the vendor, and confirm the Kingdom remains named as an additional insured. Suspend payments rather than let an uninsured contractor continue working on the premises.",
      when: (data) => data.insuranceCertificateOnFile === true,
    },
  ],
};

export default procurement;
