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

The exposure is personal and criminal rather than institutional and civil. Holding a private person out as a peace officer is criminal impersonation under Conn. Gen. Stat. §§ 53a-130 and 53a-130a. Making or wearing anything resembling a federal badge or insignia reaches 18 U.S.C. § 701; representing oneself as a federal officer reaches § 912; producing an identification document purporting to be issued by a governmental body reaches § 1028; and filing a false lien against a federal officer on account of their official duties is a felony under § 1521. Where the target is a municipal officer rather than a federal one, the Connecticut forgery provisions at Conn. Gen. Stat. § 53a-137 et seq. reach an instrument purporting to affect a legal right; the federal list is not a map of where the rule stops. Read all of it as protective, because it is: one embroidered patch turns an institution the police were prepared to help into a file the department forwards to its legal division, and that goodwill does not come back.

**Stewards at Kingdom events.** People who marshal parking, watch doors, and keep order are stewards. They wear nothing that reads as police — no shield, no chevron, no lettering implying office, no title containing "officer", "marshal", or "patrol" used as a rank — and they carry no badge. Their authority is exactly that of any private person on private property: to ask someone to leave, and to call the police if they will not. A steward who instead takes hold of someone, confines them, or searches them is the person who answers for it, on a charge of assault or unlawful restraint and in a civil claim alongside it. Conn. Gen. Stat. § 53a-20 gives a person in control of premises a justification for reasonable physical force to terminate a trespass, but a justification is what is argued after an arrest, not a permission to be relied on in a doorway. And where stewarding is paid, or is provided to anybody other than the Kingdom at the Kingdom's own gatherings, Connecticut's licensing regime for security services may be engaged; those provisions sit in Conn. Gen. Stat. Title 29, and the position should be settled with counsel before money changes hands or a steward stands at anyone else's door.

**How to be effective as a complainant.** Report promptly, before anyone debates whether it is worth reporting. Get the incident number before the officer leaves; without it every later request goes nowhere. Write down the officer's name and badge number exactly as they gave it. Photograph damage before cleaning up — wide enough to show where, close enough to show what — and lodge the images in the Evidence Vault the same day. Where an officer declines to take a report, do not argue at the scene: attend the records division, or use the department's online reporting portal, and make the report in writing there, which produces a number whatever view was taken on the street. Then request the report in writing under the Connecticut Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq., opening a record in the Register of Public Records Requests, which keeps the response period and the free thirty-day appeal to the Freedom of Information Commission (§§ 1-206(a), 1-206(b)(1)). Be exact about that first period rather than announcing it. A denial must be made in writing within four business days and silence is deemed a denial, but § 1-206(a) allows ten business days where the request is determined to reach records subject to Conn. Gen. Stat. § 1-214(b) and (c) — an employee's personnel or medical file, which a request touching a named officer's conduct frequently is — and the officer must be notified and may object. That is a lawful delay rather than an evasion, and a letter that has already announced a four-day deadline reads badly against it. Expect withholding while a matter is open under the law-enforcement exemptions at § 1-210(b)(3), and ask which subdivision is relied on rather than arguing about the result. One thing is not discretionary: where an arrest has been made, the record of the arrest is a public record under Conn. Gen. Stat. § 1-215 notwithstanding that the investigation continues. Confirm that section's current text and what it obliges the agency to release before pressing it — the value of knowing it is in asking for the right document, not in arguing the exemption.

**Writing to the right desk, and addressing it correctly.** Connecticut has no single model of local policing, and a letter addressed to a body that does not exist is not forwarded but discarded. Cities and larger towns run their own departments under a chief of police. Many smaller towns run none, and are policed by the Connecticut State Police troop with jurisdiction, in some cases through a resident state trooper serving under an agreement between the town and the Department of Emergency Services and Public Protection; the constituting section sits in Conn. Gen. Stat. Title 29 and should be confirmed against the current General Statutes before it is cited. Establish which arrangement applies before writing, and record it on the department's standing entry in the Register of Public Bodies so nobody establishes it twice.

Then address the person by the title they actually hold. A chief is *Chief ——*; a state police troop is commanded by an officer addressed by rank; a fire marshal is *Fire Marshal ——*. The municipality's chief executive is a first selectman in some towns, a mayor in others, and a town manager in others again, and the three are not interchangeable — check the town's own website before the salutation is typed, because it is the first line read and the first thing noticed. Records go to the department's records division or the town's designated freedom of information officer, not to the chief; a request sent to the chief reaches the records division eventually, and later than one addressed there.

