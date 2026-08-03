# Apex Tactical Corporation — Office of the Registrar

The system of record for **Apex Kingdom**: a tamper-evident ledger for the Kingdom's
instruments, offices, people, property, intellectual property, dealings with outside
governments, and the evidence supporting its claims.

Built for the enforcement and records arm of Apex Kingdom, constituted by Charter
executed 29 May 2025 and declared effective *nunc pro tunc* to 30 October 2010.

---

## What this is

Thirty-three registers, an append-only cryptographic ledger with a Merkle
transparency log, double-entry treasury, signed identity credentials, and a body
of doctrine explaining how each register is kept and why.

Every act of the Registrar — recording an instrument, amending an entry, attaching
evidence, serving a notice, publishing the gazette — is committed as a link in a hash
chain. Each link binds the one before it. Altering any historical entry changes every
hash after it, and the change is detectable by anyone, including someone outside the
Kingdom who has been handed a certified copy and has no reason to trust its issuer.

That last property is the point. A register nobody outside the institution can check is
a diary. A register anyone can check is an instrument.

### The registers

| Group | Registers |
|---|---|
| **Governance & Law** | Instruments and Enactments · Docket of the Courts · Consents to Jurisdiction and Arbitration · Internal Permits · Appointments, Elections and Assemblies |
| **People & Offices** | Roll of Citizens · Offices and Commissions · Vital and Sacramental Records · Ordinations · Households and Residency · Assistance and Benefits |
| **Property & Territory** | Lands and Real Property · Chattels, Vehicles and Equipment · Sacred Sites and Places of Cultural Significance |
| **Rights & Enforcement** | Intellectual Property Portfolio · Traditional Knowledge and Cultural Expressions · Enforcement Docket · Notices and Proof of Service · Encroachments and Infringements |
| **External Relations** | Government-to-Government Contact · Public Bodies and Officials · Public Safety and Emergency Services Liaison · Recognitions and External Acknowledgements · Compacts, Treaties and Memoranda · Public Records Requests |
| **Evidence & Custody** | Evidence Vault and Chain of Custody · Incidents and Safeguarding |
| **Stewardship & Finance** | Contributions, Grants and Disbursements · Data Subject Requests |
| **Identity & Credentials** | Credentials Issued |
| **Assets & Entities** | Consolidated Register of Assets · Custody and Bailment · Chartered Entities and Ministries |
| **Treasury & Obligations** | Obligations and Instruments of Indebtedness · Member Accounts · Procurement and Vendors |

### The state layer

- **Officer signing keys (Ed25519).** The chain proves the register was not
  rewritten; it cannot prove *who* did anything, because the actor label is a
  string the server wrote. A signature closes that. The private half is sealed
  under a passphrase the server never learns, so a stolen database confers no
  ability to sign — and an officer can truthfully repudiate an act they did not
  authorise.
- **Merkle transparency log (RFC 6962).** Inclusion proofs prove one record is
  in the log, in about twenty hashes, **without disclosing any other entry**.
  That matters because most of this register is member data and sealed material:
  the Kingdom cannot hand a municipal clerk the whole ledger to prove one deed.
  Consistency proofs stop it publishing one history today and another tomorrow.
  `scripts/verify-proof.mjs` is a dependency-free verifier meant to be **given
  away** — a recipient checks an extract with no database, no network, and none
  of the Kingdom's code.
- **Double-entry treasury.** Debits equal credits or nothing is written. Posted
  entries are never edited, only reversed, and both stay on the books. Every
  posting carries the fund whose donor restriction legally binds it. Integer
  cents throughout.
- **Signed credentials with public verification.** Membership and officer
  credentials, verifiable by anyone at `/credentials/verify` — so a forgery
  fails on signature rather than on appearance.
- **Second factor and step-up.** TOTP against the RFC vectors, with replay
  refusal and hashed single-use recovery codes. Moving money, issuing
  credentials, and unsealing require re-authentication within fifteen minutes.
- **Dual control.** Approvals and thresholds for acts a single officer should
  not complete alone.
