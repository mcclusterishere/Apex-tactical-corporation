import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Appointments, Elections and Assemblies.
 *
 * Where the Register of Offices records who holds what, this register records
 * how the community actually decided it: who was told, who was entitled to be
 * there, who turned up, how the question was put, and what was said against it.
 * Every serious challenge to a religious body's decision attacks notice, quorum,
 * or minutes — in that order — so those three things are recorded here at the
 * time, by the people present, rather than reconstructed later by whoever is
 * left holding the file.
 */

const appointmentsElections: RegistryDef = {
  slug: "appointments-elections",
  title: "Register of Appointments, Elections and Assemblies",
  shortTitle: "Appointments & Assemblies",
  recordLabel: "Proceeding",
  recordLabelPlural: "Proceedings",
  group: "governance",
  numberPrefix: "APT",
  order: 5,
  authority:
    "Charter Art. VII (Leadership & Succession); Art. IV §3 (Powers); Art. VIII (Amendments & Interpretation)",
  description:
    "Every appointment, election, resolution, assembly, and ballot of the Kingdom — with the notice given, the quorum present, the votes cast, the dissent recorded, and the instrument produced.",
  guidance: `Decisions are attacked in a predictable order. First **notice**: were the people entitled to be there told, in the manner and within the time the Kingdom's own rules require, and did the notice say what business would be taken? Second **quorum**: were enough of them present for the body to act at all? Third **minutes**: is there a contemporaneous record signed by the person who presided? A decision that survives those three questions is very difficult to unpick. A decision that fails any one of them can be undone years later by someone with a grievance and a lawyer, and the substantive merits will never be reached.

**Contemporaneous minutes are worth more than a reconstruction, and the gap is not close.** Minutes written the same week, in the ordinary course, signed by the presiding officer and the recording secretary, carry the weight of a business record. A narrative assembled two years later — after the dispute arose, by a participant with an interest — is an argument dressed as a record, and it will be treated as one. Write them promptly, sign them, and do not tidy the history afterwards. If minutes were approved with a correction, record the correction as a correction.

**Record the proceeding as what it actually was.** Charter Art. VII vests appointment and removal in the Founder at sole discretion. An act taken under that article is an appointment, not an election, and needs no vote, no quorum, and no ballot — a written act and a date are enough. But if a vote was in fact taken and the register calls it an appointment, or the Founder acted alone and the register dresses it as a resolution of the council, the discrepancy will be found. Opponents look for exactly this, because it goes to whether the body follows its own stated procedure, and a body that does not follow its own procedure is a body whose internal determinations a court feels freer to examine.

**The religious autonomy doctrine is real and it is conditional.** Civil courts will not review a religious body's selection of its own ministers and officers or its determinations on doctrine, discipline, and internal polity: *Watson v. Jones*, 80 U.S. (13 Wall.) 679 (1871); *Serbian Eastern Orthodox Diocese v. Milivojevich*, 426 U.S. 696 (1976); *Our Lady of Guadalupe School v. Morrissey-Berru*, 591 U.S. 732 (2020). That protection turns on two things this register is designed to evidence — that the decision was genuinely ecclesiastical rather than a purely commercial or employment matter dressed in religious language, and that the body followed the procedure it had itself declared. Under *Jones v. Wolf*, 443 U.S. 595 (1979), courts may still decide property questions on neutral principles, so a proceeding that disposes of property is examined more closely than one that ordains a minister. State the character of the decision honestly on the form.

**Record dissent, and do not soften it.** Officers suppress objections out of a mistaken instinct that unanimity looks stronger. The opposite is true. A minute showing that two members objected, that their grounds were heard and recorded, and that the question carried anyway is evidence of a genuine deliberative process — and a record with no dissent in it, ever, reads as manufactured. Recording an objection also protects the dissenter personally, which matters where a decision later proves costly and responsibility is being apportioned. Enter the objection in the objector's own words where you can.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "DRAFT",
  titleField: "proceedingSubject",
  listColumns: ["proceedingType", "dateConvened", "result", "presidingOfficer"],

  statuses: [
    { value: "DRAFT", label: "Draft", tone: "neutral", help: "Being prepared. Nothing has been convened and no notice has issued." },
    {
      value: "NOTICED",
      label: "Notice issued",
      tone: "active",
      help: "Notice has gone out and the proceeding has not yet been held. Record the date and method now, while they are certain.",
    },
    { value: "HELD", label: "Held", tone: "active", help: "The proceeding took place. Minutes are outstanding." },
    {
      value: "MINUTED",
      label: "Minuted and signed",
      tone: "success",
      help: "Minutes are written and signed by the presiding officer. This is the state every proceeding should reach within a fortnight.",
    },
    {
      value: "ADJOURNED",
      label: "Adjourned",
      tone: "warning",
      help: "Business unfinished and carried to a further sitting. Fresh notice is usually required; check before assuming the original notice carries over.",
    },
    {
      value: "LAPSED_NO_QUORUM",
      label: "Lapsed for want of quorum",
      tone: "warning",
      help: "Record this rather than proceeding anyway. Business transacted without a quorum is voidable and taints everything that followed from it.",
    },
    {
      value: "CHALLENGED",
      label: "Under challenge",
      tone: "warning",
      help: "An objection to the validity of the proceeding has been made. Do not amend the original record; enter the challenge and any determination as separate facts.",
    },
    {
      value: "SET_ASIDE",
      label: "Set aside",
      tone: "danger",
      help: "The proceeding has been annulled on review. State the ground — defective notice, no quorum, want of authority — because the same defect will recur otherwise.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Overtaken by a later proceeding on the same question. The original record stands as history." },
    { value: "VOID", label: "Void", tone: "danger", help: "Of no effect from the outset — convened without authority, or purporting to decide a matter outside the body's competence." },
  ],

  fields: [
    {
      key: "proceedingSubject",
      label: "Subject matter",
      type: "text",
      required: true,
      section: "The proceeding",
      summary: true,
      help: "The question actually decided, in one line: \"Appointment of Registrar General\", \"Adoption of the safeguarding policy\", \"Sale of 14 Ash Street\". This must match the question as it was put; a subject broader than the notice invites the argument that the business was not properly before the body.",
    },
    {
      key: "proceedingType",
      label: "Type of proceeding",
      type: "select",
      required: true,
      section: "The proceeding",
      summary: true,
      options: [
        {
          value: "FOUNDER_APPOINTMENT",
          label: "Appointment by the Founder",
          help: "Charter Art. VII, sole discretion. No vote, quorum, or ballot applies. A written act and a date are the whole of what is required — do not manufacture a vote that did not happen.",
        },
        { value: "FOUNDER_REMOVAL", label: "Removal by the Founder", help: "Also Art. VII. Record the date of the written act; no cause need be stated. Outward notice to third parties remains necessary." },
        { value: "ELECTION", label: "Election", help: "A contested or uncontested vote to fill an office. Notice, quorum, and ballot method all matter here." },
        { value: "COUNCIL_RESOLUTION", label: "Council resolution", help: "A decision of a standing body under its own quorum rule." },
        { value: "GENERAL_ASSEMBLY", label: "General assembly of members" },
        { value: "REFERENDUM", label: "Referendum of members", help: "Binding vote of the whole membership. State in the notice that the result binds." },
        {
          value: "ADVISORY_BALLOT",
          label: "Advisory ballot",
          help: "Consultative only. Say so in the notice and in the minute, or members will reasonably treat the outcome as binding and a departure from it as a breach.",
        },
        { value: "ORDINATION_CALL", label: "Call or ordination of a minister", help: "Squarely within the ministerial and religious autonomy doctrines. Cross-reference the Register of Ordinations." },
      ],
    },
    {
      key: "characterOfDecision",
      label: "Character of the decision",
      type: "select",
      section: "The proceeding",
      help: "Whether the matter is ecclesiastical, temporal, or both. This is the fact on which religious autonomy turns: courts abstain from doctrine, discipline, and the choice of ministers, but under *Jones v. Wolf*, 443 U.S. 595 (1979), will decide property questions on neutral principles. Record it honestly — a commercial decision does not become ecclesiastical by being minuted as one.",
      options: [
        { value: "ECCLESIASTICAL", label: "Ecclesiastical — doctrine, discipline, worship, or the choice of ministers" },
        { value: "INTERNAL_POLITY", label: "Internal polity — governance, offices, and membership" },
        { value: "TEMPORAL_PROPERTY", label: "Temporal — property, contracts, or money", help: "Examined by civil courts on neutral principles. Procedure here must be impeccable." },
        { value: "MIXED", label: "Mixed", help: "Separate the strands in the minute so the ecclesiastical part is not dragged into review with the temporal part." },
      ],
    },
    {
      key: "dateConvened",
      label: "Date convened",
      type: "date",
      required: true,
      section: "The proceeding",
      summary: true,
      help: "The day the body actually sat, or for an act of the Founder, the day the written act was executed.",
    },
    {
      key: "place",
      label: "Place",
      type: "text",
      section: "The proceeding",
      help: "Where it was held, and if any participant attended remotely, say so and by what means. A challenge often begins with an assertion that a proceeding described as an assembly never physically occurred.",
    },
    {
      key: "presidingOfficer",
      label: "Presiding officer",
      type: "person",
      required: true,
      section: "The proceeding",
      summary: true,
      help: "Who chaired, by name. This is the person whose signature makes the minutes worth having, and who will be asked what happened.",
    },
    {
      key: "recordingSecretary",
      label: "Recording secretary or clerk",
      type: "person",
      section: "The proceeding",
      help: "Who took the note. A second signature on the minutes from someone who was present and writing at the time is materially stronger than one.",
    },

    {
      key: "noticeGiven",
      label: "Notice was given",
      type: "boolean",
      section: "Notice",
      help: "The first question any challenger asks. If notice was not given, record that plainly here rather than leaving the field empty — a disclosed defect can be cured by ratification, a concealed one cannot.",
    },
    {
      key: "noticeDate",
      label: "Date notice was given",
      type: "date",
      section: "Notice",
      help: "When it went out, not when it was drafted. The interval between this and the date convened is the notice period, and it is the number a challenger will compute first.",
    },
    {
      key: "noticeMethod",
      label: "How notice was given",
      type: "multiselect",
      section: "Notice",
      help: "Record every method used. Belt and braces are cheap: an announcement from the chancel plus an email plus a posted notice is very hard to attack, and a single email to an address the member no longer reads is not.",
      options: [
        { value: "READ_AT_SERVICE", label: "Read aloud at a service" },
        { value: "POSTED_AT_PREMISES", label: "Posted at the premises" },
        { value: "BULLETIN", label: "Published in the bulletin or newsletter" },
        { value: "EMAIL", label: "Email to members" },
        { value: "POST", label: "Sent by post" },
        { value: "PERSONAL_SERVICE", label: "Handed personally" },
        { value: "TELEPHONE", label: "Telephoned" },
        { value: "WEBSITE", label: "Published on the Kingdom's website" },
      ],
    },
    {
      key: "noticeContent",
      label: "What the notice said",
      type: "textarea",
      section: "Notice",
      help: "Reproduce or summarise it, and say expressly whether the business taken was specified. A body cannot decide a question its own notice did not put before the members — this is the single most common defect, and it is entirely avoidable.",
    },

    {
      key: "quorumRequired",
      label: "Quorum required",
      type: "text",
      section: "Quorum and franchise",
      placeholder: "e.g. one third of members in good standing, or 7 members",
      help: "State the rule and where it comes from — Charter, bylaw, or standing order. \"Whoever showed up\" is not a quorum rule, and a body with no stated quorum should adopt one before it next sits.",
    },
    {
      key: "quorumPresent",
      label: "Number present",
      type: "number",
      min: 0,
      section: "Quorum and franchise",
      help: "Count heads at the time the question was put, not at the opening. Quorum can fail part-way through a long sitting, and business taken after it fails is voidable.",
    },
    {
      key: "eligibleToVote",
      label: "Number eligible to vote",
      type: "number",
      min: 0,
      section: "Quorum and franchise",
      help: "Members in good standing entitled to vote on this question as at the date convened. Take it from the Roll of Citizens rather than from memory; a disputed franchise is the second thing a challenger examines.",
    },

    {
      key: "votingMethod",
      label: "Method of voting",
      type: "select",
      section: "The vote",
      options: [
        { value: "NO_VOTE", label: "No vote — act of the Founder", help: "The correct entry for an appointment or removal under Charter Art. VII." },
        { value: "UNANIMOUS_CONSENT", label: "Unanimous consent, no division called" },
        { value: "VOICE", label: "Voice vote" },
        { value: "SHOW_OF_HANDS", label: "Show of hands" },
        { value: "ROLL_CALL", label: "Roll call", help: "Records how each member voted. Use it for anything consequential — it is the only method that survives a later dispute about who supported what." },
        { value: "SECRET_BALLOT", label: "Secret ballot", help: "Preserve the ballots until the period for challenge has passed, and record who counted them." },
        { value: "WRITTEN_BALLOT", label: "Signed written ballot" },
        { value: "PROXY_PERMITTED", label: "Vote including proxies", help: "Only if the Kingdom's rules permit proxies. If they are silent, they are not permitted, and counting them invalidates the result." },
      ],
    },
    {
      key: "votesCast",
      label: "Votes cast",
      type: "number",
      min: 0,
      section: "The vote",
      help: "Total ballots or hands counted. If this exceeds the number eligible, the result is unusable and the vote must be retaken.",
    },
    {
      key: "votesFor",
      label: "Votes in favour",
      type: "number",
      min: 0,
      section: "The vote",
    },
    {
      key: "votesAgainst",
      label: "Votes against",
      type: "number",
      min: 0,
      section: "The vote",
    },
    {
      key: "abstentions",
      label: "Abstentions",
      type: "number",
      min: 0,
      section: "The vote",
      help: "Record them separately. Whether a majority is of votes cast or of members present changes the outcome when abstentions are numerous, and the answer must come from the rule, not from whichever reading gives the desired result.",
    },
    {
      key: "result",
      label: "Result",
      type: "select",
      section: "The vote",
      summary: true,
      options: [
        { value: "CARRIED", label: "Carried" },
        { value: "CARRIED_UNANIMOUSLY", label: "Carried unanimously" },
        { value: "DEFEATED", label: "Defeated" },
        { value: "TIED", label: "Tied — question not carried", help: "State whether the chair holds a casting vote and where that rule comes from. If it is not written down, the chair does not have one." },
        { value: "WITHDRAWN", label: "Withdrawn before the question was put" },
        { value: "ADJOURNED", label: "Adjourned without decision" },
        { value: "NO_QUORUM", label: "No quorum — no valid decision taken" },
        { value: "APPOINTED", label: "Appointed by the Founder", help: "Use with the Founder appointment and removal types. There is no vote to report." },
      ],
    },

    {
      key: "personAppointed",
      label: "Person appointed, elected, or removed",
      type: "person",
      section: "Outcome and instrument",
      help: "Name the individual. Then update the Register of Offices — this register records the decision, that one records the standing state of who holds what, and they must not diverge.",
    },
    {
      key: "effectiveDate",
      label: "Effective date of the decision",
      type: "date",
      section: "Outcome and instrument",
      help: "When the appointment, removal, or resolution takes effect, which is frequently not the date it was taken. An officer acting before the effective date acts without authority.",
    },
    {
      key: "instrumentProduced",
      label: "Instrument produced",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Outcome and instrument",
      help: "The commission, decree, resolution, or bylaw the proceeding gave rise to. A decision with no instrument behind it exists only in the minutes, which is enough internally and thin when a bank, insurer, or assessor asks to see the authority.",
    },
    {
      key: "minutesReference",
      label: "Minutes reference",
      type: "text",
      section: "Outcome and instrument",
      placeholder: "e.g. Council Minute Book 3, ff. 41-44",
      help: "Where the full minutes physically live, specifically enough that a successor could pull them without asking anyone.",
    },
    {
      key: "minutesSigned",
      label: "Minutes signed by the presiding officer",
      type: "boolean",
      section: "Outcome and instrument",
      help: "Unsigned minutes are a draft. Signed within days, they are a business record made in the ordinary course. The difference costs one signature and is worth a great deal in a dispute.",
    },

    {
      key: "dissentsRecorded",
      label: "Dissents recorded",
      type: "textarea",
      section: "Dissent and challenge",
      help: "Who dissented and on what ground, in their own words where possible. Recording dissent protects the dissenter if the decision later proves costly, and it strengthens the record as a whole — a minute book in which nobody ever disagrees reads as manufactured, and is treated accordingly.",
    },
    {
      key: "objectionsRaised",
      label: "Objections to the proceeding itself",
      type: "textarea",
      section: "Dissent and challenge",
      help: "Distinct from dissent on the merits. Objections to notice, quorum, franchise, or the chair's rulings go here, with the ruling given on each. An objection answered at the time is disposed of; an objection ignored at the time reappears as the ground of a challenge.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Dissent and challenge",
      classification: "OFFICERS",
      help: "Procedural weaknesses known to the officers, anything that would need curing by ratification, and context a successor would want. Write it plainly; a note that hides a defect is worse than no note.",
    },
  ],

  deadlineRules: [
    {
      id: "apt-minutes-signature",
      title: "Minutes not yet signed by the presiding officer",
      fromField: "dateConvened",
      offsetDays: 14,
      severity: "HIGH",
      detail:
        "A fortnight is an internal standard, not a rule of law; the value it protects is not optional. Minutes signed while the sitting is fresh are a record made in the ordinary course. Minutes signed after a dispute has arisen are an account given by an interested party, and will be read as one.",
      when: (data) => data.minutesSigned !== true,
    },
    {
      id: "apt-instrument-outstanding",
      title: "Decision carried but no instrument recorded",
      fromField: "dateConvened",
      offsetDays: 45,
      severity: "ROUTINE",
      detail:
        "Draw the commission, decree, or resolution and enter it in the Register of Instruments, then link it here. Outsiders — banks, insurers, assessors, counsel — ask for the instrument, not the minute book.",
      when: (data) =>
        (data.result === "CARRIED" ||
          data.result === "CARRIED_UNANIMOUSLY" ||
          data.result === "APPOINTED") &&
        !data.instrumentProduced,
    },
  ],
};

export default appointmentsElections;
