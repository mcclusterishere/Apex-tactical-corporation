/**
 * Commission the Keepers of the Stays.
 *
 * Creates member accounts for the four elders who hold the family's
 * contribution ledger: Carl McCluster (father), Regina Brinkley (mother),
 * Mollye Fortt (grandmother), Betty McCluster (grandmother). Each is
 * commissioned as a TREASURER-role steward so they can post and verify Apex
 * tasks — the two-person rule in stays.ts still forbids anyone verifying
 * their own work, so holding the power never means crediting oneself.
 *
 * Run with the four email addresses, in this order:
 *
 *   npx tsx scripts/commission-keepers.ts carl@... regina@... mollye@... betty@...
 *
 * Initial passwords are generated, printed ONCE, and must be changed at first
 * sign-in (mustResetPw). Idempotent: an existing email is left untouched.
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

const KEEPERS = [
  { displayName: "Carl McCluster", officeTitle: "Keeper of the Stays" },
  { displayName: "Regina Brinkley", officeTitle: "Keeper of the Stays" },
  { displayName: "Mollye Fortt", officeTitle: "Keeper of the Stays" },
  { displayName: "Betty McCluster", officeTitle: "Keeper of the Stays" },
];

async function main() {
  const emails = process.argv.slice(2);
  if (emails.length !== KEEPERS.length) {
    console.error(
      `Usage: npx tsx scripts/commission-keepers.ts <carl-email> <regina-email> <mollye-email> <betty-email>`,
    );
    console.error(`Got ${emails.length} email(s); need ${KEEPERS.length}, in that order.`);
    process.exit(1);
  }

  for (let i = 0; i < KEEPERS.length; i++) {
    const keeper = KEEPERS[i];
    const email = emails[i].trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  ${keeper.displayName}: account already exists (${email}) — untouched.`);
      continue;
    }
    const initialPassword = `apex-${randomBytes(9).toString("base64url")}`;
    await prisma.user.create({
      data: {
        email,
        displayName: keeper.displayName,
        officeTitle: keeper.officeTitle,
        role: "TREASURER",
        passwordHash: await hashPassword(initialPassword),
        mustResetPw: true,
        active: true,
      },
    });
    console.log(`  Commissioned ${keeper.displayName} <${email}>`);
    console.log(`  ┌───────────────────────────────────────────────────────────┐`);
    console.log(`  │ INITIAL PASSWORD — shown once, change at first sign-in    │`);
    console.log(`  │ ${initialPassword.padEnd(57)} │`);
    console.log(`  └───────────────────────────────────────────────────────────┘`);
  }

  console.log(
    "\nDone. The Keepers can sign in, change their passwords, enrol a second factor,\nand begin posting and verifying Apex tasks at /stays.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
