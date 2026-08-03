import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Data Subject Requests.
 *
 * The Kingdom holds identifying information about real people — members, their
 * children, donors, employees, and parties it is in conflict with. Whether or
 * not a privacy statute reaches this institution, a demand from a person for
 * their own file is answered on a clock and in writing, because the record of
 * how it was answered is what a regulator, a jury, or the person themselves
 * will read afterwards.
 */

const privacyRequests: RegistryDef = {
  slug: "privacy-requests",
  title: "Register of Data Subject Requests",
  shortTitle: "Data Requests",
  recordLabel: "Request",
  recordLabelPlural: "Requests",
  group: "stewardship",
  numberPrefix: "PRV",
  order: 2,
  authority:
    "Charter Art. IV §4 (Administrative Powers); Connecticut Data Privacy Act, Conn. Gen. Stat. §§ 42-515 et seq.",
  description:
    "Every request by a person to see, correct, port, or delete the personal data the Kingdom holds about them, with the verification, the search, and the answer given.",
  guidance: `The Kingdom keeps rolls of members, records of children, donor histories, employment files, and dossiers on people it is in dispute with. That is ordinary for an institution of this kind, and it creates obligations that do not dissolve because the holder of the data asserts sovereignty. A regulator is not required to accept a jurisdictional argument before asking why someone was refused their own file, and a jury certainly is not.

**The shape of the Connecticut Data Privacy Act.** The CTDPA gives a consumer rights to confirm whether a controller processes their personal data and to access it, to correct inaccuracies, to delete data provided by or obtained about them, to obtain a portable copy, and to opt out of targeted advertising, sale, and certain profiling. A controller must respond **without undue delay and within 45 days of receipt**, may extend once by a further 45 days where complexity and volume reasonably require it — provided it tells the consumer of the extension and why — and must answer the first request in any twelve-month period free of charge. A refusal must be stated with its reason and with instructions for appeal; the controller must operate a **conspicuous appeal process** and decide appeals in writing within 60 days, telling the consumer how to complain to the Attorney General, who enforces the act. There is no private right of action.

**Honest note on scope.** The CTDPA reaches only persons meeting volume thresholds — as enacted, the data of at least 100,000 consumers in a year, or 25,000 where more than a quarter of gross revenue comes from selling personal data — and Connecticut has amended the act more than once, including its treatment of non-profits. A small religious association very likely falls outside it. **Verify the current text before relying on that**, and honour the substance regardless. The reason is practical: if this ever matters, the question will not be whether the statute technically applied, but why an organisation that keeps files on people refused to show a person their own. There is no good answer to that question.

**A deletion request does not override a preservation duty.** Where records are within the scope of a legal hold, are needed to establish or defend a legal claim, or must be kept to satisfy another legal obligation, the correct response is to **say so in writing**: identify what is retained and why, confirm it is quarantined from ordinary use, and delete when the hold lifts. Privacy statutes of this family carry exemptions for exactly this. What is never acceptable is quietly retaining the data while telling the requester it was deleted — that turns an answerable position into a false statement.

**Minors' data takes the highest handling.** Classify it sealed, collect the minimum, verify that an adult requester is genuinely the parent or guardian, and treat photographs, rosters, and attendance records of children as the most sensitive material the Kingdom holds. **Never** use a request from an adverse party as an occasion to gather intelligence on them, and never let a dispute shape the answer: refusing an opponent their file, or slow-walking it, is the fact that will be put to the Kingdom later.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "RECEIVED",
  titleField: "requester",
  listColumns: ["requestType", "relationship", "dateReceived", "responseDeadline"],

  statuses: [
    {
      value: "RECEIVED",
      label: "Received",
      tone: "warning",
      help: "Logged. The response clock runs from the date of receipt, not from the date identity is verified.",
    },
    {
      value: "VERIFYING",
      label: "Verifying identity",
      tone: "warning",
      help: "Ask only for what is needed to establish identity. Demanding excessive proof is itself a way of refusing a request.",
    },
    { value: "IN_PROGRESS", label: "Searching and preparing", tone: "active" },
    {
      value: "EXTENDED",
      label: "Extended",
      tone: "warning",
      help: "One extension taken. The requester must have been told, in writing, that it was taken and why.",
    },
    { value: "FULFILLED", label: "Fulfilled", tone: "success" },
    {
      value: "PARTIALLY_FULFILLED",
      label: "Partially fulfilled",
      tone: "neutral",
      help: "Some material provided, some withheld. Every withheld category must be identified and its ground stated.",
    },
    {
      value: "REFUSED",
      label: "Refused",
      tone: "danger",
      help: "A refusal is a decision that must be reasoned in writing and accompanied by appeal instructions. An unanswered request is worse than a reasoned refusal.",
    },
    { value: "UNDER_APPEAL", label: "Under appeal", tone: "warning" },
    { value: "WITHDRAWN", label: "Withdrawn by the requester", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "requester",
      label: "Requester",
      type: "person",
      required: true,
      section: "The request",
      summary: true,
      help: "The person whose data is at issue. Where an agent, attorney, or parent acts for them, name the data subject here and the agent below.",
    },
    {
      key: "requesterContact",
      label: "Contact and channel for the response",
      type: "text",
      section: "The request",
      help: "Where the answer must be sent, confirmed with the requester. Sending a person's file to a stale address is a disclosure to a stranger, which is a worse failure than a late response.",
    },
    {
      key: "relationship",
      label: "Relationship to the Kingdom",
      type: "select",
      section: "The request",
      summary: true,
      options: [
        { value: "MEMBER", label: "Enrolled member" },
        {
          value: "FORMER_MEMBER",
          label: "Former member",
          help: "Departure does not extinguish the request. Records of a person who left are frequently the ones they most want to see.",
        },
        { value: "DONOR", label: "Donor" },
        { value: "EMPLOYEE_OR_VOLUNTEER", label: "Employee or volunteer" },
        {
          value: "MINOR_VIA_GUARDIAN",
          label: "Minor, through a parent or guardian",
          help: "Verify the adult's authority before disclosing anything. A custody dispute behind a request is common and is not the Kingdom's to adjudicate.",
        },
        {
          value: "ADVERSE_PARTY",
          label: "Adverse party or their agent",
          help: "Answer on exactly the same terms as anyone else. The temptation to slow-walk this request is the reason the register exists.",
        },
        { value: "PUBLIC", label: "Member of the public or website visitor" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "requestType",
      label: "What is asked for",
      type: "select",
      required: true,
      section: "The request",
      summary: true,
      options: [
        { value: "ACCESS", label: "Access — confirm processing and provide a copy" },
        { value: "CORRECTION", label: "Correction of inaccurate data" },
        {
          value: "DELETION",
          label: "Deletion",
          help: "Check the legal hold position before acting. Deleting material under a preservation duty is spoliation, not compliance.",
        },
        { value: "PORTABILITY", label: "Portable copy in a usable format" },
        { value: "OPT_OUT", label: "Opt out of sale, targeted advertising, or profiling" },
        {
          value: "WITHDRAW_CONSENT",
          label: "Withdrawal of consent",
          help: "Cross-reference the Register of Consents and stop the relevant use promptly. Withdrawal operates forward; it does not unmake past lawful use.",
        },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "requestText",
      label: "The request as received",
      type: "textarea",
      section: "The request",
      help: "The requester's own words, quoted in full and not paraphrased. What was actually asked for decides whether the answer given was responsive, and paraphrase is how a request quietly narrows.",
    },
    {
      key: "channelReceived",
      label: "How it arrived",
      type: "select",
      section: "The request",
      options: [
        { value: "EMAIL", label: "Email" },
        { value: "POST", label: "Post" },
        { value: "WEB_FORM", label: "Web form" },
        {
          value: "IN_PERSON",
          label: "In person or by telephone",
          help: "Reduce it to writing the same day and send the requester the written version to confirm.",
        },
        { value: "THROUGH_COUNSEL", label: "Through counsel or an authorised agent" },
      ],
    },
    {
      key: "dateReceived",
      label: "Date received",
      type: "date",
      required: true,
      section: "The request",
      summary: true,
      help: "The date it arrived anywhere in the Kingdom — including an officer's personal inbox — not the date it reached the right desk. The clock runs from receipt regardless of internal routing.",
    },

    {
      key: "verificationMethod",
      label: "How identity was verified",
      type: "select",
      section: "Verification",
      options: [
        { value: "KNOWN_TO_OFFICER", label: "Personally known to a commissioned officer" },
        { value: "ACCOUNT_CREDENTIAL", label: "Authenticated through an existing account" },
        {
          value: "GOVERNMENT_ID",
          label: "Government-issued identification",
          help: "Inspect, record that it was inspected, and do not retain a copy longer than needed. Collecting new sensitive data in order to answer a privacy request is its own risk.",
        },
        { value: "SIGNED_DECLARATION", label: "Signed declaration of identity" },
        { value: "GUARDIAN_PROOF", label: "Proof of parental or guardian authority" },
        { value: "AGENT_AUTHORISATION", label: "Written authorisation naming the agent" },
        {
          value: "NOT_VERIFIED",
          label: "Not verified",
          help: "If identity cannot reasonably be verified the request may be declined — but say so promptly and explain what would satisfy the Kingdom, rather than letting the clock expire in silence.",
        },
      ],
    },
    {
      key: "verificationDate",
      label: "Date identity verified",
      type: "date",
      section: "Verification",
      help: "Recorded separately from receipt because the two dates are often confused. Verification does not restart the 45-day period.",
    },
    {
      key: "verificationNote",
      label: "Verification note",
      type: "textarea",
      section: "Verification",
      help: "What was inspected, by whom, and what was retained. Where a request was made by an agent, note the scope of their authority.",
    },

    {
      key: "statutoryBasis",
      label: "Basis asserted by the requester",
      type: "multiselect",
      section: "Basis and scope",
      options: [
        { value: "CTDPA", label: "Connecticut Data Privacy Act" },
        { value: "CCPA", label: "California Consumer Privacy Act" },
        { value: "GDPR", label: "GDPR or UK GDPR" },
        { value: "OTHER_STATE", label: "Another state privacy statute" },
        { value: "CONTRACT_OR_POLICY", label: "The Kingdom's own privacy policy or a contract" },
        {
          value: "NONE_STATED",
          label: "No basis stated",
          help: "Most requests cite nothing. Handle them on the same terms; the absence of a citation is not a ground to refuse.",
        },
      ],
    },
    {
      key: "applicabilityAssessment",
      label: "Applicability assessment",
      type: "textarea",
      section: "Basis and scope",
      help: "Whether the statute cited actually reaches the Kingdom — and, separately, the decision on whether to honour the request regardless. Record the reasoning. A deliberate decision to give someone their file where no statute compelled it is a good fact; a bare assertion that the law does not apply is not an answer to anyone.",
    },
    {
      key: "recordsSearched",
      label: "Registers and systems searched",
      type: "textarea",
      section: "Basis and scope",
      help: "Name each register, mailbox, drive, device, and third-party service searched, and the search terms used. A search that cannot be described cannot be defended, and 'we found nothing' means nothing without it.",
    },
    {
      key: "minorsDataInvolved",
      label: "The request touches data of a minor",
      type: "boolean",
      section: "Basis and scope",
      summary: true,
      help: "Triggers the highest handling: sealed classification, guardian verification, and redaction of any other child appearing in the same material before release.",
    },
    {
      key: "legalHoldConflict",
      label: "Some or all records are subject to a legal hold",
      type: "boolean",
      section: "Basis and scope",
      help: "If checked, deletion of the held material is suspended and the requester must be told plainly that it is being retained, for what reason, and that it will be deleted when the obligation ends. Silence here is how a privacy answer becomes a false statement.",
    },
    {
      key: "relatedMatter",
      label: "Related matter",
      type: "recordRef",
      refRegistry: "enforcement",
      section: "Basis and scope",
      help: "Any dispute this request touches. Linking it makes visible the one thing that must not happen: a request answered differently because of who is asking.",
    },

    {
      key: "responseDeadline",
      label: "Response due",
      type: "date",
      section: "Response",
      summary: true,
      help: "Forty-five days from receipt. Enter it on the day the request is logged, before anything else is done, so the date exists independently of anyone's memory.",
    },
    {
      key: "extensionInvoked",
      label: "Extension taken",
      type: "boolean",
      section: "Response",
      help: "One extension of a further 45 days is available where genuinely warranted by complexity or volume — and only if the requester is told, within the original period, that it has been taken and why.",
    },
    {
      key: "actionTaken",
      label: "Action taken",
      type: "select",
      section: "Response",
      options: [
        { value: "DISCLOSED_COPY", label: "Copy of the records provided" },
        { value: "CORRECTED", label: "Record corrected" },
        { value: "DELETED", label: "Data deleted" },
        {
          value: "DELETED_PARTIAL",
          label: "Data partly deleted, remainder retained",
          help: "State exactly what was retained and on what ground.",
        },
        { value: "PORTABLE_EXPORT", label: "Portable export provided" },
        { value: "OPT_OUT_APPLIED", label: "Opt-out applied" },
        { value: "CONSENT_WITHDRAWN", label: "Consent recorded as withdrawn and use stopped" },
        {
          value: "NO_RECORDS_HELD",
          label: "No responsive records held",
          help: "Say so expressly and describe the search. A silent file is indistinguishable from a concealed one.",
        },
        { value: "REFUSED", label: "Refused" },
      ],
    },
    {
      key: "actionDetail",
      label: "What was actually provided or done",
      type: "textarea",
      section: "Response",
      help: "The categories disclosed, the redactions made and why, and the format used. Keep a copy of exactly what went out; the Kingdom may need to prove later what it did and did not send.",
    },
    {
      key: "dateResponded",
      label: "Date responded",
      type: "date",
      section: "Response",
      summary: true,
      help: "The date the substantive answer was sent. An acknowledgment of receipt is not a response and does not stop the clock.",
    },
    {
      key: "refusalGround",
      label: "Ground of refusal",
      type: "select",
      section: "Response",
      options: [
        { value: "NOT_REFUSED", label: "Not refused" },
        { value: "IDENTITY_NOT_VERIFIED", label: "Identity could not reasonably be verified" },
        {
          value: "LEGAL_HOLD",
          label: "Records under a preservation duty or needed to defend a claim",
        },
        { value: "LEGAL_OBLIGATION", label: "Retention required by another legal obligation" },
        {
          value: "THIRD_PARTY_DATA",
          label: "Disclosure would reveal another person's data",
          help: "Usually a reason to redact rather than to withhold the whole file. Refuse the minimum.",
        },
        {
          value: "INTERNAL_GOVERNANCE",
          label: "Internal ecclesiastical governance material",
          help: "The religious autonomy doctrine protects internal doctrine, polity, and discipline from civil adjudication; it is not a general exemption from telling a person what is in their own file. Use it narrowly and say precisely what it covers.",
        },
        {
          value: "EXCESSIVE_OR_REPETITIVE",
          label: "Manifestly unfounded, excessive, or repetitive",
          help: "Available, but rarely worth invoking. The first request in a twelve-month period must in any event be answered free of charge.",
        },
      ],
    },

    {
      key: "appealLodged",
      label: "Appeal lodged",
      type: "boolean",
      section: "Appeal",
      help: "Every refusal must carry written instructions for appealing it. If nobody ever appeals, check that the instructions are actually being sent.",
    },
    {
      key: "appealDate",
      label: "Date appeal received",
      type: "date",
      section: "Appeal",
      help: "Starts a fresh 60-day period for a written appeal decision. The appeal should be decided by an officer other than the one who refused.",
    },
    {
      key: "appealOutcome",
      label: "Appeal decision and reasons",
      type: "textarea",
      section: "Appeal",
      help: "The decision, its reasons, and confirmation that the requester was told how to submit a complaint to the Connecticut Attorney General. Telling someone how to complain about the Kingdom is a mark of an institution that expects to be found in the right.",
    },
  ],

  deadlineRules: [
    {
      id: "prv-verification-stalled",
      title: "Identity still unverified",
      fromField: "dateReceived",
      offsetDays: 10,
      severity: "ROUTINE",
      detail:
        "The response period runs from receipt whether or not verification is finished. Either complete verification or tell the requester exactly what is needed — do not let the request sit while the clock spends itself.",
      when: (data) => !data.verificationDate && !data.dateResponded,
    },
    {
      id: "prv-45-day",
      title: "Response to the data subject falls due",
      fromField: "dateReceived",
      offsetDays: 38,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. §§ 42-515 et seq. (Connecticut Data Privacy Act)",
      detail:
        "Forty-five days from receipt. One week remains. If more time is genuinely needed, the extension must be taken and communicated within the original period — an extension announced on day 50 is simply a late response.",
      when: (data) => !data.dateResponded,
    },
    {
      id: "prv-extended-deadline",
      title: "Extended response period closes",
      fromField: "dateReceived",
      offsetDays: 83,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. §§ 42-515 et seq. (Connecticut Data Privacy Act)",
      detail:
        "The single available extension expires at 90 days from receipt. There is no second extension. Send the substantive answer, in whatever state the search has reached, together with an account of what remains outstanding.",
      when: (data) => data.extensionInvoked === true && !data.dateResponded,
    },
    {
      id: "prv-appeal-decision",
      title: "Appeal decision falls due",
      fromField: "appealDate",
      offsetDays: 53,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. §§ 42-515 et seq. (Connecticut Data Privacy Act)",
      detail:
        "Sixty days from receipt of the appeal for a written decision with reasons, delivered with information on how to complain to the Attorney General. An appeal that is never decided is the fact a regulator opens with.",
      when: (data) => data.appealLodged === true && !data.appealOutcome,
    },
  ],
};

export default privacyRequests;
