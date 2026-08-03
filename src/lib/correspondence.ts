import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/canonical";
import { getRegistry } from "@/registries";

/**
 * Outbound correspondence with outside government.
 *
 * The premise of this module, stated once because every design decision below
 * follows from it:
 *
 *   An outside public office triages incoming mail into three piles. The action
 *   pile is correspondence from a represented institution making a specific,
 *   lawful request with an authority obliging an answer. The courtesy pile is
 *   everything else that is polite. The third pile is correspondence asserting
 *   sovereignty, immunity, or that the recipient lacks jurisdiction, and nothing
 *   in it is ever answered on the merits.
 *
 * What moves a letter into the first pile is form, not force: a fixed return
 * address, a reference number, a named liaison who does not change, counsel
 * where the matter is adverse, a specific request, and proof of delivery. All of
 * which this module exists to produce.
 *
 * What this module will never produce is anything styled as process — a
 * summons, a subpoena, a warrant, a lien, a levy, a notice of default. Those
 * convert an institution with real grievances into a criminal defendant. See
 * 18 U.S.C. § 1521 and Conn. Gen. Stat. §§ 53a-130, 53a-137 et seq.
 */

/**
 * How a communication was dispatched, and — the part that matters — what each
 * method actually PROVES if the recipient later says they never received it.
 *
 * Officers reliably conflate "I sent it" with "they got it". Only some of these
 * survive that challenge, and the cheap ones mostly do not.
 */
export interface DispatchMethod {
  value: string;
  label: string;
  /** What a tribunal would accept this as evidence of. */
  proves: string;
  /** Where it fails. */
  limitation: string;
  /** Ranked evidential weight, 1 (weakest) to 5. */
  weight: 1 | 2 | 3 | 4 | 5;
}

export const DISPATCH_METHODS: readonly DispatchMethod[] = [
  {
    value: "CERTIFIED_RETURN_RECEIPT",
    label: "Certified mail, return receipt requested",
    proves:
      "That an item was delivered to the address on a date, and — with the green card or the electronic equivalent — who signed for it.",
    limitation:
      "Proves delivery of an envelope, not of its contents. Keep a dated copy of exactly what went in, and record its digest here.",
    weight: 5,
  },
  {
    value: "COURIER_SIGNATURE",
    label: "Commercial courier, signature required",
    proves: "Delivery to the address, the signature, and a timestamp, with independent tracking.",
    limitation:
      "Some public offices refuse courier delivery or route it to a loading dock, which delays it past the person you wanted. Confirm the office accepts it.",
    weight: 4,
  },
  {
    value: "HAND_DELIVERY_ACKNOWLEDGED",
    label: "Hand delivery, receipted copy",
    proves:
      "Delivery, where the person receiving it signs and dates a duplicate copy that the Kingdom keeps.",
    limitation:
      "Worth nothing without the receipted copy. A counter clerk who declines to sign is common; ask for a date stamp on the duplicate instead, and record who declined.",
    weight: 4,
  },
  {
    value: "EFILING_PORTAL",
    label: "Statutory portal or e-filing system",
    proves: "Filing, on the system's own timestamp, which the agency cannot later dispute.",
    limitation:
      "Only where the agency operates one. Screenshot the confirmation and save the reference — portals purge.",
    weight: 4,
  },
  {
    value: "EMAIL_READ_RECEIPT",
    label: "Email, with delivery or read receipt",
    proves: "That a message left the Kingdom's server and, at best, that a client acknowledged it.",
    limitation:
      "Read receipts are advisory and routinely suppressed. Adequate for routine liaison, never adequate to start a clock or preserve a right.",
    weight: 2,
  },
  {
    value: "EMAIL",
    label: "Email",
    proves: "Almost nothing on its own, beyond the Kingdom's own copy.",
    limitation:
      "Use for scheduling and follow-up. Anything with a deadline attached goes by a method above.",
    weight: 1,
  },
  {
    value: "ORDINARY_MAIL",
    label: "Ordinary first-class mail",
    proves:
      "Nothing directly. Some contexts allow a presumption of receipt from proof of proper posting, which is weaker than it sounds and is rebuttable.",
    limitation: "Cheap and appropriate for courtesy copies. Not for anything that matters.",
    weight: 1,
  },
  {
    value: "IN_PERSON",
    label: "In person, at a meeting or public hearing",
    proves: "What the minutes say it proves, which is why you ask for it to be minuted.",
    limitation:
      "Follow up the same day in writing, reciting what was said. An unconfirmed conversation is not a record.",
    weight: 2,
  },
  {
    value: "PUBLIC_COMMENT",
    label: "Filed as public comment on a docket",
    proves: "Entry on the public record of a proceeding, on that proceeding's own timestamp.",
    limitation: "Only reaches the decision-maker if filed within the comment window.",
    weight: 3,
  },
] as const;