**Name the records, not the subject.** A police department holds a set of discrete documents, and a request that names them can be answered, where a request for everything concerning an incident is refused as vague and takes weeks to be refused. The usual set is the incident or case report and its supplements, the computer-aided dispatch event chronology for the call, the recording of the 911 call and of the dispatch radio traffic, body-worn and dashboard camera recordings for the officers who attended, the arrest report or the summons where there was one, photographs taken by an evidence technician, and the property or evidence receipt for anything taken. Ask for what is wanted by name, give the case number and the date, and give a time window for the recordings. Doing that work is the difference between a records officer who can say yes and one who must write back.

**Preserve before requesting.** Recordings go first. Dispatch audio, computer-aided dispatch data, and body-worn camera footage are held on retention schedules measured in months rather than years — the body-worn recording provisions sit in Conn. Gen. Stat. Title 29, and both the section and the current minimum period should be confirmed before either is relied on — and private camera systems around a site usually overwrite inside a fortnight. A written preservation request costs nothing, asks for nothing to be produced, and stops the material being destroyed while a records request is argued about. Send one the same week to the records division, naming the case number, the date, the location, and the time window. It is a request, not a demand, and it is never styled as process.

**Bias-motivated incidents.** A defaced door, a threat naming the congregation's faith, repeated vandalism of the same religious property: here the quality of the file decides the outcome, and quality is a matter of facts rather than of emphasis. Connecticut punishes intimidation based on bigotry or bias in degrees under Conn. Gen. Stat. § 53a-181j et seq. An officer cannot classify an incident as bias-motivated because a complainant says it was; the officer records what supports the classification, and a supervisor and eventually a prosecutor read that record. So supply the predicate and let it carry the conclusion: the words or symbols used, verbatim and photographed; that the property is a place of worship and was identifiable as one from the street; the dates and case numbers of every prior incident at the same address; what was said, by whom, and to whom. Then say once, plainly, that the Kingdom believes the incident was religiously motivated and asks that it be classified as such, and ask that the request be noted in the report. Classification is done by the local agency, and the federal picture is assembled from what agencies submit through the FBI's Uniform Crime Reporting and NIBRS bias-crime collection. Connecticut separately requires state-level collection of such offences; confirm the current section before citing it. Four dated, photographed, numbered, professionally reported incidents are a case a prosecutor can bring. The same four recalled from memory a year later are an impression.

**Three different ladders, and using the right one.** A department that will not produce a record is a freedom of information matter: the records officer, then the chief, then a complaint to the Freedom of Information Commission, which is free to file and needs no counsel. A complaint about how an officer behaved is not that, and sending it up the records ladder wastes it — it goes to the department's internal affairs function, then to whatever civilian authority the town places above the department, and, for a certified officer, to the Police Officer Standards and Training Council, which certifies Connecticut officers and may act against certification; its constituting provisions are at Conn. Gen. Stat. § 7-294a et seq., and the current complaint route should be taken from the Council's own published procedure rather than assumed. A legislative office is a third thing again. A legislator can ask an agency for the status of a matter and can be shown a pattern across years; a legislator cannot direct an investigation, cannot instruct a police department, and will decline to try — and asking is the request that ends the relationship. Approach a legislator through a member who lives in that member's district, with dates, case numbers, and one bounded question. Indignation is not a rung on any of the three.

**When a member is the subject rather than the complainant.** The institution does not obstruct, does not conceal, does not counsel anyone on what to say, and does not take custody of anything. Record what the Kingdom knows and refer the member to their own lawyer — not the Kingdom's, whose duty runs to the institution. Do not collect statements from other members; an internal inquiry running alongside a criminal investigation interferes with it and creates discoverable material that helps no one. Anything relevant the Kingdom already holds is preserved exactly as it is, and Counsel is told. Destroying, altering, or concealing it is tampering with physical evidence under Conn. Gen. Stat. § 53a-155, and the hindering-prosecution offences nearby reach the rest; confirm the pin cite before relying on a section.

**Lawful process served on the Kingdom** — a subpoena, a warrant, a court order — is complied with, or challenged through counsel in the issuing court. It is never ignored, and never answered with a document denying that court's jurisdiction: that is read as non-appearance, and what follows is a contempt finding against the officer who signed. Log it the hour it arrives and route it to Counsel the same day.

