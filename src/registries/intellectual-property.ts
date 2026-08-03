import type { RegistryDef } from "@/registries/types";

/**
 * The Intellectual Property Portfolio.
 *
 * This is the register that does the most practical work. Copyright and
 * trademark are rights that a United States court will enforce against a
 * stranger who has never heard of the Kingdom and owes it no deference — which
 * makes them the sharpest instruments the Kingdom actually holds. Their value
 * depends almost entirely on paperwork done early and on time, which is exactly
 * what a register is for.
 */

const intellectualProperty: RegistryDef = {
  slug: "intellectual-property",
  title: "Intellectual Property Portfolio",
  shortTitle: "Intellectual Property",
  recordLabel: "Asset",
  recordLabelPlural: "Assets",
  group: "rights",
  numberPrefix: "IP",
  order: 1,
  authority: "Charter Art. IV §7 (Economic Powers); Art. VI §5 (Distinct Identity)",
  description:
    "Every work, mark, name, and domain the Kingdom claims, with its registration posture and the dates on which its rights depend.",
  guidance: `Enter an asset here the day it is created, not the day someone infringes it. Two dates on this form decide what a claim is worth years later, and neither can be fixed retroactively.

**Copyright exists the moment a work is fixed in a tangible form.** No filing creates it. But filing decides what you can do about an infringement:

- You cannot file a copyright infringement suit over a U.S. work until the Copyright Office has acted on the application (17 U.S.C. § 411(a); *Fourth Estate v. Wall-Street.com*, 586 U.S. 296 (2019)). Ordinary processing runs many months, so an unregistered work means an unenforceable work for most of a year after you discover the problem.
- If registration is not made within three months of first publication, and the infringement began before registration, statutory damages and attorney's fees are unavailable (17 U.S.C. § 412). You are left proving actual damages, which for a small institution is usually a number too small to justify the case. **This one rule decides whether an infringement is worth pursuing.** The register raises the alarm at day 75.

**Trademark rights come from use in commerce, not from filing** — but registration adds nationwide constructive notice, a presumption of validity, and access to statutory remedies. Record the true date of first use in commerce and keep the specimen that proves it in the Evidence Vault. Overstating a first-use date is a defect that can void a registration.

Record the ownership basis honestly. Work created by a volunteer or a contractor does **not** belong to the institution by default: absent a signed written assignment it stays with the individual who made it, and "work made for hire" only reaches employees acting in the scope of employment or the nine enumerated commissioned categories with a signed agreement. An institution that assumes it owns what its people made, and discovers otherwise mid-litigation, loses the case on standing. Where an assignment exists, attach it.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "UNREGISTERED",
  titleField: "assetTitle",
  listColumns: ["assetType", "protectionKind", "firstPublishedDate", "registrationNumber"],

  statuses: [
    { value: "UNREGISTERED", label: "Unregistered", tone: "warning", help: "Rights exist but nothing is on file with a registry." },
    { value: "PREPARING", label: "Application in preparation", tone: "neutral" },
    { value: "FILED", label: "Application filed", tone: "active" },
    { value: "PUBLISHED_OPPOSITION", label: "Published for opposition", tone: "active", help: "Trademark only. A 30-day window in which third parties may oppose." },
    { value: "REGISTERED", label: "Registered", tone: "success" },
    { value: "REFUSED", label: "Refused", tone: "danger" },
    { value: "ABANDONED", label: "Abandoned", tone: "danger" },
    { value: "EXPIRED", label: "Expired / cancelled", tone: "danger" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "assetTitle",
      label: "Title of the work or mark",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "Exactly as it appears on the work itself. For a word mark, the mark alone with no styling.",
    },
    {
      key: "assetType",
      label: "Type of subject matter",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      options: [
        { value: "LITERARY", label: "Literary work", help: "Charters, bylaws, curricula, books, articles, sermons in fixed form." },
        { value: "MUSICAL", label: "Musical work (composition)" },
        { value: "SOUND_RECORDING", label: "Sound recording", help: "A recording is a separate work from the composition it captures. Register both." },
        { value: "VISUAL", label: "Visual art, logo, seal, or design" },
        { value: "AUDIOVISUAL", label: "Audiovisual work or film" },
        { value: "SOFTWARE", label: "Computer program" },
        { value: "COMPILATION", label: "Compilation or database" },
        { value: "ARCHITECTURAL", label: "Architectural work" },
        { value: "WORD_MARK", label: "Word mark (name or slogan)" },
        { value: "DESIGN_MARK", label: "Design mark (logo as a source identifier)" },
        { value: "TRADE_DRESS", label: "Trade dress" },
        { value: "DOMAIN", label: "Domain name" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "protectionKind",
      label: "Right asserted",
      type: "multiselect",
      required: true,
      section: "Identification",
      summary: true,
      help: "A logo used as a source identifier is usually both a copyrighted visual work and a trademark. Claim both where both apply.",
      options: [
        { value: "COPYRIGHT", label: "Copyright" },
        { value: "TRADEMARK", label: "Trademark / service mark" },
        { value: "TRADE_SECRET", label: "Trade secret" },
        { value: "PUBLICITY", label: "Right of publicity" },
        { value: "DOMAIN", label: "Domain name registration" },
        { value: "CULTURAL", label: "Cultural / traditional knowledge claim", help: "Cross-reference the Traditional Knowledge register. Note that this is not, on its own, a right U.S. courts enforce." },
      ],
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      section: "Identification",
      help: "What the work consists of, and for a mark, the goods or services it identifies.",
    },

    {
      key: "authorCreator",
      label: "Author or creator",
      type: "person",
      required: true,
      section: "Ownership",
      help: "The human being who actually made it. Not the institution, unless it is a work made for hire.",
    },
    {
      key: "ownershipBasis",
      label: "How the Kingdom came to own it",
      type: "select",
      required: true,
      section: "Ownership",
      options: [
        { value: "FOUNDER_ORIGINAL", label: "Created by the Founder in his own right" },
        { value: "WORK_FOR_HIRE_EMPLOYEE", label: "Work made for hire — employee within scope of employment" },
        { value: "WORK_FOR_HIRE_COMMISSIONED", label: "Work made for hire — commissioned, signed agreement", help: "Valid only for the nine categories listed in 17 U.S.C. § 101, and only with a signed writing." },
        { value: "WRITTEN_ASSIGNMENT", label: "Written assignment from the author", help: "Attach the executed assignment. An oral transfer of copyright is void under 17 U.S.C. § 204(a)." },
        { value: "LICENSE_IN", label: "Licensed to the Kingdom (not owned)" },
        { value: "UNRESOLVED", label: "Not yet resolved — ownership unclear", help: "Flag it rather than assume. Unresolved ownership is the most common reason a claim fails at the threshold." },
      ],
    },
    {
      key: "assignmentOnFile",
      label: "Signed assignment or hire agreement is on file",
      type: "boolean",
      section: "Ownership",
      help: "If the basis is assignment or commissioned work-for-hire and this is not checked, the Kingdom's title is not established.",
    },

    {
      key: "createdDate",
      label: "Date created (fixed in tangible form)",
      type: "date",
      section: "Critical dates",
      help: "When the work was first written down, recorded, or saved.",
    },
    {
      key: "firstPublishedDate",
      label: "Date first published",
      type: "date",
      section: "Critical dates",
      summary: true,
      help: "Publication means distribution of copies to the public by sale, other transfer of ownership, rental, lease, or lending — or offering to distribute for further distribution. Posting publicly online is generally publication. This date starts the three-month § 412 clock.",
    },
    {
      key: "firstUseAnywhereDate",
      label: "Date of first use anywhere (marks)",
      type: "date",
      section: "Critical dates",
    },
    {
      key: "firstUseInCommerceDate",
      label: "Date of first use in commerce (marks)",
      type: "date",
      section: "Critical dates",
      help: "Use in commerce that Congress may regulate — across state lines or affecting interstate commerce. Sworn to in the application; do not estimate.",
    },

    {
      key: "copyrightServiceRequest",
      label: "Copyright Office service request number",
      type: "text",
      section: "Copyright filing",
      help: "Issued on submission through the electronic Copyright Office system.",
    },
    {
      key: "copyrightRegistrationNumber",
      label: "Copyright registration number",
      type: "text",
      section: "Copyright filing",
      placeholder: "e.g. TX 9-123-456",
    },
    {
      key: "copyrightRegistrationDate",
      label: "Copyright registration date",
      type: "date",
      section: "Copyright filing",
      help: "The effective date of registration is the day a complete application, deposit, and fee were received — not the date the certificate issued.",
    },
    {
      key: "depositDescription",
      label: "Deposit copy description",
      type: "textarea",
      section: "Copyright filing",
      help: "What was deposited. Keep an identical copy in the Evidence Vault so the Kingdom can prove what the registration covers.",
    },

    {
      key: "usptoSerialNumber",
      label: "USPTO serial number",
      type: "text",
      section: "Trademark filing",
    },
    {
      key: "registrationNumber",
      label: "Trademark registration number",
      type: "text",
      section: "Trademark filing",
      summary: true,
    },
    {
      key: "trademarkRegistrationDate",
      label: "Trademark registration date",
      type: "date",
      section: "Trademark filing",
      help: "Starts the maintenance clock. Miss the § 8 window and the registration is cancelled outright.",
    },
    {
      key: "filingBasis",
      label: "Filing basis",
      type: "select",
      section: "Trademark filing",
      options: [
        { value: "USE_1A", label: "§ 1(a) — in use in commerce" },
        { value: "ITU_1B", label: "§ 1(b) — intent to use", help: "Requires a later statement of use before registration issues." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "niceClasses",
      label: "International classes",
      type: "text",
      section: "Trademark filing",
      placeholder: "e.g. 045, 041",
      help: "Religious and fraternal services are usually class 45; education class 41; charitable fundraising class 36.",
    },

    {
      key: "domainName",
      label: "Domain name",
      type: "text",
      section: "Domains",
    },
    {
      key: "domainRegistrar",
      label: "Registrar",
      type: "text",
      section: "Domains",
    },
    {
      key: "domainExpiryDate",
      label: "Domain expiry date",
      type: "date",
      section: "Domains",
      help: "A lapsed domain is bought within minutes and is expensive or impossible to recover.",
    },

    {
      key: "publicNotice",
      label: "Public notice line",
      type: "text",
      section: "Publication",
      help: 'The notice placed on copies, e.g. "© 2025 Apex Kingdom. All rights reserved." Notice is not required for protection but defeats an innocent-infringement defence.',
    },
    {
      key: "licensingTerms",
      label: "Licensing posture",
      type: "textarea",
      section: "Publication",
      help: "Whether and on what terms outsiders may use this. Silence invites the argument that use was permitted.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Publication",
      classification: "OFFICERS",
    },
  ],

  deadlineRules: [
    {
      id: "ip-412-window",
      title: "Copyright registration window closes — statutory damages at stake",
      fromField: "firstPublishedDate",
      offsetDays: 75,
      severity: "CRITICAL",
      authority: "17 U.S.C. § 412",
      detail:
        "Three months from first publication. Register by day 90 or lose statutory damages and attorney's fees against any infringement that began before registration. Fifteen days remain from this reminder.",
      when: (data) =>
        Array.isArray(data.protectionKind) &&
        (data.protectionKind as string[]).includes("COPYRIGHT") &&
        !data.copyrightRegistrationNumber,
    },
    {
      id: "ip-tm-section8",
      title: "Trademark § 8 declaration of continued use window opens",
      fromField: "trademarkRegistrationDate",
      offsetDays: 1826,
      severity: "CRITICAL",
      authority: "15 U.S.C. § 1058",
      detail:
        "File between the fifth and sixth anniversary of registration. A six-month grace period follows with a surcharge. If it is not filed, the registration is cancelled and cannot be revived — only refiled from scratch, losing the priority date. Consider filing the § 15 incontestability declaration at the same time.",
    },
    {
      id: "ip-tm-renewal",
      title: "Trademark § 8 and § 9 renewal window opens",
      fromField: "trademarkRegistrationDate",
      offsetDays: 3469,
      severity: "CRITICAL",
      authority: "15 U.S.C. §§ 1058, 1059",
      detail:
        "Combined declaration of use and renewal application, due in the year before each tenth anniversary, with a six-month grace period.",
    },
    {
      id: "ip-domain-expiry",
      title: "Domain registration expires",
      fromField: "domainExpiryDate",
      offsetDays: -45,
      severity: "HIGH",
      detail: "Renew now. Enable auto-renew and registrar lock rather than relying on this reminder.",
    },
  ],
};

export default intellectualProperty;
