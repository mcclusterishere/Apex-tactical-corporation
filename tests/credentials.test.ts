import { assertNotImpersonating, CredentialError, generateVerificationCode, CREDENTIAL_TYPES } from "@/lib/credentials";
import { generateSigningKey, signMessage, verifyMessage, signingPayload } from "@/lib/signing";
import { seal, open, sealWithKey, openWithKey, deriveWrappingKey, newSalt } from "@/lib/secrets";

let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => { c ? pass++ : fail++; if (!c) console.log("  FAIL:", n); };
const blocked = (n: string, v: string) => {
  try { assertNotImpersonating({ standing: v }); fail++; console.log("  FAIL (allowed):", n, "->", v); }
  catch (e) { if (e instanceof CredentialError) pass++; else { fail++; console.log("  FAIL (wrong error):", n); } }
};
const allowed = (n: string, v: string) => {
  try { assertNotImpersonating({ standing: v }); pass++; }
  catch { fail++; console.log("  FAIL (blocked legitimate):", n, "->", v); }
};

// --- impersonation guard: must block ------------------------------------
blocked("police", "Police Officer of Apex Kingdom");
blocked("badge", "Bearer of Badge 114");
blocked("peace officer", "Sworn Peace Officer");
blocked("marshal", "Kingdom Marshal");
blocked("sheriff", "Deputy Sheriff");
blocked("state id", "Official State ID");
blocked("drivers license", "Drivers License of the Kingdom");
blocked("passport", "Kingdom Passport");
blocked("diplomatic", "Diplomatic Credential");
blocked("federal agent", "Federal Agent");
blocked("law enforcement", "Law Enforcement Division");
blocked("dmv", "DMV Issued");
blocked("case-insensitive", "POLICE COMMANDER");
blocked("punctuation evasion", "P.O.L.I.C.E. Officer");
blocked("hyphen evasion", "P-O-L-I-C-E Commander");
blocked("spaced letters", "p o l i c e chief");
blocked("dense passport", "Kingdom-Passport-Document");
blocked("dense state id", "OfficialStateIDCard");
blocked("extra spacing", "peace    officer");
blocked("social security", "Social Security Substitute");
blocked("real id", "REAL ID Compliant");

// --- must allow legitimate standings ------------------------------------
allowed("citizen", "Citizen in good standing");
allowed("registrar", "Registrar General of Apex Kingdom");
allowed("minister", "Ordained Minister");
allowed("elder", "Elder of the Council");
allowed("treasurer", "Treasurer");
allowed("delegate", "Delegate to the Interfaith Council");
allowed("volunteer", "Volunteer, Archive");
allowed("trustee", "Trustee of the Charitable Trust");
allowed("deacon", "Deacon");
allowed("empty", "");
allowed("archivist", "Archivist of the Kingdom");
allowed("chancellor", "Chancellor of the Exchequer");
allowed("good standing member", "Member in good standing since 2019");
allowed("committee", "Chair, Land and Property Committee");
allowed("historian", "Community Historian and Genealogist");

// --- credential types are a closed set ----------------------------------
ok("no law-enforcement type exists",
  !CREDENTIAL_TYPES.some(t => /POLICE|MARSHAL|OFFICER_OF_LAW|SECURITY|ENFORCE/.test(t)));

// --- verification codes -------------------------------------------------
{
  const codes = new Set<string>();
  for (let i = 0; i < 5000; i++) codes.add(generateVerificationCode());
  ok("codes unique over 5000", codes.size === 5000);
  const c = generateVerificationCode();
  ok("code shape XXXXX-XXXXX", /^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/.test(c));
  ok("no ambiguous I/L/O/U", !/[ILOU]/.test(c));
}

// --- signing ------------------------------------------------------------
{
  const key = generateSigningKey("a-strong-passphrase");
  ok("fingerprint is sha256 hex", /^[0-9a-f]{64}$/.test(key.fingerprint));
  const msg = signingPayload(42, "ab".repeat(32), "ATTESTATION");
  const sig = signMessage(msg, key.privateKeyEnc, key.wrapSalt, "a-strong-passphrase");
  ok("signature verifies", verifyMessage(msg, sig, key.publicKey));
  ok("altered message fails", !verifyMessage(msg + "x", sig, key.publicKey));
  ok("altered signature fails", !verifyMessage(msg, Buffer.from("00".repeat(64),"hex").toString("base64"), key.publicKey));
  ok("different key fails", !verifyMessage(msg, sig, generateSigningKey("other-passphrase-1").publicKey));
  ok("garbage signature fails safely", !verifyMessage(msg, "!!!not-base64!!!", key.publicKey));

  // Wrong passphrase must not unseal
  let threw = false;
  try { signMessage(msg, key.privateKeyEnc, key.wrapSalt, "wrong-passphrase"); } catch { threw = true; }
  ok("wrong passphrase refused", threw);

  // Short passphrase refused at generation
  let threw2 = false;
  try { generateSigningKey("short"); } catch { threw2 = true; }
  ok("short passphrase refused", threw2);

  // Two keys from the same passphrase must still differ (salt)
  const k1 = generateSigningKey("same-passphrase-here");
  const k2 = generateSigningKey("same-passphrase-here");
  ok("distinct keys from same passphrase", k1.publicKey !== k2.publicKey && k1.wrapSalt !== k2.wrapSalt);
}

// --- envelope encryption ------------------------------------------------
{
  const secret = "totp-secret-value";
  const sealed = seal(secret);
  ok("seal round trip", open(sealed) === secret);
  ok("ciphertext differs each time", seal(secret) !== seal(secret));

  const salt = newSalt();
  const k = deriveWrappingKey("pass-phrase-long", salt);
  const s2 = sealWithKey("payload", k);
  ok("keyed round trip", openWithKey(s2, k).toString("utf8") === "payload");

  // Tampering must fail authentication, not silently return garbage
  const parts = s2.split(".");
  const tampered = [parts[0], Buffer.from("evil-payload").toString("base64url"), parts[2]].join(".");
  let authFailed = false;
  try { openWithKey(tampered, k); } catch { authFailed = true; }
  ok("tampered ciphertext rejected", authFailed);

  let wrongKeyFailed = false;
  try { openWithKey(s2, deriveWrappingKey("different-passphrase", salt)); } catch { wrongKeyFailed = true; }
  ok("wrong key rejected", wrongKeyFailed);

  let malformedFailed = false;
  try { openWithKey("not.a.sealed.value", k); } catch { malformedFailed = true; }
  ok("malformed rejected", malformedFailed);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
