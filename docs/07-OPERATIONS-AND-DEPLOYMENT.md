# Operations and deployment

*For whoever runs this system. Read before deploying, and again before the first
backup restore test.*

## What has to survive

Two things, and they must survive **together**:

- **`data/ledger.db`** — the registers, the ledger, the audit log, the accounts.
- **`storage/`** — every attached document and item, addressed by the SHA-256 of
  its own contents.

The database without the evidence store is a set of records that reference files
nobody has. The evidence store without the database is a directory of files named
after their own hashes, with nothing saying what any of them are. Back them up in
the same operation, restore them in the same operation, and test the restore.

An untested backup is not a backup. It is a hope with a filename.

## Running locally

```bash
npm install
cp .env.example .env
npm run db:push
npm run seed
npm run dev
```

Node 20 or later. The seed prints an initial password for the Sovereign's account
exactly once; change it at first sign-in.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Connection string. Default is SQLite at `data/ledger.db`. |
| `STORAGE_DIR` | Where attachments are written. Default `./storage`. |
| `SEED_FOUNDER_EMAIL` | Overrides the Sovereign's email at seed time. |
| `SEED_FOUNDER_PASSWORD` | Sets the initial password instead of generating one. |

`DATABASE_URL` is a credential. It never enters the repository, never goes in a
support ticket, and never travels in the same message as anything else needed to
use it. `.env` is git-ignored; keep it that way.

## Hosting

SQLite is the right choice for a single office and should not be talked out of
lightly — it is one file, it is trivially backed up, and it has no operational
surface to get wrong.

For a hosted deployment where more than one process touches the data, switch to
Postgres:

1. In `prisma/schema.prisma`, change the datasource `provider` to `"postgresql"`.
2. Set `DATABASE_URL` to the Postgres connection string.
3. `npm run db:push`, then `npm run seed`.

No other change is required — nothing in the application depends on SQLite.

**Attachments do not live in the database.** On a platform with an ephemeral
filesystem, `STORAGE_DIR` must point at a mounted persistent volume, or evidence
will disappear on the next deploy. Verify this before the first upload, not after.

### Behind a proxy

Set `X-Forwarded-For` correctly at the proxy. The audit log records the client
address, and an audit log that records the load balancer's address for every event
is an audit log that answers no questions.

Serve over HTTPS. Session cookies are marked `Secure` in production, so plain HTTP
will simply fail to keep anyone signed in — which is the correct behaviour, not a
bug to work around.

## The operating calendar

**Every day the office is open.** Enter what happened the same day. This is the
whole discipline; everything else is bookkeeping around it.

**Weekly.** Check `/calendar`. Anything critical and inside thirty days gets
dealt with, not noted.

**Monthly.**
```bash
npm run chain:verify     # recompute the entire chain and every stored digest
npm run chain:anchor     # print the head; anchor it; record the anchor at /chain
```
Verification exits non-zero on failure, so it can be wired into cron or a
monitoring check. Anchoring is the step that will get skipped because nothing
visibly breaks when it is — put it in the calendar as a recurring obligation of
the office, not a task.

**Before anything leaves the building** — a demand letter, a filing, a certified
extract handed to an official — anchor first if the head has moved. A certificate
covered by an anchor says the record provably existed by a given date. One that is
not says the Kingdom asserts it did.

**Annually.** The Registrar runs a full verification, restores a backup to a
scratch location and confirms it works, reviews every account and deactivates
those no longer needed, reviews open legal holds and releases those whose matters
have closed, and reports the result to the Sovereign. Record that report as an
instrument.

## Incident response

1. **Stop writing.** If the chain fails verification, preserve the database
   exactly as it stands. The pattern of failures is itself evidence of what
   happened, and further writes destroy it.
2. **Copy, do not move.** Take a byte copy of `data/` and `storage/` to somewhere
   read-only before any diagnosis.
3. **Read the failure.** A payload-hash mismatch means a stored record was edited
   outside the application. A sequence gap means entries were deleted. A
   prev-hash mismatch means entries were reordered or inserted. Each points at a
   different cause.
4. **Establish the last good anchor.** Everything at or below the last externally
   anchored position can still be proved, whatever happened afterwards. This is
   the reason to anchor often.
5. **Record it.** Write an instrument describing what was found, when, and what
   was done. An incident honestly recorded is survivable; an incident discovered
   later by someone else is not.

## Upgrades

Run `npm run typecheck` and `npm run chain:verify` after any dependency update.
The verification matters more than the typecheck: a change to `src/lib/canonical.ts`
would silently invalidate every hash ever written, which is why that file carries
a warning not to modify it. If a future change to hashing is ever genuinely
required, the correct approach is a new algorithm version recorded on each entry,
never a rewrite of the old ones.

## Known dependency advisories

`npm audit` reports advisories in `postcss` and `sharp`. Both are transitive
dependencies bundled inside Next.js itself, not direct dependencies of this
project. `npm audit fix --force` "resolves" them by downgrading Next.js to
version 9, which is not a fix. They are addressed by upgrading Next.js when a
patched release is available. Neither is reachable from this application's request
handling: `sharp` is used for image optimisation, which this application does not
use, and the `postcss` issues concern build-time CSS processing of source this
repository controls.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs. It is not
legal advice, and reading it creates no attorney-client relationship. The matters
it touches turn on particular facts and on jurisdiction, and warrant licensed
Connecticut counsel before action is taken.
