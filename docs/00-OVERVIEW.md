# The Register: what it is and how to use it

*For every officer of Apex Kingdom, on the day they are commissioned. Read this
before you touch the register; read `01-LEGAL-POSTURE` before you act on
anything in it.*

## Why the Kingdom keeps a register

An institution is, in practice, the records it can produce. When a municipality
asks who owns a building, when an opposing party asks when a mark was first
used, when a member's family asks what was agreed in 2019, when an agency asks
what the Kingdom is — the answer is whatever can be shown, dated, and traced to
someone who wrote it down at the time. Recollection is not an answer. A folder
of undated printouts is not an answer.

This system exists so that the Kingdom always has the answer, and so that the
answer holds up when someone hostile examines it.

## The three things that make it more than a filing cabinet

**Contemporaneous recording.** A record made the day the thing happened is worth
many times one assembled later, and everyone who deals with records knows it.
The registers are designed to be quick to enter so that entries actually get
made on the day.

**The hash chain.** Every act of the Registrar is committed as a link bound by
cryptographic hash to the link before it. Nothing is edited in place and nothing
is deleted. A correction is an amendment with a stated reason, and the amendment
is itself recorded. A withdrawal is a void notation, and the entry stays. This
means the register cannot be quietly improved after the fact — and, more
usefully, it means the Kingdom can *prove* it was not.

**External anchoring.** The chain proves internal consistency. It cannot prove
dates on its own, because whoever holds the database could regenerate the whole
thing. Publishing the chain's head hash somewhere the Kingdom does not control —
a certified letter, a timestamp authority, a public commit — fixes every entry
beneath it as provably older than that publication. This is the single most
valuable ten minutes of work available in this system, and it is the step most
often skipped.

## How the pieces fit

The **registers** hold the substance: instruments, people, offices, property,
rights, dealings, evidence, funds. Each is declared with its own fields, its own
statuses, and its own guidance on how it is kept.

The **ledger** records every act performed on the registers.

The **evidence vault** holds the underlying documents and items, addressed by the
digest of their contents, with a custody record for each.

The **calendar** raises the statutory and administrative deadlines that the
registers generate from their own data — most importantly the copyright
registration window, which decides whether an infringement is worth pursuing at
all.

The **gazette** publishes. Publication creates notice to the world, which is a
different and sometimes more useful thing than a record in a drawer.

**Certified extracts** are what leave the building. Each carries the record's
content digest, its position in the ledger, its covering anchor, and a public
verification address that requires no account and no cooperation from the
Kingdom.

## Classification

Four levels: **Public**, **Members**, **Officers**, **Sealed**. Clearance is
checked in the database query, not in the page, so a record above your level is
indistinguishable from one that does not exist.

Sealed exists because some material genuinely must not circulate even among
officers: discipline files, the personal data of minors, counsel's work product,
financial detail, precise locations of sacred sites, and lineage information. A
single "private" flag collapses those distinctions and invites over-disclosure.

## The offices

Eight, and the separation between them is deliberate.

The **Sovereign** holds full authority under Charter Art. VII. The **Registrar
General** keeps the registers and anchors the chain. **Counsel** conducts rights
enforcement and handles evidence. The **Treasurer** maintains the financial
register. **Clerks** enter records without the power to seal, hold, or anchor.
The **Auditor** reads everything, including sealed material, and writes nothing.
**Members** read member-level records. **Observers** see the public register.

The Auditor role is worth dwelling on. It exists so that the register can be
examined by someone with no power to alter it. That arrangement is worth very
little on an ordinary day and worth everything on the day the integrity of the
records is questioned — which is exactly the day nobody plans for.

**One officer, one account.** A shared login destroys the audit trail, and the
audit trail is most of what distinguishes this from a spreadsheet.

## What the register does not do

It does not confer status. It does not create rights. It does not bind anyone
outside the Kingdom, and no entry in it — however carefully recorded, however
well anchored — obliges any government, court, or person to do anything.

What it does is make the Kingdom's own position clear, dated, provable, and
consistent. In practice that is most of what wins arguments, because most
arguments are lost by the party that cannot show what it did or when.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs. It is
not legal advice, and reading it creates no attorney-client relationship. The
matters it touches turn on particular facts and on jurisdiction, and warrant
licensed Connecticut counsel before action is taken.
