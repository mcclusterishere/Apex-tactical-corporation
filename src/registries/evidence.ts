import type { RegistryDef } from "@/registries/types";

/**
 * The Evidence Vault and Chain of Custody.
 *
 * Material is only worth what it can be authenticated to. This register exists
 * so that every item the Kingdom may one day offer in a proceeding carries the
 * one thing no later effort can manufacture: a contemporaneous account of who
 * took it, when, from where, and everyone who has held it since. It is also the
 * Kingdom's spoliation defence, which is why entries are made on collection and
 * never edited afterwards.
 */

const evidence: RegistryDef = {
  slug: "evidence",
  title: "Evidence Vault and Chain of Custody",
  shortTitle: "Evidence Vault",
  recordLabel: "Item",
  recordLabelPlural: "Items",
  group: "evidence",
  numberPrefix: "EVD",
  order: 1,
  authority: "Charter Art. IV §5 (Adjudicative Powers); Fed. R. Evid. 901, 1002-1003",
  description:
    "Every item collected for use in a proceeding, with the custody record that makes it usable and the preservation record that protects it.",
  guidance: `An item of evidence is not admissible because it is true. It is admissible because someone can establish that it is what it is claimed to be. Under **Federal Rule of Evidence 901(a)** the proponent must produce evidence sufficient to support a finding that the item is what the proponent says it is, and the ordinary way to do that — Rule 901(b)(1) — is testimony from a witness with knowledge. In practice that means the person who collected the item stands up and says so, and an unbroken custody record supports them. Everything on this form exists to make that testimony possible from a person who did the work eighteen months ago and no longer remembers the afternoon.

**Authentication and hearsay are different objections and they are answered differently.** Authentication asks whether the thing is genuine. Hearsay asks whether an out-of-court statement inside it may be offered for its truth. A screenshot of a defamatory post can be perfectly authenticated and still be excluded as hearsay if offered to prove the fact asserted — or admitted without difficulty if offered to prove that the statement was published, which is usually the point. This vault answers the first objection only. Counsel answers the second.

**Screenshots are weak alone and strong in company.** A bare image proves almost nothing; anyone can produce one. Capture five things together and the item becomes hard to attack: the collector's contemporaneous note describing what they did, the **complete URL** including any query string, the system clock and time zone at capture, an **independent archival capture** taken the same day by a third-party service, and the file's cryptographic digest recorded before the file is moved anywhere. Web pages change and are deleted; the independent capture is what survives an argument that the page never said that.

**Originals are preserved and never annotated.** Work only from copies. Do not crop, rotate, convert, re-save, or write on the item you received — the file's own metadata is part of the evidence, and a re-saved copy will not match its recorded digest. Under Rule 1002 the original is generally required for a writing, recording, or photograph, though Rule 1003 admits a duplicate unless a genuine question is raised about authenticity. Keep the original in a sealed location, record where it is, and log every transfer of possession as it happens rather than reconstructing the log later.

**The duty to preserve attaches when litigation is reasonably anticipated** — not when suit is filed, and not when counsel is retained. From that moment, routine deletion, device replacement, account closure, and letting a subscription lapse all become spoliation. Where electronically stored information is lost because reasonable steps were not taken, **Fed. R. Civ. P. 37(e)** permits curative measures, and on a finding that a party acted with intent to deprive another of the information, an adverse-inference instruction or dismissal. That instruction loses cases the facts would have won. The legal hold facility in this system exists for exactly this. Issue holds **early and generously**: an over-broad hold costs storage, and a late one costs the case.`,
  defaultClassification: "OFFICERS",
  defaultStatus: "COLLECTED",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "COUNSEL"],
  titleField: "itemDescription",
  listColumns: ["evidenceType", "collector", "collectedDate", "relatedMatter"],

  statuses: [
    {
      value: "COLLECTED",
      label: "Collected",
      tone: "active",
      help: "Logged into the vault. Custody is running from this point and every transfer must be recorded.",
    },
    {
      value: "VERIFIED",
      label: "Verified",
      tone: "success",
      help: "Digest recomputed and matched, and the collector's authenticating declaration is on file.",
    },
    {
      value: "UNDER_HOLD",
      label: "Under legal hold",
      tone: "warning",
      help: "A preservation duty is live. Nothing here may be deleted, overwritten, or allowed to lapse until the Sovereign releases the hold in writing.",
    },
    { value: "PRODUCED", label: "Produced in a proceeding", tone: "active" },
    {
      value: "RETURNED",
      label: "Returned to source",
      tone: "neutral",
      help: "Physical item handed back. Record to whom and when, and retain a photographic record and the digest before release.",
    },
    {
      value: "RELEASED",
      label: "Hold released",
      tone: "neutral",
      help: "The preservation duty has ended by written release. Ordinary retention now governs.",
    },
    {
      value: "DISPOSED",
      label: "Disposed",
      tone: "neutral",
      help: "Destroyed or deleted under an approved retention schedule. Permitted only after a hold has been released in writing.",
    },
    {
      value: "MISSING",
      label: "Missing or custody broken",
      tone: "danger",
      help: "Record this honestly and immediately. A disclosed gap can be explained; a concealed one is spoliation.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    {
      key: "itemDescription",
      label: "Item",
      type: "text",
      required: true,
      section: "Identification",
      summary: true,
      help: "A short neutral description a stranger could match to the physical or digital item without opening it. Describe, do not characterise: \"email from R. Adams, 14 March 2026, subject line 'our talk'\", not \"the threatening email\".",
    },
    {
      key: "evidenceType",
      label: "Type of item",
      type: "select",
      required: true,
      section: "Identification",
      summary: true,
      options: [
        { value: "DOCUMENT", label: "Document" },
        { value: "PHOTOGRAPH", label: "Photograph" },
        {
          value: "SCREENSHOT",
          label: "Screenshot",
          help: "Weak standing alone. Pair it with the full URL, the collector's note, and an independent archival capture.",
        },
        { value: "VIDEO", label: "Video recording" },
        {
          value: "AUDIO",
          label: "Audio recording",
          help: "Connecticut requires the consent of all parties to record a private telephone conversation (Conn. Gen. Stat. § 52-570d). Confirm consent before collecting, not after.",
        },
        { value: "PHYSICAL_OBJECT", label: "Physical object" },
        {
          value: "WEB_CAPTURE",
          label: "Web capture",
          help: "A saved page, PDF print, or archival snapshot rather than an image of the screen.",
        },
        { value: "CORRESPONDENCE", label: "Correspondence" },
        {
          value: "DEVICE",
          label: "Device or storage medium",
          help: "Preserve the device intact. Do not browse it; forensic examination of a working copy is the only handling that leaves the evidence usable.",
        },
        {
          value: "TESTIMONY",
          label: "Statement or testimony",
          help: "A signed written statement or recorded interview. Note that the statement itself is usually hearsay; its value is often in impeachment or in what it shows the speaker knew.",
        },
      ],
    },
    {
      key: "factOffered",
      label: "What this item tends to prove",
      type: "textarea",
      section: "Identification",
      help: "The proposition this item supports, in one sentence. Written now, it tells counsel two years later why the item was kept and whether it is still needed.",
    },
    {
      key: "source",
      label: "Source",
      type: "text",
      required: true,
      section: "Identification",
      help: "The person, account, website, agency, or premises the item came from. Where a person handed it over, name them: they may have to be called.",
    },
    {
      key: "sourceUrl",
      label: "Full source URL",
      type: "url",
      section: "Identification",
      help: "The complete address including protocol, subdomain, path, and query string — not the site's home page. A truncated URL cannot be checked against the archival capture and invites the argument that the page was never located where the Kingdom says it was.",
    },

    {
      key: "howObtained",
      label: "How obtained",
      type: "select",
      required: true,
      section: "Acquisition",
      options: [
        {
          value: "RECEIVED_FROM",
          label: "Received from a person",
          help: "Custody begins with them, not with the Kingdom. Record who they are and how they came to have it.",
        },
        { value: "COLLECTED_BY", label: "Collected in person by an officer" },
        { value: "DOWNLOADED", label: "Downloaded from a public source" },
        { value: "PHOTOGRAPHED", label: "Photographed or recorded by an officer" },
        { value: "PURCHASED", label: "Purchased", help: "Keep the receipt; it dates the acquisition independently." },
        {
          value: "PRODUCED_IN_DISCOVERY",
          label: "Produced in discovery",
          help: "Note any protective order governing it. Material produced under a protective order may not be used outside the proceeding, and misuse is contempt.",
        },
      ],
    },
    {
      key: "collector",
      label: "Collector",
      type: "person",
      required: true,
      section: "Acquisition",
      summary: true,
      help: "The individual who personally performed the act of collection. This is the witness who will authenticate the item under Fed. R. Evid. 901(b)(1). Name one human being, never an office or a department.",
    },
    {
      key: "collectedDate",
      label: "Date collected",
      type: "date",
      required: true,
      section: "Acquisition",
      summary: true,
      help: "The date of the act of collection, not the date of the underlying event and not the date this entry was typed.",
    },
    {
      key: "collectedTime",
      label: "Time collected, with time zone",
      type: "text",
      section: "Acquisition",
      placeholder: "e.g. 14:32 EDT (UTC-4), device clock verified against time.gov",
      help: "For anything captured from a screen, the system clock matters: it appears in the capture and must agree with this entry. Note the zone explicitly and say whether the clock was checked against an external source.",
    },
    {
      key: "placeCollected",
      label: "Place collected",
      type: "text",
      section: "Acquisition",
      help: "Physical address, or the device and network for a digital capture. Establishes that the collector was in a position to observe what they say they observed.",
    },
    {
      key: "collectorNote",
      label: "Collector's contemporaneous note",
      type: "textarea",
      section: "Acquisition",
      help: "Written the same day, in the collector's own words: what they did, what they saw, what equipment and software they used, and anything unusual. This is the single most valuable field on the form. A note written at the time is evidence; a recollection written later is an argument.",
    },

    {
      key: "originalMediaDescription",
      label: "Original media",
      type: "textarea",
      section: "Original and integrity",
      help: "What the original actually is — the paper document, the phone the photograph was taken on, the exported .eml with full headers, the card the video was recorded to. Under Fed. R. Evid. 1002 the original is generally required; a duplicate is admissible under Rule 1003 only while no genuine question of authenticity is raised.",
    },
    {
      key: "originalRetained",
      label: "The original is retained unaltered",
      type: "boolean",
      section: "Original and integrity",
      help: "Unchecked means the Kingdom holds only a copy. That is survivable if recorded honestly and fatal if discovered later. Never edit, crop, convert, or re-save an original: work from copies and leave the original untouched.",
    },
    {
      key: "originalLocation",
      label: "Where the original is held",
      type: "text",
      section: "Original and integrity",
      classification: "OFFICERS",
      help: "The safe, box, drive, or account, specifically enough that a successor could retrieve it without asking anyone.",
    },
    {
      key: "workingCopyLocation",
      label: "Where the working copy is held",
      type: "text",
      section: "Original and integrity",
      help: "All review, redaction, annotation, and production happens against this copy. If a working copy is corrupted it is regenerated from the original, never the reverse.",
    },
    {
      key: "digest",
      label: "Cryptographic digest of the file",
      type: "text",
      section: "Original and integrity",
      placeholder: "sha256:e3b0c44298fc1c149afbf4c8996fb924...",
      help: "Compute a SHA-256 digest before the file is moved or renamed and record the algorithm with the value. Recomputing it later proves the bytes have not changed since collection, which is a far stronger answer to a tampering allegation than anyone's assurance.",
    },
    {
      key: "independentCapture",
      label: "Independent archival capture",
      type: "text",
      section: "Original and integrity",
      help: "A third-party snapshot of the same material taken the same day — an Internet Archive capture, a notarised or timestamped capture service, a certified mail copy. Record the service and the capture URL or reference. Its value is that the Kingdom does not control it.",
    },

    {
      key: "authenticationDeclarationOnFile",
      label: "Collector's authenticating declaration is signed and on file",
      type: "boolean",
      section: "Custody and control",
      help: "A short signed statement by the collector describing the collection, executed while the events are fresh. If the collector later becomes unavailable, this declaration and the custody log are what remain.",
    },
    {
      key: "currentCustodian",
      label: "Current custodian",
      type: "person",
      section: "Custody and control",
      help: "Who holds the item today and answers for it. One named person at a time.",
    },
    {
      key: "custodyLog",
      label: "Custody log",
      type: "textarea",
      section: "Custody and control",
      help: "One dated line per transfer: date, time, from whom, to whom, purpose, condition on receipt. Append as transfers occur; never rewrite the history. A gap that is disclosed goes to weight; a gap that is discovered goes to credibility.",
    },
    {
      key: "sealStatus",
      label: "Seal and handling restriction",
      type: "select",
      section: "Custody and control",
      options: [
        { value: "UNSEALED", label: "Unsealed — ordinary officer access" },
        { value: "SEALED_INTERNAL", label: "Sealed by order of the Sovereign" },
        {
          value: "PROTECTIVE_ORDER",
          label: "Subject to a court protective order",
          help: "Handling is governed by the order, which overrides internal policy. Record the case and the order's date.",
        },
        {
          value: "CULTURAL_PROTOCOL",
          label: "Restricted under cultural or ceremonial protocol",
          help: "Cross-reference the Cultural Heritage register. Protocol restrictions bind the Kingdom internally; they are not a ground to withhold material from a court.",
        },
        {
          value: "MINOR_OR_HEALTH",
          label: "Contains data of a minor or health information",
          help: "Highest handling. Redact the working copy before any disclosure and keep the unredacted original sealed.",
        },
      ],
    },
    {
      key: "preservationDutyDate",
      label: "Date the preservation duty attached",
      type: "date",
      section: "Custody and control",
      help: "The date litigation or a proceeding first became reasonably anticipated — commonly the date of a demand letter, a threat to sue, or the Kingdom's own decision to pursue a matter. From this date forward, routine deletion is spoliation. If in doubt, enter the earlier date and issue a legal hold.",
    },
    {
      key: "relatedMatter",
      label: "Related matter",
      type: "recordRef",
      refRegistry: "enforcement",
      section: "Custody and control",
      summary: true,
      help: "The docket entry this item was collected for, so the matter shows its full evidentiary base in one place. Material collected before any matter is opened is still logged here; link it when the matter opens.",
    },

    {
      key: "producedIn",
      label: "Proceedings in which this item has been produced",
      type: "textarea",
      section: "Proceedings",
      help: "Court or tribunal, case number, date of production, Bates or exhibit numbers, and the party to whom it went. Producing the same item twice under different numbers is how inconsistencies are manufactured by opposing counsel.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Proceedings",
      classification: "SEALED",
      help: "Counsel's assessment, weaknesses, and open questions. Assume this may be reached in discovery notwithstanding any privilege claim, and write accordingly.",
    },
  ],

  deadlineRules: [
    {
      id: "evd-independent-capture",
      title: "Independent archival capture not yet obtained",
      fromField: "collectedDate",
      offsetDays: 3,
      severity: "HIGH",
      detail:
        "Web material is edited and deleted without notice. Obtain a third-party archival snapshot now, while the page still exists, and record the capture reference. Once the page is gone the Kingdom is left arguing from its own screenshot alone.",
      when: (data) =>
        (data.evidenceType === "SCREENSHOT" ||
          data.evidenceType === "WEB_CAPTURE" ||
          data.evidenceType === "DOCUMENT") &&
        !data.independentCapture,
    },
    {
      id: "evd-collector-declaration",
      title: "Collector's authenticating declaration outstanding",
      fromField: "collectedDate",
      offsetDays: 30,
      severity: "HIGH",
      authority: "Fed. R. Evid. 901(b)(1)",
      detail:
        "Thirty days is an internal practice deadline, not a rule of court; the authentication requirement it serves is not optional. Take the declaration while the collector still remembers the day. Collectors leave, fall out with the institution, and die.",
      when: (data) => !data.authenticationDeclarationOnFile,
    },
    {
      id: "evd-digest-absent",
      title: "No digest recorded for a digital item",
      fromField: "collectedDate",
      offsetDays: 7,
      severity: "ROUTINE",
      detail:
        "Compute and record a SHA-256 digest of the original. A digest taken now still proves integrity from this date forward; one never taken proves nothing at all.",
      when: (data) =>
        data.evidenceType !== "PHYSICAL_OBJECT" &&
        data.evidenceType !== "TESTIMONY" &&
        !data.digest,
    },
    {
      id: "evd-hold-review",
      title: "Annual review of the preservation hold",
      fromField: "preservationDutyDate",
      offsetDays: 365,
      severity: "ROUTINE",
      authority: "Fed. R. Civ. P. 37(e)",
      detail:
        "Confirm the hold is still in force, that its scope still matches the matter, and that no custodian has left, changed devices, or closed an account since it issued. Holds fail quietly, through turnover and expiring subscriptions, far more often than through anyone deciding to destroy something.",
    },
  ],
};

export default evidence;
