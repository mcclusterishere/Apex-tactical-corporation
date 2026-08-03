# Identity and Credentials

*For the Registrar General, for every officer who issues a credential, and for
any member who carries one. Read it before the first card is printed, before any
credential design is changed, and before answering a member who asks what their
card is good for.*

## 1. What a credential of the Kingdom is

A credential issued by Apex Kingdom is a statement the institution makes about a
person, addressed to whoever is shown it: that this person is enrolled on the
Roll of Citizens, or holds a named office, or is ordained, or is engaged under
contract, or may enter the archive. It attests to standing **within a private
association** and to nothing else. It confers no authority over anyone who has
not consented to the Kingdom's authority, and it is not a document of, or a
filing with, any government.

That is entirely lawful, and lawful in an unremarkable way. A union card, a
parish membership card, a library card, a bar association card, and a Kingdom
credential are the same species of document: a private body saying who belongs to
it and what they do for it. No permission is needed to issue one and no
government registers them, and the credential is not weaker for that: a union
card's whole value is that the union stands behind what it says.

## 2. The line, and where it is drawn

What converts a lawful membership card into a criminal act is **resemblance to
government identification or to a law-enforcement credential**, together with how
it is presented.

In Connecticut, holding oneself out as another or as a fictitious person to
deceive is criminal impersonation under Conn. Gen. Stat. § 53a-130, and
impersonating a police officer has its own offence at Conn. Gen. Stat.
§ 53a-130a. Federal law reaches the insignia directly: 18 U.S.C. § 701 covers
badges, identification cards, and other insignia of the United States and its
departments and agencies, and 18 U.S.C. § 912 reaches pretending to be an officer
or employee of the United States. Documents purporting to be issued by a
governmental body are the subject matter of 18 U.S.C. § 1028, and a fabricated
instrument appearing to be officially issued also engages the Connecticut forgery
statutes at Conn. Gen. Stat. § 53a-137 et seq.

None of those requires that anyone was deceived, that money changed hands, or
that the Kingdom meant harm. They turn on what the document looks like and what
it is held out as being. So there are two ways to fail: **design**, producing
something that looks like a state document, and **use**, where a proper card
reading "Member in good standing" becomes a problem the instant a holder slides
it across a counter in answer to "may I see some identification". The second is
the one that will actually happen.

## 3. The design rules that follow

No state seal or anything reading as a public device. No flag of the United
States or of Connecticut positioned as the issuing authority — a flag in a
photograph on a wall is not the issue; a flag beside the issuer's name is. No
eagle-and-shield device, no shield outline, no starburst, no badge silhouette
anywhere on the card or in its seal. Size is not the problem — a card the size of
a credit card is a card — but a shield is a badge at any size.

In wording: never "official identification", "identity card", "ID card",
"government", "state", "national", "federal", "agent", or any rank borrowed from
policing. Describe standing instead — *Member in good standing*, *Commissioned
to the office of Registrar General*, *Ordained*, *Contractor, no authority to
bind the Kingdom*.

Required on every credential: the issuer named in full as **Apex Kingdom**; a
credential number; issue and expiry dates; the verification address and code; and
the printed notice of limitations stating that the credential attests to standing
within a private religious society and cultural institution, is not government
identification, confers no governmental or law-enforcement authority, and may not
be presented as identification to any public authority.

The system enforces the wording half rather than leaving it to discipline.
`src/lib/credentials.ts` keeps a closed list of seven credential types, screens
every free-text field against a forbidden-terms list before anything is written,
and prints a disclaimer that cannot be configured away.

## 4. Enrolment, proofing, photographs, expiry

Proof of identity at enrolment should be proportionate to what the credential
permits — NIST SP 800-63A, the federal guidance on enrolment and identity
proofing, is a useful benchmark for the idea that assurance comes in levels
rather than being present or absent. For a membership credential, an entry on the
Roll made by an officer who knows the person is proportionate. For an officer
commission or ministerial credential, the underlying office or ordination record
and the minute appointing them are the proof. For anything that opens a door —
archive access, a contractor credential admitting someone to a building, any role
involving minors or vulnerable adults — sight a government-issued photographic
identification and record **that it was sighted**, its type, and the date. Do not
photograph it, scan it, or write down its number. What the Kingdom does not hold
cannot leak and cannot be subpoenaed from the Kingdom.

**Photographs** matter because a credential without one is a bearer token:
whoever holds the card is, in practice, the person named on it. A photograph
binds the document to a body. Hold a current one for any credential that will be
shown to anyone and refresh it on renewal; a ten-year-old photograph invites
argument about whether the card belongs to the bearer.

**Expiry dates** matter for a different reason. The population of credentials in
circulation only grows unless something removes them, and nothing removes them
reliably except a printed date. Two years is a sound default; a contractor or
delegate credential expires with the engagement. The register raises each one
thirty days out, so renewal or lapse is a decision rather than a drift.

## 5. The cryptographic side, in plain terms

Every credential has a **payload**: a canonical text of exactly what it says — the
number, type, holder's name, standing, dates, verification code, and the notice
that it is not government identification, assembled identically every time so the
same credential always produces the same bytes. The issuing officer **signs** that
payload with an Ed25519 private key that exists only in sealed form and opens only
under their own passphrase, which the server never learns.

