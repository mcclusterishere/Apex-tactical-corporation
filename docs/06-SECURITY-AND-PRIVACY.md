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
   The device is worth two hundred dollars to the thief and the register on it is
   worth a great deal more to the Kingdom.
3. **An insider dispute.** An officer leaves badly, and had legitimate access to
   everything while they were here. This is the threat most institutions refuse to
   plan for, on the grounds that planning for it is an insult to present company.
4. **An opposing party's discovery request.** Not an attack at all, and more
   likely than any of the above. Everything in this system is discoverable: the
   records, the attachments, the amendment reasons, the audit log of who looked at
   what.
5. **Simple data loss.** A failed disk, a mistaken command, a hosting platform
   that recycled an ephemeral filesystem. Boring, common, and the one that
   actually destroys institutions.

What is **not** in the model: a sophisticated, well-resourced attacker
specifically targeting this organisation. Effort spent on that is effort taken
from backups and account hygiene, which are what will actually be needed. Build
against the five above and the system will be in better condition than most
professional offices.

Note the character of the fourth. The correct response to discovery is a
complete, honest, well-organised production — which is a records problem, not a
security problem. Write every entry, and every amendment reason, in the
expectation that opposing counsel will one day read it aloud. Entries written
that way need no defending.

## 2. Accounts

**One officer, one account. No exceptions, and no shared logins.**

The audit trail is most of what distinguishes this system from a spreadsheet,
and a shared login destroys it at precisely the point where it has to name a
person. A custody entry reading "recorded by the office account" cannot support a
witness at Fed. R. Evid. 901(b)(1), cannot establish who sealed a file, and
cannot exclude anyone when something goes wrong. It converts a register into a
diary with several authors.

Passwords are stored as scrypt derivations with a per-user salt, so the database
does not contain anything that can be replayed as a password. That protects the
Kingdom's stored data; it does nothing about a password reused from elsewhere.
Every officer uses a password manager, a long unique passphrase for this system,
and multi-factor authentication wherever the surrounding platform offers it —
the hosting account, the domain registrar, and the email address that can reset
both, which are all more valuable to an attacker than this application.

Accounts are deactivated the day an officer's commission ends, not at the end of
the month. Sessions are revoked at the same time. The annual review under the
records policy catches what the daily discipline missed.

## 3. Separation of duties

The role model encodes separation deliberately. The Registrar records; Counsel
conducts enforcement and handles evidence; the Treasurer maintains the financial
register; Clerks enter records without the power to seal, hold, or anchor; the
Sovereign holds full authority under Charter Art. VII.

**The Auditor reads everything, including sealed material, and writes nothing.**
That combination looks pointless on an ordinary day and is the most important
arrangement in the system on the day the integrity of the records is questioned.
An examiner who can alter what they examine cannot vouch for it, and a register
whose contents only its author can contradict proves nothing. Because the Auditor
holds no write permission at all, an Auditor account that is compromised leaks
information but cannot forge history — which is a materially different incident
to recover from.

Do not solve an access problem by granting someone a broader role for the
afternoon. Roles that are widened temporarily are never narrowed again.

## 4. Classification discipline

The four levels are set out in the records policy; what matters operationally is
that clearance is enforced in the database query rather than in the page, so a
record above the reader's level is indistinguishable from one that does not
exist. There is no view that leaks a title, a number, or an existence.

Six categories are sealed as a standing rule, and an officer who finds material
of these kinds classified lower should reclassify it and record why:

- the personal data of minors, including photographs, rosters, and attendance;
- ecclesiastical discipline files;
- counsel's work product and communications made for the purpose of legal advice;
- financial detail, as distinct from summary financial position;
- the precise locations of sacred sites;
- lineage and descent information.

The first and the last deserve particular care. Minors' data is the material most
capable of causing real injury to a real person and attracts the highest handling
in every framework that touches it. Precise site locations, once circulated,
cannot be recalled, and the harm is looting and desecration rather than
embarrassment. Publish the fact of a site where publication serves the Kingdom;
never publish the coordinates.

## 5. Personal data

The Kingdom holds identifying information about real people: members and their
children, donors, officers, and parties it is in conflict with. That is ordinary
for an institution of this kind and it creates obligations that do not dissolve
because the holder asserts sovereignty.

The Connecticut Data Privacy Act, Conn. Gen. Stat. §§ 42-515 et seq., gives a
consumer rights to confirm processing and access their data, to correct
inaccuracies, to delete, to obtain a portable copy, and to opt out of certain
processing. A controller must respond without undue delay and within 45 days,
may take one further 45-day extension where complexity reasonably requires it
provided the consumer is told, must answer the first request in any twelve-month
period free, and must operate a conspicuous appeal process with a written
decision. The Attorney General enforces it; there is no private right of action.

**On applicability, honestly:** the act reaches only controllers meeting volume
thresholds, and Connecticut has amended it more than once, including in its
treatment of non-profits. A small religious association very likely falls outside
it. Verify the current text before relying on that — and honour the substance
either way. The reason is practical rather than moral. If this ever matters, the
question put to the Kingdom will not be whether the statute technically applied.
It will be why an organisation that keeps files on people refused to show a
person their own file, and there is no good answer to that question. Every
request is therefore logged in the Register of Data Subject Requests and answered
on the clock, whatever the Kingdom's view of the statute's reach.

A deletion request does not override a preservation duty. Where material is under
legal hold or needed to establish or defend a claim, say so in writing, identify
what is retained and why, and delete when the hold lifts. What is never
acceptable is retaining data while telling the requester it was deleted; that
converts a defensible position into a false statement.

