import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Sacred Sites and Places of Cultural Significance.
 *
 * A site is protected by being known to the right people and unknown to the
 * wrong ones, so this register is deliberately split: general descriptions that
 * can be shown to a town, an agency, or a court, and precise locations sealed
 * against everything short of a written order. What protects a place in the end
 * is ordinary property law, and the tenure fields say plainly whether the
 * Kingdom has any.
 */

const sacredSites: RegistryDef = {
  slug: "sacred-sites",
  title: "Register of Sacred Sites and Places of Cultural Significance",
  shortTitle: "Sacred Sites",
  recordLabel: "Site",
  recordLabelPlural: "Sites",
  group: "property",
  numberPrefix: "SAC",
  order: 3,
  authority: "Charter Art. V (Territory & Land Claims); Art. VI §5 (Distinct Identity)",
  description:
    "Places held sacred or culturally significant by the Kingdom, with the protocol governing access, the tenure on which access rests, and the record of every consultation about them.",
  guidance: `**The paradox is real, and there is only a way through it.** Protecting a place usually requires telling somebody where it is — an agency, a town planner, a landowner, a court. But disclosure is itself a harm: a precise location, once written down and sent outward, cannot be recalled, and published coordinates draw looters faster than they draw protection. So this register is split. General descriptions — "a ridge in the northern part of the town", "a spring on the east bank" — sit at PUBLIC and go into anything the Kingdom files or publishes. Precise locations, coordinates, parcel numbers, and directions sit at **SEALED** and leave only under a written order, to a named recipient, with the disclosure logged below. Federal law supports this: 54 U.S.C. § 307103 directs agencies to withhold information about the location, character, or ownership of a historic property where disclosure may risk harm to it or impede its use by religious practitioners. Ask for that protection expressly and in writing. Material sent to a Connecticut agency may also become a public record under the state Freedom of Information Act (Conn. Gen. Stat. § 1-200 *et seq.*); ask before sending whether an exemption covers site locations, and keep the answer.

**Be exact about the federal frameworks.** Section 106 of the National Historic Preservation Act (54 U.S.C. § 306108; 36 C.F.R. Part 800) requires a federal agency to consider the effect of *its own* undertakings on historic properties, and NAGPRA (25 U.S.C. §§ 3001–3013) governs federal and tribal lands and federally funded institutions. Both key their strongest rights to federally recognised tribes and to Tribal Historic Preservation Officers appointed under 54 U.S.C. § 302702. The Kingdom does not hold that status. What it can do — and should do — is ask in writing to be admitted as a consulting or interested party in a particular review, and record what the agency says. Agencies grant such requests routinely, and the correspondence is valuable. It is not, however, a legal entitlement, and describing it internally as one guarantees an unpleasant surprise the first time an agency declines.

**The strongest protection for a site is the most ordinary one: own it, or hold a recorded easement over it.** Permission from a friendly landowner is revocable, dies with them, and does not survive a sale. A conservation or preservation restriction recorded in the town land records (Conn. Gen. Stat. §§ 47-42a *et seq.*) binds every future owner and is enforceable in the ordinary courts, without reference to anyone's sovereignty. Where a relationship with a landowner is good, that is the moment to ask for a recorded instrument — not later, when it has soured.

**Two standing rules.** Do not enter ceremonial content that protocol forbids recording; this register records that a protocol exists and who holds it, not what it says. And if human remains are encountered anywhere, work stops and the police and the medical examiner are notified — that is state law, not an internal matter.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "IDENTIFIED",
  titleField: "siteName",
  listColumns: ["siteType", "generalLocation", "ownershipStatus", "condition"],

  statuses: [
    {
      value: "IDENTIFIED",
      label: "Identified, unverified",
      tone: "neutral",
      help: "Recorded from tradition, testimony, or documents; not yet confirmed on the ground.",
    },
    { value: "VERIFIED", label: "Verified on the ground", tone: "active" },
    {
      value: "PROTECTED",
      label: "Protected by tenure",
      tone: "success",
      help: "The Kingdom owns the land or holds a recorded easement or restriction over it. Nothing short of that earns this status.",
    },
    {
      value: "AT_RISK",
      label: "At risk",
      tone: "warning",
      help: "A pending development, sale, permit application, or pattern of damage. Record the specific threat and the date it was learned of.",
    },
    { value: "ACCESS_LOST", label: "Access lost", tone: "danger" },
    { value: "DESTROYED", label: "Destroyed or irretrievably altered", tone: "danger" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "siteName",
      label: "Site name",
      type: "text",
      required: true,
      section: "Identification and location",
      summary: true,
      help: "The name by which the Kingdom refers to the place. Choose a name that can be spoken in public without itself giving the location away; a name that identifies the parcel defeats the point of sealing the coordinates.",
    },
    {
      key: "siteType",
      label: "Character of the site",
      type: "select",
      required: true,
      section: "Identification and location",
      summary: true,
      options: [
        { value: "BURIAL", label: "Burial ground or place of interment", help: "Disturbance of human remains is a matter for the police and the medical examiner immediately, in every state, regardless of who holds the land." },
        { value: "CEREMONIAL", label: "Ceremonial ground" },
        { value: "WATER", label: "Spring, river, or water source" },
        { value: "LANDSCAPE", label: "Landscape feature — rock, hill, tree, grove" },
        { value: "GATHERING", label: "Gathering or council place" },
        { value: "STRUCTURE", label: "Built structure or ruin" },
        { value: "ARCHAEOLOGICAL", label: "Archaeological deposit", help: "Excavation on federal or Indian lands without a permit is a federal crime under 16 U.S.C. § 470ee. Elsewhere it is the landowner's permission that governs. Never dig to establish a claim." },
        { value: "MEMORIAL", label: "Memorial or commemorative place" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "generalLocation",
      label: "General location — safe for publication",
      type: "text",
      section: "Identification and location",
      summary: true,
      placeholder: "e.g. the eastern uplands of the town of Trumbull",
      help: "Written so it can be quoted in a filing, a letter to a town, or a public statement without narrowing the search for anyone looking. Draft it once, carefully, and reuse that wording everywhere.",
    },
    {
      key: "preciseLocation",
      label: "Precise location",
      type: "textarea",
      classification: "SEALED",
      section: "Identification and location",
      help: "Coordinates, parcel identifiers, approach routes, and physical markers. This field is the reason the record is kept at all and the reason it is sealed. Release only under a written order naming the recipient, and log the release below.",
    },
    {
      key: "relatedParcel",
      label: "Related parcel in the Register of Lands",
      type: "recordRef",
      refRegistry: "real-property",
      section: "Identification and location",
      help: "Where the Kingdom owns or holds an interest in the land, link it. A site backed by a recorded deed or easement is in a wholly different position from one backed by goodwill, and the link makes which is which unmistakable.",
    },

    {
      key: "significance",
      label: "Significance",
      type: "textarea",
      required: true,
      classification: "MEMBERS",
      section: "Significance and practice",
      help: "Why the place matters, and to whom, and since when — with the source of that knowledge named where the source permits. This paragraph is what an agency, a landowner, or a court actually reads; write it to be understood by someone outside the tradition.",
    },
    {
      key: "associatedPractices",
      label: "Associated practices",
      type: "textarea",
      classification: "MEMBERS",
      section: "Significance and practice",
      help: "What is done at the site, described at the level of detail protocol allows. Continuous, documented religious use is what a substantial burden claim under RLUIPA or RFRA is built from; a practice attested only after the dispute arises is worth much less.",
    },
    {
      key: "accessPeriods",
      label: "Seasonal or ceremonial access periods",
      type: "textarea",
      section: "Significance and practice",
      help: "When the site is used, and how far in advance arrangements must be made. Where access depends on a landowner or an agency permit, a fixed annual date is the thing to put in a written agreement — an ad hoc request each year eventually meets a no.",
    },
    {
      key: "knowledgeHolders",
      label: "Holders of the protocol",
      type: "textarea",
      classification: "SEALED",
      section: "Significance and practice",
      help: "Who may be asked about this site and who may authorise access. Named here so that the knowledge survives the individuals; the substance of what they hold is not recorded, only that they hold it.",
    },

    {
      key: "ownershipStatus",
      label: "Tenure — the Kingdom's actual interest",
      type: "select",
      required: true,
      section: "Tenure and access",
      summary: true,
      options: [
        { value: "OWNED", label: "Owned by the Kingdom or its trustee", help: "The strongest position there is. Record the parcel in the Register of Lands." },
        { value: "EASEMENT", label: "Recorded easement or preservation restriction", help: "Nearly as strong as ownership and far cheaper: it binds successors in title and is enforceable in the ordinary courts." },
        { value: "LEASED", label: "Leased" },
        { value: "LICENCED", label: "Licence or written permission", help: "Revocable, and it does not bind a purchaser from the landowner. Treat it as temporary however long it has lasted." },
        { value: "PERMISSION", label: "Informal permission of the landowner", help: "Worth having and worth documenting by letter, but it ends with a sale, a death, or a change of mind." },
        { value: "PUBLIC_LAND", label: "On public land", help: "Access is governed by the agency's rules. RFRA reaches federal action; state and municipal action does not fall under it." },
        { value: "NO_ACCESS", label: "Access not currently held", help: "Record it anyway. A site the Kingdom cannot reach today may be reachable later, and the record of having identified it early is itself evidence." },
      ],
      help: "State the interest the Kingdom actually holds, not the interest it asserts. Every protective step available depends on which of these is true.",
    },
    {
      key: "landownerName",
      label: "Landowner of record",
      type: "text",
      section: "Tenure and access",
      help: "Who the town land records say owns the parcel, and the date that was last checked. A change of owner is the single event most likely to end access, and it is public information that nobody looks at until too late.",
    },
    {
      key: "accessBasisRecorded",
      label: "Access rests on a recorded instrument",
      type: "boolean",
      section: "Tenure and access",
      help: "Check only where a deed, easement, or restriction appears in the town land records. An unrecorded agreement, however solemn, binds nobody who buys the land afterwards.",
    },
    {
      key: "accessAgreementExpiryDate",
      label: "Access agreement expires",
      type: "date",
      section: "Tenure and access",
      help: "For a lease, licence, or term permit. Permission that lapses must be asked for again, and the answer the second time is not always the same.",
    },
    {
      key: "accessProtocol",
      label: "Access protocol",
      type: "textarea",
      classification: "MEMBERS",
      section: "Tenure and access",
      help: "Who may go, who must be notified beforehand, what is required on arrival, and what is forbidden. Written down so that a member acting in good faith cannot give offence through ignorance, and so that the Kingdom can show a landowner exactly how visits are governed.",
    },

    {
      key: "photographyRestriction",
      label: "Photography and recording",
      type: "select",
      section: "Disclosure protocol",
      options: [
        { value: "PROHIBITED", label: "Prohibited entirely" },
        { value: "PERMISSION", label: "Permitted only with prior authorisation" },
        { value: "NO_PUBLICATION", label: "Permitted for the record, not for publication", help: "Images kept in the Evidence Vault and never released. Strip location metadata before storing; a photograph carries coordinates whether or not anyone intended it to." },
        { value: "UNRESTRICTED", label: "Unrestricted" },
      ],
      help: "The rule members and visitors are held to. State it before a visit, not after an image has already been posted.",
    },
    {
      key: "publicationRestriction",
      label: "Publication of information about the site",
      type: "select",
      section: "Disclosure protocol",
      options: [
        { value: "NO_DISCLOSURE", label: "No disclosure of any kind" },
        { value: "GENERAL_ONLY", label: "General description only", help: "The ordinary posture. The general location field is written to be the thing that goes out." },
        { value: "AGENCY_ONLY", label: "Full detail to agencies under a confidentiality request only" },
        { value: "FULL", label: "Open" },
      ],
      help: "Governs filings, correspondence, publications, and the public register. Officers preparing any outward document check this field first.",
    },
    {
      key: "disclosureLog",
      label: "Disclosure log",
      type: "textarea",
      classification: "OFFICERS",
      section: "Disclosure protocol",
      help: "Every release of precise information: date, recipient by name and office, what was given, on whose authority, and what protection was requested and granted. If a location later appears in a public database, this log is the only way to establish how it got there.",
    },

    {
      key: "condition",
      label: "Condition",
      type: "select",
      section: "Condition, threats and consultation",
      summary: true,
      options: [
        { value: "INTACT", label: "Intact" },
        { value: "DISTURBED", label: "Disturbed" },
        { value: "DAMAGED", label: "Damaged" },
        { value: "DESTROYED", label: "Destroyed" },
        { value: "UNKNOWN", label: "Unknown — not recently seen" },
      ],
      help: "As observed at the last visit. Condition recorded over time is what proves damage occurred and roughly when, which no later assertion can supply.",
    },
    {
      key: "lastVisitedDate",
      label: "Date last visited",
      type: "date",
      section: "Condition, threats and consultation",
      help: "The date of the last physical inspection. It also evidences continuity of use, which matters to any religious exercise claim and to any argument that the connection to the place is living and present rather than merely historical.",
    },
    {
      key: "threats",
      label: "Threats",
      type: "textarea",
      section: "Condition, threats and consultation",
      help: "Development applications, road or utility projects, logging, erosion, looting, unauthorised vehicle access. Record the date each was learned of and the source. A threat noticed early can be met at a public hearing; the same threat noticed after the permit issues usually cannot.",
    },
    {
      key: "consultationHistory",
      label: "Consultation history",
      type: "textarea",
      section: "Condition, threats and consultation",
      help: "Every approach to a landowner, town, state office, or federal agency about this site, with dates, names, what was asked, and what was answered. Cross-reference the Government Contacts register. A documented decade of courteous, specific correspondence is the most persuasive thing a body without formal status can put in front of an agency.",
    },
    {
      key: "consultingPartyStatus",
      label: "Consulting party status sought or held",
      type: "select",
      section: "Condition, threats and consultation",
      options: [
        { value: "NONE", label: "Not sought" },
        { value: "REQUESTED", label: "Requested in writing, awaiting response" },
        { value: "GRANTED", label: "Admitted as a consulting or interested party", help: "For a named undertaking only. It does not carry over to the next project and must be asked for again each time." },
        { value: "DECLINED", label: "Declined by the agency", help: "Record the reason given. A written declination is still useful: it documents that the Kingdom raised the concern before the harm." },
        { value: "NA", label: "No federal undertaking involved", help: "Section 106 is triggered by a federal agency's own undertaking. A purely private or municipal project does not engage it." },
      ],
      help: "Participation in a Section 106 review is granted at the agency's discretion to bodies without federal recognition, not held as of right. Recording the request and the response keeps the Kingdom's expectations and its representations to others accurate.",
    },
    {
      key: "consultationRequestDate",
      label: "Date consulting party status was requested",
      type: "date",
      section: "Condition, threats and consultation",
      help: "The date the written request went to the agency. The review proceeds on the agency's schedule whether or not the Kingdom is added, so this date exists to make silence visible.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      classification: "OFFICERS",
      section: "Condition, threats and consultation",
      help: "Working notes, sources, and unresolved questions. Not for ceremonial content that protocol forbids recording.",
    },
  ],

  deadlineRules: [
    {
      id: "sac-access-expiry",
      title: "Access agreement expires",
      fromField: "accessAgreementExpiryDate",
      offsetDays: -60,
      severity: "HIGH",
      detail:
        "Open the renewal now, while there is time for a considered conversation. Where the relationship with the landowner is good, this is the moment to ask for a recorded easement or preservation restriction (Conn. Gen. Stat. §§ 47-42a et seq.) instead of another term licence — it binds their successors and it does not expire.",
    },
    {
      id: "sac-consultation-followup",
      title: "No response to the request for consulting party status",
      fromField: "consultationRequestDate",
      offsetDays: 21,
      severity: "HIGH",
      detail:
        "Follow up in writing and record the follow-up. The Kingdom participates in a Section 106 review by the agency's leave rather than as of right, and the review runs on the agency's timetable whether or not the request has been answered. A file showing two courteous, dated, unanswered letters is worth a great deal more later than a file showing one.",
    },
    {
      id: "sac-monitoring",
      title: "Site condition monitoring due",
      fromField: "lastVisitedDate",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Visit, photograph as protocol permits, and update the condition and threats. Damage can only be proved to have happened between two observations; a site unvisited for years supports no claim about when it was harmed or by whom.",
    },
  ],
};

export default sacredSites;
