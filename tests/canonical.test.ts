import { canonicalise } from "@/lib/canonical";
import { parseMoney, formatCents, isDebitNormal, validateJournal, TreasuryError } from "@/lib/treasury";

let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => { c ? pass++ : fail++; if (!c) console.log("  FAIL:", n); };
const throws = (n: string, fn: () => unknown) => {
  try { fn(); fail++; console.log("  FAIL (should have thrown):", n); }
  catch { pass++; }
};

// --- canonical JSON: determinism and injectivity -------------------------
ok("key order irrelevant",
  canonicalise({ b: 1, a: 2 }) === canonicalise({ a: 2, b: 1 }));
ok("nested key order irrelevant",
  canonicalise({ x: { q: 1, p: 2 } }) === canonicalise({ x: { p: 2, q: 1 } }));
ok("undefined dropped, null kept",
  canonicalise({ a: undefined, b: null }) === '{"b":null}');
ok("-0 and 0 hash the same", canonicalise(-0) === canonicalise(0));
ok("array order significant",
  canonicalise([1, 2]) !== canonicalise([2, 1]));
ok("string vs number distinct",
  canonicalise({ a: "1" }) !== canonicalise({ a: 1 }));
ok("unicode preserved",
  JSON.parse(canonicalise({ a: "Ω≈ç√" })).a === "Ω≈ç√");
throws("non-finite rejected", () => canonicalise(NaN as unknown as number));
throws("Infinity rejected", () => canonicalise(Infinity as unknown as number));
ok("date -> ISO", canonicalise(new Date(0)) === '"1970-01-01T00:00:00.000Z"');
// Injectivity: two different structures must not collide
ok("no {a:1} / 'a:1' collision", canonicalise({ a: 1 }) !== canonicalise('{"a":1}'));
ok("empty object vs empty array", canonicalise({}) !== canonicalise([]));
// Stability across a JSON round trip (what happens on a DB read)
{
  const v = { z: [1, { m: "x", a: null }], a: "text" };
  ok("stable across round trip",
    canonicalise(v) === canonicalise(JSON.parse(JSON.stringify(v))));
}

// --- money: no float drift ----------------------------------------------
ok("parseMoney 12.34", parseMoney("12.34") === 1234);
ok("parseMoney $1,234.56", parseMoney("$1,234.56") === 123456);
ok("parseMoney 8.075 rejected (2dp max)", (() => { try { parseMoney("8.075"); return false; } catch { return true; } })());
ok("parseMoney 0.07", parseMoney("0.07") === 7);
ok("parseMoney 100", parseMoney("100") === 10000);
ok("parseMoney .5 rejected", (() => { try { parseMoney(".5"); return false; } catch { return true; } })());
ok("negative parses", parseMoney("-5.00") === -500);
throws("garbage rejected", () => parseMoney("abc"));
throws("1e10 notation rejected", () => parseMoney("1e10"));
// Round trip through format and back for a spread of awkward values
for (const cents of [1, 7, 99, 100, 101, 999, 1000, 123456789, 5]) {
  const s = formatCents(cents).replace(/[(),]/g, "");
  ok(`money round trip ${cents}`, parseMoney(s) === cents);
}

// --- accounting invariants ----------------------------------------------
ok("assets debit-normal", isDebitNormal("ASSET"));
ok("expenses debit-normal", isDebitNormal("EXPENSE"));
ok("revenue credit-normal", !isDebitNormal("REVENUE"));
ok("liabilities credit-normal", !isDebitNormal("LIABILITY"));
ok("net assets credit-normal", !isDebitNormal("NET_ASSETS"));

const goodJournal = {
  date: "2026-01-15", memo: "Tithe received",
  postings: [
    { accountCode: "1000", debitCents: 50000 },
    { accountCode: "4000", creditCents: 50000 },
  ],
};
ok("balanced entry validates", validateJournal(goodJournal).totalDebits === 50000);
throws("unbalanced rejected", () => validateJournal({
  ...goodJournal,
  postings: [{ accountCode: "1000", debitCents: 50000 }, { accountCode: "4000", creditCents: 49900 }],
}));
throws("single-sided rejected", () => validateJournal({
  ...goodJournal, postings: [{ accountCode: "1000", debitCents: 50000 }],
}));
throws("negative amount rejected", () => validateJournal({
  ...goodJournal,
  postings: [{ accountCode: "1000", debitCents: -100 }, { accountCode: "4000", creditCents: -100 }],
}));
throws("both sides on one line rejected", () => validateJournal({
  ...goodJournal,
  postings: [{ accountCode: "1000", debitCents: 100, creditCents: 100 }, { accountCode: "4000", creditCents: 100 }],
}));
throws("zero-amount line rejected", () => validateJournal({
  ...goodJournal,
  postings: [{ accountCode: "1000", debitCents: 0 }, { accountCode: "4000", creditCents: 0 }],
}));
throws("missing memo rejected", () => validateJournal({ ...goodJournal, memo: "  " }));
throws("bad date rejected", () => validateJournal({ ...goodJournal, date: "15/01/2026" }));
throws("fractional cents rejected", () => validateJournal({
  ...goodJournal,
  postings: [{ accountCode: "1000", debitCents: 100.5 }, { accountCode: "4000", creditCents: 100.5 }],
}));
// A multi-line entry that balances across several accounts
ok("multi-line balances", validateJournal({
  date: "2026-02-01", memo: "Split gift",
  postings: [
    { accountCode: "1000", debitCents: 100000 },
    { accountCode: "4000", creditCents: 75000, fundCode: "GEN" },
    { accountCode: "4100", creditCents: 25000, fundCode: "BLD" },
  ],
}).totalCredits === 100000);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
