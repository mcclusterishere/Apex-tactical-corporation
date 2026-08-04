/**
 * Booking-engine tests.
 *
 * The overwhelming majority of these exist to prove one property: two stays
 * that share a night are refused, and two stays that merely meet at a turnover
 * are allowed. Off-by-one on that boundary is THE booking-system bug, so the
 * turnover case is tested from both sides and at the exact millisecond.
 */
import {
  intervalsOverlap,
  nightsBetween,
  parseNight,
  quote,
  BookingError,
} from "../src/lib/bookings";

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
    check(name, e instanceof BookingError);
  }
}

const d = (s: string) => parseNight(s);

// --- The overlap boundary — the whole ballgame -----------------------------

// Two stays that share nights overlap.
check(
  "identical stays overlap",
  intervalsOverlap(d("2027-03-10"), d("2027-03-15"), d("2027-03-10"), d("2027-03-15")),
);
check(
  "a stay fully inside another overlaps",
  intervalsOverlap(d("2027-03-10"), d("2027-03-20"), d("2027-03-12"), d("2027-03-14")),
);
check(
  "partial overlap at the front is caught",
  intervalsOverlap(d("2027-03-10"), d("2027-03-15"), d("2027-03-13"), d("2027-03-18")),
);
check(
  "partial overlap at the back is caught",
  intervalsOverlap(d("2027-03-13"), d("2027-03-18"), d("2027-03-10"), d("2027-03-15")),
);
check(
  "a one-night shared overlap is caught",
  intervalsOverlap(d("2027-03-10"), d("2027-03-12"), d("2027-03-11"), d("2027-03-13")),
);

// The turnover: A leaves the morning B arrives. NOT an overlap, from both sides.
check(
  "a turnover (A.out == B.in) is NOT an overlap",
  !intervalsOverlap(d("2027-03-10"), d("2027-03-15"), d("2027-03-15"), d("2027-03-18")),
);
check(
  "a turnover the other way (B.out == A.in) is NOT an overlap",
  !intervalsOverlap(d("2027-03-15"), d("2027-03-18"), d("2027-03-10"), d("2027-03-15")),
);

// Genuinely separate stays don't overlap.
check(
  "a gap between stays is not an overlap",
  !intervalsOverlap(d("2027-03-10"), d("2027-03-12"), d("2027-03-20"), d("2027-03-25")),
);
check(
  "one night either side of a turnover still does not overlap",
  !intervalsOverlap(d("2027-03-10"), d("2027-03-15"), d("2027-03-16"), d("2027-03-18")),
);

// Symmetry: overlap must not depend on argument order. Brute-force a grid.
{
  const dates = ["2027-03-10", "2027-03-11", "2027-03-12", "2027-03-13", "2027-03-14"].map(d);
  let symmetric = true;
  for (let a1 = 0; a1 < dates.length; a1++)
    for (let a2 = a1 + 1; a2 < dates.length; a2++)
      for (let b1 = 0; b1 < dates.length; b1++)
        for (let b2 = b1 + 1; b2 < dates.length; b2++) {
          const ab = intervalsOverlap(dates[a1], dates[a2], dates[b1], dates[b2]);
          const ba = intervalsOverlap(dates[b1], dates[b2], dates[a1], dates[a2]);
          if (ab !== ba) symmetric = false;
        }
  check("overlap is symmetric across every interval pair", symmetric);
}

// --- Night counting --------------------------------------------------------

check("one night counts as one", nightsBetween(d("2027-03-10"), d("2027-03-11")) === 1);
check("five nights count as five", nightsBetween(d("2027-03-10"), d("2027-03-15")) === 5);
check(
  "a stay across a month boundary counts correctly",
  nightsBetween(d("2027-03-30"), d("2027-04-02")) === 3,
);
throws("check-out before check-in is refused", () =>
  nightsBetween(d("2027-03-15"), d("2027-03-10")),
);
throws("a zero-night stay is refused", () => nightsBetween(d("2027-03-10"), d("2027-03-10")));

// --- Date parsing ----------------------------------------------------------

throws("a non-date string is refused", () => parseNight("not-a-date"));
throws("an American-format date is refused", () => parseNight("03/10/2027"));
throws("an impossible date is refused", () => parseNight("2027-13-40"));
check("a valid date parses to UTC midnight", parseNight("2027-03-10").getUTCHours() === 0);

// --- Pricing (integer cents only) ------------------------------------------

{
  const q = quote({ nightlyCents: 12000, cleaningCents: 5000, nights: 4 });
  check("total = nightly*nights + cleaning", q.totalCents === 12000 * 4 + 5000);
  check("total is 53000 cents on that quote", q.totalCents === 53000);
}
check(
  "a zero cleaning fee is fine",
  quote({ nightlyCents: 10000, cleaningCents: 0, nights: 1 }).totalCents === 10000,
);
throws("a fractional-cent rate is refused", () =>
  quote({ nightlyCents: 100.5, cleaningCents: 0, nights: 1 }),
);
throws("a negative rate is refused", () =>
  quote({ nightlyCents: -100, cleaningCents: 0, nights: 1 }),
);
throws("a zero-night quote is refused", () =>
  quote({ nightlyCents: 100, cleaningCents: 0, nights: 0 }),
);
// A long luxury stay must not silently overflow into an unsafe integer.
throws("an overflowing rate is refused", () =>
  quote({ nightlyCents: Number.MAX_SAFE_INTEGER, cleaningCents: 0, nights: 1000 }),
);

console.log(`bookings: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
