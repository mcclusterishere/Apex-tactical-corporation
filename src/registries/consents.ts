import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Consents to Jurisdiction and Arbitration.
 *
 * One record per person per executed instrument. This is the register that
 * converts the Kingdom's judicial power from assertion into something a civil
 * court will stand behind, because an arbitration award is enforceable only
 * against someone who signed. Write access is kept narrow: these entries are
 * relied upon to open matters, and an inaccurate one is worse than none.
 */

const consents: RegistryDef = {
  slug: "consents",
  title: "Register of Consents to Jurisdiction and Arbitration",
  shortTitle: "Consents",
  recordLabel: "Consent",
  recordLabelPlural: "Consents",
  group: "governance",
  numberPrefix: "CONS",
  order: 3,
  authority: "Charter Art. II (Membership); Art. III (Jurisdiction); 9 U.S.C. Sec. 2",
  description:
    "Every executed agreement by which a person submits a defined class of disputes to the Kingdom's forums, with the facts that decide whether it will hold.",
  guidance: `This register is the hinge on which the Kingdom's judicial power turns. Not the Charter, which binds nobody who did not accept it, and not the tribunal's own rules — individual signatures. Keep one record per person per executed instrument: someone who signed a membership covenant in 2023 and an arbitration agreement in 2025 has two records, and the tribunal must be able to see both.

**What makes an agreement to arbitrate enforceable.** Under the Federal Arbitration Act a written agreement to arbitrate is valid, irrevocable, and enforceable save upon such grounds as exist at law or in equity for the revocation of any contract (9 U.S.C. Sec. 2). In practice: it is in writing; both sides genuinely assented; the disputes covered are defined; it was made before the dispute arose; and it is not unconscionable. Religious arbitration sits squarely inside this. Courts confirm awards from rabbinical courts and Christian conciliation panels without inquiring into the doctrine applied, because what they examine is the agreement, not the faith.

**How agreements get struck down.** Nearly always for one of four reasons. It was buried in an unrelated document nobody read. There was no real opportunity to decline — sign or lose the job, the membership, the child's place in the school. The terms were wildly one-sided: the institution may sue in court while the signer may only arbitrate, the institution alone picks the panel, or costs are allocated so that the signer cannot afford the forum they were pushed into. Or it purported to waive rights that cannot be waived by private agreement. Record the truth on each of these fields. A file showing a signer who had a week to consider, was told in writing they could take it to a lawyer, and kept their own copy is a file that survives a challenge in a paragraph.

**Void terms taint what surrounds them.** An agreement purporting to waive criminal jurisdiction, to bar a signer from reporting a crime, to displace child protection obligations, or to relieve anyone of mandatory reporting duties under Conn. Gen. Stat. Sec. 17a-101 is void as to those terms, and courts have refused to enforce whole agreements they found permeated by unlawful ones. Do not draft them. Where an instrument already in circulation contains one, record that fact here plainly and re-execute a clean instrument; do not quietly reinterpret the old one and hope.

**The wet-ink original.** When arbitration is resisted, the resisting party ordinarily denies signing. A produced original bearing a witnessed or notarised signature ends that argument at the threshold. A PDF of unknown provenance produces an evidentiary hearing the Kingdom then has to win. Record where the original physically sits, and keep it somewhere that is not the same building as the only copy.

**Limits worth stating once.** Consent reaches only the person who gave it — never their family, employer, congregation, or estate. It creates no authority over anyone else's property, no power over a non-signer, and no jurisdiction over criminal conduct, which belongs to the State of Connecticut and to no one else.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "DRAFT",
  titleField: "consentingPerson",
  restrictedTo: ["REGISTRAR", "COUNSEL"],
  listColumns: ["capacity", "instrumentType", "dateExecuted", "revocationDate"],

  statuses: [
    { value: "DRAFT", label: "Prepared, not signed", tone: "neutral", help: "Carries nothing. A tribunal may not rely on it." },
    { value: "EXECUTED", label: "Executed", tone: "success", help: "Signed by all necessary parties, original located." },
    { value: "ORIGINAL_MISSING", label: "Executed — original not located", tone: "warning", help: "Enforceable in principle, but exposed to a denial of signature." },
    { value: "DEFECTIVE", label: "Executed but defective", tone: "warning", help: "A defect is recorded that may defeat enforcement. Re-execute rather than rely on it." },
    { value: "REVOKED", label: "Revoked or withdrawn", tone: "danger", help: "Prospective only. Disputes already submitted before revocation ordinarily remain covered." },
    { value: "EXPIRED", label: "Expired by its own terms", tone: "neutral" },
    { value: "UNENFORCEABLE", label: "Held unenforceable", tone: "danger", help: "A court declined to compel arbitration under it. Record the case and the reason." },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "consentingPerson",
      label: "Consenting person",
      type: "person",
      required: true,
      section: "The signer",
      summary: true,
      help: "The individual who signed, in full legal name as it appears on the signature line. An entity is not a person; where an entity signs, record the entity and the human who executed for it.",
    },
    {
      key: "capacity",
      label: "Capacity in which they signed",
      type: "select",
      required: true,
      section: "The signer",
      summary: true,
      options: [
        { value: "CITIZEN", label: "Citizen / member" },
        { value: "OFFICER", label: "Commissioned officer" },
        { value: "CONTRACTOR", label: "Contractor or vendor" },
        { value: "EMPLOYEE", label: "Employee" },
        { value: "CONGREGANT", label: "Congregant", help: "Attendance at worship is not consent to anything. Only a signature is." },
        { value: "VOLUNTEER", label: "Volunteer" },
        { value: "OTHER", label: "Other" },
      ],
      help: "Capacity governs which disputes the agreement can fairly reach and how closely a court will scrutinise the bargain. Employment and membership agreements draw the hardest look.",
    },
    {
      key: "signerIsMinor",
      label: "Signer was under eighteen",
      type: "boolean",
      section: "The signer",
      help: "A minor's contract is voidable by them, and they may disaffirm within a reasonable time after reaching majority. Do not rely on a minor's signature alone for anything that matters.",
    },
    {
      key: "guardianExecution",
      label: "Parent or guardian who also executed",
      type: "person",
      section: "The signer",
      help: "Required wherever the signer is a minor. Note also that a guardian cannot waive a child's own claims for personal injury in most circumstances, whatever the document says.",
    },

    {
      key: "instrumentType",
      label: "Type of instrument",
      type: "select",
      required: true,
      section: "The instrument",
      summary: true,
      options: [
        { value: "ARBITRATION", label: "Arbitration agreement", help: "The only instrument that makes a tribunal determination enforceable in a civil court." },
        { value: "ECCLESIASTICAL", label: "Consent to ecclesiastical jurisdiction", help: "Submits the signer to internal discipline and doctrine. Strongly protected from civil review, but it is not an arbitration agreement and confers no civil enforceability." },
        { value: "COVENANT", label: "Membership covenant" },
        { value: "EMPLOYMENT", label: "Employment agreement" },
        { value: "NDA", label: "Confidentiality agreement" },
        { value: "IP_ASSIGNMENT", label: "Intellectual property assignment", help: "Without one of these, work made by a volunteer or contractor stays theirs. Cross-reference the Intellectual Property Portfolio." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "instrumentTitle",
      label: "Title and version of the document signed",
      type: "text",
      section: "The instrument",
      placeholder: "Covenant of Membership, rev. 3 (2026-01)",
      help: "Version matters. When a signer disputes a clause, the Kingdom must be able to produce the exact text that was in front of them on the day.",
    },
    {
      key: "authorisingInstrument",
      label: "Instrument authorising this form",
      type: "recordRef",
      refRegistry: "instruments",
      section: "The instrument",
      help: "The ordinance or order that adopted this form of agreement and the rules it incorporates.",
    },
    {
      key: "scopeOfDisputes",
      label: "Scope of disputes covered",
      type: "textarea",
      required: true,
      section: "The instrument",
      help: "Quote the scope clause rather than paraphrasing it. This clause, and nothing else, defines what the tribunal may decide between these parties; a matter outside it produces an award a court will refuse to confirm.",
    },
    {
      key: "excludedMatters",
      label: "Matters expressly excluded",
      type: "textarea",
      section: "The instrument",
      help: "Criminal conduct, child protection and mandatory reporting, and any claim a signer cannot waive should appear here in the document itself. Their express exclusion strengthens the rest of the agreement.",
    },

    {
      key: "governingRules",
      label: "Governing rules of procedure",
      type: "text",
      section: "Terms",
      placeholder: "Rules of the Ecclesiastical Court, rev. 2 (AK-RUL-2025-001)",
      help: "Name the rule set and its version. An agreement pointing at rules that no longer exist invites the argument that the parties never agreed on a process at all.",
    },
    {
      key: "arbitratorSelection",
      label: "How the panel is selected",
      type: "textarea",
      section: "Terms",
      help: "A method that lets the Kingdom alone choose the decision-maker is the most commonly cited ground for finding an agreement one-sided. Give the signer a real part in selection or a right to strike.",
    },
    {
      key: "seat",
      label: "Seat and governing law",
      type: "jurisdiction",
      section: "Terms",
      placeholder: "Bridgeport, Connecticut",
      help: "Where the arbitration is held and whose law governs the agreement itself. Naming the Kingdom as the sole governing law leaves a court no framework in which to enforce it; name Connecticut or federal law for the agreement, and the Kingdom's law for the substance if desired.",
    },
    {
      key: "classWaiver",
      label: "Class or collective action waiver present",
      type: "boolean",
      section: "Terms",
      help: "Generally enforceable, but it draws scrutiny and must not be paired with cost terms that make individual proceedings unaffordable.",
    },
    {
      key: "costAllocation",
      label: "Allocation of fees and costs",
      type: "textarea",
      section: "Terms",
      help: "Costs the signer cannot bear are the quickest route to an unenforceable agreement. Where the Kingdom requires arbitration, the Kingdom should carry the forum's own costs.",
    },

    {
      key: "dateExecuted",
      label: "Date executed",
      type: "date",
      required: true,
      section: "Execution",
      summary: true,
      help: "The day the signature was made. Compare it against the date the dispute arose: an agreement signed afterward is a submission to arbitration of that one dispute, not a general consent, and is read narrowly.",
    },
    {
      key: "preDispute",
      label: "Executed before any dispute arose",
      type: "boolean",
      section: "Execution",
      help: "Pre-dispute agreements are what allow a tribunal to take a matter that has not happened yet. Post-dispute submissions are valid but cover only the matter named in them.",
    },
    {
      key: "signatureMethod",
      label: "Method of signature",
      type: "select",
      section: "Execution",
      options: [
        { value: "WET_INK", label: "Wet ink, original held" },
        { value: "ESIGN", label: "Electronic signature with audit trail", help: "Enforceable under the E-SIGN Act, provided the platform's certificate of completion is retained with the record." },
        { value: "CLICKWRAP", label: "Click-through acceptance", help: "The weakest form. Enforceable only where the terms were conspicuous and assent was unmistakable." },
        { value: "BROWSEWRAP", label: "Notice on a page or wall", help: "Not consent. Courts reject this routinely. Do not rely on it for anything." },
      ],
    },
    {
      key: "attestation",
      label: "Witnessed or notarised",
      type: "select",
      section: "Execution",
      options: [
        { value: "NEITHER", label: "Neither" },
        { value: "WITNESSED", label: "Witnessed" },
        { value: "NOTARISED", label: "Notarised" },
        { value: "BOTH", label: "Witnessed and notarised" },
      ],
      help: "Neither is required for validity, and both make a later denial of signature very hard to sustain. For anything the Kingdom expects to enforce, take the notarisation.",
    },
    {
      key: "counselOpportunity",
      label: "Opportunity to take advice",
      type: "select",
      section: "Execution",
      options: [
        { value: "OWN_COUNSEL", label: "Signer had their own lawyer" },
        { value: "ADVISED_IN_WRITING", label: "Advised in writing to seek a lawyer", help: "The practical standard. Put the advice in the document, above the signature line." },
        { value: "ADVISED_ORALLY", label: "Advised orally" },
        { value: "NONE", label: "No advice given", help: "Combined with a take-it-or-leave-it presentation, this is how agreements are found procedurally unconscionable." },
      ],
      help: "Record the period the signer had to consider the document in the notes. A same-day signature on a document first seen that morning is a fact an adversary will make much of.",
    },
    {
      key: "copyProvidedToSigner",
      label: "Executed copy delivered to the signer",
      type: "boolean",
      section: "Execution",
      help: "A signer who was never given a copy is a signer who can credibly say they did not know what they agreed to. Deliver it and note the date.",
    },

    {
      key: "originalCustody",
      label: "Where the wet-ink original is kept",
      type: "text",
      section: "Custody and currency",
      help: "The physical location, specifically enough that someone else could retrieve it. This is the field the whole register exists to hold.",
    },
    {
      key: "reaffirmedDate",
      label: "Date last reaffirmed",
      type: "date",
      section: "Custody and currency",
      help: "Where rules, forums, or officers have changed materially since signature, take a fresh signature rather than argue that the old one still reaches the new arrangement.",
    },
    {
      key: "revocationDate",
      label: "Date revoked or withdrawn",
      type: "date",
      section: "Custody and currency",
      help: "Revocation operates prospectively. Matters already submitted before this date ordinarily remain within the tribunal's competence; new ones do not.",
    },
    {
      key: "revocationBasis",
      label: "Basis of revocation",
      type: "textarea",
      section: "Custody and currency",
      help: "Whether the signer withdrew, the Kingdom released them, membership ended, or a court held the agreement unenforceable. If a court, cite the case.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Custody and currency",
      classification: "SEALED",
      help: "Circumstances of signature, time allowed for review, questions the signer raised, and any defect that should keep this instrument from being relied upon.",
    },
  ],

  deadlineRules: [
    {
      id: "cons-deposit-original",
      title: "Executed original not yet located in the register",
      fromField: "dateExecuted",
      offsetDays: 21,
      severity: "HIGH",
      detail:
        "Record where the signed original is held. An agreement whose original cannot be produced is the one an opposing party will deny signing, and the Kingdom then litigates authenticity before it reaches the merits.",
      when: (data) => !data.originalCustody,
    },
    {
      id: "cons-triennial-review",
      title: "Triennial review of the consent",
      fromField: "dateExecuted",
      offsetDays: 1095,
      severity: "ROUTINE",
      detail:
        "Institutional practice, not a statutory requirement. Confirm the signer is still in the capacity recorded, that the named rules and forum still exist under those names, and that no intervening amendment has moved the agreement out from under them. Take a fresh signature where anything material has changed.",
      when: (data) => !data.revocationDate,
    },
  ],
};

export default consents;
