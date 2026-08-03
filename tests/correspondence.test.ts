import {
  toDispatchItem,
  dispatchMethod,
  DISPATCH_METHODS,
  CORRESPONDENCE_SHAPES,
  PACKET_ITEMS,
  readField,
} from "@/lib/correspondence";

/**
 * The dispatch state machine.
 *
 * This is worth testing rather than eyeballing because the whole point of the
 * board is to be trusted when it says a letter is overdue. An officer who has
 * been told twice that something is overdue when it is not will stop reading the
 * board, and the one time it matters they will miss it.
 *
 * The distinction the tests are really pinning down is SENT versus DELIVERED.
 * Officers reliably conflate the two, and only some dispatch methods survive a
 * recipient saying "we never received it".
 */

let pass = 0, fail = 0;
const ok = (name: string, condition: boolean) => {
  condition ? pass++ : fail++;
  if (!condition) console.log("  FAIL:", name);
};

const DAY = 86_400_000;
const iso = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);

function item(
  data: Record<string, unknown>,
  status = "SENT",
  registry = "government-contacts",
) {
  return toDispatchItem({
    id: "r1",
    recordNumber: "AK-G2G-000001",
    registry,
    title: "Test",
    status,
    data: JSON.stringify(data),
  });
}

// --- registers that are not correspondence are refused ----------------------
ok(
  "a deed is not rendered as correspondence",
  item({}, "FILED", "real-property") === null,
);
ok(
  "government-contacts is correspondence",
  item({}, "SENT", "government-contacts") !== null,
);
ok("notices is correspondence", item({}, "SENT", "notices") !== null);

// --- the sent / delivered distinction ---------------------------------------
{
  // Certified mail with a return receipt, sent, no delivery recorded yet.
  const strong = item({ contactDate: iso(-3), mode: "CERTIFIED_RETURN_RECEIPT" });
  ok(
    "sent by a proving method, awaiting reply",
    strong?.state === "AWAITING_REPLY",
  );
  ok(
    "and is nudged to record the delivery receipt",
    Boolean(strong?.proofWarning?.includes("record the delivery date")),
  );

  // Ordinary mail: sent, but nothing establishes arrival.
  const weak = item({ contactDate: iso(-3), mode: "ORDINARY_MAIL" });
  ok("sent by a non-proving method is flagged unproven", weak?.state === "SENT_UNPROVEN");
}

{
  // Once delivery is recorded, the method no longer matters.
  const delivered = item({
    dateSent: iso(-10),
    dateDelivered: iso(-7),
    methodOfService: "ORDINARY_MAIL",
  }, "SENT", "notices");
  ok("a recorded delivery date beats a weak method", delivered?.state === "DELIVERED");
}

// --- overdue ----------------------------------------------------------------
{
  const overdue = item({
    dateSent: iso(-40),
    dateDelivered: iso(-38),
    responseDueDate: iso(-9),
    methodOfService: "CERTIFIED_RETURN_RECEIPT",
  }, "SENT", "notices");
  ok("a passed reply date is overdue", overdue?.state === "OVERDUE");
  ok("and counts the days", overdue?.overdueBy === 9);
}

{
  const notYet = item({
    dateSent: iso(-2),
    dateDelivered: iso(-1),
    responseDueDate: iso(+12),
    methodOfService: "CERTIFIED_RETURN_RECEIPT",
  }, "SENT", "notices");
  ok("a future reply date is not overdue", notYet?.state === "DELIVERED");
  ok("and reports no overdue count", notYet?.overdueBy === null);
}

{
  // Overdue must win even where delivery was never proven — the clock ran
  // regardless of whether the Kingdom can prove arrival.
  const overdueUnproven = item({ contactDate: iso(-30), mode: "EMAIL", followUpDate: iso(-5) });
  ok("overdue outranks unproven delivery", overdueUnproven?.state === "OVERDUE");
}

// --- the proof warning that matters -----------------------------------------
{
  const risky = item({ contactDate: iso(-1), mode: "EMAIL", followUpDate: iso(+14) });
  ok(
    "a deadline riding on email is warned about",
    Boolean(risky?.proofWarning?.includes("re-send")),
  );
}
{
  const routine = item({ contactDate: iso(-1), mode: "EMAIL" });
  ok(
    "email with no deadline attached is not warned about",
    routine?.proofWarning === null,
  );
}

