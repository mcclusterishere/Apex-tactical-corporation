import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Notices and Proof of Service.
 *
 * A right asserted but not provably communicated is a right not asserted. This
 * register exists so that years later the Kingdom can establish exactly what
 * document was sent, to whom, by what means, and on what date — and can meet the
 * commonest answer to any demand, which is not "you are wrong" but "that is not
 * what I received".
 */

const notices: RegistryDef = {
  slug: "notices",
  title: "Register of Notices and Proof of Service",
  shortTitle: "Notices & Service",
  recordLabel: "Notice",
  recordLabelPlural: "Notices",
  group: "rights",
  numberPrefix: "NOT",
  order: 4,
  authority: "Charter Art. IV §7; Art. VI §3 (Communications with Outside Parties)",
  description:
    "Every notice, demand, and takedown the Kingdom sends, with the digest of the document served and the evidence that it arrived.",
  guidance: `This register answers one question, years later and possibly under oath: what was sent, to whom, and when. A notice the Kingdom cannot prove was received is a notice that was never sent.

**Record the digest of the document actually served.** Compute the SHA-256 of the exact file that went out and enter it below. The most common response to a demand is not a denial of the law but a denial of the document — a different version, a missing exhibit, a letter said to have been edited afterwards. A digest entered on the day of service, in a chained ledger that cannot be quietly rewritten, closes that argument permanently. Keep the file itself in the Evidence Vault; the digest here is what proves the two are the same document.

**Certified mail with return receipt earns its cost.** Delivery is nearly impossible to reconstruct after the fact, and the return receipt or its electronic equivalent is the cheapest evidence the Kingdom will ever buy. Enter the tracking number on the day of mailing, not when someone gets round to it. First-class mail supports only a presumption of receipt, which a respondent can rebut by testifying they never got it. Email supports nothing at all unless the recipient replies.

**A notice sent to a stale address proves nothing.** Verify the address against a current source before service: the Secretary of the State's business registry for a domestic entity, the registrar's abuse contact or WHOIS for a domain, the Copyright Office directory of designated agents for a DMCA notice, or the party's own recent filings. Record where the address came from and the date it was checked. Service on a dissolved entity's former registered agent costs a month and yields nothing.

**Platforms ignore letters.** Most service providers, marketplaces, app stores, and registrars act only on submissions through their own web forms, and a well-drafted letter to a general address will be discarded unread. Send it through the form, then record the ticket, case, or reference number the platform issues. That reference is the proof of submission and the key to every later escalation.

**Preservation letters are cheap and early.** A short letter putting a party on notice to retain documents, messages, server logs, account records, and backups costs almost nothing and interrupts the routine deletion that would otherwise be entirely innocent. Sent before the demand, it forecloses the answer that the evidence simply aged out in the ordinary course.

Set the response due date when the notice goes out. The register raises the file three days before it expires, so that what happens next is a decision rather than a discovery.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "DRAFT",
  titleField: "subjectSummary",
  listColumns: ["noticeType", "recipientName", "methodOfService", "dateSent"],

  statuses: [
    {
      value: "DRAFT",
      label: "Draft",
      tone: "neutral",
      help: "Not yet sent. Compute and record the digest only once the document is final.",
    },
    { value: "SENT", label: "Sent", tone: "active" },
    { value: "DELIVERED", label: "Delivered", tone: "active" },
    {
      value: "UNDELIVERABLE",
      label: "Undeliverable",
      tone: "danger",
      help: "Returned, refused, or bounced. Re-verify the address and serve again; do not treat a failed service as constructive notice.",
    },
    { value: "RESPONSE_RECEIVED", label: "Response received", tone: "active" },
    {
      value: "NO_RESPONSE",
      label: "No response — window closed",
      tone: "warning",
      help: "Silence is not consent and not default. It is simply the point at which the Kingdom must choose the next rung or stop.",
    },
    { value: "CLOSED", label: "Closed", tone: "success" },
    {
      value: "WITHDRAWN",
      label: "Withdrawn",
      tone: "warning",
      help: "Retracted by the Kingdom. Withdrawing promptly on discovering an error is the correct course and materially reduces exposure under 17 U.S.C. § 512(f).",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "subjectSummary",
      label: "Subject",
      type: "text",
      required: true,
      section: "The notice",
      summary: true,
      help: "One line naming the document and its object, sufficient to find it without opening it.",
    },
    {
      key: "noticeType",
      label: "Type of notice",
      type: "select",
      required: true,
      section: "The notice",
      summary: true,
      options: [
        { value: "DEMAND", label: "Demand" },
        { value: "CEASE_DESIST", label: "Cease and desist" },
        { value: "DMCA_TAKEDOWN", label: "DMCA takedown notice", help: "Must contain all six elements of 17 U.S.C. § 512(c)(3)(A) and is sworn under penalty of perjury." },
        { value: "DMCA_COUNTER_RESPONSE", label: "Response to a DMCA counter-notice" },
        { value: "INFRINGEMENT", label: "Notice of infringement" },
        { value: "CLAIM", label: "Notice of claim" },
        { value: "PRESERVATION", label: "Preservation letter", help: "Cheap, early, and the reason an opponent cannot later say the records were deleted in the ordinary course." },
        { value: "CORRESPONDENCE", label: "General correspondence" },
      ],
    },
    {
      key: "relatedMatter",
      label: "Related matter",
      type: "recordRef",
      refRegistry: "enforcement",
      section: "The notice",
      help: "The docket entry this notice belongs to, so that the matter shows its full service history in one place.",
    },
    {
      key: "signedBy",
      label: "Signed by",
      type: "person",
      section: "The notice",
      help: "The individual whose name and signature appear on the document. That person owns its contents personally, and for a DMCA notice swears to them under penalty of perjury.",
    },

    {
      key: "recipientName",
      label: "Recipient",
      type: "text",
      required: true,
      section: "Recipient",
      summary: true,
      help: "The correct legal name of the party or its designated agent. For a platform, the agent listed in the Copyright Office directory, not a general support address.",
    },
    {
      key: "recipientAddress",
      label: "Address served",
      type: "textarea",
      section: "Recipient",
      help: "The address exactly as it appeared on the envelope or form. Enter it as served, even if it later proves wrong; the record must show what was actually done.",
    },
    {
      key: "recipientEmail",
      label: "Email address served",
      type: "email",
      section: "Recipient",
    },
    {
      key: "addressVerification",
      label: "How the address was verified",
      type: "text",
      section: "Recipient",
      placeholder: "e.g. CT Secretary of the State business registry, checked 2026-03-04",
      help: "Source and date of the check. A notice to a stale address proves nothing, and this line is what shows the Kingdom took reasonable steps to reach the party.",
    },

    {
      key: "methodOfService",
      label: "Method of service",
      type: "select",
      required: true,
      section: "Service and proof",
      summary: true,
      options: [
        { value: "PERSONAL", label: "Personal service" },
        { value: "CERTIFIED", label: "Certified mail, return receipt requested", help: "The default for anything that matters. Delivery proof is otherwise almost impossible to reconstruct." },
        { value: "FIRST_CLASS", label: "First class mail", help: "Supports a presumption of receipt only, which the recipient may rebut by denying it." },
        { value: "EMAIL", label: "Email" },
        { value: "PLATFORM_FORM", label: "Platform web form" },
        { value: "COURIER", label: "Courier" },
        { value: "PUBLICATION", label: "Publication" },
      ],
    },
    {
      key: "dateSent",
      label: "Date sent",
      type: "date",
      required: true,
      section: "Service and proof",
      summary: true,
      help: "The day the document was placed in the mail, handed to the courier, or submitted. This is the date every response window is counted from.",
    },
    {
      key: "trackingNumber",
      label: "Tracking or article number",
      type: "text",
      section: "Service and proof",
      help: "Enter on the day of mailing. Carrier tracking histories become unavailable within months; the number recorded here is what lets the record be reconstructed later.",
    },
    {
      key: "platformReference",
      label: "Platform submission reference",
      type: "text",
      section: "Service and proof",
      help: "The ticket, case, or claim number the platform returned. This is the only proof that a web-form submission was made, and every escalation with that platform will be keyed to it.",
    },
    {
      key: "documentDigest",
      label: "SHA-256 digest of the document served",
      type: "text",
      section: "Service and proof",
      placeholder: "64 hexadecimal characters",
      help: "Of the exact file that went out, computed before sending. This is what defeats the claim that a different or later-edited document was received. Lodge the file itself in the Evidence Vault.",
    },
    {
      key: "dateDelivered",
      label: "Date delivered",
      type: "date",
      section: "Service and proof",
      help: "From the return receipt, carrier confirmation, or the recipient's own acknowledgement — not the date the Kingdom assumes it arrived.",
    },
    {
      key: "proofOfDeliveryRef",
      label: "Proof of delivery reference",
      type: "text",
      section: "Service and proof",
      help: "Evidence Vault identifier for the signed receipt, delivery scan, read receipt, or platform confirmation. Scan the green card the day it comes back; they are lost more often than any other document in this process.",
    },

    {
      key: "responseDueDate",
      label: "Response due date",
      type: "date",
      section: "Response",
      summary: true,
      help: "The deadline stated in the notice itself. Set a period the Kingdom will actually honour — a deadline that passes without consequence teaches the recipient that none of them are real.",
    },
    {
      key: "responseReceivedDate",
      label: "Date response received",
      type: "date",
      section: "Response",
    },
    {
      key: "responseSummary",
      label: "Substance of the response",
      type: "textarea",
      section: "Response",
      help: "What the recipient said, including any admission, and whether counsel has now appeared for them. Once a party is represented, further contact should go through their lawyer.",
    },
    {
      key: "outcome",
      label: "Outcome",
      type: "textarea",
      section: "Response",
      help: "What the notice actually achieved — material removed, terms agreed, refusal, or silence. Over time this is what shows which forms of notice are worth sending.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Response",
      classification: "SEALED",
    },
  ],

  deadlineRules: [
    {
      id: "not-response-due",
      title: "Response window closes in three days",
      fromField: "responseDueDate",
      offsetDays: -3,
      severity: "HIGH",
      detail:
        "Decide now what follows if nothing arrives, and have it ready to go on the day. The credibility of every later notice depends on this deadline meaning something.",
    },
    {
      id: "not-no-delivery-confirmation",
      title: "No delivery confirmation recorded",
      fromField: "dateSent",
      offsetDays: 21,
      severity: "HIGH",
      detail:
        "Three weeks since service with no proof of delivery on file. Check carrier tracking while the history is still retrievable, and if it shows non-delivery, re-verify the address and serve again rather than relying on a notice that may never have arrived.",
      when: (data) => !data.dateDelivered && !data.proofOfDeliveryRef,
    },
  ],
};

export default notices;
