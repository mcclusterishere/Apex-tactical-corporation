import { hotp, totp, verifyTotp, base32Encode, base32Decode, generateSecret, provisioningUri } from "@/lib/totp";

let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => { c ? pass++ : fail++; if (!c) console.log("  FAIL:", n); };

// RFC 4226 Appendix D test vectors. Secret is ASCII "12345678901234567890".
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890", "ascii"));
const RFC4226 = ["755224","287082","359152","969429","338314","254676","287922","162583","399871","520489"];
RFC4226.forEach((expected, counter) => {
  ok(`RFC 4226 HOTP counter=${counter}`, hotp(RFC_SECRET, counter) === expected);
});

// RFC 6238 SHA-1 test vectors (8-digit in the RFC; we take the low 6 digits).
const RFC6238: [number, string][] = [
  [59, "94287082"], [1111111109, "07081804"], [1111111111, "14050471"],
  [1234567890, "89005924"], [2000000000, "69279037"], [20000000000, "65353130"],
];
for (const [seconds, eightDigit] of RFC6238) {
  ok(`RFC 6238 t=${seconds}`, totp(RFC_SECRET, seconds * 1000) === eightDigit.slice(-6));
}

// base32 round trip
for (const n of [1, 5, 10, 20, 32, 64]) {
  const buf = Buffer.alloc(n, 0xab);
  ok(`base32 round trip ${n}B`, base32Decode(base32Encode(buf)).equals(buf));
}

// Verification behaviour
const s = generateSecret();
const now = Date.now();
ok("current code verifies", verifyTotp(s, totp(s, now), { atMs: now }).valid);
ok("previous step verifies (clock skew)", verifyTotp(s, totp(s, now - 30000), { atMs: now }).valid);
ok("next step verifies (clock skew)", verifyTotp(s, totp(s, now + 30000), { atMs: now }).valid);
ok("two steps back rejected", !verifyTotp(s, totp(s, now - 90000), { atMs: now }).valid);
ok("wrong code rejected", !verifyTotp(s, "000000", { atMs: now }).valid || totp(s, now) === "000000");
ok("non-numeric rejected", !verifyTotp(s, "abcdef", { atMs: now }).valid);
ok("wrong length rejected", !verifyTotp(s, "12345", { atMs: now }).valid);
ok("whitespace tolerated", verifyTotp(s, ` ${totp(s, now)} `, { atMs: now }).valid);

// Replay protection: a spent counter must not be accepted again
{
  const r = verifyTotp(s, totp(s, now), { atMs: now });
  ok("verify returns counter", typeof r.counter === "number");
  ok("replay of spent counter rejected",
    !verifyTotp(s, totp(s, now), { atMs: now, lastUsedCounter: r.counter }).valid);
}

// Provisioning URI shape
{
  const uri = provisioningUri("ABCDEFGH", "matthew@mccluster.org");
  ok("uri scheme", uri.startsWith("otpauth://totp/"));
  ok("uri has secret", uri.includes("secret=ABCDEFGH"));
  ok("uri has issuer", uri.includes("issuer=Apex+Kingdom"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
