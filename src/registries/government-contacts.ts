import type { RegistryDef } from "@/registries/types";

/**
 * The Government-to-Government Contact Register.
 *
 * One record per discrete dealing with an outside government — every letter,
 * meeting, call, and filing, answered or ignored. Kept because a continuous
 * dated file is the only form in which external relations can later be proved,
 * and because two officers working the same office in the same month costs more
 * than either errand was worth.
 */

const governmentContacts: RegistryDef = {
  slug: "government-contacts",
  title: "Government-to-Government Contact Register",
  shortTitle: "Government Contacts",
  recordLabel: "Contact",
  recordLabelPlural: "Contacts",
  group: "relations",
  numberPrefix: "G2G",
  order: 1,
  authority: "Charter Art. VI (External Relations & Non-Interference); Art. IV §9",
  description:
    "Every dealing with an outside government, agency, or official — what was sought, what was said, what came back, and what remains outstanding.",
  guidance: `Enter a contact the week it happens, whether it produced anything or not. A contact that went nowhere is still evidence. An undocumented contact is not anything at all.

**Why the continuous file is worth more than any single letter.** Three reasons, each independent of the others.

*First, external relations are the material out of which recognition and historical claims are built.* The federal acknowledgment criteria treat dealings with federal, state, and local governments as one form of evidence that an entity has been identified as such (25 C.F.R. § 83.11(a)). Be exact about what that means here. Part 83 also requires identification as an American Indian entity on a substantially continuous basis since 1900, existence as a distinct community since that date, continuous political influence over members, and descent from a historical Indian tribe. A correspondence file opened in this decade cannot supply those criteria, and nothing recorded in this register ever will. What it can do is document the present, which is the only part of the record still being written.

*Second, it converts impression into proof.* "They ignore us" is not a fact anyone can act on. Nine dated letters to a planning office, six of them unanswered, with proof of delivery, is a fact — and in a land-use dispute it is admissible.

*Third, it prevents the same ground being worked twice.* Two officers approaching the same legislative aide in the same month, asking for different things, reads as disorganisation and costs more than either request was worth.

**Form and address.** Write to the office that has the authority to give you what you want, not to the most senior name available. Use the correct title. Keep it to one page. State the specific thing sought and the date by which a reply is requested. Sign with a name, an office, and a return address, and send by a method that produces proof of delivery.

**Posture decides whether the letter is read at all.** Correspondence that opens by asserting sovereign immunity, disclaiming the recipient's jurisdiction, or demanding recognition as a precondition to discussion is routed to a file and never answered. Said plainly once: a private association has no sovereign immunity, so the assertion buys nothing and costs the letter its reader. Correspondence that identifies the writer, states a concrete and lawful request, and cites the authority for it gets a response, because a public office is obliged to handle it.

**Know where the actual leverage is.** With a municipality it is RLUIPA — the substantial burden and equal terms provisions, 42 U.S.C. § 2000cc — together with the political weight of a congregation that votes in the ward. With a state legislator it is constituent standing: members are voters in the district, entitled to casework and a meeting. With a federal agency it is the specific programme being applied for, judged on that programme's own published criteria. None of these require anyone to concede the Kingdom's sovereignty, which is precisely why they work.

**The General Assembly Citation.** The Official Citation of 5 October 2025 is a genuine honour, introduced by nine legislators and signed and sealed by the President Pro Tempore, the Speaker, and the Secretary of the State. It is creditable evidence of community contribution and should be presented as exactly that. It is not state recognition of a tribe, it confers no legal status, and it creates no government-to-government relationship; the General Assembly issues citations for anniversaries, retirements, and Eagle Scouts. Offering it to an official who knows the difference ends that relationship and taints everything filed alongside it.

Nothing recorded here may be styled as process. Outbound correspondence is a request or a position, never a summons, a notice of default, a lien, or anything wearing the dress of a court order.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "PREPARED",
  titleField: "subject",
  listColumns: ["counterpartBody", "level", "direction", "contactDate"],

  statuses: [
    { value: "PREPARED", label: "Prepared, not yet sent", tone: "neutral", help: "Drafted and approved internally. Nothing has left the building." },
    { value: "SENT", label: "Sent", tone: "active", help: "Dispatched. Record the method and keep the proof of delivery." },
    { value: "RECEIVED", label: "Received (inbound)", tone: "active", help: "A contact initiated by the outside body and logged on arrival." },
    { value: "AWAITING_RESPONSE", label: "Awaiting response", tone: "warning" },
    { value: "RESPONDED", label: "Response received", tone: "success" },
    { value: "NO_RESPONSE", label: "No response — closed unanswered", tone: "danger", help: "Close it here rather than leaving it open. An unanswered contact is the entry that proves the pattern." },
    { value: "CLOSED", label: "Closed", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "counterpartBody",
      label: "Counterpart body",
      type: "text",
      required: true,
      section: "The counterpart",
      summary: true,
      help: "The government or institution itself, by its formal name — City of Bridgeport, Connecticut General Assembly, Bureau of Indian Affairs. Not the individual.",
    },
    {
      key: "level",
      label: "Level of government",
      type: "select",
      required: true,
      section: "The counterpart",
      summary: true,
      help: "Determines which lever applies. The argument that moves a zoning board is not the argument that moves a congressional office.",
      options: [
        { value: "MUNICIPAL", label: "Municipal or town", help: "Zoning, planning, building, assessor, police, mayor's office. Where RLUIPA does its work." },
        { value: "STATE", label: "State of Connecticut", help: "Agencies, the General Assembly, constitutional officers. Constituent standing is the currency here." },
        { value: "FEDERAL", label: "Federal", help: "Judged on a programme's own eligibility criteria. Assertions of status will not substitute for meeting them." },
        { value: "TRIBAL", label: "Tribal government", help: "Federally or state-recognised tribes deal government-to-government with each other and with the United States. Approach as a neighbour and a petitioner, not as a peer, and do not claim a relationship that has not been extended." },
        { value: "FOREIGN", label: "Foreign state" },
        { value: "INTERGOVERNMENTAL", label: "Intergovernmental body", help: "Councils of governments, regional authorities, compacts." },
        { value: "INTERNATIONAL_ORG", label: "International organisation", help: "UN bodies and mechanisms. Correspondence is received and archived; it produces no domestic legal effect." },
      ],
    },
    {
      key: "agencyOffice",
      label: "Agency, department, or office",
      type: "text",
      section: "The counterpart",
      help: "The specific unit with authority over the matter. Writing to the right desk is most of the work.",
    },
    {
      key: "officialName",
      label: "Named official",
      type: "person",
      section: "The counterpart",
      help: "A named human being makes a file traceable. Staff move; the name is how the next officer picks up the thread.",
    },
    {
      key: "officialTitle",
      label: "Title of the official",
      type: "text",
      section: "The counterpart",
      help: "Used verbatim in the salutation. Getting a title wrong signals that the writer does not know the institution.",
    },
    {
      key: "officialContact",
      label: "Contact address used",
      type: "text",
      section: "The counterpart",
      help: "The postal or electronic address the contact actually went to, so that a later claim of non-delivery can be answered.",
    },

    {
      key: "direction",
      label: "Direction",
      type: "select",
      required: true,
      section: "The contact",
      summary: true,
      options: [
        { value: "OUTGOING", label: "Outgoing — from the Kingdom" },
        { value: "INCOMING", label: "Incoming — to the Kingdom", help: "Log inbound contact the day it arrives. Anything with a deadline attached is routed to Counsel the same day." },
      ],
    },
    {
      key: "mode",
      label: "Mode of contact",
      type: "select",
      required: true,
      section: "The contact",
      options: [
        { value: "LETTER", label: "Letter", help: "The strongest form of record. Certified mail with return receipt makes delivery provable." },
        { value: "EMAIL", label: "Email" },
        { value: "MEETING", label: "Meeting" },
        { value: "CALL", label: "Telephone call", help: "Follow a substantive call with a short confirming email the same day. An unconfirmed call is one person's memory." },
        { value: "TESTIMONY", label: "Public testimony or hearing" },
        { value: "FILING", label: "Formal filing or application" },
        { value: "SITE_VISIT", label: "Site visit or inspection" },
      ],
    },
    {
      key: "contactDate",
      label: "Date of contact",
      type: "date",
      required: true,
      section: "The contact",
      summary: true,
      help: "For outgoing letters, the date it was placed in the mail or transmitted — the date any response period runs from.",
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      required: true,
      section: "The contact",
      help: "One line, as it would appear in a reference block. This titles the record and is how it is found again in three years.",
    },
    {
      key: "officerActing",
      label: "Officer acting for the Kingdom",
      type: "recordRef",
      refRegistry: "offices",
      section: "The contact",
      help: "Who spoke for the Kingdom, under which commission. Checked before any second officer opens the same matter.",
    },
    {
      key: "summaryOfContact",
      label: "What was said or sought",
      type: "textarea",
      required: true,
      section: "Substance",
      help: "A factual account written the same week, while it is still accurate. Include what was asked for in terms specific enough that a reader can tell whether it was granted.",
    },
    {
      key: "positionAsserted",
      label: "Position asserted by the Kingdom",
      type: "textarea",
      section: "Substance",
      help: "The legal or institutional basis actually relied on — RLUIPA, constituent standing, programme eligibility, a property right. Recording it keeps the Kingdom's positions consistent across offices and across years.",
    },
    {
      key: "deliveryEvidence",
      label: "Proof of delivery",
      type: "text",
      section: "Substance",
      help: "Certified mail article number, courier tracking, read receipt, or the name of the person who accepted it. Without this, silence proves nothing.",
    },
    {
      key: "copyOnFile",
      label: "Copy of the document is on file",
      type: "boolean",
      section: "Substance",
      help: "The sent copy, not the draft. Deposit it in the Evidence Vault where the contact may matter to a proceeding.",
    },

    {
      key: "responseReceived",
      label: "Response received",
      type: "textarea",
      section: "Response",
      help: "What came back, in substance, including a refusal or a referral elsewhere. A referral is a result and should be entered as one.",
    },
    {
      key: "responseDate",
      label: "Date of response",
      type: "date",
      section: "Response",
      help: "The interval between this and the date of contact is the fact that matters when a pattern of non-response is later alleged.",
    },
    {
      key: "responseOutstanding",
      label: "A response is still outstanding",
      type: "boolean",
      section: "Response",
      summary: true,
      help: "Leave this set until something actually arrives. The register's value lies as much in the open items as in the closed ones.",
    },
    {
      key: "followUpDate",
      label: "Follow-up date",
      type: "date",
      section: "Response",
      help: "The day the Kingdom will chase this if nothing has come. Set it on every outgoing contact; a request nobody follows up was never really made.",
    },

    {
      key: "relatedInstrument",
      label: "Related instrument",
      type: "recordRef",
      refRegistry: "instruments",
      section: "Disposition",
      help: "The resolution, commission, or authorisation under which the contact was made, where one exists.",
    },
    {
      key: "outcome",
      label: "Outcome",
      type: "select",
      section: "Disposition",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "GRANTED", label: "Granted in full" },
        { value: "PARTIAL", label: "Granted in part" },
        { value: "REFUSED", label: "Refused" },
        { value: "REFERRED", label: "Referred to another office" },
        { value: "MEETING_OBTAINED", label: "Meeting or hearing obtained" },
        { value: "ACKNOWLEDGED_ONLY", label: "Acknowledged, no substance" },
        { value: "NO_RESPONSE", label: "No response at all" },
      ],
    },
    {
      key: "outcomeDetail",
      label: "Outcome in detail",
      type: "textarea",
      section: "Disposition",
      help: "What changed as a result, and what the next step is. Write it for an officer who has never seen the file.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Disposition",
      classification: "OFFICERS",
      help: "Assessment, impressions of the official, and tactical judgment. Kept separate from the factual account above so that the account remains disclosable.",
    },
  ],

  deadlineRules: [
    {
      id: "g2g-follow-up",
      title: "Follow-up due on government contact",
      fromField: "followUpDate",
      offsetDays: 0,
      severity: "ROUTINE",
      detail:
        "The date set for chasing this contact has arrived. If nothing has been received, send a short second letter referencing the first by date and reference number, and record it as a new contact. Two unanswered letters are a pattern; one is an accident.",
      when: (data) => data.responseOutstanding !== false,
    },
  ],
};

export default governmentContacts;