## 6. Retention minimisation is a security control

Data the Kingdom does not hold cannot be breached, cannot be subpoenaed, and
cannot be produced in discovery. Every field collected is a small permanent
liability, and the instinct to collect it because it might one day be useful
should be resisted at the point of collection, where it is free, rather than at
the point of production, where it is not.

Collect what the register's purpose requires and no more. Do not photograph
identity documents where recording the fact of verification would do. Do not keep
a copy of a donor's payment instrument. Where a retention period under section 10
of the records policy has expired and no hold is running, disposal is a
legitimate act — but it is a decided and recorded act, never a quiet one.

## 7. Backups

The database and the evidence store are backed up together and restored
together. One without the other is either a set of references to files nobody
has, or a directory of files named after their own hashes with nothing saying
what any of them are.

Backups live in at least two places, one of them not in the building and not on
the same account as the live system. They are encrypted, because a backup is a
complete copy of every sealed record the Kingdom holds and it travels more than
the live system ever does.

**An untested backup is a hope with a filename.** A backup is proved by
restoring it to a scratch location, signing in against it, opening a sealed
record, and confirming an attachment resolves from its digest. This is done at
least annually, it is recorded in the Registrar's certification, and it will fail
the first time it is attempted. Discovering that in a scheduled test is an
afternoon; discovering it after a disk failure is the end of the register.

## 8. Encryption, and what each kind actually does

**In transit.** Serve over HTTPS only. This defeats interception on hostile
networks and nothing else. Session cookies are marked `Secure` in production, so
plain HTTP simply fails to keep anyone signed in — correct behaviour, not a bug
to be worked around.

**At rest.** Full-disk or volume encryption answers exactly one threat, and it is
the second one in section 1: the lost or stolen laptop, and the decommissioned
drive. It does **not** protect a running system. Once the machine is booted and
unlocked, the database is readable by anything running as that user, which
includes anyone who has the user's session. At-rest encryption is worth having,
and it is worth being clear about what it is for.

Two things in this system are not encryption and should not be described as such.
Passwords are one-way scrypt derivations, not recoverable ciphertext. Session
tokens are 32 random bytes stored as a hash, so the database holds nothing that
can be replayed as a session. Both are stronger properties than encryption, not
weaker ones.

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

This build has no session signing secret to lose: sessions are opaque random
tokens stored hashed, validated by lookup. If the mechanism is ever changed to
signed or JWT cookies, that signing key becomes a credential of the same class as
`DATABASE_URL`, and losing it means an attacker can mint a session for any
office including the Sovereign's. Behind a proxy, set `X-Forwarded-For`
correctly — an audit log that records the load balancer's address for every event
answers no questions at all.

## 10. Incident response, in five steps

This concerns a security incident. For a chain verification failure, follow
`07-OPERATIONS-AND-DEPLOYMENT` instead.

1. **Contain.** Revoke the sessions, reset the credential, take the device off the
   network. Do this before diagnosis; an hour of investigation with the attacker
   still holding a valid session is an hour of further loss.
2. **Preserve.** Copy the audit log, the ledger, and the platform's own logs to
   somewhere read-only before anything else changes. The Kingdom will need to
   prove what happened, and the evidence of it is perishable.
3. **Scope it.** Whose account, what classification of material, over what window,
   and whether sealed records were reached. The audit log answers this. That is
   what it is for.
4. **Notify.** Counsel the same day. Where personal information was involved,
   Connecticut's breach notification statute, Conn. Gen. Stat. § 36a-701b,
   requires notice to affected residents and to the Attorney General without
   unreasonable delay and within a statutory outer limit measured in days from
   discovery — verify the current text and the current period before relying on
   any figure, and treat the clock as running from discovery.
5. **Record and remediate.** Write the incident as a record: what was found, when,
   by whom, what was done, what changed afterwards. An incident honestly recorded
   is survivable. One discovered later by someone else, undocumented, is not.

## 11. The greatest single risk

It is not an attacker. **It is that one person holds all the credentials and no
one else can operate the system.**

If the Founder is unavailable — ill, travelling, or worse — and no one else can
reach the hosting account, restore a backup, or sign in as an administrator, then
the register, the evidence vault, the chains of title, and the entire documentary
basis of the Kingdom's affairs are lost. Not stolen. Simply unreachable, which
has the same effect and attracts no sympathy.

The remedy is a **sealed continuity envelope**, which Charter Art. VII
contemplates in providing for succession. It should:

- name a successor custodian and an alternate, by name, with contact details;
- state where credentials are held and how they are obtained, rather than listing
  passwords in plaintext — a password manager's emergency-access delegation, or a
  secret split between two holders, is materially safer than a written list;
- give the restore procedure in enough detail that a competent stranger could
  follow it, including where the backups are and what proves they worked;
- name counsel and the hosting provider;
- state the trigger on which it may be opened and who may open it.

Hold it with counsel, or in a safe deposit box, or in two sealed copies with two
holders. Review it annually at the same sitting as the chain verification, and
record the review as an instrument. The successor should be told they have been
named, because a custodian who learns of the office from a sealed envelope is a
custodian learning it at the worst possible time.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs. It is not
legal advice, and no attorney-client relationship arises from it. Data protection
obligations, breach notification duties, and the treatment of personal data turn
on the particular facts, on volume thresholds, and on statutes that Connecticut
has amended more than once. Engage licensed Connecticut counsel before acting on
any of it.
