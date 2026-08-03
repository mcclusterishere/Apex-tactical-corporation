import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Chartered Entities and Ministries.
 *
 * Every body operating under the Kingdom's name — an internal ministry, a
 * standing committee, an incorporated affiliate, a trading subsidiary, a trust,
 * a joint venture. Kept because the question "is this thing a separate legal
 * person, and if so whose signature binds it" is answered either in advance, in
 * writing, or by a court after somebody has been personally sued.
 */

const entities: RegistryDef = {
  slug: "entities",
  title: "Register of Chartered Entities and Ministries",
  shortTitle: "Entities",
  recordLabel: "Entity",
  recordLabelPlural: "Entities",
  group: "enterprise",
  numberPrefix: "ENT",
  order: 3,
  authority:
    "Charter Art. IV §3 (Offices), §7 (Economic Powers); Connecticut Revised Nonstock Corporation Act, Conn. Gen. Stat. § 33-1000 et seq.",
  description:
    "Ministries, committees, boards, subsidiaries, trusts, and joint ventures operating under the Kingdom, with their legal form, their filings, and whether they may contract in their own name.",
  guidance: `**Begin with the question the form does not ask: does this body need to be a separate legal person at all?**

An unincorporated association is, for many purposes and in many states, not a legal person. It may be unable to sue or be sued in its own name, it frequently cannot take title in its own name, and — the part that matters most — the individuals who sign a contract on its behalf may be personally liable on it, while in some states members share liability for obligations incurred on the association's behalf. Connecticut has modified the common law in places, but only partly, and the exposure is real. That single fact is the strongest practical argument for forming a corporate vehicle for any activity involving contracting, employing, borrowing, holding real property, or trading. It is a decision for the Founder with Connecticut counsel, far cheaper made now than litigated later.

**The ordinary vehicle is a Connecticut nonstock corporation** under the Connecticut Revised Nonstock Corporation Act, Conn. Gen. Stat. § 33-1000 et seq. — inexpensive, familiar to every bank, insurer, landlord, and grantmaker, and an identity that outlives its officers. Connecticut also retains older provisions for religious corporations and ecclesiastical societies; ask counsel which fits.

**Incorporating does not surrender religious autonomy.** The contrary belief costs organisations their liability protection for nothing. A corporate charter is a filing that limits who can be sued; it is not a submission to state authority over doctrine, worship, discipline, or the selection of ministers. Civil courts may not resolve disputes over religious doctrine and internal governance whatever the corporate form (*Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976)), and decide property questions on neutral principles either way (*Jones v. Wolf*, 443 U.S. 595 (1979)). Incorporation changes the liability answer. It does not touch the autonomy answer.

**A separate entity must actually be separate.** Its own EIN, bank account, minute book, and books of account, contracts signed in its own name, and formalities observed. Where those are missing a Connecticut court will disregard the form and reach the parent or the individuals behind it under the instrumentality and identity rules of *Zaist v. Olson*, 154 Conn. 563 (1967). A subsidiary in name only is worse than none: filing fees, and no shield.

**Exemption does not travel automatically.** An affiliate is a separate taxpayer and needs its own basis for exemption; it is not exempt because its parent is. A single-member LLC wholly owned by a domestic charity is generally disregarded for federal tax purposes and its activities treated as the owner's (IRS Notice 2012-52), often the simplest way to hold one property.

**Two things do not extend to a subsidiary.** Securities Act § 3(a)(4) exempts securities issued by an organisation operated exclusively for religious or charitable purposes and not for pecuniary profit; a for-profit trading subsidiary is not that, so a note or bond it issues has no exemption to stand on. The exemption reaches registration only in any case — § 17(a) and Rule 10b-5 bind everyone always, and Connecticut's Uniform Securities Act applies independently (Conn. Gen. Stat. § 36b-2 et seq.). And no entity chartered here may do what the Kingdom itself may not: issue process, assert authority over anyone who has not consented, or hold anyone out as a public officer. One that moves money between other parties needs money transmitter licensure (18 U.S.C. § 1960; Conn. Gen. Stat. § 36a-595 et seq.).

Finally: file the annual report. Administrative dissolution for a missed filing is common, embarrassing, and costs more to undo than the report did.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "PROPOSED",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "COUNSEL"],
  titleField: "entityName",
  listColumns: ["entityForm", "relationshipToKingdom", "formationDate", "annualReportDueDate"],

  statuses: [
    {
      value: "PROPOSED",
      label: "Proposed",
      tone: "neutral",
      help: "Under consideration. Nothing filed, nothing formed, no authority to act or contract.",
    },
    {
      value: "IN_FORMATION",
      label: "In formation",
      tone: "active",
      help: "Documents drafted or filings lodged, formation not complete. Contracts signed in this window bind the individuals who sign them, not the entity.",
    },
    { value: "ACTIVE", label: "Active and in good standing", tone: "success" },
    {
      value: "DELINQUENT",
      label: "Delinquent in filings",
      tone: "warning",
      help: "An annual report, agent designation, or tax filing is overdue. Good standing certificates will not issue, which stops loans, leases, and grant applications.",
    },
    {
      value: "DORMANT",
      label: "Dormant",
      tone: "warning",
      help: "Formed but not operating. Still obliged to file and still costing something. Decide deliberately whether to revive it or wind it up.",
    },
    {
      value: "ADMIN_DISSOLVED",
      label: "Administratively dissolved",
      tone: "danger",
      help: "Dissolved by the Secretary of the State for failure to file. Reinstatement is generally available but is time-limited, and business done in the interval may expose those who did it personally.",
    },
    { value: "MERGED", label: "Merged into another entity", tone: "neutral" },
    { value: "DISSOLVED", label: "Dissolved and wound up", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "entityName",
      label: "Name of the entity",
      type: "text",
      required: true,
      section: "Identity",
      summary: true,
      placeholder: "e.g. Apex Kingdom Heritage Archive, Inc.",
      help: "The exact legal name where one is filed, including the corporate suffix and its punctuation. Where the entity is internal, the name used in minutes and on its letterhead. Two spellings of one body's name is how bank accounts and grant applications get rejected.",
    },
    {
      key: "entityForm",
      label: "Form of the entity",
      type: "select",
      required: true,
      section: "Identity",
      summary: true,
      options: [
        {
          value: "INTERNAL_MINISTRY",
          label: "Internal ministry or department",
          help: "Not a separate legal person. It acts as the Kingdom, and the Kingdom bears everything it does.",
        },
        {
          value: "UNINCORPORATED_COMMITTEE",
          label: "Unincorporated committee or board",
          help: "Also not a separate legal person. Its members may be personally liable on what they sign in its name.",
        },
        {
          value: "CT_NONSTOCK",
          label: "Connecticut nonstock corporation",
          help: "The ordinary nonprofit vehicle, under Conn. Gen. Stat. § 33-1000 et seq. A separate legal person, with a liability shield that depends on the formalities being kept.",
        },
        {
          value: "LLC",
          label: "Limited liability company",
          help: "A single-member LLC wholly owned by a domestic charity is generally disregarded for federal tax purposes and its activities treated as the owner's (IRS Notice 2012-52). Common for holding one parcel of property.",
        },
        {
          value: "STATUTORY_TRUST",
          label: "Statutory or charitable trust",
          help: "Governed by its trust instrument and the Connecticut Uniform Trust Code. Suits the holding of endowed funds; less suited to operating or employing.",
        },
        {
          value: "JOINT_VENTURE",
          label: "Joint venture or partnership",
          help: "A partnership makes each partner liable for the whole of the venture's obligations. Never enter one on a handshake, and never on behalf of the Kingdom without counsel.",
        },
        { value: "FOREIGN", label: "Entity formed outside Connecticut", help: "Doing business in Connecticut generally requires registering as a foreign entity with the Secretary of the State before contracting here." },
        { value: "OTHER", label: "Other" },
      ],
      help: "What the body legally is, not what it is called. Everything downstream — who signs, who is liable, what must be filed — follows from this one answer.",
    },
    {
      key: "purpose",
      label: "Purpose",
      type: "textarea",
      required: true,
      section: "Identity",
      help: "What the entity exists to do, in the words its charter or authorising resolution uses. For any body intended to be exempt, the purpose clause must confine it to exempt purposes and provide for assets to pass to another exempt organisation on dissolution — a defective purpose clause is the most common reason an exemption application is refused.",
    },
    {
      key: "relationshipToKingdom",
      label: "Relationship to the Kingdom",
      type: "select",
      required: true,
      section: "Identity",
      summary: true,
      options: [
        { value: "DIVISION", label: "Internal division — is the Kingdom" },
        { value: "CONTROLLED", label: "Controlled subsidiary", help: "The Kingdom appoints the governing body or holds the membership interest. Control brings consolidation and, where separateness is not observed, liability." },
        { value: "AFFILIATE", label: "Affiliate under common governance" },
        { value: "SUPPORTING", label: "Supporting organisation", help: "A distinct status under 26 U.S.C. § 509(a)(3) with its own tests and restrictions. Do not claim it without advice." },
        { value: "JOINT", label: "Joint venture participant" },
        { value: "INDEPENDENT_AGREEMENT", label: "Independent body under written agreement", help: "Related only by contract. Record the agreement; the Kingdom neither controls it nor answers for it." },
      ],
      help: "How closely the Kingdom is bound to this body. It drives financial consolidation, the group exemption question, and whether a claim against the entity can reach the Kingdom's assets.",
    },

    {
      key: "separatelyIncorporated",
      label: "Separately incorporated or organised",
      type: "boolean",
      section: "Legal form and filings",
      help: "Whether a formation document has actually been accepted by a state. Not whether the Kingdom intends to file, and not whether the Charter created it — a body the Charter names is still nothing at law until a state says otherwise.",
    },
    {
      key: "incorporationJurisdiction",
      label: "State of formation",
      type: "jurisdiction",
      section: "Legal form and filings",
      placeholder: "Connecticut",
      help: "Whose statute governs the entity's internal affairs, its filings, and its dissolution. An entity formed elsewhere but operating in Connecticut generally must also register here as a foreign entity.",
    },
    {
      key: "stateFileNumber",
      label: "State business file number",
      type: "text",
      section: "Legal form and filings",
      summary: true,
      help: "The identifier the Secretary of the State assigns. Quote it on filings and in any certificate of legal existence request; names are ambiguous and this is not.",
    },
    {
      key: "formationDate",
      label: "Date of formation",
      type: "date",
      section: "Legal form and filings",
      summary: true,
      help: "The date the formation document was accepted, not the date it was signed or the date the Kingdom resolved to form it. The entity's liability shield begins here, and anything contracted before it binds the signer personally.",
    },
    {
      key: "principalOffice",
      label: "Principal office address",
      type: "text",
      section: "Legal form and filings",
      help: "The address on the entity's filings. Where it changes and the filing is not amended, official notices and lawsuits go to the old address and default judgments follow.",
    },
    {
      key: "registeredAgentName",
      label: "Registered agent",
      type: "text",
      section: "Legal form and filings",
      help: "The person or company authorised to receive service of process for the entity. Service on the agent is service on the entity, whether or not anyone read it — which is why an agent who has moved, resigned, or died is a genuine emergency rather than an administrative detail.",
    },
    {
      key: "registeredAgentAddress",
      label: "Registered agent address",
      type: "textarea",
      section: "Legal form and filings",
      help: "The address of record for service. Must be a Connecticut address for a Connecticut entity, and must be one where somebody actually collects mail every week.",
    },

    {
      key: "charterInstrumentRef",
      label: "Charter or authorising instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Governance",
      help: "The certificate of incorporation, declaration of trust, operating agreement, or the Kingdom instrument establishing an internal body. An entity whose constituting document cannot be produced cannot prove who is authorised to act for it.",
    },
    {
      key: "governingBody",
      label: "Governing body",
      type: "text",
      section: "Governance",
      placeholder: "e.g. Board of Directors — five members, appointed by the Sovereign",
      help: "What governs the entity, how many sit on it, and how they are chosen or removed. A board that exists on paper and never meets is the first fact an opponent will use to argue the entity is not real.",
    },
    {
      key: "officers",
      label: "Officers",
      type: "textarea",
      section: "Governance",
      help: "Current officers by name and office, with the date each was elected. These are the people whose signatures bind the entity, and the people personally exposed where formalities are not kept.",
    },
    {
      key: "mayContractOwnName",
      label: "May contract in its own name",
      type: "select",
      section: "Governance",
      options: [
        { value: "YES", label: "Yes — separate legal person", help: "It signs for itself, and the individual signing signs as an officer, by title, on its letterhead." },
        { value: "NO_KINGDOM_SIGNS", label: "No — the Kingdom contracts on its behalf", help: "An internal ministry has no capacity of its own. Its contracts are the Kingdom's contracts and must be signed as such." },
        { value: "LIMITED", label: "Limited — within a stated authority", help: "Set the ceiling in the authorising resolution and state it here. A counterparty dealing beyond a limit it did not know about may still hold the Kingdom." },
      ],
      help: "The most practically consequential field on this form. Where the answer is anything but 'yes', the person who signs may be personally liable on the contract, and that is a conversation to have before the signing rather than after the claim.",
    },
    {
      key: "liabilityCoverage",
      label: "Insurance and indemnity",
      type: "text",
      section: "Governance",
      help: "General liability and directors-and-officers coverage held by or extending to this entity, with carrier and limit. A separately incorporated body is usually not covered by the parent's policy; confirm with the carrier rather than assuming.",
    },

    {
      key: "einStatus",
      label: "EIN status",
      type: "select",
      section: "Tax, books and separateness",
      options: [
        { value: "OWN_EIN", label: "Holds its own EIN" },
        { value: "APPLIED", label: "Applied for, not yet issued" },
        {
          value: "USES_KINGDOM_EIN",
          label: "Uses the Kingdom's EIN",
          help: "Correct for an internal ministry and for a disregarded single-member LLC. Wrong, and a direct indication of non-separateness, for any separately incorporated body.",
        },
        { value: "NONE", label: "None obtained", help: "An entity with no EIN cannot open a bank account, cannot pay anyone, and cannot receive most grants." },
      ],
      help: "Whether this body is a taxpayer in its own right. A separately incorporated entity operating on its parent's EIN is one of the clearest facts available to an opponent arguing the form should be disregarded.",
    },
    {
      key: "ein",
      label: "EIN",
      type: "text",
      section: "Tax, books and separateness",
      classification: "OFFICERS",
      help: "The employer identification number, recorded here so filings and bank forms are consistent. Held at officer level; an EIN circulating publicly invites fraudulent filings in the entity's name.",
    },
    {
      key: "financialConsolidation",
      label: "Financial consolidation treatment",
      type: "select",
      section: "Tax, books and separateness",
      options: [
        { value: "CONSOLIDATED", label: "Consolidated into the Kingdom's accounts" },
        { value: "SEPARATE_COMBINED", label: "Separate books, combined for reporting" },
        { value: "SEPARATE", label: "Wholly separate accounts" },
        { value: "UNDETERMINED", label: "Not yet determined", help: "Resolve before the first audit or grant application. Two inconsistent answers about whose money it is will be found." },
      ],
      help: "How this entity's figures appear in the Kingdom's statement of financial position. Whatever the answer, the entity's own books must exist and must balance separately first.",
    },
    {
      key: "commercialActivity",
      label: "Carries on a trade or business",
      type: "boolean",
      section: "Tax, books and separateness",
      help: "Whether the entity sells goods or services in the ordinary commercial sense. Where it does, ask three questions early: is the activity related to exempt purposes, does it generate unrelated business income tax, and does it need its own licences. This is also the flag that says a corporate shield is worth having.",
    },
    {
      key: "separatenessMeasures",
      label: "Separateness measures observed",
      type: "textarea",
      section: "Tax, books and separateness",
      help: "The facts that make the entity real: its own bank account, its own minute book with meetings actually held, its own contracts and letterhead, arm's-length terms on anything between it and the Kingdom, and no commingling. Write down what is actually done. Under *Zaist v. Olson*, 154 Conn. 563 (1967), this is the record that decides whether a court respects the form.",
    },

    {
      key: "annualReportDueDate",
      label: "Annual report due date",
      type: "date",
      section: "Compliance dates",
      summary: true,
      help: "The date the entity's annual report falls due with the Secretary of the State. Missing it leads to loss of good standing and eventually to administrative dissolution — which suspends the liability shield the entity was formed to provide.",
    },
    {
      key: "registeredAgentRenewalDate",
      label: "Registered agent appointment renewal date",
      type: "date",
      section: "Compliance dates",
      help: "When the commercial agent's engagement, or the appointed individual's confirmation, next needs renewing. An entity without a valid agent can be served by publication or through the Secretary of the State, and will not learn of the suit until judgment.",
    },
    {
      key: "dissolutionDate",
      label: "Date of dissolution",
      type: "date",
      section: "Compliance dates",
      help: "When the entity was wound up or dissolved. Record it, and record where its assets went — on dissolution an exempt entity's assets must pass to another exempt purpose, and an unexplained distribution is an inurement finding waiting to be made.",
    },

    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Notes",
      classification: "OFFICERS",
      help: "Advice received, decisions deferred, and anything an officer picking this file up in two years would need. Where counsel has advised on entity choice, note the date and the substance; the file should show the decision was made rather than drifted into.",
    },
  ],

  deadlineRules: [
    {
      id: "annualReportDue",
      title: "Annual report due with the Secretary of the State",
      fromField: "annualReportDueDate",
      offsetDays: -30,
      severity: "HIGH",
      authority:
        "Conn. Gen. Stat. § 33-1243 (nonstock corporations); Connecticut Uniform Limited Liability Company Act, Conn. Gen. Stat. § 34-243 et seq. (limited liability companies)",
      detail:
        "File the annual report and confirm the officer, agent, and address details on it are current. A lapsed filing costs good standing, and a certificate of legal existence is what banks, landlords, insurers, and grantmakers ask for first. Continued failure leads to administrative dissolution, and business transacted after dissolution can expose those who transacted it personally.",
    },
    {
      id: "registeredAgentRenewal",
      title: "Registered agent appointment falls due for renewal",
      fromField: "registeredAgentRenewalDate",
      offsetDays: -30,
      severity: "ROUTINE",
      detail:
        "Confirm the agent still consents to act, that the address on file is one where mail is collected weekly, and that the entity's own contact for the agent is current. Service on the registered agent is service on the entity whether or not anyone reads it — the ordinary way a small organisation first learns of a lawsuit is when the default judgment arrives.",
    },
    {
      id: "ent-classification-election",
      title: "Window closing to elect federal tax classification from formation",
      fromField: "formationDate",
      offsetDays: 60,
      severity: "ROUTINE",
      authority: "Treas. Reg. § 301.7701-3(c)(1)(iii)",
      detail:
        "An entity election on Form 8832 may take effect no more than seventy-five days before the date it is filed. Where a classification other than the default is wanted for this entity, file within the window or the election takes effect later than intended and the first period is taxed on the default footing. Where the entity is a single-member LLC wholly owned by the Kingdom and the default disregarded treatment is intended, no election is needed — note that decision in the file and close this reminder.",
      when: (data) => data.entityForm === "LLC",
    },
  ],
};

export default entities;
