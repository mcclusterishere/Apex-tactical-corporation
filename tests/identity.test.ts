/**
 * Identity-claim tests.
 *
 * The webhook is the one place an outsider can write into this register, so
 * most of what follows is about refusing bad writes rather than accepting good
 * ones. The distillation tests matter just as much for a quieter reason: they
 * are what keeps document images and biometrics from ever reaching the database
 * if the verifier starts returning more than it does today.
 */
import { createHmac } from "node:crypto";
import {
  verifyWebhook,
  distil,
  documentDigest,
  nameDigest,
  isClaimStatus,
  isApproved,
  isTerminal,
  CLAIM_STATUSES,
} from "../src/lib/identity";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}

const SECRET = "test-webhook-secret";
const NOW = 1_800_000_000;

function sign(body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

// --- Status vocabulary -----------------------------------------------------

check("all documented statuses are recognised", CLAIM_STATUSES.every(isClaimStatus));
check("an invented status is refused", !isClaimStatus("Totally Fine"));
check("a lookalike status is refused", !isClaimStatus("approved"));
check("null is not a status", !isClaimStatus(null));
check("only Approved counts as approved", isApproved("Approved"));
check("In Review is not approved", !isApproved("In Review"));
check("Declined is not approved", !isApproved("Declined"));
check("Approved is terminal", isTerminal("Approved"));
check("Declined is terminal", isTerminal("Declined"));
check("In Progress is not terminal", !isTerminal("In Progress"));

// --- Webhook signature -----------------------------------------------------

const body = JSON.stringify({ session_id: "abc", status: "Approved" });

check(
  "a correctly signed, fresh webhook is accepted",
  verifyWebhook(body, sign(body), String(NOW), SECRET, NOW),
);
check(
  "a tampered body is refused",
  !verifyWebhook(body + " ", sign(body), String(NOW), SECRET, NOW),
);
check(
  "a signature made with the wrong secret is refused",
  !verifyWebhook(body, sign(body, "wrong-secret"), String(NOW), SECRET, NOW),
);
check("a missing signature is refused", !verifyWebhook(body, null, String(NOW), SECRET, NOW));
check("a missing timestamp is refused", !verifyWebhook(body, sign(body), null, SECRET, NOW));
check("an empty secret is refused", !verifyWebhook(body, sign(body), String(NOW), "", NOW));

// Replay protection: the window is five minutes each way.
check(
  "a webhook 299 seconds old is accepted",
  verifyWebhook(body, sign(body), String(NOW - 299), SECRET, NOW),
);
check(
  "a webhook 301 seconds old is refused",
  !verifyWebhook(body, sign(body), String(NOW - 301), SECRET, NOW),
);
check(
  "a webhook 301 seconds in the future is refused",
  !verifyWebhook(body, sign(body), String(NOW + 301), SECRET, NOW),
);
check(
  "a non-numeric timestamp is refused",
  !verifyWebhook(body, sign(body), "not-a-time", SECRET, NOW),
);
check(
  "a truncated signature is refused",
  !verifyWebhook(body, sign(body).slice(0, 32), String(NOW), SECRET, NOW),
);
check(
  "an empty signature is refused",
  !verifyWebhook(body, "", String(NOW), SECRET, NOW),
);
check(
  "surrounding whitespace on the signature is tolerated",
  verifyWebhook(body, `  ${sign(body)}  `, String(NOW), SECRET, NOW),
);

// --- Digests ---------------------------------------------------------------

check("a document digest is a 64-char hex sha256", /^[0-9a-f]{64}$/.test(documentDigest("D1234567")));
check(
  "document digests normalise case, spaces and punctuation",
  documentDigest("d123 45-67") === documentDigest("D1234567"),
);
check(
  "different documents produce different digests",
  documentDigest("D1234567") !== documentDigest("D7654321"),
);
check(
  "a document digest does not contain the number",
  !documentDigest("D1234567").includes("1234567"),
);
check("name digests normalise case and spacing", nameDigest("  Mae   BEULAH ") === nameDigest("mae beulah"));
check("different names produce different digests", nameDigest("Mae Beulah") !== nameDigest("May Beulah"));

// --- Distillation: what is kept, and more importantly what is dropped -------

const richDecision = {
  status: "Approved",
  id_verifications: [
    {
      first_name: "Mae",
      last_name: "Brinkley",
      date_of_birth: "1921-04-17",
      document_number: "D1234567",
      document_type: "Driving Licence",
      issuing_state: "USA",
      // Everything below must NOT survive distillation.
      portrait_image: "https://example.invalid/portrait.jpg",
      front_image: "https://example.invalid/front.jpg",
      back_image: "https://example.invalid/back.jpg",
      address: "12 Somewhere Road, Weldon NC",
      place_of_birth: "Halifax County",
      full_name: "Mae Beulah Brinkley",
    },
  ],
};

const d = distil(richDecision);
check("status survives distillation", d.status === "Approved");
check("given name survives", d.verifiedGivenName === "Mae");
check("family name survives", d.verifiedFamilyName === "Brinkley");
check("document type survives", d.documentType === "Driving Licence");
check("issuing country survives", d.documentCountry === "USA");
check("birth YEAR is kept", d.birthYear === 1921);

const distilledKeys = Object.keys(d);
check(
  "distillation yields exactly the seven permitted fields",
  distilledKeys.length === 7,
);
const blob = JSON.stringify(d);
check("no portrait URL survives", !blob.includes("portrait"));
check("no document image URL survives", !blob.includes("front.jpg") && !blob.includes("back.jpg"));
check("no street address survives", !blob.includes("Somewhere Road"));
check("no place of birth survives", !blob.includes("Halifax County"));
check("the raw document number never survives", !blob.includes("D1234567"));
check("the full date of birth never survives", !blob.includes("1921-04-17"));
check("only the digest of the document is carried", d.documentDigest === documentDigest("D1234567"));

// A decision with no verification block must not invent data.
const bare = distil({ status: "Declined" });
check("a declined decision keeps its status", bare.status === "Declined");
check("a declined decision yields no name", bare.verifiedGivenName === null);
check("a declined decision yields no document digest", bare.documentDigest === null);
check("a declined decision yields no birth year", bare.birthYear === null);

// An unrecognised status must not be laundered into something usable.
check("an unrecognised status distils to null", distil({ status: "Definitely Fine" }).status === null);
check("a missing status distils to null", distil({}).status === null);

// A single object rather than an array must still be read.
check(
  "a non-array id_verifications is handled",
  distil({ status: "Approved", id_verifications: { first_name: "Solo" } }).verifiedGivenName ===
    "Solo",
);

// Absurd birth years are rejected rather than stored.
check(
  "an implausible birth year is dropped",
  distil({ status: "Approved", id_verifications: [{ date_of_birth: "1543-01-01" }] }).birthYear ===
    null,
);

console.log(`identity: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
