# Security and Privacy

*For the Registrar General, whoever administers this system, and every officer
who holds an account. Read before you are given a login, and again before the
first deployment to a machine other than your own.*

## 1. The threat model, honestly

Security advice fails when it is written for the wrong adversary. The realistic
threats to an institution of this size and kind are five, and they are ordinary:

1. **Credential compromise.** A reused password, a convincing sign-in page, a
   session left open on a shared machine. This is how nearly every small
   organisation loses control of a system.
2. **A lost or stolen laptop.** Not targeted — left in a car, taken from a bag.
   The device is worth two hundred dollars to the thief; the register on it is
   worth a great deal more to the Kingdom.
3. **An insider dispute.** An officer leaves badly, having had legitimate access
   to everything while they were here. Institutions refuse to plan for this on the
   grounds that planning for it insults present company.
4. **An opposing party's discovery request.** Not an attack at all, and more
   likely than any of the above. Everything here is discoverable: the records, the
   attachments, the amendment reasons, the audit log of who looked at what.
5. **Simple data loss.** A failed disk, a mistaken command, a hosting platform
   that recycled an ephemeral filesystem. Boring, common, and the one that
   actually destroys institutions.

What is **not** in the model: a sophisticated, well-resourced attacker targeting
this organisation specifically. Effort spent there is effort taken from backups
and account hygiene, which are what will actually be needed.

The fourth is answered by good records rather than good security: write every
entry, and every amendment reason, expecting opposing counsel to read it aloud
one day. Entries written that way need no defending.

## 2. Accounts

**One officer, one account. No exceptions, and no shared logins.**

The audit trail is most of what distinguishes this system from a spreadsheet, and
a shared login destroys it at precisely the point where it has to name a person.
A custody entry reading "recorded by the office account" cannot support a witness
under Fed. R. Evid. 901(b)(1), cannot establish who sealed a file, and cannot
exclude anyone when something goes wrong.

Passwords are stored as scrypt derivations with a per-user salt, so the database
holds nothing replayable as a password — which protects stored data and does
nothing about a password reused elsewhere. Every officer uses a password manager,
a long unique passphrase here, and multi-factor authentication on the hosting
account, the domain registrar, and the email address that can reset both.

Accounts are deactivated the day a commission ends, not at the end of the month,
and sessions revoked at the same time.

## 3. Separation of duties

The role model encodes separation deliberately: the Registrar records, Counsel
conducts enforcement and handles evidence, the Treasurer keeps the financial
register, Clerks enter records without power to seal, hold, or anchor, and the
Sovereign holds full authority under Charter Art. VII.

**The Auditor reads everything, including sealed material, and writes nothing.**
That looks pointless on an ordinary day and is the most important arrangement in
the system on the day the integrity of the records is questioned. An examiner who
can alter what they examine cannot vouch for it. And because the Auditor holds no
write permission at all, a compromised Auditor account leaks information but
cannot forge history — a materially different incident to recover from.

Do not solve an access problem by widening someone's role for the afternoon.
Roles widened temporarily are never narrowed again.

## 4. Classification discipline

Clearance is enforced in the database query rather than in the page, so a record
above the reader's level is indistinguishable from one that does not exist. No
view leaks even its existence.

Six categories are sealed as a standing rule, and an officer who finds such
material classified lower reclassifies it and records why:

- the personal data of minors, including photographs, rosters, and attendance;
- ecclesiastical discipline files;
- counsel's work product and communications made for the purpose of legal advice;
- financial detail, as distinct from summary financial position;
- the precise locations of sacred sites;
- lineage and descent information.

The first and the last deserve particular care. Site coordinates, once
circulated, cannot be recalled, and the harm there is looting rather than
embarrassment: publish the fact of a site where that serves the Kingdom, never
the coordinates.

## 5. Personal data

The Kingdom holds identifying information about real people — members and their
children, donors, officers, and parties it is in conflict with. That is ordinary
for an institution of this kind, and it creates obligations that do not dissolve
because the holder asserts sovereignty.

The Connecticut Data Privacy Act, Conn. Gen. Stat. §§ 42-515 et seq., gives a
consumer rights to access, correct, delete, and port their personal data. A
controller must respond within 45 days, may take one further 45-day extension
where complexity requires it and the consumer is told, and must operate a
conspicuous appeal process deciding in writing. The Attorney General enforces it;
there is no private right of action.

**On applicability, honestly:** the act reaches only controllers meeting volume
thresholds, and Connecticut has amended it more than once, including in its
treatment of non-profits. A small religious association very likely falls outside
it. Verify the current text before relying on that — and honour the substance
either way. The reason is practical rather than moral: if this ever matters, the
question put to the Kingdom will not be whether the statute technically applied,
but why an organisation that keeps files on people refused to show a person their
own file. There is no good answer to that question. Every request is therefore
logged in the Register of Data Subject Requests and answered on the clock.

A deletion request does not override a preservation duty. Where material is under
legal hold or needed to defend a claim, say so in writing, identify what is
retained and why, and delete when the hold lifts. What is never acceptable is
retaining the data while telling the requester it was deleted; that converts a
defensible position into a false statement.

## 6. Retention minimisation is a security control

Data the Kingdom does not hold cannot be breached, cannot be subpoenaed, and
cannot be produced in discovery. Every field collected is a small permanent
liability, and the instinct to collect it because it might one day be useful
should be resisted at the point of collection, where it is free, not at the point
of production, where it is not.

