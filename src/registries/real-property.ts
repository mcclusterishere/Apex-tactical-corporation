import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Lands and Real Property.
 *
 * An index to what the Kingdom holds and on what recorded title — never a
 * source of title itself. Title to land is made by a deed on the town land
 * records; this register only makes that record findable, and makes visible the
 * two things that are usually got wrong: the exact name of the grantee, and
 * whether anyone ever asked the assessor for the exemption.
 */

const realProperty: RegistryDef = {
  slug: "real-property",
  title: "Register of Lands and Real Property",
  shortTitle: "Lands",
  recordLabel: "Parcel",
  recordLabelPlural: "Parcels",
  group: "property",
  numberPrefix: "LND",
  order: 1,
  authority: "Charter Art. V (Territory & Land Claims); Art. IV §8 (Assets Held in Trust)",
  description:
    "Every parcel the Kingdom owns, occupies, or claims an interest in, indexed to the deed of record, the assessor's card, and the terms on which it is held.",
  guidance: `This register is an **index to what the Kingdom holds, not a source of title**. Title is made by a deed recorded in the land records of the town where the land lies; an unrecorded conveyance holds nothing against anyone but the grantor and their heirs (Conn. Gen. Stat. § 47-10). Where this register and the land records disagree, the land records are right and this entry is wrong.

**The grantee name is the field that matters most.** At common law an unincorporated association could not take title in its own name, and a deed naming one conveyed nothing; the states have modified that rule unevenly. Settle with Connecticut counsel and the title company, in writing and *before* closing, whether the deed will name (a) trustees described exactly, e.g. "[Name], Trustee of the Apex Kingdom Trust u/d/t 29 May 2025", (b) a title-holding entity, or (c) the association itself. Then enter the grantee here **verbatim**, punctuation included. Two failures recur: a deed to a "trustee" that never identifies the trust, and a deed to trustees who later die leaving nothing recorded to show how their successors came to hold. Neither surfaces at the closing; both surface a decade later, at a sale or on a death, as a title objection that cannot be cured without a quiet title action under Conn. Gen. Stat. § 47-31.

**The religious property tax exemption is applied for, not assumed.** Conn. Gen. Stat. § 12-81 exempts houses of religious worship and property held and used for religious and charitable purposes, but it is claimed by filing with the town assessor on the town's schedule, including the quadrennial statement under §§ 12-87 and 12-87a. The assessment date is 1 October, and exemption follows actual exempt *use* — land held vacant for a future project, or space let to a commercial tenant, may be taxable in whole or in part (§ 12-88).

**RLUIPA is a real weapon and not a permit.** 42 U.S.C. § 2000cc bars a land use regulation that substantially burdens religious exercise without a compelling interest pursued by the least restrictive means; § 2000cc(b)(1) bars treating a religious assembly on less than equal terms with a comparable secular assembly. Those claims are won regularly against municipalities. They work through litigation, or the credible threat of it, *after* a denial: apply, build the record, take the decision — and a Connecticut land use appeal must be filed within fifteen days of publication of notice (Conn. Gen. Stat. § 8-8(b)). RLUIPA excuses no one from applying, and building or occupying without a permit forfeits the posture the statute depends on.

**Art. V records an aspiration; it does not convey land.** Recording an instrument that purports to claim land the Kingdom does not own is slander of title, expensive to undo, and where a federal officer's property is touched a felony carrying ten years under 18 U.S.C. § 1521. Possession ripens into title only by judgment: fifteen years of open, visible, exclusive, continuous and hostile possession (Conn. Gen. Stat. § 52-575), proved in court.`,
  defaultClassification: "PUBLIC",
  defaultStatus: "PROSPECTIVE",
  titleField: "parcelDesignation",
  listColumns: ["municipality", "acquisitionMethod", "recordTitleHolder", "taxExemptionStatus"],

  statuses: [
    {
      value: "PROSPECTIVE",
      label: "Prospective",
      tone: "neutral",
      help: "Under consideration or in negotiation. No interest held.",
    },
    { value: "UNDER_CONTRACT", label: "Under contract", tone: "active" },
    {
      value: "HELD",
      label: "Held of record",
      tone: "success",
      help: "A deed naming the Kingdom or its trustee is recorded in the town land records.",
    },
    {
      value: "OCCUPIED_NO_TITLE",
      label: "Occupied without record title",
      tone: "warning",
      help: "Lease, licence, permission, or possession under claim of right. State the basis honestly; this is not ownership.",
    },
    {
      value: "CLAIMED_ONLY",
      label: "Claimed, not held",
      tone: "warning",
      help: "An asserted interest with nothing on the land records to support it. Never described to an outside party as ownership.",
    },
    { value: "DISPUTED", label: "Title or boundary in dispute", tone: "danger" },
    { value: "DISPOSED", label: "Conveyed away", tone: "neutral" },
    { value: "LOST", label: "Lost to foreclosure, tax sale, or judgment", tone: "danger" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "parcelDesignation",
      label: "Parcel designation",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      placeholder: "e.g. The Shiloh Parcel — 000 Stratford Avenue",
      help: "The internal name by which officers will refer to this land in minutes and correspondence. Keep it fixed once chosen; a parcel renamed mid-file becomes two parcels in the archive.",
    },
    {
      key: "streetAddress",
      label: "Street address",
      type: "text",
      section: "Identification",
      help: "The mailing address if the parcel has one. Vacant land often does not, which is why the assessor's parcel number below is the reliable identifier.",
    },
    {
      key: "municipality",
      label: "Town or city",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "The town whose clerk holds the land records for this parcel and whose assessor decides the exemption. Every filing described in this register happens in this town, not at the state.",
    },
    {
      key: "county",
      label: "County",
      type: "text",
      section: "Identification",
      help: "Recorded for out-of-state parcels and for deeds that recite it. Connecticut counties have no government and no land records — nothing is filed at a Connecticut county office.",
    },
    {
      key: "state",
      label: "State or jurisdiction",
      type: "jurisdiction",
      required: true,
      section: "Identification",
      placeholder: "Connecticut",
      help: "Whose recording statutes, transfer taxes, and adverse possession periods govern. The guidance below is Connecticut law; a parcel elsewhere needs local counsel before anything is filed.",
    },
    {
      key: "assessorParcelNumber",
      label: "Assessor's parcel / map-block-lot number",
      type: "text",
      section: "Identification",
      placeholder: "e.g. Map 12 / Block 447 / Lot 3",
      help: "The identifier the town uses on the grand list. Quote it in any correspondence with the assessor; addresses are ambiguous and this is not.",
    },
    {
      key: "acreage",
      label: "Area (acres)",
      type: "number",
      min: 0,
      section: "Identification",
      help: "As stated on the deed or a recorded survey, not as measured from an online map. Deed acreage and actual acreage differ often enough that the difference is itself worth noting.",
    },

    {
      key: "acquisitionMethod",
      label: "How the interest was acquired",
      type: "select",
      required: true,
      section: "Acquisition",
      summary: true,
      options: [
        { value: "PURCHASE", label: "Purchase for consideration" },
        { value: "GIFT", label: "Gift or donation", help: "A donor deducting over $5,000 needs a qualified appraisal; the Kingdom acknowledges receipt, and never states a value." },
        { value: "DEVISE", label: "Devise or inheritance", help: "Title passes through the probate estate. Record the probate court and estate number in the encumbrance notes until the fiduciary's deed is recorded." },
        { value: "LEASE", label: "Leasehold", help: "A lease of more than one year should itself be recorded, or at least a notice of lease, or it binds no purchaser from the landlord." },
        { value: "LICENCE", label: "Licence or permission to use", help: "Revocable at will and conveys no interest in the land. Do not describe it as a holding." },
        { value: "ADVERSE_POSSESSION_CLAIM", label: "Adverse possession — claim asserted", help: "A claim, not a title. It becomes title only by judgment in a quiet title action; nothing is recorded before that." },
        { value: "DEDICATION", label: "Dedication or grant from a public body" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "acquisitionDate",
      label: "Date of acquisition",
      type: "date",
      section: "Acquisition",
      summary: true,
      help: "The date of the deed for a conveyance. For an adverse possession claim, the date open and exclusive possession actually began — this is the date the fifteen-year period under Conn. Gen. Stat. § 52-575 runs from, and it must be provable by witnesses or photographs, not asserted.",
    },
    {
      key: "consideration",
      label: "Consideration paid",
      type: "money",
      section: "Acquisition",
      help: "What was actually paid. It sets the basis for any later disposition, drives the Connecticut conveyance tax return, and is the first figure an auditor or the Attorney General compares against the appraisal.",
    },

    {
      key: "recordTitleHolder",
      label: "Record title holder — exact name on the deed",
      type: "text",
      required: true,
      section: "Title of record",
      summary: true,
      placeholder: "e.g. Matthew McCluster, Trustee of the Apex Kingdom Trust u/d/t 29 May 2025",
      help: "Copy the grantee clause from the recorded deed word for word, including commas and trust references. This is the single field most likely to be transcribed loosely and most expensive to have got wrong: the name here is who a court will say owns the land.",
    },
    {
      key: "heldInTrust",
      label: "Held in trust",
      type: "boolean",
      section: "Title of record",
      help: "Check only if a written trust instrument exists and the deed refers to it. A trustee named on a deed with no identifiable trust behind it holds the land personally, and it passes to their heirs on death.",
    },
    {
      key: "trustParticulars",
      label: "Trust particulars — instrument and beneficiaries",
      type: "textarea",
      section: "Title of record",
      help: "The declaration of trust by date and recording reference, the trustee's name, the successor trustee, and for whom the property is held. Successor trustees must be able to prove their authority from recorded documents alone, years after everyone present at the closing has gone.",
    },
    {
      key: "deedVolumePage",
      label: "Deed volume and page",
      type: "text",
      section: "Title of record",
      placeholder: "e.g. Vol. 8421, Pg. 106, Bridgeport Land Records",
      help: "The citation any title searcher will use to find the instrument. Without it this entry cannot be verified against the record, which is the only thing that makes the entry worth keeping.",
    },
    {
      key: "deedRecordedDate",
      label: "Date deed recorded",
      type: "date",
      section: "Title of record",
      help: "The date the town clerk stamped it, which is not always the date of the deed. Priority against later purchasers and creditors runs from recording, not from signing (Conn. Gen. Stat. § 47-10).",
    },

    {
      key: "encumbrances",
      label: "Easements, restrictions, and other encumbrances",
      type: "textarea",
      section: "Encumbrances and insurance",
      help: "Rights of way, utility easements, restrictive covenants, conservation restrictions, rights of first refusal, and anything else in the chain that binds this land. Record what the title search found; a restriction nobody read is still enforceable.",
    },
    {
      key: "mortgageOrLien",
      label: "Mortgage or lien particulars",
      type: "textarea",
      section: "Encumbrances and insurance",
      help: "Holder, original amount, recording reference, and maturity for each mortgage, municipal lien, mechanic's lien, or judgment lien. A municipal tax lien has priority over almost everything and forecloses on the town's timetable.",
    },
    {
      key: "insuranceCarrierPolicy",
      label: "Insurance carrier and policy number",
      type: "text",
      section: "Encumbrances and insurance",
      help: "Property and liability coverage on this parcel. An uninsured assembly building is the one loss the institution does not survive, and lenders and lessors will demand proof.",
    },
    {
      key: "insuranceExpiryDate",
      label: "Policy expiry date",
      type: "date",
      section: "Encumbrances and insurance",
      help: "Coverage lapses silently. This date generates the renewal reminder.",
    },

    {
      key: "currentUse",
      label: "Current use",
      type: "select",
      section: "Taxation and land use",
      options: [
        { value: "WORSHIP", label: "House of religious worship" },
        { value: "ASSEMBLY", label: "Assembly, education, or community use" },
        { value: "ADMINISTRATIVE", label: "Administrative offices" },
        { value: "PARSONAGE", label: "Residence of officiating clergy" },
        { value: "CEREMONIAL", label: "Ceremonial or cultural grounds" },
        { value: "VACANT", label: "Vacant or held for future use", help: "The hardest use to keep exempt. Exemption follows actual exempt use, and a bare intention to build is often not enough." },
        { value: "LEASED_OUT", label: "Let to a tenant", help: "Rental to an unrelated commercial tenant can defeat the exemption pro rata under Conn. Gen. Stat. § 12-88 and may generate unrelated business income." },
        { value: "OTHER", label: "Other" },
      ],
      help: "What the land is actually used for today, not what it is intended for. The assessor decides the exemption on use, and will inspect.",
    },
    {
      key: "taxExemptionStatus",
      label: "Property tax exemption status",
      type: "select",
      section: "Taxation and land use",
      summary: true,
      options: [
        { value: "NOT_APPLIED", label: "Not applied for", help: "The default, and the honest one. There is no automatic exemption for religious use in Connecticut." },
        { value: "APPLIED", label: "Application filed, awaiting determination" },
        { value: "GRANTED_FULL", label: "Granted in full" },
        { value: "GRANTED_PARTIAL", label: "Granted in part", help: "Record which portion is taxable and why, under Conn. Gen. Stat. § 12-88." },
        { value: "DENIED", label: "Denied", help: "An appeal runs to the Board of Assessment Appeals on the town's schedule, then to the Superior Court. The deadlines are short and are not extended for good reason." },
        { value: "REVOKED", label: "Revoked or lapsed", help: "Most often for a missed quadrennial statement rather than for any change in use." },
        { value: "TAXABLE", label: "Taxable — no exemption sought" },
      ],
      help: "Where the exemption actually stands with the town assessor, not where the Charter says it should stand.",
    },
    {
      key: "exemptionFiledDate",
      label: "Date exemption application filed with the assessor",
      type: "date",
      section: "Taxation and land use",
      help: "The date the statement went in to the town, with a copy in the Evidence Vault. If this is blank the parcel is taxable, whatever its use.",
    },
    {
      key: "quadrennialReportDueDate",
      label: "Next quadrennial statement due",
      type: "date",
      section: "Taxation and land use",
      help: "The town-specific date the § 12-87 statement next falls due — ask the assessor and enter their answer, not an assumption. A missed quadrennial filing revokes an exemption that took years to obtain.",
    },
    {
      key: "zoningDistrict",
      label: "Zoning district",
      type: "text",
      section: "Taxation and land use",
      placeholder: "e.g. R-B Residential B",
      help: "The district as the town's zoning map has it, plus whether religious assembly is permitted as of right, by special permit, or not at all. This determines whether the Kingdom applies for a permit or applies for a variance, and an equal-terms claim under 42 U.S.C. § 2000cc(b)(1) is built from how secular assemblies are treated in this same district.",
    },
    {
      key: "zoningDecisionPublishedDate",
      label: "Date notice of a land use decision was published",
      type: "date",
      section: "Taxation and land use",
      help: "The publication date of any zoning, wetlands, or planning decision affecting this parcel — approval, denial, or condition. The appeal period runs from publication, not from the hearing or from receipt of a letter.",
    },
  ],

  deadlineRules: [
    {
      id: "lnd-zoning-appeal",
      title: "Appeal period closing on a land use decision",
      fromField: "zoningDecisionPublishedDate",
      offsetDays: 7,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 8-8(b)",
      detail:
        "An appeal from a Connecticut land use decision must be commenced within fifteen days of the date notice of the decision was published. The period is jurisdictional — a late appeal is dismissed without reaching the merits, and the denial then stands as the final decision on which any RLUIPA claim would have been built. Eight days remain from this reminder.",
    },
    {
      id: "lnd-deed-recording",
      title: "Confirm the deed is recorded on the town land records",
      fromField: "acquisitionDate",
      offsetDays: 7,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. § 47-10",
      detail:
        "An unrecorded conveyance holds no land against anyone but the grantor and their heirs. Obtain the volume and page from the town clerk, enter them here, and place a stamped copy in the Evidence Vault.",
      when: (data) => !data.deedVolumePage,
    },
    {
      id: "lnd-assessor-exemption",
      title: "Approach the town assessor about the religious use exemption",
      fromField: "acquisitionDate",
      offsetDays: 30,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. §§ 12-81, 12-87",
      detail:
        "The exemption for property held and used for religious or charitable purposes is not automatic and is not granted on the strength of the Charter. Ask the assessor in writing what form is required and by what date, file it, and record the filing date here. Connecticut's assessment date is 1 October; a filing missed for one grand list year is a full year of tax.",
      when: (data) => data.taxExemptionStatus === "NOT_APPLIED" || !data.taxExemptionStatus,
    },
    {
      id: "lnd-quadrennial",
      title: "Quadrennial exemption statement falls due",
      fromField: "quadrennialReportDueDate",
      offsetDays: -60,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. §§ 12-87, 12-87a",
      detail:
        "Tax-exempt organisations must file a periodic statement with the assessor to keep an exemption alive. Late filing is possible under § 12-87a with a fee, but the exemption is otherwise lost for the year and the Kingdom pays the full tax on property it holds in trust.",
    },
    {
      id: "lnd-insurance-renewal",
      title: "Property insurance policy expires",
      fromField: "insuranceExpiryDate",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Confirm renewal and obtain the certificate. Where the parcel secures a mortgage or is let to a tenant, the lender or tenant must be named as required by the instrument.",
    },
    {
      id: "lnd-adverse-possession-ripens",
      title: "Fifteen-year possession period has run",
      fromField: "acquisitionDate",
      offsetDays: 5479,
      severity: "HIGH",
      authority: "Conn. Gen. Stat. §§ 52-575, 47-31",
      detail:
        "Where possession has genuinely been open, visible, exclusive, continuous, and under a claim of right for fifteen years, the claim can now be put to a court. It becomes title only by judgment in an action to settle title under § 47-31, proved by clear and positive evidence. Nothing may be recorded on the land records before that judgment.",
      when: (data) => data.acquisitionMethod === "ADVERSE_POSSESSION_CLAIM",
    },
  ],
};

export default realProperty;
