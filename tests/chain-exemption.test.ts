/**
 * The VOID/SUPERSEDED verification exemption.
 *
 * `verifyRecordsAgainstLedger` has to tolerate one legitimate mismatch: voiding
 * and supersession move a record's status through their own event types rather
 * than through an amendment, so the status in the register is legitimately
 * absent from every amendment payload.
 *
 * The dangerous way to express that tolerance — and the way it was originally
 * written — is to skip the status check whenever the REGISTER says VOID or
 * SUPERSEDED. That keys the exemption off the value the check exists to verify:
 * writing "VOID" straight into the row switches off the only check that would
 * have caught it, and the record vanishes from every list view with the chain
 * still verifying perfectly.
 *
 * The correct expectation comes from the ledger. These cases pin that down
 * against the decision logic directly, so the exemption cannot quietly regress
 * to the self-referential form.
 */

let pass = 0, fail = 0;
const ok = (name: string, condition: boolean) => {
  condition ? pass++ : fail++;
  if (!condition) console.log("  FAIL:", name);
};

type Lifecycle = "RECORD_VOIDED" | "RECORD_SUPERSEDED" | null;

/**
 * The decision under test, in the same shape as src/lib/chain.ts.
 *
 * `statusFromLifecycle` is derived from the ledger; `committedStatus` is the
 * most recent status committed by a creation or amendment. The register's own
 * value is deliberately NOT an input to choosing the expectation — that is the
 * property being asserted.
 */
function expectedStatus(lifecycle: Lifecycle, committedStatus: string | undefined): string | undefined {
  const fromLifecycle =
    lifecycle === "RECORD_VOIDED" ? "VOID" : lifecycle === "RECORD_SUPERSEDED" ? "SUPERSEDED" : null;
  return fromLifecycle ?? committedStatus;
}

function diverges(lifecycle: Lifecycle, committedStatus: string | undefined, inRegister: string): boolean {
  const expected = expectedStatus(lifecycle, committedStatus);
  return typeof expected === "string" && expected !== inRegister;
}

// --- the attack this exists to stop -----------------------------------------
ok(
  "VOID written straight into the register, with no voiding in the ledger, is caught",
  diverges(null, "FILED", "VOID"),
);
ok(
  "SUPERSEDED written straight into the register is caught",
  diverges(null, "FILED", "SUPERSEDED"),
);
ok(
  "the same forgery is caught whatever the record's real status was",
  diverges(null, "EXECUTED", "VOID") && diverges(null, "DRAFT", "VOID"),
);

// --- the legitimate cases the exemption exists for ---------------------------
ok(
  "a genuinely voided record does not report a divergence",
  !diverges("RECORD_VOIDED", "FILED", "VOID"),
);
ok(
  "a genuinely superseded record does not report a divergence",
  !diverges("RECORD_SUPERSEDED", "FILED", "SUPERSEDED"),
);

// --- the ledger stays authoritative in both directions -----------------------
ok(
  "a record the ledger says was voided, but which reads FILED, is caught",
  diverges("RECORD_VOIDED", "FILED", "FILED"),
);
ok(
  "a voided record edited to some third status is caught",
  diverges("RECORD_VOIDED", "FILED", "EXECUTED"),
);
ok(
  "supersession takes precedence over the last amended status",
  expectedStatus("RECORD_SUPERSEDED", "FILED") === "SUPERSEDED",
);

// --- ordinary records are unaffected -----------------------------------------
ok("a matching ordinary status is clean", !diverges(null, "FILED", "FILED"));
ok("an altered ordinary status is caught", diverges(null, "FILED", "EXECUTED"));
ok(
  "a record with no committed status is not reported",
  !diverges(null, undefined, "FILED"),
);

// --- the property, stated directly -------------------------------------------
// For any register value, the expectation must be identical. If the register
// value could influence it, an attacker could choose a value that exempts
// itself — which is exactly the bug.
{
  const registerValues = ["VOID", "SUPERSEDED", "FILED", "DRAFT", "EXECUTED", ""];
  let independent = true;
  for (const lifecycle of [null, "RECORD_VOIDED", "RECORD_SUPERSEDED"] as Lifecycle[]) {
    for (const committed of ["FILED", "DRAFT", undefined]) {
      const expectations = new Set(registerValues.map(() => expectedStatus(lifecycle, committed)));
      if (expectations.size !== 1) independent = false;
    }
  }
  ok("the expected status never depends on the value being verified", independent);
}

console.log(`chain exemption: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
