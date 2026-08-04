# The Apex Mark

*For the Sovereign, the Treasurer, and counsel. Read this before the Mint issues
a single Mark, and again before the Kingdom takes a dollar from anyone outside a
small, closed membership. The Mark is lawful, and it is lawful only because of
the lines drawn here. Cross one and it stops being scrip and becomes a felony.*

---

## 1. What was asked, and the honest answer

The Kingdom wanted its own currency. There are two things that phrase can mean,
and only one of them is lawful:

- **A private unit of account** — a credit, denominated in the Kingdom's own
  unit, that members use for the Kingdom's own goods and services. This is
  ordinary and legal. A food co-op's scrip, a transit card's stored value,
  BerkShares in the Berkshires, Ithaca HOURS, a casino chip, an airline's
  miles — all the same species, and none of them needed anyone's permission.

- **Money that circulates as money** — coin or note issued to pass from hand to
  hand as a medium of exchange in competition with the dollar. This is a crime,
  and not a small one.

The Apex Mark is built to be the first and structurally incapable of the second.

## 2. The three lines, and the statutes behind them

**You may not mint it as coin or note.** 18 U.S.C. § 486 makes it a federal
offence to make or pass "any coins of gold or silver or other metal, or alloys
of metals, intended for use as current money, whether in the resemblance of coins
of the United States or of foreign countries, or of original design." Read that
last clause twice: *original design is no defence.* This is the statute Bernard
von NotHaus was convicted under for the Liberty Dollar — a privately minted metal
currency of his own design, marketed as an alternative to federal money. The
lesson is not that his coins looked like dollars; it is that they were physical
objects intended to circulate as money. **The Mark is therefore never coined,
printed, struck, or embodied in any physical token intended to pass as money.**
It exists only as an entry in this ledger. A commemorative medallion with no
monetary use is a different thing; a coin you can spend is the offence.

Related, and absolute: nothing resembling United States currency, ever —
counterfeiting reaches that under 18 U.S.C. §§ 471–474, and fictitious
obligations under § 514.

**You may not move value between third parties.** The moment the Kingdom lets
one member send value to another member, or lets anyone cash out value that
originated with someone else, it is transmitting money. Unlicensed money
transmission is a federal felony under 18 U.S.C. § 1960 — and it requires no
fraud, no victim, and no intent to break the law; operating without the licence
is the whole offence. Connecticut licenses and supervises money transmission
separately under Conn. Gen. Stat. § 36a-595 et seq., with its own criminal
exposure. The safe harbour is a **closed loop**: value moves only between the
Kingdom and a member — issued by the Kingdom, spent back to the Kingdom,
redeemed by the Kingdom. The software enforces this by omission: **there is no
function anywhere in the Mint to transfer a Mark from one member to another.**
It cannot be done through the application because it was never built, and it must
not be added without the licensing analysis that would then be required.

**It may not be an investment.** If people buy the Mark expecting it to be worth
more later — through interest, appreciation, or a share in the Kingdom's
enterprise — it is a security, and offering it engages the Securities Act and
Connecticut's Uniform Securities Act (Conn. Gen. Stat. § 36b-2 et seq.), with
registration or exemption, disclosure, and anti-fraud duties that a religious
society is in no position to carry. The Mark is therefore fixed at par to the
dollar, earns nothing, and is redeemable at any time for exactly what was put in.
It is a spending credit, not a stake. *Howey* is not satisfied because there is
no expectation of profit from the efforts of others — there is no profit at all.

## 3. How the Mint actually works

Three movements, and only three:

- **Issue.** A member gives the Kingdom dollars; the Kingdom credits their wallet
  with an equal number of Marks. The dollars go into a **reserve** the Kingdom
  does not spend, and the books recognise a matching liability — *Marks in
  circulation* — so every Mark is backed by a real dollar the instant it exists.

- **Spend.** The member uses Marks for the Kingdom's own goods or services. The
  Marks are retired, the Kingdom recognises the revenue, and the dollar that
  backed them is released from the reserve into operating cash — because the
  credit has been consumed, that dollar is now genuinely the Kingdom's.

- **Redeem.** The member asks for their dollars back. The Marks are retired and
  the dollars leave the reserve. This is the promise that makes the Mark worth
  holding, and it is honoured on demand, at par, always.

The reserve therefore holds, at every moment, exactly one dollar for every Mark
still outstanding. This is not a policy the Treasurer is trusted to follow; it is
an invariant the system checks. The Mint page recomputes it from three
independent places — the wallets, the double-entry books, and each wallet's own
entry history — and shows a red state the moment they disagree. `verifyCurrency`
does the same from the command line. A Mark that is not backed is the one thing
this system will not quietly permit.

Every issue, spend, and redemption is a double-entry journal in the Treasury and
a link in the hash chain, in the same transaction. So the money supply is as
tamper-evident as the register: you cannot conjure a Mark, or erase one, without
breaking a hash that anyone can recompute.

## 4. The obligations that come with it, even done correctly

Doing this lawfully is necessary, not sufficient. Three duties attach:

**Tax.** Scrip and barter are not invisible to the IRS. The fair market value of
goods or services obtained with Marks is income to whoever earns it, and the
Kingdom's own receipts are receipts. See 26 U.S.C. § 61 and the barter-exchange
rules; large or organised programmes can trigger information-reporting
obligations (the 1099 series). Book it as what it is.

**Stored value and consumer protection.** Taking dollars from a person today
against a promise to deliver value later is *stored value*, and above certain
thresholds and outside certain exemptions it engages state money-transmitter and
prepaid-access law even inside a single organisation. A church selling its own
members credit usable only for its own activities sits in the safest corner of
this, but the corner has edges. Keep balances modest, keep redemption genuinely
available, and do not solicit deposits from the public.

**The reserve is not the Kingdom's money.** While a Mark is outstanding, the
dollar backing it belongs, in substance, to the member who can redeem it. Spending
the reserve to cover an unrelated bill is how every scrip scheme that ended badly
ended badly. The reserve fund is marked restricted for exactly this reason, and
the release of a backing dollar happens only when the member spends the Mark it
backed — never before.

## 5. A quieter alternative, if the deposit model worries counsel

Everything above assumes members hand over real dollars and can get them back.
The single most conservative variant removes the dollars from the front of the
transaction: the Kingdom **grants** Marks for participation — service, tithing in
kind, attendance — redeemable only in the Kingdom's own goods and services and
**not** convertible back to cash. No dollars are taken, so the stored-value and
money-transmitter analyses largely fall away; it is closer to a loyalty point
than to a deposit. The trade is that it is worth less to a member, because it
cannot be cashed out. The system can run either model; which one is right is a
question for counsel, on the facts of how the Kingdom means to use it.

## 6. Before you go live

1. Have Connecticut counsel read this memorandum and the Mint, and decide
   between the backed model and the grant-only model in § 5.
2. Confirm the entity that will hold the reserve, and open a segregated bank
   account for it — the reserve should not commingle with operating cash in the
   real world any more than it does on these books.
3. Set a ceiling on total Marks outstanding and on any single wallet, low enough
   that the programme stays plainly inside the closed-loop, small-membership
   corner while it is young.
4. Write the member terms: what a Mark is, that it is not legal tender and not an
   investment, how redemption works, and what happens if the programme ends.
5. Only then issue the first Mark.

---

*Nothing here is legal advice and nothing here creates an attorney-client
relationship. Currency, money transmission, securities, stored value, and the
tax treatment of scrip are exactly the subjects on which a confident amateur does
the most damage. Licensed Connecticut counsel, and a tax adviser, before the
Mint issues anything.*
