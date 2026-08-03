import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Custody and Bailment.
 *
 * Who is physically holding the Kingdom's property right now, on what terms, and
 * whose insurance answers if it is damaged. Almost every asset a small
 * institution loses is lost the same way: an officer hands something to someone
 * in a hallway and means to write it up. This register is the discipline of
 * writing it up first, while the item is still in the room.
 */

const custody: RegistryDef = {
  slug: "custody",
  title: "Register of Custody and Bailment",
  shortTitle: "Custody",
  recordLabel: "Custody",
  recordLabelPlural: "Custodies",
  group: "enterprise",
  numberPrefix: "CUS",
  order: 2,
  authority: "Charter Art. IV §8 (Assets Held in Trust); common law of bailment",
  description:
    "Every item of Kingdom property in someone else's hands — an officer's, a member's, a contractor's, a bank's, a warehouse's, a conservator's — with the terms, the condition, and the date it is due back.",
  guidance: `Record the item **before it leaves**, not after it fails to come back. That is the whole discipline, and every gap in the asset register began as a departure from it.

**Bailment is the legal frame, and it is more useful than it sounds.** A bailment is a delivery of goods by the owner to another for a purpose, with the goods to be returned. The person holding them — the bailee — owes a duty of care over the property and is liable for loss or damage caused by their negligence. The standard varies with who benefits: strictest where the bailment is for the bailee's sole benefit, most forgiving where it is purely a favour to the Kingdom, and ordinary care in a mutual-benefit bailment such as paid storage or repair. Record which one this is. It is the first thing an adjuster or a judge will want to know.

The practical consequence: **a written custody agreement is the difference between a duty that is enforceable and one that is arguable.** Proof of delivery in good condition, followed by return in damaged condition or non-return at all, ordinarily raises a presumption that puts the burden on the bailee to explain what happened. That presumption is only available to an owner who can actually prove the delivery and the condition — which is what the condition-on-delivery field and the photographs are for. Take them. Date them. Put them in the Evidence Vault.

**Insurance follows the asset, and the common outcome is that neither policy answers.** A homeowner's or renter's policy typically excludes or severely limits property held for others and property connected to a business or organisation. The Kingdom's own policy may cover only property at scheduled premises. Property in transit, in a member's garage, or at a contractor's shop falls straight into the space between them. Settle in writing, before delivery, who insures and for what amount, obtain the certificate, and record it here.

**An officer holding trust property holds it as trust property.** Nothing in this register belongs to its custodian, and personal use of it is private inurement carrying a personal excise tax under 26 U.S.C. § 4958. A signed acknowledgement at the point of delivery costs nothing and forecloses the argument entirely.

**When something is not returned, the route is a written demand and then a court.** Send a demand for return with a date certain and keep proof of delivery. If it is refused, the remedies are civil: replevin under Conn. Gen. Stat. § 52-515 et seq., or an action for conversion — both in the Superior Court, both subject to the three-year limitation on tort actions in Conn. Gen. Stat. § 52-577. The Kingdom does not issue process. It must never send a notice styled as a lien, a levy, a writ, a seizure order, or anything carrying the colour of law enforcement, and no officer may attend at anyone's home to take property back. That conduct converts a civil claim the Kingdom would probably win into criminal exposure for the officer who signed it. Where the custodian is a member who signed an arbitration agreement covering the dispute, the tribunal is available; where they are not, the Superior Court is the only forum there is.

Close every entry. An open custody record with no return date and no loss note is what an auditor cannot resolve and what a successor trustee inherits as a missing asset.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "IN_CUSTODY",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "TREASURER", "CLERK"],
  titleField: "itemDescription",
  listColumns: ["custodian", "custodyType", "commencementDate", "expectedReturnDate"],

  statuses: [
    {
      value: "ARRANGED",
      label: "Arranged, not yet delivered",
      tone: "neutral",
      help: "Terms settled but the item is still with the Kingdom. Record the condition and take the photographs now, while it is still in hand.",
    },
    { value: "IN_CUSTODY", label: "In custody", tone: "active" },
    {
      value: "OVERDUE",
      label: "Overdue",
      tone: "warning",
      help: "Past the expected return date with no extension recorded. Send a written demand and record the date it was sent.",
    },
    { value: "RETURNED", label: "Returned in good condition", tone: "success" },
    {
      value: "RETURNED_DAMAGED",
      label: "Returned damaged",
      tone: "warning",
      help: "Record the damage before signing anything acknowledging return. A receipt given without inspection is the end of most damage claims.",
    },
    {
      value: "LOST",
      label: "Lost or destroyed in custody",
      tone: "danger",
      help: "Notify the insurer promptly — most policies require prompt notice and late notice is itself a ground for denial.",
    },
    {
      value: "REFUSED",
      label: "Return refused",
      tone: "danger",
      help: "A written demand has been made and refused. This is conversion, and the three-year limitation in Conn. Gen. Stat. § 52-577 is running. Refer it to Counsel; do not pursue it in person.",
    },
    {
      value: "CONVERTED_TO_GIFT",
      label: "Converted to gift or transfer",
      tone: "neutral",
      help: "The Kingdom decided the item should stay with the holder. Requires a minuted decision by disinterested officers where the holder is an officer, a member of their household, or a related person.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "itemDescription",
      label: "Item in custody",
      type: "text",
      required: true,
      section: "The property",
      summary: true,
      placeholder: "e.g. Processional cross, silver-gilt, 1908 — with travelling case",
      help: "Described so that the right object comes back and a substitute would be noticed. Where several items go together, list them all or open one record per item; a single line reading 'box of records' cannot be checked against anything.",
    },
    {
      key: "assetRef",
      label: "Asset in the consolidated register",
      type: "recordRef",
      refRegistry: "asset-register",
      section: "The property",
      help: "Links this custody to the asset's carrying value, insurance, and treasury code. Anything of consequence should already be in the asset register before it is handed to anyone.",
    },
    {
      key: "declaredValue",
      label: "Declared value",
      type: "money",
      section: "The property",
      help: "The value stated to the custodian and to the insurer at the time of delivery. Warehouse, shipping, and repair contracts commonly limit liability to a low per-item or per-pound figure unless a higher value is declared and paid for. Understating it here caps the recovery there.",
    },
    {
      key: "locationInCustody",
      label: "Where the item is held",
      type: "text",
      section: "The property",
      placeholder: "e.g. Vault 3, People's United Bank, Main Street branch",
      help: "The actual address or facility, not the custodian's mailing address. This is where someone would go to collect it, and it is what an insurer will ask for.",
    },

    {
      key: "custodian",
      label: "Custodian",
      type: "person",
      required: true,
      section: "Custodian",
      summary: true,
      help: "The person or institution accepting responsibility for the property. Where it is an organisation, also name the individual who signed for it — organisations change hands and individuals remember.",
    },
    {
      key: "custodianCapacity",
      label: "Capacity in which they hold",
      type: "select",
      required: true,
      section: "Custodian",
      options: [
        { value: "OFFICER", label: "Officer of the Kingdom" },
        { value: "MEMBER", label: "Member or citizen" },
        { value: "EMPLOYEE", label: "Employee or volunteer" },
        { value: "CONTRACTOR", label: "Contractor or vendor" },
        { value: "BANK", label: "Bank or trust company" },
        { value: "WAREHOUSE", label: "Warehouse or storage facility", help: "A warehouse receipt is a document of title governed by the Uniform Commercial Code, Article 7, as adopted in Connecticut. Read the limitation of liability before signing." },
        { value: "CONSERVATOR", label: "Conservator or restorer" },
        { value: "MUSEUM", label: "Museum or exhibiting institution" },
        { value: "ATTORNEY", label: "Attorney or professional adviser" },
        { value: "CARRIER", label: "Carrier or shipper" },
        { value: "OTHER", label: "Other" },
      ],
      help: "Determines whose insurance is likely to answer and what standard of care applies. It also determines whether the Kingdom's internal discipline reaches this person at all — it does not reach a contractor or a warehouse, and against them only the written contract does.",
    },
    {
      key: "custodianContact",
      label: "Custodian contact details",
      type: "text",
      section: "Custodian",
      help: "Telephone and address sufficient to serve a demand. Collected at the outset because a custodian who is not returning something is rarely easy to find later.",
    },

    {
      key: "custodyType",
      label: "Type of custody",
      type: "select",
      required: true,
      section: "Terms of custody",
      summary: true,
      options: [
        { value: "OFFICER_POSSESSION", label: "Possession by an officer in the course of duty", help: "Keys, regalia, laptops, records. Still trust property; still recorded; still returnable on leaving office." },
        { value: "BAILMENT_STORAGE", label: "Bailment for storage" },
        { value: "BAILMENT_REPAIR", label: "Bailment for repair or conservation", help: "A repairer may hold a common-law or statutory lien for unpaid charges — the item does not come back until the invoice is paid." },
        { value: "CONSIGNMENT", label: "Consignment for sale", help: "Consigned goods can be reached by the consignee's creditors unless the consignor's interest is perfected under Article 9. Take advice before consigning anything of value." },
        { value: "LOAN_EXHIBITION", label: "Loan for exhibition", help: "Use a standard loan agreement covering nail-to-nail insurance, condition reporting, credit line, photography rights, and a fixed return date." },
        { value: "SAFE_DEPOSIT", label: "Safe deposit box", help: "The bank is generally not a bailee of unknown contents. Keep an inventory of what is in the box and who holds the keys, because nobody else will." },
        { value: "ESCROW", label: "Escrow", help: "Property held by a third party pending a condition. The escrow instructions govern; write them down and keep them here." },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "bailmentBenefit",
      label: "Whose benefit the custody serves",
      type: "select",
      section: "Terms of custody",
      options: [
        { value: "KINGDOM_ONLY", label: "The Kingdom's sole benefit", help: "A favour to the Kingdom — a member storing a box at no charge. The custodian's duty is at its most forgiving, so the written agreement matters most here, not least." },
        { value: "CUSTODIAN_ONLY", label: "The custodian's sole benefit", help: "The Kingdom lends something for the holder's own use. The strictest standard of care applies to them." },
        { value: "MUTUAL", label: "Mutual benefit", help: "Paid storage, repair, exhibition, or shipping. Ordinary care, and the written contract normally sets the terms." },
      ],
      help: "Classifies the bailment. This is not a formality: the standard of care the custodian owes, and therefore whether they are liable for a given loss, turns on it.",
    },
    {
      key: "commencementDate",
      label: "Date custody commenced",
      type: "date",
      required: true,
      section: "Terms of custody",
      summary: true,
      help: "The date the item actually changed hands. Recorded on the day, not reconstructed later — a custody record written after a dispute begins is worth very little.",
    },
    {
      key: "expectedReturnDate",
      label: "Expected return date",
      type: "date",
      section: "Terms of custody",
      summary: true,
      help: "Always set one, even where the parties expect an indefinite arrangement. A custody with no return date is indistinguishable from a gift after a few years, and that is exactly the argument the Kingdom will face.",
    },
    {
      key: "terms",
      label: "Terms of custody",
      type: "textarea",
      section: "Terms of custody",
      help: "What the custodian may and may not do: permitted use, storage conditions, whether it may be moved, photographed, cleaned, altered, or shown. Silence is read as permission.",
    },
    {
      key: "writtenAgreementExists",
      label: "Written custody agreement signed",
      type: "boolean",
      section: "Terms of custody",
      help: "Whether a signed document exists setting out these terms. Unchecked means the Kingdom's remedy rests on recollection and on whatever a court will imply. This is the single field that most often decides whether a loss is recoverable.",
    },
    {
      key: "agreementRef",
      label: "Agreement in the Register of Agreements",
      type: "recordRef",
      refRegistry: "agreements",
      section: "Terms of custody",
      help: "Where a formal contract governs — a storage lease, a loan agreement, an escrow instruction — record it there and link it here, so the terms are one document rather than two summaries.",
    },
    {
      key: "subCustodyPermitted",
      label: "Custodian may pass the item to another",
      type: "boolean",
      section: "Terms of custody",
      help: "Whether the custodian may sub-bail — send it to a subcontractor, a shipper, or another facility. Where this is unchecked and it happens anyway, the custodian is generally answerable for what follows. Where it is checked, open a record for the onward holder.",
    },
    {
      key: "releasedBy",
      label: "Released by",
      type: "person",
      section: "Terms of custody",
      help: "The officer who authorised the property to leave. Institutional property should not depart on one person's initiative, and this field is what makes that visible.",
    },

    {
      key: "insuranceResponsibility",
      label: "Who insures during custody",
      type: "select",
      section: "Insurance",
      options: [
        { value: "KINGDOM", label: "The Kingdom", help: "Confirm with the carrier that the policy actually covers property away from scheduled premises. Many do not, or do so only up to a small sublimit." },
        { value: "CUSTODIAN", label: "The custodian", help: "Obtain a certificate of insurance naming the Kingdom as loss payee, and check the limit against the declared value." },
        { value: "BOTH", label: "Both, coverage confirmed in writing" },
        { value: "NEITHER", label: "Neither — uninsured", help: "Sometimes the right answer for a low-value item. Never the right answer by accident. Record the decision so it is a decision." },
        { value: "UNKNOWN", label: "Not established", help: "The most common entry and the most dangerous. Resolve it before the item leaves; after a loss both carriers will point at each other." },
      ],
      help: "The gap between two policies is where property in someone else's hands is lost. Settle this before delivery, in writing.",
    },
    {
      key: "insuranceEvidenceOnFile",
      label: "Certificate of insurance obtained",
      type: "boolean",
      section: "Insurance",
      help: "Whether the Kingdom actually holds the document, not whether the custodian said they were covered. A verbal assurance of coverage is not coverage.",
    },

    {
      key: "conditionOnDelivery",
      label: "Condition on delivery",
      type: "textarea",
      section: "Condition and return",
      help: "Existing damage, wear, missing parts, and readings. Written on the day of delivery and signed by both sides where possible. This is the baseline against which any later damage claim is measured, and without it there is no claim to measure.",
    },
    {
      key: "conditionEvidenceRef",
      label: "Photographs or condition report in the Evidence Vault",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Condition and return",
      help: "Dated photographs taken at delivery, lodged where their custody chain is recorded. Five minutes of photography at handover resolves arguments that would otherwise take months.",
    },
    {
      key: "actualReturnDate",
      label: "Actual return date",
      type: "date",
      section: "Condition and return",
      help: "When the item came back into the Kingdom's own hands. Blank on a record past its expected return date is what the overdue reminder is looking for.",
    },
    {
      key: "conditionOnReturn",
      label: "Condition on return",
      type: "textarea",
      section: "Condition and return",
      help: "Inspected and recorded before any receipt is signed. Compare against the condition on delivery item by item; damage noticed a week later is damage the custodian will say happened afterwards.",
    },

    {
      key: "lossOrDamageNotes",
      label: "Loss or damage",
      type: "textarea",
      section: "Loss, claims and notes",
      help: "What happened, when it was discovered, who was notified and on what date, the insurer's claim number, and any police report number. Prompt notice is a condition of most policies, so record the notice date even where the claim itself is still unresolved.",
    },
    {
      key: "demandSentDate",
      label: "Date written demand for return sent",
      type: "date",
      section: "Loss, claims and notes",
      help: "A demand is what turns a lawful holding into a wrongful one, and the limitation period on a conversion claim generally runs from the refusal. Send it by a method that produces proof of delivery and record the date here. A demand is a letter asking for the Kingdom's property back — it is never styled as process, a lien, or an order.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Loss, claims and notes",
      classification: "OFFICERS",
      help: "Anything an officer picking this file up in two years would need and would not otherwise know.",
    },
  ],

  deadlineRules: [
    {
      id: "cus-return-due",
      title: "Property is due back from custody",
      fromField: "expectedReturnDate",
      offsetDays: -7,
      severity: "ROUTINE",
      detail:
        "Contact the custodian a week ahead, confirm the return arrangements, and either collect the item or record an agreed extension. Most non-returns are not refusals; they are arrangements nobody followed up.",
      when: (data) => !data.actualReturnDate,
    },
    {
      id: "cus-overdue-demand",
      title: "Custody overdue — send a written demand for return",
      fromField: "expectedReturnDate",
      offsetDays: 30,
      severity: "HIGH",
      detail:
        "A month past the return date with nothing back. Send a written demand with a date certain, by a method producing proof of delivery, and record the date it went. The demand is what converts a lawful holding into a wrongful one and starts the clock on a conversion claim. It is a letter requesting the Kingdom's own property — never a notice styled as a lien, levy, writ, or order, and no officer attends in person to recover it.",
      when: (data) => !data.actualReturnDate && !data.demandSentDate,
    },
    {
      id: "cus-limitation-conversion",
      title: "Three-year limitation period approaching on unreturned property",
      fromField: "expectedReturnDate",
      offsetDays: 1005,
      severity: "CRITICAL",
      authority: "Conn. Gen. Stat. § 52-577; replevin under Conn. Gen. Stat. § 52-515 et seq.",
      detail:
        "Connecticut's limitation on tort actions is three years from the act or omission complained of, and roughly ninety days of that period remain measured from the date this property was due back. Refer the matter to Counsel now to decide whether to bring replevin or an action for conversion, or to close the record as a write-off by minuted decision. A claim allowed to lapse is a trust asset given away by inattention, which is a different thing from a trust asset the officers decided to release.",
      when: (data) => !data.actualReturnDate,
    },
  ],
};

export default custody;
