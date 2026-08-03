import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Ordinations and Ministerial Credentials.
 *
 * Three things run off this register: the ministerial exception, which is the
 * strongest protection the Kingdom holds; the housing allowance under 26 U.S.C.
 * § 107, which fails entirely if the designation is not made in advance and in
 * writing; and safeguarding, where a missing background check is not a paperwork
 * problem but a negligent-selection claim the exception does not touch.
 */

const ordinations: RegistryDef = {
  slug: "ordinations",
  title: "Register of Ordinations and Ministerial Credentials",
  shortTitle: "Ordinations",
  recordLabel: "Credential",
  recordLabelPlural: "Credentials",
  group: "people",
  numberPrefix: "ORD",
  order: 4,
  authority: "Charter Art. I §2 (Ecclesiastical Body); Art. IV §4 (Rites and Ordinances)",
  description:
    "Every person set apart for ministry: what they were given, by whom, on what examination, with what scope, in what standing, and with what safeguarding on file.",
  guidance: `Two doctrines and one duty make this register worth keeping properly.

**The ministerial exception.** Civil courts will not adjudicate a religious body's decision to select, retain, or dismiss a minister. It is a constitutional bar to the claim rather than a defence to it, and it reaches any person who carries out important religious functions — regardless of title, formal ordination, or theological training (*Hosanna-Tabor v. EEOC*, 565 U.S. 171 (2012); *Our Lady of Guadalupe School v. Morrissey-Berru*, 591 U.S. 732 (2020)). What the exception turns on is **what the person actually does.** So record function, not just title: who teaches the faith, who leads worship, who administers rites, who forms members. A clear, contemporaneous record that a person was set apart for religious duties, and what those duties were, is what establishes the exception at the threshold of a case, before discovery. A vague personnel file is what loses it.

**Housing allowance.** A minister of the gospel may exclude from gross income a housing allowance, to the extent actually used to provide a home and not exceeding fair rental value (26 U.S.C. § 107). The exclusion is available **only if the employing body officially designates the amount in advance and in writing** — a resolution or minute adopted before the compensation is paid (Treas. Reg. § 1.107-1(b)). A designation adopted in March cannot reach January's pay. There is no retroactive cure, and this is the single most common error in small church administration. Record the designation, its date, and the instrument, and re-designate every year before the year begins. Note also that the allowance is excluded from income tax but remains subject to self-employment tax under SECA unless the minister holds an approved exemption, and that ministerial status is the predicate for all of it — which is exactly what this record establishes.

**Safeguarding is not optional and is not internal.** Any body ordaining ministers who will be near children must run a criminal background check before conferral, repeat it, and record training. This is what insurers require, what parents are entitled to, and what a negligent-selection or negligent-retention claim is measured against — and those claims are **not** barred by the ministerial exception, which protects the choice of a minister, not a failure to check.

Connecticut clergy are mandated reporters under Conn. Gen. Stat. § 17a-101. A mandated reporter with reasonable cause to suspect abuse or neglect of a child must report to the Commissioner of Children and Families or law enforcement orally as soon as practicable and not later than twelve hours, with a written report following within forty-eight hours (§ 17a-101b). Connecticut recognises one narrow carve-out, for a confidential penitential communication privileged under § 52-146b — it is narrow, and it does not cover what a minister learns by observation, from a third party, or outside confession. No internal rule, no vow, no instruction from any officer of the Kingdom, and no assertion of ecclesiastical privilege enlarges it or displaces the duty. Failure to report is itself an offence. Record training so the obligation never comes as a surprise.

**Revocation.** Record the fact publicly to the Kingdom and the grounds under seal.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "PROPOSED",
  titleField: "minister",
  listColumns: ["credentialType", "credentialDate", "standing", "ordainingBody"],

  statuses: [
    { value: "PROPOSED", label: "Proposed", tone: "neutral", help: "Put forward for ministry. No credential exists and none of the consequences below attach." },
    { value: "UNDER_EXAMINATION", label: "Under examination", tone: "active", help: "Before the examining council. Background check should be completed at this stage, not after conferral." },
    { value: "CONFERRED", label: "Conferred", tone: "success", help: "The credential has issued. Read the standing field for whether it is currently exercisable." },
    { value: "LAPSED", label: "Lapsed", tone: "warning", help: "A term credential that expired without renewal. The holder is not authorised to act until it is renewed." },
    { value: "SURRENDERED", label: "Surrendered", tone: "neutral", help: "Given up voluntarily. Record the date; do not characterise the reason unless the minister stated one." },
    { value: "REVOKED", label: "Revoked", tone: "danger", help: "Withdrawn by the Kingdom. Notify anyone relying on the credential, especially any body that recognised it." },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "minister",
      label: "Minister",
      type: "person",
      required: true,
      summary: true,
      section: "The minister",
      help: "Full legal name as it appears on identification, because this record supports tax treatment and may be produced to a court or an insurer.",
    },
    {
      key: "citizenRecord",
      label: "Enrolment record",
      type: "recordRef",
      refRegistry: "citizens",
      section: "The minister",
      help: "Cross-reference to the Roll. A credential held by someone not on the Roll should be explicable; usually it means an outside minister serving by invitation.",
    },
    {
      key: "credentialType",
      label: "Credential conferred",
      type: "select",
      required: true,
      summary: true,
      section: "The minister",
      options: [
        { value: "ORDINATION", label: "Ordination", help: "Full and ordinarily permanent setting apart for ministry." },
        { value: "LICENCE", label: "Licence to preach or serve", help: "Usually for a term, and usually renewable. Set the term so it cannot quietly lapse." },
        { value: "COMMISSION", label: "Commission to a specific ministry", help: "Scope-limited: a chaplaincy, a mission, a defined work. State the limits in the scope field." },
        { value: "DEACONATE", label: "Deaconate", help: "Service order. Record the functions actually performed — the ministerial exception follows function, not the name of the office." },
        { value: "OTHER", label: "Other credential" },
      ],
    },
    {
      key: "scopeOfMinistry",
      label: "Scope of ministry",
      type: "textarea",
      required: true,
      section: "The minister",
      help: "What this credential authorises and what it does not: preaching, teaching, administering ordinances, solemnising marriages, pastoral counselling, chaplaincy. Authority to solemnise a marriage is meaningless without a state licence for the particular ceremony — say so here where it applies.",
    },
    {
      key: "ministerialFunctions",
      label: "Religious functions actually performed",
      type: "textarea",
      section: "The minister",
      help: "The concrete duties: leads worship on which days, teaches whom, administers which rites, forms members in the faith how. This paragraph, not the title, is what a court examines when the ministerial exception is raised. Write it as though it will be read by someone deciding whether this person is a minister.",
    },

    {
      key: "ordainingBody",
      label: "Ordaining or licensing body",
      type: "text",
      required: true,
      section: "Conferral",
      help: "The body that actually conferred it, named exactly. Where the Kingdom acts jointly with an affiliated church, name both and say which acted.",
    },
    {
      key: "credentialDate",
      label: "Date conferred",
      type: "date",
      required: true,
      summary: true,
      section: "Conferral",
      help: "The date the credential took effect. Acts of ministry before this date were performed without it, which matters most for marriages solemnised.",
    },
    {
      key: "examiningCouncil",
      label: "Examining council",
      type: "textarea",
      section: "Conferral",
      help: "Who examined the candidate, on what, and what they found. An examination that happened but was never written down is an examination the Kingdom cannot show it held.",
    },
    {
      key: "endorsements",
      label: "Endorsements and references",
      type: "textarea",
      section: "Conferral",
      help: "Letters from other bodies, prior congregations, or ministers. Also record any refusal or withdrawal of endorsement — an absent reference that should exist is itself information.",
    },
    {
      key: "conferringInstrument",
      label: "Instrument of conferral",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Conferral",
      help: "The certificate or minute conferring the credential. This is the document produced when the credential is challenged, so it should exist before it is needed.",
    },

    {
      key: "standing",
      label: "Present standing",
      type: "select",
      required: true,
      summary: true,
      section: "Standing and recognition",
      help: "The credential's live condition, as distinct from this record's lifecycle. Update it the day it changes.",
      options: [
        { value: "GOOD_STANDING", label: "In good standing" },
        { value: "PROBATION", label: "On probation", help: "May act, subject to stated conditions. Record the conditions and their end date." },
        { value: "SUSPENDED", label: "Suspended", help: "May not act. Anyone who relies on this minister — including couples with weddings booked — must be told." },
        { value: "WITHDRAWN", label: "Withdrawn by the minister" },
        { value: "REVOKED", label: "Revoked by the Kingdom" },
      ],
    },
    {
      key: "standingEffectiveDate",
      label: "Standing effective from",
      type: "date",
      section: "Standing and recognition",
      help: "The date the present standing took effect. This is what answers whether the minister was competent to act on a particular past date — the question that arises about a marriage years later.",
    },
    {
      key: "recognisedByOutsideBody",
      label: "Recognised by an outside body",
      type: "boolean",
      section: "Standing and recognition",
      help: "Whether any denomination, association, endorsing agency, hospital, prison, or military body recognises this credential. Useful and honest to record; do not imply recognition the Kingdom has not actually been given.",
    },
    {
      key: "outsideRecognitionDetail",
      label: "Particulars of outside recognition",
      type: "textarea",
      section: "Standing and recognition",
      help: "Which body, for what purpose, with what expiry, and the contact who can confirm it. Chaplaincy endorsements in particular are granted for a term and are withdrawable, and the endorsing body must be told if standing here changes.",
    },

    {
      key: "housingAllowanceDesignated",
      label: "Housing allowance designated in advance and in writing",
      type: "boolean",
      section: "Compensation and housing",
      help: "Checked only where the employing body adopted a written designation BEFORE the compensation period began. A designation made after the fact is ineffective for everything paid before it, and the amount is simply taxable.",
    },
    {
      key: "housingAllowanceDesignationDate",
      label: "Date of the designation",
      type: "date",
      section: "Compensation and housing",
      help: "The date the resolution or minute was adopted. Everything paid before this date falls outside the exclusion, which is why the date is recorded rather than the year.",
    },
    {
      key: "housingAllowanceInstrument",
      label: "Designating instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Compensation and housing",
      classification: "OFFICERS",
      help: "The resolution or minute itself, stating the amount and the period. This is the document the IRS asks for; a verbal understanding is worth nothing here.",
    },

    {
      key: "worksWithMinors",
      label: "Will have contact with children or vulnerable adults",
      type: "boolean",
      summary: true,
      section: "Safeguarding",
      help: "Drives every safeguarding requirement below. Answer it honestly at conferral: almost every ministry in a congregation touches children at some point, and 'not really' is how checks get skipped.",
    },
    {
      key: "backgroundCheckDate",
      label: "Date criminal background check completed",
      type: "date",
      section: "Safeguarding",
      classification: "OFFICERS",
      help: "Completed BEFORE conferral, not after. A check run late is evidence of the very carelessness a negligent-selection claim alleges, and the ministerial exception does not reach that claim.",
    },
    {
      key: "backgroundCheckProvider",
      label: "Check performed by",
      type: "text",
      section: "Safeguarding",
      classification: "OFFICERS",
      help: "The screening provider or authority and the scope of the search — state, multi-state, national sex offender registry. Record the scope so nobody later assumes more was searched than was.",
    },
    {
      key: "safeguardingTrainingDate",
      label: "Date safeguarding training completed",
      type: "date",
      section: "Safeguarding",
      help: "Child-protection and conduct training. Insurers ask for the date and the provider; so will opposing counsel.",
    },
    {
      key: "mandatedReporterTrainingDate",
      label: "Date mandated-reporter training completed",
      type: "date",
      section: "Safeguarding",
      help: "Connecticut clergy are mandated reporters under Conn. Gen. Stat. § 17a-101 and the duty is personal to the individual. Training exists so that the twelve-hour oral reporting deadline is met by reflex rather than discovered afterwards.",
    },

    {
      key: "revocationDate",
      label: "Date of revocation, surrender, or lapse",
      type: "date",
      section: "Revocation",
      help: "The date the credential ceased to be exercisable. Anyone relying on it — couples with ceremonies booked, endorsing bodies, institutions granting access — must be told promptly.",
    },
    {
      key: "revocationGrounds",
      label: "Grounds",
      type: "textarea",
      section: "Revocation",
      classification: "SEALED",
      help: "Sealed. Record what was found and by what process, in neutral language. Where the matter involves suspected abuse or neglect of a child, the statutory report to the Commissioner of Children and Families or law enforcement is a separate and mandatory obligation that this entry does not discharge.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Revocation",
      classification: "OFFICERS",
    },
  ],

  deadlineRules: [
    {
      id: "ord-housing-redesignation",
      title: "Re-designate the housing allowance before the next period begins",
      fromField: "housingAllowanceDesignationDate",
      offsetDays: 335,
      severity: "CRITICAL",
      authority: "26 U.S.C. § 107; Treas. Reg. § 1.107-1(b)",
      detail:
        "The designation must be official, in writing, and adopted in advance of the compensation it covers. Adopt next year's resolution now, before the year begins. A designation adopted after payments have started does not reach anything already paid, and there is no retroactive fix — the amount simply becomes taxable income.",
      when: (data) => data.housingAllowanceDesignated === true,
    },
    {
      id: "ord-background-check-refresh",
      title: "Criminal background check due for renewal",
      fromField: "backgroundCheckDate",
      offsetDays: 1095,
      severity: "HIGH",
      detail:
        "Kingdom policy rather than statute, and the standard most insurers and denominations apply: re-screen anyone in contact with children at least every three years. Record the new date and the scope of the search. A stale check is treated, in a negligent-retention claim, as no check.",
      when: (data) => data.worksWithMinors === true,
    },
    {
      id: "ord-background-check-missing",
      title: "Credential conferred without a recorded background check",
      fromField: "credentialDate",
      offsetDays: 14,
      severity: "CRITICAL",
      detail:
        "This minister will have contact with children and no completed check is on file. The check should have preceded conferral. Complete it now, record the date and scope, and suspend contact with minors until it is done. This is the single item on this register most likely to be produced in litigation.",
      when: (data) => data.worksWithMinors === true && !data.backgroundCheckDate,
    },
    {
      id: "ord-safeguarding-refresh",
      title: "Safeguarding and mandated-reporter refresher due",
      fromField: "safeguardingTrainingDate",
      offsetDays: 365,
      severity: "ROUTINE",
      authority: "Conn. Gen. Stat. §§ 17a-101 to 17a-101d",
      detail:
        "Annual refresher, by Kingdom policy. The statutory reporting duty itself is continuous and personal: oral report to the Commissioner of Children and Families or law enforcement as soon as practicable and not later than twelve hours, written report within forty-eight. Training keeps that a reflex.",
    },
    {
      id: "ord-licence-renewal",
      title: "Term licence approaching renewal",
      fromField: "credentialDate",
      offsetDays: 335,
      severity: "ROUTINE",
      detail:
        "Licences and commissions are ordinarily granted for a term. Renew by written act and record it, or move the record to lapsed. A minister acting on a lapsed licence is a problem that surfaces at the worst time — usually when a marriage they solemnised is questioned.",
      when: (data) => data.credentialType === "LICENCE" || data.credentialType === "COMMISSION",
    },
  ],
};

export default ordinations;
