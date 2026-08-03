import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Instruments and Enactments.
 *
 * The Kingdom's body of law in one place: the Charter, its amendments, and every
 * decree, order, ordinance, resolution, proclamation, commission, and delegation
 * issued under it. An institution that cannot produce, on demand, the instrument
 * that authorised an act does not have a government; it has a habit. The three
 * date fields are separated deliberately — see the guidance.
 */

const instruments: RegistryDef = {
  slug: "instruments",
  title: "Register of Instruments and Enactments",
  shortTitle: "Instruments",
  recordLabel: "Instrument",
  recordLabelPlural: "Instruments",
  group: "governance",
  numberPrefix: "INST",
  order: 1,
  authority: "Charter Art. IV (Powers); Art. VIII (Amendments & Interpretation)",
  description:
    "The Charter and every instrument promulgated under it, with the dates, attestations, and citations on which their authority rests.",
  guidance: `This register holds the Kingdom's enacted law. Nothing here creates an instrument; each entry records one that exists on paper, over a signature, in a place the Registrar can name.

**Three dates, and they are not the same date.** *Executed* is the day the signature went onto the page. *Effective* is the day from which the instrument operates. *Promulgated* is the day it was published so that those bound by it could learn of it. They coincide often and diverge exactly when something turns on them — an officer disciplined under an ordinance that was not promulgated until after the conduct has a complete answer, and so does a member charged under a rule effective from a later day. Fill in all three even where they are identical. A blank field reads, months later, as an admission that nobody knew.

**Retroactivity is recorded, never simulated.** The Charter was executed 29 May 2025 and declares itself effective *nunc pro tunc* to 30 October 2010. Enter it exactly that way: date executed 2025-05-29, date effective 2010-10-30, retroactive effect checked, basis stated in words. An openly declared intention that an arrangement be treated as dating from an earlier day is ordinary and defensible; parties do it in contracts and courts do it in orders. A document *presented* as though it had been signed in 2010 is a different thing entirely, and the cross-examination is one sentence long — the notarial seal bears a 2025 commission. That answer destroys the witness, and with the witness everything else the file was assembled to prove. Candour costs nothing here and buys the credibility of the whole register.

**Citation designations.** Adopt one form and never vary it — AK-DEC-2025-004, AK-ORD-2026-001 — and cite instruments by that designation in every later document. An institution that quotes itself the same way across a decade looks like an institution. One that renumbers as it goes looks like a project.

**Amendment.** Art. VIII rests the power to amend in the Founder, exercised in writing. Practice does not amend the Charter, consensus does not amend it, and an entry in this register does not amend it. Where an instrument amends or repeals an earlier one, link the earlier record so the chain of authority reads in both directions without a narrator.

**Reach.** These instruments govern the Kingdom's internal affairs and bind those who have accepted them — officers under commission, members under covenant, counterparties under contract. They do not bind strangers, and an instrument drafted as a direction to an outside person or agency has no force while inviting the reading that the Kingdom is issuing process. Keep this register unambiguously internal. Obligations from outsiders are secured the ordinary way: by contract.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "DRAFT",
  titleField: "instrumentTitle",
  listColumns: ["instrumentType", "citationDesignation", "dateExecuted", "dateEffective"],

  statuses: [
    { value: "DRAFT", label: "Draft", tone: "neutral", help: "Prepared but not executed. Carries no authority and must not be cited." },
    { value: "EXECUTED", label: "Executed, not yet effective", tone: "active", help: "Signed, with an effective date still in the future." },
    { value: "IN_FORCE", label: "In force", tone: "success" },
    { value: "SUSPENDED", label: "Suspended", tone: "warning", help: "Operation stayed by a later instrument. Record the instrument that stayed it." },
    { value: "REPEALED", label: "Repealed", tone: "danger" },
    { value: "EXPIRED", label: "Expired by its own terms", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "instrumentTitle",
      label: "Title of the instrument",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "The title borne on the face of the document itself, word for word. Do not improve it here.",
    },
    {
      key: "instrumentType",
      label: "Type of instrument",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      options: [
        { value: "CHARTER", label: "Charter", help: "The constituting instrument. There is one." },
        { value: "CHARTER_AMENDMENT", label: "Amendment to the Charter", help: "Under Art. VIII, executed in writing by the Founder." },
        { value: "DECREE", label: "Decree" },
        { value: "EDICT", label: "Edict" },
        { value: "EXECUTIVE_ORDER", label: "Executive order" },
        { value: "ORDINANCE", label: "Ordinance", help: "General internal legislation binding members who have accepted it." },
        { value: "RESOLUTION", label: "Resolution" },
        { value: "PROCLAMATION", label: "Proclamation", help: "Declaratory and ceremonial. Confers no obligation on its own." },
        { value: "COMMISSION", label: "Commission to office" },
        { value: "DELEGATION", label: "Delegation of authority" },
        { value: "RULES", label: "Rules or procedure adopted" },
        { value: "OTHER", label: "Other instrument" },
      ],
    },
    {
      key: "citationDesignation",
      label: "Citation designation",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      placeholder: "AK-ORD-2026-001",
      help: "The short form by which this instrument will be cited in every later document, forever. Follow the house pattern exactly.",
    },
    {
      key: "subjectMatter",
      label: "Subject",
      type: "textarea",
      section: "Identification",
      help: "One or two sentences a reader can use to decide whether this is the instrument they are looking for, without opening the text.",
    },

    {
      key: "promulgatingAuthority",
      label: "Promulgated by",
      type: "person",
      required: true,
      section: "Authority",
      help: "The individual who signed. Named as a person, not as an institution, because it is a person whose authority will be examined.",
    },
    {
      key: "promulgatingOffice",
      label: "Office held when acting",
      type: "text",
      section: "Authority",
      help: "The office under which the signature was made. If the signer held the office under a commission, cite that commission's designation.",
    },
    {
      key: "charterArticle",
      label: "Charter article relied upon",
      type: "text",
      section: "Authority",
      placeholder: "Art. IV Sec. 3",
      help: "The provision that authorises this instrument. An instrument with no traceable source of authority is the first thing an adversary attacks and the easiest to lose.",
    },

    {
      key: "dateExecuted",
      label: "Date executed",
      type: "date",
      required: true,
      section: "Dates",
      summary: true,
      help: "The calendar day the signature was actually placed on the document. This is a fact about the physical world and is never adjusted to suit an effective date.",
    },
    {
      key: "dateEffective",
      label: "Date effective",
      type: "date",
      section: "Dates",
      summary: true,
      help: "The day from which the instrument operates. May precede execution only where retroactive effect is expressly declared below.",
    },
    {
      key: "datePromulgated",
      label: "Date promulgated",
      type: "date",
      section: "Dates",
      help: "The day the instrument was published to those it binds. Enforcement against conduct occurring before this day is difficult to defend and should not be attempted.",
    },
    {
      key: "retroactiveEffect",
      label: "Declared effective retroactively",
      type: "boolean",
      section: "Dates",
      help: "Check where the instrument declares an effective date earlier than its execution. Openly declared retroactivity is ordinary; a document held out as contemporaneous when it is not is fatal.",
    },
    {
      key: "retroactiveBasis",
      label: "Basis stated for retroactive effect",
      type: "textarea",
      section: "Dates",
      help: "In the instrument's own words, why the earlier date is claimed. Reciting the intent that has existed since that day is defensible; asserting the document itself existed then is not.",
    },

    {
      key: "attestation",
      label: "Attestation",
      type: "select",
      section: "Execution and attestation",
      options: [
        { value: "NONE", label: "Signature alone" },
        { value: "WITNESSED", label: "Witnessed" },
        { value: "NOTARISED", label: "Notarised" },
        { value: "BOTH", label: "Witnessed and notarised" },
      ],
      help: "A notary attests that a known person signed on a stated day. It says nothing about whether the contents are lawful or true — a distinction worth keeping straight when describing the Charter to outsiders.",
    },
    {
      key: "notaryName",
      label: "Notary and commission",
      type: "text",
      section: "Execution and attestation",
      help: "Name, commission number, and expiry. A notarisation taken after a commission lapsed is worth nothing and is trivially checked against the Secretary of the State's register.",
    },
    {
      key: "witnesses",
      label: "Witnesses",
      type: "textarea",
      section: "Execution and attestation",
      help: "Full names, one per line. Witnesses are the people who can testify to execution if the notarisation is ever attacked, so record who they are while anyone remembers.",
    },
    {
      key: "sealAffixed",
      label: "Seal of the Kingdom affixed",
      type: "boolean",
      section: "Execution and attestation",
    },
    {
      key: "originalCustody",
      label: "Location of the executed original",
      type: "text",
      section: "Execution and attestation",
      help: "The physical place the wet-ink original is kept. A register that cannot say where the original is has recorded a rumour.",
    },

    {
      key: "operativeText",
      label: "Operative text",
      type: "richtext",
      section: "Text and effect",
      help: "The instrument's text verbatim, including recitals. Transcribe rather than summarise: what the instrument says is the whole of what it does.",
    },
    {
      key: "bindingScope",
      label: "Whom it binds",
      type: "multiselect",
      section: "Text and effect",
      options: [
        { value: "SOVEREIGN", label: "The Sovereign" },
        { value: "OFFICERS", label: "Commissioned officers" },
        { value: "MEMBERS_COVENANT", label: "Members who have executed a covenant", help: "Reaches only those with a signed instrument on file in the Register of Consents." },
        { value: "CONTRACTORS", label: "Contractors and counterparties by contract" },
        { value: "INTERNAL_ADMIN", label: "Internal administration only" },
        { value: "DECLARATORY", label: "Declaratory — binds no one", help: "Proclamations, commemorations, and statements of position." },
      ],
      help: "The honest answer here governs how the instrument may be used. Nothing in this register reaches a person who has not accepted it.",
    },

    {
      key: "amendsInstrument",
      label: "Amends",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Relationship and publication",
      help: "The earlier instrument this one alters. Link it so the amended text can be reconstructed as it stood on any given day.",
    },
    {
      key: "repealsInstrument",
      label: "Repeals",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Relationship and publication",
      help: "The earlier instrument this one withdraws. Repeal is prospective unless the instrument says otherwise; acts done under the repealed instrument stand.",
    },
    {
      key: "relationshipNote",
      label: "Note on effect upon other instruments",
      type: "textarea",
      section: "Relationship and publication",
      help: "Which sections are struck, replaced, or left standing. Vague repealing clauses produce disputes about the Kingdom's own law that nobody outside caused.",
    },
    {
      key: "gazetteReference",
      label: "Gazette reference",
      type: "text",
      section: "Relationship and publication",
      placeholder: "Gazette Vol. II, No. 4, p. 11",
      help: "Where the instrument was published. Publication is what makes internal law knowable, and knowability is what makes enforcement of it fair.",
    },
    {
      key: "gazettePublicationDate",
      label: "Date published in the Gazette",
      type: "date",
      section: "Relationship and publication",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Relationship and publication",
      classification: "OFFICERS",
      help: "Drafting history, defects noticed, and anything a successor Registrar would otherwise have to rediscover.",
    },
  ],

  deadlineRules: [
    {
      id: "inst-deposit-original",
      title: "Executed original not yet deposited",
      fromField: "dateExecuted",
      offsetDays: 14,
      severity: "ROUTINE",
      detail:
        "Record where the wet-ink original is held. Originals go missing in the first month or not at all, and an instrument whose original cannot be produced is an instrument an adversary will invite the Kingdom to prove.",
      when: (data) => !data.originalCustody,
    },
    {
      id: "inst-gazette-publication",
      title: "Instrument not yet published in the Gazette",
      fromField: "dateExecuted",
      offsetDays: 30,
      severity: "ROUTINE",
      detail:
        "Internal practice, not a statutory duty. An instrument enforced against a member who had no means of learning it exists is the kind of internal discipline that looks arbitrary when described to anyone outside.",
      when: (data) => !data.gazetteReference,
    },
    {
      id: "inst-takes-effect",
      title: "Instrument takes effect within the week",
      fromField: "dateEffective",
      offsetDays: -7,
      severity: "ROUTINE",
      detail:
        "Confirm promulgation is complete, officers affected have been notified, and any instrument this one amends or repeals has been marked accordingly.",
    },
  ],
};

export default instruments;
