import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Internal Permits and Authorisations.
 *
 * Every permission recorded here rests on one ordinary and entirely real power:
 * an owner may decide who comes onto its land and on what terms, and a
 * proprietor may license the use of its name and marks. The Kingdom is not a
 * permitting authority and issues nothing that substitutes for a municipal or
 * state licence. The register exists so that each permission has a written
 * scope, a term, an insurance position, and a revocation route — because a
 * permission nobody wrote down is one the Kingdom cannot prove or withdraw.
 */

const permits: RegistryDef = {
  slug: "permits",
  title: "Register of Internal Permits and Authorisations",
  shortTitle: "Permits",
  recordLabel: "Permit",
  recordLabelPlural: "Permits",
  group: "governance",
  numberPrefix: "PRM",
  order: 4,
  authority:
    "Charter Art. IV §7 (Economic Powers); ordinary rights of an owner and licensor in the Kingdom's real property, chattels, and marks",
  description:
    "Permissions the Kingdom grants over its own premises, events, archives, and marks — with the conditions, insurance, term, and revocation ground on which each was given.",
  guidance: `A permit in this register is not a regulatory permit, and the Kingdom is not a permitting authority. Nothing issued from here licenses anyone to do anything anywhere. Every permission recorded on this form comes from a single ordinary source: **the rights of an owner over its own property.** An owner may decide who enters its land and on what terms; a proprietor may license the use of its name and marks. Those powers are real, enforceable in any Connecticut court, and entirely sufficient for what this register does. They also stop precisely at the boundary of what the Kingdom owns.

**The dangerous permit is the one that reads like a municipal permit.** A Kingdom permit cannot authorise food service (a permit from the local director of health is required — Conn. Gen. Stat. §§ 19a-36g, 19a-36i, and a stall running fourteen days or less for a single event is a *temporary food service establishment* needing its own permit), the sale or service of alcohol (Liquor Control Act, Conn. Gen. Stat. § 30-1 et seq.), assembly occupancy above the certified load (State Fire Safety Code, Conn. Gen. Stat. § 29-291 et seq.), building or alteration work (§ 29-263), a street closure, or amplified sound where a municipal ordinance controls it. Issuing paper that suggests otherwise exposes the holder to enforcement they thought they had been cleared for, and exposes the Kingdom to their claim when the enforcement lands. Record which public licences the activity engages, and hold the holder's evidence of them before the permit commences.

**Say the limit on the face of the instrument.** Every permit should carry, in terms: *this permission is granted by Apex Kingdom as owner of the property described, in respect of that property only; it is not a licence, permit, approval, or certificate of any public authority, and the holder remains responsible for obtaining every consent the law requires.* One sentence, always present, removes the entire misunderstanding.

**Insurance and indemnity are the cheapest risk control available.** A certificate of liability insurance naming the Kingdom as an additional insured, obtained before entry, costs the Kingdom nothing and moves the loss to a carrier. Note that Connecticut's recreational land use protection (Conn. Gen. Stat. §§ 52-557f to 52-557i) covers owners who make land available **without charge**; a fee generally forfeits it, so a fee-bearing permit is exactly the one that needs the certificate. Note too that the Kingdom's duty to an entrant turns on their status — a person permitted onto land for their own purposes is a licensee, while a person invited for the Kingdom's purposes is an invitee owed reasonable care including inspection, and a permit holder who admits the public creates invitees.

**Where marks are licensed, control the quality or lose the mark.** A licence without supervision of the goods or services offered under the mark is a naked licence and works an abandonment under 15 U.S.C. § 1127. State the standards and the Kingdom's right to inspect.

**Keep permits short and revocable at will.** A licence is revocable; a term that grows long, exclusive, and periodically paid starts to look like a tenancy, and removing a tenant requires a notice to quit and summary process (Conn. Gen. Stat. §§ 47a-23, 47a-23a). Self-help removal is separately actionable under § 47a-43. One year is a sensible maximum.

**Burial plots require a threshold check.** Under Conn. Gen. Stat. § 19a-295 burial grounds may be owned and managed by towns, ecclesiastical societies, and incorporated cemetery associations "and by no other persons, firms or corporations." An allocation conveys a right of interment, not title to land. Take Connecticut counsel before the first plot is allocated, not after.`,
  defaultClassification: "MEMBERS",
  defaultStatus: "DRAFT",
  titleField: "permitTitle",
  listColumns: ["permitType", "holderName", "commencementDate", "expiryDate"],

  statuses: [
    {
      value: "DRAFT",
      label: "Draft",
      tone: "neutral",
      help: "Being negotiated. No permission has been granted and nobody may rely on it.",
    },
    {
      value: "ISSUED",
      label: "Issued, not yet commenced",
      tone: "active",
      help: "Signed and delivered but the commencement date has not arrived. Insurance evidence should be in hand before it does.",
    },
    { value: "IN_FORCE", label: "In force", tone: "success" },
    {
      value: "SUSPENDED",
      label: "Suspended",
      tone: "warning",
      help: "Permission paused pending a condition being met — usually lapsed insurance or an unremedied breach. Notify the holder in writing and record the date.",
    },
    { value: "EXPIRED", label: "Expired", tone: "neutral", help: "Ran its term and was not renewed." },
    {
      value: "SURRENDERED",
      label: "Surrendered by the holder",
      tone: "neutral",
      help: "Given up voluntarily. Record the date so the Kingdom can show the holder had no permission after it.",
    },
    {
      value: "REVOKED",
      label: "Revoked",
      tone: "danger",
      help: "Withdrawn by the Kingdom. Record the date and the ground, and confirm written notice went to the holder's recorded address.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Replaced by a later permit to the same holder over the same subject." },
    { value: "VOID", label: "Void", tone: "danger", help: "Never validly granted — issued without authority, over property the Kingdom does not hold, or on a mistaken basis." },
  ],

  fields: [
    {
      key: "permitTitle",
      label: "Permit",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "A one-line description a stranger could match to the activity: \"Wedding reception, Fellowship Hall, 12 June 2026\", not \"Hall booking\".",
    },
    {
      key: "permitType",
      label: "Type of permission",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      options: [
        { value: "PREMISES_USE", label: "Use of premises", help: "A room, hall, or building for a defined occasion or period." },
        {
          value: "EVENT_ON_LAND",
          label: "Event on Kingdom land",
          help: "Highest exposure on this list. Attendance, food, amplification, and parking each engage a separate public requirement.",
        },
        {
          value: "FILMING_PHOTOGRAPHY",
          label: "Filming or photography",
          help: "Separate the property permission from any rights in what is filmed. Consent of identifiable people is theirs to give, not the Kingdom's.",
        },
        {
          value: "VENDOR_STALL",
          label: "Vendor stall at a Kingdom event",
          help: "Anything sold or served for consumption needs the vendor's own permit from the local director of health; a stall of fourteen days or less is a temporary food service establishment under Conn. Gen. Stat. § 19a-36g.",
        },
        {
          value: "ARCHIVE_ACCESS",
          label: "Access to the archive or collections",
          help: "Set out handling, copying, and publication terms, and cross-reference any cultural or ceremonial restriction on the material.",
        },
        {
          value: "NAME_AND_MARKS",
          label: "Use of the Kingdom's name, seal, or marks",
          help: "A trademark licence. Quality standards and a right to inspect are not optional — see 15 U.S.C. § 1127 on naked licensing.",
        },
        {
          value: "BURIAL_PLOT",
          label: "Burial plot allocation",
          help: "Confirm first that the Kingdom may lawfully own and manage a burial ground under Conn. Gen. Stat. § 19a-295. An allocation conveys a right of interment, not title.",
        },
        { value: "STORAGE", label: "Storage or parking on Kingdom property" },
        { value: "OTHER", label: "Other permission over Kingdom property" },
      ],
    },
    {
      key: "issuingOfficer",
      label: "Issuing officer",
      type: "person",
      required: true,
      section: "Identification",
      help: "The officeholder who granted it, by name. If they lacked authority to bind the Kingdom's property, the permit is void and the register should say so.",
    },
    {
      key: "issueDate",
      label: "Date issued",
      type: "date",
      section: "Identification",
      help: "When the signed permit was delivered to the holder — not when the discussion began and not when the activity starts.",
    },

    {
      key: "holderName",
      label: "Permit holder",
      type: "person",
      required: true,
      section: "Holder",
      summary: true,
      help: "The person or entity that carries the obligations. Name the party that will actually be sued or insured; \"the family\" or \"the committee\" cannot indemnify anyone.",
    },
    {
      key: "holderOrganisation",
      label: "Organisation, if the holder acts for one",
      type: "text",
      section: "Holder",
      help: "Where a permit is taken for a company, church, or association, name it in full and in its legal form. The individual signing may or may not be personally bound; state which is intended.",
    },
    {
      key: "holderEmail",
      label: "Holder's email",
      type: "email",
      section: "Holder",
    },
    {
      key: "holderAddress",
      label: "Holder's address for notices",
      type: "textarea",
      section: "Holder",
      help: "Where a revocation or suspension notice will be sent. A permit the Kingdom cannot serve notice under is a permit it cannot withdraw cleanly.",
    },

    {
      key: "subjectProperty",
      label: "Property concerned",
      type: "recordRef",
      refRegistry: "real-property",
      section: "Subject and scope",
      help: "The parcel or building this permission runs over. If the Kingdom does not hold the property in this register, it cannot grant permission over it — check before issuing.",
    },
    {
      key: "subjectDescription",
      label: "What is permitted",
      type: "textarea",
      required: true,
      section: "Subject and scope",
      help: "The activity, the specific area, the hours, and the maximum number of people. Scope is what the Kingdom will later rely on to say an activity was outside the permission, so write it narrowly and precisely. For a marks licence, identify the exact mark and the exact goods or services.",
    },
    {
      key: "qualityControlTerms",
      label: "Quality control and inspection (marks licences)",
      type: "textarea",
      section: "Subject and scope",
      help: "The standards the licensee must meet in anything offered under the Kingdom's name or seal, and the Kingdom's right to inspect and to require correction. A licence without real supervision is a naked licence and abandons the mark under 15 U.S.C. § 1127.",
    },
    {
      key: "premisesOnlyStated",
      label: "Permit states on its face that it grants permission on Kingdom property only",
      type: "boolean",
      section: "Subject and scope",
      help: "The single most important line on the instrument. Unchecked means the holder may reasonably read the permit as a public approval, which is the exact misunderstanding that produces a claim against the Kingdom.",
    },

    {
      key: "conditions",
      label: "Conditions imposed",
      type: "textarea",
      section: "Conditions and public licences",
      help: "Everything the holder must do or refrain from: hours, noise, capacity, no alcohol, no open flame, security provision, cleaning, reinstatement, deposit. Conditions are enforceable as the terms on which entry was permitted; a breach ends the permission and makes continued presence a trespass.",
    },
    {
      key: "publicLicencesEngaged",
      label: "Public licences or approvals the activity engages",
      type: "multiselect",
      section: "Conditions and public licences",
      help: "Identify these before issuing. The Kingdom's permit does not supply any of them; the holder must obtain each in their own name.",
      options: [
        { value: "NONE_IDENTIFIED", label: "None identified" },
        { value: "FOOD_SERVICE", label: "Food service or sale", help: "Local director of health permit — Conn. Gen. Stat. §§ 19a-36g, 19a-36i." },
        { value: "ALCOHOL", label: "Alcohol", help: "Liquor Control Act, Conn. Gen. Stat. § 30-1 et seq. Serving without a permit is a criminal matter for the server and the host." },
        { value: "ASSEMBLY_OCCUPANCY", label: "Assembly occupancy or capacity", help: "State Fire Safety Code, Conn. Gen. Stat. § 29-291 et seq. Never permit attendance above the certified occupant load." },
        { value: "BUILDING_WORK", label: "Building, alteration, or temporary structure", help: "Building permit from the municipal building official — Conn. Gen. Stat. § 29-263." },
        { value: "STREET_CLOSURE", label: "Street closure, parade, or public way", help: "Municipal approval and usually police coordination. Entirely outside anything the Kingdom can grant." },
        { value: "AMPLIFIED_SOUND", label: "Amplified sound", help: "Municipal noise ordinance. The Kingdom can permit sound on its own land and cannot exempt anyone from the ordinance." },
        { value: "FIREWORKS_FLAME", label: "Fireworks, pyrotechnics, or open flame", help: "Fire marshal permit. Confirm before issuing, not on the day." },
        { value: "VEHICLES_PARKING", label: "Traffic or parking on the public way" },
        { value: "OTHER_PUBLIC", label: "Other public licence or approval" },
      ],
    },
    {
      key: "publicLicenceEvidence",
      label: "Evidence of the holder's public licences held",
      type: "textarea",
      section: "Conditions and public licences",
      help: "Which permit, issued by whom, number, and expiry — and whether the Kingdom holds a copy. Collect it before commencement. Afterwards it is the Kingdom's problem as well as the holder's.",
    },

    {
      key: "feeCharged",
      label: "Fee charged",
      type: "money",
      section: "Fee, insurance and indemnity",
      help: "Enter zero if the permission is free, and mean it. Connecticut's recreational land use protection (Conn. Gen. Stat. §§ 52-557f to 52-557i) applies to land made available without charge; taking a fee generally forfeits it, which makes a fee-bearing permit the one that most needs insurance behind it.",
    },
    {
      key: "insuranceRequired",
      label: "Insurance is required of the holder",
      type: "boolean",
      section: "Fee, insurance and indemnity",
      help: "Require it for any event, any activity involving members of the public, any vendor, and any work on the fabric. It costs the Kingdom nothing and moves the loss to a carrier.",
    },
    {
      key: "insuranceEvidenceHeld",
      label: "Certificate of insurance is held",
      type: "boolean",
      section: "Fee, insurance and indemnity",
      help: "A certificate in hand before the holder enters. An assurance that cover exists is not evidence, and a certificate obtained after an incident names the Kingdom for a period that has already closed.",
    },
    {
      key: "insuranceDetail",
      label: "Insurer, policy number, limits, and additional insured status",
      type: "textarea",
      section: "Fee, insurance and indemnity",
      help: "Record whether the Kingdom is named as an additional insured. Being a certificate holder only means being told about the policy; being an additional insured means being defended under it. Ask for the endorsement, not the certificate alone.",
    },
    {
      key: "insuranceExpiryDate",
      label: "Insurance expiry date",
      type: "date",
      section: "Fee, insurance and indemnity",
      help: "Cover that lapses mid-term leaves the Kingdom exposed for the remainder. The register will raise this before it happens.",
    },
    {
      key: "indemnityGiven",
      label: "Holder has given a written indemnity",
      type: "boolean",
      section: "Fee, insurance and indemnity",
      help: "An indemnity from someone with no assets and no insurance is worth nothing; an indemnity backed by a policy is worth the policy. Take both.",
    },
    {
      key: "indemnityTerms",
      label: "Terms of the indemnity",
      type: "textarea",
      section: "Fee, insurance and indemnity",
      help: "What is covered, whose acts, and whether it includes defence costs. Note that an indemnity purporting to cover the Kingdom's own negligence is construed narrowly and may not hold; do not rely on it in place of the Kingdom's own liability cover.",
    },

    {
      key: "commencementDate",
      label: "Commencement date",
      type: "date",
      required: true,
      section: "Term, revocation and record",
      summary: true,
      help: "The first day the holder may rely on the permission. Nothing before it is permitted, whatever was discussed.",
    },
    {
      key: "expiryDate",
      label: "Expiry date",
      type: "date",
      section: "Term, revocation and record",
      summary: true,
      help: "Keep terms short — a year at most, renewed deliberately. Occupation that continues long, exclusively, and for periodic payment begins to look like a tenancy, and removing a tenant requires a notice to quit and summary process under Conn. Gen. Stat. §§ 47a-23 and 47a-23a.",
    },
    {
      key: "revocableAtWill",
      label: "Revocable at the Kingdom's will",
      type: "boolean",
      section: "Term, revocation and record",
      help: "The default and the right answer in almost every case. A permission the Kingdom cannot withdraw is a burden on the property that outlives the officer who granted it. If this is unchecked, say in the conditions exactly what grounds permit revocation.",
    },
    {
      key: "revocationDate",
      label: "Date revoked or suspended",
      type: "date",
      section: "Term, revocation and record",
      help: "The date written notice was given, not the date the decision was taken. After it, the holder's continued presence is a trespass — but never remove anyone by force: self-help is separately actionable under Conn. Gen. Stat. § 47a-43.",
    },
    {
      key: "revocationGround",
      label: "Ground of revocation",
      type: "textarea",
      section: "Term, revocation and record",
      help: "The specific condition breached or the reason relied on, recorded at the time. A contemporaneous ground answers a claim of arbitrary or discriminatory withdrawal; a ground supplied months later invites it.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Term, revocation and record",
      classification: "OFFICERS",
      help: "History with this holder, complaints received, and whether the Kingdom would grant again. Written for the officer who inherits the file.",
    },
  ],

  deadlineRules: [
    {
      id: "prm-insurance-expiry",
      title: "Permit holder's insurance expires",
      fromField: "insuranceExpiryDate",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Obtain a renewal certificate, with the additional insured endorsement, before the current cover ends. If none arrives, suspend the permit rather than letting an uninsured holder continue on Kingdom property.",
      when: (data) => data.insuranceRequired === true,
    },
    {
      id: "prm-term-expiry",
      title: "Permit term ends",
      fromField: "expiryDate",
      offsetDays: -14,
      severity: "ROUTINE",
      authority: "Conn. Gen. Stat. §§ 47a-23, 47a-23a",
      detail:
        "Renew deliberately or confirm the holder is vacating and the keys, deposit, and reinstatement are dealt with. Permissions that quietly roll on are how a licence turns into an occupancy the Kingdom must go to court to end.",
    },
    {
      id: "prm-premises-only-line",
      title: "Permit does not state that it grants permission on Kingdom property only",
      fromField: "issueDate",
      offsetDays: 7,
      severity: "HIGH",
      detail:
        "Reissue with the limiting sentence on its face. Without it the holder may read the permit as a public approval, proceed without the municipal licence the activity requires, and bring the resulting enforcement back to the Kingdom.",
      when: (data) => data.premisesOnlyStated !== true,
    },
  ],
};

export default permits;
