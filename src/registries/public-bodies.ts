import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Public Bodies and Officials.
 *
 * The directory that answers, before a letter is drafted, who exactly the
 * Kingdom writes to, at what address, under what title, and what happened last
 * time. Correspondence with government fails far more often because it reached
 * the wrong office than because it said the wrong thing, and the officer who
 * knows which desk actually decides a matter is always one resignation away
 * from taking that knowledge with them. This register is where it stays.
 */

const publicBodies: RegistryDef = {
  slug: "public-bodies",
  title: "Register of Public Bodies and Officials",
  shortTitle: "Public Bodies",
  recordLabel: "Body",
  recordLabelPlural: "Bodies",
  group: "relations",
  numberPrefix: "PBO",
  order: 2,
  authority: "Charter Art. VI (External Relations & Non-Interference); Art. IV §9",
  description:
    "Every public body and official the Kingdom deals with — the correct office, the correct title, the records officer, counsel to the body, the legal hook that applies, and how the relationship currently stands.",
  guidance: `Correspondence with government fails far more often because it went to the wrong office than because it said the wrong thing. A letter to a mayor about a matter a zoning enforcement officer decides is forwarded, or is not; either way a month is gone. This register exists so that the next letter starts from what the last one learned, and so that the departure of the officer who built a relationship does not take it with them.

**Write to the office with authority to give you what you want.** That office is almost never the most senior name available. A certificate of occupancy is issued by the building official, not the mayor. A special permit is granted by the commission, not by its chairman personally. A records request is answered by the designated records officer, and the four-business-day clock in Conn. Gen. Stat. § 1-206(a) runs against the body only once the request reaches someone with authority to answer for it. Before drafting, settle two questions and record the answers here: what does this office have power to give, and under what provision does it hold that power. A body constituted for one purpose will refuse a request outside it however well the request is written.

**Titles, because getting one wrong is read as not having done the work.** Elected officials and judges take *The Honorable [full name]* in the address block, with the office in the salutation. A mayor: *The Honorable —— ——, Mayor of the City of ——*, salutation *Dear Mayor ——*. A first selectman: *The Honorable —— ——, First Selectman, Town of ——*, salutation *Dear First Selectman ——*; some Connecticut towns style the office First Selectwoman, and the right answer is whichever the town's own site and minutes use. Not every Connecticut town has a first selectman at all. In a council-manager town the chief executive is an appointed town manager, addressed by that title and taking no honorific, while a mayor in the same town may preside over the council and decide nothing individually; writing to the ceremonial officer about an administrative matter loses a month. A borough is headed by a warden with a board of burgesses, and a letter addressed to the mayor of a borough tells the recipient before the first line that the writer has not looked. A state representative: *The Honorable —— ——, State Representative, ——th Assembly District, Connecticut General Assembly*, salutation *Dear Representative ——*. A state senator also takes *Dear Senator ——*, which is how a United States Senator is addressed — so the address block must say *State Senator, ——th Senatorial District* or the letter reads as though it were meant for Washington. Take the Hartford mailing address from the General Assembly's own site, not from memory. A state agency head: *Commissioner —— ——, Department of ——*, salutation *Dear Commissioner ——*; deputy commissioners and bureau chiefs are not commissioners. A municipal chief of police: *Chief —— ——, Chief of Police, —— Police Department*, salutation *Dear Chief ——*; a number of Connecticut towns maintain no department of their own and are policed by the State Police, in several cases through a resident state trooper, and there the counterpart is the troop commander and there is no chief to write to. A United States Representative: *The Honorable —— ——, U.S. House of Representatives, Washington, DC 20515*, salutation *Dear Representative ——*; a Senator: *United States Senate, Washington, DC 20510*, salutation *Dear Senator ——*. Casework goes to the district office rather than to Washington, because that is where a constituent problem is actually worked. An agency records officer takes no honorific: name, then *Freedom of Information Officer* or *Public Records Administrator*, salutation *Dear Ms. ——*; in many Connecticut towns the designated officer is the Town Clerk. A municipal lawyer takes *Esq.* and the office's own title, which varies between Corporation Counsel, City Attorney, and Town Attorney; *Dear Attorney ——* is ordinary Connecticut usage. Never write to a judge about a pending matter at all — that is an ex parte communication, and it damages the case it was meant to help. Two habits do as much damage as a wrong title. *To Whom It May Concern*, on a letter to an office whose staff are published on its own website, says the writer did not trouble to find out who works there. And *The Honorable* is never combined with *Esq.*, nor with *Mr.* or *Ms.*; the compound is the mark of a form letter.

**Make it possible for the office to say yes without doing the Kingdom's work first.** A public office disposes of correspondence in the order it can dispose of it, and anything obliging the recipient to write back for a missing fact goes to the bottom of the pile. In a busy department the bottom of the pile is where matters die, quietly and without anyone deciding anything. Every letter should carry on its face the date; the body's own file, application, or permit number where one exists; the street address and the assessor's parcel identification where the matter concerns land; the decision complained of, by its date and by the date its notice was published; the specific thing sought, in one sentence, in the first or second paragraph; the enclosures, listed; and a named signer with an office, a direct telephone number, and a return address. Record the body's own reference number here the moment it is issued. It is the only string by which the body can retrieve its own file, and a clerk who cannot retrieve the file cannot answer the letter however sympathetic they are.

**Two things harden an office against a matter that was going perfectly well.** The first is a deadline imposed on the recipient where no statute imposes one — *you must respond within ten days* — which is unenforceable, reads as a threat, and moves the letter from the clerk who could have helped to the lawyer whose job is to say no. State instead the date on which the Kingdom will follow up: it is courteous, it is within the Kingdom's own control, and it converts silence into a scheduled event rather than an insult. The second is copying a routine staff matter to the mayor, the council, and the press. That does not produce speed. It produces an internal chain about how to handle the sender, and a staff member who will now do nothing without clearance. Escalate deliberately, one step at a time, and record each step here.

**Once a body is represented by counsel on a matter, correspond with counsel.** From the moment litigation is anticipated or an attorney appears, letters to the client are at best ignored and at worst treated as an attempt to go around the lawyer. Record counsel's name here the day it becomes known, and set the represented flag, so that no officer of the Kingdom writes to the client by habit.

**Record the posture honestly.** A register that describes an unresponsive planning office as "cooperative" because that is the pleasanter word is worthless to the officer who inherits it. An honest record of three unanswered letters and a refused meeting is the beginning of a Freedom of Information appeal, an equal-terms comparison, or a legislator's casework request. A diplomatic record of the same facts is the beginning of nothing.

**Write every entry as though the body it describes will one day read it, because one of them may.** This register is internal, but internal is not privileged, and in litigation or an administrative appeal a party's own files are ordinarily obtainable. That is not a reason to soften the posture field. Dated facts survive being quoted back: an accurate account of three unanswered letters reads the same in a hearing room as it does here, and it is the entry that does the work. What does not survive is characterisation of individuals, speculation about motive, and anything written in temper — quoted back, those turn a well-founded complaint into evidence of a grievance, and the reader stops assessing the facts and starts assessing the writer. Keep them out of the factual fields altogether.

**Record where the leverage actually is, body by body.** This is the most useful field in the register, because it converts a general sense of grievance into the one specific thing that obliges this particular office to act. With a zoning or planning commission it is RLUIPA, 42 U.S.C. § 2000cc; with any public agency, the Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq., or 5 U.S.C. § 552 federally; with a legislator, constituent standing; with a grant-making agency, that programme's own published criteria and nothing else. Note the appeal route and its deadline in the same breath, because these periods are jurisdictional: a Connecticut land use appeal must be commenced within fifteen days of publication of notice of the decision (Conn. Gen. Stat. § 8-8(b)).

**What actually makes an outside body treat this institution as an institution.** Not assertions of status. Seven unglamorous things, every one of them within the Kingdom's control: a single consistent return address that does not change; a reference number on every communication, cited back in every reply; a named liaison who stays the same person for years; counsel of record, so the body knows who to call; a registered agent at a real address; proof of delivery on anything that matters; and requests that cite the authority obliging a response rather than asking for a favour. An office that receives four letters from the same address, under the same reference series, signed by the same person, each citing a statute, files the Kingdom under organisations it deals with. That is the whole trick, and it is available immediately.

**Said once, plainly.** Correspondence that opens by asserting sovereignty, immunity from the recipient's authority, or that the recipient lacks jurisdiction is routed to the law department and never answered; officials meet that vocabulary constantly and have a settled response to it. With a police department it does considerably worse, because it moves the writer from complainant to subject in the eyes of the officer reading it. The Kingdom's leverage — RLUIPA, the Freedom of Information Act, constituent casework, church autonomy under *Watson v. Jones*, 80 U.S. (13 Wall.) 679 (1871), and *Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976) — requires no one to concede the Kingdom's status, which is precisely why it works.

**Keep it current, because it decays on a schedule.** Connecticut municipal offices turn over at the general municipal election in November of odd-numbered years, and members of the General Assembly stand every two years. Verify names, titles, and addresses annually and again after any election. Nothing recorded here is process, and no entry in this register authorises anything to be served on anyone: formal service of process in a civil action is made by a state marshal or other proper officer under Conn. Gen. Stat. §§ 52-50 and 52-57, and on the United States under Fed. R. Civ. P. 4(i).`,
  defaultClassification: "OFFICERS",
  defaultStatus: "UNVERIFIED",
  titleField: "bodyName",
  listColumns: ["level", "officialName", "posture", "lastContactDate"],

  statuses: [
    {
      value: "UNVERIFIED",
      label: "Entered, not yet verified",
      tone: "neutral",
      help: "Taken from a website, a directory, or someone's recollection and not yet confirmed against the body's own current publication. Do not send anything consequential to an unverified address.",
    },
    {
      value: "CURRENT",
      label: "Current and verified",
      tone: "success",
      help: "Name, title, and addresses confirmed against the body's own material on the date recorded below.",
    },
    {
      value: "STALE",
      label: "Stale — needs re-verification",
      tone: "warning",
      help: "More than a year since anyone checked, or an election has intervened. A letter to a title held by someone else reads as though the Kingdom has not looked at the office in years, which is the impression it gives.",
    },
    {
      value: "DORMANT",
      label: "Dormant — no current dealings",
      tone: "neutral",
      help: "Kept because the body may matter later. Retain the record rather than deleting it; the history is the point.",
    },
    {
      value: "REORGANISED",
      label: "Reorganised or renamed",
      tone: "warning",
      help: "The body has merged, split, or changed name. Open the successor as its own record and cross-reference it here, so that the old correspondence remains findable.",
    },
    {
      value: "DISSOLVED",
      label: "Dissolved or abolished",
      tone: "neutral",
      help: "The body no longer exists. Note where its functions and its records went — records survive the agency, and a request for them goes to the successor custodian.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "bodyName",
      label: "Name of the body",
      type: "text",
      required: true,
      section: "The body",
      summary: true,
      placeholder: "e.g. City of Bridgeport Planning and Zoning Commission",
      help: "The body's own formal name, spelled as it spells itself on its own agendas. Approximations are how mail reaches the wrong department inside a building that has several.",
    },
    {
      key: "level",
      label: "Level of government",
      type: "select",
      required: true,
      section: "The body",
      summary: true,
      help: "Decides which lever applies and which statute governs a request. The argument that moves a zoning commission is not the argument that moves a congressional office.",
      options: [
        {
          value: "MUNICIPAL",
          label: "Municipal — city or town",
          help: "Zoning, planning, inland wetlands, building, fire marshal, assessor, clerk, police, mayor or first selectman. Where RLUIPA does its work and where the Kingdom's ability to physically operate is decided.",
        },
        {
          value: "COUNTY_EQUIV",
          label: "County-equivalent or regional",
          help: "Connecticut abolished county government in 1960, so the county-level functions elsewhere sit with councils of governments, regional authorities, judicial districts, and probate districts. Name the actual body; 'Fairfield County' is not an office anyone works in.",
        },
        {
          value: "STATE",
          label: "State of Connecticut",
          help: "Agencies, the General Assembly, and constitutional officers. Agency conduct is governed by the Uniform Administrative Procedure Act, Conn. Gen. Stat. § 4-166 et seq.; confirm the applicable section before relying on any particular procedure.",
        },
        {
          value: "FEDERAL",
          label: "Federal",
          help: "Judged on the specific programme's published criteria. Assertions of status will not substitute for meeting them, and RFRA, 42 U.S.C. § 2000bb-1, reaches federal action only.",
        },
        {
          value: "TRIBAL",
          label: "Tribal nation",
          help: "Federally recognised tribes deal government-to-government with the United States; a state-recognised tribe holds whatever relationship the State has extended to it, and nothing federal follows from that. Keep the two apart in writing, because conflating them is the first error an official in this field notices. Approach as a neighbour, never as a peer sovereign, and never claim a relationship that has not been extended.",
        },
        {
          value: "FOREIGN",
          label: "Foreign state or its consulate",
          help: "A consulate deals with its own nationals — a member's passport, a document to be legalised, a death abroad. That is ordinary consular business and it confers nothing on the Kingdom. Diplomatic vocabulary belongs to states: a note verbale, a mission, an ambassador, immunity. Addressed to a Connecticut town or a federal agency it is the recognised signature of a sovereign-citizen filing, and the letter is flagged rather than read.",
        },
        {
          value: "QUASI_PUBLIC",
          label: "Quasi-public agency or authority",
          help: "Development authorities, housing authorities, and similar bodies. Whether the Freedom of Information Act reaches a particular one turns on the definition of a public agency in Conn. Gen. Stat. § 1-200(1); check it rather than assuming either way.",
        },
        {
          value: "INTERSTATE",
          label: "Interstate or intergovernmental body",
          help: "Compacts, commissions, and multi-state authorities. Their records and meetings obligations come from the compact rather than from either state's statute.",
        },
      ],
    },
    {
      key: "parentDepartment",
      label: "Parent department or agency",
      type: "text",
      section: "The body",
      help: "The larger body this office sits inside. A commission's mail is frequently handled by the department that staffs it, and knowing which one is often the difference between a reply and silence.",
    },
    {
      key: "jurisdictionCovered",
      label: "Jurisdiction covered",
      type: "jurisdiction",
      section: "The body",
      help: "The territory or population over which this body acts — a municipality, a district, a region, a state. Two bodies with near-identical names frequently differ only in this.",
    },
    {
      key: "functionOfBody",
      label: "What this body actually decides",
      type: "textarea",
      required: true,
      section: "The body",
      help: "In one or two sentences, the decisions this office has power to make. Written for an officer who has never dealt with it, so that they can tell at a glance whether their request belongs here.",
    },
    {
      key: "constitutingAuthority",
      label: "Statute, ordinance, or charter constituting it",
      type: "text",
      section: "The body",
      placeholder: "e.g. municipal charter § ——; Conn. Gen. Stat. § —— (confirm the section)",
      help: "The provision that creates the body and bounds its powers. Cite it in correspondence where the request is close to the edge of what the body may do, and never guess a section number — confirm it against the current General Statutes or the municipal code.",
    },

    {
      key: "mailingAddress",
      label: "Mailing address",
      type: "textarea",
      section: "Reaching it",
      help: "As the body publishes it, including any room, floor, or department line. Municipal buildings sort internally by that line, and a letter without it can sit in a mail room for weeks.",
    },
    {
      key: "acceptsFilingByMail",
      label: "Accepts filings and correspondence by post",
      type: "boolean",
      section: "Reaching it",
      help: "Many bodies now accept applications only through a portal and will not docket a posted one. This records how ordinary correspondence and filings are received. It says nothing about service of process in a lawsuit, which is made by a state marshal or other proper officer under Conn. Gen. Stat. §§ 52-50 and 52-57 and is not something this register or any document produced from it accomplishes.",
    },
    {
      key: "portalAddress",
      label: "E-filing or portal address",
      type: "url",
      section: "Reaching it",
      help: "The submission system, where one exists, together with the account or applicant identifier the Kingdom uses. A portal submission produces a reference number; capture it, because it is the only proof the filing was made.",
    },
    {
      key: "generalTelephone",
      label: "General telephone",
      type: "phone",
      section: "Reaching it",
      help: "The published number for the office. Useful for confirming that a letter arrived and for learning who a matter has been assigned to, which is rarely published anywhere.",
    },
    {
      key: "generalEmail",
      label: "General email",
      type: "email",
      section: "Reaching it",
      help: "The office's own published address. Where a matter is consequential, send by email and by post the same day and record both.",
    },
    {
      key: "recordsRequestAddress",
      label: "Records-request address",
      type: "textarea",
      section: "Reaching it",
      help: "Frequently a different address from the general one, and it matters more than it looks. Conn. Gen. Stat. § 1-206(a) places the duty to answer in writing within four business days on the agency official who has custody or control of the record; a request left with someone who has neither may simply sit, with no clock running against anyone and nothing to appeal from. Record this address separately even when it looks today like the general one, and address the request to the designated officer by name.",
    },
    {
      key: "recordsOfficer",
      label: "Designated records officer",
      type: "text",
      section: "Reaching it",
      help: "The person obliged to answer a public records request, by name and title. In many Connecticut towns this is the Town Clerk; in a state agency it is a designated Freedom of Information officer. Address the request to them and copy the department that holds the records.",
    },
    {
      key: "meetingSchedule",
      label: "Meeting schedule",
      type: "text",
      section: "Reaching it",
      placeholder: "e.g. Second and fourth Tuesday, 6:30 p.m., City Hall Room ——",
      help: "For a board or commission. Meetings of public agencies are open, with notice and agendas filed in advance, under the Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq. — confirm the applicable section and the notice periods against the current General Statutes. Attendance is free, produces a public record, and is the cheapest way to learn how a body actually works.",
    },
    {
      key: "publicCommentProcedure",
      label: "Public comment procedure",
      type: "textarea",
      section: "Reaching it",
      help: "Whether comment is taken, when in the agenda, whether sign-up is required and by when, any time limit, whether written submissions are accepted and entered on the record, and — the detail most often missed — the date by which an item or a written submission must reach the clerk to appear on the agenda at all. Written comment filed before the meeting is usually worth more than three minutes at a microphone, because it goes into the file the decision is later reviewed on.",
    },
    {
      key: "filingRequirements",
      label: "What this body requires before it will act",
      type: "textarea",
      section: "Reaching it",
      help: "The body's own conditions of a complete submission, taken from its own published instructions: the form and its number, how many copies, the fee and how it is payable, whether an original signature or a notarised statement is wanted, any notice the applicant must give abutters, and the cut-off before a meeting. Fill this in before drafting rather than after a return. An incomplete application is not usually refused on the merits — it is handed back, and in land use the time limits in Conn. Gen. Stat. § 8-7d run from the day of receipt as that section defines it, so an incomplete filing can cost an entire cycle. Confirm the periods and the receipt rule in that section against the current General Statutes.",
    },
    {
      key: "detailsVerifiedDate",
      label: "Date details last verified",
      type: "date",
      section: "Reaching it",
      help: "The day someone confirmed the name, title, and addresses against the body's own current publication. This date is what makes staleness visible, and it drives the annual re-verification reminder.",
    },

    {
      key: "officialName",
      label: "Named official",
      type: "person",
      section: "The named official",
      summary: true,
      help: "A named human being is what makes a file traceable across years. Where more than one matters, open a second record rather than crowding two people into one.",
    },
    {
      key: "officialTitle",
      label: "Exact title",
      type: "text",
      section: "The named official",
      help: "Word for word as the body itself gives it, and used verbatim in the address block and salutation. A wrong or invented title is the first thing a recipient notices and is read as evidence that the writer has not done the work.",
    },
    {
      key: "officialRole",
      label: "Kind of office held",
      type: "select",
      section: "The named official",
      help: "Determines the form of address and, more usefully, how long the person is likely to be there. Career staff outlast the elected, and a relationship with the planner survives three mayors.",
      options: [
        { value: "ELECTED_EXECUTIVE", label: "Elected executive — mayor, first selectman", help: "Takes The Honorable in the address block. Sets priorities; rarely decides an individual application." },
        { value: "LEGISLATOR", label: "Legislator — state or federal", help: "The currency here is constituent standing. Casework goes to the district office, not to the Capitol." },
        { value: "APPOINTED_HEAD", label: "Appointed department head or commissioner" },
        { value: "BOARD_CHAIR", label: "Chair of a board or commission", help: "Chairs run meetings; the body decides. Address a request to the commission through its clerk or staff, with the chair copied." },
        { value: "BOARD_MEMBER", label: "Member of a board or commission" },
        { value: "CAREER_STAFF", label: "Career staff — planner, building official, clerk", help: "Usually the person who actually decides, and almost always the person worth knowing. No honorific; use their working title." },
        { value: "RECORDS_OFFICER", label: "Records or freedom-of-information officer" },
        { value: "LAW_ENFORCEMENT", label: "Law enforcement officer", help: "Deal with a named community liaison, in a posture of cooperation on public safety. Never a claim of concurrent jurisdiction, never an offer of Kingdom marshals, and never a credential resembling law enforcement — Conn. Gen. Stat. §§ 53a-130 and 53a-130a. Two practical points beyond that. A department's records unit is a different counterpart from its command and from its community liaison: reports are obtained there under the Freedom of Information Act, subject to the law enforcement exemptions in Conn. Gen. Stat. § 1-210(b), which will ordinarily be claimed while an investigation remains open. And take the case or incident number at the scene, or on the first telephone call — without it a later request cannot be answered, and the matter becomes the complainant's problem rather than the department's." },
        { value: "COUNSEL", label: "Counsel to the body" },
        { value: "AIDE", label: "Aide, assistant, or scheduler", help: "Controls the diary and the routing. Being known to this person is worth more than being known to their principal." },
      ],
    },
    {
      key: "officialDirectContact",
      label: "Direct contact for the official",
      type: "text",
      section: "The named official",
      help: "Direct line, extension, or email as given by the office. Record how it was obtained; a number passed on informally is used discreetly and not published.",
    },
    {
      key: "aideOrAssistant",
      label: "Aide, assistant, or scheduler",
      type: "text",
      section: "The named official",
      help: "The person who books the meeting and knows where a file has gone. Meetings are obtained here, not from the principal, and this name changes less often than anyone expects.",
    },
    {
      key: "termOrAppointmentEnds",
      label: "Term or appointment ends",
      type: "date",
      section: "The named official",
      help: "For elected and fixed-term appointments. Connecticut municipal offices turn over at the general municipal election in November of odd-numbered years and members of the General Assembly stand every two years, so a directory left alone for two years is substantially wrong.",
    },
    {
      key: "relationshipStanding",
      label: "How the relationship stands with this official",
      type: "textarea",
      section: "The named official",
      classification: "OFFICERS",
      help: "Who introduced the Kingdom, what has been promised, what was said informally, and what this person cares about. Written for the officer who takes over the file, because this is exactly the knowledge that otherwise leaves with the person who had it.",
    },

    {
      key: "posture",
      label: "How this body regards the Kingdom",
      type: "select",
      required: true,
      section: "How the body regards the Kingdom",
      summary: true,
      help: "Record this honestly. A register that calls an unresponsive office 'cooperative' because that is the pleasanter word is worthless to the officer who inherits it. Candour costs nothing internally and is worth a great deal: an honest record of unanswered letters is the beginning of a Freedom of Information appeal or a legislator's casework request, and a diplomatic record of the same facts is the beginning of nothing.",
      options: [
        { value: "COOPERATIVE", label: "Cooperative", help: "Answers, meets, and helps. Protect this by not overloading it and by keeping the same liaison." },
        { value: "CORRECT_DISTANT", label: "Correct but distant", help: "Handles what it must, on time, without warmth. This is the ordinary condition of a public office and is not a problem to be solved." },
        { value: "UNRESPONSIVE", label: "Unresponsive", help: "Letters go unanswered. This is a fact with remedies attached: a records request, a second letter referencing the first by date and reference, or a constituent complaint through a legislator's office." },
        { value: "ADVERSE", label: "Adverse", help: "Actively opposed, or has taken a position against the Kingdom. Record it plainly and record what the opposition is grounded on. An adverse body is one whose decisions must be obtained in writing with reasons stated, because that record is what any later appeal is decided on." },
        { value: "NO_DEALINGS", label: "No dealings yet", help: "Entered in advance of any contact, which is the right time to enter it. The first letter is easier to write well when the directory work is already done." },
      ],
    },
    {
      key: "postureBasis",
      label: "Facts the posture rests on",
      type: "textarea",
      section: "How the body regards the Kingdom",
      help: "Dates and events rather than impressions — three letters in eleven months, two unanswered; a meeting refused on a stated ground; an approval granted without objection. This is what makes the posture usable by someone who was not there.",
    },

    {
      key: "leverage",
      label: "Legal hooks that apply to this body",
      type: "multiselect",
      section: "Leverage that applies",
      help: "The single most useful field in the register, because it converts a general sense of grievance into the one specific thing that obliges this particular office to act. Nothing here depends on anyone accepting the Kingdom's status, which is exactly why these work where assertions of status do not. Select only what genuinely applies to this body; a hook recorded because it sounds strong is worse than none.",
      options: [
        {
          value: "RLUIPA_SUBSTANTIAL_BURDEN",
          label: "RLUIPA — substantial burden, 42 U.S.C. § 2000cc(a)",
          help: "For a body making individualised assessments of a proposed use, which a zoning or special permit authority does. It is a claim built on the record, not a permit: apply properly, state the religious character of the use in writing at the outset, and obtain every denial and condition with its reasons.",
        },
        {
          value: "RLUIPA_EQUAL_TERMS",
          label: "RLUIPA — equal terms, 42 U.S.C. § 2000cc(b)(1)",
          help: "Bars treating a religious assembly on less than equal terms with a comparable non-religious assembly, and needs no jurisdictional trigger. The comparison is made on facts: which secular assembly uses are permitted in the same zone, and on what conditions.",
        },
        { value: "CT_FOIA", label: "Connecticut Freedom of Information Act — Conn. Gen. Stat. § 1-200 et seq.", help: "Reaches any public agency. Written denial due within four business days, silence deemed a denial (§ 1-206(a)), free appeal to the Commission within thirty days (§ 1-206(b)(1))." },
        { value: "FEDERAL_FOIA", label: "Federal FOIA — 5 U.S.C. § 552", help: "Determination due within twenty business days (§ 552(a)(6)(A)(i)). The administrative appeal window is set by the agency's own regulations and stated in the denial letter." },
        { value: "CONSTITUENT_CASEWORK", label: "Constituent casework", help: "Members are voters in the district. Legislative offices respond well to a specific, bounded problem — a stalled application, an agency that will not answer — and poorly to requests for endorsement of status. Three things an aide will otherwise have to write back for, which in practice is where casework dies: the constituent must actually live in the member's district, or the office will refer the matter on and go no further; the agency's own file number; and, where a federal agency holds the file, the office's own signed release form, because the Privacy Act, 5 U.S.C. § 552a(b), bars the agency from discussing an individual's records with a member's office without that individual's written consent. Ask for the release on the first call. Keep casework distinct from advocacy on pending legislation, which is lobbying: it engages the registration regime administered by the Office of State Ethics under Conn. Gen. Stat. § 1-91 et seq., whose thresholds should be confirmed with that office rather than assumed, and it counts against the limit on substantial lobbying by an organisation exempt under 26 U.S.C. § 501(c)(3) — the expenditure election under § 501(h) not being available to a church." },
        { value: "PROGRAMME_CRITERIA", label: "A grant or programme's own published criteria", help: "For a funder, this is the only leverage there is. Meet the criteria as written; nothing else in this list moves a grant panel." },
        { value: "OPEN_MEETINGS", label: "Open meetings and notice requirements", help: "Meetings of public agencies are open and noticed in advance under the Freedom of Information Act, Conn. Gen. Stat. § 1-200 et seq.; confirm the applicable section and the notice periods before relying on them. A decision taken without proper notice is vulnerable." },
        { value: "TAX_EXEMPTION", label: "Property tax exemption — Conn. Gen. Stat. § 12-81", help: "Subdivision (13) for a house of religious worship and the land it stands on, subdivision (7) for property held by a charitable organisation and used for its exempt purposes. Claimed with the town assessor, with the quadrennial statement under §§ 12-87 and 12-87a." },
        { value: "SECTION_106", label: "Section 106 consulting party status — 54 U.S.C. § 306108; 36 C.F.R. Part 800", help: "Admission as a consulting party in a specific federal undertaking is granted at the agency official's discretion to entities with a demonstrated interest, and non-recognised organisations receive it regularly." },
        { value: "RFRA_FEDERAL", label: "RFRA — 42 U.S.C. § 2000bb-1", help: "Federal action only, after City of Boerne v. Flores, 521 U.S. 507 (1997). Conn. Gen. Stat. § 52-571b supplies the state-law analogue." },
        { value: "CHURCH_AUTONOMY", label: "Church autonomy and the ministerial exception", help: "Watson v. Jones, 80 U.S. (13 Wall.) 679 (1871); Serbian Eastern Orthodox Diocese v. Milivojevich, 426 U.S. 696 (1976); Hosanna-Tabor, 565 U.S. 171 (2012); Our Lady of Guadalupe School, 591 U.S. 732 (2020). A defence within its scope, not a reason to decline to appear." },
        { value: "CHARITABLE_TRUST_AG", label: "Charitable trust supervision and the Attorney General", help: "The Attorney General represents the public interest in charitable assets. That is a supervisory relationship rather than an ally, and it cuts both ways; understand it before invoking it." },
        { value: "ADMIN_APPEAL", label: "A statutory right of appeal from this body's decisions", help: "State the route and its deadline in the appeal route field. These periods are typically jurisdictional and nothing revives them." },
        { value: "NONE_IDENTIFIED", label: "None identified", help: "The honest entry where the Kingdom is simply a petitioner and the body owes it nothing. Recording that plainly prevents a letter written as though leverage existed." },
      ],
    },
    {
      key: "leverageNotes",
      label: "How the hook applies here",
      type: "textarea",
      section: "Leverage that applies",
      help: "The concrete version: which decision of this body it bears on, what facts would have to be established, and what has already been put on the record. Note also when not to name it — invoking RLUIPA in a first letter converts a staff-level problem into a litigation posture, and the city stops talking and starts documenting.",
    },
    {
      key: "appealRoute",
      label: "Appeal route and deadline from this body's decisions",
      type: "textarea",
      section: "Leverage that applies",
      help: "Where an adverse decision goes next and how long there is to get it there. A Connecticut land use appeal must be commenced within fifteen days of publication of notice of the decision (Conn. Gen. Stat. § 8-8(b)); an appeal to the Freedom of Information Commission within thirty days of a denial, actual or deemed (Conn. Gen. Stat. § 1-206(b)(1)). Confirm the route and the period for this particular body before relying on either, and diarise the date the day the decision is published.",
    },

    {
      key: "counselName",
      label: "Counsel to the body",
      type: "text",
      section: "Counsel to the body",
      help: "The lawyer who represents this body — corporation counsel, city attorney, town attorney, an assistant attorney general, or outside counsel retained for the matter. Record the name the day it becomes known.",
    },
    {
      key: "counselFirm",
      label: "Firm or office",
      type: "text",
      section: "Counsel to the body",
      help: "Municipalities frequently retain outside firms for land use and litigation while keeping a general counsel in-house. Knowing which lawyer holds which matter prevents a letter going to the one who does not.",
    },
    {
      key: "counselContact",
      label: "Contact for counsel",
      type: "text",
      section: "Counsel to the body",
      help: "Address, email, and telephone. Where the Kingdom has its own counsel on the matter, the two lawyers correspond and the officers stop writing directly.",
    },
    {
      key: "representedOnMatter",
      label: "This body is represented by counsel on a live matter",
      type: "boolean",
      section: "Counsel to the body",
      summary: true,
      help: "Set this the moment an attorney appears or litigation is anticipated. From that point correspondence on that matter goes to counsel and not to the client. A letter around the lawyer is at best ignored and at worst treated as an attempt to go behind them, and it is the officer who sent it who wears that. It does not close the ordinary channels on everything else: a records request still goes to the designated records officer and an application still goes to the department that takes applications, because routing either to the town attorney instead is how the statutory clock is lost.",
    },

    {
      key: "liaisonOfficer",
      label: "Kingdom liaison for this body",
      type: "recordRef",
      refRegistry: "offices",
      section: "The Kingdom's side of the file",
      help: "The one commissioned officer who deals with this body, and who does not change. A single consistent counterpart is the cheapest thing the Kingdom can offer an outside office and one of the most effective. Two officers working the same desk in the same month reads as disorganisation and costs more than either errand was worth.",
    },
    {
      key: "fileReference",
      label: "Kingdom file reference used with this body",
      type: "text",
      section: "The Kingdom's side of the file",
      placeholder: "e.g. AK-PBO-000012 / Planning",
      help: "The reference cited in the subject line of every communication with this body and quoted back in every reply. A consistent reference series is one of the few things that makes a small institution legible to a large one, and it makes the whole exchange retrievable years later by either side.",
    },
    {
      key: "bodyFileReference",
      label: "The body's own file, application, or case number",
      type: "text",
      section: "The Kingdom's side of the file",
      placeholder: "e.g. Application PZ-2026-0148; Incident 26-0009123",
      help: "The reference this body uses in its own system — application, permit, docket, complaint, or incident number. Quote it in the subject line ahead of the Kingdom's own reference, because it is the only string by which the body can search its own file. Ask for it in the first exchange and record it the day it is given. A letter carrying only the Kingdom's reference obliges a clerk to go looking, and a clerk who has to go looking usually does not.",
    },
    {
      key: "returnAddressUsed",
      label: "Return address used with this body",
      type: "text",
      section: "The Kingdom's side of the file",
      help: "The single address that appears on everything sent to this body. Changing it mid-relationship is how mail goes missing and how an office comes to doubt the sender is settled anywhere. If it must change, tell the body in writing before the first letter from the new address.",
    },
    {
      key: "kingdomDescriptor",
      label: "How the Kingdom is described to this body",
      type: "textarea",
      section: "The Kingdom's side of the file",
      help: "Two facts, and both are load-bearing. First, the words used on the letterhead and in the signature block with this office. Outward, the description that is read is the accurate one — a religious society and charitable trust constituted in Connecticut — over a signer's own name and office. A signature block asserting a royal or governmental title on a letter to a planner is circulated around the department and answered, if at all, by counsel, and the substantive request is never reached. Internal styling belongs in internal instruments. Second, the legal name under which this body actually holds the file, which is frequently not the name the Kingdom uses of itself: the name on the deed, the application, the trade name certificate, or the exemption claim. Where the two differ, record both, and say so once in the first letter so that the body can match the correspondence to the file it belongs to.",
    },

    {
      key: "lastContactRef",
      label: "Last dealing with this body",
      type: "recordRef",
      refRegistry: "government-contacts",
      section: "History and review",
      help: "The Government-to-Government Contact record for the most recent exchange. That register holds what was said; this one holds who to say it to next time.",
    },
    {
      key: "lastContactDate",
      label: "Date of last contact",
      type: "date",
      section: "History and review",
      summary: true,
      help: "Kept here as well as in the contact register so that the directory itself shows which relationships have gone quiet. A relationship untouched for two years is a name in a list, not a relationship.",
    },
    {
      key: "openMatters",
      label: "Open matters with this body",
      type: "textarea",
      section: "History and review",
      help: "Applications pending, requests outstanding, appeals running, and anything on which a reply is owed in either direction. Read this before drafting anything new; a fresh request sent while an old one is unanswered wastes both.",
    },
    {
      key: "reviewDate",
      label: "Next review date",
      type: "date",
      section: "History and review",
      help: "When this record is next checked — names, titles, addresses, and posture. Set it after any election affecting the body, and otherwise annually.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "History and review",
      classification: "SEALED",
      help: "Assessment, tactical judgment, and anything said in confidence. Kept apart from the factual directory above, which should remain something the Kingdom would be content to have read aloud.",
    },
  ],

  deadlineRules: [
    {
      id: "pbo-annual-verification",
      title: "Annual verification of this body's details is due",
      fromField: "detailsVerifiedDate",
      offsetDays: 335,
      severity: "ROUTINE",
      detail:
        "Nearly a year since anyone checked. Confirm the official's name and exact title, the mailing and records-request addresses, the meeting schedule, and counsel, against the body's own current publication. A letter addressed to a title someone else now holds is the clearest possible signal that the Kingdom has not looked at the office in years.",
    },
    {
      id: "pbo-term-ending",
      title: "The named official's term or appointment is ending",
      fromField: "termOrAppointmentEnds",
      offsetDays: -45,
      severity: "ROUTINE",
      detail:
        "Find out whether the officer is continuing, and if not, who succeeds them. Where the relationship is worth keeping, a short letter of thanks before they leave costs nothing and is remembered; where a matter is pending, confirm in writing who will now hold it. Connecticut municipal offices turn over at the general municipal election in November of odd-numbered years, and members of the General Assembly stand every two years.",
    },
    {
      id: "pbo-review-due",
      title: "Review of this public body record is due",
      fromField: "reviewDate",
      offsetDays: 0,
      severity: "ROUTINE",
      detail:
        "Re-read the posture, the open matters, and the leverage field, and bring each into line with what has actually happened since. This is also the moment to record candidly that a body has become unresponsive or adverse, which is worth far more to the next officer than a diplomatic entry.",
    },
    {
      id: "pbo-relationship-dormant",
      title: "No contact with this body for two years",
      fromField: "lastContactDate",
      offsetDays: 730,
      severity: "ROUTINE",
      detail:
        "Two years without a dealing. Either re-establish contact with something small and genuine — an invitation, a note on a matter within the body's remit, confirmation that the Kingdom's details are current on their side — or move the record to dormant so that the register reflects the truth. Names and titles held for two years without verification are very likely wrong.",
      when: (data) => data.posture !== "NO_DEALINGS",
    },
  ],
};

export default publicBodies;