**Mandated reporting is a legal duty, not an institutional choice.** Where anyone forms reasonable cause to suspect that a child has been abused or neglected or placed in imminent risk of serious harm, the duty is that individual's own under Conn. Gen. Stat. § 17a-101 et seq.: an oral or electronic report to the Commissioner of Children and Families or a law enforcement agency as soon as practicable and within twelve hours (§ 17a-101b(a)), then a written report within forty-eight hours of it (§ 17a-101c). Clergy are enumerated mandated reporters (§ 17a-101(b)), and failure to report is itself an offence (§ 17a-101a). No officer of the Kingdom, the Founder included, may tell a reporter to wait, and internal handling is never a substitute. Report first, then enter it here and in the Register of Incidents.

**Assemblies, patrol, and a named liaison.** Notify the department in advance of anything drawing a crowd or touching a public way, and apply for whatever permit the municipality requires. A permit scheme reaching religious assembly on public ways is constrained by the First Amendment — content neutral, narrowly tailored, free of unbridled discretion (*Cox v. New Hampshire*, 312 U.S. 569 (1941); *Forsyth County v. Nationalist Movement*, 505 U.S. 123 (1992)) — but the answer to an unconstitutional condition is counsel and a court, never proceeding without the permit and daring the town to act. Extra patrol and a physical security assessment may simply be asked for in writing from whoever commands the district, or the troop, covering the site; departments assess at no charge, and the written result is what an application to the federal Nonprofit Security Grant Program, administered through each state's homeland security administrative agency, is built on. Check that programme's current notice of funding opportunity each cycle rather than any figure recalled from memory. And designate one liaison: a named person, a number that is answered, notified in writing and refreshed annually.`,
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
      help: "The list is closed deliberately. Every legitimate dealing the Kingdom has with police, fire, and emergency services is one of these twelve. If what is being contemplated does not fit any of them, that is the answer, not a gap in the form.",
      options: [
        {
          value: "CRIME_REPORT",
          label: "Report of a crime, as complainant or victim",
          help: "Damage to the meeting house, theft, vandalism, threats, harassment. Report promptly and get the incident number before the officer leaves.",
        },
        {
          value: "BIAS_INCIDENT",
          label: "Report of a bias or hate-motivated incident",
          help: "Supply the predicate before the conclusion: the words or symbols used, verbatim and photographed; that the property was identifiable as a place of worship; the case numbers of every prior incident at the address. Then say once that the Kingdom believes the incident was religiously motivated and asks that it be classified as such. Do not assert a motive the evidence does not carry — an overstated report the department cannot substantiate is why the next one is discounted, and the next one may be the one that matters. Conn. Gen. Stat. § 53a-181j et seq.; the federal picture is built from what the local agency submits through the FBI's UCR and NIBRS bias-crime collection.",
        },
        {
          value: "REPORT_COPY_REQUEST",
          label: "Request for a copy of a report or an incident number",
          help: "This is a records request under the Connecticut Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq., subject to the law-enforcement exemptions at § 1-210(b)(3). Open a matching record in the Register of Public Records Requests so the statutory clock is kept.",
        },
        {
          value: "EVENT_NOTIFICATION",
          label: "Notification of an assembly, procession, or public event",
          help: "Including any municipal permit application. Give the department what it needs to plan rather than what it must write back for: the date, the start and finish times, the expected attendance, the route where anything moves, whether a street or lane must be closed, whether there will be amplified sound, the parking arrangement, and a name and mobile number answered on the day. Apply, even where the scheme looks constitutionally doubtful; the remedy for an unlawful condition is counsel and a court, never proceeding without the permit.",
        },
        {
          value: "PATROL_REQUEST",
          label: "Request for extra patrol or a security assessment",
          help: "Ask in writing, addressed to whoever commands the district or the troop covering the site. Departments conduct physical security assessments at no charge, and the written assessment is what a Nonprofit Security Grant Program application is later built on.",
        },
        {
          value: "FIRE_SAFETY_INSPECTION",
          label: "Fire marshal inspection, order, or life-safety requirement",
          help: "The local fire marshal's inspection of an assembly space, and anything ordered as a result. Get the order in writing with the provision it rests on, comply or appeal by the route the order itself states, and keep the certificate. The occupancy figure a fire marshal fixes decides how many people may lawfully be in the room, and a building is lost this way faster than it is lost to zoning. No religious argument answers a life-safety order and none should be attempted; RLUIPA is a land-use statute, not a fire code exemption.",
        },
        {
          value: "EMERGENCY_MEDICAL",
          label: "Emergency medical or fire response to Kingdom premises or an event",
          help: "An ambulance or an engine called to a service, a gathering, or Kingdom property. Record the time, who called, and the run or incident number, and lodge the note the same day — these calls are the ones nobody thinks to write down and the ones an insurer asks about a year later. Keep clinical detail out of this register: the fact of the call belongs here, and anything about a member's condition belongs in the Register of Incidents, classified.",
        },
        {
          value: "WELFARE_CHECK",
          label: "Request for a welfare check on a member",
          help: "Give the department what it needs to go in safely: the exact address with the unit, who is believed to be inside, what was last known and when, whether there is any history of weapons in the home, any medical or psychiatric condition and any medication, who holds a key, and what is being asked for. Where the concern is mental health rather than immediate safety, ask whether a crisis-trained officer or a mobile crisis team is available. Record who asked for the check and on what information. A welfare check is an entry into somebody's home, and it is not a way to reach a person who is in dispute with the Kingdom or who has asked not to be contacted; a department that sees it used that way stops answering.",
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
      help: "The street number, the unit, and the nearest cross street. Dispatch works from the address it is given, and an approximate one sends officers to the wrong door; the same specificity is what makes a records request answerable two years later.",
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
      key: "addressedTo",
      label: "Person and title the approach was addressed to",
      type: "text",
      section: "The agency",
      placeholder: "e.g. Chief —— , Bridgeport Police Department; or Records Division",
      help: "For anything written. The title exactly as the office itself gives it — chief, lieutenant, fire marshal, first selectman, mayor, town manager, records officer — because the salutation is the first line read and the wrong title is the first thing noticed. Where the approach went to a division rather than a person, name the division. The standing entry in the Register of Public Bodies holds the current holder; check it against the town's own website before writing.",
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
      key: "deliveryEvidence",
      label: "Proof of delivery",
      type: "text",
      section: "The agency",
      help: "For anything written: the certified mail article number, the courier tracking, the portal confirmation reference, or the name of the person at the desk who accepted it. Without this, an unanswered letter proves nothing, and a department's account that it never arrived cannot be answered.",
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
      key: "preservationRequested",
      label: "A written preservation request has been sent",
      type: "boolean",
      section: "The report copy",
      help: "Asking the records division to preserve the dispatch audio, the computer-aided dispatch data, and any body-worn or dashboard camera recording, identified by case number, date, location, and time window. It costs nothing, asks for no production, and is the only step that outlasts a retention schedule while a records request is being argued about. It is a request and is never styled as process.",
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
        { value: "SUBPOENA", label: "Subpoena", help: "Route to Counsel the same day. A return date missed while the Kingdom considers its position produces a motion for contempt, and the sanction falls on the person or body the subpoena was directed to. An objection or a motion to quash, filed on time, costs nothing by comparison." },
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
        { value: "NO_ACTION", label: "No action taken", help: "Record it as an outcome rather than leaving the entry open, and ask in writing for the reason the matter was closed and under what classification. A closure with a stated reason can be answered; a file that simply stops cannot." },
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
      id: "psl-preserve-recordings",
      title: "Recordings at risk — no preservation request has been sent",
      fromField: "interactionDate",
      offsetDays: 3,
      severity: "HIGH",
      detail:
        "Officers attended or a call was made, and no written preservation request has gone in. Dispatch audio, computer-aided dispatch data, and body-worn camera recordings are held on short retention schedules, and private camera systems around a site overwrite sooner still. Send a preservation request to the records division today, naming the case number, the date, the location, and the time window. Preservation is asked for separately from production and earlier than it; a request for a copy argued about for a month is worth nothing once the recording is gone.",
      when: (data) =>
        !data.preservationRequested &&
        (data.channel === "OFFICER_ATTENDED" ||
          data.channel === "EMERGENCY_CALL" ||
          data.interactionType === "CRIME_REPORT" ||
          data.interactionType === "BIAS_INCIDENT"),
    },
    {
      id: "psl-request-report-copy",
      title: "Report taken but no written request for a copy has gone in",
      fromField: "interactionDate",
      offsetDays: 7,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 1-200 et seq.; § 1-210(b)(3)",
      detail:
        "A week has passed since a report was taken and no written request for a copy has been made. Send one under the Connecticut Freedom of Information Act and open the matching record in the Register of Public Records Requests, which keeps the four-business-day response period and the thirty-day appeal window. Expect withholding while the matter is open under the law-enforcement exemptions at § 1-210(b)(3), and ask which subdivision is relied on. The seven days is this register's own interval and not a statutory one: the Act fixes the period in which an agency must answer a request, not any period within which a request must be made. A report never requested is a report the Kingdom cannot produce when it matters.",
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