export function dispatchMethod(value: string | undefined | null): DispatchMethod | undefined {
  return DISPATCH_METHODS.find((method) => method.value === value);
}

/**
 * Registers whose entries are outbound or inbound communications, and can
 * therefore be rendered as a formal letter and tracked through dispatch.
 *
 * Each names the fields the letter renderer reads. Keeping this mapping in one
 * place means a new correspondence register is a data change rather than a new
 * page.
 */
export interface CorrespondenceShape {
  registry: string;
  /** Field holding the subject line. */
  subject: string;
  /** Field holding the addressee's name. */
  recipient?: string;
  /** Field holding the addressee's title. */
  recipientTitle?: string;
  /** Field holding the body or office. */
  body?: string;
  /** Field holding the postal address. */
  address?: string;
  /** Field holding the substance of the communication. */
  content: string;
  /** Field holding the date it was, or is to be, sent. */
  sentOn?: string;
  /** Field holding the dispatch method. */
  method?: string;
  /** Field holding the tracking or article number. */
  tracking?: string;
  /** Field holding the delivery date. */
  delivered?: string;
  /** Field holding the date a reply is due. */
  responseDue?: string;
  /** Field holding the signing officer. */
  signedBy?: string;
}

export const CORRESPONDENCE_SHAPES: readonly CorrespondenceShape[] = [
  {
    registry: "government-contacts",
    subject: "subject",
    recipient: "officialName",
    recipientTitle: "officialTitle",
    body: "counterpartBody",
    address: "officialContact",
    content: "summaryOfContact",
    sentOn: "contactDate",
    method: "mode",
    tracking: "deliveryEvidence",
    responseDue: "followUpDate",
    signedBy: "officerActing",
  },
  {
    registry: "notices",
    subject: "subjectSummary",
    recipient: "recipientName",
    address: "recipientAddress",
    content: "notes",
    sentOn: "dateSent",
    method: "methodOfService",
    tracking: "trackingNumber",
    delivered: "dateDelivered",
    responseDue: "responseDueDate",
    signedBy: "signedBy",
  },
  {
    registry: "records-requests",
    subject: "subject",
    content: "recordsSought",
    sentOn: "dateSubmitted",
  },
  {
    registry: "public-safety",
    subject: "subject",
    content: "whatWasReported",
    sentOn: "interactionDate",
  },
] as const;

export function correspondenceShape(registry: string): CorrespondenceShape | undefined {
  return CORRESPONDENCE_SHAPES.find((shape) => shape.registry === registry);
}

/** Read a shape's field out of a record's data, tolerating absence. */
export function readField(
  data: Record<string, unknown>,
  key: string | undefined,
): string | null {
  if (!key) return null;
  const value = data[key];
  if (value === undefined || value === null || value === "") return null;
  return Array.isArray(value) ? value.map(String).join(", ") : String(value);
}

/**
 * The state of an outbound communication, for the dispatch board.
 *
 * `OVERDUE` is the one that earns its keep. The characteristic failure in
 * dealing with a public office is not being refused — it is a letter that was
 * never answered and that nobody chased, which six months later is remembered as
 * "they ignore us" and cannot be proved. A dated, chased, still-unanswered file
 * is a fact a tribunal can act on.
 */