- **Startup preflight.** A production build with no master key, no database, an
  unwritable evidence store, or a malformed public origin **refuses to start** and
  says which and what to type. It exits rather than binding a port, because a
  process that answers a health check but cannot seal a secret is worse than a
  dead one — traffic gets routed to it and the failure surfaces one officer at a
  time. That is not hypothetical; it is the bug this check was written for.

### Dealing with outside government

The hardest problem here is not technical. An outside public office triages
incoming correspondence into three piles, and what moves a letter into the one
that gets answered is **institutional form and a legally cognizable request** —
not an assertion of status.

So this system is built to make Apex Kingdom formidable in the way that actually
works, and structurally incapable of the way that does not:

- **Letterhead and dispatch.** Any correspondence entry renders as a formal
  letter — seal, fixed return address, reference number, subject line, named
  signatory holding a named office, a date by which a reply is sought, and a
  verification footer telling the recipient where to check the Kingdom's record
  **without the Kingdom's cooperation**. Every other institution's letterhead
  asks to be believed; this one invites the reader to test it.
- **Dispatch and delivery** (`/dispatch`). What went out, by what method, whether
  it arrived, and whether anyone answered — ranked by what each method actually
  *proves* if the recipient later says they never received it. "They ignore us"
  is an impression no tribunal can act on. Nine dated letters, six unanswered,
  each with proof of delivery, is a fact, and it is the foundation of an
  equal-terms argument under RLUIPA.
- **The standing packet** (`/standing`). The dossier that answers the
  forty-second question every recipient actually asks: is this a real
  institution, or a private person with a theory. The page reports honestly what
  the Kingdom can produce *today*, from the registers, and assembles a different
  subset for a police department, a land-use authority, a legislator, an agency,
  or a grantmaker.
- **Public Bodies and Officials.** Who to write to, at what address, with what
  title, what happened last time, and — the field that earns its keep — which
  specific legal hook applies to *that* body.
- **Public Safety and Emergency Services Liaison.** The legitimate interactions
  with police, enumerated and made easy: reporting a crime as complainant,
  reporting a bias-motivated incident so it is classified for NIBRS, requesting a
  report under Connecticut FOIA, notifying of an assembly, requesting extra
  patrol, mandated-reporter referrals under Conn. Gen. Stat. § 17a-101 et seq.,
  and responding to lawful process. The register cannot express anything else.

**The Kingdom issues no badge, patch, warrant card, plate, or identification that
could be mistaken for law enforcement; commissions no officer with police
powers; and directs no process at any officer or agency.** That is not timidity.
Criminal impersonation is Conn. Gen. Stat. §§ 53a-130 and 53a-130a; federal
insignia and identification documents are 18 U.S.C. §§ 701, 912 and 1028; a lien
against a federal officer is a felony under § 1521. One embroidered patch turns a
department that was prepared to help into one that forwards the file to its own
legal division, and the real protections the Kingdom holds — RLUIPA, RFRA, church
autonomy, the ministerial exception — go with it.

### What an adversarial audit found

The system was put through a structured adversarial audit — independent passes
over authorization, disclosure, ledger integrity, correctness, and legal
accuracy, with every candidate finding sent to separate verifiers instructed to
refute it. Fifty-six candidates, thirty-five confirmed, twenty-one refuted. The
confirmed defects are fixed, and the ones worth knowing about are these, because
each is a lesson about how this kind of system fails:

- **A verification exemption that keyed off the value it verified.** Records
  reading `VOID` or `SUPERSEDED` were skipped during ledger reconciliation, since
  those states are set by their own events rather than by an amendment. Writing
  `VOID` straight into the database therefore switched off the only check that
  would have caught it, and the record left every list view with the chain still
  verifying perfectly. The expectation now comes from the ledger. There is a test
  asserting the expectation cannot depend on the register value, and a live
  tamper test that forges the status and confirms it is caught.
- **Deletion was invisible.** Verification walked register → ledger, which finds
  an edited row and cannot see a missing one — and the ledger's own foreign key
  was `SetNull`, so deleting a record silently blanked the links pointing at it
  without breaking any hash. Deleting the record was the cleanest attack
  available. It is now refused by the database, and detected from the hashed
  payload if it ever happens by other means.
