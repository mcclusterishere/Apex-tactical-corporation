import { prisma } from "@/lib/db";
import { openWallet, issue, spend, redeem, setFrozen, currencyState, verifyCurrency, CurrencyError, formatMarks, parseMarks, usdCentsFor } from "@/lib/currency";

let P: never;
let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => { c ? pass++ : fail++; if (!c) console.log("  FAIL:", n); };
async function throws(n: string, fn: () => Promise<unknown>) {
  try { await fn(); fail++; console.log("  FAIL (no throw):", n); }
  catch (e) { if (e instanceof CurrencyError) pass++; else { fail++; console.log("  FAIL (wrong err):", n, (e as Error).message); } }
}

async function main() {
  const sov = await prisma.user.findFirst({ where: { role: "SOVEREIGN" } });
  P = { id: sov!.id, displayName: "Test Treasurer", role: "SOVEREIGN" } as never;
  // parse/format
  ok("parseMarks 125.50 -> 12550", parseMarks("125.50") === 12550);
  ok("parseMarks ₳1,000 -> 100000", parseMarks("₳1,000") === 100000);
  ok("formatMarks 12550 -> 125.50", formatMarks(12550) === "125.50");
  ok("usdCents par", usdCentsFor(12550) === 12550);
  await throws("parseMarks rejects 3 decimals", async () => parseMarks("1.234"));

  const before = await verifyCurrency();
  ok("ledger starts consistent", before.length === 0);
  const s0 = await currencyState();

  // open a wallet, issue 100
  const w = await openWallet(P, { holderName: "Test Member" });
  await issue(P, { walletId: w.id, amountMinor: parseMarks("100.00"), memo: "deposit" });
  let wallet = await prisma.currencyAccount.findUnique({ where: { id: w.id } });
  ok("issue credits the wallet", wallet?.balanceMinor === 10000);
  let st = await currencyState();
  ok("outstanding rose by 100", st.outstandingMinor === s0.outstandingMinor + 10000);
  ok("reserve == outstanding (fully reserved)", st.reserveCents === usdCentsFor(st.outstandingMinor));
  ok("liability == outstanding", st.liabilityCents === usdCentsFor(st.outstandingMinor));
  ok("verify clean after issue", (await verifyCurrency()).length === 0);

  // spend 30
  await spend(P, { walletId: w.id, amountMinor: parseMarks("30.00"), memo: "tithe store" });
  wallet = await prisma.currencyAccount.findUnique({ where: { id: w.id } });
  ok("spend debits the wallet", wallet?.balanceMinor === 7000);
  st = await currencyState();
  ok("reserve still == outstanding after spend", st.reserveCents === usdCentsFor(st.outstandingMinor));
  ok("verify clean after spend", (await verifyCurrency()).length === 0);

  // redeem 20
  await redeem(P, { walletId: w.id, amountMinor: parseMarks("20.00"), memo: "cash out" });
  wallet = await prisma.currencyAccount.findUnique({ where: { id: w.id } });
  ok("redeem debits the wallet", wallet?.balanceMinor === 5000);
  st = await currencyState();
  ok("reserve == outstanding after redeem", st.reserveCents === usdCentsFor(st.outstandingMinor));
  ok("verify clean after redeem", (await verifyCurrency()).length === 0);

  // cannot spend/redeem beyond balance (50 left)
  await throws("cannot spend more than balance", async () => spend(P, { walletId: w.id, amountMinor: parseMarks("50.01") }));
  await throws("cannot redeem more than balance", async () => redeem(P, { walletId: w.id, amountMinor: parseMarks("999.00") }));
  await throws("cannot issue zero", async () => issue(P, { walletId: w.id, amountMinor: 0 }));
  await throws("cannot issue negative", async () => issue(P, { walletId: w.id, amountMinor: -100 }));

  // freeze blocks movement
  await setFrozen(P, w.id, true, "test freeze");
  await throws("frozen wallet cannot spend", async () => spend(P, { walletId: w.id, amountMinor: parseMarks("1.00") }));
  await throws("frozen wallet cannot issue", async () => issue(P, { walletId: w.id, amountMinor: parseMarks("1.00") }));
  await setFrozen(P, w.id, false, "unfreeze");
  const afterUnfreeze = await spend(P, { walletId: w.id, amountMinor: parseMarks("50.00") });
  ok("unfrozen wallet spends to zero", afterUnfreeze.balanceAfter === 0);

  // closed-loop: there is NO transfer function
  const mod = await import("@/lib/currency");
  ok("no member-to-member transfer exists", !("transfer" in mod));

  // final invariant
  const finalProblems = await verifyCurrency();
  ok("ledger fully consistent at end", finalProblems.length === 0);
  if (finalProblems.length) console.log(finalProblems);

  // cleanup: remove test wallet + its entries so we don't pollute the real ledger view
  await prisma.currencyEntry.deleteMany({ where: { accountId: w.id } });
  await prisma.currencyAccount.delete({ where: { id: w.id } });

  console.log(`\ncurrency: ${pass} passed, ${fail} failed`);
  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}
main();
