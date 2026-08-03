import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Traditional Knowledge and Cultural Expressions.
 *
 * United States law gives no property right in traditional knowledge as such,
 * so this register is not a claim of title — it is the instrument that makes the
 * three tools that do work usable: fixation and registration of what can be
 * fixed, secrecy over what must not be disclosed, and contract terms binding on
 * anyone granted access. It also fixes the date on which the Kingdom's custody
 * and protocol were declared, which is what defeats a later claim of innocence.
 */

const culturalHeritage: RegistryDef = {
  slug: "cultural-heritage",
  title: "Register of Traditional Knowledge and Cultural Expressions",
  shortTitle: "Traditional Knowledge",
  recordLabel: "Element",
  recordLabelPlural: "Elements",
  group: "rights",
  numberPrefix: "TK",
  order: 2,
  authority: "Charter Art. VI §5 (Distinct Identity); Art. IV §4 (Cultural Powers)",
  description:
    "Songs, ceremonies, symbols, narratives, crafts, and knowledge held by the community, with the protocol governing their use and the protection posture actually available for each.",
  guidance: `Enter an element here **before** it is shared beyond the circle that already holds it, not after. Disclosure cannot be undone, and the one protection that depends on secrecy is the only one that is destroyed permanently.

**Be clear-eyed about what United States law does and does not provide.** There is no sui generis statute protecting traditional knowledge as such. Copyright does not reach ideas, procedures, processes, systems, methods, or discoveries (17 U.S.C. § 102(b)) — a ceremony, a technique, a design vocabulary, or a body of medicinal knowledge is not copyrightable subject matter, and no amount of documentation makes it so. UNDRIP Article 31 affirms the right of Indigenous peoples to maintain, control, and protect their cultural heritage and traditional knowledge, and it is worth citing in diplomacy and in policy work; it is a declaration of the General Assembly, not a treaty, not implemented by U.S. statute, and not a source of relief any U.S. court will grant. Pleading it as though it were binding law invites dismissal and spends credibility that is needed elsewhere.

**What does work:**

- **Copyright in a specific fixed expression.** The ceremony is not protectable; the video recording of it, the written account of it, the notated song, the photograph of the regalia each is a work of authorship the instant it is fixed, and each can be registered. Fix it, register it, enter the asset in the Intellectual Property Portfolio, and link it from this record.
- **Trademark in names and symbols used as source identifiers.** A crest, seal, or name identifying the Kingdom's goods and services is protectable for as long as it is used, and against anyone, whether or not they acknowledge the Kingdom.
- **Trade secret, for exactly as long as the knowledge stays undisclosed.** Protection requires reasonable measures to preserve secrecy — restricted access, a written protocol, confidentiality terms — and ends the moment the material becomes generally known by any route, including the Kingdom's own publication. This is why the sensitivity level and disclosure status below carry more weight than any other entry on the form.
- **Contract.** The strongest and most neglected instrument here. Anyone granted access — a researcher, filmmaker, publisher, school, or museum — can be bound by written terms far broader than any property right: scope, attribution, non-commercial limits, return or destruction of copies, and a remedy on breach. Contract reaches a party who would owe the Kingdom nothing under copyright law.

**Labels are not law, and are still worth applying.** The TK Labels developed by Local Contexts carry no statutory force. Their value is evidentiary and practical: an element carrying a clear, dated, published label cannot later be used by someone claiming they had no reason to know it was restricted, and a growing number of archives, publishers, and universities honour them as policy. Apply the label, publish it with the material, and record here who is entitled to authorise any departure from it.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "PROVISIONAL",
  titleField: "elementName",
  listColumns: ["category", "sensitivityLevel", "tkLabels", "custodian"],

  statuses: [
    {
      value: "PROVISIONAL",
      label: "Provisionally recorded",
      tone: "warning",
      help: "Entered but not yet confirmed by the custodian. Do not publish or license from a provisional entry.",
    },
    { value: "RECORDED", label: "Recorded", tone: "active" },
    {
      value: "VERIFIED",
      label: "Verified by custodian",
      tone: "success",
      help: "The knowledge holder has reviewed this entry and confirmed its accuracy and its protocol.",
    },
    {
      value: "RESTRICTED",
      label: "Access closed",
      tone: "warning",
      help: "Circulation suspended by the custodian or the Sovereign. Existing licences should be reviewed.",
    },
    {
      value: "DORMANT",
      label: "Dormant — transmission lapsed",
      tone: "warning",
      help: "No living holder is presently transmitting this element. Flag rather than quietly drop it; recovery work starts from an honest record.",
    },
    {
      value: "DISCLOSED",
      label: "Publicly disclosed",
      tone: "danger",
      help: "The material is now generally known. Trade secret protection is gone and cannot be restored. Only copyright in fixed expressions and trademark in identifiers survive.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "elementName",
      label: "Name of the element",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "The name the community itself uses. If it is also rendered in English or another language, give the community's name first.",
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      help: "Category drives the protection analysis. Practices and knowledge are not copyrightable; recordings and writings of them are.",
      options: [
        { value: "ORAL_TRADITION", label: "Oral tradition" },
        { value: "SONG", label: "Song" },
        { value: "DANCE", label: "Dance" },
        { value: "CEREMONY", label: "Ceremony or rite" },
        { value: "SYMBOL", label: "Symbol, crest, or design" },
        { value: "REGALIA", label: "Regalia or ceremonial object" },
        { value: "CRAFT", label: "Craft or material practice" },
        { value: "LANGUAGE", label: "Language or linguistic material" },
        { value: "FOODWAY", label: "Foodway" },
        { value: "MEDICINAL", label: "Medicinal or healing knowledge" },
        { value: "NARRATIVE", label: "Narrative or history" },
      ],
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: true,
      section: "Identification",
      help: "Enough for an officer who has never encountered this element to recognise a misuse of it. Do not enter restricted content itself in this field — describe it and lodge the substance under the applicable sensitivity protocol.",
    },
    {
      key: "communityOfOrigin",
      label: "Community of origin",
      type: "text",
      section: "Identification",
      help: "The people, house, or lineage from whom the element comes. Where the element is shared with or received from another community, say so plainly; overstated origin claims are the fastest way to lose standing with the communities whose support matters most.",
    },

    {
      key: "custodian",
      label: "Custodian or knowledge holder",
      type: "person",
      required: true,
      section: "Custody and transmission",
      summary: true,
      help: "The individual who actually holds this knowledge and whose authority governs its use. Not the office that filed the record.",
    },
    {
      key: "transmissionMode",
      label: "How it is transmitted",
      type: "multiselect",
      section: "Custody and transmission",
      help: "Transmission method determines whether the element can be fixed at all, and whether fixation would itself breach protocol.",
      options: [
        { value: "ORAL", label: "Orally, holder to successor" },
        { value: "APPRENTICESHIP", label: "By apprenticeship or long instruction" },
        { value: "CEREMONIAL", label: "Only within ceremony" },
        { value: "FAMILIAL", label: "Within a family or house" },
        { value: "INITIATORY", label: "On initiation only" },
        { value: "COMMUNAL", label: "Openly within the community" },
        { value: "WRITTEN", label: "In writing or recording" },
      ],
    },
    {
      key: "documentationHeld",
      label: "Documentation held",
      type: "textarea",
      section: "Custody and transmission",
      help: "What the Kingdom actually possesses — recordings, transcripts, photographs, field notes, objects — and where each is kept. The gap between what is claimed and what is held is the gap an opponent will find.",
    },

    {
      key: "sensitivityLevel",
      label: "Sensitivity level",
      type: "select",
      required: true,
      section: "Protocol",
      summary: true,
      help: "Governs handling by every officer of the Kingdom regardless of clearance. Set it with the custodian, not for them.",
      options: [
        { value: "OPEN", label: "Open — may be published freely" },
        { value: "ATTRIBUTED", label: "Open with attribution required" },
        { value: "COMMUNITY", label: "Community only" },
        { value: "RESTRICTED", label: "Restricted — named holders only" },
        {
          value: "SACRED",
          label: "Sacred / closed",
          help: "Not to be recorded, described in detail, or disclosed outside ceremony. Record its existence and its custodian here and nothing more.",
        },
      ],
    },
    {
      key: "tkLabels",
      label: "Traditional Knowledge Labels applied",
      type: "multiselect",
      section: "Protocol",
      summary: true,
      help: "Modelled on the Local Contexts TK Label set. These carry no statutory force; their work is evidentiary — a dated, published label defeats any later claim that misuse was innocent.",
      options: [
        { value: "TK_A", label: "TK Attribution", help: "Use is permitted; the community of origin must be named." },
        { value: "TK_CO", label: "TK Community Use Only" },
        { value: "TK_NC", label: "TK Non-Commercial" },
        { value: "TK_CS", label: "TK Culturally Sensitive" },
        { value: "TK_S", label: "TK Seasonal", help: "May be circulated or performed only in its proper season." },
        { value: "TK_V", label: "TK Verified", help: "The community has reviewed this material and confirmed it is correctly represented." },
        { value: "TK_O", label: "TK Outreach", help: "The community welcomes educational and outreach use on the stated terms." },
      ],
    },
    {
      key: "permittedUses",
      label: "Permitted uses",
      type: "textarea",
      section: "Protocol",
      help: "State affirmatively what outsiders may do. Silence is read as permission far more often than as prohibition.",
    },
    {
      key: "prohibitedUses",
      label: "Prohibited uses",
      type: "textarea",
      section: "Protocol",
      help: "The specific uses that are refused — commercial reproduction, alteration, performance out of season, use as decoration or costume. Specificity is what makes a licence term enforceable and a demand letter credible.",
    },
    {
      key: "authorisingOffice",
      label: "Who may authorise use",
      type: "text",
      section: "Protocol",
      required: true,
      help: "Name the person or office with power to grant a departure from this protocol. A permission given by someone without authority is the defect most often raised to defeat a later objection.",
    },

    {
      key: "isFixed",
      label: "A fixed expression of this element exists",
      type: "boolean",
      section: "Protection posture",
      help: "Fixation in a tangible medium is the precondition to any copyright at all. If this is false, no copyright exists in anything, however old or however significant the element.",
    },
    {
      key: "separateProtection",
      label: "Separately protected as",
      type: "multiselect",
      section: "Protection posture",
      summary: true,
      help: "Which enforceable rights actually attach, as distinct from the cultural claim. Leave empty where the honest answer is none.",
      options: [
        { value: "COPYRIGHT", label: "Copyright in a fixed expression", help: "Covers the recording, transcript, notation, or photograph — never the underlying practice." },
        { value: "TRADEMARK", label: "Trademark in a name or symbol" },
        { value: "TRADE_SECRET", label: "Trade secret", help: "Survives only while the knowledge remains undisclosed and reasonable secrecy measures are actually maintained." },
        { value: "CONTRACT", label: "Contract terms with grantees" },
        { value: "NONE", label: "None — cultural claim only", help: "The honest answer for most elements. Protection here runs through protocol, labelling, and contract, not property law." },
      ],
    },
    {
      key: "relatedIpAsset",
      label: "Related intellectual property asset",
      type: "recordRef",
      refRegistry: "intellectual-property",
      section: "Protection posture",
      help: "Where a fixed expression has been registered, link it. That asset, not this record, is what supports an infringement action.",
    },
    {
      key: "secrecyMeasures",
      label: "Secrecy measures maintained",
      type: "textarea",
      section: "Protection posture",
      help: "Required if trade secret protection is claimed: who has access, how access is controlled, and what confidentiality terms bind them. A secret with no measures protecting it is not a trade secret in law.",
    },
    {
      key: "contractControls",
      label: "Contract terms imposed on grantees",
      type: "textarea",
      section: "Protection posture",
      help: "The written terms actually signed by anyone given access. This is usually the strongest instrument on the page, because it binds parties who owe the Kingdom nothing under intellectual property law.",
    },
    {
      key: "publicDisclosureDate",
      label: "Date first disclosed publicly",
      type: "date",
      section: "Protection posture",
      help: "The day the element or a fixed expression of it first went outside the community. Ends any trade secret, and for a fixed expression starts the three-month copyright registration window under 17 U.S.C. § 412.",
    },

    {
      key: "documentedDate",
      label: "Date documented",
      type: "date",
      section: "Record",
      help: "When this entry was compiled with the custodian. Sets the review cycle and evidences the date on which the Kingdom's protocol was declared.",
    },
    {
      key: "evidenceReferences",
      label: "Evidence Vault references",
      type: "textarea",
      section: "Record",
      help: "Custody identifiers for the recordings, transcripts, and objects themselves. This register describes; the Vault holds.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Record",
      classification: "OFFICERS",
    },
  ],

  deadlineRules: [
    {
      id: "tk-412-window",
      title: "Copyright registration window closing on a disclosed fixed expression",
      fromField: "publicDisclosureDate",
      offsetDays: 75,
      severity: "CRITICAL",
      authority: "17 U.S.C. § 412",
      detail:
        "A fixed expression of this element has been published and copyright is claimed, but no registered asset is linked. Register within three months of first publication or lose statutory damages and attorney's fees against any infringement beginning before registration. Fifteen days remain.",
      when: (data) =>
        Array.isArray(data.separateProtection) &&
        (data.separateProtection as string[]).includes("COPYRIGHT") &&
        !data.relatedIpAsset,
    },
    {
      id: "tk-custodian-review",
      title: "Custodian re-verification due",
      fromField: "documentedDate",
      offsetDays: 1095,
      severity: "ROUTINE",
      detail:
        "A practice of this register, not a legal deadline. Three years on, confirm with the custodian that the description, the protocol, and the authorising office are still correct, and that a successor holder is identified. Entries that are never revisited are the ones that turn out to be wrong at the worst moment.",
    },
  ],
};

export default culturalHeritage;
