import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Obligations and Instruments of Indebtedness.
 *
 * This is the most dangerous register in the system, and it is kept precisely
 * because it is. Every note, bond, and certificate of indebtedness the Kingdom
 * issues is a security, and the exemption a religious body enjoys is an
 * exemption from registration and from nothing else. Unregistered affinity
 * offerings within a congregation are the single most common federal securities
 * prosecution of religious organisations. The register exists so that the fact
 * of counsel review, of written disclosure, and of the source of repayment is
 * recorded before the money moves rather than reconstructed afterwards.
 */

const obligations: RegistryDef = {
  slug: "obligations",
  title: "Register of Obligations and Instruments of Indebtedness",
  shortTitle: "Obligations",
  recordLabel: "Obligation",
  recordLabelPlural: "Obligations",
  group: "treasury",
  numberPrefix: "OBL",
  order: 2,
  authority:
    "Charter Art. IV §7 (Economic Powers); Securities Act of 1933 § 3(a)(4), 15 U.S.C. § 77c(a)(4); Conn. Gen. Stat. § 36b-2 et seq.",
  description:
    "Every instrument by which the Kingdom owes money or is owed it — notes, bonds, loans, pledges, and leases — with the securities-law posture of each recorded on its face.",
  guidance: `**Nothing in this register may be offered, issued, or sold without licensed securities counsel reviewing the specific offering.** That is the rule; the rest explains why.

**A note or a bond is a security.** Federal law presumes every note is a security and rebuts that presumption only where it bears a family resemblance to a judicially recognised list of exceptions — *Reves v. Ernst & Young*, 494 U.S. 56 (1990), weighing the motivations of buyer and seller, the plan of distribution, the reasonable expectations of the investing public, and whether some other regulatory scheme already reduces the risk. A certificate of indebtedness sold to members to fund a building is a security under every one of those factors. Where the instrument is not a note but a participation, a profit share, or a contribution with a return attached, *SEC v. W.J. Howey Co.*, 328 U.S. 293 (1946) supplies the test: an investment of money in a common enterprise with an expectation of profits derived from the efforts of others. Calling it a donation, a covenant, or a partnership in ministry changes nothing; the analysis follows the economic reality.

**Church bonds are genuinely lawful and are issued constantly.** Section 3(a)(4) of the Securities Act, 15 U.S.C. § 77c(a)(4), exempts any security issued by an entity organised and operated exclusively for religious, educational, benevolent, fraternal, charitable, or reformatory purposes and not for pecuniary profit. The Kingdom qualifies on its face. There is nothing disreputable about relying on it.

**But the exemption is from REGISTRATION ONLY.** There is no exemption, for any issuer, on any facts, from § 17(a) of the Securities Act, 15 U.S.C. § 77q(a), or from Rule 10b-5 under § 10(b) of the Exchange Act: antifraud liability attaches to every offering without exception. Every material fact must be disclosed and nothing said may be misleading, including by omission — the Kingdom's financial condition, the risk of total loss, the absence of insurance or guarantee, the absence of any market for the instrument, and the source of repayment. A charitable purpose is not a defence to fraud. If the Kingdom cannot state that source truthfully and in writing, it is not ready to borrow.

**State law applies independently.** Connecticut's Uniform Securities Act, Conn. Gen. Stat. § 36b-2 et seq., has its own definitions, its own exemptions, and its own notice-filing regime administered by the Department of Banking. A federal exemption does not carry across. Offering to a person resident in another state engages that state's law as well, and the states differ sharply — several require a filing before a single solicitation.

**Selling for compensation is a separate licence question.** A person who effects securities transactions for the account of others, for compensation, is a broker or agent and may require registration under § 15 of the Exchange Act and Conn. Gen. Stat. § 36b-6. Paying anyone a commission, a finder's fee, or a share of what they raise is the first fact an examiner looks for.

**Affinity offerings are the paradigm case.** The SEC maintains a standing investor alert on affinity fraud that names religious congregations first. The organisations that get prosecuted are rarely the ones that set out to defraud anyone. They are the ones that promised a return they could not fund, kept no books that would have shown it, and paid the early subscribers out of later subscriptions — which is the offence, whatever anyone intended.

The counsel-review field on this form is not paperwork. The review is the control, and an entry without it is a record that the control was skipped.`,
  defaultClassification: "SEALED",
  defaultStatus: "DRAFT",
  restrictedTo: ["SOVEREIGN", "TREASURER", "COUNSEL"],
  titleField: "counterparty",
  listColumns: ["instrumentType", "direction", "principalAmount", "maturityDate"],

  statuses: [
    {
      value: "DRAFT",
      label: "Draft — not offered",
      tone: "neutral",
      help: "Contemplated only. Nothing has been shown to any prospective holder. This is the only safe state for an instrument counsel has not seen.",
    },
    {
      value: "COUNSEL_REVIEW",
      label: "With counsel for review",
      tone: "warning",
      help: "Under review by licensed securities counsel. No offer, solicitation, or general announcement may be made while a record sits here.",
    },
    {
      value: "CLEARED_TO_OFFER",
      label: "Cleared to offer",
      tone: "active",
      help: "Counsel has reviewed the specific offering and the disclosure. Record the date and the exemption relied upon before changing to this status.",
    },
    {
      value: "OUTSTANDING",
      label: "Executed and outstanding",
      tone: "active",
      help: "The instrument is live and the Kingdom's balance sheet carries it.",
    },
    {
      value: "IN_ARREARS",
      label: "In arrears",
      tone: "warning",
      help: "A scheduled payment was missed. Notify the holder in writing the same week. Silence toward a holder is how a missed payment becomes an allegation of concealment.",
    },
    {
      value: "IN_DEFAULT",
      label: "In default",
      tone: "danger",
      help: "The instrument's own default terms have been triggered. Engage counsel before any communication with the holder.",
    },
    {
      value: "RESTRUCTURED",
      label: "Restructured or forborne",
      tone: "warning",
      help: "Terms varied by written agreement. Record the varied instrument as a new entry and mark this one superseded.",
    },
    {
      value: "SATISFIED",
      label: "Satisfied and discharged",
      tone: "success",
      help: "Paid in full. Obtain and attach the holder's written acknowledgment of satisfaction; keep it permanently.",
    },
    {
      value: "WRITTEN_OFF",
      label: "Written off",
      tone: "danger",
      help: "Receivables only. Forgiving a debt owed by an officer, a member, or a related party is a benefit conferred on that person and must be treated as such.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    {
      value: "VOID",
      label: "Void",
      tone: "danger",
      help: "Never executed, or executed and set aside. Voiding does not undo an offer already made to a prospective holder; record what was said and to whom.",
    },
  ],

  fields: [
    {
      key: "instrumentType",
      label: "Type of instrument",
      type: "select",
      required: true,
      section: "The instrument",
      summary: true,
      help: "What the instrument actually is in substance, not what it is titled. A document headed 'Covenant of Support' that promises repayment with interest is a promissory note.",
      options: [
        {
          value: "NOTE_PAYABLE",
          label: "Promissory note payable",
          help: "The Kingdom promises to repay. A security under Reves unless a recognised family-resemblance exception applies.",
        },
        {
          value: "NOTE_RECEIVABLE",
          label: "Note receivable",
          help: "Someone promises to repay the Kingdom. Lending charitable funds to an officer or a related party is the classic excess benefit transaction.",
        },
        {
          value: "BOND",
          label: "Bond or church bond",
          help: "An instrument offered to more than one holder on common terms. Always a security; the § 3(a)(4) exemption goes to registration only.",
        },
        {
          value: "CERTIFICATE_OF_INDEBTEDNESS",
          label: "Certificate of indebtedness",
          help: "A note by another name. The label does not change the analysis under Reves.",
        },
        { value: "LOAN_AGREEMENT", label: "Loan agreement" },
        {
          value: "PLEDGE_RECEIVABLE",
          label: "Pledge receivable",
          help: "An unfulfilled promise to give. Not income, generally not enforceable without consideration or detrimental reliance, and never to be acknowledged as a gift until the funds arrive.",
        },
        {
          value: "LEASE_OBLIGATION",
          label: "Lease obligation",
          help: "A long-term lease is a liability whether or not it appears on a balance sheet. Record it so the Kingdom's fixed commitments can be read in one place.",
        },
        {
          value: "LINE_OF_CREDIT",
          label: "Line of credit or revolving facility",
          help: "Record the facility limit as the principal amount and the drawn balance as the current outstanding.",
        },
      ],
    },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      required: true,
      section: "The instrument",
      summary: true,
      help: "Whether the Kingdom owes or is owed. The securities questions on this form arise chiefly where the Kingdom owes; the self-dealing questions arise chiefly where it is owed.",
      options: [
        { value: "PAYABLE", label: "Owed by the Kingdom" },
        { value: "RECEIVABLE", label: "Owed to the Kingdom" },
      ],
    },
    {
      key: "counterparty",
      label: "Counterparty",
      type: "person",
      required: true,
      section: "The instrument",
      summary: true,
      help: "The holder or the obligor, in full legal name as it appears on the instrument. One record per counterparty per instrument; do not aggregate a bond series into a single entry.",
    },
    {
      key: "counterpartyJurisdiction",
      label: "Counterparty's state of residence",
      type: "jurisdiction",
      section: "The instrument",
      help: "Blue-sky law follows the buyer, not the issuer. An offer to a person resident outside Connecticut engages that state's securities act, and several states require a filing before the first solicitation.",
    },

    {
      key: "counterpartyIsMember",
      label: "Counterparty is a member of the congregation",
      type: "boolean",
      required: true,
      section: "Counterparty status",
      summary: true,
      help: "Offering an instrument to fellow congregants is affinity offering — the SEC's paradigm case and a standing enforcement priority. It is not unlawful, but it raises the disclosure standard rather than lowering it. Trust between members is not a substitute for written risk disclosure.",
    },
    {
      key: "counterpartyIsRelatedParty",
      label: "Counterparty is a related party",
      type: "boolean",
      required: true,
      section: "Counterparty status",
      summary: true,
      help: "An officer, a founder, a member of their family, or an entity any of them controls. Related-party debt requires approval in advance by disinterested persons on comparable market terms, or it is an excess benefit transaction under 26 U.S.C. § 4958.",
    },
    {
      key: "relatedPartyRelationship",
      label: "Nature of the relationship",
      type: "text",
      section: "Counterparty status",
      help: "State it plainly — 'brother of the Treasurer', 'company controlled by the Founder'. An examiner who discovers a relationship the register did not disclose treats everything else on the form as suspect.",
    },

    {
      key: "principalAmount",
      label: "Principal amount",
      type: "money",
      required: true,
      section: "Principal and terms",
      summary: true,
      min: 0,
      help: "The face amount of the instrument, or for a revolving facility the maximum available. Gross, before any fee or discount.",
    },
    {
      key: "interestRate",
      label: "Interest rate (per cent per annum)",
      type: "number",
      section: "Principal and terms",
      min: 0,
      max: 100,
      help: "The stated annual rate. Connecticut caps interest on many loans at twelve per cent per annum under Conn. Gen. Stat. § 37-4, subject to the exceptions in § 37-9; whether an exception reaches this instrument is a question for counsel, not an assumption. A rate materially above market is also evidence of an excess benefit where a related party holds the note.",
    },
    {
      key: "compounding",
      label: "Compounding",
      type: "select",
      section: "Principal and terms",
      help: "How often unpaid interest is added to principal. Compounding changes the true cost enormously over a long term and must be stated in any disclosure given to a holder.",
      options: [
        { value: "SIMPLE", label: "Simple — no compounding" },
        { value: "ANNUAL", label: "Annual" },
        { value: "SEMIANNUAL", label: "Semi-annual" },
        { value: "QUARTERLY", label: "Quarterly" },
        { value: "MONTHLY", label: "Monthly" },
        { value: "DAILY", label: "Daily" },
        { value: "NONE", label: "Non-interest bearing" },
      ],
    },
    {
      key: "issueDate",
      label: "Issue or execution date",
      type: "date",
      required: true,
      section: "Principal and terms",
      help: "The date the instrument was signed and delivered. Counsel review and written disclosure must both predate it; a review dated after this is not a control, it is a comfort letter.",
    },
    {
      key: "maturityDate",
      label: "Maturity date",
      type: "date",
      section: "Principal and terms",
      summary: true,
      help: "When the whole balance falls due. The register warns at sixty days out, because finding the money to retire a note is a fundraising problem, not a payments problem.",
    },
    {
      key: "paymentSchedule",
      label: "Payment schedule",
      type: "select",
      section: "Principal and terms",
      help: "How the instrument is repaid over its life. The schedule determines what the Kingdom must find each month and what it must find at the end, and those are two different fundraising problems.",
      options: [
        { value: "INTEREST_ONLY", label: "Interest only, principal at maturity" },
        { value: "LEVEL_AMORTISING", label: "Level payments amortising principal and interest" },
        {
          value: "BALLOON",
          label: "Amortising with balloon payment at maturity",
          help: "The balloon is the payment institutions miss. Plan its source at issue, not in its final year.",
        },
        { value: "SINGLE_PAYMENT", label: "Single payment of principal and interest at maturity" },
        {
          value: "ON_DEMAND",
          label: "Payable on demand",
          help: "A demand instrument can be called at any moment and must be treated as currently payable in every cash forecast.",
        },
        { value: "IRREGULAR", label: "Irregular — see terms" },
      ],
    },
    {
      key: "nextPaymentDate",
      label: "Next payment due",
      type: "date",
      section: "Principal and terms",
      help: "Advance this after each payment. The register warns seven days out. A missed payment to a congregant holder is not merely a default; it is the first fact anyone will describe to a regulator.",
    },

    {
      key: "collateralDescription",
      label: "Security or collateral",
      type: "textarea",
      section: "Security and priority",
      help: "What secures the instrument, and how the security interest was perfected — recorded mortgage, filed financing statement, possession. If the instrument is unsecured, say so in these words, because a holder who assumes security exists has been misled by omission.",
    },
    {
      key: "guarantors",
      label: "Guarantors",
      type: "textarea",
      section: "Security and priority",
      help: "Anyone personally liable if the Kingdom does not pay. A personal guarantee by an officer is a benefit running from that officer to the institution and should be minuted; a guarantee by the institution of an officer's personal debt runs the other way and is almost never defensible.",
    },
    {
      key: "subordination",
      label: "Priority and subordination",
      type: "select",
      section: "Security and priority",
      help: "Where this instrument ranks against the Kingdom's other creditors. A subordinated position must be disclosed to the holder in writing before they subscribe.",
      options: [
        { value: "SENIOR", label: "Senior" },
        { value: "PARI_PASSU", label: "Equal ranking with other unsecured obligations" },
        { value: "SUBORDINATED", label: "Subordinated to identified senior debt" },
        { value: "UNDETERMINED", label: "Not determined", help: "Determine it before issue, not after." },
      ],
    },

    {
      key: "purposeOfBorrowing",
      label: "Purpose of the borrowing or lending",
      type: "textarea",
      required: true,
      section: "Purpose and repayment",
      help: "What the money is actually for, in specific terms. 'General purposes' is not a purpose and will not survive a question from a holder or an examiner. If the proceeds will retire an earlier obligation, say so here in plain words — that is the fact that must be disclosed above all others.",
    },
    {
      key: "repaymentSource",
      label: "Source of repayment",
      type: "textarea",
      required: true,
      section: "Purpose and repayment",
      help: "The identified funds from which this will be repaid — recurring giving at a stated level, rent from a named tenant, a signed grant. This is the single most important field on the form. If the honest answer is that repayment depends on money not yet raised, that answer must appear in the written disclosure given to the holder, and the instrument probably should not be issued.",
    },

    {
      key: "isSecurity",
      label: "Is this instrument a security?",
      type: "select",
      required: true,
      section: "Securities compliance",
      summary: true,
      help: "Answer on the substance. Under Reves every note is presumed to be a security; under Howey any arrangement promising a return from the efforts of others is one. 'No' is a conclusion counsel reaches, not one the Treasurer reaches.",
      options: [
        { value: "YES", label: "Yes — treated as a security" },
        {
          value: "NO_COUNSEL_OPINION",
          label: "No — on written advice of counsel",
          help: "Attach the written advice. An oral assurance recorded here protects nobody.",
        },
        {
          value: "UNDETERMINED",
          label: "Not yet determined",
          help: "While this is the answer, nothing may be offered to anyone.",
        },
      ],
    },
    {
      key: "exemptionRelied",
      label: "Exemption relied upon",
      type: "select",
      section: "Securities compliance",
      help: "Which registration exemption the offering rests on, federally. Record the state exemption separately below. Relying on an exemption whose conditions were not met is the same position as never having claimed one.",
      options: [
        {
          value: "SECTION_3A4",
          label: "§ 3(a)(4) — religious, charitable, or benevolent issuer",
          help: "15 U.S.C. § 77c(a)(4). Requires that the Kingdom be operated exclusively for those purposes and not for pecuniary profit. Exempts registration only; § 17(a) and Rule 10b-5 still apply in full.",
        },
        { value: "REG_D_506B", label: "Regulation D Rule 506(b) — no general solicitation" },
        { value: "REG_D_506C", label: "Regulation D Rule 506(c) — accredited investors, verified" },
        { value: "SECTION_4A2", label: "§ 4(a)(2) — private offering" },
        { value: "INTRASTATE", label: "Intrastate exemption" },
        {
          value: "NONE_IDENTIFIED",
          label: "None identified",
          help: "Do not issue. An unregistered offering with no exemption is the violation.",
        },
        { value: "NOT_APPLICABLE", label: "Not applicable — not a security" },
      ],
    },
    {
      key: "offeringDocumentExists",
      label: "Written offering document exists",
      type: "boolean",
      section: "Securities compliance",
      help: "A document setting out the terms, the Kingdom's financial position, and the risks. Disclosure obligations under the antifraud provisions do not depend on registration, so the exempt offering needs this exactly as much as a registered one.",
    },
    {
      key: "stateNoticeFiling",
      label: "State notice filing",
      type: "select",
      section: "Securities compliance",
      help: "Connecticut's Uniform Securities Act, Conn. Gen. Stat. § 36b-2 et seq., operates independently of federal law and administers its own exemptions and notice filings through the Department of Banking. So does every state into which an offer is made.",
      options: [
        { value: "FILED", label: "Filed and accepted" },
        { value: "PENDING", label: "Filed, awaiting acceptance" },
        {
          value: "NOT_REQUIRED",
          label: "Not required — on written advice of counsel",
          help: "Record whose advice, and keep it.",
        },
        {
          value: "NOT_MADE",
          label: "Not made",
          help: "If a filing is required and was not made, stop and take advice before any further offer or payment.",
        },
        { value: "UNDETERMINED", label: "Not yet determined" },
      ],
    },
    {
      key: "stateNoticeFileNumber",
      label: "State file number",
      type: "text",
      section: "Securities compliance",
      help: "The number the state assigned. It is the only proof the filing was made and accepted; a copy of what was posted is not.",
    },
    {
      key: "counselReviewed",
      label: "Reviewed by licensed securities counsel",
      type: "boolean",
      required: true,
      section: "Securities compliance",
      summary: true,
      help: "Reviewed the specific offering — this instrument, these terms, this class of purchaser — not the concept of church bonds in general. This field is the control the whole register exists to record.",
    },
    {
      key: "counselReviewDate",
      label: "Date of counsel review",
      type: "date",
      section: "Securities compliance",
      help: "Must precede the issue date and precede any offer. Record the reviewing firm in the security or purpose notes and keep the written advice in the sealed evidence vault.",
    },
    {
      key: "riskDisclosureProvided",
      label: "Purchaser received written risk disclosure",
      type: "boolean",
      section: "Securities compliance",
      help: "Written, before subscription, and covering at minimum the risk of total loss, the absence of any insurance or guarantee, the absence of a market for the instrument, and the Kingdom's actual financial condition. Keep the countersigned copy. Antifraud liability attaches whether or not registration was required.",
    },
    {
      key: "sellerCompensated",
      label: "Anyone was compensated for selling this",
      type: "boolean",
      section: "Securities compliance",
      help: "Commission, finder's fee, bonus, or any share of what was raised, to anyone including an officer or volunteer. If true, broker-dealer or agent registration under § 15 of the Exchange Act and Conn. Gen. Stat. § 36b-6 must be resolved before another dollar is taken. This is the first question an examiner asks.",
    },
  ],

  deadlineRules: [
    {
      id: "obl-maturity",
      title: "Obligation matures — funds must be available",
      fromField: "maturityDate",
      offsetDays: -60,
      severity: "CRITICAL",
      detail:
        "Sixty days to maturity. Confirm now that the funds to retire this instrument exist and are identified. If they do not, open the conversation with the holder this week and take advice: a maturity retired out of new subscriptions from other members is the structure that produces prosecutions, and the honest alternative — a written extension agreed in advance with full disclosure — is available only while there is time to negotiate it.",
    },
    {
      id: "obl-next-payment",
      title: "Scheduled payment falls due",
      fromField: "nextPaymentDate",
      offsetDays: -7,
      severity: "HIGH",
      detail:
        "Seven days to the next scheduled payment. Confirm the funds are in the account. If the payment cannot be made, write to the holder before the due date rather than after it, and record the communication.",
    },
  ],
};

export default obligations;
