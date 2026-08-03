# Apex Tactical Corporation — Office of the Registrar

The system of record for **Apex Kingdom**: a tamper-evident ledger for the Kingdom's
instruments, offices, people, property, intellectual property, dealings with outside
governments, and the evidence supporting its claims.

Built for the enforcement and records arm of Apex Kingdom, constituted by Charter
executed 29 May 2025 and declared effective *nunc pro tunc* to 30 October 2010.

---

## What this is

Twenty-one registers, one append-only cryptographic ledger, and a body of doctrine
explaining how each register is kept and why.

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
| **Governance & Law** | Instruments and Enactments · Docket of the Courts · Consents to Jurisdiction and Arbitration |
| **People & Offices** | Roll of Citizens · Offices and Commissions · Vital and Sacramental Records · Ordinations and Ministerial Credentials |
| **Property & Territory** | Lands and Real Property · Chattels, Vehicles and Equipment · Sacred Sites and Places of Cultural Significance |
| **Rights & Enforcement** | Intellectual Property Portfolio · Traditional Knowledge and Cultural Expressions · Enforcement Docket · Notices and Proof of Service · Encroachments and Infringements |
| **External Relations** | Government-to-Government Contact · Compacts, Treaties and Memoranda · Public Records Requests |
| **Evidence & Custody** | Evidence Vault and Chain of Custody |
| **Stewardship & Finance** | Contributions, Grants and Disbursements · Data Subject Requests |

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

---

## Running it

Requires Node 20 or later.

```bash
npm install
cp .env.example .env
npm run db:push          # create the database from the schema
npm run seed             # open the ledger, record the founding instruments
npm run dev              # http://localhost:3000
```

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
src/lib/
  chain.ts                The hash chain: append, verify, prove.
  canonical.ts            Deterministic JSON. Do not modify — it defines every hash.
  records.ts              All mutation. Nothing changes without a chain entry.
  auth.ts  authz.ts       Sessions (scrypt, node stdlib) and the eight offices.
  classification.ts       Four levels, enforced in queries.
  storage.ts              Content-addressed evidence store.
src/registries/*.ts       One file per register. Add a file, list it in index.ts, done.
src/app/(office)/         The application.
docs/                     Doctrine, manuals, and instrument templates.
scripts/                  Verification and anchoring.
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

Back up `data/` **and** `storage/` together. The database without the evidence store
proves nothing, and the evidence store without the database is a pile of files named
after their own hashes. See `docs/06-SECURITY-AND-PRIVACY.md`.

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