export type DispatchState =
  | "DRAFT"
  | "AWAITING_DISPATCH"
  | "SENT_UNPROVEN"
  | "DELIVERED"
  | "AWAITING_REPLY"
  | "OVERDUE"
  | "ANSWERED"
  | "CLOSED_UNANSWERED";

export interface DispatchItem {
  recordId: string;
  recordNumber: string;
  registry: string;
  registryTitle: string;
  title: string;
  subject: string | null;
  recipient: string | null;
  body: string | null;
  method: DispatchMethod | undefined;
  methodRaw: string | null;
  tracking: string | null;
  sentOn: Date | null;
  deliveredOn: Date | null;
  responseDue: Date | null;
  state: DispatchState;
  /** Days overdue, where the reply date has passed. */
  overdueBy: number | null;
  /** Set where the method chosen cannot prove delivery of something that matters. */
  proofWarning: string | null;
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const DAY = 86_400_000;

/**
 * Assemble the outbound board across every correspondence register.
 *
 * Classification is applied by the caller through `visibleClassifications`; this
 * function takes the records it is given and does not widen them.
 */
export function toDispatchItem(record: {
  id: string;
  recordNumber: string;
  registry: string;
  title: string;
  status: string;
  data: string;
}): DispatchItem | null {
  const shape = correspondenceShape(record.registry);
  if (!shape) return null;
  const registry = getRegistry(record.registry);
  const data = parseJson<Record<string, unknown>>(record.data, {});

  const sentOn = toDate(readField(data, shape.sentOn));
  const deliveredOn = toDate(readField(data, shape.delivered));
  const responseDue = toDate(readField(data, shape.responseDue));
  const methodRaw = readField(data, shape.method);
  const method = dispatchMethod(methodRaw ?? undefined);
  const now = Date.now();

  let state: DispatchState;
  if (record.status === "PREPARED" || record.status === "DRAFT") {
    state = sentOn ? "AWAITING_DISPATCH" : "DRAFT";
  } else if (record.status === "RESPONDED" || record.status === "ANSWERED") {
    state = "ANSWERED";
  } else if (record.status === "NO_RESPONSE") {
    state = "CLOSED_UNANSWERED";
  } else if (deliveredOn) {
    state = responseDue && responseDue.getTime() < now ? "OVERDUE" : "DELIVERED";
  } else if (sentOn) {
    // Sent, but nothing yet establishes it arrived.
    state =
      responseDue && responseDue.getTime() < now
        ? "OVERDUE"
        : method && method.weight >= 4
          ? "AWAITING_REPLY"
          : "SENT_UNPROVEN";
  } else {
    state = "DRAFT";
  }

  const overdueBy =
    responseDue && responseDue.getTime() < now
      ? Math.floor((now - responseDue.getTime()) / DAY)
      : null;

  // Warn where a deadline is riding on a method that cannot prove arrival.
  let proofWarning: string | null = null;
  if (responseDue && method && method.weight <= 2) {
    proofWarning =
      `A reply date is riding on ${method.label.toLowerCase()}, which ${method.proves.charAt(0).toLowerCase()}${method.proves.slice(1, -1)}. ` +
      "If this matters, re-send by a method that proves delivery and record the new date.";
  } else if (sentOn && !deliveredOn && method && method.weight >= 4) {
    proofWarning = "Sent by a method that produces proof of delivery — record the delivery date when the receipt arrives, or the proof is only half made.";
  }

  return {
    recordId: record.id,
    recordNumber: record.recordNumber,
    registry: record.registry,
    registryTitle: registry?.shortTitle ?? registry?.title ?? record.registry,
    title: record.title,
    subject: readField(data, shape.subject),
    recipient: readField(data, shape.recipient),
    body: readField(data, shape.body),
    method,
    methodRaw,
    tracking: readField(data, shape.tracking),
    sentOn,
    deliveredOn,
    responseDue,
    state,
    overdueBy,
    proofWarning,
  };
}

export const DISPATCH_STATE_LABELS: Record<DispatchState, string> = {
  DRAFT: "Drafted",
  AWAITING_DISPATCH: "Ready to send",
  SENT_UNPROVEN: "Sent — delivery unproven",
  DELIVERED: "Delivered",
  AWAITING_REPLY: "Awaiting reply",
  OVERDUE: "Reply overdue",
  ANSWERED: "Answered",
  CLOSED_UNANSWERED: "Closed unanswered",
};

export const DISPATCH_STATE_TONES: Record<
  DispatchState,
  "neutral" | "active" | "warning" | "danger" | "success"
> = {
  DRAFT: "neutral",
  AWAITING_DISPATCH: "active",
  SENT_UNPROVEN: "warning",
  DELIVERED: "active",
  AWAITING_REPLY: "active",
  OVERDUE: "danger",
  ANSWERED: "success",
  CLOSED_UNANSWERED: "neutral",
};

/**
 * The standing packet.
 *
 * On first contact, the recipient decides one question in about forty seconds:
 * is this a real institution, or a private person with a theory. Nothing else in
 * this system changes an outside body's behaviour as much per pound spent as
 * having these documents ready and sending the right subset.
 *
 * Each item names the register that should hold it, so the packet page can
 * report honestly what the Kingdom can actually produce today rather than what
 * it intends to.
 */
export interface PacketItem {
  key: string;
  label: string;
  /** What a recipient concludes from having it. */
  proves: string;
  /** What a recipient concludes from its absence. */
  ifAbsent: string;
  /** Register that should carry it, if any. */
  registry?: string;
  /** Which variants of the packet include it. */
  variants: readonly ("POLICE" | "LAND_USE" | "LEGISLATOR" | "AGENCY" | "GRANTMAKER")[];
  essential: boolean;
}

const ALL = ["POLICE", "LAND_USE", "LEGISLATOR", "AGENCY", "GRANTMAKER"] as const;

export const PACKET_ITEMS: readonly PacketItem[] = [
  {
    key: "standing-letter",
    label: "Statement of Institutional Standing (cover letter)",
    proves: "That a named officer of a named institution is writing, in a stated capacity, about a specific thing.",
    ifAbsent: "The reader has to work out who you are, and mostly will not.",
    variants: ALL,
    essential: true,
  },
  {
    key: "incorporation",
    label: "Certificate of incorporation or organisation, with filing number",
    proves: "That the institution is a legal person the state itself records. This is the single item that most changes how the packet is read.",
    ifAbsent: "The reader assumes an unincorporated association or an individual, and treats correspondence accordingly.",
    registry: "entities",
    variants: ALL,
    essential: true,
  },
  {
    key: "registered-agent",
    label: "Registered agent designation and address",
    proves: "That there is a fixed, lawful address for service. Agencies check this.",
    ifAbsent: "Reads as an institution that cannot be served, which is exactly the impression to avoid.",
    registry: "entities",
    variants: ALL,
    essential: true,
  },
  {
    key: "ein",
    label: "EIN confirmation (IRS CP 575 or equivalent)",
    proves: "That the institution exists to the federal government as an employer and filer.",
    ifAbsent: "Blocks banking, grants, and payroll, and invites the question in any funded interaction.",
    registry: "entities",
    variants: ["AGENCY", "GRANTMAKER", "LAND_USE"],
    essential: true,
  },
  {
    key: "tax-status",
    label: "Tax status — determination letter, or the reasoned decision not to seek one",
    proves: "Exempt status a grantmaker, bank, insurer, or assessor can rely on without taking your word for it.",
    ifAbsent:
      "A church need not apply for recognition under 26 U.S.C. § 508(c)(1)(A) — but grantmakers, banks and assessors frequently will not transact without a determination letter, so the absence is a practical obstacle even where it is a lawful one.",
    registry: "entities",
    variants: ["AGENCY", "GRANTMAKER", "LAND_USE"],
    essential: false,
  },
  {
    key: "charter",
    label: "The Charter and governing instrument",
    proves: "What the institution is, how it is governed, and by what authority the signatory signs.",
    ifAbsent: "Every question about authority to act has to be asked and answered by letter.",
    registry: "instruments",
    variants: ALL,
    essential: true,
  },
  {
    key: "officers",
    label: "Current roster of officers, with the instrument appointing each",
    proves: "That the person writing holds the office they claim, on a dated instrument.",
    ifAbsent: "Correspondence from an unnamed capacity is filed rather than actioned.",
    registry: "offices",
    variants: ALL,
    essential: true,
  },
  {
    key: "counsel",
    label: "Counsel of record — firm, attorney, juris number",
    proves:
      "That the institution is advised. The practical effect is immediate: a town attorney answers counsel and often does not answer a layperson at all.",
    ifAbsent: "Adverse matters stall, and the other side has no incentive to engage.",
    variants: ALL,
    essential: true,
  },
  {
    key: "insurance",
    label: "Certificate of insurance — general liability, and directors and officers",
    proves:
      "Solvency, seriousness, and that somebody underwrote the institution after looking at it. Pound for pound this does more for credibility than any assertion.",
    ifAbsent: "Blocks use of most public facilities and every event permit, and reads as improvised.",
    registry: "asset-register",
    variants: ["POLICE", "LAND_USE", "AGENCY", "GRANTMAKER"],
    essential: true,
  },
  {
    key: "property",
    label: "Property documentation — deed, lease, or certificate of occupancy",
    proves: "A fixed place, which for a land-use or police interaction is the whole subject matter.",
    ifAbsent: "A land-use claim without documented occupancy has nothing to attach to.",
    registry: "real-property",
    variants: ["LAND_USE", "POLICE"],
    essential: false,
  },
  {
    key: "citation",
    label: "Connecticut General Assembly Official Citation, 5 October 2025",
    proves:
      "Community contribution acknowledged by named legislators. Present it as exactly that and it helps.",
    ifAbsent: "Nothing is lost. Overstating it, however, loses the reader permanently.",
    registry: "recognitions",
    variants: ["LEGISLATOR", "LAND_USE", "GRANTMAKER"],
    essential: false,
  },
  {
    key: "beliefs",
    label: "One-page statement of beliefs and activities",
    proves: "That there is a religious purpose capable of being described, which every accommodation claim depends on.",
    ifAbsent: "A RLUIPA or Title VII claim is harder to make out, because the burden has nothing to bear on.",
    variants: ["LAND_USE", "AGENCY", "POLICE"],
    essential: false,
  },
  {
    key: "liaison",
    label: "Designation of liaison officer",
    proves: "A single point of contact who does not change, which is what makes a relationship rather than a series of letters.",
    variants: ALL,
    ifAbsent: "Each contact starts again from nothing.",
    essential: true,
  },
  {
    key: "verification",
    label: "Public verification address for the register",
    proves:
      "That the institution's own records can be checked by the recipient without the institution's cooperation. This inverts the usual posture — it invites verification instead of asserting trust — and is the most unusual item in the packet.",
    ifAbsent: "Nothing is lost, but the most distinctive thing about this institution goes unmentioned.",
    variants: ALL,
    essential: false,
  },
];

/**
 * Report what the Kingdom can actually produce for the packet today.
 *
 * Deliberately evidence-based rather than a checklist somebody ticks: an item
 * counts as held only where a live record exists in the register that should
 * carry it. A packet that claims completeness it does not have is worse than an
 * honest gap, because the gap is discovered by the recipient.
 */
export async function packetReadiness(): Promise<
  { item: PacketItem; held: boolean; recordCount: number }[]
> {
  const registries = [...new Set(PACKET_ITEMS.map((item) => item.registry).filter(Boolean))] as string[];

  const counts = new Map<string, number>();
  await Promise.all(
    registries.map(async (registry) => {
      const count = await prisma.record.count({
        where: { registry, voidedAt: null, status: { notIn: ["VOID", "SUPERSEDED"] } },
      });
      counts.set(registry, count);
    }),
  );

  return PACKET_ITEMS.map((item) => {
    const recordCount = item.registry ? (counts.get(item.registry) ?? 0) : 0;
    return { item, held: item.registry ? recordCount > 0 : false, recordCount };
  });
}