A signature proves two things and exactly two: that the payload has not changed
by a single character since signing, and that it was produced by someone holding
that officer's key. It does not prove the person in front of you is the holder,
and it does not prove the credential is still in force today.

The **verification code** is ten characters in two groups of five, from an
alphabet with no I, L, O, or U, because its job is to survive being read aloud
over a counter and typed into a phone by a stranger. A **QR code**, where
printed, is nothing more than the same verification address in machine-readable
form: it saves typing and proves nothing on its own, since a QR on a forged card
can point anywhere, including at a convincing fake. Verifiers check that the
address they land on is the Kingdom's own domain, not that the scan succeeded.

This is why **a forged card fails on signature rather than on appearance**.
Appearance is copyable; anyone with a printer can reproduce a card, which is why
money spent on holograms keeps failing. What a forger cannot produce is a valid
signature over a payload naming their invented details, because that needs an
officer's key — and because the check runs against the Kingdom's register, a card
whose printed standing differs from what the check returns is discredited by the
difference itself. The design conclusion is the opposite of the intuitive one: do
not spend effort making the card hard to copy. Spend it making the check easy to
run, and give the verification address the same weight on the card as the
holder's name. The check is deliberately public and needs no account, because a
credential nobody can verify is decoration.

## 6. Revocation, which is the part that actually matters

The issue list is administrative. The revocation list is the half with legal
consequences.

An unrevoked credential in a former officer's hands is a representation by the
Kingdom to everyone that person meets. Apparent authority is measured by what the
principal allowed a third party reasonably to believe, not by what the principal
privately intended — Restatement (Third) of Agency § 2.03. A former officer with
a valid-looking commission who signs something, accepts money, or walks into a
building carries authority the Kingdom manufactured and will be held to.

So **revoke on the day the office ends, not the day the card comes back.**
Resignation, removal, withdrawal from the Roll, the end of a contract, a report
of loss or theft, and death are all revocation events. Revoke first and collect
later; recovery is preferable but never a precondition. A credential reported
lost is in someone's hands — revoke it and reissue under a new number. And treat
expiry as a prompt rather than a substitute: an expired card is indistinguishable
from a valid one in the pocket of whoever carries it, so a credential not renewed
is revoked on its expiry date.

## 7. Data minimisation

A credential is shown to strangers, and everything on it is disclosed to whoever
is handed it — often to people the holder did not choose: the person behind them
in the queue, a phone camera, a photocopier.

So the card carries the holder's name, the type, the standing, the dates, the
number, the verification code, the issuer, and the notice. Nothing else. **No
date of birth. No address. No lineage or descent information. No national or
state identifier. No medical or family information. No household number that
indexes into anything sensitive.** The signed payload carries the same minimal
set, which is what makes it safe for the public check to return it — running the
check discloses nothing that handing the card over did not. Answer every future
request to "just add one field" by asking who ends up holding it. The answer is
always: everyone the holder ever shows the card to.

## 8. Retention and destruction of surrendered credentials

The *record* of a credential is permanent — register entries are amended and
voided, never deleted. The *physical credential* is not. On surrender, record the
return against the register entry, then destroy the card: cut through the
photograph and the number, cross-cut shred paper certificates, and log the
destruction with its date and the officer who did it, two officers signing for a
batch. Do not keep a drawer of intact surrendered cards; one kept whole can be
lost a second time, and the second loss is the Kingdom's fault rather than the
holder's.

Photographs are retained only while needed — the current one and at most the one
before it — and disposed of under the retention schedule when the holder leaves
the Roll, subject to any legal hold.

## 9. If a member is stopped by police while carrying a credential

Present the member's **actual State of Connecticut identification** — their
driver's licence or state identification card. That is what the officer is asking
for and the only document that answers the question. A driver stopped while
operating a motor vehicle must produce their licence, and a state may require a
person to state their name during a lawful investigative stop (*Hiibel v. Sixth
Judicial District Court of Nevada*, 542 U.S. 177 (2004), applying *Terry v.
Ohio*, 392 U.S. 1 (1968)).

Do not offer the Kingdom credential, do not place it on top of the licence, and
do not hand over a wallet with it displayed. If the officer sees it and asks,
describe it accurately and briefly: *it is a membership card for a private
religious society I belong to; it is not identification.* That answer is true,
short, and ends the topic.

A member must never say the credential exempts them from anything, confers
immunity, evidences a status recognised by the state, or entitles them to
different treatment. That is the precise conduct the impersonation statutes
punish, and one member saying it on a roadside is enough to put the Kingdom's
whole credentialling practice in front of a prosecutor. Where a credential was
discussed with any public official, the member tells the Registrar and it is
recorded — as an incident, and, where the official asked about the Kingdom
itself, in the Register of Government Contacts.

## What this document is not

This is an operating manual prepared to organise the Kingdom's affairs and to
keep its officers on defensible ground. It is not legal advice, and reading it
creates no attorney-client relationship. Every matter it touches turns on
particular facts and on the jurisdiction in which the question arises, and the
law changes. Engage licensed Connecticut counsel before acting on any of it, and
in particular before approving a credential design.