Collect what the register's purpose requires and no more; do not photograph
identity documents where recording the fact of verification would do. Where a
retention period has expired and no hold is running, disposal is legitimate — but
it is a decided and recorded act, never a quiet one.

## 7. Backups

The database and the evidence store are backed up together and restored together.
One without the other is either references to files nobody has, or files named
after their own hashes with nothing saying what they are.

Backups live in at least two places, one of them off site and not on the same
account as the live system, and they are encrypted: a backup is a complete copy
of every sealed record the Kingdom holds.

**An untested backup is a hope with a filename.** A backup is proved by restoring
it to a scratch location, signing in against it, opening a sealed record, and
confirming an attachment resolves from its digest — annually, and recorded in the
Registrar's certification. It will fail the first time: discovering that in a
scheduled test costs an afternoon, discovering it after a disk failure is the end
of the register.

## 8. Encryption, and what each kind actually does

**In transit.** Serve over HTTPS only. This defeats interception on hostile
networks and nothing else. Session cookies are marked `Secure` in production, so
plain HTTP simply fails to keep anyone signed in — correct behaviour, not a bug
to work around.

**At rest.** Full-disk or volume encryption answers exactly one threat: the lost
or stolen laptop, and the decommissioned drive. It does **not** protect a running
system — once the machine is booted and unlocked, the database is readable by
anything running as that user. Worth having, and worth being clear about what it
is for.

Two things here are not encryption and should not be described as such: passwords
are one-way scrypt derivations, not recoverable ciphertext, and session tokens are
32 random bytes stored as a hash. Both are stronger properties than encryption,
not weaker ones.

## 9. Deployment posture

| Variable | Class | Note |
|---|---|---|
| `DATABASE_URL` | **Credential** | Never in the repository, an issue, or a support ticket |
| `STORAGE_DIR` | Configuration | Must point at a persistent volume, or evidence vanishes on deploy |
| `SEED_FOUNDER_EMAIL` | Configuration | Seed-time only |
| `SEED_FOUNDER_PASSWORD` | **Credential** | Prefer to omit it and use the generated password once |
| `NODE_ENV=production` | Configuration | Secure cookies depend on it — verify it is set |

`.env` is git-ignored and stays that way. A credential that has ever been
committed is compromised even after the commit is removed, because the history
persists in every clone; the remedy is rotation, not deletion.

This build has no session signing secret to lose — sessions are opaque random
tokens, stored hashed and validated by lookup. If that ever changes to signed or
JWT cookies, the signing key becomes a credential of the same class as
`DATABASE_URL`: losing it lets an attacker mint a session for any office,
including the Sovereign's. Behind a proxy, set `X-Forwarded-For` correctly.

## 10. Incident response, in five steps

This concerns a security incident. For a chain verification failure, follow
`07-OPERATIONS-AND-DEPLOYMENT` instead.

1. **Contain.** Revoke the sessions, reset the credential, take the device off the
   network — before diagnosis. An hour of investigation with the attacker still
   holding a valid session is an hour of further loss.
2. **Preserve.** Copy the audit log, the ledger, and the platform's own logs
   somewhere read-only before anything else changes. That evidence is perishable,
   and the Kingdom will need to prove what happened.
3. **Scope it.** Whose account, what classification of material, over what window,
   and whether sealed records were reached. The audit log answers this; that is
   what it is for.
4. **Notify.** Counsel the same day. Where personal information was involved,
   Connecticut's breach notification statute, Conn. Gen. Stat. § 36a-701b,
   requires notice to affected residents and to the Attorney General without
   unreasonable delay and within a statutory outer limit measured from discovery.
   Verify the current period before relying on any figure.
5. **Record and remediate.** Write the incident as a record: what was found, when,
   by whom, what was done, and what changed afterwards. An incident honestly
   recorded is survivable; one discovered later by someone else, undocumented, is
   not.

## 11. The greatest single risk

It is not an attacker. **It is that one person holds all the credentials and no
one else can operate the system.**

If the Founder is unavailable — ill, travelling, or worse — and no one else can
reach the hosting account, restore a backup, or sign in as an administrator, then
the register, the evidence vault, and the chains of title are lost. Not stolen.
Simply unreachable, which has the same effect and attracts no sympathy.

The remedy is a **sealed continuity envelope**, which Charter Art. VII
contemplates in providing for succession. It should:

- name a successor custodian and an alternate, by name, with contact details;
- state where credentials are held and how they are obtained, rather than listing
  passwords in plaintext — a password manager's emergency-access delegation, or a
  secret split between two holders, is materially safer than a written list;
- give the restore procedure in enough detail that a competent stranger could
  follow it, including where the backups are and what proves they worked;
- name counsel and the hosting provider;
- state the trigger on which it may be opened, and who may open it.

Hold it with counsel, in a safe deposit box, or in two sealed copies with two
holders. Review it annually at the same sitting as the chain verification and
record the review as an instrument. Tell the successor they have been named: a
custodian who learns of the office from a sealed envelope is learning it at the
worst possible time.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs. It is not
legal advice, and no attorney-client relationship arises from it. Data protection
obligations, breach notification duties, and the treatment of personal data turn
on the particular facts, on volume thresholds, and on statutes Connecticut has
amended more than once. Engage licensed Connecticut counsel before acting on any
of it.
