import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Households and Residency.
 *
 * The Roll of Citizens says who belongs. This register says how they live: who
 * shares a roof, in what relationship, at what address, and who is to be called
 * in an emergency. Every practical service the Kingdom delivers — relief, a
 * visit, a notice, a food parcel — is delivered to a household rather than to a
 * name on a list. It is also the most disclosure-sensitive register the Kingdom
 * keeps, because it holds home addresses, family composition, and the fact of
 * children, which is exactly the material a custody opponent, an abuser, or a
 * subpoena will reach for first. It is closed, and it is never published.
 */

const households: RegistryDef = {
  slug: "households",
  title: "Register of Households and Residency",
  shortTitle: "Households",
  recordLabel: "Household",
  recordLabelPlural: "Households",
  group: "people",
  numberPrefix: "HH",
  order: 5,
  authority: "Charter Art. II (Membership & Beneficiaries); Art. VII §3 (Rolls)",
  description:
    "Who lives with whom, where, and in what relationship — the household beneath the Roll of Citizens, kept for service delivery, emergency contact, and the allocation of assistance.",
  guidance: `A roll of citizens is a list of individuals. A household register is the community as it actually is. Almost everything the Kingdom does for its people is done to a household and not to a name: a food parcel goes to an address, a grant of hardship relief to one member relieves a house of six, a pastoral visit is arranged with whoever answers the door, and a next of kin is telephoned at two in the morning by someone reading this page. A body that knows how many of its members are elderly and living alone, how many households contain minors, and how many have moved out of the city can plan; a body holding only a mailing list can only react.

**This is a record of the Kingdom's own knowledge, not a civil registry.** It confers no domicile, no voting residence, no tenancy, and no residency status recognised by any government, and an entry here should never be offered to an agency, a landlord, or a court as proof of where someone lives. The Kingdom records what its members have told it.

**Classify it high and keep it closed.** The register defaults to OFFICERS and belongs nowhere below MEMBERS in any circumstance. It is not published, not summarised by household in a gazette, not exported into a grant application, and not shared with an affiliated congregation without the head of household's specific written consent. Aggregate figures — how many households, how many in the municipality — may be published; a single line of this register may not.

**Minimise the detail on minors rather than completing it.** Record how many children are in the household and, where a programme genuinely requires it, their ages. Do not record their names, schools, diagnoses, or immigration status here. Every additional detail about a child is a detail that can be subpoenaed in a custody case, and an officer's casual note about who is "really" raising a child will one day be read aloud in a courtroom. Nothing in this register displaces mandated-reporter duties under Conn. Gen. Stat. § 17a-101 et seq.; a reasonable suspicion of abuse or neglect goes to the Commissioner of Children and Families and is not discharged by an internal note.

**A member's residence is not the Kingdom's to give away.** Refuse third-party requests for an address — from an estranged spouse, a relative, a process server, an investigator, or another member — absent a court order or the member's written consent, and say so plainly and briefly. Where legal process arrives, answer it: appear and move for a protective order or to quash. Asserting immunity in place of appearing produces a default judgment and nothing else.

**Treat safety as the governing consideration.** Connecticut operates an address confidentiality programme, Safe at Home, under Conn. Gen. Stat. § 54-240 et seq., administered by the Secretary of the State, for people fleeing family violence, sexual assault, stalking, or trafficking. A participant has a substitute address precisely because the real one must not sit in any accessible file. Where a member participates, or has told an officer they are at risk, mark the record, remove the street address from this page, and let the Registrar hold it alone or not at all. The Kingdom must not become the leak the programme exists to prevent.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "PROVISIONAL",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "CLERK"],
  titleField: "householdDesignation",
  listColumns: ["residencyStatus", "municipality", "headOfHousehold", "dateEstablished"],

  statuses: [
    {
      value: "PROVISIONAL",
      label: "Provisional",
      tone: "neutral",
      help: "Reported but not yet confirmed with the head of household. Do not rely on it for notice or for allocating assistance.",
    },
    { value: "ESTABLISHED", label: "Established", tone: "active", help: "Confirmed and current." },
    {
      value: "VERIFIED",
      label: "Verified",
      tone: "success",
      help: "Confirmed directly with the head of household within the last year, with the date recorded.",
    },
    {
      value: "RELOCATED",
      label: "Relocated — address to be confirmed",
      tone: "warning",
      help: "The household is known to have moved. Do not send anything to the old address, including a notice.",
    },
    {
      value: "DORMANT",
      label: "Dormant",
      tone: "neutral",
      help: "No contact in over a year and no confirmed address. Still a household; simply not currently reachable.",
    },
    {
      value: "DISSOLVED",
      label: "Dissolved",
      tone: "neutral",
      help: "The household no longer exists as a unit — separation, death, or dispersal. The individuals remain on the Roll.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Replaced by a later household record; kept for the history." },
    { value: "VOID", label: "Void", tone: "danger", help: "Entered in error. Voided rather than deleted, so the chain shows what happened." },
  ],

  fields: [
    {
      key: "householdDesignation",
      label: "Household designation",
      type: "text",
      required: true,
      summary: true,
      section: "Household identity",
      placeholder: "e.g. The McCluster household, East End",
      help: "A short working name officers can use in conversation and on a delivery list without reciting an address. Avoid putting the street in it.",
    },
    {
      key: "headOfHousehold",
      label: "Head of household",
      type: "recordRef",
      refRegistry: "citizens",
      required: true,
      summary: true,
      section: "Household identity",
      help: "The enrolled member who speaks for the household and whose consent governs what may be disclosed about it. Where two adults share that role, name one here and the other in the composition section — someone must be answerable for the accuracy of this page.",
    },
    {
      key: "householdType",
      label: "Type of household",
      type: "select",
      section: "Household identity",
      help: "Used for planning — a house of one elderly member and a house of seven need different things from the Kingdom.",
      options: [
        { value: "SINGLE_ADULT", label: "Single adult" },
        { value: "COUPLE", label: "Couple, no dependents" },
        { value: "FAMILY_WITH_MINORS", label: "Family with minor children" },
        { value: "MULTIGENERATIONAL", label: "Multigenerational" },
        { value: "SHARED", label: "Shared or unrelated adults" },
        { value: "COMMUNAL", label: "Communal or institutional residence" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "dateEstablished",
      label: "Date the household was established",
      type: "date",
      summary: true,
      section: "Household identity",
      help: "When this grouping began living as one household, as reported. Fixes the period any entry on this page describes.",
    },
    {
      key: "dateDissolved",
      label: "Date dissolved",
      type: "date",
      section: "Household identity",
      help: "When the household ceased to exist as a unit. Set the status to Dissolved and stop sending to the address; do not delete the record.",
    },
    {
      key: "dissolutionReason",
      label: "Reason for dissolution",
      type: "textarea",
      section: "Household identity",
      classification: "SEALED",
      help: "Kept sealed because a separation, a bereavement, or a departure from an unsafe home is not information the Kingdom should hold at officer level. Record the fact, not an account of the family's affairs.",
    },

    {
      key: "residencyStatus",
      label: "Residency status",
      type: "select",
      required: true,
      summary: true,
      section: "Residence",
      help: "How this household stands in relation to the Kingdom's territory and community. It drives service planning and nothing else — it grants no right of residence and no legal status of any kind.",
      options: [
        {
          value: "ON_KINGDOM_LAND",
          label: "Resident on Kingdom land",
          help: "Living on real property the Kingdom holds. Cross-reference the parcel in the Register of Real Property, and note that occupancy of Kingdom land is a tenancy or licence governed by Connecticut landlord-tenant law like any other.",
        },
        {
          value: "IN_COMMUNITY",
          label: "Resident in the community",
          help: "Living in Bridgeport or the surrounding area, within reach of ordinary service and pastoral visiting.",
        },
        {
          value: "DIASPORA",
          label: "Diaspora",
          help: "Enrolled but living elsewhere. Notice and participation need different arrangements; assistance usually cannot be delivered in kind.",
        },
        {
          value: "SEASONAL",
          label: "Seasonal or intermittent",
          help: "Present part of the year. Record both addresses and which is current, or notice will go to an empty house.",
        },
      ],
    },
    {
      key: "streetAddress",
      label: "Street address",
      type: "textarea",
      section: "Residence",
      classification: "OFFICERS",
      help: "The address at which the household actually lives and at which notice reaches it. Where the household is address-protected, leave this blank and let the Registrar hold it separately — see the flag below.",
    },
    {
      key: "municipality",
      label: "Town or city",
      type: "text",
      summary: true,
      section: "Residence",
      help: "Held apart from the street address so the community can be described geographically — how many households in Bridgeport, how many out of state — without exposing anyone's home.",
    },
    {
      key: "stateOrRegion",
      label: "State or region",
      type: "text",
      section: "Residence",
    },
    {
      key: "tenure",
      label: "Basis of occupation",
      type: "select",
      section: "Residence",
      help: "Whether the household owns, rents, or occupies under an arrangement with the Kingdom. Relevant to housing assistance and, where the Kingdom is the landlord, to the obligations it owes as one.",
      options: [
        { value: "OWNED", label: "Owned by a member of the household" },
        { value: "RENTED", label: "Rented from a third party" },
        { value: "KINGDOM_PROVIDED", label: "Provided by the Kingdom", help: "Record the parcel and the written occupancy agreement. An occupant of Kingdom land has the ordinary rights of a residential tenant." },
        { value: "STAYING_WITH_OTHERS", label: "Staying with family or friends" },
        { value: "SHELTER_OR_TRANSITIONAL", label: "Shelter or transitional housing" },
        { value: "NO_FIXED_ADDRESS", label: "No fixed address" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "addressProtected",
      label: "Address is protected — do not hold or disclose",
      type: "boolean",
      summary: true,
      section: "Residence",
      help: "Check where a member participates in Connecticut's Safe at Home address confidentiality programme (Conn. Gen. Stat. § 54-240 et seq.) or has told an officer they are at risk from a former partner or another person. When checked, the street address is removed from this page, all correspondence goes to the substitute address, and no officer answers any question about where this household lives.",
    },
    {
      key: "addressVerifiedDate",
      label: "Address last confirmed",
      type: "date",
      section: "Residence",
      help: "When the address was last confirmed with the household itself. A determination sent to a stale address is a determination the member can answer with a straight face.",
    },

    {
      key: "householdMembers",
      label: "Members of the household and their relationship",
      type: "textarea",
      section: "Composition",
      classification: "OFFICERS",
      help: "One line per person: name, relationship to the head of household, and whether they are enrolled. Give the relationship as the household states it. Do not characterise a family's arrangements, and do not record who is 'really' the parent of a child — that sentence has ended custody cases.",
    },
    {
      key: "numberOfDependents",
      label: "Number of dependents",
      type: "number",
      min: 0,
      section: "Composition",
      help: "Adults and children dependent on the household's income. Drives the assessment of need when assistance is allocated.",
    },
    {
      key: "numberOfMinors",
      label: "Number of minors",
      type: "number",
      min: 0,
      section: "Composition",
      classification: "OFFICERS",
      help: "A count, deliberately, and not a list. The Kingdom needs to know how many children are in the community to run anything for them; it does not need their names in this register.",
    },
    {
      key: "primaryLanguage",
      label: "Primary language of the household",
      type: "text",
      section: "Composition",
      help: "The language in which notice, consent forms, and pastoral contact should be given. A consent signed in a language the signer does not read is not a knowing consent and will not survive challenge.",
    },
    {
      key: "interpretationNeeded",
      label: "Interpretation or translation needed",
      type: "boolean",
      section: "Composition",
      help: "Flags that documents must be translated before they are put in front of this household. Applies to every consent, covenant, and occupancy agreement.",
    },

    {
      key: "contactOfRecord",
      label: "Contact of record",
      type: "person",
      section: "Contact",
      help: "The person to whom ordinary correspondence for the household is addressed. Usually the head of household, but not always — record who actually opens the post.",
    },
    {
      key: "contactPhone",
      label: "Telephone",
      type: "phone",
      section: "Contact",
      classification: "OFFICERS",
    },
    {
      key: "contactEmail",
      label: "Email",
      type: "email",
      section: "Contact",
      classification: "OFFICERS",
    },
    {
      key: "emergencyContact",
      label: "Emergency contact",
      type: "person",
      section: "Contact",
      classification: "OFFICERS",
      help: "Who to call when something happens to a member of this household. This is the single field most likely to matter and most often left blank. Confirm it annually and confirm that the named person knows they are named.",
    },
    {
      key: "emergencyContactDetail",
      label: "Emergency contact relationship and number",
      type: "text",
      section: "Contact",
      classification: "OFFICERS",
      help: "Relationship and a number that will be answered out of hours.",
    },

    {
      key: "receivesAssistance",
      label: "Household receives assistance from the Kingdom",
      type: "boolean",
      section: "Assistance",
      help: "Flags that this household is a recipient, so that relief is allocated with knowledge of what has already been given rather than by whoever asks most recently.",
    },
    {
      key: "assistanceRecord",
      label: "Assistance record",
      type: "recordRef",
      refRegistry: "benefits",
      section: "Assistance",
      classification: "SEALED",
      help: "The entry in the Register of Assistance and Benefits. The particulars of what a family was given and why belong there, under seal, not on this page.",
    },

    {
      key: "dataConsentOnFile",
      label: "Written consent to hold this household record is on file",
      type: "boolean",
      section: "Record keeping",
      help: "Consent from the head of household to the Kingdom holding the information on this page and to any specific onward use. Absent it, the record is held for the household's own benefit only and is disclosed to no one for any purpose.",
    },
    {
      key: "notes",
      label: "Registrar's notes",
      type: "textarea",
      section: "Record keeping",
      classification: "SEALED",
      help: "Write only what an officer would need in order to serve this household well, and write it as though it will be read aloud by opposing counsel, because it may be.",
    },
  ],
};

export default households;
