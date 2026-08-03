import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Chattels, Vehicles and Equipment.
 *
 * Everything movable the Kingdom owns is held in trust for its beneficiaries,
 * which makes the boundary between institutional property and an officer's
 * personal property a legal boundary and not a courtesy. This register is how
 * that boundary stays visible — who holds what, on whose authority, and where
 * it went when it left.
 */

const chattels: RegistryDef = {
  slug: "chattels",
  title: "Register of Chattels, Vehicles and Equipment",
  shortTitle: "Chattels",
  recordLabel: "Item",
  recordLabelPlural: "Items",
  group: "property",
  numberPrefix: "CHT",
  order: 2,
  authority: "Charter Art. IV §8 (Assets Held in Trust); Art. IV §7 (Economic Powers)",
  description:
    "Movable property of the Kingdom — vehicles, equipment, regalia, and instruments — with its custodian, its registration where the law requires one, and its disposal.",
  guidance: `Charter Art. IV §8 holds the Kingdom's assets **in trust for its beneficiaries**. Nothing in this register belongs to an officer, and nothing here is available for an officer's personal use merely because they are the one holding the keys.

**Private inurement is the exposure, and it is absolute.** Section 501(c)(3) conditions exempt status on no part of the net earnings inuring to the benefit of any private individual. There is no de minimis allowance: a vehicle bought with trust funds and driven on family errands is inurement whether it costs the Kingdom five dollars or five thousand. The Code adds a personal tax on the individual who received the benefit — 25% of the excess benefit under 26 U.S.C. § 4958, rising to 200% if it is not corrected, with a further 10% on any manager who knowingly approved it. The defence is not denial; it is a paper trail. Record the custodian by name, take a signed acknowledgement that the item is trust property held for the Kingdom's purposes, reimburse incidental personal use at fair value, and have any transaction touching an officer approved by disinterested persons and minuted. This register is the first document an examining agent, an auditor, or the Attorney General will ask to see.

**Motor vehicles.** A vehicle operated on public roads in Connecticut must be registered with the Department of Motor Vehicles, must display the plates the DMV issues, and must carry the minimum insurance the state requires (Conn. Gen. Stat. §§ 14-12, 14-213b). None of that is displaced by sovereignty, by ecclesiastical status, by the Charter, or by the legislative citation. Privately produced plates, placards, decals, or "diplomatic" and "tribal nation" registration cards are among the most recognisable enforcement triggers in American traffic policing: the predictable outcome is a stop, a towed vehicle, citations, and in some cases an arrest — with the incident report becoming the first thing any agency finds when it later looks up the Kingdom. Record the real DMV registration in the fields below. Kingdom insignia on a vehicle is lawful decoration; anything resembling a licence plate, a badge, or law-enforcement livery is not, and Conn. Gen. Stat. § 53a-130 makes impersonation of a police officer a crime.

**Titled property carries the same name problem as land:** the certificate must name a holder the state recognises. Settle that name once, use it everywhere, and record it here exactly.

**Donated items.** The Kingdom acknowledges receipt and describes the item; it never states a value for the donor. Where the donor claims over $5,000 they need their own qualified appraisal and the Kingdom's signature on Form 8283, Section B. If a donated item so appraised is sold or otherwise disposed of within three years of receipt, Form 8282 is due within 125 days of the disposition (26 U.S.C. § 6050L). Record every disposal. Trust property that simply stops appearing, with no entry explaining where it went, is the fact pattern that turns a routine inquiry into an investigation.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "IN_SERVICE",
  titleField: "itemName",
  listColumns: ["category", "custodian", "location", "acquisitionDate"],

  statuses: [
    { value: "IN_SERVICE", label: "In service", tone: "success" },
    { value: "IN_STORAGE", label: "In storage", tone: "neutral" },
    {
      value: "ON_LOAN",
      label: "On loan out",
      tone: "active",
      help: "Held by a member or outside party. A written loan receipt with a return date is the difference between a loan and a gift nobody authorised.",
    },
    { value: "MAINTENANCE", label: "Out for repair or maintenance", tone: "warning" },
    {
      value: "MISSING",
      label: "Missing — unaccounted for",
      tone: "danger",
      help: "Set this the day an item cannot be produced, not the day it is written off. The gap between those two dates is what an auditor examines.",
    },
    { value: "STOLEN", label: "Reported stolen", tone: "danger", help: "Record the police report number in the notes. Insurance and any casualty deduction depend on it." },
    { value: "DISPOSED", label: "Disposed of", tone: "neutral" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "itemName",
      label: "Item",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      placeholder: "e.g. 2019 Ford Transit 250 cargo van",
      help: "Enough to identify the thing on sight during a physical inventory. Make, model, and year for anything mechanical.",
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      options: [
        { value: "VEHICLE", label: "Motor vehicle or trailer", help: "Complete the registration section. A vehicle on the road without current DMV plates and insurance is a liability, not an asset." },
        { value: "COMPUTING", label: "Computing and data equipment", help: "Anything holding member data is also a privacy exposure; cross-reference the Privacy Requests register before disposal and wipe before transfer." },
        { value: "AUDIOVISUAL", label: "Audio, video, and broadcast equipment" },
        { value: "COMMUNICATIONS", label: "Communications equipment", help: "Radio transmitters are licensed by the FCC. Operating on licensed spectrum without authority draws federal enforcement independent of anything else." },
        { value: "LITURGICAL", label: "Liturgical and ceremonial articles" },
        { value: "REGALIA", label: "Regalia, vestments, and insignia", help: "Insignia of the Kingdom's own devising is lawful and is protectable as a trademark. Anything resembling government or law-enforcement credentials is neither." },
        { value: "FURNITURE", label: "Furniture and fixtures" },
        { value: "TOOLS", label: "Tools, plant, and grounds equipment" },
        { value: "ARTWORK", label: "Artwork and collections" },
        { value: "ARCHIVE", label: "Books, archives, and physical records" },
        { value: "REGULATED", label: "Item whose possession requires a licence or permit", help: "Possession or carry authority belongs to the individual permit holder under state and federal law. The Kingdom's ownership of an item confers no authority on anyone to possess it." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      section: "Identification",
      help: "Condition on receipt, distinguishing marks, accessories included, and anything that would let the Kingdom prove this is the same item in a claim years from now.",
    },
    {
      key: "serialNumber",
      label: "Serial, VIN, or other identifying number",
      type: "text",
      section: "Identification",
      summary: true,
      help: "The number a police report, an insurance claim, or a title transfer will turn on. For a vehicle, the seventeen-character VIN from the dash plate, not from the sales paperwork.",
    },

    {
      key: "acquisitionDate",
      label: "Date acquired",
      type: "date",
      required: true,
      section: "Acquisition",
      summary: true,
      help: "The date the Kingdom took possession. For donated property it also starts the three-year period in which a disposal triggers a Form 8282 obligation.",
    },
    {
      key: "acquisitionMethod",
      label: "How acquired",
      type: "select",
      required: true,
      section: "Acquisition",
      options: [
        { value: "PURCHASE", label: "Purchased with Kingdom funds" },
        { value: "GIFT_IN_KIND", label: "Donated in kind", help: "Issue a contemporaneous written acknowledgement describing the item without valuing it. Cross-reference the Contributions register." },
        { value: "TRANSFER", label: "Transferred from a member or affiliate", help: "A transfer with no written instrument leaves the transferor's family able to claim it back after their death." },
        { value: "MANUFACTURE", label: "Made by or for the Kingdom" },
        { value: "LEASE", label: "Leased or financed", help: "Not owned. The lessor's rights survive everything the Kingdom does with it." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "acquisitionSource",
      label: "Acquired from",
      type: "text",
      section: "Acquisition",
      help: "Seller, donor, or transferor by full legal name. Where the counterparty is an officer or their family, that fact must be disclosed and approved by disinterested persons before the transaction, not explained afterwards.",
    },
    {
      key: "cost",
      label: "Cost or recorded value",
      type: "money",
      section: "Acquisition",
      help: "What the Kingdom paid. For donated property leave this blank and record the donor's own appraised figure only if they supply it in writing — the Kingdom does not appraise gifts to itself.",
    },

    {
      key: "custodian",
      label: "Custodian",
      type: "person",
      required: true,
      section: "Custody and condition",
      help: "The one person answerable for producing this item on request. Custody is not ownership and does not become ownership through long possession; an item held for years by one officer with no entry here is the classic inurement finding.",
    },
    {
      key: "location",
      label: "Ordinary location",
      type: "text",
      section: "Custody and condition",
      help: "Where the item is normally kept. Where that is an officer's home rather than Kingdom premises, say so plainly here — the fact is defensible, concealing it is not.",
    },
    {
      key: "custodyAcknowledgment",
      label: "Signed custody acknowledgement on file",
      type: "boolean",
      section: "Custody and condition",
      help: "A short signed statement that the item is property of the Kingdom held in trust, is used for Kingdom purposes, and will be returned on demand. This one page answers most of what an examination asks about personal benefit.",
    },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      section: "Custody and condition",
      options: [
        { value: "NEW", label: "New" },
        { value: "GOOD", label: "Good — serviceable" },
        { value: "FAIR", label: "Fair — usable, wear evident" },
        { value: "POOR", label: "Poor — repair needed" },
        { value: "INOPERABLE", label: "Inoperable" },
      ],
      help: "As found at the last physical verification, with the date noted. A condition entered once at acquisition and never revisited tells an auditor the inventory is not being done.",
    },

    {
      key: "isTitledAsset",
      label: "Titled or registered asset",
      type: "boolean",
      section: "Registration and insurance",
      help: "Check for anything the state issues a title or registration for — motor vehicles, trailers, vessels, aircraft. Titled assets carry recording obligations that ordinary equipment does not.",
    },
    {
      key: "titleNumber",
      label: "Certificate of title number and named owner",
      type: "text",
      section: "Registration and insurance",
      help: "The title number and the owner name exactly as the DMV printed it. As with a deed, the name on the title is who the state says owns the vehicle, whatever this register says.",
    },
    {
      key: "registrationPlate",
      label: "Registration / plate number",
      type: "text",
      section: "Registration and insurance",
      placeholder: "e.g. CT 1AB2345",
      help: "The plate issued by the Connecticut DMV, or by the state where the vehicle is registered. Enter only a state-issued number. A privately produced plate or placard is not a registration and recording one here would put an admission in the Kingdom's own ledger.",
    },
    {
      key: "registrationExpiryDate",
      label: "Registration expiry date",
      type: "date",
      section: "Registration and insurance",
      help: "Registration lapses on a fixed date and the vehicle becomes unregistered the following morning. This date generates the renewal reminder.",
    },
    {
      key: "insuranceCarrierPolicy",
      label: "Insurance carrier and policy number",
      type: "text",
      section: "Registration and insurance",
      help: "Carrier, policy number, and whether the Kingdom or an individual is the named insured. A vehicle titled to the institution but insured on a personal policy is frequently uninsured in fact when a claim is made.",
    },

    {
      key: "securityInterest",
      label: "Subject to a security interest",
      type: "boolean",
      section: "Encumbrance and disposal",
      help: "Check where a lender, lessor, or seller retains rights — a lien noted on the title, a UCC-1 filed against the Kingdom, or a conditional sale. Disposing of encumbered property without the secured party's consent is a default and can be conversion.",
    },
    {
      key: "securedPartyDetails",
      label: "Secured party and instrument",
      type: "textarea",
      section: "Encumbrance and disposal",
      help: "Who holds the interest, the amount outstanding, and where the filing or lien notation appears. Needed before any sale, trade, or transfer can be completed honestly.",
    },
    {
      key: "disposalDate",
      label: "Date disposed of",
      type: "date",
      section: "Encumbrance and disposal",
      help: "The date the Kingdom parted with the item. For property received as a charitable gift, this date starts the 125-day Form 8282 clock where the disposal falls within three years of receipt.",
    },
    {
      key: "disposalManner",
      label: "Manner of disposal",
      type: "select",
      section: "Encumbrance and disposal",
      options: [
        { value: "SOLD", label: "Sold", help: "A sale to an officer or their family must be at fair market value, documented, and approved by disinterested persons — otherwise it is an excess benefit transaction." },
        { value: "DONATED", label: "Donated onward" },
        { value: "TRADED", label: "Traded in" },
        { value: "SCRAPPED", label: "Scrapped or destroyed" },
        { value: "RETURNED", label: "Returned to owner or lessor" },
        { value: "LOST", label: "Lost" },
        { value: "STOLEN", label: "Stolen" },
      ],
      help: "Say what actually happened. An item marked disposed with no manner recorded reads, later, as an item that went to somebody's house.",
    },
    {
      key: "disposalProceeds",
      label: "Proceeds received",
      type: "money",
      section: "Encumbrance and disposal",
      help: "What the Kingdom received, deposited to the Kingdom's own account. Proceeds of trust property are trust property; they do not become anyone's compensation without a resolution saying so.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Encumbrance and disposal",
      classification: "OFFICERS",
      help: "Police report numbers, insurance claim references, maintenance history, and the resolution authorising any transaction with an officer.",
    },
  ],

  deadlineRules: [
    {
      id: "cht-registration-renewal",
      title: "Vehicle registration expires",
      fromField: "registrationExpiryDate",
      offsetDays: -30,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. §§ 14-12, 14-213b",
      detail:
        "Renew with the Department of Motor Vehicles and confirm insurance is in force. Operating an unregistered or uninsured vehicle draws a citation and a tow, and no assertion of sovereign, ecclesiastical, or tribal status changes that outcome.",
      when: (data) => data.category === "VEHICLE" || data.isTitledAsset === true,
    },
    {
      id: "cht-form-8282",
      title: "Form 8282 may be due on disposal of donated property",
      fromField: "disposalDate",
      offsetDays: 95,
      severity: "HIGH",
      authority: "26 U.S.C. § 6050L",
      detail:
        "Where this item was received as a charitable contribution for which the donor filed Form 8283, Section B, and it has been disposed of within three years of receipt, the Kingdom must file Form 8282 within 125 days of the disposition and furnish a copy to the donor. Thirty days remain from this reminder. If neither condition applies, close the deadline with a note recording why.",
      when: (data) => data.acquisitionMethod === "GIFT_IN_KIND",
    },
    {
      id: "cht-annual-verification",
      title: "Physical verification of custody due",
      fromField: "acquisitionDate",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Lay eyes on the item, confirm the custodian and location are still as recorded, and update the condition. An inventory that is never verified is not an inventory, and an unverified register is worth nothing to an auditor or an insurer.",
    },
  ],
};

export default chattels;
