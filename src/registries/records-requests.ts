import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Public Records Requests.
 *
 * Both directions: what the Kingdom asks of public bodies, and what is asked of
 * the Kingdom. Kept because a records request is the cheapest investigative
 * instrument in existence and the only one that works before a case is filed,
 * and because its value depends entirely on deadlines nobody remembers unaided.
 */

const recordsRequests: RegistryDef = {
  slug: "records-requests",
  title: "Register of Public Records Requests",
  shortTitle: "Records Requests",
  recordLabel: "Request",
  recordLabelPlural: "Requests",
  group: "relations",
  numberPrefix: "FOI",
  order: 3,
  authority:
    "Conn. Gen. Stat. § 1-200 et seq. (Connecticut Freedom of Information Act); 5 U.S.C. § 552",
  description:
    "Requests made by the Kingdom to public bodies and requests made to the Kingdom, with the statutory clocks, the exemptions claimed, and what was produced.",
  guidance: `A public records request costs a stamp. It is the most under-used instrument available to a small institution, and the one that most often decides whether a dispute is worth having.

**Connecticut.** Records of public agencies are open to inspection and copying under Conn. Gen. Stat. § 1-210. A denial must be made in writing within four business days of the request, and a failure to respond within four business days is itself deemed a denial (§ 1-206(a)). From a denial — actual or deemed — there are thirty days in which to file a notice of appeal with the Freedom of Information Commission (§ 1-206(b)(1)). The Commission is not a formality: it takes evidence, holds hearings, orders disclosure, and may impose a civil penalty of up to one thousand dollars personally against an official who denied access without reasonable grounds. Appeals are free to file and are heard on the papers and at hearing without counsel. A municipal official who has ignored two letters behaves differently once a docket number exists.

**Federal.** Under 5 U.S.C. § 552(a)(6)(A)(i) an agency must determine within twenty business days whether it will comply and tell the requester why not. The window for an administrative appeal is set by each agency's own regulations, commonly ninety days; read the denial letter, which must state it, and enter that date below rather than assuming.

**How to write one that works.** Describe the records so that a clerk who knows nothing about the matter could find them: name the office, name the subject, name the individuals whose correspondence is sought, and give a date range with both ends. Ask for electronic records in their native electronic form, which preserves metadata and costs the agency less than copying. Ask in the same letter for a fee waiver or reduction where the request is not commercial, and say in one sentence why disclosure serves the public interest. Send it to the designated records officer, dated, with a reference number from this register.

**Send them early.** In any dispute with a municipal body — a zoning denial, a permit refused, a condition attached to an approval — the internal emails, staff memoranda, and the notes of the site inspection are obtainable, and they are obtainable *before* anything is filed and without anyone's permission. They routinely decide whether litigation is worth bringing, and in an RLUIPA matter they are frequently where the equal-terms comparison is found: what the town required of the other assemblies on the same street. Requests sent after a complaint is filed arrive into a hostile posture. Requests sent in the ordinary course arrive as routine.

**Inbound requests.** A private religious association is not a public agency within the meaning of Conn. Gen. Stat. § 1-200(1), and is generally under no obligation to respond to a request made under FOIA. Say so once, courteously, and stop. But note that refusing is a choice with consequences, not a default: where the request concerns something the Kingdom is content to have known, a considered voluntary response is often better strategy than silence, and costs nothing. Where it concerns membership records, discipline files, donor identities, or the personal data of minors, do not produce, refer the request to Counsel, and record the refusal here with its reasons. Silence and a reasoned declination look very different when quoted back later.

A records request is an ordinary citizen's tool exercised under an ordinary statute. Nothing sent under this register should be styled as process, and none of it depends on anyone accepting the Kingdom's status — which is exactly why it works.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "DRAFT",
  titleField: "subject",
  listColumns: ["direction", "publicBody", "dateSubmitted", "statutoryResponseDeadline"],

  statuses: [
    { value: "DRAFT", label: "Draft", tone: "neutral" },
    { value: "SUBMITTED", label: "Submitted", tone: "active", help: "Sent. The statutory clock runs from this date, so keep the proof of transmission." },
    { value: "ACKNOWLEDGED", label: "Acknowledged", tone: "active" },
    { value: "OVERDUE", label: "Overdue — deemed denied", tone: "warning", help: "Under Conn. Gen. Stat. § 1-206(a), a failure to respond within four business days is a denial, and the thirty-day appeal window has started." },
    { value: "PARTIAL", label: "Produced in part", tone: "warning", help: "Records withheld or redacted. Demand the exemption claimed for each withholding, in writing." },
    { value: "PRODUCED", label: "Produced in full", tone: "success" },
    { value: "DENIED", label: "Denied", tone: "danger" },
    { value: "ON_APPEAL", label: "On appeal", tone: "warning" },
    { value: "CLOSED", label: "Closed", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "direction",
      label: "Direction",
      type: "select",
      required: true,
      section: "Direction and parties",
      summary: true,
      options: [
        { value: "OUTBOUND", label: "Made by the Kingdom to a public body" },
        { value: "INBOUND", label: "Made to the Kingdom by an outside party", help: "Log the day it arrives, even though the Kingdom is generally not subject to FOIA. What matters is that the decision to answer or decline was deliberate and dated." },
      ],
    },
    {
      key: "requestingParty",
      label: "Requesting party",
      type: "text",
      required: true,
      section: "Direction and parties",
      help: "For outbound requests, the officer signing on the Kingdom's behalf. For inbound, the person or organisation asking — including any organisation they act for, which is often the more useful fact.",
    },
    {
      key: "respondingParty",
      label: "Responding party",
      type: "text",
      section: "Direction and parties",
      help: "Who must answer, and who will be named in any appeal. For a municipal request this is usually a designated records officer or the town clerk, not the department head.",
    },
    {
      key: "publicBody",
      label: "Public body",
      type: "text",
      section: "Direction and parties",
      summary: true,
      help: "The agency whose records are sought, by its formal name. Requests addressed to the wrong body are lawfully refused and the clock restarts.",
    },

    {
      key: "statuteRelied",
      label: "Statute relied upon",
      type: "select",
      required: true,
      section: "The request",
      help: "Cite it in the request itself. A letter that invokes the statute is routed to the records officer; one that does not is treated as general correspondence and sits.",
      options: [
        { value: "CT_FOIA", label: "Connecticut FOIA — Conn. Gen. Stat. § 1-200 et seq.", help: "Written denial due within four business days; failure to respond is deemed a denial (§ 1-206(a)); appeal to the FOI Commission within thirty days (§ 1-206(b)(1))." },
        { value: "FEDERAL_FOIA", label: "Federal FOIA — 5 U.S.C. § 552", help: "Determination due within twenty business days (§ 552(a)(6)(A)(i)). The administrative appeal window is set by the agency's own regulations." },
        { value: "OTHER_STATE", label: "Another state's public records act" },
        { value: "COMMON_LAW", label: "Common-law right of access to court records" },
        { value: "VOLUNTARY", label: "Voluntary request — no statute", help: "Perfectly usable, but nothing compels an answer and there is nothing to appeal." },
        { value: "OTHER", label: "Other authority", help: "Name it in the request and in the notes." },
      ],
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
      section: "The request",
      help: "One line naming the matter, e.g. the address and application number of the zoning decision. This titles the record.",
    },
    {
      key: "dateSubmitted",
      label: "Date submitted",
      type: "date",
      required: true,
      section: "The request",
      summary: true,
      help: "The date the request was transmitted or placed in the mail. Every statutory response period runs from this date, so keep the transmission receipt.",
    },
    {
      key: "recordsSought",
      label: "Records sought",
      type: "textarea",
      required: true,
      section: "The request",
      help: "Copied verbatim from the request as sent. Describe the records so a clerk unfamiliar with the matter can locate them: the office, the subject, the named individuals whose correspondence is wanted, and the document types. Vagueness is the most common ground for a lawful refusal.",
    },
    {
      key: "dateRangeSought",
      label: "Date range specified",
      type: "text",
      section: "The request",
      placeholder: "e.g. 1 January 2024 to 30 June 2025",
      help: "Both ends. An open-ended range invites a refusal for burden and gives the agency a reason to negotiate rather than produce.",
    },
    {
      key: "formatRequested",
      label: "Format requested",
      type: "select",
      section: "The request",
      options: [
        { value: "ELECTRONIC_NATIVE", label: "Native electronic format", help: "Preferred. Preserves metadata, is searchable, and is cheaper for the agency than copying, which removes a fee objection." },
        { value: "PDF", label: "PDF" },
        { value: "SPREADSHEET", label: "Spreadsheet or delimited data" },
        { value: "PAPER", label: "Paper copies" },
        { value: "INSPECTION", label: "Inspection in person", help: "Free of charge in most cases, and useful where the volume is unknown." },
      ],
    },

    {
      key: "feeStatus",
      label: "Fee status",
      type: "select",
      section: "Fees",
      options: [
        { value: "NO_FEE", label: "No fee charged" },
        { value: "FEE_QUOTED", label: "Fee quoted, not yet paid", help: "An unpaid quote suspends production. Either pay, narrow the request, or challenge the quote as excessive." },
        { value: "FEE_PAID", label: "Fee paid" },
        { value: "WAIVER_REQUESTED", label: "Waiver or reduction requested" },
        { value: "WAIVER_GRANTED", label: "Waiver granted" },
        { value: "WAIVER_DENIED", label: "Waiver denied" },
      ],
    },
    {
      key: "feeAmount",
      label: "Fee quoted or paid",
      type: "money",
      section: "Fees",
      help: "An unexpectedly large quote is itself worth recording. It is sometimes a reason to narrow the request and sometimes evidence of an agency discouraging access.",
    },
    {
      key: "waiverBasis",
      label: "Basis stated for a fee waiver",
      type: "textarea",
      section: "Fees",
      help: "One or two sentences in the request explaining that the requester is a nonprofit religious body, that the purpose is not commercial, and how disclosure serves public understanding. Asked for in the original letter it is often granted; asked for afterwards it rarely is.",
    },

    {
      key: "acknowledgmentDate",
      label: "Date acknowledged",
      type: "date",
      section: "Response",
      help: "An acknowledgment is not a response. It confirms receipt, which forecloses any later claim that the request never arrived.",
    },
    {
      key: "statutoryResponseDeadline",
      label: "Statutory response deadline",
      type: "date",
      section: "Response",
      summary: true,
      help: "Computed from the date submitted under the statute relied upon — four business days for a Connecticut denial, twenty business days for a federal determination. Count business days, excluding state or federal holidays as applicable.",
    },
    {
      key: "responseReceived",
      label: "Response received",
      type: "select",
      section: "Response",
      options: [
        { value: "NONE", label: "Nothing received", help: "Under Connecticut FOIA this is a denial by operation of § 1-206(a), and it is appealable." },
        { value: "ACKNOWLEDGMENT_ONLY", label: "Acknowledgment only" },
        { value: "EXTENSION", label: "Extension or delay claimed" },
        { value: "PARTIAL", label: "Partial production" },
        { value: "FULL", label: "Full production" },
        { value: "DENIED", label: "Denied in full" },
      ],
    },
    {
      key: "responseDate",
      label: "Date of response or deemed denial",
      type: "date",
      section: "Response",
      help: "For an actual denial, its date. Where nothing came, enter the day the statutory period expired — that is the deemed denial, and the appeal window runs from it.",
    },
    {
      key: "recordsProduced",
      label: "Records produced",
      type: "textarea",
      section: "Response",
      help: "What actually arrived, with volume and format. Note conspicuous gaps — a chain of emails missing its replies, a date range short at one end — because a gap identified early is usually cured by a letter rather than an appeal.",
    },
    {
      key: "exemptionsClaimed",
      label: "Exemptions claimed",
      type: "textarea",
      section: "Response",
      help: "Each exemption cited by section, and which records it was applied to. An agency that withholds without specifying the exemption has not made a lawful denial, and saying so in writing frequently produces the records without an appeal.",
    },

    {
      key: "appealStatus",
      label: "Appeal status",
      type: "select",
      section: "Appeal and outcome",
      options: [
        { value: "NOT_APPEALED", label: "Not appealed" },
        { value: "INTERNAL_APPEAL", label: "Administrative appeal to the agency" },
        { value: "FOIC_COMPLAINT_FILED", label: "Complaint filed with the FOI Commission", help: "Conn. Gen. Stat. § 1-206(b)(1). Filing is free and requires no counsel." },
        { value: "FOIC_HEARING_SCHEDULED", label: "FOI Commission hearing scheduled" },
        { value: "FOIC_ORDER_ISSUED", label: "FOI Commission order issued" },
        { value: "COURT_APPEAL", label: "Appeal to the Superior Court" },
        { value: "RESOLVED", label: "Resolved without decision", help: "Records produced after the complaint was filed. Common, and a result worth recording as one." },
      ],
    },
    {
      key: "appealFiledDate",
      label: "Date appeal filed",
      type: "date",
      section: "Appeal and outcome",
      help: "Under Connecticut FOIA the notice of appeal must reach the Commission within thirty days of the denial, actual or deemed. The window is jurisdictional; nothing revives it.",
    },
    {
      key: "foicDocketNumber",
      label: "Commission or court docket number",
      type: "text",
      section: "Appeal and outcome",
      placeholder: "e.g. FIC 2026-0123",
      help: "Cite it in every later communication with the agency. A docket number changes how a request is handled.",
    },
    {
      key: "outcome",
      label: "Outcome",
      type: "textarea",
      section: "Appeal and outcome",
      help: "What was ultimately obtained, what it showed, and what it changed. Where an inbound request was declined, record the reasons given and to whom.",
    },
    {
      key: "evidenceRef",
      label: "Evidence deposit",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Appeal and outcome",
      help: "Where produced records are lodged. Documents obtained under FOIA are admissible and often self-authenticating; they are worth far more with a custody record than loose in a mailbox.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Appeal and outcome",
      classification: "OFFICERS",
      help: "Assessment, follow-up requests suggested by what arrived, and any tactical judgment. Kept apart from the factual record above.",
    },
  ],

  deadlineRules: [
    {
      id: "foi-response-due",
      title: "Statutory response deadline approaching",
      fromField: "statutoryResponseDeadline",
      offsetDays: -2,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 1-206(a); 5 U.S.C. § 552(a)(6)(A)(i)",
      detail:
        "Two days remain in the response period. If nothing arrives, the request is denied by operation of law under Connecticut FOIA and the thirty-day appeal window opens on the day the period expires. Diarise that date now.",
    },
    {
      id: "foi-foic-appeal-window",
      title: "Thirty-day window to appeal to the FOI Commission is closing",
      fromField: "responseDate",
      offsetDays: 23,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 1-206(b)(1)",
      detail:
        "Seven days remain to file a notice of appeal with the Connecticut Freedom of Information Commission, measured from the denial, actual or deemed. The window is jurisdictional and cannot be extended. Filing is free, requires no counsel, and frequently produces the records before any hearing is held.",
      when: (data) =>
        data.statuteRelied === "CT_FOIA" &&
        data.direction === "OUTBOUND" &&
        (data.responseReceived === "DENIED" ||
          data.responseReceived === "PARTIAL" ||
          data.responseReceived === "NONE") &&
        !data.appealFiledDate,
    },
  ],
};

export default recordsRequests;
