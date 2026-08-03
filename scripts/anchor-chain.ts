/**
 * Print the current ledger head and the procedure for anchoring it externally.
 *
 * Run with `npm run chain:anchor`.
 *
 * Anchoring is the step that turns the ledger from a well-kept file into
 * evidence, and it is the step most likely to be skipped because nothing
 * visibly breaks when it is. Nothing visibly breaks right up until the moment
 * someone asks how the Kingdom knows a record is as old as it says, and the
 * only available answer is that the Kingdom says so.
 *
 * This script does not perform the anchoring itself. Reaching a timestamp
 * authority or a postal counter is a deliberate act by a person, and the record
 * of it should be entered by the officer who did it.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const head = await prisma.ledgerEntry.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true, entryHash: true, createdAt: true },
  });

  if (!head) {
    console.log("The ledger has not been opened. Run `npm run seed` first.");
    return;
  }

  const anchor = await prisma.chainAnchor.findFirst({ orderBy: { sequence: "desc" } });
  const behind = head.sequence - (anchor?.sequence ?? 0);

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("  APEX KINGDOM — LEDGER HEAD");
  console.log("══════════════════════════════════════════════════════════════════\n");
  console.log(`  Position   #${head.sequence}`);
  console.log(`  Committed  ${head.createdAt.toISOString()}`);
  console.log(`  Head hash  ${head.entryHash}\n`);
  console.log("══════════════════════════════════════════════════════════════════\n");

  if (anchor) {
    console.log(
      `Last anchored at #${anchor.sequence} via ${anchor.method} on ${anchor.anchoredAt
        .toISOString()
        .slice(0, 10)}${anchor.externalRef ? ` (ref ${anchor.externalRef})` : ""}.`,
    );
    console.log(
      behind === 0
        ? "The head is already covered. Nothing to do.\n"
        : `${behind} entries have been recorded since. Anchor again.\n`,
    );
  } else {
    console.log("This chain has NEVER been anchored. Do it today.\n");
  }

  console.log("WHY THIS MATTERS");
  console.log("────────────────");
  console.log("The hash chain proves the register has not been rewritten relative to itself.");
  console.log("It cannot prove WHEN anything was recorded, because whoever holds the database");
  console.log("could regenerate the entire chain with different dates. Publishing the head hash");
  console.log("somewhere outside the Kingdom's control, on a fixed date, closes that gap: every");
  console.log("entry at or below this position becomes provably older than the publication.\n");

  console.log("HOW TO ANCHOR — pick at least one, ideally two");
  console.log("──────────────────────────────────────────────\n");

  console.log("1. CERTIFIED MAIL  (costs a few dollars, needs nothing technical)");
  console.log("   Print this page. Seal it in an envelope addressed to the Office of the");
  console.log("   Registrar. Send it by certified mail with return receipt. When it arrives,");
  console.log("   file it UNOPENED with the receipt. The postmark is a government-dated");
  console.log("   assertion that the contents existed on that day.\n");

  console.log("2. RFC 3161 TIMESTAMP  (strongest, generally free)");
  console.log("   A timestamp authority signs your hash together with the current time. The");
  console.log("   resulting token is verifiable by anyone, forever, without trusting the");
  console.log("   Kingdom. With OpenSSL installed:\n");
  console.log(`     printf '%s' ${head.entryHash} > head.txt`);
  console.log("     openssl ts -query -data head.txt -sha256 -cert -out head.tsq");
  console.log("     curl -s -H 'Content-Type: application/timestamp-query' \\");
  console.log("       --data-binary @head.tsq https://freetsa.org/tsr > head.tsr");
  console.log("     openssl ts -reply -in head.tsr -text | head -20\n");
  console.log("   Keep head.txt and head.tsr together, permanently. Record the anchor with");
  console.log("   method RFC3161 and the token filename as the external reference.\n");

  console.log("3. PUBLIC REPOSITORY COMMIT");
  console.log("   Commit the head hash to a hosted repository. The host's commit timestamp is");
  console.log("   a third-party record. Use the commit SHA as the external reference.\n");

  console.log("4. THE GAZETTE");
  console.log("   Publish an issue; the head hash is printed in it automatically. Weakest");
  console.log("   alone, since the Kingdom controls the gazette — but free, and it pairs well");
  console.log("   with any of the above.\n");

  console.log("AFTER ANCHORING");
  console.log("───────────────");
  console.log("Record it in the system at /chain so the anchor is itself committed to the");
  console.log("ledger and appears on every certificate issued from covered records.\n");
  console.log("Anchor monthly at minimum, and always before sending any demand or filing");
  console.log("that relies on a recording date.\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
