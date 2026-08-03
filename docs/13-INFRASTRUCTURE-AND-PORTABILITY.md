# Deployment and the Sovereignty of Infrastructure

*For the Founder and for whoever operates this system. Written in answer to the
intention to move off GitHub and onto Cloudflare. Read it before opening an
account anywhere, and again before the first migration.*

## 1. Three decisions, not one

"Moving off GitHub onto Cloudflare" sounds like a single act. It is three
independent decisions with different risks, and moving one does not move the
others.

**Where the source code lives.** GitHub, GitLab, Codeberg, a self-hosted Forgejo,
or a bare git repository on a machine the Kingdom owns.

**Where the application runs.** A container host, a virtual server, the Kingdom's
own hardware, or Cloudflare's edge.

**Where the data lives.** `data/ledger.db` and the content-addressed evidence
store under `storage/` — which today sit beside the application but need not.

Cloudflare is an answer to the second and part of the third. It is not an answer
to the first: Cloudflare does not host git repositories. The code can stay on
GitHub while nothing runs there, or move while the application stays exactly
where it is.

There is a quiet fourth dependency worth naming: the **domain and the registrar**.
Every printed certificate and credential carries a verification address, so the
domain is load-bearing in a way the hosting account is not. Register it somewhere
stable, lock it, enable auto-renew, and record it in the Intellectual Property
Portfolio.

**On the code specifically.** Git is distributed; every clone is the entire
history. `git remote add` a second remote, push to both, and the repository
survives any one host disappearing. What does *not* travel with `git push` is the
issue history, the pull-request record, and any CI configured in Actions — plan
for those or accept losing them. And the repository must never have held a
secret; `.env` is git-ignored precisely so that moving hosts is a low-stakes
decision. If a credential ever reached a commit, moving does not un-leak it.
Rotate it.

## 2. Cloudflare Workers, D1, and R2: excellent, and not a configuration change

Workers is genuinely first-rate — global presence, no server to patch, DDoS
resistance included by default, and costs that round to nothing at this scale.
Be clear-eyed about what reaching it costs from where this application stands.

This is Next.js 15 with React 19, Prisma 6 over SQLite, a filesystem evidence
store, and `node:crypto` throughout. **Workers is not Node**, and the specific
points of contact are these.

Password hashing and key derivation use `scryptSync` and `scrypt`
(`src/lib/auth.ts`, `src/lib/secrets.ts`). WebCrypto has no scrypt — it offers
PBKDF2 and HKDF. That means PBKDF2 at a high iteration count, or Argon2id
compiled to WASM. A hash cannot be converted, so existing passwords would be
rehashed on next sign-in and the old format kept readable during the transition.

Ed25519 signing and verification (`src/lib/signing.ts`) use `generateKeyPairSync`,
`sign`, `verify`, and DER import and export. WebCrypto supports Ed25519, but the
key paths differ — `crypto.subtle.importKey` over pkcs8 and spki rather than
`createPrivateKey` — and everything becomes asynchronous. Reassuringly, the
algorithm is unchanged: every signature already made stays valid and verifiable
across the move. TOTP's `createHmac("sha1")` and the AES-256-GCM sealing both map
onto WebCrypto mechanically, and `timingSafeEqual` needs the runtime's equivalent
or a constant-time comparison written by hand. Cloudflare's `nodejs_compat` now
covers a growing subset of `node:crypto`; which of these particular calls it
covers in the version you deploy against must be tested, not assumed.

The database is the sharpest edge. Prisma over SQLite becomes Drizzle over D1 or
Prisma's D1 driver adapter — that part is ordinary work. The problem is that
**D1 has no interactive transactions.** This system appends a hash-chain link and
writes the record it commits inside a single `prisma.$transaction(async (tx) => …)`
(see `src/lib/credentials.ts` and `src/lib/chain.ts`), which requires reading the
chain head and writing the next link atomically. D1 offers batched statements,
not an open transaction you can read inside. The Cloudflare-shaped answer is a
Durable Object serialising appends, or a single batched statement that does both
steps — either way, a redesign of the most safety-critical module in the system,
and the one where a subtle error is a silently broken chain.

The evidence store is the easy part: it is already content-addressed by SHA-256,
so moving it to R2 is close to a change of adapter. Chain verification is
awkward, because it recomputes every link and Workers bound CPU per request; a
full pass would page through in chunks driven by a scheduled job or a queue.

