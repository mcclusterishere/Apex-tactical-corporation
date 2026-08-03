import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Compacts, Treaties and Memoranda.
 *
 * Every agreement with an outside party, binding or not, with the obligations
 * on both sides, the dates that end it, and the record of who signed and under
 * what authority. Kept in this form because an unincorporated association's
 * contracts create personal exposure for the people who sign them, and because
 * the obligation nobody diarised is the one that is breached.
 */

const agreements: RegistryDef = {
  slug: "agreements",
  title: "Register of Compacts, Treaties and Memoranda",
  shortTitle: "Agreements",
  recordLabel: "Agreement",
  recordLabelPlural: "Agreements",
  group: "relations",
  numberPrefix: "AGR",
  order: 2,
  authority: "Charter Art. IV §10 (External Agreements); Art. VI (External Relations)",
  description:
    "Agreements with outside parties: what each side promised, what it is worth, when it ends, how it renews, and who is on the hook if it fails.",
  guidance: `Enter an agreement before it is signed, not after. Half of what this register exists to catch is only fixable while the other side is still willing to redraft.

**The label on the document does not control whether it binds.** A page headed "Memorandum of Understanding" that says each party *shall* do a thing, in exchange for the other doing a thing, is a contract, and a court will read it as one. A page headed "Agreement" that says the parties *intend to explore* cooperation binds nobody. Courts look to the operative language, the presence of consideration, and the parties' manifested intent — not to the title. If an instrument is genuinely meant to be non-binding, it must say so expressly, in a clause that states it creates no legally enforceable obligations and that neither party relies on it. If it is meant to bind, then it needs a term, a termination right, and a dispute clause, and the fact that it is called a memorandum will not excuse the absence of them.

**Charter Art. IV §10.** No external agreement may surrender the Kingdom's autonomy, and every one requires the Founder's approval before execution. Both are recorded below, with dates, because "the Founder was fine with it" is not a record.

**The exposure that matters most: who is personally liable.** An unincorporated association is, at common law, not a legal person. It cannot hold or contract in its own name; the individuals who sign contract personally, as principals or as agents of the members, and in some jurisdictions members can be jointly liable for obligations incurred on the association's behalf. Statutes modify this in many states — whether and how Connecticut's do for a given agreement is a question to put to counsel *before* signature, not after a default. The practical consequence is blunt: as matters stand, a lease, a services contract, or a grant agreement signed for the Kingdom may reach the signer's own house.

This is the single strongest practical argument for forming a corporate vehicle — most naturally a nonstock corporation under the Connecticut Revised Nonstock Corporation Act, Conn. Gen. Stat. ch. 602 — to hold commercial dealings. It is worth being clear about what that would and would not mean. Incorporating a vehicle for contracts does not submit doctrine, polity, or the choice of ministers to the state; those remain beyond civil review under the religious autonomy doctrine (*Watson v. Jones*; *Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976); *Our Lady of Guadalupe School v. Morrissey-Berru*, 591 U.S. 732 (2020)). Nor does it require the ecclesiastical body itself to incorporate — the vehicle can be a separate affiliated entity that does nothing but sign leases and buy insurance. This is the Founder's decision to take with counsel. The register's job is to make sure it is taken deliberately rather than discovered in a collection action.

**Sovereign immunity is not a term the Kingdom can supply.** A private association has none, and a clause reserving it is at best surplusage and at worst the sentence that ends the negotiation. The protections that actually work in an agreement are ordinary and available: a limitation of liability, an indemnity, insurance requirements, a defined arbitration forum, and an express carve-out reserving questions of doctrine, membership, and internal governance from the dispute mechanism. A religious arbitration clause is enforceable under the Federal Arbitration Act, 9 U.S.C. §§ 2-4, provided it is written, signed, agreed before the dispute arises, and defined in scope — and it is the only route by which a tribunal of the Kingdom produces something a civil court will enforce.

**Renewal and notice dates are what get missed.** An evergreen clause renews on its own while everyone assumes it lapsed, and a notice window closes four months before the term ends. Enter both dates the day the agreement is executed.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "NEGOTIATING",
  titleField: "subject",
  listColumns: ["counterparty", "instrumentType", "bindingCharacter", "expiryDate"],

  statuses: [
    { value: "NEGOTIATING", label: "In negotiation", tone: "neutral", help: "Terms still open. This is the only stage at which anything can be fixed cheaply." },
    { value: "AWAITING_APPROVAL", label: "Awaiting the Founder's approval", tone: "warning", help: "Charter Art. IV §10. Not to be signed in this state." },
    { value: "EXECUTED", label: "Executed, not yet commenced", tone: "active" },
    { value: "IN_FORCE", label: "In force", tone: "success" },
    { value: "IN_DISPUTE", label: "In dispute", tone: "danger", help: "A breach is alleged by or against the Kingdom. Refer to Counsel and preserve documents at once." },
    { value: "EXPIRED", label: "Expired by its own terms", tone: "neutral" },
    { value: "TERMINATED", label: "Terminated", tone: "danger" },
    { value: "LAPSED_UNSIGNED", label: "Lapsed unsigned", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "counterparty",
      label: "Counterparty",
      type: "text",
      required: true,
      section: "Parties and subject",
      summary: true,
      help: "The other side's exact legal name, in the form it uses to contract. A contract with an entity that does not exist under that name is difficult to enforce and easy to disown.",
    },
    {
      key: "instrumentType",
      label: "Type of instrument",
      type: "select",
      required: true,
      section: "Parties and subject",
      summary: true,
      options: [
        { value: "MOU", label: "Memorandum of understanding" },
        { value: "COOPERATIVE_AGREEMENT", label: "Cooperative agreement" },
        { value: "SERVICES_CONTRACT", label: "Services contract" },
        { value: "LEASE", label: "Lease or occupancy agreement", help: "Almost always binding, almost always long, and the most common source of personal exposure for a signer." },
        { value: "GRANT_AGREEMENT", label: "Grant agreement", help: "Carries reporting conditions and clawback terms. Read the conditions before the cheque is banked." },
        { value: "AFFILIATION_AGREEMENT", label: "Affiliation agreement" },
        { value: "MUTUAL_RECOGNITION", label: "Mutual recognition", help: "Two private bodies recognising one another is a private arrangement. It has whatever weight the parties give it and no legal effect on anyone else." },
        { value: "SETTLEMENT_AGREEMENT", label: "Settlement agreement", help: "Binding by design and usually final. Nothing here is signed without Counsel." },
      ],
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
      section: "Parties and subject",
      help: "One line naming what the agreement is about. This titles the record.",
    },
    {
      key: "bindingCharacter",
      label: "Binding character",
      type: "select",
      required: true,
      section: "Parties and subject",
      summary: true,
      help: "Record what the operative language actually does, not what the heading claims.",
      options: [
        { value: "BINDING", label: "Binding contract" },
        { value: "NON_BINDING", label: "Statement of intent — expressly non-binding", help: "Only choose this where a clause says in terms that no legally enforceable obligation is created." },
        { value: "MIXED", label: "Mixed — some clauses bind", help: "Common. Confidentiality, publicity, and cost-sharing clauses frequently bind inside an otherwise aspirational document." },
        { value: "UNCERTAIN", label: "Uncertain — needs review", help: "Treat as binding until Counsel says otherwise." },
      ],
    },

    {
      key: "kingdomObligations",
      label: "Obligations of the Kingdom",
      type: "textarea",
      required: true,
      section: "Obligations and consideration",
      help: "Every promise the Kingdom makes, in plain terms, with the dates by which each is due. Written out here, an obligation nobody can actually perform becomes obvious before signature.",
    },
    {
      key: "counterpartyObligations",
      label: "Obligations of the counterparty",
      type: "textarea",
      required: true,
      section: "Obligations and consideration",
      help: "What the Kingdom is entitled to demand. If this column is thin next to the one above, the agreement is a donation described as a partnership.",
    },
    {
      key: "consideration",
      label: "Consideration",
      type: "textarea",
      section: "Obligations and consideration",
      help: "What each side gives in exchange. Its presence is one of the things a court looks to in deciding whether a document binds at all.",
    },
    {
      key: "annualValue",
      label: "Annual value or cost",
      type: "money",
      section: "Obligations and consideration",
      help: "Positive where the Kingdom receives, negative where it pays. Aggregated to show the Kingdom's total contractual exposure in a year.",
    },

    {
      key: "commencementDate",
      label: "Commencement date",
      type: "date",
      section: "Term, renewal and termination",
      summary: true,
      help: "The day performance begins, which is often not the day of signature.",
    },
    {
      key: "expiryDate",
      label: "Expiry date",
      type: "date",
      section: "Term, renewal and termination",
      summary: true,
      help: "The day the term ends absent renewal. Leave blank only where the agreement genuinely has no end date, and note that an agreement with no end and no termination right is a permanent obligation.",
    },
    {
      key: "renewalMechanism",
      label: "Renewal mechanism",
      type: "select",
      section: "Term, renewal and termination",
      options: [
        { value: "NONE", label: "None — expires and ends" },
        { value: "AUTOMATIC_EVERGREEN", label: "Automatic renewal unless notice given", help: "The clause that most often binds an institution for another full term by inadvertence. Diarise the notice deadline the day this is signed." },
        { value: "RENEWAL_BY_AGREEMENT", label: "Renewal only by fresh written agreement" },
        { value: "OPTION_TO_EXTEND", label: "Option to extend, exercisable by notice" },
      ],
    },
    {
      key: "renewalNoticeDays",
      label: "Notice period for renewal or non-renewal (days)",
      type: "number",
      section: "Term, renewal and termination",
      min: 0,
      help: "As stated in the clause. Used to check the deadline date below; where they disagree, the clause governs and the date is wrong.",
    },
    {
      key: "renewalNoticeDeadline",
      label: "Last day to give renewal or non-renewal notice",
      type: "date",
      section: "Term, renewal and termination",
      summary: true,
      help: "Compute this on the day of execution and enter it. Missing it is what converts a one-year commitment into a two-year one, and no court will relieve against it.",
    },
    {
      key: "terminationRights",
      label: "Termination rights",
      type: "textarea",
      section: "Term, renewal and termination",
      help: "Who may end it, on what grounds, with how much notice, and what survives termination. An agreement terminable only for cause by the other side is a trap.",
    },

    {
      key: "disputeResolution",
      label: "Dispute resolution clause",
      type: "select",
      section: "Dispute resolution and governing law",
      options: [
        { value: "SILENT", label: "Silent", help: "Silence means the courts of the governing jurisdiction, on ordinary civil procedure." },
        { value: "NEGOTIATION", label: "Good-faith negotiation only" },
        { value: "MEDIATION", label: "Mediation" },
        { value: "RELIGIOUS_ARBITRATION", label: "Religious arbitration before a tribunal of the Kingdom", help: "Enforceable under the Federal Arbitration Act, 9 U.S.C. §§ 2-4, only if written, signed, agreed before the dispute, and defined in scope. This is the sole route by which the Kingdom's tribunal produces an award a civil court will enforce." },
        { value: "COMMERCIAL_ARBITRATION", label: "Commercial arbitration (AAA, JAMS, or similar)" },
        { value: "COURTS", label: "Courts of a named jurisdiction" },
      ],
    },
    {
      key: "governingLaw",
      label: "Governing law and venue",
      type: "jurisdiction",
      section: "Dispute resolution and governing law",
      help: "The law that will be applied and the place a dispute is heard. A clause naming the counterparty's distant home state turns a small dispute into an unaffordable one.",
    },

    {
      key: "signedForKingdomBy",
      label: "Signed for the Kingdom by",
      type: "recordRef",
      refRegistry: "offices",
      section: "Execution and authority",
      help: "The commission relied on. If its recorded signature authority does not reach this agreement's value or subject matter, the signature is unauthorised and the signer is exposed personally.",
    },
    {
      key: "counterpartySignatory",
      label: "Signed for the counterparty by",
      type: "person",
      section: "Execution and authority",
      help: "Name and title. Confirm the person has authority to bind their own organisation before relying on the agreement.",
    },
    {
      key: "founderApproval",
      label: "Approved by the Founder",
      type: "boolean",
      section: "Execution and authority",
      help: "Charter Art. IV §10 requires it for every external agreement. An unapproved agreement is not the Kingdom's, whatever the counterparty was told.",
    },
    {
      key: "founderApprovalDate",
      label: "Date of the Founder's approval",
      type: "date",
      section: "Execution and authority",
      help: "Must precede execution. Approval dated after signature is ratification, which is a different thing and should be described as such.",
    },
    {
      key: "contractingVehicle",
      label: "Contracting vehicle",
      type: "select",
      section: "Execution and authority",
      help: "The entity actually named as a party on the face of the document.",
      options: [
        { value: "KINGDOM_UNINCORPORATED", label: "Apex Kingdom, unincorporated association", help: "Carries the personal-liability exposure described in the guidance. Acceptable for low-value, non-monetary arrangements; hazardous for leases, employment, and anything with a recurring payment." },
        { value: "TRUST", label: "The charitable trust, by its trustee" },
        { value: "SEPARATE_CORPORATION", label: "A separate incorporated vehicle", help: "The posture that actually limits exposure." },
        { value: "INDIVIDUAL_OFFICER", label: "An individual officer in their own name", help: "The officer is the contracting party and is personally liable in full. Record why this was necessary and how the Kingdom indemnifies them." },
        { value: "NOT_DETERMINED", label: "Not determined", help: "Do not execute in this state." },
      ],
    },
    {
      key: "personalLiabilityReviewed",
      label: "Personal liability position reviewed before signature",
      type: "boolean",
      section: "Execution and authority",
      help: "Confirms someone asked, in terms, whose personal assets stand behind this if the Kingdom cannot perform, and got an answer.",
    },

    {
      key: "autonomyAffected",
      label: "Effect on the Kingdom's autonomy",
      type: "select",
      section: "Autonomy and internal governance",
      options: [
        { value: "NONE", label: "None — no effect on internal governance" },
        { value: "LIMITED", label: "Limited — procedural conditions only", help: "Reporting, audit, or non-discrimination conditions typical of grants." },
        { value: "MATERIAL", label: "Material — touches doctrine, membership, or the choice of officers", help: "Charter Art. IV §10 bars surrender of autonomy. Redraft or decline." },
        { value: "UNASSESSED", label: "Not yet assessed" },
      ],
    },
    {
      key: "autonomyAnalysis",
      label: "Analysis of autonomy and governance effects",
      type: "textarea",
      section: "Autonomy and internal governance",
      help: "Identify the specific clauses examined. Where the agreement is otherwise acceptable, the fix is usually a short carve-out reserving doctrine, membership, discipline, and the selection of ministers from the agreement and from its dispute mechanism.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Autonomy and internal governance",
      classification: "OFFICERS",
      help: "Negotiation history, positions conceded, and points to press on renewal.",
    },
  ],

  deadlineRules: [
    {
      id: "agr-expiry-review",
      title: "Agreement expires in ninety days — decide now whether to renew",
      fromField: "expiryDate",
      offsetDays: -90,
      severity: "HIGH",
      detail:
        "Ninety days is roughly the time needed to renegotiate terms, obtain the Founder's approval, and execute before the term runs. Starting later means renewing on the counterparty's terms or operating without an agreement.",
    },
    {
      id: "agr-renewal-notice",
      title: "Renewal or non-renewal notice must be given",
      fromField: "renewalNoticeDeadline",
      offsetDays: -14,
      severity: "CRITICAL",
      detail:
        "Fourteen days remain to serve written notice in the form the agreement requires. Miss this and an evergreen clause renews the whole term automatically, or an option to extend is lost outright. Serve by a method that proves delivery and file the proof.",
    },
  ],
};

export default agreements;
