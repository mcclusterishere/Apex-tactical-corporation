import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Recognitions, Honours and External Acknowledgements.
 *
 * Every occasion on which an outside body has acknowledged the Kingdom's
 * existence, standing, or contribution — citations, proclamations, letters from
 * officials, permits granted, invitations, meetings held at official level,
 * grants, accreditations, press of record, and tax or corporate determinations.
 *
 * It is kept because it is the one register in this system that cannot be
 * reconstructed later, and because its usefulness depends entirely on the
 * Kingdom describing each item as exactly what it is.
 */

const recognitions: RegistryDef = {
  slug: "recognitions",
  title: "Register of Recognitions, Honours and External Acknowledgements",
  shortTitle: "Recognitions",
  recordLabel: "Recognition",
  recordLabelPlural: "Recognitions",
  group: "relations",
  numberPrefix: "RCG",
  order: 5,
  authority: "Charter Art. VI (External Relations & Non-Interference); Art. IV §9",
  description:
    "Every acknowledgement of the Kingdom by an outside body — what the document actually is, what it is not, how it may be described, and where the original is kept.",
  guidance: `Enter a recognition the week it arrives, and enter the ones that came to nothing as well. This is the one register in the system that cannot be reconstructed later: a contract can be had again from the counterparty, a deed from the land records, a filing from the agency holding it. A letter of commendation from a commissioner who has since left office, an invitation card, a paragraph in a paper whose archive has gone offline — these exist in one copy, in a drawer, and once they are gone the fact that they existed becomes unprovable.

**What the file can support, stated exactly.** Dealings with federal, state, and local governments are one evidentiary strand for federal acknowledgment: 25 C.F.R. § 83.11(a) treats identification of a petitioner as an American Indian entity by such bodies as evidence going to that criterion. Be precise about what that does and does not mean, because reading it broadly is how this register gets misused. Part 83 requires, conjunctively, identification as an American Indian entity on a substantially continuous basis since 1900, existence as a distinct community since that date, maintenance of political influence or authority over members since that date, and descent from a historical Indian tribe shown by genealogical evidence (25 C.F.R. § 83.11). A file opened this decade cannot supply a criterion measured from 1900, and no entry made here ever will. Nothing recorded in this register brings acknowledgment nearer, and an officer who believes otherwise will one day say so in writing to somebody who knows the regulation.

What the file can do is document the present, which is the only part of the record still being written. It evidences that the institution is real, established, and doing what it says; it supplies the schedule of prior dealings that every grant application, accreditation, and consulting-party request asks for; it holds the determinations the Kingdom actually relies on and the dates they expire; and it answers the first question a careful counterparty asks, which is who else has dealt with you.

**Overclaiming, and how the damage arrives.** Overclaiming is the characteristic failure of a file like this, and it is rarely caught at the moment of the claim. The person across the table says nothing, because correcting a stranger about their own honour is awkward and there is no reason to make a scene. It is caught quietly a week later, by that same person, when they look the thing up — and what is lost is not the argument but the person, who was inclined to help and now holds a settled view about how this institution describes itself. They mention it to a colleague. The office's file acquires a note. Nothing is ever said and no decision issues. Described accurately these honours open real doors; described upward by a single notch they close those doors and the neighbouring ones. Where the claim appears in a federal grant application it stops being a question of credibility: a materially false statement in a matter within the jurisdiction of a federal agency is an offence under 18 U.S.C. § 1001, and where federal money follows, the False Claims Act, 31 U.S.C. § 3729 et seq., is available to anyone who noticed.

**How to ask for one.** Ask the office that issues them, in its own form, with enough notice and enough material that saying yes is cheap. A legislator's office prepares citations as constituent service: the request goes to the district office or the legislative aide, names the occasion and its date, proposes the exact wording, gives the correct legal name of the body honoured, and arrives well ahead — confirm the current lead time with the office rather than assuming one, because it lengthens near the end of session. A letter of support is the same discipline: supply draft language, the deadline, a one-page summary, and the address it must go to. Ask for a specific occasion, never for recognition in the abstract. An office asked to mark an anniversary, a dedication, or a completed programme has something to write; an office asked to acknowledge an institution's existence has nothing and will decline politely. Record the request here the day it goes out, so that a promise which never materialises stays visible.

**Two kinds of paper, and only one changes anything.** A determination that *confers or evidences status* alters the Kingdom's legal position the day it issues: an Internal Revenue Service determination letter under 26 U.S.C. § 501(c)(3), a certificate of incorporation as a religious corporation under Conn. Gen. Stat. § 33-264a et seq. or as a nonstock corporation under § 33-1000 et seq., charitable solicitation registration or exemption under Conn. Gen. Stat. § 21a-190a et seq., a property tax exemption allowed by a town assessor under Conn. Gen. Stat. § 12-81, a permit, a certificate of occupancy. These may be relied on and cited as authority, and they carry conditions and expiry dates, which is what the renewal reminder exists to catch. Note that a church is excepted by 26 U.S.C. § 508(c)(1)(A) from applying for recognition of exemption, so holding no determination letter is not a defect — though it does mean there is none to hand a grant-maker who asks, which is a practical reason to consider applying anyway.

An acknowledgment that *records esteem* changes nothing in law: a citation, a proclamation, a letter of commendation, an invitation, an award, a favourable article. It is evidence of standing and of contribution to a community, which is precisely what a grant panel, an accreditation body, and a legislator's office weigh. Both kinds belong here and both are worth having. Mistaking the second for the first is the single error this register is built to prevent.

Nothing recorded here is process, nothing here binds anybody, and no entry enlarges the Kingdom's authority over any person. It is a file of what other people have said about the Kingdom, kept accurately enough that it can be shown to them.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "RECORDED",
  titleField: "recognitionDescription",
  listColumns: ["whatItIs", "issuingBodyName", "dateIssued", "legalEffect"],

  statuses: [
    {
      value: "SOUGHT",
      label: "Sought, not yet given",
      tone: "neutral",
      help: "The request has gone out. Open the record now rather than on success — the requests that were refused are part of the honest picture of where the Kingdom stands.",
    },
    {
      value: "PROMISED",
      label: "Promised, document not in hand",
      tone: "warning",
      help: "An official has undertaken to issue something. Confirm the undertaking in writing the same week and chase it; a promised citation that never arrives is the commonest way an occasion passes unmarked.",
    },
    { value: "RECORDED", label: "Received and on file", tone: "success" },
    {
      value: "LAPSED",
      label: "Lapsed or expired",
      tone: "warning",
      help: "A permit, registration, accreditation, or membership that has run out. It remains true that it was once held, and false that it is held now. Both facts matter, so do not delete the record.",
    },
    {
      value: "REVOKED",
      label: "Revoked or withdrawn by the issuer",
      tone: "danger",
      help: "Record the reason given, in the issuer's own words. A withdrawn honour that is still being displayed is worse than never having had it.",
    },
    {
      value: "DECLINED",
      label: "Sought and refused",
      tone: "neutral",
      help: "Keep these. A refusal with reasons tells the next officer what this office needs before it will say yes, and that is often the most useful thing in the file.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "recognitionDescription",
      label: "Description of the honour or acknowledgement",
      type: "text",
      required: true,
      section: "The recognition",
      summary: true,
      placeholder: "e.g. Official Citation of the Connecticut General Assembly, 5 October 2025",
      help: "One line, in the document's own words where it has any. This titles the record and is how it will be found in ten years by someone who was not there.",
    },
    {
      key: "whatItIs",
      label: "What the document actually is",
      type: "select",
      required: true,
      section: "The recognition",
      summary: true,
      help: "Classify by what the issuing office would call it, not by what it felt like to receive. Every category below is worth having; they are simply worth different things.",
      options: [
        {
          value: "COURTESY_CITATION",
          label: "Courtesy or ceremonial citation",
          help: "Issued by a legislature or council as constituent service, commonly for anniversaries, retirements, dedications, and Eagle Scout courts of honour. Genuine, sealed, and creditable evidence of community contribution. Not a determination of anything.",
        },
        {
          value: "PROCLAMATION",
          label: "Proclamation",
          help: "An executive declaration marking a day, week, or occasion. Same character as a citation: real, public, and legally inert.",
        },
        {
          value: "LETTER_SUPPORT",
          label: "Letter of support or commendation",
          help: "Frequently the most useful item in the file, because it is written in a named person's own words and can be attached to an application. Note whether it was written for a specific application or is general.",
        },
        {
          value: "PERMIT_LICENCE",
          label: "Permit or licence granted",
          help: "Confers something. Record the conditions and the expiry, and cross-reference the Register of Permits and Licences.",
        },
        {
          value: "TAX_DETERMINATION",
          label: "Determination of tax-exempt status",
          help: "A federal determination letter or a municipal or state exemption allowed. This changes the Kingdom's legal position and may be relied on. Record precisely which exemption, under which provision, and for what period.",
        },
        {
          value: "REGISTRATION",
          label: "Corporate or charitable registration",
          help: "A certificate of incorporation, a trade name certificate, a charitable solicitation registration or exemption. Confers or evidences status and generally carries a renewal obligation.",
        },
        {
          value: "GRANT_AWARD",
          label: "Grant award",
          help: "Money with conditions attached. The award letter and the terms are a contract; record them here and record the obligations they create in the Register of Obligations.",
        },
        {
          value: "ACCREDITATION",
          label: "Accreditation or membership of an association",
          help: "Admission to a professional, denominational, museum, archival, or historical body. Slow to obtain, cumulative, and the kind of standing that is hard for anyone to dispute.",
        },
        {
          value: "INVITATION",
          label: "Invitation to an official occasion",
          help: "Being invited is evidence of being regarded as an institution. Keep the invitation itself; an invitation is documentary, a recollection of one is not.",
        },
        {
          value: "MEETING",
          label: "Meeting held at official level",
          help: "Record it here only where the meeting itself is the acknowledgement — a scheduled meeting with a commissioner, a mayor, a delegation. The substance of every meeting belongs in the Government-to-Government Contact Register, not here.",
        },
        {
          value: "MEDIA",
          label: "Media coverage",
          help: "Press of record. Capture the outlet, date, byline, and a copy of the piece — news archives disappear, and a link is not a copy. A journalist writing about the Kingdom is not endorsing it, and the entry should not read as though they were.",
        },
        {
          value: "ACADEMIC",
          label: "Academic or scholarly reference",
          help: "A citation in a thesis, monograph, journal article, or conference paper. Slow to accumulate and unusually durable, because it survives in libraries after everything else is offline.",
        },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "legalEffect",
      label: "Legal effect",
      type: "select",
      required: true,
      section: "The recognition",
      summary: true,
      help: "The distinction that governs how this document may be used. Getting it wrong in front of a lawyer costs the relationship; getting it wrong in a federal application costs considerably more.",
      options: [
        {
          value: "CONFERS",
          label: "Confers or evidences a legal status",
          help: "A determination letter, a certificate of incorporation, a registration, a permit. Something changed in law on the day it issued. It may be produced and cited as authority, and it almost certainly carries conditions and an expiry date.",
        },
        {
          value: "RECORDS_ESTEEM",
          label: "Records esteem — changes nothing in law",
          help: "A citation, a proclamation, a letter of commendation, an invitation, an article. Worth having, worth displaying, worth citing as evidence of standing — and worth nothing whatever as authority. Most entries in this register are of this kind.",
        },
        {
          value: "UNDETERMINED",
          label: "Not yet settled",
          help: "Use this rather than guessing. Ask Counsel before the document is put in front of anybody, and change the entry once the answer is known.",
        },
      ],
    },
    {
      key: "dateIssued",
      label: "Date issued or conferred",
      type: "date",
      section: "The recognition",
      summary: true,
      help: "The date on the face of the document, or the date of the occasion. Leave empty while the status is SOUGHT or PROMISED; the register uses its absence to raise the chase.",
    },

    {
      key: "whatItIsNot",
      label: "What it is not",
      type: "textarea",
      required: true,
      section: "Honest characterisation",
      help: "The most valuable field in this register. It is the sentence that keeps the institution honest when this document is later put in front of somebody who knows exactly what it is — a town attorney, a programme officer, a judge. Worked example. The Official Citation of the Connecticut General Assembly of 5 October 2025 is a genuine honour: introduced by nine legislators and signed and sealed by the President Pro Tempore, the Speaker, and the Secretary of the State, and creditable evidence of contribution to cultural heritage, civic education, and community life. It is not state recognition of a tribe, it confers no legal status, and it creates no government-to-government relationship — because the General Assembly issues citations for anniversaries, retirements, and Eagle Scouts, and every official the Kingdom will ever write to knows that, their own office having issued a hundred of them. Write the second half here, for every entry, on the day it arrives and long before anybody needs it.",
    },
    {
      key: "howItMayBePresented",
      label: "How it may be presented",
      type: "textarea",
      required: true,
      section: "Honest characterisation",
      summary: true,
      help: "The approved characterisation, in one sentence, used verbatim by every officer in every grant application, biography, press release, and letter. Uniformity is the whole point: a claim that grows in the retelling is caught by laying two of the Kingdom's own documents side by side, and that comparison is trivially easy for anyone to make. Where the sentence will not fit the space available, the answer is a shorter true sentence, never a stronger one.",
    },
    {
      key: "verificationSource",
      label: "How an outsider can verify it",
      type: "text",
      section: "Honest characterisation",
      placeholder: "e.g. General Assembly journal entry; IRS Tax Exempt Organization Search; outlet's own archive",
      help: "Where a sceptical reader confirms this independently of the Kingdom's own account — the issuing body's journal or minutes, a published agenda, a public registry, the newspaper's archive. A recognition nobody else can check is worth roughly what the Kingdom's assertion of it is worth. Where the issuer is a public agency, its own file on the matter is ordinarily obtainable under the Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq.",
    },

    {
      key: "issuingBodyName",
      label: "Issuing body",
      type: "text",
      required: true,
      section: "The issuer",
      summary: true,
      placeholder: "e.g. Connecticut General Assembly",
      help: "The body itself, by its formal name, whether or not it is a public one. Journals, universities, denominational bodies, and associations all issue recognitions and none of them appears in the Register of Public Bodies.",
    },
    {
      key: "issuingBodyRef",
      label: "Issuing body in the Register of Public Bodies",
      type: "recordRef",
      refRegistry: "public-bodies",
      section: "The issuer",
      help: "Where the issuer is a public body already on the directory. Links the honour to the correct office, the right titles, and the history of dealings with it, so that the next approach starts from what the last one learned.",
    },
    {
      key: "issuingOfficial",
      label: "Issuing official",
      type: "person",
      section: "The issuer",
      help: "The named human being who signed. Officials move, retire, and lose elections, and the name is what makes the item traceable afterwards. Where several signed, name them all — the number of signatories is frequently the substance of the honour.",
    },
    {
      key: "officialTitle",
      label: "Title of the official, as at the date",
      type: "text",
      section: "The issuer",
      help: "The office held when the document issued, not the office held now. Describing a former commissioner as the current one is a small error that reads as a deliberate one.",
    },

    {
      key: "dateSought",
      label: "Date it was requested",
      type: "date",
      section: "How it came about",
      help: "For anything the Kingdom asked for. Records the lead time actually required by that office, which is the single most useful fact to have the next time, and lets the register chase a request that produced nothing.",
    },
    {
      key: "howObtained",
      label: "How it came about",
      type: "select",
      section: "How it came about",
      help: "Recorded because unsolicited recognition carries more weight with a reviewer than solicited recognition, and the difference should not have to be reconstructed from memory.",
      options: [
        { value: "UNSOLICITED", label: "Unsolicited", help: "Offered without being asked for. The most persuasive kind, and worth saying so plainly when it is true." },
        { value: "REQUESTED", label: "Requested by the Kingdom", help: "Entirely ordinary — most citations and letters of support are requested, and every office expects to be asked. Simply do not present it as though it arrived unprompted." },
        { value: "APPLICATION", label: "On formal application", help: "A grant, an accreditation, a registration, a permit. Keep the application itself with the award; the two are read together." },
        { value: "NOMINATION", label: "On nomination by a third party" },
        { value: "ROUTINE", label: "Issued in the ordinary course", help: "A permit or determination granted as a matter of routine administration. Real, useful, and not an honour." },
      ],
    },
    {
      key: "contactRef",
      label: "Dealing that produced it",
      type: "recordRef",
      refRegistry: "government-contacts",
      section: "How it came about",
      help: "The contact record for the letter, meeting, or application this came out of. It is what converts a scattering of honours into a demonstrable pattern of engagement, and what tells a successor which approach actually worked.",
    },
    {
      key: "conditionsAttached",
      label: "Conditions, obligations, and expiry terms",
      type: "textarea",
      section: "How it came about",
      help: "Anything the Kingdom must do or refrain from doing to keep this. Reporting requirements on a grant, continuing education on an accreditation, use restrictions on a permit, annual filings on a registration. Where a condition costs money or time, open a matching entry in the Register of Obligations — a lapse discovered by the issuer rather than reported by the Kingdom is treated very differently.",
    },

    {
      key: "originalLocation",
      label: "Location of the physical original",
      type: "text",
      section: "The document",
      placeholder: "e.g. Registrar's fire safe, folio 12 — framed reproduction in the vestry",
      help: "Where the paper itself is, precisely enough that a stranger could fetch it. Where the original is framed and hung, say so and say where the unframed copy is. Ceremonial documents are handed over at events, admired, and then lost more often than any other class of record in this system.",
    },
    {
      key: "digitalCopyRef",
      label: "Digital copy",
      type: "text",
      section: "The document",
      placeholder: "e.g. Evidence Vault reference, or scan filename and date",
      help: "The reference for a full-resolution scan or photograph of the whole document, seals and signatures included. Scan it the week it arrives. A cropped image of the text loses the sealed and signed character, which for a citation is most of what the document is.",
    },
    {
      key: "publicUrl",
      label: "Public source or permanent link",
      type: "url",
      section: "The document",
      help: "Where the item lives on the issuer's or publisher's own site. Record the date it was captured, because links of this kind fail within a few years and the copy in the vault then becomes the only version.",
    },
    {
      key: "publishedByKingdom",
      label: "Published by the Kingdom",
      type: "boolean",
      section: "The document",
      help: "Whether the Kingdom itself displays or reproduces this — on the site, in materials, in an application. Everything published is read by people who can check it, so nothing should be published whose entry in this register is not complete.",
    },
    {
      key: "reproductionPermission",
      label: "Permission to reproduce",
      type: "textarea",
      section: "The document",
      help: "What the issuer has agreed the Kingdom may do with the document, the seal on it, and the names on it. Reproducing the text of a citation given to the Kingdom is ordinarily unobjectionable. Using an official's name, photograph, or signature so as to suggest a continuing endorsement is not, and it is the second commonest way an honour is converted into a liability. Where a grant or accreditation supplies a logo, use it only within the terms of the licence given.",
    },

    {
      key: "validUntil",
      label: "Valid until",
      type: "date",
      section: "Currency and review",
      help: "For anything with a term — a permit, a registration, an accreditation, a membership, a determination granted for a period. The register raises this sixty days before it runs out. An honour is permanent; a status is not, and describing a lapsed one in the present tense is the same error as overclaiming a citation.",
    },
    {
      key: "reviewNotes",
      label: "Review notes",
      type: "textarea",
      section: "Currency and review",
      help: "What has changed since the document issued — the official has left office, the programme has closed, the association has altered its criteria, the article is no longer online. Kept so that an entry is not quoted years later as though the world had stood still around it.",
    },
    {
      key: "internalNotes",
      label: "Internal notes",
      type: "textarea",
      section: "Currency and review",
      classification: "OFFICERS",
      help: "Assessment, tactical judgment, and impressions of the office that issued it. Held back from the public view of this register, which is otherwise open, so that the public entry stays a plain factual account the Kingdom would be content to have quoted.",
    },
  ],

  deadlineRules: [
    {
      id: "rcg-renewal",
      title: "Recognition expires — renewal or reapplication due",
      fromField: "validUntil",
      offsetDays: -60,
      severity: "HIGH",
      detail:
        "A permit, registration, accreditation, or determination held by the Kingdom runs out in sixty days. Confirm the renewal requirement with the issuing office in writing, and check whether anything in the Kingdom's circumstances has changed since it was granted. Lapse is ordinarily easier to prevent than to cure, and until it is cured the status may not be described in the present tense in any application, letter, or published material.",
    },
    {
      id: "rcg-sought-no-answer",
      title: "Recognition sought and nothing received",
      fromField: "dateSought",
      offsetDays: 45,
      severity: "ROUTINE",
      detail:
        "Six weeks since the request went out with no document recorded against it. Telephone the office, ask politely where it sits, and confirm the answer by email the same day. Requests of this kind are not refused so much as mislaid, and a single call ordinarily retrieves them. If the answer is no, set the record to DECLINED and write down the reason given — that reason is what the next request will need to answer.",
      when: (data) => !data.dateIssued,
    },
    {
      id: "rcg-original-not-secured",
      title: "No original location or scan recorded for this recognition",
      fromField: "dateIssued",
      offsetDays: 30,
      severity: "ROUTINE",
      detail:
        "A month since this issued and neither the location of the physical original nor a digital copy has been entered. Do both now. This register holds the only class of record in the system that cannot be obtained again from anyone else, and a ceremonial document that was handed over at an occasion is lost far more easily than it was earned.",
      when: (data) => !data.originalLocation && !data.digitalCopyRef,
    },
  ],
};

export default recognitions;
