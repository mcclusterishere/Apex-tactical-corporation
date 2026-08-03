import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Incidents and Safeguarding Reports.
 *
 * Every injury, loss, safeguarding concern, dispute, security event, and data
 * breach touching Kingdom property or Kingdom people, written down while it is
 * still fresh. Two things depend on this register and neither can be fixed
 * afterwards: the contemporaneous factual account that an insurer, a regulator,
 * or a court will read years later, and the record that a required external
 * report was actually made. This register never substitutes for making that
 * report. It records that somebody did.
 */

const incidents: RegistryDef = {
  slug: "incidents",
  title: "Register of Incidents and Safeguarding Reports",
  shortTitle: "Incidents",
  recordLabel: "Incident",
  recordLabelPlural: "Incidents",
  group: "evidence",
  numberPrefix: "INC",
  order: 2,
  authority:
    "Charter Art. IV §4 (Care of Members); Conn. Gen. Stat. § 17a-101 et seq.; Conn. Gen. Stat. § 36a-701b",
  description:
    "Incidents on Kingdom property or involving its people, with the immediate response, the external reports made, the insurance position, and the corrective action taken.",
  guidance: `**Mandated reporting comes first — before this register, and before anyone senior is consulted.** Conn. Gen. Stat. § 17a-101 et seq. makes designated people mandated reporters, including any member of the clergy and most who teach, coach, supervise, or care for children. A mandated reporter who has *reasonable cause to suspect or believe* that a child has been abused or neglected or placed in imminent risk of serious harm must make an oral or electronic report to the Commissioner of Children and Families or a law enforcement agency **as soon as practicable and not later than twelve hours** (§ 17a-101b(a)), followed by a written or electronic report to the Commissioner **within forty-eight hours of the oral report** (§ 17a-101c).

Four things about that duty, stated once and plainly. It runs to the **individual**, not the institution: the Kingdom can neither report on a reporter's behalf nor relieve them of it. It cannot be displaced by an instruction from a superior — no officer of this Kingdom, the Founder included, may tell a mandated reporter to wait, and any such instruction belongs in this register. Connecticut's statute names a member of the clergy as a mandated reporter (§ 17a-101(b)) and contains **no exception for confessions or penitential communications** — unlike the statutes of many other states, which write one in expressly. The clergy privilege at Conn. Gen. Stat. § 52-146b is an evidentiary rule: it bars a clergy member from disclosing a confidential professional communication *in a civil or criminal case or proceeding preliminary thereto, or in a legislative or administrative proceeding*, absent waiver. No Connecticut appellate decision has held that it excuses a report to the Commissioner, and the reporter who withholds a report on that theory is betting their own liberty on an argument no court has accepted. Report. And the threshold is *reasonable cause to suspect*, far below proof — the reporter is not the investigator, and waiting for certainty is itself the violation. Failure to report is a criminal offence under § 17a-101a, charged against the individual, and a policy routing concerns through internal review first is precisely how institutions and their leaders end up prosecuted. Report, then enter it here. Where the suspected person is a Kingdom worker, notifying the person in charge under § 17a-101b is **in addition to** the report, never instead of it. Good-faith reporters have statutory immunity and protection from retaliation (§ 17a-101e).

**Write every entry as though it will be read aloud to a jury, because it may be.** Incident records are discoverable. Record what was observed, by whom, when, and in what order. Do not speculate about cause, assign fault, or write legal conclusions — "should not have happened" and "was negligent" are findings for someone else, and they will be quoted back. Never name a minor; reference their Roll record instead. Do not rewrite an entry once made; add a dated supplement.

**The duty to preserve attaches the moment litigation is reasonably anticipated** — not when suit is filed. From that date, deleting footage, replacing a device, or letting a camera overwrite is spoliation, and under Fed. R. Civ. P. 37(e) a court finding intent to deprive may instruct the jury to infer the worst. Pull footage the same day; most systems overwrite within a fortnight.

**Notify the insurer early.** Liability policies require notice as soon as practicable, and that condition is what a carrier reaches for to deny. Connecticut is comparatively forgiving — under *Aetna Casualty & Surety Co. v. Murphy*, 206 Conn. 409 (1988), as modified by *Arrowood Indemnity Co. v. King*, 304 Conn. 179 (2012), late notice defeats cover only on a showing of material prejudice — but that is a defence to run, not a plan.

**Data breaches run on their own clock.** Under Conn. Gen. Stat. § 36a-701b, notice to affected Connecticut residents must go out without unreasonable delay and **not later than sixty days after discovery**, with notice to the Attorney General no later than that. Where a Social Security number was involved, identity theft prevention services must be offered. Non-compliance is an unfair trade practice.`,
  defaultClassification: "SEALED",
  defaultStatus: "OPEN",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "COUNSEL"],
  titleField: "incidentSummary",
  listColumns: ["incidentType", "incidentDate", "location", "reporter"],

  statuses: [
    {
      value: "OPEN",
      label: "Open",
      tone: "active",
      help: "Logged. Confirm within the day that every required external report and the insurance notice have been made.",
    },
    {
      value: "REPORTED_EXTERNALLY",
      label: "Reported to an external authority",
      tone: "warning",
      help: "A report has gone to the Department of Children and Families, the police, or a regulator. The external process now leads; the Kingdom cooperates and does not run a parallel investigation that could interfere with it.",
    },
    {
      value: "UNDER_REVIEW",
      label: "Under internal review",
      tone: "warning",
      help: "Available only after any mandated report has been made. Internal review never precedes an external report.",
    },
    { value: "AWAITING_INSURER", label: "Awaiting the insurer", tone: "neutral" },
    {
      value: "ACTION_PENDING",
      label: "Corrective action pending",
      tone: "warning",
      help: "Something was identified and has not yet been done. An incident closed with the cause still present is the incident that recurs, and the second one is indefensible.",
    },
    { value: "CLOSED", label: "Closed", tone: "success", help: "External reporting complete, insurer informed, corrective action done, closure date recorded." },
    {
      value: "REOPENED",
      label: "Reopened",
      tone: "warning",
      help: "New information, a claim, or a related incident. Record why, and never edit the original entry.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Merged into a fuller record of the same event. Link the successor; do not delete this one." },
    {
      value: "VOID",
      label: "Void",
      tone: "danger",
      help: "Entered in error — a duplicate, or an event that did not occur. Void it with a reason; never delete an incident entry.",
    },
  ],

  fields: [
    {
      key: "incidentSummary",
      label: "Incident",
      type: "text",
      required: true,
      section: "The incident",
      summary: true,
      help: "One neutral factual line: \"Fall on the north steps, adult visitor, ambulance attended\". Describe, do not characterise, and do not name a minor.",
    },
    {
      key: "incidentType",
      label: "Type of incident",
      type: "select",
      required: true,
      section: "The incident",
      summary: true,
      options: [
        { value: "INJURY", label: "Injury to a person" },
        { value: "NEAR_MISS", label: "Near miss", help: "Log these. A near miss is the cheapest warning the Kingdom will ever get, and the record of having acted on it is a defence to the injury that follows." },
        { value: "PROPERTY_DAMAGE", label: "Property damage or loss" },
        {
          value: "SAFEGUARDING",
          label: "Safeguarding concern — child or vulnerable adult",
          help: "Make the external report first. Conn. Gen. Stat. § 17a-101b(a) allows twelve hours from reasonable cause to suspect, and the duty is the reporter's own.",
        },
        { value: "DISPUTE", label: "Dispute, altercation, or harassment" },
        { value: "SECURITY", label: "Security incident, intrusion, or theft" },
        {
          value: "DATA_BREACH",
          label: "Data breach",
          help: "Starts the sixty-day clock under Conn. Gen. Stat. § 36a-701b and requires notice to the Attorney General no later than notice to residents.",
        },
        { value: "MEDICAL", label: "Medical emergency" },
        { value: "FIRE_HAZARD", label: "Fire, flood, or building hazard" },
        { value: "VEHICLE", label: "Vehicle incident" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "incidentDate",
      label: "Date of the incident",
      type: "date",
      required: true,
      section: "The incident",
      summary: true,
      help: "When it happened, not when it was reported or when this entry was typed. Every deadline on this record runs from here.",
    },
    {
      key: "incidentTime",
      label: "Time, with time zone",
      type: "text",
      section: "The incident",
      placeholder: "e.g. approximately 19:15 EDT",
      help: "As precise as honesty allows, and say if it is an estimate. Time is what camera footage, call logs, and witnesses are matched against.",
    },
    {
      key: "location",
      label: "Location",
      type: "text",
      required: true,
      section: "The incident",
      help: "Specific enough to find on inspection: which room, which stair, which part of the lot, indoors or out, lighting and weather if relevant.",
    },
    {
      key: "description",
      label: "Factual description",
      type: "textarea",
      required: true,
      section: "The incident",
      help: "What was observed, by whom, in what order. Facts only. No opinion about cause, no assignment of blame, no legal conclusions, no apology or admission on the Kingdom's behalf. Assume this paragraph is read aloud in a courtroom, because it may be.",
    },

    {
      key: "personsInvolved",
      label: "Persons involved",
      type: "textarea",
      classification: "SEALED",
      section: "People",
      help: "Adults by name. **Never enter a minor's name here** — use their record number on the Roll of Citizens, or a neutral descriptor such as \"child A, age 9\". Redaction after the fact is unreliable; not writing it is not.",
    },
    {
      key: "minorInvolved",
      label: "A child or vulnerable adult was involved",
      type: "boolean",
      section: "People",
      help: "Checking this does not itself trigger the reporting duty and does not discharge it. It flags the record for the highest handling and prompts the question every officer must answer: has the person with reasonable cause to suspect made their report yet?",
    },
    {
      key: "reporter",
      label: "Reported by",
      type: "person",
      required: true,
      section: "People",
      summary: true,
      help: "The individual who reported it internally, by name. If they are a mandated reporter, their external duty is personal to them and nothing recorded here satisfies it.",
    },
    {
      key: "witnesses",
      label: "Witnesses",
      type: "textarea",
      classification: "SEALED",
      section: "People",
      help: "Names and contact details, taken on the day. People leave the congregation, move, and lose interest; a witness recorded a week later is often a witness lost.",
    },

    {
      key: "injuries",
      label: "Injuries",
      type: "textarea",
      classification: "SEALED",
      section: "Immediate response",
      help: "What was observed and what the person said about it, in neutral terms. Do not diagnose and do not minimise — \"declined treatment\" is a fact; \"was fine\" is an opinion that will be contradicted.",
    },
    {
      key: "emergencyServicesCalled",
      label: "Emergency services were called",
      type: "boolean",
      section: "Immediate response",
      help: "Whenever there is doubt, call. A record showing that the Kingdom summoned help promptly is a strong fact; a record of deliberation while someone waited is not.",
    },
    {
      key: "policeNotified",
      label: "The police were notified",
      type: "boolean",
      section: "Immediate response",
      help: "Criminal conduct is for the State of Connecticut. The Kingdom has no criminal jurisdiction and no power of investigation over anyone, member or not. Reporting to police is never a breach of any internal duty of confidence.",
    },
    {
      key: "policeReference",
      label: "Police case or incident number",
      type: "text",
      section: "Immediate response",
      help: "Ask for it at the scene. Insurers request it, and it is how the Kingdom later proves the report was made and when.",
    },
    {
      key: "immediateAction",
      label: "Immediate action taken",
      type: "textarea",
      section: "Immediate response",
      help: "What was done in the first hours: area closed, equipment withdrawn, first aid given, a worker stood down from contact pending an external process, footage secured. Prompt sensible action is the best evidence the Kingdom takes its duties seriously.",
    },

    {
      key: "mandatedReportStatus",
      label: "Mandated report",
      type: "select",
      required: true,
      classification: "SEALED",
      section: "External reporting",
      help: "The most consequential field in the system. Answer it honestly on the day.",
      options: [
        { value: "NOT_APPLICABLE", label: "Not applicable — no child or vulnerable adult concern arises", help: "Only where nothing in the incident could give reasonable cause to suspect. If there is any doubt, the answer is not this one." },
        { value: "MADE", label: "Made", help: "Record who made it, to whom, and exactly when. The written report to the Commissioner follows within forty-eight hours under Conn. Gen. Stat. § 17a-101c." },
        {
          value: "DUE_NOT_YET_MADE",
          label: "Due and not yet made",
          help: "The twelve-hour clock in Conn. Gen. Stat. § 17a-101b(a) is running against the individual reporter now. Stop and make the report. Nothing else on this form matters until it is made.",
        },
        {
          value: "MADE_BY_ANOTHER",
          label: "Believed made by another reporter",
          help: "Belief is not a defence. If you personally have reasonable cause to suspect, make your own report and confirm the other was made.",
        },
        {
          value: "REPORT_DISCOURAGED",
          label: "A superior discouraged or delayed the report",
          help: "Record this in full, with the name and the words used, and report immediately regardless. No officer of the Kingdom has authority to countermand a statutory duty, and this entry protects the reporter.",
        },
      ],
    },
    {
      key: "mandatedReporterName",
      label: "Who made the report",
      type: "person",
      classification: "SEALED",
      section: "External reporting",
      help: "The individual who personally made it. The duty is theirs; an institution cannot discharge it for them.",
    },
    {
      key: "mandatedReportRecipient",
      label: "To whom the report was made",
      type: "text",
      classification: "SEALED",
      section: "External reporting",
      placeholder: "e.g. DCF Careline, reference given by intake worker",
      help: "The agency, the person spoken to, and any reference number given. Note that where sexual abuse or serious physical abuse is alleged, law enforcement is notified as well.",
    },
    {
      key: "mandatedReportDate",
      label: "Date the oral report was made",
      type: "date",
      classification: "SEALED",
      section: "External reporting",
      help: "The date of the oral or electronic report. The forty-eight hour deadline for the written report to the Commissioner under Conn. Gen. Stat. § 17a-101c runs from this date, and the register will raise it.",
    },
    {
      key: "dataBreachAssessment",
      label: "Data breach notification position",
      type: "select",
      section: "External reporting",
      help: "Assess this for any incident touching personal information, including a lost laptop or a misdirected email — not only a hacking event.",
      options: [
        { value: "NOT_A_BREACH", label: "No personal information involved" },
        { value: "UNDER_ASSESSMENT", label: "Under assessment", help: "The sixty-day clock in Conn. Gen. Stat. § 36a-701b runs from discovery, not from the conclusion of the assessment." },
        {
          value: "NOTIFIABLE_PENDING",
          label: "Notifiable — notice not yet given",
          help: "Draft the resident notice and the Attorney General notice now. Sixty days passes quickly while forensic work is still running, and the clock does not pause for it.",
        },
        { value: "NOTICE_GIVEN", label: "Notice given to residents and the Attorney General", help: "Notice to the Attorney General must be no later than notice to residents." },
        { value: "IDENTITY_SERVICES_OFFERED", label: "Notice given and identity theft services offered", help: "Required where a Social Security number was involved." },
      ],
    },

    {
      key: "insurerNotified",
      label: "The insurer has been notified",
      type: "boolean",
      section: "Insurance",
      help: "Notify on anything that could conceivably become a claim, including near misses. Liability policies condition cover on notice as soon as practicable, and the notice condition is the first thing a carrier reaches for when it wants to deny.",
    },
    {
      key: "insurerNotifiedDate",
      label: "Date the insurer was notified",
      type: "date",
      section: "Insurance",
      help: "Late notice defeats cover in Connecticut only where the insurer shows material prejudice (*Aetna Casualty & Surety Co. v. Murphy*, 206 Conn. 409 (1988); *Arrowood Indemnity Co. v. King*, 304 Conn. 179 (2012)). That is a defence worth having and a position worth never needing.",
    },
    {
      key: "claimNumber",
      label: "Claim or notification number",
      type: "text",
      section: "Insurance",
      help: "Issued by the carrier on notification. Record it even where no claim is expected — it proves the date notice was given.",
    },

    {
      key: "evidenceItems",
      label: "Evidence collected",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Evidence and preservation",
      help: "Log photographs, camera footage, damaged items, and written statements into the Evidence Vault the same day. Most camera systems overwrite within a fortnight; footage not pulled now is footage gone.",
    },
    {
      key: "preservationHoldDate",
      label: "Date the preservation duty attached",
      type: "date",
      section: "Evidence and preservation",
      help: "When litigation or a formal proceeding first became reasonably anticipated — often the day of the incident itself for any serious injury. From this date routine deletion is spoliation, and under Fed. R. Civ. P. 37(e) a finding of intent to deprive permits an adverse inference instruction. When in doubt, enter the earlier date and issue the hold.",
    },

    {
      key: "correctiveAction",
      label: "Corrective action",
      type: "textarea",
      section: "Closure",
      help: "What was changed so it does not happen again, who owns it, and by when. Be careful how it is phrased: describe the improvement, not a confession that the previous arrangement was inadequate.",
    },
    {
      key: "closureDate",
      label: "Date closed",
      type: "date",
      section: "Closure",
      help: "Only after every external report was made, the insurer was informed, and the corrective action was actually done — not merely decided upon.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      classification: "SEALED",
      section: "Closure",
      help: "Handling notes and open questions. Assume this may be reached in discovery notwithstanding any privilege claim, and write nothing here you would not want read aloud.",
    },
  ],

  deadlineRules: [
    {
      id: "inc-24h-report-confirmation",
      title: "Confirm the mandated report and the insurance notice were made",
      fromField: "incidentDate",
      offsetDays: 1,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. §§ 17a-101b(a), 17a-101c",
      detail:
        "Within one day of any incident, confirm two things by name and by time. First: whether anyone had reasonable cause to suspect abuse or neglect of a child, and if so whether that individual made their oral or electronic report within the twelve hours § 17a-101b(a) allows. The duty is personal to the reporter, cannot be discharged by the institution, and cannot be deferred to an internal review. Second: whether the insurer has been notified. Both are cheap today and unrecoverable later.",
    },
    {
      id: "inc-dcf-written-report",
      title: "Written report to the Commissioner of Children and Families due",
      fromField: "mandatedReportDate",
      offsetDays: 2,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 17a-101c",
      detail:
        "A written or electronic report must reach the Commissioner or the Commissioner's designee not later than forty-eight hours after the oral report. Making the call and omitting the writing is a common and entirely avoidable failure; the statutory duty is not complete until both are done.",
      when: (data) =>
        data.mandatedReportStatus === "MADE" || data.mandatedReportStatus === "REPORT_DISCOURAGED",
    },
    {
      id: "inc-breach-notification",
      title: "Data breach notification window closing",
      fromField: "incidentDate",
      offsetDays: 45,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 36a-701b",
      detail:
        "Notice to affected Connecticut residents must go out without unreasonable delay and not later than sixty days from discovery, with notice to the Attorney General no later than notice to residents. Fifteen days remain from this reminder. Where a Social Security number was involved, identity theft prevention services must be offered. Failure is an unfair trade practice enforced by the Attorney General under Conn. Gen. Stat. § 42-110b.",
      when: (data) => data.incidentType === "DATA_BREACH" && data.dataBreachAssessment !== "NOTICE_GIVEN",
    },
    {
      id: "inc-insurer-notice",
      title: "Insurer has not been notified",
      fromField: "incidentDate",
      offsetDays: 7,
      severity: "HIGH",
      detail:
        "Liability policies require notice as soon as practicable. Notify now, even if no claim seems likely and even if the Kingdom believes it is not at fault — that judgement belongs to the carrier, and a delay of weeks hands it the argument it needs.",
      when: (data) => data.insurerNotified !== true,
    },
  ],
};

export default incidents;
