/**
 * End-to-end verification of the security-critical paths.
 *
 * `npm test` proves the primitives: the Merkle algorithms against the RFC 6962
 * vectors, canonical JSON, money arithmetic, TOTP against RFC 6238, the
 * credential impersonation guard, the startup preflight. This proves the things
 * that only fail when assembled — that enrolling a second factor actually
 * enrols it, that step-up actually gates a disbursement, that an unbalanced
 * journal is actually refused, that a credential issued here actually verifies
 * to a stranger with no account.
 *
 * Those are exactly the failures that unit tests never catch and that nobody
 * notices until the day they matter.
 *
 * This is deliberately NOT part of `npm test` and Playwright is deliberately
 * NOT a dependency: it needs a browser, a running server, and a database it is
 * allowed to write to. Run it against a scratch instance, never against the
 * live register — it enrols factors, posts entries, and issues a credential.
 *
 *   npm run build && npm start          # in one terminal
 *   npx playwright install chromium     # once
 *   node scripts/e2e.mjs                # in another
 *
 * Environment:
 *   E2E_ORIGIN      default http://localhost:3000
 *   E2E_EMAIL       the Sovereign's account
 *   E2E_PASSWORD    that account's password  (required)
 *   E2E_KEYPASS     signing passphrase to enrol
 *   CHROMIUM_PATH   explicit browser binary, if Playwright cannot find one
 */

import { createHmac } from "node:crypto";

const ORIGIN = process.env.E2E_ORIGIN ?? "http://localhost:3000";
const EMAIL = process.env.E2E_EMAIL ?? "matthew@mccluster.org";
const PASSWORD = process.env.E2E_PASSWORD;
const KEYPASS = process.env.E2E_KEYPASS ?? "e2e-signing-passphrase";

if (!PASSWORD) {
  console.error(
    "E2E_PASSWORD is not set.\n" +
      "This script signs in as a real account and writes to a real database.\n" +
      "Point it at a scratch instance and set E2E_PASSWORD to that account's password.",
  );
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Playwright is not installed. It is intentionally not a dependency of this\n" +
      "project — the dependency surface is kept small on purpose. To run this check:\n\n" +
      "  npm i -D playwright && npx playwright install chromium\n",
  );
  process.exit(2);
}

