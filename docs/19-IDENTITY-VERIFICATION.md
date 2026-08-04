# Identity verification

*How a person proves to the Office of the Registrar that they are who they say
they are, and — more importantly — what the Kingdom deliberately refuses to hold
while doing it.*

---

## 1. The shape of it

A member of the public opens `/claim`, states a name, agrees to the check, and
is sent to **Didit**, an independent identity verification service. Didit reads
the document, checks it is genuine, takes a photograph of the person's face,
confirms the face is live rather than a printout, and matches it to the
document. The person returns to `/claim/return`. The verdict arrives at the
Kingdom separately, over a signed webhook.

The claim then sits in a queue at `/claims` until an officer decides it.

**Verification confers nothing.** A machine saying *this licence is genuine and
it is this person's* is not the Kingdom saying *this person is one of ours*.
Those are different statements and only an officer makes the second one. The
code enforces this: `reviewClaim` refuses to accept any claim the verifier did
not approve, so the queue cannot be used to admit somebody by clicking the
right button.

## 2. What is kept, and what is refused

The Kingdom **never receives** a document image, a scan, a portrait, a selfie,
or any measurement of a face. Those live with the verifier under the verifier's
retention policy and the verifier's liability.

What the register keeps, and nothing else:

| Kept | Why |
|---|---|
| The name the person claimed | It is their own assertion |
| The name on the document | The gap between the two is itself evidence |
| Document **type** and issuing **country** | Enough to describe the check |
| SHA-256 **digest** of the document number | Catches one document claiming two identities; cannot be reversed |
| Birth **year** | Enough to tell two people apart; a full date is a stronger thing to lose |
| The verifier's status, and when | The verdict |

`distil()` in `src/lib/identity.ts` is the single choke point where the
verifier's response is reduced to that list. It is tested against a decision
stuffed with portrait URLs, document images, street addresses and a raw document
number, and asserted to drop every one of them. If that function stays narrow,
the register cannot start accumulating biometrics by accident later.

## 3. Why this is not merely tidy

Holding face geometry is a live legal exposure in the United States. The
Illinois Biometric Information Privacy Act carries a **private right of action**
and statutory damages assessed per violation — the reason for the enormous
settlements in that area — and Texas (CUBI) and Washington have their own
statutes. An organisation that stores face templates is a defendant waiting for
a plaintiff.

Letting the vendor perform the biometric match and keeping only their answer is
what places the Kingdom outside that exposure. This is a structural protection,
not a policy one: there is no code path that can write a portrait into this
database, because the field does not exist.

## 4. The append-only problem, and how it is solved

This register's ledger **cannot be edited or deleted**. That is its whole value,
and it is also a trap: anything written into a chain payload is written
permanently, so a name in a ledger entry is a name that can never be erased on
request.

So no identity chain payload carries personal data. The four identity events —
`IDENTITY_CLAIM_OPENED`, `IDENTITY_CLAIM_DECIDED`, `IDENTITY_CLAIM_REVIEWED`,
`IDENTITY_CLAIM_LINKED` — carry only opaque identifiers (a claim id, a session
UUID), a status, and digests.

The erasable personal data lives in a row that can actually be erased.
`forgetClaim()` empties it. What survives is the provable fact that a claim
existed and how it was decided — which is what a register is for — with nothing
about the person left in the chain, because nothing about the person was ever
put there.

That is how an immutable ledger and a right to erasure coexist. It only works
if the rule is kept absolutely: **never put personal data in a chain payload.**

## 5. The webhook is the attack surface

`/api/didit/webhook` is the one endpoint an outside party can write through, so
it refuses on anything less than a fully valid, freshly signed request:

- The **raw body** is read as text before parsing, because the signature is over
  the exact bytes. Parsing and re-serialising would change them.
- **HMAC-SHA256** compared in **constant time**, so the comparison cannot leak
  the expected signature a byte at a time.
- A timestamp more than **300 seconds** old or in the future is refused, so a
  captured request cannot be replayed.
- An **unrecognised status** is refused rather than stored, so the verifier
  inventing a new value can never be read as an approval.
- With **no webhook secret configured it fails closed** — 503, not "accept
  anything".

Twenty-two of the fifty-one tests in `tests/identity.test.ts` exist to prove
those refusals, including tampered bodies, wrong secrets, truncated signatures,
and both edges of the replay window.

## 6. Configuration

Two environment variables, neither ever committed:

```
DIDIT_API_KEY=          # from the Didit console
DIDIT_WEBHOOK_SECRET=   # from the webhook destination you create in Didit
```

Preflight warns if one is set without the other, because that half-state is
worse than none: claims are opened and their results never arrive, so people
verify themselves into a queue that never updates.

The default workflow is Didit's **Free KYC** — OCR, liveness, face match,
IP analysis — which carries a free allowance of 500 checks a month.

**To finish the setup**, create a webhook destination in the Didit console
pointing at `https://<your-domain>/api/didit/webhook`, then set the secret it
gives you as `DIDIT_WEBHOOK_SECRET`. Until that is done the endpoint correctly
refuses every request and no verification result will ever land.

## 7. What is not built

- **No automatic enrolment.** Accepting a claim can attach it to a Roll of
  Citizens record, but does not create one. Admission remains a deliberate act.
- **No duplicate blocking.** The document digest is stored and indexed so a
  repeat can be *found*, but nothing refuses it automatically. Deciding that a
  second claim on one document is fraud rather than a correction is a judgement,
  and it belongs to an officer.
- **No retention timer.** Nothing purges old claims yet. Someone must decide how
  long a refused claim should persist, and that is a policy question, not a code
  one.