// --- terminal states are respected ------------------------------------------
{
  const answered = item({ contactDate: iso(-20), mode: "CERTIFIED_RETURN_RECEIPT", followUpDate: iso(-3) }, "RESPONDED");
  ok("an answered entry is not reported overdue", answered?.state === "ANSWERED");
}
{
  const closed = item({ contactDate: iso(-60), mode: "CERTIFIED_RETURN_RECEIPT", followUpDate: iso(-30) }, "NO_RESPONSE");
  ok("a closed-unanswered entry is terminal", closed?.state === "CLOSED_UNANSWERED");
}
{
  const draft = item({}, "PREPARED");
  ok("a prepared entry with no send date is a draft", draft?.state === "DRAFT");
  const ready = item({ contactDate: iso(+2) }, "PREPARED");
  ok("a prepared entry with a send date is ready to go", ready?.state === "AWAITING_DISPATCH");
}

// --- malformed data must not crash the board --------------------------------
{
  ok("unparseable data yields an item, not a throw", item({}) !== null);
  const bad = toDispatchItem({
    id: "r2", recordNumber: "AK-G2G-000002", registry: "government-contacts",
    title: "Bad", status: "SENT", data: "not json at all",
  });
  ok("unparseable JSON degrades to a draft rather than throwing", bad?.state === "DRAFT");
  const badDate = item({ contactDate: "not-a-date", mode: "EMAIL" });
  ok("an unparseable date is treated as absent", badDate?.state === "DRAFT");
  const arrayValue = item({ contactDate: iso(-1), mode: "EMAIL", subject: ["a", "b"] });
  ok("an array field is joined rather than stringified as an object", arrayValue?.subject === "a, b");
}

// --- the method table -------------------------------------------------------
ok("every method has a distinct value", new Set(DISPATCH_METHODS.map((m) => m.value)).size === DISPATCH_METHODS.length);
ok("every method states what it proves", DISPATCH_METHODS.every((m) => m.proves.length > 20));
ok("every method states where it fails", DISPATCH_METHODS.every((m) => m.limitation.length > 20));
ok("weights are within range", DISPATCH_METHODS.every((m) => m.weight >= 1 && m.weight <= 5));
ok(
  "certified mail with return receipt is the strongest",
  Math.max(...DISPATCH_METHODS.map((m) => m.weight)) ===
    (dispatchMethod("CERTIFIED_RETURN_RECEIPT")?.weight ?? 0),
);
ok(
  "ordinary mail and bare email are the weakest",
  dispatchMethod("ORDINARY_MAIL")?.weight === 1 && dispatchMethod("EMAIL")?.weight === 1,
);
ok("an unknown method resolves to undefined", dispatchMethod("TELEPATHY") === undefined);

// --- shapes point at real registers -----------------------------------------
ok(
  "no correspondence shape is declared twice",
  new Set(CORRESPONDENCE_SHAPES.map((s) => s.registry)).size === CORRESPONDENCE_SHAPES.length,
);
ok(
  "every shape names a subject and a body field",
  CORRESPONDENCE_SHAPES.every((s) => s.subject.length > 0 && s.content.length > 0),
);

// --- readField --------------------------------------------------------------
ok("readField returns null for an absent key", readField({}, "nope") === null);
ok("readField returns null for an undefined key", readField({ a: 1 }, undefined) === null);
ok("readField returns null for an empty string", readField({ a: "" }, "a") === null);
ok("readField stringifies a number", readField({ a: 42 }, "a") === "42");

// --- the standing packet ----------------------------------------------------
ok("packet keys are unique", new Set(PACKET_ITEMS.map((i) => i.key)).size === PACKET_ITEMS.length);
ok(
  "every packet item says what it proves and what its absence signals",
  PACKET_ITEMS.every((i) => i.proves.length > 20 && i.ifAbsent.length > 20),
);
ok("every packet item belongs to at least one recipient variant", PACKET_ITEMS.every((i) => i.variants.length > 0));
ok(
  "each recipient variant has essential items",
  (["POLICE", "LAND_USE", "LEGISLATOR", "AGENCY", "GRANTMAKER"] as const).every((v) =>
    PACKET_ITEMS.some((i) => i.essential && (i.variants as readonly string[]).includes(v)),
  ),
);

console.log(`correspondence: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
