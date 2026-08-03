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
  guidance: `Enter a recognition the week it arrives, and enter the ones that came to nothing as well. This is the one register in the system that cannot be reconstructed later: a contract can be had again from the counterparty, a deed from the land records, a filing from the agency that holds it. A letter of commendation from a commissioner since retired, an invitation card, a paragraph in a paper whose archive has gone offline — these exist in one copy, in a drawer, and once gone the fact that they existed becomes unprovable.

**What the file can support, stated exactly.** Dealings with federal, state, and local governments are one evidentiary strand for federal acknowledgment: 25 C.F.R. § 83.11(a) treats identification of a petitioner as an American Indian entity by such bodies as evidence going to that criterion. Part 83 requires, among other criteria and conjunctively, identification as an American Indian entity on a substantially continuous basis since 1900, existence as a distinct community since that date, maintenance of political influence or authority over members since that date, and descent from a historical Indian tribe shown by genealogical evidence (25 C.F.R. § 83.11); the section sets further criteria besides, and those four are not the whole of it. A file opened this decade cannot supply a criterion measured from 1900, and no entry made here ever will. Nothing in this register brings acknowledgment nearer, and an officer who believes otherwise will one day say so in writing to somebody who knows the regulation.

What the file does instead is document the present, the only part of the record still being written. It evidences that the institution is real and doing what it says; it supplies the schedule of prior dealings that every grant application and accreditation asks for; it holds the determinations the Kingdom relies on and the dates they expire; and it answers the first question a careful counterparty asks, which is who else has dealt with you.

**Overclaiming is the characteristic failure of a file like this, and the damage arrives sideways.** It is rarely caught at the moment of the claim — correcting a stranger about their own honour is awkward, so the person across the table says nothing. It is caught a week later, quietly, by that same person, looking the thing up. What is lost is not the argument but the person, who was inclined to help and now holds a settled view about how this institution describes itself. They mention it to a colleague; the office's file acquires a note; nothing is ever said. Described accurately these honours open doors; described upward by a notch they close those doors and the neighbouring ones. In a federal grant application it stops being a question of credibility: a knowingly and wilfully false statement of material fact in a matter within the jurisdiction of a federal agency is an offence under 18 U.S.C. § 1001, and where federal money follows, the False Claims Act, 31 U.S.C. § 3729 et seq., is available to whoever noticed.

**How to ask for one: the threshold, and the desk.** Settle the threshold question first, because the office applies it before it reads anything else — is this body its business. A legislator issues citations as constituent service, and an aide's first act is to check the address against the district. Answer that in the opening line: the Kingdom's street address, the district, and how many members live in it, as a number at a stated date and never as names. A request that does not answer it is not refused, it is set down, and matters set down in a legislative office do not come back up.

Then write to the desk that prepares them, which is often not the office the honour is associated with. Connecticut's General Assembly is a part-time legislature and its members do not keep district offices; they are reached at the Legislative Office Building in Hartford and through caucus staff. Congressional offices are the ones with district offices, and federal casework goes there rather than to Washington. A municipal proclamation is a different desk again — the mayor's or the first selectman's office, and in a council-manager town the officer who presides ceremonially and the officer who administers are two different people. Take titles and addresses from the Register of Public Bodies and Officials rather than from memory; a wrong title on a request for an honour is a particularly poor first impression, because the request is discretionary and nothing obliges anyone to overlook it. Telephone before drafting and ask three things: which desk handles citations, whether the office has its own request form, and what lead time it needs. Confirm the lead time rather than assuming one — it lengthens sharply near the end of session, and the General Assembly's regular sessions are short and fixed by the Connecticut Constitution, convening in January in odd-numbered years and in February in even-numbered ones. Check the current adjournment date against the Assembly's own calendar before promising anybody a document by a date.

**Make the request answerable on its face.** It should carry the occasion and its date; the exact legal name of the honouree, spelled as it is to be typeset, because it will be typeset from the request and a misspelling is caught only if somebody notices in time; whether the honouree is the institution or a named person, which is not the same honour and must not be left to the office to guess; proposed wording, short, in the office's own idiom rather than the Kingdom's; the date, time, and place of any presentation, and whether a member is invited to attend and present it; the number of copies wanted; the address it should be sent to and the date it is needed by; and a named contact with a direct telephone number that is answered. Anything the office must write back for costs a fortnight, and a fortnight is frequently the whole margin.

Two things must not be in the request. Do not propose wording that would have the office recognise the Kingdom as a tribe, a sovereign, or a government, or describe it as recognised by anyone. An aide who notices will decline; an aide who does not notice will be corrected by a colleague or by counsel afterwards, and the file then holds a withdrawn honour and an office that will not issue a second. And do not ask a public office to certify, attest to, or confirm anything about the Kingdom's status. That converts a courtesy into a legal opinion, and it is refused by the lawyer it is referred to.

Ask for a specific occasion, never for recognition in the abstract. An office asked to mark an anniversary, a dedication, or a completed programme has something to write; one asked to acknowledge an institution's existence has nothing, and will decline politely. Ask one office per occasion — two citations for the same event, from members neither of whom knew the other had been approached, is the ordinary consequence of asking widely and it is remembered. A letter of support is the same discipline in another form: draft language, the deadline, a one-page summary of what the writer is being asked to say they know, and the address it must reach. Thank the office in writing when it arrives, naming the staff member who did the work rather than only the member who signed. That letter takes ten minutes and is the reason the second request is easier than the first.

**Where an honour is produced afterwards, and where it is not.** Obtaining the honour is half the asset; the other half is the judgement about which envelope it goes in. It belongs where community contribution bears on what the reader is deciding — a grant application, a legislator's packet, an accreditation file, a land-use application in which the institution's standing in the neighbourhood is genuinely part of the case. It does not belong in a packet to a police department, where it bears on nothing the reader is deciding and reads as status-seeking to precisely the audience trained to notice it. It does not belong stapled to a records request, a complaint, a licence application, or any matter that has turned adverse, where enclosing it reads as an offer to trade standing for outcome and is filed as one. An honour produced where it is not relevant does not merely fail to help: it causes the rest of the envelope to be re-read, including the documents that were unimpeachable. The three worked packets in \`docs/15-THE-STANDING-PACKET.md\` settle the ordinary cases; where a new one arises, the test is whether the reader could act on it.

**Two kinds of paper, and only one changes anything.** A determination that *confers or evidences status* alters the Kingdom's legal position the day it issues: an Internal Revenue Service determination letter under 26 U.S.C. § 501(c)(3), a certificate of incorporation as a religious corporation under Conn. Gen. Stat. § 33-264a et seq. or as a nonstock corporation under § 33-1000 et seq., charitable solicitation registration or exemption under Conn. Gen. Stat. § 21a-190a et seq., a property tax exemption allowed by a town assessor under Conn. Gen. Stat. § 12-81, a permit. These may be relied on and cited as authority, and they carry conditions and expiry dates, which is what the renewal reminder exists to catch. A church is excepted by 26 U.S.C. § 508(c)(1)(A) from the notice requirement of § 508(a), so holding no determination letter is not a defect. Be exact about what that settles. The exception is not itself a status, nothing may be entered in this register as a § 508(c)(1)(A) determination, whether a body is a church for the purpose is decided on the facts by the Service rather than by the body's description of itself, and the substantive requirements of § 501(c)(3) bind regardless. A church that wants a letter to hand a grant-maker may apply for one voluntarily, and where funders keep asking, that is ordinarily the cheaper answer.

An acknowledgment that *records esteem* changes nothing in law: a citation, a proclamation, a letter of commendation, an invitation, an award, a favourable article. It is evidence of standing and of contribution to a community, which is what a grant panel, an accreditation body, and a legislator's office weigh. Both belong here and both are worth having. Mistaking the second for the first is the single error this register is built to prevent.

Nothing recorded here is process, nothing here binds anybody, and no entry enlarges the Kingdom's authority over anyone. It is a file of what other people have said about the Kingdom, kept accurately enough to be shown to them.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "RECORDED",
  titleField: "recognitionDescription",
  listColumns: ["whatItIs", "issuingBodyName", "dateIssued", "legalEffect"],

  statuses: [
    {
      value: "SOUGHT",
      label: "Sought, not yet given",
      tone: "neutral",
      help: "The request has gone out. Open the record now rather than on success — the requests that were refused are part of the honest picture of where the Kingdom stands. Classify the record to Officers while it is pending: this register is public by default, and an office asked for a favour reads that request differently once it finds it published before the office has answered.",
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
      help: "Keep these, and keep them at Officers. A refusal with reasons tells the next officer what this office needs before it will say yes, and that is often the most useful thing in the file — but a named official's refusal sitting on a public register ends that relationship and the next request to that office with it.",
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
          help: "Confers something. Record the conditions and the expiry here, and the renewal reminder runs from the expiry date. Note that this is not the Register of Internal Permits and Authorisations, which holds permissions the Kingdom grants over its own premises, events, and marks; a permit granted *to* the Kingdom by an outside authority belongs here, and the issuing office belongs in the Register of Public Bodies and Officials.",
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
          help: "Money with conditions attached. The award letter and the terms are a contract; record the award here and the money, the restrictions on it, and the reporting it carries in the Register of Contributions, Grants and Disbursements, which keeps the grant reporting deadline.",
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
          help: "Record it here only where the meeting itself is the acknowledgement — a scheduled meeting with a commissioner, a mayor, a delegation. A meeting granted as ordinary constituent service, or a public counter answering a caller, acknowledges nothing and is not one of these. The substance of every meeting belongs in the Government-to-Government Contact Register, not here.",
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
      key: "honouree",
      label: "Who is named on the face",
      type: "select",
      required: true,
      section: "The recognition",
      help: "Read the first line of the document and record who it was actually given to, which is not always who asked for it. An honour conferred on the Founder personally is not an honour conferred on the Kingdom, and the difference is visible to anyone who reads the document. A reviewer who finds an institution claiming a citation made out to an individual stops assessing the application and starts assessing the applicant, and that is not a judgement a later correction reverses.",
      options: [
        { value: "KINGDOM", label: "The Kingdom itself" },
        {
          value: "OFFICER",
          label: "An officer or the Founder, personally",
          help: "Worth having and worth keeping. It belongs in that person's biography rather than in the institution's, and wherever the Kingdom reproduces it, the entry says on whom it was conferred.",
        },
        {
          value: "PROGRAMME",
          label: "A named programme, ministry, or project",
          help: "Name the programme every time it is cited. An honour for one project does not travel to the others, and moving it is the quietest form of overclaiming there is.",
        },
        { value: "MEMBER", label: "A member, in a personal capacity" },
        {
          value: "JOINT",
          label: "Jointly, with other bodies",
          help: "Ordinary for proclamations and coalition letters. Name the others when citing it; a reader who finds them omitted concludes the omission was deliberate, and on the face of it they are right.",
        },
      ],
    },
    {
      key: "occasionMarked",
      label: "Occasion or work marked",
      type: "text",
      section: "The recognition",
      placeholder: "e.g. fifteenth anniversary of the community's founding, 30 October 2025",
      help: "What it was actually given for, in one line. This is the first question a grant reviewer or a legislative aide asks about a document put in front of them, and an entry that cannot answer it invites the answer they will supply instead. Recorded here because the occasion is frequently nowhere on the face of the document, and within two years nobody remembers it.",
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
      help: "The most valuable field in this register. It is the sentence that keeps the institution honest when this document is later put in front of somebody who knows exactly what it is — a town attorney, a programme officer, a judge. Worked example. The Official Citation of the Connecticut General Assembly of 5 October 2025 is a genuine honour: introduced by nine legislators and signed and sealed by the President Pro Tempore, the Speaker, and the Secretary of the State, and creditable evidence of contribution to cultural heritage, civic education, and community empowerment. It is not state recognition of a tribe, it confers no legal status, and it creates no government-to-government relationship — because the General Assembly issues citations for anniversaries, retirements, and Eagle Scouts, and every official the Kingdom will ever write to knows that, their own office having issued a hundred of them. Write the second half here, for every entry, on the day it arrives and long before anybody needs it.",
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
      placeholder: "e.g. record held by the issuing clerk's office; IRS Tax Exempt Organization Search; the outlet's own archive",
      help: "Where a sceptical reader confirms this independently of the Kingdom's own account — the issuing body's minutes or agenda, the office that prepared the document, a public registry, the newspaper's archive. Name the route, and confirm it works before entering it. Where the issuer keeps no public record of the item — ordinary for ceremonial citations and for letters, which are typed, signed, and not journalised — say so here in terms rather than leaving the field blank. A blank reads as a check nobody made, and an officer who tells a reviewer an item can be verified when it cannot has spent something that is not earned back. Where the issuer is a public agency, its own file on the matter is ordinarily obtainable under the Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq.",
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
      help: "Anything the Kingdom must do or refrain from doing to keep this. Reporting requirements on a grant, continuing education on an accreditation, use restrictions on a permit, annual filings on a registration. Set the expiry in the field below so the renewal reminder runs, and where a grant's conditions govern how money may be spent and what must be reported, open the matching entry in the Register of Contributions, Grants and Disbursements — a lapse discovered by the issuer rather than reported by the Kingdom is treated very differently.",
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
      help: "What the issuer has agreed the Kingdom may do with the document, the seal on it, and the names on it. Reproducing the text of a citation given to the Kingdom is ordinarily unobjectionable. Using an official's name, photograph, or signature so as to suggest a continuing endorsement is not, and it is the second commonest way an honour is converted into a liability. Where a grant or accreditation supplies a logo, use it only within the terms of the licence given. And reproducing the whole document with its seal is one act; lifting the seal off it is another. A state or municipal seal on the Kingdom's own letterhead, credentials, vehicles, or anything a person could take for official identification is not the display of an honour but the appropriation of a government's insignia, and it is read that way by the office that owns it.",
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
        "Forty-five days since the request went out with no document recorded against it. Telephone the desk that handles them, ask for the person the request went to by name, ask politely where it sits, and confirm the answer by email the same day, quoting the office's own reference where one was given — that reference is the only string by which the office can retrieve its own file. Requests of this kind are not refused so much as mislaid, and a single call ordinarily retrieves them. If the answer is no, set the record to DECLINED and write down the reason in the office's own words; that reason is what the next request will have to answer.",
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
