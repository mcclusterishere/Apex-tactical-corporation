import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Public Safety and Emergency Services Liaison.
 *
 * One record per dealing with a police department, a fire marshal, an ambulance
 * service, or an emergency dispatcher. The Kingdom's position in every one of
 * them is the position of an ordinary institution: complainant, witness,
 * applicant, or recipient of lawful process. It holds no police power, issues
 * nothing resembling a law-enforcement credential, and directs no process at any
 * officer or agency. This register is built so that those things cannot be
 * expressed in it — there is no field for a stop, a detention, a search, a
 * commission, or a badge, and there is no status in which the Kingdom acts as an
 * authority over anybody.
 */

const publicSafety: RegistryDef = {
  slug: "public-safety",
  title: "Register of Public Safety and Emergency Services Liaison",
  shortTitle: "Public Safety",
  recordLabel: "Interaction",
  recordLabelPlural: "Interactions",
  group: "relations",
  numberPrefix: "PSL",
  order: 4,
  authority:
    "Charter Art. VI (External Relations & Non-Interference); Conn. Gen. Stat. § 17a-101 et seq. (mandated reporting); Conn. Gen. Stat. § 1-200 et seq. (Freedom of Information Act)",
  description:
    "Every dealing with police, fire, and emergency services — what was reported, the incident number issued, the officer named, what was asked for, what came back, and what remains outstanding.",
  guidance: `Enter every dealing with police, fire, or emergency services on the day it happens. Most produce nothing memorable, which is exactly why they need writing down: the file's worth is cumulative and is built out of entries that felt unimportant when made.

**The Kingdom is not a police force, and nothing issued in its name may suggest otherwise.**

This comes first because it protects everything else on the page. The Kingdom issues no badge, patch, shield, warrant card, plate, uniform item, or identification of any kind that could be mistaken for law enforcement or for a governmental body. It commissions no officer with police powers. It conducts no stops, detentions, searches, seizures, or arrests. It directs no process at any officer, department, or agency — no summons, subpoena, warrant, lien, or notice of default, whatever it is called.

The exposure is personal and criminal rather than institutional and civil. Holding a private person out as a peace officer is criminal impersonation under Conn. Gen. Stat. §§ 53a-130 and 53a-130a. Making or wearing anything resembling a federal badge or insignia reaches 18 U.S.C. § 701; representing oneself as a federal officer reaches § 912; producing an identification document purporting to be issued by a governmental body reaches § 1028; and filing a lien against a federal officer on account of their official duties is a felony under § 1521. Read the list as protective, because it is: one embroidered patch turns an institution the police were prepared to help into a file the department forwards to its legal division, and that goodwill does not come back.

**Stewards at Kingdom events.** People who marshal parking, watch doors, and keep order are stewards. They wear nothing that reads as police — no shield, no chevron, no lettering implying office, no title containing "officer", "marshal", or "patrol" used as a rank — and they carry no badge. Their authority is exactly that of any private person on private property: to ask someone to leave, and to call the police if they will not. Anything past that is an assault, a false imprisonment, or both, and it is the steward personally who is charged.

**How to be effective as a complainant.** Report promptly, before anyone debates whether it is worth reporting. Get the incident number before the officer leaves; without it every later request goes nowhere. Write down the officer's name and badge number exactly as they gave it. Photograph damage before cleaning up — wide enough to show where, close enough to show what — and lodge the images in the Evidence Vault the same day. Then request the report in writing under the Connecticut Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq., opening a record in the Register of Public Records Requests, which keeps the four-business-day response period and the free thirty-day appeal to the Freedom of Information Commission (§§ 1-206(a), 1-206(b)(1)). Expect withholding while a matter is open under the law-enforcement exemptions at § 1-210(b)(3), and ask which subdivision is relied on rather than arguing about the result. Where a department will not answer, the ladder is the shift supervisor, then the chief, then the Commission. Indignation is not a rung on it.

**Bias-motivated incidents.** A defaced door, a threat naming the congregation's faith, repeated vandalism of the same religious property: here the quality of the file decides the outcome. Connecticut punishes intimidation based on bigotry or bias in degrees under Conn. Gen. Stat. § 53a-181j et seq. Tell the responding officer plainly that the Kingdom believes the incident was religiously motivated and ask that it be classified as such — classification is done by the local agency, and the federal picture is assembled from what agencies submit through the FBI's Uniform Crime Reporting and NIBRS bias-crime collection. Connecticut separately requires state-level collection of such offences; confirm the current section before citing it. Four dated, photographed, numbered, professionally reported incidents are a case a prosecutor can bring. The same four recalled from memory a year later are an impression.

**When a member is the subject rather than the complainant.** The institution does not obstruct, does not conceal, does not counsel anyone on what to say, and does not take custody of anything. Record what the Kingdom knows and refer the member to their own lawyer — not the Kingdom's, whose duty runs to the institution. Do not collect statements from other members; an internal inquiry running alongside a criminal investigation interferes with it and creates discoverable material that helps no one. Anything relevant the Kingdom already holds is preserved exactly as it is, and Counsel is told. Destroying, altering, or concealing it is tampering with physical evidence under Conn. Gen. Stat. § 53a-155, and the hindering-prosecution offences nearby reach the rest; confirm the pin cite before relying on a section.

**Lawful process served on the Kingdom** — a subpoena, a warrant, a court order — is complied with, or challenged through counsel in the issuing court. It is never ignored, and never answered with a document denying that court's jurisdiction: that is read as non-appearance, and what follows is a contempt finding against the officer who signed. Log it the hour it arrives and route it to Counsel the same day.

**Mandated reporting is a legal duty, not an institutional choice.** Where anyone forms reasonable cause to suspect that a child has been abused or neglected or placed in imminent risk of serious harm, the duty is that individual's own under Conn. Gen. Stat. § 17a-101 et seq.: an oral or electronic report to the Commissioner of Children and Families or a law enforcement agency as soon as practicable and within twelve hours (§ 17a-101b(a)), then a written report within forty-eight hours of it (§ 17a-101c). Clergy are enumerated mandated reporters (§ 17a-101(b)), and failure to report is itself an offence (§ 17a-101a). No officer of the Kingdom, the Founder included, may tell a reporter to wait, and internal handling is never a substitute. Report first, then enter it here and in the Register of Incidents.

**Assemblies, patrol, and a named liaison.** Notify the department in advance of anything drawing a crowd or touching a public way, and apply for whatever permit the municipality requires. A permit scheme reaching religious assembly on public ways is constrained by the First Amendment — content neutral, narrowly tailored, free of unbridled discretion (*Cox v. New Hampshire*, 312 U.S. 569 (1941); *Forsyth County v. Nationalist Movement*, 505 U.S. 123 (1992)) — but the answer to an unconstitutional condition is counsel and a court, never proceeding without the permit and daring the town to act. Extra patrol and a physical security assessment may simply be asked for in writing from the district commander; departments assess at no charge, and the written result is what an application to the federal Nonprofit Security Grant Program, administered through each state's homeland security administrative agency, is built on. Check that programme's current notice of funding opportunity each cycle rather than any figure recalled from memory. And designate one liaison: a named person, a number that is answered, notified in writing and refreshed annually.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "PREPARED",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "COUNSEL"],
  titleField: "subject",
  listColumns: ["interactionType", "agencyName", "interactionDate", "agencyCaseNumber"],

  statuses: [
    {
      value: "PREPARED",
      label: "Prepared, not yet made",
      tone: "neutral",
      help: "Drafted internally. Nothing has been said to any agency yet. A mandated report is never left sitting in this status.",
    },
    {
      value: "REPORTED",
      label: "Reported to the agency",
      tone: "active",
      help: "The call was made or the desk was attended. Record who took it and when, even where no number was issued.",
    },
    {
      value: "NUMBER_ISSUED",
      label: "Report or incident number issued",
      tone: "active",
      help: "The agency has given a case, incident, or CAD number. That number is the key to every later request; enter it before anything else is done.",
    },
    {
      value: "AWAITING_COPY",
      label: "Awaiting the report copy",
      tone: "warning",
      help: "A written request has gone in and nothing has come back. Keep the statutory clock in the Register of Public Records Requests, not in anyone's memory.",
    },
    {
      value: "COPY_OBTAINED",
      label: "Copy of the report obtained",
      tone: "success",
      help: "Lodge it in the Evidence Vault. A police report obtained in the ordinary course is worth far more than a recollection of what an officer said.",
    },
    {
      value: "NO_ACTION",
      label: "No action taken by the agency",
      tone: "warning",
      help: "Close it here rather than leaving it open. Repeated entries in this status against the same address are the pattern that a chief, a mayor, or a legislator can actually be shown.",
    },
    {
      value: "REFERRED_COUNSEL",
      label: "Referred to Counsel",
      tone: "warning",
      help: "The default for anything involving lawful process served on the Kingdom, a member as a subject, or a threatened claim.",
    },
    { value: "CLOSED", label: "Closed", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    {
      value: "VOID",
      label: "Void",
      tone: "danger",
      help: "Entered in error or duplicated. Void it with a reason; never delete an entry that names an agency interaction.",
    },
  ],

  fields: [
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
      section: "The interaction",
      summary: true,
      placeholder: "e.g. Broken sanctuary window, north elevation — reported to Bridgeport PD",
      help: "One neutral factual line, as it would read in an index. Describe, do not characterise, and never put a minor's name in it.",
    },
    {
      key: "interactionType",
      label: "Type of interaction",
      type: "select",
      required: true,
      section: "The interaction",
      summary: true,
      help: "The list is closed deliberately. Every legitimate dealing the Kingdom has with police and emergency services is one of these ten. If what is being contemplated does not fit any of them, that is the answer, not a gap in the form.",
      options: [
        {
          value: "CRIME_REPORT",
          label: "Report of a crime, as complainant or victim",
          help: "Damage to the meeting house, theft, vandalism, threats, harassment. Report promptly and get the incident number before the officer leaves.",
        },
        {
          value: "BIAS_INCIDENT",
          label: "Report of a bias or hate-motivated incident",
          help: "Say plainly that the Kingdom believes the incident was religiously motivated and ask that it be classified as such. Conn. Gen. Stat. § 53a-181j et seq.; the federal picture is built from what the local agency submits through the FBI's UCR and NIBRS bias-crime collection.",
        },
        {
          value: "REPORT_COPY_REQUEST",
          label: "Request for a copy of a report or an incident number",
          help: "This is a records request under the Connecticut Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq., subject to the law-enforcement exemptions at § 1-210(b)(3). Open a matching record in the Register of Public Records Requests so the statutory clock is kept.",
        },
        {
          value: "EVENT_NOTIFICATION",
          label: "Notification of an assembly, procession, or public event",
          help: "Including any municipal permit application. Apply, even where the scheme looks constitutionally doubtful; the remedy for an unlawful condition is counsel and a court, never proceeding without the permit.",
        },
        {
          value: "PATROL_REQUEST",
          label: "Request for extra patrol or a security assessment",
          help: "Ask the district commander in writing. Departments conduct physical security assessments at no charge, and the written assessment is what a Nonprofit Security Grant Program application is later built on.",
        },
        {
          value: "WELFARE_CHECK",
          label: "Request for a welfare check on a member",
          help: "Give the address, what was last known, and why there is concern. Record who asked for the check and on what information — a welfare check is an entry into someone's home and the reason for it should be written down.",
        },
        {
          value: "MANDATED_REPORT",
          label: "Mandated-reporter referral of suspected abuse or neglect of a child",
          help: "A legal duty owed by the individual who forms the suspicion, not a decision the institution makes. Conn. Gen. Stat. § 17a-101 et seq.; oral or electronic report within twelve hours (§ 17a-101b(a)), written report within forty-eight hours of it (§ 17a-101c). Failure to report is an offence (§ 17a-101a). Make the report, then record it here and in the Register of Incidents.",
        },
        {
          value: "LIAISON_DESIGNATION",
          label: "Designation or notification of a Kingdom liaison",
          help: "A named point of contact with a telephone number that is answered, notified to the department in writing. A liaison is a contact and nothing else: no powers, no credential, no title implying office.",
        },
        {
          value: "INQUIRY_OR_PROCESS",
          label: "Response to an inquiry or to lawful process served on the Kingdom",
          help: "Lawful process is complied with, or challenged through counsel in the court that issued it. It is never ignored, and never answered with a denial of that court's jurisdiction — which is read as non-appearance and produces a contempt finding against the officer who signed.",
        },
        {
          value: "MEMBER_REPORTED_CONTACT",
          label: "Interaction a member reports having had with police",
          help: "The institution's own file of what a member told it. Record it as reported, attributed to the member, and do not present it as the Kingdom's own observation.",
        },
      ],
    },
    {
      key: "interactionDate",
      label: "Date of the interaction",
      type: "date",
      required: true,
      section: "The interaction",
      summary: true,
      help: "The date of the call, the attendance, or the service of the document — not the date this entry was typed. Every deadline on this record runs from here.",
    },
    {
      key: "interactionTime",
      label: "Time, with time zone",
      type: "text",
      section: "The interaction",
      placeholder: "e.g. approximately 21:40 EDT",
      help: "As precise as honesty allows, and say where it is an estimate. Time is what dispatch logs, body-worn footage, and call records are matched against, and those are retained for a limited period.",
    },
    {
      key: "location",
      label: "Location concerned",
      type: "text",
      section: "The interaction",
      help: "The address or place the matter concerns, specific enough for a stranger to find. Repeat incidents at one address are the fact that eventually moves a department.",
    },
    {
      key: "positionOfKingdom",
      label: "Position of the Kingdom and its people in this matter",
      type: "select",
      required: true,
      section: "The interaction",
      summary: true,
      help: "The single most consequential field on the form, because it decides how the matter is handled. A record where a member is the subject is routed to Counsel and never treated as ordinary correspondence.",
      options: [
        { value: "COMPLAINANT", label: "The Kingdom or a member is the complainant" },
        { value: "VICTIM", label: "The Kingdom or a member is the victim", help: "Classify the record SEALED where any victim is named." },
        { value: "WITNESS", label: "The Kingdom or a member is a witness" },
        {
          value: "REPORTING_INSTITUTION",
          label: "The Kingdom is reporting as an institution",
          help: "A mandated report, a safeguarding referral, or a report of something found on Kingdom property.",
        },
        {
          value: "MEMBER_IS_SUBJECT",
          label: "A member is the subject of an inquiry or investigation",
          help: "The institution does not obstruct, does not conceal, does not counsel anyone on what to say, and does not take custody of anything. Record what is known, preserve anything the Kingdom already holds, and refer the member to their own lawyer.",
        },
        {
          value: "ADMINISTRATIVE",
          label: "Administrative or liaison — no person is a subject or complainant",
          help: "Event notification, liaison designation, a patrol request, a records request.",
        },
      ],
    },

    {
      key: "agencyName",
      label: "Agency",
      type: "text",
      required: true,
      section: "The agency",
      summary: true,
      placeholder: "e.g. Bridgeport Police Department, Fire Marshal's Office",
      help: "The department by its formal name, and the district, precinct, or barracks where that is how the agency organises itself. Getting the unit right is most of the work of being answered.",
    },
    {
      key: "agencyRef",
      label: "Agency in the Register of Public Bodies",
      type: "recordRef",
      refRegistry: "public-bodies",
      section: "The agency",
      help: "Link the department's standing record, which holds the address, the records officer, the district commander, and the chain above them. Keeping those details in one place is why a follow-up two years later goes to the right desk instead of the switchboard.",
    },
    {
      key: "agencyContactRef",
      label: "Related entry in the Government Contacts register",
      type: "recordRef",
      refRegistry: "government-contacts",
      section: "The agency",
      help: "Where this interaction forms part of a wider dealing with the same body — a letter to the chief, a meeting with the mayor's office — link it, so the department's file reads as one continuous history rather than two.",
    },
    {
      key: "channel",
      label: "How contact was made",
      type: "select",
      section: "The agency",
      options: [
        { value: "EMERGENCY_CALL", label: "Emergency call (911)" },
        { value: "NON_EMERGENCY_LINE", label: "Non-emergency telephone line" },
        { value: "OFFICER_ATTENDED", label: "Officer attended in person" },
        { value: "STATION_IN_PERSON", label: "Attended the station or desk in person" },
        { value: "LETTER", label: "Letter", help: "The strongest form of record for anything not urgent. Keep the proof of delivery." },
        { value: "EMAIL", label: "Email" },
        { value: "ONLINE_PORTAL", label: "Online reporting portal", help: "Record the confirmation or reference number the portal returns; it is the only proof the submission was made." },
        { value: "SERVED_ON_KINGDOM", label: "Document served on the Kingdom", help: "Note who accepted it, where, and at what time. Route it to Counsel the same day." },
      ],
    },
    {
      key: "officerName",
      label: "Officer or dispatcher, as they gave it",
      type: "text",
      section: "The agency",
      help: "Ask for the name and write it down at the time. Record it exactly as given — not as later corrected — because a name given wrongly is itself a fact worth having.",
    },
    {
      key: "officerIdentifier",
      label: "Badge or identification number, as given",
      type: "text",
      section: "The agency",
      help: "As stated by the officer or read from the uniform or card. This is the detail people intend to note and almost never do, and it is what makes a later complaint or records request specific rather than vague.",
    },
    {
      key: "agencyCaseNumber",
      label: "Case or incident number issued by the agency",
      type: "text",
      section: "The agency",
      summary: true,
      help: "Ask for it before the officer leaves, or from the call taker at the end of the call. Without this number a records request has nothing to identify and a follow-up has nothing to cite. It is the single most valuable thing to come out of most interactions.",
    },

    {
      key: "whatWasReported",
      label: "What was reported",
      type: "textarea",
      required: true,
      section: "What was said",
      help: "The factual account given to the agency, written the same day. Facts only — what was observed, by whom, in what order. No speculation about who did it, no legal characterisation, and no apology or admission on the Kingdom's behalf.",
    },
    {
      key: "whatWasRequested",
      label: "What was asked for",
      type: "textarea",
      section: "What was said",
      help: "The specific thing sought: that a report be taken, that the incident be classified as bias-motivated, that a patrol pass the building at closing, that a copy of the report be provided. A request nobody stated is a request nobody refused.",
    },
    {
      key: "agencyResponse",
      label: "What was said in return",
      type: "textarea",
      section: "What was said",
      help: "What the officer or dispatcher actually said, as close to their words as memory allows, including a refusal or a referral elsewhere. Where anything was promised, send a short confirming email the same day and note it here — an unconfirmed undertaking is one person's recollection.",
    },
    {
      key: "reportTaken",
      label: "A report was taken",
      type: "boolean",
      section: "What was said",
      summary: true,
      help: "Where an officer declined to take one, record that and the reason given. A refusal to take a report is itself a fact, and it is the one that matters when a pattern is later put to a chief.",
    },
    {
      key: "photographsTaken",
      label: "Photographs or footage were taken before anything was cleaned up or repaired",
      type: "boolean",
      section: "What was said",
      help: "Photograph first, always — wide enough to show where, close enough to show what. Most camera systems overwrite within a fortnight, and damage is cleaned up within hours.",
    },

    {
      key: "copyRequested",
      label: "A written request for the report has been made",
      type: "boolean",
      section: "The report copy",
      help: "Under the Connecticut Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq. A verbal request at the counter creates no clock and no appeal right; a written one creates both.",
    },
    {
      key: "recordsRequestRef",
      label: "Related records request",
      type: "recordRef",
      refRegistry: "records-requests",
      section: "The report copy",
      help: "Open the request there and link it here. That register keeps the four-business-day response period and the thirty-day appeal window to the Freedom of Information Commission (Conn. Gen. Stat. §§ 1-206(a), 1-206(b)(1)); this one keeps the interaction.",
    },
    {
      key: "copyObtained",
      label: "A copy of the report has been obtained",
      type: "boolean",
      section: "The report copy",
      summary: true,
    },
    {
      key: "copyObtainedDate",
      label: "Date the copy was obtained",
      type: "date",
      section: "The report copy",
      help: "Lodge the copy in the Evidence Vault on the day it arrives. Where it was withheld or redacted, ask which subdivision of Conn. Gen. Stat. § 1-210(b) is relied on and record the answer rather than the argument.",
    },

    {
      key: "safeguardingFlag",
      label: "This record names, or could identify, a minor or a victim",
      type: "boolean",
      section: "Safeguarding and persons",
      help: "Where this is checked, set the record's classification to SEALED before saving. Redaction after the fact is unreliable; classifying at entry is not.",
    },
    {
      key: "personsNamed",
      label: "Persons named",
      type: "textarea",
      classification: "SEALED",
      section: "Safeguarding and persons",
      help: "Adults by name, with their connection to the matter. **Never enter a minor's name** — use their record number on the Roll of Citizens, or a neutral descriptor such as \"child A, age 9\".",
    },
    {
      key: "mandatedReportStatus",
      label: "Mandated report",
      type: "select",
      classification: "SEALED",
      section: "Safeguarding and persons",
      help: "Answer honestly on the day. Nothing recorded here discharges the duty; the duty is owed personally by the individual who formed the suspicion.",
      options: [
        {
          value: "NOT_APPLICABLE",
          label: "Not applicable — no child or vulnerable adult concern arises",
          help: "Only where nothing in the matter could give reasonable cause to suspect. If there is any doubt, the answer is not this one.",
        },
        {
          value: "MADE",
          label: "Made",
          help: "Record who made it, to whom, and when. The written report to the Commissioner follows within forty-eight hours of the oral report under Conn. Gen. Stat. § 17a-101c.",
        },
        {
          value: "DUE_NOT_YET_MADE",
          label: "Due and not yet made",
          help: "The twelve-hour period in Conn. Gen. Stat. § 17a-101b(a) is running against the individual reporter now. Stop and make the report. Nothing else on this form matters until it is made.",
        },
        {
          value: "MADE_BY_ANOTHER",
          label: "Believed made by another reporter",
          help: "Belief is not a defence. Anyone who personally has reasonable cause to suspect makes their own report and then confirms the other was made.",
        },
      ],
    },
    {
      key: "mandatedReportDate",
      label: "Date the oral or electronic report was made",
      type: "date",
      classification: "SEALED",
      section: "Safeguarding and persons",
      help: "The forty-eight hour period for the written report to the Commissioner under Conn. Gen. Stat. § 17a-101c runs from this date. The fuller safeguarding record belongs in the Register of Incidents; this field exists so the duty is visible from the police-facing file as well.",
    },

    {
      key: "processServed",
      label: "Lawful process served on the Kingdom",
      type: "select",
      section: "Process served on the Kingdom",
      help: "Process is complied with, or challenged through counsel in the court that issued it. It is never ignored, and it is never answered with a document denying that court's jurisdiction.",
      options: [
        { value: "NONE", label: "None — no process was served" },
        { value: "SUBPOENA", label: "Subpoena", help: "Route to Counsel the same day. A return date missed while the Kingdom considers its position is a contempt finding against the officer who signed." },
        { value: "SEARCH_WARRANT", label: "Search warrant", help: "Do not obstruct, do not remove or destroy anything, and do not argue at the door. Note the officers present, the time, the issuing court, and what was taken, and telephone Counsel." },
        { value: "COURT_ORDER", label: "Other court order" },
        { value: "PRESERVATION_REQUEST", label: "Preservation request or letter", help: "Suspend any routine deletion touching the described material immediately, and record the date the hold attached." },
        { value: "INFORMAL_REQUEST", label: "Informal request for information — no process", help: "There is no obligation to answer an informal request, and there is often good reason to. That is a decision for Counsel, taken deliberately and dated, not a decision for whoever answered the telephone." },
        { value: "OTHER", label: "Other", help: "Describe it below and route it to Counsel." },
      ],
    },
    {
      key: "processServedDate",
      label: "Date process was served",
      type: "date",
      section: "Process served on the Kingdom",
      help: "The date and, in the notes, the hour it was accepted and by whom. Response and return periods run from service, and they are not extended by an internal delay in passing the papers on.",
    },
    {
      key: "processResponse",
      label: "How the Kingdom responded",
      type: "textarea",
      section: "Process served on the Kingdom",
      help: "Complied, produced in part with objections, moved to quash, sought an extension by agreement. Record the date of each step. The one entry that must never appear here is that the Kingdom denied the court's authority and did nothing.",
    },

    {
      key: "counselInvolvement",
      label: "Counsel",
      type: "select",
      section: "Follow-up",
      summary: true,
      options: [
        { value: "NOT_INVOLVED", label: "Not involved", help: "Appropriate for routine liaison, event notification, and most complainant reports." },
        { value: "NOTIFIED", label: "Notified" },
        { value: "ADVISING", label: "Advising" },
        { value: "REPRESENTING", label: "Representing the Kingdom in the matter" },
        {
          value: "MEMBER_HAS_OWN_COUNSEL",
          label: "The member has their own counsel",
          help: "Where a member is a subject, this is the right answer. Kingdom counsel acts for the institution; a member who needs advice needs their own lawyer, and saying so early prevents a conflict that would disqualify both.",
        },
      ],
    },
    {
      key: "followUpNeeded",
      label: "Follow-up needed",
      type: "textarea",
      section: "Follow-up",
      help: "The specific next step and who owns it: chase the report copy, write to the district commander, confirm the patrol request in writing, ask the chief why no report was taken. Write it for an officer who has never seen the file.",
    },
    {
      key: "followUpDate",
      label: "Follow-up date",
      type: "date",
      section: "Follow-up",
      help: "The day the Kingdom will chase this if nothing has come back. Set it on every interaction that asked for anything; a request nobody follows up was never really made.",
    },

    {
      key: "incidentRef",
      label: "Related incident record",
      type: "recordRef",
      refRegistry: "incidents",
      section: "Cross-references and disposition",
      help: "Where the underlying event is logged in the Register of Incidents. That register holds the safeguarding position, the insurance notice, and the preservation date; this one holds the dealing with the agency. Link them rather than restating either.",
    },
    {
      key: "evidenceRef",
      label: "Evidence deposit",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Cross-references and disposition",
      help: "Photographs, footage, the report copy, and any written correspondence with the agency, lodged with a custody record. Material with a custody record is usable; the same material loose in a mailbox frequently is not.",
    },
    {
      key: "agencyOutcome",
      label: "Outcome at the agency",
      type: "select",
      section: "Cross-references and disposition",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "UNDER_INVESTIGATION", label: "Under investigation" },
        { value: "REFERRED_PROSECUTOR", label: "Referred to the prosecuting authority" },
        { value: "ARREST_MADE", label: "Arrest made" },
        { value: "NO_ACTION", label: "No action taken", help: "Record it as an outcome rather than leaving the entry open. Repeated no-action outcomes at one address are the pattern worth putting to a chief." },
        { value: "CLOSED_BY_AGENCY", label: "Closed by the agency" },
        { value: "REQUEST_GRANTED", label: "Request granted", help: "For patrol, assessment, permit, and records requests." },
        { value: "REQUEST_REFUSED", label: "Request refused" },
        { value: "UNKNOWN", label: "Unknown — the agency has not said" },
      ],
    },
    {
      key: "outcomeDetail",
      label: "Outcome in detail",
      type: "textarea",
      section: "Cross-references and disposition",
      help: "What actually resulted and what changed because of it. Over years this is what shows which departments respond, to what, and to whom — which is the intelligence a liaison relationship is for.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      classification: "SEALED",
      section: "Cross-references and disposition",
      help: "Assessment and handling notes, kept apart from the factual account above so that the account remains disclosable. Assume this may be reached in discovery notwithstanding any privilege claim, and write nothing here that could not be read aloud.",
    },
  ],

  deadlineRules: [
    {
      id: "psl-dcf-written-report",
      title: "Written report to the Commissioner of Children and Families due",
      fromField: "mandatedReportDate",
      offsetDays: 2,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 17a-101c",
      detail:
        "A written or electronic report must reach the Commissioner or the Commissioner's designee not later than forty-eight hours after the oral report. Making the call and omitting the writing is a common and entirely avoidable failure, and the duty is not discharged until both are done. Confirm it against the matching entry in the Register of Incidents so the two records do not diverge.",
      when: (data) =>
        data.interactionType === "MANDATED_REPORT" || data.mandatedReportStatus === "MADE",
    },
    {
      id: "psl-process-to-counsel",
      title: "Lawful process served — confirm Counsel holds it",
      fromField: "processServedDate",
      offsetDays: 1,
      severity: "CRITICAL",
      detail:
        "Confirm by name that Counsel has the papers and that any return or compliance date is diarised. Process is complied with or challenged in the issuing court; it is never ignored and never answered with a denial of that court's jurisdiction, which is read as non-appearance and produces sanctions against the officer who signed. Where the process describes documents or data, suspend routine deletion touching them today.",
      when: (data) => Boolean(data.processServed) && data.processServed !== "NONE",
    },
    {
      id: "psl-request-report-copy",
      title: "Report taken but no written request for a copy has gone in",
      fromField: "interactionDate",
      offsetDays: 7,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 1-200 et seq.; § 1-210(b)(3)",
      detail:
        "A week has passed since a report was taken and no written request for a copy has been made. Send one under the Connecticut Freedom of Information Act and open the matching record in the Register of Public Records Requests, which keeps the four-business-day response period and the thirty-day appeal window. Expect withholding while the matter is open under the law-enforcement exemptions at § 1-210(b)(3), and ask which subdivision is relied on. A report never requested is a report the Kingdom cannot produce when it matters.",
      when: (data) => data.reportTaken === true && !data.copyObtained && !data.copyRequested,
    },
    {
      id: "psl-follow-up",
      title: "Follow-up due on a public safety interaction",
      fromField: "followUpDate",
      offsetDays: 0,
      severity: "ROUTINE",
      detail:
        "The date set for chasing this has arrived. If nothing has come back, write a short second letter citing the case or incident number and the date of the first, and record it as a new interaction. Two documented approaches are a pattern; one is an anecdote.",
      when: (data) => data.agencyOutcome !== "CLOSED_BY_AGENCY",
    },
  ],
};

export default publicSafety;