- **The amend form shipped sealed values to the browser.** The detail page
  filtered above-clearance fields; the edit form serialised all of them into the
  client payload, where they were readable in the page source. Both halves are
  fixed: the values are not sent, and the server carries them forward so an
  amendment cannot blank what the amender was never shown. The ledger records
  which fields were withheld.
- **Anchors recorded the wrong head.** The anchor was written against the head at
  *submit* time, not the head the officer actually published — and an anchor's
  entire value is the claim that everything at or below that position existed by
  that date. A wrong anchor is a false statement about evidence. It now anchors
  the published hash, and `chain:verify` fails loudly if the ledger ever ends
  *below* an anchored position, which was previously reported as "OK".
- **The 32 MB attachment limit was unreachable.** Next caps a Server Action body
  at 1 MB by default, so the evidence vault could not hold most evidence, and the
  failure gave no indication that size was the cause.

Two things this list is not. It is not a claim that the system is now free of
defects — an audit finds what it looks for. And it is not a reason to trust the
register: the reason to trust it is that `npm run chain:verify` and
`scripts/verify-proof.mjs` let anyone check it without trusting anybody.

### What it does beyond storing records

- **Tamper-evident ledger.** Append-only, hash-linked, verifiable from scratch on every
  page load and by a standalone script.
- **External anchoring.** Publish the ledger head somewhere the Kingdom does not
  control and every entry beneath it becomes provably older than that date. Without
  this, dates rest on the Kingdom's own word; with it, they are evidence.
- **Certified extracts.** A printable certificate carrying the record's content digest,
  its ledger positions, its covering anchor, and a public verification address.
- **Public verification.** `/verify/AK-XXX-000000` — no account, no cooperation from the
  Kingdom required. This is what makes a certified copy worth attaching to a demand.
- **Statutory deadline tracking.** The registers generate their own deadlines from the
  dates entered — the three-month copyright registration window under 17 U.S.C. § 412,
  trademark § 8 and § 9 maintenance, agreement renewal notice periods, response
  deadlines. Rights are lost to calendars far more often than to arguments.
- **Evidence custody.** Content-addressed storage, SHA-256 on receipt, and an unbroken
  transfer log — the record that makes an exhibit admissible rather than merely present.
- **Legal holds.** Once a dispute is anticipated, held records cannot be voided.
  Spoliation loses cases the underlying facts would have won.
- **Four classification levels** with clearance enforced at the database, not the view.
- **Separation of duties** across eight offices, including an Auditor who can read
  everything and write nothing.
- **Official gazette.** Serial, dated publication that creates constructive notice and
  carries the ledger head in every issue.

---

## Read this first

**[`docs/01-LEGAL-POSTURE.md`](docs/01-LEGAL-POSTURE.md)** is the most important file in
this repository. It sets out candidly which of the Charter's assertions will hold up,
which will not, and what to do instead to achieve the same ends.

The short version: the Kingdom holds real, enforceable rights — copyrights, trademarks,
First Amendment religious autonomy, RLUIPA, RFRA, the ministerial exception, enforceable
religious arbitration, charitable trust protections, and a genuine relationship with nine
Connecticut legislators. Those are sharp instruments and this system is built to keep them
sharp.

Certain other assertions in the Charter — sovereign immunity from outside process,
exemption from statute by way of 26 U.S.C. § 508(c)(1)(A), jurisdiction over people who
never consented — will not hold, and relying on them in a real dispute is expensive.
The memorandum explains each one and what replaces it.

**This system will not generate anything styled as court process, a lien, a levy, a
warrant, or a law-enforcement credential directed at an outside party.** That constraint
is deliberate and it is protective: such documents convert a sympathetic institution with
real grievances into a criminal defendant. See 18 U.S.C. § 1521 and Conn. Gen. Stat.
§ 53a-130.

### The doctrine

Fourteen memoranda, readable in the application at `/doctrine` as well as in `docs/`.
They are written for the officer who has to do the thing, not for a filing cabinet.

