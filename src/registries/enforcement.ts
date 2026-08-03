import type { RegistryDef } from "@/registries/types";

/**
 * The Enforcement and Rights-Assertion Docket. One record per matter.
 *
 * The docket exists to keep escalation orderly and to keep it lawful. Rights
 * work fails in two ways: by moving too fast — a demand sent before the right is
 * confirmed, a threat the Kingdom will not honour — and by moving outside the
 * law, into documents styled as process. Both are recorded against here, because
 * the calendar and the ladder of escalation are what actually decide outcomes.
 */

const enforcement: RegistryDef = {
  slug: "enforcement",
  title: "Enforcement and Rights-Assertion Docket",
  shortTitle: "Enforcement",
  recordLabel: "Matter",
  recordLabelPlural: "Matters",
  group: "rights",
  numberPrefix: "ENF",
  order: 3,
  authority: "Charter Art. IV §7 (Economic Powers); Art. VI (External Relations)",
  description:
    "Every assertion of a right against an outside party, from first observation through demand, platform remedy, formal proceeding, and disposition.",
  guidance: `Open a matter the day the Kingdom decides to assert a right. Close it only when the file is genuinely finished, including costs.

**Climb the ladder in order.** Each rung costs a fraction of the one above it, and most matters end before the third.

1. **Document.** Before anyone is contacted, the conduct is captured in the Register of Encroachments and the underlying right is confirmed in the Intellectual Property Portfolio. A demand sent before ownership is verified is a demand that may have to be withdrawn, and a withdrawn demand is worth less than none.
2. **A measured demand.** Write it on the assumption that opposing counsel will read it aloud in open court, because that is what happens to demand letters. State the right, the conduct, the relief sought, and a real deadline. Do not overstate ownership or the scope of the right. **Do not threaten criminal prosecution, referral to law enforcement, or any other criminal process to obtain a civil advantage** — that is extortionate, it is an ethics violation for any lawyer who signs it, and it turns the Kingdom from claimant into defendant.
3. **Platform remedies.** Fast, free, and sufficient in the majority of matters. A DMCA notice to a provider's designated agent must contain all six elements of 17 U.S.C. § 512(c)(3)(A) — signature, identification of the work, identification of the material and its location, contact information, a good-faith-belief statement, and a statement, **under penalty of perjury**, that the sender is authorised to act. A knowingly material misrepresentation creates liability to the target for damages and fees under § 512(f), and *Lenz v. Universal Music*, 815 F.3d 1145 (9th Cir. 2016), requires considering fair use before sending. Trademark, counterfeit, and impersonation complaints run through each platform's own forms. For a domain registered and used in bad faith, the UDRP transfers the name administratively, without a lawsuit.
4. **Formal proceedings.** Opposition or cancellation before the TTAB decides registrability, not damages — a useful and comparatively cheap remedy when the real objective is to stop someone registering the Kingdom's name.
5. **Suit,** on counsel's advice and not before. Two thresholds: no civil action for infringement of a U.S. work may be instituted until the Copyright Office has registered the claim or refused registration (17 U.S.C. § 411(a); *Fourth Estate v. Wall-Street.com*, 586 U.S. 296 (2019)); and a copyright action must be commenced within three years of accrual (§ 507(b)). The Lanham Act carries no statute of limitations — laches governs, which means delay still costs.

**Never threaten what the Kingdom will not do.** An empty threat is not free. It devalues every later demand the Kingdom sends, and a recipient with a reasonable apprehension of suit may file a declaratory judgment action — placing the Kingdom in a court of the opponent's choosing, on the opponent's timetable, defending rather than prosecuting.

**The bright line.** This docket records lawful assertions of rights and nothing else. The Kingdom does not issue, and this system will not generate, any document styled as court process, a summons, a warrant, a lien, a levy, a notice of default framed as a judgment, or a law-enforcement demand against an outside party. The reason is short: it converts a strong civil position into personal criminal exposure for the officers who sign it, including under Conn. Gen. Stat. § 53a-130 and, where a federal officer is the target, 18 U.S.C. § 1521. Internal ecclesiastical discipline among consenting members is a wholly different thing and belongs in the Tribunal register.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "ASSESSING",
  restrictedTo: ["SOVEREIGN", "COUNSEL", "REGISTRAR"],
  titleField: "matterName",
  listColumns: ["respondent", "stage", "basisOfClaim", "dateFirstObserved"],

  statuses: [
    {
      value: "ASSESSING",
      label: "Under assessment",
      tone: "warning",
      help: "The right and the conduct are being verified. Nothing has been asserted to the respondent and nothing should be.",
    },
    { value: "ACTIVE", label: "Active", tone: "active" },
    {
      value: "AWAITING_RESPONSE",
      label: "Awaiting response",
      tone: "active",
      help: "A demand or notice is out and the response window is running.",
    },
    { value: "IN_PROCEEDING", label: "In formal proceeding", tone: "active" },
    {
      value: "HELD",
      label: "Held in abeyance",
      tone: "neutral",
      help: "Deliberately paused. Record why, because limitation periods and laches keep running while a matter sleeps.",
    },
    { value: "RESOLVED", label: "Resolved", tone: "success" },
    {
      value: "DECLINED",
      label: "Assessed and declined",
      tone: "neutral",
      help: "Reviewed and deliberately not pursued. A recorded decision not to act is worth keeping; it shows the docket exercises judgement.",
    },
    { value: "ABANDONED", label: "Abandoned", tone: "danger" },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "matterName",
      label: "Matter name",
      type: "text",
      required: true,
      section: "The matter",
      summary: true,
      placeholder: "e.g. Apex Kingdom v. Northgate Print Co. — seal reproduction",
      help: "Short, neutral, and specific enough to identify the matter in a list five years from now. Avoid characterisations that would be awkward if the file is produced in discovery.",
    },
    {
      key: "respondent",
      label: "Respondent",
      type: "text",
      required: true,
      section: "The matter",
      summary: true,
      help: "The correct legal name of the party — the entity, not the trading name. Suing or serving the wrong entity wastes the entire effort; check the Secretary of the State's registry before entering.",
    },
    {
      key: "respondentContact",
      label: "Respondent contact and address",
      type: "textarea",
      section: "The matter",
      help: "Registered agent, principal office, counsel if known, and platform account. Note where each came from, because service on a stale address proves nothing.",
    },
    {
      key: "respondentJurisdiction",
      label: "Respondent's jurisdiction",
      type: "jurisdiction",
      section: "The matter",
      help: "Where the respondent sits determines where they can be sued, whose law applies, and whether a foreign respondent makes the matter practically unenforceable regardless of its merits.",
    },

    {
      key: "rightAsserted",
      label: "Right asserted",
      type: "recordRef",
      refRegistry: "intellectual-property",
      required: true,
      section: "The claim",
      help: "The asset in the Portfolio that this matter is brought on. If no asset can be linked, the Kingdom is not yet in a position to assert anything.",
    },
    {
      key: "basisOfClaim",
      label: "Basis of claim",
      type: "multiselect",
      required: true,
      section: "The claim",
      summary: true,
      options: [
        { value: "COPYRIGHT", label: "Copyright infringement" },
        { value: "TRADEMARK", label: "Trademark infringement" },
        { value: "FALSE_DESIGNATION", label: "False designation of origin", help: "15 U.S.C. § 1125(a). Reaches unregistered marks and false affiliation claims." },
        { value: "DILUTION", label: "Trademark dilution", help: "15 U.S.C. § 1125(c). Requires a famous mark; rarely available to a small institution." },
        { value: "CYBERSQUATTING", label: "Cybersquatting", help: "15 U.S.C. § 1125(d), or the UDRP as an administrative alternative." },
        { value: "CONTRACT", label: "Breach of licence or contract" },
        { value: "TRADE_SECRET", label: "Trade secret misappropriation", help: "18 U.S.C. § 1836 (DTSA) and state law." },
        { value: "PUBLICITY", label: "Right of publicity" },
        { value: "IMPERSONATION", label: "Impersonation of the Kingdom or its offices" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      key: "conductDescription",
      label: "Description of the conduct",
      type: "textarea",
      required: true,
      section: "The claim",
      help: "What the respondent actually did, in factual terms, without adjectives. This paragraph tends to migrate into the demand letter and then into a pleading, so write it once as something the Kingdom could prove.",
    },
    {
      key: "dateFirstObserved",
      label: "Date the conduct was first observed",
      type: "date",
      required: true,
      section: "The claim",
      summary: true,
      help: "Starts the limitation analysis. A copyright claim must be brought within three years of accrual (17 U.S.C. § 507(b)); the Lanham Act has no fixed period but delay supports a laches defence.",
    },
    {
      key: "suitReady",
      label: "Registration on file, so suit is available",
      type: "boolean",
      section: "The claim",
      help: "For a U.S. work, no infringement action may be filed until the Copyright Office has registered or refused the claim. If this is unchecked, threatening suit is threatening something the Kingdom cannot presently do.",
    },
    {
      key: "evidenceReferences",
      label: "Evidence references",
      type: "textarea",
      section: "The claim",
      help: "Encroachment record numbers and Evidence Vault custody identifiers. A matter with no captured evidence is an assessment, not a claim.",
    },

    {
      key: "stage",
      label: "Stage",
      type: "select",
      required: true,
      section: "Escalation",
      summary: true,
      help: "The highest rung reached. Move one rung at a time; skipping rungs is how a matter that a takedown form would have ended becomes a five-figure legal bill.",
      options: [
        { value: "INVESTIGATION", label: "Investigation" },
        { value: "DEMAND_SENT", label: "Demand sent" },
        { value: "NEGOTIATION", label: "Negotiation" },
        { value: "DMCA_NOTICE", label: "DMCA notice submitted" },
        { value: "PLATFORM_COMPLAINT", label: "Platform complaint" },
        { value: "UDRP", label: "UDRP proceeding" },
        { value: "USPTO", label: "USPTO opposition or cancellation" },
        { value: "REFERRED", label: "Referred to outside counsel" },
        { value: "LITIGATION", label: "Litigation filed" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "ABANDONED", label: "Abandoned" },
      ],
    },
    {
      key: "demandSentDate",
      label: "Date demand sent",
      type: "date",
      section: "Escalation",
      help: "The day the demand was placed in the mail or transmitted, which is when the response clock starts. Record the notice itself in the Register of Notices with its digest and proof of service.",
    },
    {
      key: "counterNoticeReceivedDate",
      label: "Date DMCA counter-notice received",
      type: "date",
      section: "Escalation",
      help: "A counter-notice starts a short fuse: the provider must restore the material unless the Kingdom files suit. Entering the date arms the reminder.",
    },
    {
      key: "counselOfRecord",
      label: "Counsel of record",
      type: "person",
      section: "Escalation",
      help: "Who is actually conducting this matter. An officer of the Kingdom who is not admitted to practise cannot appear for it in court, and a non-natural person generally cannot appear pro se at all.",
    },

    {
      key: "forum",
      label: "Forum",
      type: "text",
      section: "Proceedings",
      help: "The court, panel, or platform process in which the matter sits, and why that forum was chosen.",
    },
    {
      key: "caseNumber",
      label: "Case, docket, or reference number",
      type: "text",
      section: "Proceedings",
    },
    {
      key: "reliefSought",
      label: "Relief sought",
      type: "textarea",
      section: "Proceedings",
      help: "Concretely: takedown, transfer of a domain, an accounting, destruction of inventory, a licence on terms, an acknowledgement, or damages. A demand that does not say what would end the matter cannot be accepted.",
    },

    {
      key: "settlementTerms",
      label: "Settlement terms",
      type: "textarea",
      section: "Disposition",
      help: "The operative terms as actually agreed, and whether they were reduced to a signed writing. An oral settlement is a future dispute.",
    },
    {
      key: "outcome",
      label: "Outcome",
      type: "textarea",
      section: "Disposition",
      help: "What in fact happened, including where the Kingdom's position turned out weaker than assessed. The value of this docket over time is that it records what worked.",
    },
    {
      key: "costsIncurred",
      label: "Costs incurred",
      type: "money",
      section: "Disposition",
      help: "Fees, filing costs, and service charges. Kept so the institution can see honestly what enforcement costs against what it recovers.",
    },
    {
      key: "recoveryReceived",
      label: "Recovery received",
      type: "money",
      section: "Disposition",
    },
    {
      key: "notes",
      label: "Counsel's notes",
      type: "textarea",
      section: "Disposition",
      classification: "SEALED",
      help: "Work product and candid assessment. Sealed because a frank evaluation of the Kingdom's own weaknesses is exactly what an opponent would most like to read.",
    },
  ],

  deadlineRules: [
    {
      id: "enf-demand-response",
      title: "Demand response window closed — decide the next step",
      fromField: "demandSentDate",
      offsetDays: 30,
      severity: "HIGH",
      detail:
        "Thirty days from service of the demand. Either escalate to the next rung or record a decision to hold or decline. A demand that passes its own deadline with no follow-up teaches every future recipient that the Kingdom's deadlines are not real.",
    },
    {
      id: "enf-counter-notice-window",
      title: "DMCA counter-notice fuse — material will be restored",
      fromField: "counterNoticeReceivedDate",
      offsetDays: 7,
      severity: "CRITICAL",
      authority: "17 U.S.C. § 512(g)(2)(C)",
      detail:
        "The provider must replace the removed material in not less than ten nor more than fourteen business days after receiving the counter-notice, unless it first receives notice that an action has been filed seeking to restrain the infringing activity. This reminder falls early to leave time to decide. Filing suit is the only way to stop restoration; if the Kingdom will not sue, let it restore and say nothing further.",
    },
    {
      id: "enf-copyright-limitation",
      title: "Three-year copyright limitation period approaching",
      fromField: "dateFirstObserved",
      offsetDays: 1005,
      severity: "CRITICAL",
      authority: "17 U.S.C. § 507(b)",
      detail:
        "A civil copyright action must be commenced within three years after the claim accrued. Roughly ninety days remain from this reminder. Accrual on a continuing course of infringement raises questions counsel should resolve now rather than on the eve of filing.",
      when: (data) =>
        Array.isArray(data.basisOfClaim) && (data.basisOfClaim as string[]).includes("COPYRIGHT"),
    },
  ],
};

export default enforcement;
