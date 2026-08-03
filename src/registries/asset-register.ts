import type { RegistryDef } from "@/registries/types";

/**
 * The Consolidated Register of Assets and Holdings.
 *
 * Lands, chattels, and intellectual property each have their own register, and
 * each answers a different question. None of them answers the one an insurer, an
 * auditor, or a successor trustee asks first: what does the Kingdom own, all of
 * it, in one list, at one date, and at what value. This register is that list.
 * It is the schedule from which a statement of financial position is built, and
 * it is the only document that ties the property registers to the treasury.
 */

const assetRegister: RegistryDef = {
  slug: "asset-register",
  title: "Consolidated Register of Assets and Holdings",
  shortTitle: "Assets",
  recordLabel: "Asset",
  recordLabelPlural: "Assets",
  group: "enterprise",
  numberPrefix: "AST",
  order: 1,
  authority:
    "Charter Art. IV §8 (Assets Held in Trust); Art. IV §7 (Economic Powers); Connecticut Uniform Trust Code, Conn. Gen. Stat. § 45a-499a et seq.",
  description:
    "Every asset the Kingdom holds, in every class, with its acquisition basis, its carrying value, its custodian, its insurance, and the treasury account it reconciles to.",
  guidance: `Lands, chattels, and intellectual property each have their own register. None of them answers the question everybody asks first: **what does the Kingdom own, all of it, in one list, at one date.** That list produces the statement of financial position — the first schedule an insurance underwriter wants before quoting, the first an auditor reconciles, and the only thing standing between a successor trustee and a year of forensic reconstruction. Enter an asset here as well as in its class register.

**Carrying value is not market value, and this register records a basis rather than a guess.** Carrying value is what the asset is carried at in the books — ordinarily cost less accumulated depreciation, or for donated property its fair value at the date of the gift. Fair value is what it would fetch today; the two differ, sometimes enormously, and that difference is not an error. Record the cost, the basis, the valuation date, and who performed it. A figure with no basis is worse than none: it will be quoted back as something the Kingdom asserted.

**These assets are held in trust and they are not the Founder's.** A trustee owes a duty of care in administering and protecting trust property and a duty to keep adequate records of it (Conn. Gen. Stat. § 45a-499a et seq.). Personal use of trust property by an officer is private inurement, which § 501(c)(3) conditions exemption on avoiding entirely, and which carries a personal excise tax on the recipient of 25% of the excess benefit, rising to 200% uncorrected, and 10% on any manager who knowingly approved it (26 U.S.C. § 4958). Name the custodian; reimburse incidental personal use at fair value.

**Insurance gaps are discovered after the loss, never before.** Record carrier, policy, coverage amount, and expiry for anything the Kingdom could not simply replace, then compare coverage to carrying value asset by asset. Under-insurance, an unscheduled item, a lapsed policy, a co-insurance clause — each is invisible until a claim is denied.

**Take a physical inventory once a year and reconcile it to the treasury.** Walk the list, lay eyes on each item, record the date. Anything that cannot be produced goes to MISSING that day, not quietly written off at year end. Then tie the totals to the ledger account codes recorded here: a register that does not reconcile to the books is a second set of numbers, and a second set of numbers is a finding.

**Anything titled — vehicles, land, registered securities — must show the exact name on the title, punctuation included.** An unincorporated association is frequently not a legal person and cannot take title in its own name, and the states have modified that rule unevenly. Settle with counsel whether title runs to a named trustee, a title-holding entity, or the association, then use that name everywhere.

Two boundaries. Securities the Kingdom **holds** are ordinary property and belong here. Securities it **issues** are an offering: Securities Act § 3(a)(4) exempts a religious or charitable issuer not operated for pecuniary profit from *registration* only, the antifraud provisions of § 17(a) and Rule 10b-5 always apply, and Connecticut's Uniform Securities Act applies independently (Conn. Gen. Stat. § 36b-2 et seq.). And a cash account here holds the Kingdom's own money, which is book-keeping; moving value between two other parties on its rails is money transmission and is licensed (18 U.S.C. § 1960; 31 C.F.R. § 1022.380; Conn. Gen. Stat. § 36a-595 et seq.).

This register records the Kingdom's own holdings. It is not a filing with any government and binds nobody.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "HELD",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "TREASURER"],
  titleField: "assetDescription",
  listColumns: ["assetClass", "carryingValue", "custodian", "physicalLocation"],

  statuses: [
    {
      value: "PENDING",
      label: "Pending acquisition",
      tone: "neutral",
      help: "Committed to or in negotiation. Not yet held, and not yet on the statement of financial position.",
    },
    { value: "HELD", label: "Held and in service", tone: "success" },
    {
      value: "IN_STORAGE",
      label: "Held, not in service",
      tone: "neutral",
      help: "Stored, mothballed, or held for a future purpose. Still insured, still inventoried.",
    },
    {
      value: "RESTRICTED",
      label: "Restricted or pledged",
      tone: "warning",
      help: "Subject to a donor restriction, a security interest, a lien, or a lease. The Kingdom holds it but cannot deal with it freely. State the restriction in the encumbrance field.",
    },
    {
      value: "IMPAIRED",
      label: "Impaired",
      tone: "warning",
      help: "Carrying value exceeds what the asset is now worth to the Kingdom. Write it down and record why, rather than carrying a figure nobody believes.",
    },
    {
      value: "MISSING",
      label: "Missing — unaccounted for",
      tone: "danger",
      help: "Set this the day the asset cannot be produced on inventory, not the day it is written off.",
    },
    { value: "DISPOSED", label: "Disposed of", tone: "neutral" },
    {
      value: "WRITTEN_OFF",
      label: "Written off",
      tone: "neutral",
      help: "Removed from the books without proceeds. Requires a minuted decision by disinterested officers where any officer or related person benefits.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "assetDescription",
      label: "Description of the asset",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      placeholder: "e.g. Steinway Model B grand piano, serial 592114",
      help: "Enough particularity that a stranger doing an inventory could identify this one item and no other. 'Sound equipment' identifies nothing and reconciles to nothing.",
    },
    {
      key: "assetClass",
      label: "Asset class",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      help: "Drives how the asset is presented on the statement of financial position and which valuation and depreciation rules apply. Classify by what the thing is, not by which register it also appears in.",
      options: [
        {
          value: "CASH",
          label: "Cash and deposit accounts",
          help: "The Kingdom's own funds in its own accounts. Holding and disbursing its own money is book-keeping; receiving money to transmit to a third party is money transmission and is licensed (18 U.S.C. § 1960; 31 C.F.R. § 1022.380; Conn. Gen. Stat. § 36a-595 et seq.).",
        },
        { value: "REAL_PROPERTY", label: "Real property", help: "Cross-reference the parcel in the Register of Lands. Title, encumbrances, and the assessor's exemption live there; the carrying value lives here." },
        { value: "CHATTELS", label: "Chattels and furnishings" },
        { value: "VEHICLES", label: "Vehicles", help: "Titled property. The certificate of title must name a holder the state recognises, and that exact name goes in the title-holder field." },
        { value: "EQUIPMENT", label: "Equipment and fixtures" },
        {
          value: "SECURITIES",
          label: "Securities held as investments",
          help: "Stocks, bonds, funds, and notes the Kingdom owns. Holding securities is ordinary investment. Issuing them is an offering and a wholly different regime.",
        },
        { value: "RECEIVABLES", label: "Receivables and pledges due", help: "Amounts owed to the Kingdom. An unconditional pledge is an asset; a non-binding intention to give is not, and recording one as an asset overstates the position." },
        { value: "INTANGIBLES", label: "Intangibles — trademarks, copyrights, goodwill", help: "Cross-reference the Intellectual Property Portfolio. Internally created intangibles usually carry at little or nothing even where they are the Kingdom's most valuable holdings; say so rather than inventing a figure." },
        { value: "DIGITAL", label: "Digital assets and accounts", help: "Domains, platform handles, hosted archives, credentials, and any cryptoasset. Record where the keys or recovery codes are held — a digital asset nobody can access is a loss nobody noticed." },
        { value: "ART_CULTURAL", label: "Works of art and cultural property", help: "Cross-reference the Cultural Heritage register. Provenance and any repatriation or protocol question is recorded there; do not restate it here." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "identifyingNumber",
      label: "Identifying number",
      type: "text",
      section: "Identification",
      placeholder: "e.g. VIN, serial no., account no. (last 4), CUSIP, parcel ID",
      help: "The number that distinguishes this asset from an identical one — serial, VIN, CUSIP, parcel ID, or the last four digits of an account. Never record a full account number, routing number, or private key here.",
    },
    {
      key: "realPropertyRef",
      label: "Related parcel in the Register of Lands",
      type: "recordRef",
      refRegistry: "real-property",
      section: "Identification",
      help: "Where this asset is a parcel, or a fixture attached to one. Keeps the carrying value and the recorded title from drifting apart into two inconsistent accounts of the same thing.",
    },
    {
      key: "titleHolderName",
      label: "Exact name in which title is held",
      type: "text",
      section: "Identification",
      placeholder: "e.g. Matthew McCluster, Trustee of the Apex Kingdom Trust u/d/t 29 May 2025",
      help: "For anything titled or registered, copy the holder's name from the certificate or deed word for word. An unincorporated association frequently cannot hold title in its own name, so the name on the paper is often not the name the Kingdom uses day to day. The name here is who a court will say owns the asset.",
    },

    {
      key: "acquisitionDate",
      label: "Date acquired",
      type: "date",
      required: true,
      section: "Acquisition",
      summary: true,
      help: "The date the Kingdom took ownership — delivery, closing, or the date of the gift. Sets the depreciation start and the three-year window for donated property reported on Form 8283.",
    },
    {
      key: "acquisitionMethod",
      label: "How it was acquired",
      type: "select",
      required: true,
      section: "Acquisition",
      options: [
        { value: "PURCHASE", label: "Purchased for consideration" },
        {
          value: "GIFT",
          label: "Donated",
          help: "Carry at fair value at the date of the gift. The Kingdom acknowledges receipt and describes the item; it never states a value for the donor. A donor claiming over $5,000 obtains their own qualified appraisal and the Kingdom signs Form 8283, Section B.",
        },
        { value: "BEQUEST", label: "Bequest or devise" },
        { value: "CONSTRUCTED", label: "Built or created by the Kingdom", help: "Capitalise direct costs. Volunteer labour is generally not capitalised, however valuable it was." },
        { value: "EXCHANGE", label: "Exchanged for other property" },
        { value: "LEASE", label: "Leased in — right of use only", help: "The Kingdom holds a leasehold, not the asset. Record it as such and do not carry the underlying property as owned." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "acquisitionCost",
      label: "Acquisition cost or value at acquisition",
      type: "money",
      section: "Acquisition",
      help: "What was actually paid, or fair value at the date of a gift. This is the historical basis and it never changes afterwards. It is the figure an auditor and the Attorney General compare every later valuation against.",
    },

    {
      key: "carryingValue",
      label: "Current carrying value",
      type: "money",
      section: "Valuation",
      summary: true,
      help: "What the asset is carried at in the books today — ordinarily cost less accumulated depreciation, or fair value where the basis below says so. This figure, summed across the register, is the asset side of the statement of financial position.",
    },
    {
      key: "valuationBasis",
      label: "Valuation basis",
      type: "select",
      section: "Valuation",
      help: "How the carrying value was arrived at. State the method; a figure without one cannot be relied on by anyone and should not be quoted to anyone.",
      options: [
        { value: "HISTORICAL_COST", label: "Historical cost less depreciation" },
        { value: "FAIR_VALUE_GIFT", label: "Fair value at date of gift" },
        { value: "APPRAISAL", label: "Independent appraisal", help: "The strongest basis. Record the appraiser and the date; an appraisal more than a few years old is a historical fact, not a current value." },
        { value: "MARKET_QUOTE", label: "Quoted market price", help: "For listed securities. Note the date of the quote — the value moves daily." },
        { value: "ASSESSED_VALUE", label: "Municipal assessed value", help: "Assessments are set for taxation, commonly at a statutory fraction of market value. Convenient, but not an appraisal, and should never be presented as one." },
        { value: "INSURED_VALUE", label: "Insured or replacement value", help: "Replacement cost is usually higher than fair value. Useful for coverage, misleading on a balance sheet." },
        { value: "NOMINAL", label: "Nominal or unvalued", help: "The honest entry for internally created intangibles and for cultural property whose value is not monetary. Preferable to a number invented to fill the field." },
      ],
    },
    {
      key: "valuationDate",
      label: "Date of valuation",
      type: "date",
      section: "Valuation",
      help: "When the carrying value was last established. A stale valuation is the most common defect in a small institution's accounts; this date is what makes staleness visible.",
    },
    {
      key: "valuer",
      label: "Valuer",
      type: "text",
      section: "Valuation",
      placeholder: "e.g. Firm name, appraiser name and credential",
      help: "Who set the value, and on what qualification. Where an officer valued an asset they or a related person benefits from, say so plainly here — that fact is what a reviewer is looking for and concealing it is the whole problem.",
    },

    {
      key: "custodian",
      label: "Custodian",
      type: "person",
      section: "Custody, trust and encumbrance",
      summary: true,
      help: "The officer or institution physically responsible for the asset today. Where it is in anyone's hands other than at a Kingdom premises, open a matching entry in the Register of Custody and Bailment.",
    },
    {
      key: "physicalLocation",
      label: "Physical location",
      type: "text",
      section: "Custody, trust and encumbrance",
      summary: true,
      placeholder: "e.g. Sanctuary, 000 Stratford Avenue — vestry safe",
      help: "Where a person sent to find it would go. For digital assets, where the credentials and recovery material are held. Vague locations are how inventories fail.",
    },
    {
      key: "lastInventoryDate",
      label: "Date last physically verified",
      type: "date",
      section: "Custody, trust and encumbrance",
      help: "The date someone laid eyes on this asset and confirmed it exists. Updated at each annual inventory. An asset never verified is an asset the Kingdom cannot prove it has.",
    },
    {
      key: "heldInTrust",
      label: "Held in trust",
      type: "boolean",
      section: "Custody, trust and encumbrance",
      help: "Check only where a written trust instrument exists and this asset is subject to it. Trust property is not the Founder's and not any officer's; the trustee's duties of care, loyalty, and record-keeping attach to it.",
    },
    {
      key: "trustFundCode",
      label: "Fund code",
      type: "text",
      section: "Custody, trust and encumbrance",
      placeholder: "e.g. GEN, BLDG-RESTR, ENDOW",
      help: "Which fund holds the asset — general, building, endowment, or a specific donor-restricted fund. Restricted funds may not be spent on other purposes, and mixing them is the single most common finding against a small charity.",
    },
    {
      key: "encumbrances",
      label: "Encumbrances and restrictions",
      type: "textarea",
      section: "Custody, trust and encumbrance",
      help: "Mortgages, security interests, liens, leases, donor restrictions, conservation restrictions, and any cultural protocol limiting use or disposal. Record the holder and the recording reference. An asset the Kingdom cannot freely sell should never be presented as though it could.",
    },

    {
      key: "insuranceCarrierPolicy",
      label: "Insurance carrier and policy number",
      type: "text",
      section: "Insurance",
      help: "Who covers this asset and under which policy. Where the asset sits in someone else's hands, confirm the policy actually reaches it — most do not follow property off the scheduled premises.",
    },
    {
      key: "insuranceCoverageAmount",
      label: "Coverage amount",
      type: "money",
      section: "Insurance",
      help: "The limit applicable to this asset. Compare it to carrying value and to replacement cost. A co-insurance clause can reduce a partial-loss payment sharply where the declared value was understated.",
    },
    {
      key: "insuranceExpiryDate",
      label: "Policy expiry date",
      type: "date",
      section: "Insurance",
      help: "Coverage lapses silently and nobody is told. This date generates the renewal reminder.",
    },

    {
      key: "depreciationMethod",
      label: "Depreciation method",
      type: "select",
      section: "Depreciation and impairment",
      options: [
        { value: "STRAIGHT_LINE", label: "Straight line", help: "Cost less salvage, spread evenly over the useful life. The ordinary choice and the easiest to defend." },
        { value: "DECLINING_BALANCE", label: "Declining balance" },
        { value: "UNITS_OF_PRODUCTION", label: "Units of production" },
        { value: "NONE_LAND", label: "Not depreciated — land", help: "Land is not depreciated. Buildings and improvements on it are." },
        { value: "NONE_COLLECTION", label: "Not depreciated — collection item", help: "Works of art and heritage items held for public exhibition and preservation are commonly not depreciated, provided the Kingdom actually protects and preserves them." },
        { value: "NONE_OTHER", label: "Not depreciated — other" },
      ],
      help: "How cost is spread over the years the asset serves. Consistency across like assets matters more than which method is chosen.",
    },
    {
      key: "usefulLifeYears",
      label: "Useful life (years)",
      type: "number",
      min: 0,
      max: 100,
      section: "Depreciation and impairment",
      help: "How long the Kingdom expects to use the asset, not how long it could theoretically last. Drives the annual depreciation charge and the replacement planning conversation.",
    },
    {
      key: "impairmentNotes",
      label: "Impairment notes",
      type: "textarea",
      section: "Depreciation and impairment",
      help: "Any event reducing the asset's value or usefulness below its carrying amount — damage, obsolescence, loss of a permit, a market collapse. Write the asset down and record why here. Carrying an impaired asset at full value overstates the Kingdom's position to everyone who reads the accounts.",
    },

    {
      key: "disposalDate",
      label: "Date of disposal",
      type: "date",
      section: "Disposal and accounting",
      help: "When the asset left the Kingdom's hands. Where donated property was reported on a Form 8283 and is disposed of within three years of receipt, Form 8282 is due within 125 days (26 U.S.C. § 6050L).",
    },
    {
      key: "disposalManner",
      label: "Manner of disposal",
      type: "select",
      section: "Disposal and accounting",
      options: [
        { value: "SOLD", label: "Sold" },
        {
          value: "SOLD_INSIDER",
          label: "Sold to an officer, member, or related person",
          help: "Requires an independent valuation and approval by disinterested officers, minuted before the sale. A bargain sale to an insider is an excess benefit transaction under 26 U.S.C. § 4958 and the tax falls on the individual.",
        },
        { value: "DONATED_OUT", label: "Given to another charitable body" },
        { value: "TRADED", label: "Traded in or exchanged" },
        { value: "SCRAPPED", label: "Scrapped or destroyed" },
        { value: "LOST", label: "Lost or stolen", help: "Record the police report number. Insurance recovery and any casualty treatment depend on a contemporaneous report." },
        { value: "RETURNED", label: "Returned to donor or lessor" },
        { value: "OTHER", label: "Other" },
      ],
      help: "How the asset left. Trust property that simply stops appearing, with no entry explaining where it went, is the fact pattern that turns a routine inquiry into an investigation.",
    },
    {
      key: "disposalProceeds",
      label: "Proceeds of disposal",
      type: "money",
      section: "Disposal and accounting",
      help: "What the Kingdom actually received, gross. Post it to the treasury against the account code below and reconcile; proceeds recorded here but not in the ledger is the classic unexplained difference.",
    },
    {
      key: "treasuryAccountCode",
      label: "Treasury account code",
      type: "text",
      section: "Disposal and accounting",
      placeholder: "e.g. 1500 — Furniture & Equipment",
      help: "The ledger account this asset's cost, depreciation, and disposal post to. This field is what makes the register reconcile to the books. Without it the two are separate stories about the same money.",
    },
  ],

  deadlineRules: [
    {
      id: "ast-insurance-renewal",
      title: "Insurance policy expires on this asset",
      fromField: "insuranceExpiryDate",
      offsetDays: -30,
      severity: "HIGH",
      detail:
        "Confirm renewal and obtain the certificate. Take the opportunity to compare the coverage limit against the current carrying value and replacement cost — a limit set at acquisition is usually wrong several years later, and the shortfall only appears at the claim.",
    },
    {
      id: "ast-form-8282",
      title: "Form 8282 due on disposal of donated property",
      fromField: "disposalDate",
      offsetDays: 95,
      severity: "HIGH",
      authority: "26 U.S.C. § 6050L; Treas. Reg. § 1.6050L-1",
      detail:
        "Where the Kingdom signed a Form 8283, Section B for this donated property and disposes of it within three years of receipt, a donee information return on Form 8282 is due within 125 days of the disposition, with a copy to the donor. Thirty days remain from this reminder. Failure to file carries a penalty and is a straightforward finding on examination.",
      when: (data) => data.acquisitionMethod === "GIFT",
    },
    {
      id: "ast-annual-inventory",
      title: "Annual physical verification of this asset is due",
      fromField: "lastInventoryDate",
      offsetDays: 335,
      severity: "ROUTINE",
      authority: "Connecticut Uniform Trust Code, Conn. Gen. Stat. § 45a-499a et seq.",
      detail:
        "A trustee owes a duty to protect trust property and to keep adequate records of the administration of the trust. Lay eyes on the asset, confirm its condition and location, update the verification date, and reconcile the carrying value to the treasury account code. Anything that cannot be produced is set to MISSING on the day of the inventory.",
    },
  ],
};

export default assetRegister;
