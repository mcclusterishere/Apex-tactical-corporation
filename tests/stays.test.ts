/**
 * Apex Stays tests.
 *
 * Two families of proof. The arithmetic: the unit, the signs, the balance.
 * And the firewall: the module's exported surface must contain nothing that
 * buys, sells, redeems, or converts a Stay — the absence of those functions
 * is the legal design, so the absence is asserted like any other invariant.
 */
import * as stays from "../src/lib/stays";
import {
  NIGHTS_PER_STAY,
  formatStays,
  entrySign,
  balanceFromEntries,
  assertNights,
  StayError,
} from "../src/lib/stays";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}
function throws(name: string, fn: () => unknown) {
  try {
    fn();
    check(name, false);
  } catch (e) {
    check(name, e instanceof StayError);
  }
}

// --- The unit ---------------------------------------------------------------

check("an Apex Stay is two nights", NIGHTS_PER_STAY === 2);
check("2 nights formats as 1 Stay", formatStays(2) === "1 Stay");
check("4 nights formats as 2 Stays", formatStays(4) === "2 Stays");
check("3 nights formats as 1½ Stays", formatStays(3) === "1½ Stays");
check("1 night formats as ½ Stay", formatStays(1) === "½ Stay");
check("0 nights formats as 0 Stays", formatStays(0) === "0 Stays");

// --- Validation -------------------------------------------------------------

throws("zero nights refused", () => assertNights(0));
throws("negative nights refused", () => assertNights(-2));
throws("fractional nights refused", () => assertNights(1.5));
check("whole positive nights accepted", (assertNights(3), true));

// --- Signs and balance ------------------------------------------------------

check("EARN adds", entrySign("EARN") === 1);
check("GIFT_IN adds", entrySign("GIFT_IN") === 1);
check("ADJUST adds", entrySign("ADJUST") === 1);
check("GIFT_OUT subtracts", entrySign("GIFT_OUT") === -1);
check("SPEND subtracts", entrySign("SPEND") === -1);
throws("an unknown kind is refused, not guessed", () => entrySign("REDEEM"));

check(
  "balance sums a life of entries correctly",
  balanceFromEntries([
    { kind: "EARN", nights: 4 }, // mowed twice
    { kind: "GIFT_OUT", nights: 2 }, // sent a Stay to a cousin
    { kind: "GIFT_IN", nights: 1 },
    { kind: "SPEND", nights: 2 }, // a weekend at the zome
  ]) === 1,
);
check("empty ledger balances to zero", balanceFromEntries([]) === 0);

// A gift writes a symmetric pair: what leaves one side arrives at the other.
{
  const out = [{ kind: "GIFT_OUT", nights: 3 }];
  const into = [{ kind: "GIFT_IN", nights: 3 }];
  check(
    "a gift pair conserves nights across both ledgers",
    balanceFromEntries(out) + balanceFromEntries(into) === 0,
  );
}

// --- The firewall -----------------------------------------------------------
//
// No exported name may suggest purchase, redemption, cash, dollars, or the
// Mark. If someone adds `redeemStaysForMarks`, this test is the tripwire.
{
  const surface = Object.keys(stays);
  const forbidden = /mark|dollar|cent|cash|redeem|purchase|buy|sell|price|convert|exchange/i;
  const offenders = surface.filter((name) => forbidden.test(name));
  check(
    `no exported function touches money or the Mark (surface: ${surface.length} names)`,
    offenders.length === 0,
  );
  if (offenders.length > 0) console.error(`  offenders: ${offenders.join(", ")}`);
}

// The unit constant itself is nights, not a monetary figure.
check("the Stay is defined in nights, an integer", Number.isInteger(NIGHTS_PER_STAY));

// --- The generational loop --------------------------------------------------
//
// Proposals exist as a status: any member proposes, only a Keeper's approval
// makes the reward real, and both gates are two-person. The status list is the
// contract for that flow.
check(
  "PROPOSED precedes OPEN in the task lifecycle",
  stays.TASK_STATUSES[0] === "PROPOSED" && stays.TASK_STATUSES[1] === "OPEN",
);
check(
  "the lifecycle ends in VERIFIED or CANCELLED",
  stays.TASK_STATUSES.includes("VERIFIED") && stays.TASK_STATUSES.includes("CANCELLED"),
);
check("proposeTask and approveTask both exist",
  typeof stays.proposeTask === "function" && typeof stays.approveTask === "function");

console.log(`stays: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
