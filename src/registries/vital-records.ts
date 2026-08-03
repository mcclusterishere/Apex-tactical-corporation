import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Vital and Sacramental Records.
 *
 * A parish register in the old sense: the Kingdom's own book of rites performed,
 * by whom, before whom, on what date. It proves the rite. It is not a civil vital
 * record and cannot be made into one, so every entry carries the civil filing
 * cross-reference — the field that keeps a member from discovering years later
 * that the state has no record of their marriage.
 */

const vitalRecords: RegistryDef = {
  slug: "vital-records",
  title: "Register of Vital and Sacramental Records",
  shortTitle: "Vital & Sacramental",
  recordLabel: "Rite",
  recordLabelPlural: "Rites",
  group: "people",
  numberPrefix: "VIT",
  order: 3,
  authority: "Charter Art. I §2 (Ecclesiastical Body); Art. IV §4 (Rites and Ordinances)",
  description:
    "Births, namings, baptisms, confirmations, marriages solemnised, blessings, deaths, and burials, with the civil filing each one does or does not have behind it.",
  guidance: `This is an **ecclesiastical** register. It is the Kingdom's own book of what was done in its assemblies and by its ministers, kept in the tradition of parish registers that predate civil registration by centuries. It is genuine and it is valuable: it proves that a rite was performed, on a date, before named witnesses, by a named officiant. It is not, and cannot be made into, a civil vital record. Say the rest once, plainly, and then keep the book well.

**Marriage.** In Connecticut an ordained or licensed member of the clergy may solemnise a marriage (Conn. Gen. Stat. § 46b-22). Authority to solemnise is not authority to create a marriage. A valid Connecticut marriage also requires a **marriage licence issued by the registrar of vital statistics of the town where the ceremony takes place**, obtained before the ceremony, and the officiant must then complete that licence and return it to that registrar (Conn. Gen. Stat. §§ 46b-24, 46b-25, 46b-34). A licence is void if the marriage is not solemnised within the statutory period printed on it. No licence, no marriage — however sincere the rite and however complete this entry. The couple find out years later, at the worst moment: an intestate estate passing to someone else, a denied spousal insurance claim or survivor benefit, an immigration petition refused, a custody or support case in which they are legal strangers to each other. The officiant who let it happen carries that. Confirm the licence in hand before the rite, and return it the same week.

**Births and deaths.** Both must be registered with the state. A birth is registered with the registrar of the town where it occurred; a naming or baptism entry here is not a birth certificate and will not obtain a passport, enrol a child in school, or establish parentage. A death must be certified and registered, and a burial or removal permit obtained before final disposition (Conn. Gen. Stat. §§ 7-48, 7-62b, 7-65). No interment proceeds on a church record alone.

**How to keep it.** Enter the rite the day it is performed. Name the officiant and cross-reference their credential in the Register of Ordinations, so the entry proves the officiant was competent to act. Name witnesses in full — a witness who cannot be found is a witness who cannot testify. Where the event has a civil counterpart, record whether the filing was made, by whom, and its file number. That cross-reference is what makes this register useful to a member decades later instead of a source of false comfort.

**Corrections.** Never erase. Enter a corrected record and supersede the original, so the book shows both what was recorded and what was later found. A register that can be silently rewritten proves nothing.

**Privacy.** Classified MEMBERS. Entries touching minors, adoption, illegitimacy, or family circumstance should be raised to SEALED, and nothing here is published without the principals' written consent.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "RECORDED",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "CLERK"],
  titleField: "principalOne",
  listColumns: ["eventType", "eventDate", "officiant", "filedWithCivilAuthority"],

  statuses: [
    { value: "SCHEDULED", label: "Scheduled", tone: "neutral", help: "The rite is arranged but not yet performed. For a marriage, this is when the licence must be confirmed." },
    { value: "RECORDED", label: "Recorded", tone: "active", help: "The rite was performed and entered. Civil filing, where required, is still outstanding." },
    { value: "CIVIL_PENDING", label: "Civil filing outstanding", tone: "warning", help: "A required state registration has not yet been confirmed. This is the status that must not be allowed to sit." },
    { value: "CIVIL_CONFIRMED", label: "Civil filing confirmed", tone: "success", help: "The state record exists and its file number is recorded here." },
    { value: "ECCLESIASTICAL_ONLY", label: "Ecclesiastical only — no civil effect", tone: "neutral", help: "A blessing, dedication, or memorial with no civil counterpart. Correct and complete as it stands." },
    { value: "CORRECTED", label: "Corrected", tone: "neutral" },
    { value: "DISPUTED", label: "Disputed", tone: "warning", help: "A principal or family member contests the entry. Record the dispute; do not alter the original." },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "eventType",
      label: "Rite or event",
      type: "select",
      required: true,
      summary: true,
      section: "The event",
      options: [
        { value: "BIRTH", label: "Birth recorded", help: "An ecclesiastical note of a birth in the community. The civil registration is separate and mandatory." },
        { value: "NAMING", label: "Naming or dedication" },
        { value: "BAPTISM", label: "Baptism" },
        { value: "CONFIRMATION", label: "Confirmation or profession of faith" },
        { value: "MARRIAGE", label: "Marriage solemnised", help: "Requires a state marriage licence obtained before the ceremony and returned after it. Read the guidance." },
        { value: "COVENANT_BLESSING", label: "Blessing of a covenant or union", help: "A rite with no civil effect. Use this, not 'marriage', where there is no licence — and tell the couple plainly which one they are receiving." },
        { value: "BLESSING", label: "Blessing of a person, home, or work" },
        { value: "DEATH", label: "Death recorded" },
        { value: "FUNERAL", label: "Funeral or memorial service" },
        { value: "BURIAL", label: "Burial or interment", help: "Requires a burial, removal, or transit permit issued by civil authority before disposition." },
      ],
    },
    {
      key: "principalOne",
      label: "Principal",
      type: "person",
      required: true,
      summary: true,
      section: "The event",
      help: "The person the rite concerns, by full legal name as it appears on identification. For a marriage, the first party. A name entered informally here will not match the civil record it is meant to correspond to.",
    },
    {
      key: "principalTwo",
      label: "Second principal",
      type: "person",
      section: "The event",
      help: "For a marriage or a blessing of a union, the second party. Leave blank otherwise.",
    },
    {
      key: "eventDate",
      label: "Date of the rite",
      type: "date",
      required: true,
      summary: true,
      section: "The event",
      help: "The day it was actually performed. For a marriage this is the date of solemnisation, which is the date the marriage takes effect once the licence is returned — not the licence date and not the reception.",
    },
    {
      key: "eventPlace",
      label: "Place",
      type: "text",
      required: true,
      section: "The event",
      help: "Building, street, town, and state. For a marriage the town matters legally: the licence must have been issued by the registrar of the town where the ceremony occurs, and it is returned to that same registrar.",
    },
    {
      key: "congregation",
      label: "Congregation or assembly",
      type: "text",
      section: "The event",
      help: "The body under whose auspices the rite was performed. Relevant where the Kingdom acts alongside an affiliated church rather than in its own right.",
    },

    {
      key: "officiant",
      label: "Officiant",
      type: "person",
      required: true,
      summary: true,
      section: "Officiant and witnesses",
      help: "The person who actually performed the rite, by full legal name. For a marriage, this is the person whose competence to solemnise can be challenged later, so the name must be exact.",
    },
    {
      key: "officiantCredential",
      label: "Officiant's credential",
      type: "recordRef",
      refRegistry: "ordinations",
      section: "Officiant and witnesses",
      help: "Cross-reference to the Register of Ordinations, which is what evidences that the officiant was ordained or licensed and in good standing on the date of the rite. Confirm standing before the rite, not after.",
    },
    {
      key: "witnessOne",
      label: "First witness",
      type: "person",
      section: "Officiant and witnesses",
      help: "Full legal name and a means of contact kept with the record. A witness who cannot be located is of no use in the proceeding where a witness is finally needed.",
    },
    {
      key: "witnessTwo",
      label: "Second witness",
      type: "person",
      section: "Officiant and witnesses",
    },
    {
      key: "registerFolio",
      label: "Folio in the physical register",
      type: "text",
      section: "Officiant and witnesses",
      help: "Book, page, and line in the bound paper register, where one is kept. The paper book and this ledger should each be able to find the other.",
    },

    {
      key: "civilFilingRequired",
      label: "Civil registration required",
      type: "select",
      section: "Civil registration",
      help: "Decide this at the time of entry, not later. Getting it wrong in the direction of 'not required' is the error that harms people.",
      options: [
        { value: "REQUIRED", label: "Required by law", help: "Births, deaths, burials, and marriages. State registration is mandatory and this entry does not substitute for it." },
        { value: "NOT_APPLICABLE", label: "No civil counterpart", help: "Baptisms, confirmations, blessings, dedications, memorials. Nothing to file." },
        { value: "UNKNOWN", label: "Not yet determined", help: "Resolve it before the record leaves this status. An unresolved filing question is how a marriage ends up unregistered." },
      ],
    },
    {
      key: "filedWithCivilAuthority",
      label: "Filed with civil authority",
      type: "boolean",
      summary: true,
      section: "Civil registration",
      help: "Checked only when the Kingdom has confirmation that the state record exists — a returned licence, a certificate, a file number. Not when someone intended to file.",
    },
    {
      key: "civilAuthority",
      label: "Civil authority filed with",
      type: "text",
      section: "Civil registration",
      placeholder: "e.g. Registrar of Vital Statistics, City of Bridgeport",
      help: "The specific office and town. Connecticut vital records are held at town level, and the town is where a certified copy will have to be obtained.",
    },
    {
      key: "civilFileNumber",
      label: "Civil file or certificate number",
      type: "text",
      section: "Civil registration",
      help: "The number that lets a member, an executor, or a court find the state record without a search. Enter it when the certificate is seen, not when it is promised.",
    },
    {
      key: "civilFilingDate",
      label: "Date of civil filing",
      type: "date",
      section: "Civil registration",
      help: "The date the state received it. For a marriage this is when the completed licence was returned to the town registrar.",
    },
    {
      key: "marriageLicenceNumber",
      label: "Marriage licence number",
      type: "text",
      section: "Marriage licence",
      help: "From the licence itself, seen by the officiant before the ceremony. Blank on a marriage record means no valid Connecticut marriage was created.",
    },
    {
      key: "marriageLicenceTown",
      label: "Town issuing the licence",
      type: "text",
      section: "Marriage licence",
      help: "Must be the town where the ceremony takes place. A licence from a different town does not authorise the ceremony held here.",
    },
    {
      key: "marriageLicenceIssueDate",
      label: "Date the licence issued",
      type: "date",
      section: "Marriage licence",
      help: "A Connecticut marriage licence is void unless the marriage is solemnised within the statutory period, which is printed on the licence. Do not schedule beyond it.",
    },
    {
      key: "licenceReturnedDate",
      label: "Date the completed licence was returned",
      type: "date",
      section: "Marriage licence",
      help: "The officiant's own statutory duty (Conn. Gen. Stat. § 46b-34). Until the licence is returned and recorded, there is no state record of the marriage no matter what was said at the altar.",
    },

    {
      key: "parentsOrNextOfKin",
      label: "Parents, guardians, or next of kin",
      type: "textarea",
      section: "Particulars and remarks",
      classification: "SEALED",
      help: "Recorded for identification and for the pastoral record. Sealed: family circumstance, adoption, and parentage are among the most damaging things a register can disclose carelessly.",
    },
    {
      key: "subjectIsMinor",
      label: "A principal is a minor",
      type: "boolean",
      section: "Particulars and remarks",
      help: "Raises the handling standard for the whole record and requires guardian consent for any use or disclosure of it.",
    },
    {
      key: "remarks",
      label: "Remarks",
      type: "textarea",
      section: "Particulars and remarks",
      help: "The pastoral and factual detail worth preserving: the text read, the circumstances, anything unusual about the rite. Written on the assumption a descendant will read it in fifty years.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Particulars and remarks",
      classification: "OFFICERS",
    },
  ],

  deadlineRules: [
    {
      id: "vit-marriage-licence-expiry",
      title: "Marriage licence approaching expiry",
      fromField: "marriageLicenceIssueDate",
      offsetDays: 50,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 46b-24",
      detail:
        "A Connecticut marriage licence is void unless the marriage is solemnised within the statutory period; the expiry date is printed on the licence itself — check it there, not here. If the ceremony will fall outside the period, the couple must obtain a new licence from the registrar of the town where the ceremony will take place. Solemnising on an expired licence produces no marriage.",
      when: (data) => data.eventType === "MARRIAGE" && !data.licenceReturnedDate,
    },
    {
      id: "vit-licence-return",
      title: "Completed marriage licence must be returned to the town registrar",
      fromField: "eventDate",
      offsetDays: 3,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 46b-34",
      detail:
        "The person who solemnised the marriage must complete the licence and return it to the registrar of vital statistics of the town where the ceremony took place. Until it is returned and recorded there is no state record of this marriage, and the couple are not married for any purpose the state recognises — inheritance, insurance, taxation, immigration, custody. Return it now and record the date; do not wait on this reminder.",
      when: (data) => data.eventType === "MARRIAGE" && !data.licenceReturnedDate,
    },
    {
      id: "vit-birth-registration",
      title: "Confirm the birth has been registered with the state",
      fromField: "eventDate",
      offsetDays: 5,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 7-48",
      detail:
        "A birth in Connecticut must be registered with the registrar of vital statistics of the town where it occurred, within the period the statute allows. This entry is a church record and is not a birth certificate: it will not obtain a passport, enrol a child in school, establish parentage, or support any claim of citizenship. Confirm the civil registration exists and record its file number.",
      when: (data) => data.eventType === "BIRTH" && data.filedWithCivilAuthority !== true,
    },
    {
      id: "vit-death-registration",
      title: "Death certificate and burial permit must be in hand before disposition",
      fromField: "eventDate",
      offsetDays: 1,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. §§ 7-62b, 7-65",
      detail:
        "A death occurring in Connecticut must be certified and registered with the town registrar within the statutory period, and a removal, transit, or burial permit obtained before final disposition. No interment may proceed on a church record alone. Confirm the funeral director or attending physician has filed, and record the certificate number here.",
      when: (data) =>
        (data.eventType === "DEATH" || data.eventType === "BURIAL") &&
        data.filedWithCivilAuthority !== true,
    },
    {
      id: "vit-civil-filing-outstanding",
      title: "Required civil filing is still unconfirmed",
      fromField: "eventDate",
      offsetDays: 30,
      severity: "HIGH",
      detail:
        "Thirty days on and no civil file number is recorded against a rite that requires one. Obtain a certified copy or written confirmation from the town registrar and enter the number. An unconfirmed filing is, in practice, an unmade one, and the person it harms will not find out for years.",
      when: (data) =>
        data.civilFilingRequired === "REQUIRED" && data.filedWithCivilAuthority !== true,
    },
  ],
};

export default vitalRecords;
