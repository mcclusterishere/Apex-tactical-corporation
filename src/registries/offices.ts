import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Offices and Commissions.
 *
 * Offices are kept public because an office nobody outside can verify is an
 * office that cannot be relied on, and because apparent authority binds the
 * Kingdom whether or not it wants to be bound. Every commission here must state
 * its express limits, and any office concerned with good order must state its
 * actual lawful basis — private property rights or a ch. 534 licence, never a
 * police power.
 */

const offices: RegistryDef = {
  slug: "offices",
  title: "Register of Offices and Commissions",
  shortTitle: "Offices",
  recordLabel: "Commission",
  recordLabelPlural: "Commissions",
  group: "people",
  numberPrefix: "OFC",
  order: 2,
  authority: "Charter Art. IV §3 (Powers); Art. VII (Leadership & Succession)",
  description:
    "Who holds which office, under what commission, with what powers, subject to what express limits, and from what date to what date.",
  guidance: `This register answers the question every dispute eventually turns on: who held what authority, on what date, within what limits.

**Apparent authority is why this matters to outsiders.** A principal is bound by the acts of someone a third party reasonably believed was authorised, where that belief is traceable to the principal's own conduct — the title conferred, the letterhead, the business card, the pattern of prior dealings — even where the internal rules said otherwise (Restatement (Third) of Agency §§ 2.03, 3.03, 3.11). Two things follow. First, do not confer a grand title on anyone the Kingdom is not prepared to be bound by. Second, **a revocation recorded here but never communicated outward does not end apparent authority.** When a commission ends, record it AND write to every bank, vendor, landlord, agency, insurer, and counterparty who dealt with that person, then record the date the notice went out. The register tracks that date because it is the date the exposure actually closes.

**Express limits protect the corpus.** The Kingdom holds property as an unincorporated charitable trust, for beneficiaries. Monetary caps and subject-matter exclusions on signature authority are what keep one officer from encumbering assets held for others. A commission reading "full authority" is a statement that the trust corpus rides on one person's judgment. Put a dollar ceiling on it. State what is excluded outright — real property, borrowing, litigation, tax filings, anything under seal — and require a countersignature above the line.

**Appointment and removal.** Charter Art. VII vests appointment and removal in the Founder at sole discretion. That is internal polity, and civil courts abstain from reviewing a religious body's choice of its own officers and ministers (*Watson v. Jones*, 80 U.S. 679 (1871); *Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976)). What a court will examine is the record: whether a particular act was authorised when it was done. That record is this register.

**Marshals, constables, and security.** Charter Art. IV §5 contemplates officers for good order. Record the lawful basis precisely, because there are exactly two, and neither is a police power. (1) A property owner and its agents may exclude and remove trespassers from the Kingdom's own premises — a private right, exercisable on the Kingdom's land, over no one anywhere else. (2) A person engaged to guard persons or property must be licensed under Conn. Gen. Stat. ch. 534, and a licensed security officer is still a private person.

There is no third option. Holding a private officer out as a peace officer — a badge, a uniform resembling police, anything styled a warrant, a detention off Kingdom land, a vehicle stop — is criminal impersonation under Conn. Gen. Stat. §§ 53a-130 and 53a-130a, and it converts a lawful institution into a prosecution of its leadership. This register forces the basis to be stated so that the line can never be blurred by accident.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "NOMINATED",
  titleField: "officeTitle",
  listColumns: ["holder", "officeType", "dateCommissioned", "signatureAuthority"],

  statuses: [
    { value: "NOMINATED", label: "Nominated", tone: "neutral", help: "Selected but not yet commissioned. No authority of any kind attaches." },
    { value: "COMMISSIONED", label: "Commissioned", tone: "success", help: "In office and exercising the powers recorded below." },
    { value: "SUSPENDED", label: "Suspended", tone: "warning", help: "Powers held in abeyance. Outsiders must be told, or apparent authority survives the suspension." },
    { value: "EXPIRED", label: "Term expired", tone: "warning", help: "The term ran out. Acts after expiry may still bind the Kingdom until outward notice is given." },
    { value: "RESIGNED", label: "Resigned", tone: "neutral" },
    { value: "REVOKED", label: "Revoked", tone: "danger", help: "Withdrawn by the Sovereign under Charter Art. VII. Outward notice is mandatory and time-critical." },
    { value: "VACANT", label: "Vacant", tone: "neutral", help: "The office exists; no one holds it." },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "officeTitle",
      label: "Title of the office",
      type: "text",
      required: true,
      summary: true,
      section: "The office",
      help: "The exact style used on commissions and correspondence. Choose it carefully: an outsider's reasonable reading of the title is itself a source of authority the Kingdom will be held to.",
      placeholder: "e.g. Registrar General; Clerk of the Register",
    },
    {
      key: "officeType",
      label: "Character of the office",
      type: "select",
      required: true,
      summary: true,
      section: "The office",
      options: [
        { value: "EXECUTIVE", label: "Executive / governing" },
        { value: "REGISTRAR", label: "Records and registry" },
        { value: "COUNSEL", label: "Legal and rights enforcement" },
        { value: "TREASURY", label: "Treasury and stewardship" },
        { value: "MINISTERIAL", label: "Ministerial / ecclesiastical", help: "Cross-reference the Register of Ordinations. The ministerial exception turns on function, not on this label alone." },
        { value: "TRIBUNAL", label: "Tribunal or adjudicative", help: "Binding only over members who signed a pre-dispute arbitration agreement. Over anyone else it decides nothing." },
        { value: "GOOD_ORDER", label: "Good order, security, or marshal", help: "Requires an entry in the lawful basis field below. Read the guidance before commissioning one of these." },
        { value: "ADMINISTRATIVE", label: "Administrative or clerical" },
        { value: "HONORARY", label: "Honorary", help: "Carries no powers. Say so expressly in the limits field so no one infers otherwise." },
      ],
    },
    {
      key: "holder",
      label: "Holder of the office",
      type: "person",
      required: true,
      summary: true,
      section: "The office",
      help: "The individual, by full legal name. Cross-reference their enrolment. One record per holder per term: when the holder changes, supersede rather than overwrite, so the register still shows who held it in any past month.",
    },
    {
      key: "mandate",
      label: "Mandate of the office",
      type: "textarea",
      section: "The office",
      help: "What this office exists to do, in plain terms. Read alongside the powers field: the mandate explains the office to outsiders, the powers field is what actually authorises acts.",
    },

    {
      key: "commissioningInstrument",
      label: "Commissioning instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Commission",
      help: "The executed commission itself. Without it, the office rests on assertion, and the first question in any dispute about an officer's act is what document conferred the authority.",
    },
    {
      key: "dateCommissioned",
      label: "Date commissioned",
      type: "date",
      required: true,
      summary: true,
      section: "Commission",
      help: "The date authority actually began. Acts before this date were not authorised, whatever was intended.",
    },
    {
      key: "oathDate",
      label: "Date of oath",
      type: "date",
      section: "Commission",
      help: "When the holder swore or affirmed. Kept separately because a commission may issue before the oath is taken, and the register should show the gap rather than hide it.",
    },
    {
      key: "termType",
      label: "Tenure",
      type: "select",
      section: "Commission",
      options: [
        { value: "AT_PLEASURE", label: "At the pleasure of the Sovereign", help: "Charter Art. VII default. Revocable at any time without cause or notice to the holder — but outward notice to third parties is still required." },
        { value: "FIXED_TERM", label: "Fixed term", help: "Enter the end date. An expired commission that nobody noticed is a common source of unauthorised acts." },
        { value: "TASK_LIMITED", label: "Limited to a specific matter or task" },
        { value: "FOR_LIFE", label: "For life or until resignation" },
      ],
    },
    {
      key: "termEndDate",
      label: "Term ends",
      type: "date",
      section: "Commission",
      help: "The date the commission lapses of its own force. Leave blank for tenure at pleasure.",
    },
    {
      key: "bonded",
      label: "Holder is bonded",
      type: "boolean",
      section: "Commission",
      help: "A fidelity bond covering loss from dishonesty by this officer. Any officer with access to funds, the seal, or member data should be bonded; it is inexpensive and it is the first thing a serious donor or insurer asks about.",
    },
    {
      key: "bondAmount",
      label: "Bond amount",
      type: "money",
      section: "Commission",
      classification: "OFFICERS",
      help: "Set against the maximum the officer could plausibly reach, not against what the Kingdom currently holds.",
    },

    {
      key: "powersDelegated",
      label: "Powers delegated",
      type: "textarea",
      required: true,
      section: "Powers and limits",
      help: "Enumerate them. A commission that delegates by adjective rather than by list gets read broadly by a court and narrowly by the officer, which is the worst of both.",
    },
    {
      key: "expressLimits",
      label: "Express limits on the delegation",
      type: "textarea",
      required: true,
      section: "Powers and limits",
      help: "What this officer may NOT do, stated affirmatively: no real property, no borrowing, no litigation, no use of the seal, no commitment beyond the stated ceiling, no representation to outsiders about the Kingdom's legal status. This paragraph is what protects the trust corpus, and it is what the Kingdom points to when disclaiming an act it did not authorise.",
    },
    {
      key: "signatureAuthority",
      label: "Signature authority",
      type: "select",
      summary: true,
      section: "Powers and limits",
      options: [
        { value: "NONE", label: "None — may not sign for the Kingdom" },
        { value: "WITHIN_LIMIT", label: "Sole signature up to the stated limit" },
        { value: "COUNTERSIGNED", label: "Only with a countersignature" },
        { value: "UNLIMITED", label: "Unlimited", help: "Reserve this to the Sovereign. Anything else exposes assets held for beneficiaries to one person's judgment." },
      ],
    },
    {
      key: "signatureLimitAmount",
      label: "Monetary limit on signature authority",
      type: "money",
      section: "Powers and limits",
      help: "The ceiling in dollars, per transaction. State it in the commission itself as well as here, because a limit an outsider could not have known about does not defeat their reasonable belief that the officer was authorised.",
    },
    {
      key: "mayBindInContract",
      label: "May bind the Kingdom in contract",
      type: "boolean",
      section: "Powers and limits",
      help: "Distinct from signature authority: a person may be authorised to sign routine correspondence and still have no power to create an obligation. If unchecked, say so expressly in the limits paragraph, because silence looks like permission to a counterparty.",
    },
    {
      key: "lawfulBasisGoodOrder",
      label: "Lawful basis for any good-order, marshal, or security function",
      type: "select",
      section: "Powers and limits",
      help: "Mandatory for any office of that character. There are two lawful bases and no third. Recording this is what keeps a legitimate role from drifting into criminal impersonation.",
      options: [
        { value: "NOT_APPLICABLE", label: "Not applicable — no security or good-order function" },
        { value: "OWNER_AGENT", label: "Agent of the property owner on the Kingdom's own premises", help: "Exercises the owner's ordinary rights to admit, exclude, and ask a trespasser to leave. No authority over anyone off the property. No detention, no search, no stop, no citation." },
        { value: "LICENSED_CH534", label: "Licensed security officer under Conn. Gen. Stat. ch. 534", help: "Record the licence number and expiry. A licensed security officer remains a private person with no police powers." },
        { value: "ECCLESIASTICAL_ONLY", label: "Ecclesiastical order and decorum among consenting members only", help: "Internal discipline within the assembly. Persuasion and exclusion from the assembly; nothing more, and nothing directed at outsiders." },
      ],
    },
    {
      key: "securityLicenceDetail",
      label: "Security licence particulars",
      type: "text",
      section: "Powers and limits",
      help: "Licence number, issuing authority, and expiry, where the basis above is a ch. 534 licence. Blank here with a licensed basis selected means the basis is unproven.",
    },

    {
      key: "revocationDate",
      label: "Date of revocation, resignation, or expiry",
      type: "date",
      section: "Revocation and succession",
      help: "The date internal authority ended. Note that this is not the date the Kingdom's exposure ended — that is the outward notice date below.",
    },
    {
      key: "revocationInstrument",
      label: "Instrument of revocation",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Revocation and succession",
      help: "The written act ending the commission, or the resignation letter received. Under Charter Art. VII no cause need be stated; a date and a signature are enough.",
    },
    {
      key: "outwardNoticeGiven",
      label: "Outward notice of revocation has been given",
      type: "boolean",
      section: "Revocation and succession",
      help: "Written notice to every bank, vendor, landlord, agency, insurer, and counterparty that dealt with this officer, plus removal from the public register and from any website or letterhead. Until this is done, a third party who reasonably believes the officer still acts for the Kingdom can bind it.",
    },
    {
      key: "outwardNoticeDate",
      label: "Date outward notice was sent",
      type: "date",
      section: "Revocation and succession",
      help: "The date the notices went into the mail or were sent. Keep the distribution list and the copies in the Evidence Vault; this is the date the Kingdom will need to prove.",
    },
    {
      key: "successor",
      label: "Successor",
      type: "person",
      section: "Revocation and succession",
      help: "Who now holds the office, so the register never shows an unexplained gap. Where the office is left vacant, say so and set the status to vacant rather than leaving this blank.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Revocation and succession",
      classification: "OFFICERS",
      help: "Not public. Anything concerning the holder's conduct or fitness belongs in a sealed record, not here.",
    },
  ],

  deadlineRules: [
    {
      id: "ofc-revocation-notice",
      title: "Outward notice of revocation is overdue — apparent authority is still running",
      fromField: "revocationDate",
      offsetDays: 3,
      severity: "CRITICAL",
      authority: "Restatement (Third) of Agency §§ 2.03, 3.11",
      detail:
        "Internal authority ended, but until third parties who dealt with this officer are told, they may still reasonably believe the officer acts for the Kingdom, and their transactions can bind it. Send written notice to every bank, vendor, landlord, agency, insurer, and counterparty on the list; remove the holder from the public register, website, and letterhead; recover keys, cards, seals, and credentials. Record the date the notices went out.",
      when: (data) => data.outwardNoticeGiven !== true,
    },
    {
      id: "ofc-term-expiry",
      title: "Commission expires",
      fromField: "termEndDate",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Thirty days to the end of this term. Recommission by written instrument, or let it lapse and give outward notice. An officer who keeps acting after expiry is a common and entirely avoidable source of unauthorised acts, and the Kingdom may be bound by them anyway.",
    },
    {
      id: "ofc-annual-review",
      title: "Annual review of the commission",
      fromField: "dateCommissioned",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Kingdom practice, not statute: confirm the holder is still in office, the powers and limits still match what they actually do, the monetary ceiling is still appropriate, and the bond is in force. Commissions drift; the register should catch the drift once a year.",
    },
    {
      id: "ofc-bond-renewal",
      title: "Confirm the fidelity bond is still in force",
      fromField: "dateCommissioned",
      offsetDays: 335,
      severity: "ROUTINE",
      detail:
        "Bonds lapse quietly. Obtain written confirmation from the surety, check the amount against what this officer can now reach, and file the certificate.",
      when: (data) => data.bonded === true,
    },
  ],
};

export default offices;
