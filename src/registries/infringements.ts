import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Encroachments and Infringements — the observation log.
 *
 * It feeds the Enforcement Docket and is kept separately from it because
 * observing is not accusing. Material vanishes the moment a demand arrives, so
 * capture must precede contact; and because a great deal of what looks like
 * infringement is lawful commentary, criticism, or reference, this is also where
 * the Kingdom records the matters it examined and correctly declined to pursue.
 */

const infringements: RegistryDef = {
  slug: "infringements",
  title: "Register of Encroachments and Infringements",
  shortTitle: "Encroachments",
  recordLabel: "Observation",
  recordLabelPlural: "Observations",
  group: "rights",
  numberPrefix: "INF",
  order: 5,
  authority: "Charter Art. IV §7; Art. VI §5 (Distinct Identity)",
  description:
    "Contemporaneous log of every observed misuse of the Kingdom's works, marks, name, and cultural property, with the capture that makes it provable and an honest assessment of whether it is actionable at all.",
  guidance: `This is the observation log. Nothing should be escalated to the Enforcement Docket that has not first been captured here.

**Capture immediately and completely.** Infringing material disappears the moment a demand arrives — that is the rational response of anyone who receives one — and an infringement that was not captured is an infringement that cannot be proved. The window is hours, not weeks.

A capture worth having contains all of the following:

- A **full-page image or PDF** showing the material together with the URL bar and the system clock or date. A cropped screenshot of the content alone establishes almost nothing about where it appeared or when.
- An **independent archival reference** — a Wayback Machine or archive.today snapshot — created the same day. A third-party archive is far harder to attack than a file in the Kingdom's own custody, because the Kingdom controls its own files and an opponent will say so.
- **The file itself**, downloaded, with its SHA-256 digest recorded here and the file lodged in the Evidence Vault under a custody entry.
- **The observer's own contemporaneous note, in their words, dated.** This is not a formality. The observer may one day have to testify to what they personally saw, and a note drafted by someone else, or written months afterwards from memory, is worth very little. Record what was seen, where, and how it was found.

**Not every use is an infringement, and triage must be honest.** Fair use (17 U.S.C. § 107) protects a great deal of commentary, criticism, parody, scholarship, and news reporting. And trademark law prohibits confusion as to source, not mention: a journalist, a scholar, a critic, or a former member may name the Kingdom, describe it, and disagree with it in public without infringing anything. Reporting on the Kingdom is not trademark infringement. Criticism of the Kingdom is not copyright infringement. Neither is quotation, linking, or accurate description.

A note on how that argument is actually framed here. Some circuits apply a distinct "nominative fair use" test; the Second Circuit, which governs Connecticut, does not treat it as a separate defence and folds the question into its ordinary likelihood-of-confusion analysis (*International Information Systems Security Certification Consortium, Inc. v. Security University, LLC*, 823 F.3d 153 (2d Cir. 2016)), alongside the statutory descriptive-use defence at 15 U.S.C. § 1115(b)(4). The practical answer is unchanged — do not pursue someone for referring to the Kingdom — but do not record in this register that a use is protected by a freestanding doctrine the governing circuit has not adopted.

Pursuing protected speech as though it were infringement has three predictable results, all bad. The notice fails. The attempt itself becomes the story, spreading precisely the material the Kingdom wanted removed. And it costs money: in copyright a prevailing defendant may recover attorney's fees (17 U.S.C. § 505), and a knowingly material misrepresentation in a takedown notice creates liability to the target under § 512(f). Complete the lawful-use assessment field candidly and close the record as lawful use where that is the answer. A register that finds infringement every single time is a register no adjudicator will credit.

Escalate to a matter only when the right is confirmed in the Portfolio, the capture is complete, and the use is genuinely unlicensed and unprotected.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "OBSERVED",
  titleField: "observedItem",
  listColumns: ["locationType", "responsibleParty", "severity", "dateObserved"],

  statuses: [
    {
      value: "OBSERVED",
      label: "Observed — not yet captured",
      tone: "warning",
      help: "Seen but not secured. An observation in this state is not evidence and may be gone within the day.",
    },
    { value: "CAPTURED", label: "Captured", tone: "active", help: "Evidence secured and lodged. The record can now support a demand." },
    {
      value: "ASSESSED_LAWFUL",
      label: "Assessed as lawful use",
      tone: "neutral",
      help: "Reviewed and found to be fair use, nominative reference, reporting, commentary, or licensed use. Closed with no action, and rightly so.",
    },
    { value: "MONITORING", label: "Monitoring", tone: "neutral" },
    { value: "ESCALATED", label: "Escalated to a matter", tone: "active" },
    { value: "RESOLVED", label: "Resolved", tone: "success" },
    {
      value: "STALE",
      label: "Stale — capture never obtained",
      tone: "danger",
      help: "The material is gone and was never secured. Recorded honestly rather than deleted, because the pattern of misses is what justifies faster capture next time.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "observedItem",
      label: "What was observed",
      type: "text",
      required: true,
      section: "Observation",
      summary: true,
      help: "The specific material or conduct — the seal on a T-shirt, the charter text reposted, the name used as a business title. One observation per record, not a survey.",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: true,
      section: "Observation",
      help: "Factual account of what appeared and how it relates to the Kingdom's material. Describe; do not characterise. This paragraph may end up quoted in a notice.",
    },
    {
      key: "dateObserved",
      label: "Date observed",
      type: "date",
      required: true,
      section: "Observation",
      summary: true,
      help: "When the observer actually saw it, which is not necessarily when it was published. Starts the capture clock and bears on the limitation analysis if the matter is later escalated.",
    },
    {
      key: "observer",
      label: "Observer",
      type: "person",
      required: true,
      section: "Observation",
      help: "The individual who personally saw it. They may have to testify to it, so this must be a real person, not an office.",
    },
    {
      key: "observerNote",
      label: "Observer's contemporaneous note",
      type: "textarea",
      section: "Observation",
      help: "In the observer's own words, written the same day: what they saw, where, and how they came across it. A note in someone else's voice, or reconstructed later from memory, carries little weight and is easily impeached.",
    },

    {
      key: "locationType",
      label: "Where it was found",
      type: "select",
      required: true,
      section: "Location",
      summary: true,
      options: [
        { value: "WEBSITE", label: "Website or web page" },
        { value: "PLATFORM", label: "Social platform or marketplace" },
        { value: "PHYSICAL", label: "Physical location or goods" },
        { value: "PUBLICATION", label: "Print or online publication" },
        { value: "BROADCAST", label: "Broadcast or streamed media" },
        { value: "FILING", label: "Government filing or registration", help: "e.g. a business registration or trademark application using the Kingdom's name. USPTO applications carry their own opposition window." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "url",
      label: "URL",
      type: "url",
      section: "Location",
      help: "The full and exact address, including any fragment or query. A shortened or reconstructed link will not match the capture and invites the argument that they are different pages.",
    },
    {
      key: "platformName",
      label: "Platform or publisher",
      type: "text",
      section: "Location",
      help: "Determines the remedy available. Each platform has its own complaint route, and most act only on their own form.",
    },
    {
      key: "locationDetail",
      label: "Physical location or publication details",
      type: "textarea",
      section: "Location",
      help: "Street address and premises for physical goods; title, issue, date, and page for a publication. Enough for a third party to independently locate it.",
    },

    {
      key: "responsibleParty",
      label: "Party responsible, if known",
      type: "text",
      section: "Responsible party",
      summary: true,
      help: "Leave blank rather than guess. An identification made on assumption becomes a demand sent to the wrong party, which is embarrassing at best and defamatory at worst.",
    },
    {
      key: "partyContact",
      label: "Contact information and how it was obtained",
      type: "textarea",
      section: "Responsible party",
      help: "Registrar records, business filings, the account's own listed details. Record the source; it is what supports the address when a notice issues.",
    },

    {
      key: "captureMethod",
      label: "How it was captured",
      type: "multiselect",
      section: "Capture",
      help: "More than one, always. A single screenshot is the weakest form of proof and the easiest to attack.",
      options: [
        { value: "SCREENSHOT_FULL", label: "Full-page screenshot showing URL and clock" },
        { value: "PDF_PRINT", label: "Print to PDF" },
        { value: "ARCHIVE", label: "Third-party web archive snapshot" },
        { value: "DOWNLOAD", label: "File downloaded and hashed" },
        { value: "VIDEO", label: "Screen recording" },
        { value: "PHOTOGRAPH", label: "Photograph of physical goods or premises" },
        { value: "PURCHASE", label: "Test purchase with receipt", help: "The strongest capture for counterfeit goods: it produces the item, a receipt, and a shipping record in one step." },
        { value: "WITNESS", label: "Witness statement" },
      ],
    },
    {
      key: "archiveReference",
      label: "Archive snapshot reference",
      type: "text",
      section: "Capture",
      help: "The permanent URL of the third-party snapshot. Independent of the Kingdom, timestamped by someone else, and therefore far harder to dispute than the Kingdom's own file.",
    },
    {
      key: "fileDigest",
      label: "SHA-256 digest of the captured file",
      type: "text",
      section: "Capture",
      placeholder: "64 hexadecimal characters",
      help: "Computed at capture, before anything is edited or annotated. Proves that the file produced years later is the file that was taken that day.",
    },
    {
      key: "evidenceReferences",
      label: "Evidence Vault references",
      type: "textarea",
      section: "Capture",
      help: "Custody identifiers for the captures themselves. This register is the index; the Vault holds the material and the chain of custody.",
    },

    {
      key: "rightAffected",
      label: "Right affected",
      type: "recordRef",
      refRegistry: "intellectual-property",
      section: "Assessment",
      help: "The asset in the Portfolio said to be encroached upon. If nothing can be linked, ask first whether the Kingdom holds an enforceable right here at all.",
    },
    {
      key: "severity",
      label: "Assessed severity",
      type: "select",
      section: "Assessment",
      summary: true,
      options: [
        { value: "CRITICAL", label: "Critical", help: "Impersonation of the Kingdom or its offices, counterfeit credentials, or commercial exploitation at scale." },
        { value: "HIGH", label: "High" },
        { value: "MODERATE", label: "Moderate" },
        { value: "LOW", label: "Low", help: "Technically actionable and not worth the cost or the attention pursuing it would draw." },
      ],
    },
    {
      key: "ongoing",
      label: "Still occurring",
      type: "boolean",
      section: "Assessment",
      help: "Ongoing conduct supports injunctive relief and makes a takedown worthwhile. Conduct that has already stopped rarely justifies the expense of pursuit.",
    },
    {
      key: "useCharacter",
      label: "Character of the use",
      type: "select",
      section: "Assessment",
      options: [
        { value: "COMMERCIAL", label: "Commercial" },
        { value: "NON_COMMERCIAL", label: "Non-commercial" },
        { value: "EDUCATIONAL", label: "Educational or scholarly" },
        { value: "NEWS_COMMENTARY", label: "News reporting, commentary, or criticism", help: "Weighs heavily toward fair use and toward leaving it alone." },
        { value: "UNCLEAR", label: "Unclear" },
      ],
    },
    {
      key: "estimatedScale",
      label: "Estimated scale",
      type: "text",
      section: "Assessment",
      placeholder: "e.g. approx. 400 units listed; 12,000 views",
      help: "Copies, listings, views, or circulation, with the basis for the estimate. Scale drives both whether the matter is worth pursuing and any later damages figure.",
    },
    {
      key: "lawfulUseAssessment",
      label: "Lawful-use assessment",
      type: "textarea",
      section: "Assessment",
      help: "Address fair use under 17 U.S.C. § 107 and nominative use of the marks before any notice issues. Record the reasoning even — especially — where it favours the other party; considering fair use is a legal precondition to sending a DMCA notice, and this field is the record that it was done.",
    },

    {
      key: "escalatedToMatter",
      label: "Escalated to matter",
      type: "recordRef",
      refRegistry: "enforcement",
      section: "Disposition",
      help: "The Enforcement Docket entry opened on this observation, if any. Most observations should not have one.",
    },
    {
      key: "disposition",
      label: "Disposition",
      type: "textarea",
      section: "Disposition",
      help: "What was decided and why, including a decision to take no action. A recorded and reasoned decision not to pursue is as valuable as a demand, and considerably cheaper.",
    },
  ],

  deadlineRules: [
    {
      id: "inf-capture-window",
      title: "Capture not yet secured",
      fromField: "dateObserved",
      offsetDays: 2,
      severity: "CRITICAL",
      detail:
        "Two days since observation with no digest and no archive reference on file. Online material is routinely removed or altered within days, and it disappears immediately once the party learns of the Kingdom's interest. Secure the capture now or mark the record stale and say so honestly.",
      when: (data) => !data.fileDigest && !data.archiveReference,
    },
    {
      id: "inf-limitation-approaching",
      title: "Unescalated observation approaching the copyright limitation period",
      fromField: "dateObserved",
      offsetDays: 1005,
      severity: "HIGH",
      authority: "17 U.S.C. § 507(b)",
      detail:
        "Nearly three years since this was observed and no matter has been opened. A civil copyright action must be commenced within three years of accrual. Either open a matter, or close this record with a reasoned disposition so that the file does not simply expire unexamined.",
      when: (data) => !data.escalatedToMatter,
    },
  ],
};

export default infringements;