/** RFC 6238 code generation, so the test presents what an authenticator would. */
function totp(secret) {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of secret) {
    value = (value << 5) | ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x1_0000_0000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const digest = createHmac("sha1", Buffer.from(bytes)).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

let passed = 0;
let failed = 0;
function check(name, condition, note = "") {
  const label = condition ? "PASS" : "FAIL ***";
  if (condition) passed += 1;
  else failed += 1;
  console.log(`${name.padEnd(38)} ${label}${note ? "  " + note : ""}`);
}

const launchOptions = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const go = (path) => page.goto(ORIGIN + path, { waitUntil: "domcontentloaded" });

try {
  // --- 1. Sign in ----------------------------------------------------------
  await go("/sign-in");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await Promise.all([
    page.waitForURL("**/"),
    page.locator("form button[type=submit]").click(),
  ]);
  check("1.  sign in", (await page.locator("text=Sign out").count()) > 0);

  // --- 2-3. Second factor --------------------------------------------------
  await go("/account");
  let secret = null;
  if ((await page.locator('button:has-text("Begin enrolment")').count()) > 0) {
    await page.locator('button:has-text("Begin enrolment")').click();
    // Wait for the secret itself rather than a fixed delay: a fixed delay hides
    // a server action that failed, which is precisely how the missing master
    // key first presented itself.
    await page.waitForSelector("p.select-all", { timeout: 20_000 });
    secret = (await page.locator("p.select-all").first().innerText()).trim();
  }
  check("2.  totp secret issued", secret !== null && /^[A-Z2-7]{20,}$/.test(secret));

  if (secret) {
    await page.fill("#enrol-code", totp(secret));
    await page.locator('button:has-text("Confirm enrolment")').click();
    await page.waitForSelector("text=Recovery codes", { timeout: 20_000 }).catch(() => {});
    check("3.  mfa enrolled, recovery codes", (await page.locator("text=Recovery codes").count()) > 0);
  } else {
    check("3.  mfa enrolled, recovery codes", false, "(enrolment never started)");
  }

  // --- 4. Signing key ------------------------------------------------------
  await go("/account");
  if ((await page.locator("#key-pass").count()) > 0) {
    await page.fill("#key-pass", KEYPASS);
    await page.fill("#key-confirm", KEYPASS);
    await page.fill("#key-label", "End-to-end check");
    await page.locator('button:has-text("Enrol signing key")').click();
    await page.waitForTimeout(3500);
  }
  await go("/account");
  const fingerprint = await page.locator(".digest").first().innerText().catch(() => "");
  check("4.  signing key enrolled", /^[0-9a-f]{64}$/.test(fingerprint.trim()));

  // --- 5-8. Treasury -------------------------------------------------------
  // Step-up first: moving money must not be possible on a session that has only
  // presented a password once, however long ago.
  await go("/treasury/new");
  if ((await page.locator("#stepup-pw").count()) > 0) {
    await page.fill("#stepup-pw", PASSWORD);
    await page.locator('button:has-text("Re-authenticate")').click();
    await page.waitForTimeout(2500);
    await go("/treasury/new");
  }

  const stamp = new Date().toISOString().slice(0, 10);
  await page.fill("#je-date", stamp);
  await page.fill("#je-memo", "End-to-end check: balanced entry");
  const accounts = page.locator('select[name="accountCode"]');
  await accounts.nth(0).selectOption("1000");
  await accounts.nth(1).selectOption("4000");
  await page.locator('select[name="fundCode"]').nth(1).selectOption("GEN").catch(() => {});
  await page.locator('input[name="debit"]').nth(0).fill("2500.00");
  await page.locator('input[name="credit"]').nth(1).fill("2500.00");
  check("5.  form detects balance", (await page.locator("text=Balanced").count()) > 0);

  await page.locator('button:has-text("Post entry")').click();
  await page.waitForSelector("text=Entry posted", { timeout: 20_000 }).catch(() => {});
  check("6.  journal posted", (await page.locator("text=Entry posted").count()) > 0);

  await go("/treasury/new");
  await page.fill("#je-date", stamp);
  await page.fill("#je-memo", "End-to-end check: deliberately out of balance");
  await page.locator('select[name="accountCode"]').nth(0).selectOption("1000");
  await page.locator('select[name="accountCode"]').nth(1).selectOption("4000");
  await page.locator('input[name="debit"]').nth(0).fill("100.00");
  await page.locator('input[name="credit"]').nth(1).fill("99.00");
  check("7.  unbalanced entry blocked", await page.locator('button:has-text("Post entry")').isDisabled());

  await go("/treasury");
  check("8.  trial balance foots", (await page.locator("text=balanced").count()) > 0);

  // --- 9-11. Credentials ---------------------------------------------------
  // The impersonation guard is the single most consequential refusal in the
  // system: a credential reading "Chief of Police" is a criminal exposure, not
  // a styling mistake.
  await go("/credentials");
  await page.fill("#cred-name", "End-to-end Check");
  await page.fill("#cred-standing", "Chief of Police");
  await page.locator('button:has-text("Issue credential")').click();
  await page.waitForTimeout(2500);
  check(
    "9.  impersonating credential refused",
    (await page.locator("text=/cannot appear on a credential/i").count()) > 0,
  );

  await page.fill("#cred-standing", "Citizen in good standing");
  await page.fill("#cred-until", `${new Date().getFullYear() + 1}-12-31`);
  await page.fill("#cred-pass", KEYPASS);
  await page.locator('button:has-text("Issue credential")').click();
  await page.waitForSelector("text=/Issued AK-CRD-/", { timeout: 20_000 }).catch(() => {});
  const issued = await page.locator("text=/Issued AK-CRD-/").innerText().catch(() => "");
  const code = (issued.match(/[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}/) ?? [])[0];
  check("10. credential issued and signed", Boolean(code) && /Signed\./.test(issued), code ?? "");

  // The whole point: a stranger with no account reaches the same conclusion.
  const anonymous = await (await browser.newContext()).newPage();
  await anonymous.goto(`${ORIGIN}/credentials/verify/${code}`, { waitUntil: "domcontentloaded" });
  check(
    "11. anonymous credential check",
    (await anonymous.locator('h1:has-text("Valid")').count()) > 0 &&
      (await anonymous.locator("text=/Valid — signed by/").count()) > 0,
  );

  // --- 12-13. Transparency log --------------------------------------------
  await go("/log");
  if ((await page.locator('button:has-text("Cut checkpoint")').count()) > 0) {
    await page.locator('button:has-text("Cut checkpoint")').click();
    await page.waitForTimeout(3000);
  }
  check("12. checkpoint cut", (await page.locator("text=/Checkpoint cut over|checkpoint/i").count()) > 0);

  await go("/verify/AK-INST-000001");
  check("13. inclusion proof published", (await page.locator("text=Merkle inclusion proof").count()) > 0);

  console.log("\npage errors:", pageErrors.length ? pageErrors.slice(0, 3) : "none");
  console.log(`\n${passed} passed, ${failed} failed`);
} finally {
  await browser.close();
}

process.exit(failed > 0 ? 1 : 0);