Two things make this less daunting than it was. `@opennextjs/cloudflare` now
carries Next.js applications onto Workers with far less rewriting than a hand
port — verify current support for the Next.js version in use before relying on
it. And the hash chain and Merkle modules are pure functions with test vectors,
so they port first and prove themselves.

Realistically: a focused week or two with the test suite kept green, plus a
rehearsed data migration. That is a project with a start date, not a checkbox.

## 3. The recommendation for now: a container host with Cloudflare in front

Run the application on Railway, Fly.io, Render, or a plain virtual server, and
put Cloudflare in front as DNS and proxy. **No code changes at all.**

What that buys immediately: DDoS absorption and a web application firewall, which
is the cheapest insurance available to an organisation making unusual public
claims; automatic TLS; bot management; and rate limiting at the edge, in front of
the sign-in throttling the application already does.

Two Cloudflare products matter more than the rest. **Cloudflare Access** puts an
identity gate in front of the administrative interface before a request ever
reaches the application — two independent authentication layers, where the outer
one cannot be bypassed by a defect in the inner one. If the Kingdom adopts one
Cloudflare product, make it this. **Cloudflare Tunnel** has the origin open an
outbound connection to Cloudflare and requires *no inbound port at all*; there is
nothing on the public internet to port-scan.

Approximate costs, all worth confirming rather than trusting here: a domain at
ten to fifteen dollars a year; Cloudflare's free plan for DNS, proxy, TLS, and
basic WAF; a Zero Trust free tier covering a small number of seats; and five to
twenty-five dollars a month for the container host.

Four configuration points are easy to get wrong and expensive to discover late.

`APEX_PUBLIC_ORIGIN` must be set to the public address. Behind a proxy it cannot
be derived from the request, and a certificate or credential printed carrying
`localhost:3000` is worthless.

Behind Cloudflare the true client address arrives in `CF-Connecting-IP`;
`X-Forwarded-For` carries Cloudflare's proxy unless configured otherwise. The
audit log records the client address, and one recording the proxy's address for
every event answers no questions.

The public routes must stay **outside** the Access gate — `/credentials/verify`,
`/verify`, `/gazette`, and the public register. A verification endpoint behind a
login verifies nothing, and the whole evidentiary value of a credential is that a
stranger can check it without the Kingdom's cooperation.

On a platform with an ephemeral filesystem, `STORAGE_DIR` must point at a mounted
persistent volume, or the evidence store disappears on the next deploy. Confirm
this before the first upload.

## 4. Self-hosting on the Kingdom's own hardware

A machine the Kingdom owns, behind a Cloudflare Tunnel with nothing exposed, is
the most sovereign option in the sense the Founder means it, and it carries the
highest ongoing burden. Somebody must patch the operating system, watch the disk,
test the backups, hold a spare power supply, and be reachable when it fails at an
inconvenient hour. That person must exist and must not be the Founder alone.
Choose this when there is a second competent operator, not before.

## 5. What sovereignty over infrastructure can and cannot mean

**It cannot mean placing the Kingdom's records beyond legal process.** A subpoena
or a document request is served on the Kingdom, and material held in a hosting
account the Kingdom controls is within its possession, custody, or control —
Fed. R. Civ. P. 34, with Rule 45 reaching third parties. Encryption at rest does
not change that: the Kingdom holds the key and can be ordered to produce the
plaintext. Nor does moving the data abroad. Under the CLOUD Act, 18 U.S.C.
§ 2713, a United States provider must produce data in its possession, custody, or
control regardless of where it is stored, and a provider may disclose to law
enforcement under the Stored Communications Act, 18 U.S.C. § 2701 et seq. — in
some circumstances without telling the customer. A provider's transparency report
is a report, not a shield.

**It can mean freedom from a provider's unilateral decision to stop serving you.**
That is a real risk for organisations with unusual claims and it has happened to
many of them. The mitigation is not finding a provider believed to be friendly;
sentiment changes, terms are enforced unevenly, and the friendliest provider
still has a payment processor and an upstream of its own. The mitigation is
**portability** — being able to move in a day, having rehearsed it.

Residency choices still worth making: pick and record a region for any managed
database, name the evidence store's provider and region in the privacy notice so
members are told the truth, and note that Cloudflare's regional-services and
data-localisation options are a paid add-on rather than a default.

Portability, concretely:

- Keep the schema portable. It already is — one line in `prisma/schema.prisma`
  from `sqlite` to `postgresql` and the model runs on Postgres unchanged.
- Depend on no proprietary managed service. There is none today; keep it that
  way, because each one is a hostage.
- Keep an **offline encrypted backup of the database and the evidence store in
  the Kingdom's own physical possession**, refreshed on a schedule. An encrypted
  drive in a safe is not unsophisticated; it is the only copy no provider can
  withhold.
- Keep a second git remote and push to both.
- **Rehearse a restore.** Annually, to a scratch machine, confirming
  `npm run chain:verify` passes on the restored copy. That is also the only
  honest test of whether the database and the evidence store were backed up in
  step with each other. An untested backup is a hope with a filename.

## 6. The operational security of the move

**Secrets never enter the repository.** `.env` is git-ignored; keep it so. Set
values through the host's environment or secret store, never in a support ticket
and never in the same message as anything else needed to use them.

**`APEX_MASTER_KEY`.** Generate it once with `openssl rand -base64 48`. Keep it in
a password manager the Kingdom controls, with one offline copy stored apart from
the database backup — a key kept beside the ciphertext it opens is not a key. It
seals second-factor secrets and sealed field values. Losing it is
**unrecoverable**, and changing it has exactly the same effect as losing it:
there is no re-wrapping on read, so a value sealed under the old key will not
open under the new one. That is the design rather than a defect, and in
production the application refuses to start without it instead of falling back to
something weak. A system that quietly encrypts with a default key is worse than
one that does not encrypt, because it reports success.

The master key does **not** protect officer signing keys. Those are sealed under
each officer's own passphrase, which the server never learns, so a stolen master
key still yields no ability to sign in an officer's name. A lost signing
passphrase means revoking that key and enrolling a new one; signatures made
before revocation remain verifiable, which is why revoked keys are retained
rather than deleted.

**Sessions.** There is no signed-cookie session secret to rotate here: a session
is an opaque 32-byte random token whose SHA-256 is stored server-side. The
equivalent action is to revoke every live session, and the day of a move is
exactly when to do it — everyone re-authenticates against the new origin, and any
cookie captured on the old one is already dead. Session cookies are marked
`Secure` in production, so the new deployment must be HTTPS end to end or nobody
stays signed in. Rotate any database credential the old host held, and take a
full backup immediately before and immediately after the cutover.

**A sealed continuity envelope.** The largest single risk to this system is not an
attacker; it is that one person holds every credential and nobody else can
operate it. Prepare an envelope containing the master key, the database location
and access route, the hosting and registrar account recovery details, and where
the offline backup lives. Seal it, record its *existence* — never its contents —
in the Register of Instruments, and lodge it with a named successor custodian or
with counsel. Review and re-seal it annually. Do not put officer signing
passphrases in it: those are personal by design, and an envelope containing them
would destroy the property that makes a signature worth having.

## 7. A staged plan

1. **Today.** Domain registered and locked. Cloudflare DNS and proxy in front of
   wherever the application already runs. TLS on. `APEX_MASTER_KEY` set from a
   secret store. `APEX_PUBLIC_ORIGIN` correct. One offline backup taken and
   restore-tested.
2. **Next.** Cloudflare Access in front of everything except the public
   verification routes and the gazette. Edge rate limiting on the sign-in path.
   Cost: the domain, and a small monthly figure if the Kingdom outgrows the free
   Zero Trust seats.
3. **Then.** Cloudflare Tunnel, so the origin has no inbound port. Move to
   managed Postgres and object storage when more than one process needs the data.
4. **Only if warranted.** The Workers rewrite — when the verification endpoints
   carry sustained public traffic, or global latency genuinely matters, or the
   Kingdom wants no always-on server to patch, *and* the test suite is
   comprehensive enough to serve as the migration contract. Port the Merkle and
   chain modules first. Do not do it for the feeling of having moved.

Each step is independently useful and independently reversible. That property —
not the choice of provider — is what sovereignty over infrastructure actually
consists of.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs. It is not
legal advice, and reading it creates no attorney-client relationship. It is also
not a security guarantee: hosting choices reduce some risks and not others, and
the largest remaining risks in this system are operational rather than technical.
Pricing, product tiers, and platform capabilities described here change without
notice and must be confirmed before they are relied on. The matters it touches
turn on particular facts and on jurisdiction, and warrant licensed Connecticut
counsel before action is taken.