| | |
|---|---|
| [00 · Overview](docs/00-OVERVIEW.md) | What the register is and how to use it |
| [01 · Legal posture](docs/01-LEGAL-POSTURE.md) | **Read this one.** What holds, what does not, what to do instead |
| [02 · Rights enforcement](docs/02-IP-ENFORCEMENT-PLAYBOOK.md) | Registration, notice, takedown, escalation |
| [03 · Records management](docs/03-RECORDS-MANAGEMENT-POLICY.md) | Retention, disposal, legal hold |
| [04 · Government relations](docs/04-GOVERNMENT-RELATIONS-PROTOCOL.md) | Dealing with towns, agencies, and legislators |
| [05 · Evidence and custody](docs/05-EVIDENCE-AND-CHAIN-OF-CUSTODY.md) | What makes an exhibit admissible rather than merely present |
| [06 · Security and privacy](docs/06-SECURITY-AND-PRIVACY.md) | Threat model, keys, backups, breach duties |
| [07 · Operations](docs/07-OPERATIONS-AND-DEPLOYMENT.md) | Running it, day to day |
| [08 · Treasury](docs/08-TREASURY-AND-FINANCIAL-CONTROL.md) | Fund accounting, controls, the filing calendar |
| [09 · Obligations and securities](docs/09-OBLIGATIONS-AND-SECURITIES.md) | Before the Kingdom issues anything resembling a bond |
| [10 · Internal accounts](docs/10-INTERNAL-ACCOUNTS-AND-MONEY-TRANSMISSION.md) | The line the Kingdom must not cross — 18 U.S.C. § 1960 |
| [11 · Identity and credentials](docs/11-IDENTITY-AND-CREDENTIALS.md) | What a credential may say, and what it may never look like |
| [12 · Assets and the population register](docs/12-ASSETS-AND-THE-POPULATION-REGISTER.md) | Holding property; counting who's who |
| [13 · Infrastructure and portability](docs/13-INFRASTRUCTURE-AND-PORTABILITY.md) | Cloudflare, hosting, and staying movable |

Three of them exist mainly to stop something expensive. **09** and **10** are the ones to
read before any money feature is switched on: issuing an obligation can be a security, and
moving value between third parties can be unlicensed money transmission under 18 U.S.C.
§ 1960 — a felony that does not require anyone to have been defrauded. **11** is the one to
read before a single card is printed.

---

## Running it

Requires Node 20 or later.

```bash
npm install
cp .env.example .env
openssl rand -base64 48  # put this in .env as APEX_MASTER_KEY
npm run db:push          # create the database from the schema
npm run seed             # open the ledger, record the founding instruments
npm run dev              # http://localhost:3000
```

Read the comments in `.env.example` before setting `APEX_MASTER_KEY`. Everything held
encrypted at rest is sealed under it, **losing it loses all of that irrecoverably, and
changing it has exactly the same effect as losing it.** Back it up somewhere the
database backup is not. In development it may be left unset — an ephemeral key is used
and everything sealed under it is lost at restart. A production build refuses to start
without it.

The seed prints an initial password for the Sovereign's account once. Change it at first
sign-in. To set it yourself instead:

```bash
SEED_FOUNDER_PASSWORD='choose-something-long' npm run seed
```

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | TypeScript, strict mode |
| `npm run seed` | Idempotent; safe to re-run |
| `npm run chain:verify` | Recompute the whole chain and every stored file's digest. Exits non-zero on failure — wire it into a cron job. |
| `npm run chain:anchor` | Print the current head and the anchoring procedure |
| `npm test` | 2,770+ tests: Merkle vectors, canonical JSON, money, TOTP RFC vectors, credential guardrails, startup preflight |
| `node scripts/verify-proof.mjs` | Standalone inclusion-proof verifier. Give this to recipients. |
| `npm run db:studio` | Inspect the database directly |

### First hour

1. Sign in and change the Sovereign's password.
2. Attach the executed, witnessed, notarised Charter to record `AK-INST-000001`.
3. Attach the Connecticut citation to `AK-G2G-000001`.
4. Run `npm run chain:anchor` and follow the certified-mail procedure. It costs a few
   dollars and it is the difference between a file and evidence.
