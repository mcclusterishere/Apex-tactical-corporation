# Apex Stays — the contribution ledger, and the lines that keep it lawful

*The Kingdom's family properties need work: mowing, gutters, taxes paid, books
kept, guests hosted. The people who do that work should be the first to enjoy
what it protects. Apex Stays is how that is measured — and it is designed, from
the unit up, to be a system of hospitality and never a currency. This document
fixes the rules; the software enforces them by omission; the tests assert the
omission.*

---

## 1. The unit

**One Apex Stay = two nights.** Check in the first afternoon, the whole day
between, out by midday — two nights, a day and a half. It is the constant unit
of measurement across every property and sub-business in the family directory.

Internally the ledger stores whole **nights** (integers), because the booking
engine already thinks in nights and integers cannot round apart. Two nights make
a Stay; odd nights display as halves ("1½ Stays"). **No field anywhere in the
system records a Stay in dollars.** That absence is the design.

## 2. How Stays move

- **Earn.** A steward posts an **Apex Task** against a property ("mow and edge —
  2243 Haverford", "pay the county taxes — parcel 1200458"), with a reward in
  nights. A member claims it, does it, marks it done. **A second person verifies**
  — the verifier can never be the worker, however senior. On verification the
  nights are credited and the act is chained (`APEX_TASK_VERIFIED`,
  `STAY_EARNED`).
- **Gift.** Any member may gift Stays to any other member, freely. The transfer
  writes a symmetric pair (out/in) in one transaction and is chained
  (`STAY_GIFTED`). Gifting is what makes it feel like a family: the cousin who
  cannot mow can still be sent a weekend.
- **Spend.** Stays buy **nights at family properties** — the zome at Weldon, the
  retreat corner at Haverford, anything later in the network. The balance check
  and the spend write live in the same transaction, so a balance can never go
  negative in a race (`STAY_SPENT`).

## 3. The three prohibitions, and why each one exists

**A Stay cannot be bought.** No function accepts money and produces Stays. The
moment Stays can be purchased, they have a market price, and a transferable
instrument with a market price is on its way to being money.

**A Stay cannot be redeemed — for dollars, or for the Mark.** No function
consumes Stays and produces money or Marks, and none may be added without the
full licensing analysis that the Mint's own doctrine demands ([16] § 2). The
Mark is deposit-backed and redeemable, and for exactly that reason it is
**non-transferable**; Stays are transferable, and for exactly that reason they
must be **non-redeemable**. Each instrument is safe because it lacks the other's
dangerous property. Connecting them — any conversion in either direction —
would combine transferability with redeemability, and that combination is money
transmission (18 U.S.C. § 1960). **The two ledgers never touch.**

**A Stay is not denominated in money.** Not "backed by" the Treasury, not pegged
to the mowing man's $50, not carried on the books at a dollar figure. A Stay is
a *night*, a unit of hospitality. The Treasury may keep a maintenance reserve
from property income (a budgeting decision, on its own books, in dollars); that
reserve funds upkeep — it does not "back" Stays, and no Stay is a claim on it.

## 4. The honest limits

- **Family and members only.** The loop stays closed. Outsiders do not earn,
  hold, or spend Stays; a points system open to the public is a barter exchange
  with its own reporting regime, and this is not that.
- **Small and domestic by design.** Family members letting family stay on family
  property, in recognition of family work, is ordinary hospitality. If this ever
  scales into something with real income and non-trivial volumes — a resident
  caretaker, salaried management — the right structure is a real one (IRC § 119
  lodging for a genuine caretaker; a CPA's advice) rather than a bigger points
  system.
- **The chain records everything.** Every task, credit, gift, and spend is in
  the hash chain like every other act of the Kingdom. That is a feature for
  trust inside the family — and a reason to keep the system exactly what this
  document says it is.

## 5. The tripwire

`tests/stays.test.ts` asserts, alongside the arithmetic, that the module's
exported surface contains **no name** touching purchase, redemption, cash,
conversion, or the Mark. If someone one day writes `redeemStaysForMarks`, the
suite fails before the felony ships. The absence of that function is not an
oversight to be fixed. It is the design, and this document is where it is
written down.
