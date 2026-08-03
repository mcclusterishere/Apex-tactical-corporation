import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Credentials Issued.
 *
 * One record for every card, certificate, or commission the Kingdom puts into
 * a person's hand. A credential is a statement the institution makes about
 * someone to third parties, and an institution that cannot say what it has
 * issued, to whom, and whether it is still good has lost control of its own
 * voice. The operative half of this register is not the issue list but the
 * revocation list: an unrevoked credential in the hands of a former officer is
 * apparent authority the Kingdom will be held to.
 */

const credentialsIssued: RegistryDef = {
  slug: "credentials-issued",
  title: "Register of Credentials Issued",
  shortTitle: "Credentials Issued",
  recordLabel: "Credential",
  recordLabelPlural: "Credentials",
  group: "identity",
  numberPrefix: "CDR",
  order: 2,
  authority: "Charter Art. II (Membership); Art. IV §3 (Offices and Commissions)",
  description:
    "Every credential the Kingdom has issued — to whom, in what terms, from what date to what date, and whether it is still in force or has been revoked.",
  guidance: `A credential of the Kingdom attests to standing **within the Kingdom** and to nothing else. It says that this person is enrolled, or holds this office, or is ordained, or is authorised to enter the archive. It is lawful in exactly the way a union card, a parish membership card, and a professional association card are lawful, and for the same reason: a private body may say who belongs to it and what they do for it.

**The line, which does not move.** Presenting a Kingdom credential as government identification, or issuing anything that resembles a law-enforcement credential — a badge, a shield, a warrant card, a seal styled after a state or federal one, the words *police*, *marshal*, *sheriff*, *agent*, *officer of the law*, *state* or *national identification* — is criminal impersonation under Conn. Gen. Stat. §§ 53a-130 and 53a-130a, with independent federal exposure under 18 U.S.C. § 701 for badges and insignia of the United States and 18 U.S.C. § 912 for holding oneself out as a federal officer. No Kingdom credential is ever described to a member, printed, or explained to an outside party as identification for use with any public authority. Where a member needs identification for a police officer, a bank, an airline, or an agency, the answer is the State of Connecticut, not this register.

**The system will not issue a credential whose text contains those terms**, and the refusal is deliberate. It exists so that no officer can produce such a document in the Kingdom's name on a bad day, and so that no opponent can ever hold one up and say the Kingdom's own system made it. Treat that as a protection of the Founder's authority rather than a limit on it: the whole of this institution's standing rests on never having crossed that line once.

**Practical discipline, in the order it matters.**

*Expiry.* Put an end date on everything. A credential with no expiry is a credential that is never returned, and five years on nobody can say how many are in circulation. Two years is a sensible default; a contractor or visitor credential should expire with the engagement. The register raises each one thirty days out.

*Revocation.* When an office ends, revoke the same day — not when the card comes back. Resignation, removal, withdrawal from the Roll, and the end of a contract are all revocation events. The revocation list is what an outside party is actually entitled to rely on, and apparent authority is judged by what the Kingdom has allowed a person to appear to hold, not by what it privately intended (Restatement (Third) of Agency § 2.03). A former officer with a valid-looking card who signs something, takes money, or gets into a building is a liability the Kingdom created.

*Photographs.* Hold a current photograph for any credential a holder will show to anyone. Refresh it on renewal.

*Receipt and notice of limitations.* Record that the holder acknowledged receipt and that they were given the written notice of what the credential does not do. That notice is the Kingdom's evidence, if a holder ever misuses one, that it told them plainly and in writing.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "PREPARED",
  titleField: "holderNameAsPrinted",
  listColumns: ["credentialType", "credentialNumber", "issueDate", "expiryDate"],

  statuses: [
    {
      value: "PREPARED",
      label: "Prepared, not issued",
      tone: "neutral",
      help: "Produced but not yet in the holder's hand. It confers nothing until delivered.",
    },
    { value: "ISSUED", label: "Issued", tone: "active", help: "Delivered to the holder; receipt not yet acknowledged." },
    { value: "IN_FORCE", label: "In force", tone: "success", help: "Delivered, acknowledged, unexpired, unrevoked." },
    {
      value: "EXPIRED",
      label: "Expired",
      tone: "warning",
      help: "Past its expiry date. Renew or revoke; do not leave it in this state, because the card in the holder's pocket looks identical to a valid one.",
    },
    {
      value: "REVOKED",
      label: "Revoked",
      tone: "danger",
      help: "Withdrawn by the Kingdom with effect from the revocation date. Publish to the revocation list the same day.",
    },
    {
      value: "SURRENDERED",
      label: "Surrendered and returned",
      tone: "neutral",
      help: "The physical credential is back in the Registrar's hands. The best outcome; still record the revocation date.",
    },
    {
      value: "LOST_OR_STOLEN",
      label: "Reported lost or stolen",
      tone: "warning",
      help: "Revoke immediately and issue a replacement under a new number. A lost credential is in someone's hands.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Replaced by a later credential. Record the replacement below." },
    { value: "VOID", label: "Void", tone: "danger", help: "Issued in error or never validly issued. Voided rather than deleted." },
  ],

  fields: [
    {
      key: "credentialNumber",
      label: "Credential number as printed",
      type: "text",
      required: true,
      summary: true,
      section: "The credential",
      help: "The number appearing on the credential itself, which is what a holder or a third party will quote. Distinct from this record's registry number, which never changes.",
    },
    {
      key: "credentialType",
      label: "Type of credential",
      type: "select",
      required: true,
      summary: true,
      section: "The credential",
      help: "Determines what the credential may say and how long it may run. There are seven types and no others; a credential that does not fit one of them is not issued.",
      options: [
        { value: "MEMBERSHIP", label: "Membership", help: "Attests enrolment on the Roll of Citizens and nothing further. Confers no authority to act for the Kingdom." },
        { value: "OFFICER_COMMISSION", label: "Officer commission", help: "Attests that the holder occupies a named office under the Charter. Revoke the day the office ends — this is the type that creates apparent authority." },
        { value: "MINISTERIAL", label: "Ministerial", help: "Attests ordination or licence to minister. Cross-reference the Register of Ordinations; it is not a licence to solemnise anything the State has not authorised." },
        { value: "DELEGATE", label: "Delegate", help: "Authority to represent the Kingdom at a named event, meeting, or proceeding. Should expire with that engagement." },
        { value: "CONTRACTOR", label: "Contractor", help: "A person engaged under contract, not a member and not an officer. Expiry must match the contract term." },
        { value: "VOLUNTEER", label: "Volunteer", help: "Service in a programme. Where the programme involves minors or vulnerable adults, the background-check discipline applies before this issues." },
        { value: "ARCHIVE_ACCESS", label: "Archive access", help: "Permission to enter and handle material in the archive or evidence store. Tie it to the custody log." },
      ],
    },
    {
      key: "standingAsPrinted",
      label: "Standing as printed on the credential",
      type: "text",
      required: true,
      section: "The credential",
      placeholder: "e.g. Member in good standing — Apex Kingdom",
      help: "The exact words the credential bears. Enter them verbatim so the Kingdom can later prove what it did and did not say. Words suggesting law-enforcement or government identification are refused.",
    },
    {
      key: "credentialFormat",
      label: "Format",
      type: "select",
      section: "The credential",
      help: "What physically exists, which governs what has to come back on revocation.",
      options: [
        { value: "CARD", label: "Printed card" },
        { value: "CERTIFICATE", label: "Paper certificate" },
        { value: "DIGITAL", label: "Digital credential only" },
        { value: "CARD_AND_CERTIFICATE", label: "Card and certificate" },
      ],
    },
    {
      key: "textReviewed",
      label: "Printed text reviewed against the prohibited-terms list",
      type: "boolean",
      required: true,
      section: "The credential",
      help: "Confirms an officer read the finished credential and that it contains no badge, shield, government seal, or law-enforcement or government-identification wording. This is the check that keeps the Kingdom on the right side of Conn. Gen. Stat. §§ 53a-130 and 53a-130a.",
    },

    {
      key: "holder",
      label: "Holder",
      type: "recordRef",
      refRegistry: "citizens",
      section: "Holder",
      help: "The enrolled person the credential is issued to. Leave blank only for a contractor who is not on the Roll, and then record their name below.",
    },
    {
      key: "holderNameAsPrinted",
      label: "Holder's name as printed",
      type: "text",
      required: true,
      summary: true,
      section: "Holder",
      help: "Exactly as it appears on the credential. Where it differs from the legal name on the Roll, both are kept — the credential must be traceable to a real person.",
    },
    {
      key: "underlyingOffice",
      label: "Office or commission relied on",
      type: "recordRef",
      refRegistry: "offices",
      section: "Holder",
      help: "The commission that justifies an officer credential. When that office ends, this credential is revoked the same day; the link is what makes that connection visible.",
    },
    {
      key: "photographHeld",
      label: "Photograph held",
      type: "boolean",
      section: "Holder",
      help: "Whether the Kingdom holds a current photograph of the holder. A credential shown to anyone should carry one, and it should look like the person carrying it.",
    },
    {
      key: "photographDate",
      label: "Date of photograph",
      type: "date",
      section: "Holder",
      classification: "OFFICERS",
      help: "Refresh on renewal. A ten-year-old photograph is worse than none, because it invites argument about whether the card belongs to the bearer.",
    },

    {
      key: "issueDate",
      label: "Date issued",
      type: "date",
      required: true,
      summary: true,
      section: "Validity",
      help: "The date the credential was produced and signed. Enter it the day it happens; a backfilled issue date is visible in the chain.",
    },
    {
      key: "effectiveDate",
      label: "Effective from",
      type: "date",
      section: "Validity",
      help: "When the credential begins to speak, which may be later than the issue date where an office starts on a future date.",
    },
    {
      key: "expiryDate",
      label: "Expires",
      type: "date",
      required: true,
      summary: true,
      section: "Validity",
      help: "Every credential expires. A credential with no end date is one that is never returned and can never be counted. Match a contractor or delegate credential to the engagement; two years is the default for the rest.",
    },

    {
      key: "signed",
      label: "Credential was signed",
      type: "boolean",
      section: "Signature and integrity",
      help: "Whether the issued credential carries a signature or cryptographic seal that lets a recipient check it against this register. An unverifiable credential is only as good as the confidence of whoever presents it.",
    },
    {
      key: "signingKeyFingerprint",
      label: "Signing key fingerprint",
      type: "text",
      section: "Signature and integrity",
      classification: "OFFICERS",
      help: "The fingerprint of the key that signed it. Recorded so that a credential can still be verified after a key is rotated, and so that a compromised key identifies every credential that must be reissued.",
    },

    {
      key: "deliveryMethod",
      label: "How it was delivered",
      type: "select",
      section: "Delivery and receipt",
      help: "Establishes when the credential left the Kingdom's control, which is the moment its risk begins.",
      options: [
        { value: "IN_PERSON", label: "Handed to the holder in person" },
        { value: "POST", label: "Sent by post" },
        { value: "SECURE_ELECTRONIC", label: "Sent electronically" },
        { value: "COLLECTED_BY_OFFICER", label: "Collected by an officer on the holder's behalf", help: "Record who collected it. A credential delivered to a third party is not yet in the holder's hands." },
        { value: "NOT_YET_DELIVERED", label: "Not yet delivered" },
      ],
    },
    {
      key: "deliveredDate",
      label: "Date delivered",
      type: "date",
      section: "Delivery and receipt",
    },
    {
      key: "receiptAcknowledged",
      label: "Holder acknowledged receipt",
      type: "boolean",
      section: "Delivery and receipt",
      help: "A signed or recorded acknowledgement. Without it the Kingdom cannot show the holder ever received the credential, which matters most in the case where they later misuse it.",
    },
    {
      key: "receiptDate",
      label: "Date of acknowledgement",
      type: "date",
      section: "Delivery and receipt",
    },
    {
      key: "limitationsNoticeGiven",
      label: "Notice of limitations given to the holder",
      type: "boolean",
      required: true,
      section: "Delivery and receipt",
      help: "The written notice stating that this credential evidences standing within the Kingdom only, is not government identification, is not a law-enforcement credential, and must not be presented to any public authority as identification. Give it with every credential and record that it was given — it is the Kingdom's proof that it warned the holder plainly.",
    },
    {
      key: "limitationsNoticeVersion",
      label: "Version of the notice given",
      type: "text",
      section: "Delivery and receipt",
      help: "Which text the holder actually received, so the Kingdom can produce the exact wording years later.",
    },

    {
      key: "replacesCredential",
      label: "Replaces credential",
      type: "recordRef",
      refRegistry: "credentials-issued",
      section: "Replacement and revocation",
      help: "The earlier credential this one supersedes. Mark that record Superseded and revoke it — a renewal that leaves the old card live doubles the number in circulation.",
    },
    {
      key: "revocationDate",
      label: "Date revoked",
      type: "date",
      summary: true,
      section: "Replacement and revocation",
      help: "The date the Kingdom withdrew the credential, which is the date the office ended or the report of loss came in — not the date the paperwork was done. Everything an outside party may rely on turns on this date.",
    },
    {
      key: "revocationReason",
      label: "Reason for revocation",
      type: "select",
      section: "Replacement and revocation",
      options: [
        { value: "OFFICE_ENDED", label: "Office or commission ended" },
        { value: "RESIGNED", label: "Holder resigned" },
        { value: "WITHDRAWN_FROM_ROLL", label: "Holder withdrew from the Roll", help: "Withdrawal is free under Charter Art. II. Revoking the credential is administrative and carries no penalty or finding." },
        { value: "REMOVED", label: "Holder removed by determination" },
        { value: "CONTRACT_ENDED", label: "Engagement or contract ended" },
        { value: "LOST_OR_STOLEN", label: "Reported lost or stolen" },
        { value: "MISUSE", label: "Misuse of the credential", help: "Revoke at once and record what was done with it. If it was presented as government identification, the Kingdom's own position depends on having acted immediately." },
        { value: "REPLACED", label: "Replaced by a new credential" },
        { value: "DECEASED", label: "Holder deceased" },
        { value: "ERROR", label: "Issued in error" },
      ],
    },
    {
      key: "credentialReturned",
      label: "Physical credential returned",
      type: "boolean",
      section: "Replacement and revocation",
      help: "Whether the card or certificate is back in the Registrar's hands. Recovery is preferable but never a precondition of revocation — revoke first, collect later.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Replacement and revocation",
      classification: "OFFICERS",
    },
  ],

  deadlineRules: [
    {
      id: "cdr-expiry-warning",
      title: "Credential expires in thirty days",
      fromField: "expiryDate",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Decide now whether this credential is renewed or allowed to lapse, and tell the holder either way. If it lapses, revoke it on the expiry date and record whether it came back — an expired card is indistinguishable from a valid one in the hand of whoever is holding it.",
    },
    {
      id: "cdr-revocation-effect",
      title: "Confirm the revocation has taken effect",
      fromField: "revocationDate",
      offsetDays: 1,
      severity: "CRITICAL",
      detail:
        "Kingdom practice, not statute. Confirm the credential appears on the revocation list, any digital credential is disabled, archive and building access is withdrawn, and the holder has been told in writing that they may no longer represent the Kingdom. Then ask for the card back. Until this is done the Kingdom is exposed to whatever a former holder does with it, because apparent authority is measured by what the institution allowed the world to believe.",
    },
  ],
};

export default credentialsIssued;