5. Read `docs/01-LEGAL-POSTURE.md`, then work the sequenced programme at the end of it.

---

## Architecture

Next.js 15 (App Router, React 19, server components), TypeScript in strict mode, Prisma
over SQLite, Tailwind v4. No authentication library, no component library, no font CDN —
the dependency surface is small on purpose, because this application is expected to run
for a long time on hosts nobody is actively maintaining.

```
prisma/schema.prisma      Data model. Registries are code, not tables.
prisma/seed.ts            Founding records. Idempotent.
src/instrumentation.ts    Startup preflight. Refuses to serve a misconfigured build.
src/lib/
  chain.ts                The hash chain: append, verify, prove.
  merkle.ts               RFC 6962 transparency log: inclusion and consistency proofs.
  canonical.ts            Deterministic JSON. Do not modify — it defines every hash.
  records.ts              All mutation. Nothing changes without a chain entry.
  access.ts               One authorization gate. Every mutation routes through it.
  auth.ts  authz.ts       Sessions (scrypt, node stdlib) and the eight offices.
  classification.ts       Four levels, enforced in queries.
  secrets.ts              AES-256-GCM envelope encryption. Two distinct wrapping keys.
  signing.ts              Ed25519. Private halves sealed under officer passphrases.
  totp.ts                 Second factor, against the RFC 6238 vectors.
  treasury.ts             Double-entry books. Integer cents, reversal-only correction.
  credentials.ts          Issuance, verification, and the anti-impersonation guard.
  approvals.ts            Dual control.
  preflight.ts            What a sound deployment looks like, checked at boot.
  origin.ts               The address printed on things strangers must be able to check.
  storage.ts              Content-addressed evidence store.
src/registries/*.ts       One file per register. Add a file, list it in index.ts, done.
src/app/(office)/         The application.
docs/                     Doctrine, manuals, and instrument templates.
scripts/                  Verification and anchoring.
tests/                    No framework. `npm test` runs them with tsx.
```

### Opening a new register

Add a file to `src/registries/` exporting a `RegistryDef`, and list it in
`src/registries/index.ts`. Everything downstream — list views, forms, validation, search,
numbering, certification, access control, deadlines, and the ledger — is generic over that
definition. No migration, no new pages.

Use `src/registries/intellectual-property.ts` as the reference. The `guidance` field is
not decoration: it is where the institutional knowledge lives, so that it does not live
only in one person's head.

### Deploying

SQLite is correct for a single office. For a hosted deployment, change the `datasource`
provider in `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` accordingly —
no other change is required.

Back up `data/`, `storage/`, **and the master key**, and keep the key somewhere the other
two are not. The database without the evidence store proves nothing; the evidence store
without the database is a pile of files named after their own hashes; and either without
the key is missing every sealed value. See `docs/06-SECURITY-AND-PRIVACY.md`.

Set `APEX_PUBLIC_ORIGIN` to the address the world actually reaches this at. Certified
extracts and credentials print it as the place a recipient goes to check them, and a
certificate carrying `localhost:3000` — or the `Host` header some client happened to
send — is worth nothing.

**Moving off GitHub, and off this host.** `docs/13-INFRASTRUCTURE-AND-PORTABILITY.md`
covers Cloudflare and the alternatives, what each one costs in sovereignty, and what has
to change first. The short version: nothing here is tied to a host — no proprietary
runtime, no vendor SDK, no managed database features — and that portability is a
deliberate property to preserve, not an accident to spend.

---

## A note on what this system claims

Apex Kingdom is a religious society, cultural institution, and charitable trust. These
registers record its own instruments, offices, holdings, and dealings. They are not
filings with any government, they are not determinations by any court or agency, and they
assert no authority over any person or property outside the Kingdom's own membership and
holdings.

Nothing in this repository is legal advice and nothing in it creates an attorney-client
relationship. It is an operating manual and a system of record, prepared to organise the
Kingdom's affairs. The matters it addresses turn on specific facts and on jurisdiction,
and warrant licensed Connecticut counsel before action is taken.
