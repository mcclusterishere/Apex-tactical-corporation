import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { canView } from "@/lib/classification";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import { getRecordProof, computeEntryHash, sha256Hex } from "@/lib/chain";
import { proveEntry } from "@/lib/merkle";
import { recordDigest } from "@/lib/records";
import { PageHeader, Panel, Field, ClassificationBadge, ButtonLink, Caution } from "@/components/ui";
import { FieldValue } from "@/components/FieldValue";
import { formatDate, formatTimestamp } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  return { title: `Verification — ${decodeURIComponent(number)}` };
}

/**
 * Public verification of a record number.
 *
 * Disclosure policy: existence, register, recording date, and content digest are
 * confirmed for any record classified below SEALED, because a recipient of a
 * certified extract must be able to check it without asking the Kingdom's
 * permission — a verification service that requires the issuer's cooperation
 * verifies nothing.
 *
 * Contents are shown only to a principal cleared for them. SEALED records are
 * not confirmed at all to an uncleared reader: for genuinely sealed material,
 * even acknowledging that a record bearing a given number exists discloses
 * something, so those return the same "not found" as a number that was never
 * issued.
 */
export default async function VerifyRecordPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number: raw } = await params;
  const number = decodeURIComponent(raw).trim().toUpperCase();
  const principal = await getPrincipal();

  const record = await prisma.record.findUnique({
    where: { recordNumber: number },
    include: { attachments: true },
  });

  const sealedAndUncleared =
    record !== null && record.classification === "SEALED" && !canView(principal.clearance, "SEALED");

  if (!record || sealedAndUncleared) {
    return (
      <>
        <PageHeader
          overline="Verification"
          title="No such record"
          lede={
            <>
              The register contains no entry bearing the number{" "}
              <span className="tabular">{number}</span>.
            </>
          }
        />
        <Panel tone="seal">
          <p className="text-sm">
            A document presenting this number as an extract from the Apex Kingdom register was not
            issued by the Office of the Registrar, or the number has been transcribed incorrectly.
            Record numbers take the form <span className="tabular">AK-XXX-000000</span>.
          </p>
          <div className="mt-4">
            <ButtonLink href="/verify">Try another number</ButtonLink>
          </div>
        </Panel>
      </>
    );
  }

  const registry = getRegistry(record.registry);
  const proof = await getRecordProof(record.id);
  const digest = recordDigest(record);
  const mayReadContents = canView(principal.clearance, record.classification);

  // Recompute the entries that touch this record, rather than trusting stored
  // hashes. A verification page that reads back the same numbers it wrote is
  // theatre.
  const entriesIntact = proof
    ? await (async () => {
        const rows = await prisma.ledgerEntry.findMany({
          where: { recordId: record.id },
          orderBy: { sequence: "asc" },
        });
        return rows.every(
          (entry) =>
            sha256Hex(entry.payload) === entry.payloadHash &&
            computeEntryHash({
              prevHash: entry.prevHash,
              sequence: entry.sequence,
              createdAt: entry.createdAt,
              eventType: entry.eventType,
              payloadHash: entry.payloadHash,
            }) === entry.entryHash,
        );
      })()
    : false;

  const inclusion = proof ? await proveEntry(proof.lastSequence) : null;
  const data = parseJson<Record<string, unknown>>(record.data, {});
  const visibleFields =
    registry && mayReadContents
      ? registry.fields.filter(
          (field) => !field.classification || canView(principal.clearance, field.classification),
        )
      : [];

  return (
    <>
      <PageHeader
        overline="Verification"
        title={entriesIntact ? "Verified" : "Integrity check failed"}
        lede={
          entriesIntact ? (
            <>
              Record <span className="tabular">{record.recordNumber}</span> is on file and its ledger
              entries recompute correctly.
            </>
          ) : (
            <>
              Record <span className="tabular">{record.recordNumber}</span> is on file, but its
              ledger entries do not recompute to the hashes stored against them.
            </>
          )
        }
        actions={<ButtonLink href="/verify">Verify another</ButtonLink>}
      />

      {!entriesIntact ? (
        <div className="mb-6">
          <Caution title="Do not rely on this record">
            The stored hashes do not match a fresh computation over the stored payloads. Either the
            database has been altered outside this application or it has suffered corruption. The
            Registrar should run a full chain verification immediately and preserve the current
            state before any further writes.
          </Caution>
        </div>
      ) : null}

      <Panel title="What the register contains">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Record number">
            <span className="tabular">{record.recordNumber}</span>
          </Field>
          <Field label="Register">{registry?.title ?? record.registry}</Field>
          <Field label="Recorded">{formatTimestamp(record.recordedAt)}</Field>
          <Field label="Effective date">{formatDate(record.effectiveDate)}</Field>
          <Field label="Status">
            {registry?.statuses.find((status) => status.value === record.status)?.label ??
              record.status}
            {record.voidedAt ? " — VOID" : ""}
          </Field>
          <Field label="Classification">
            <ClassificationBadge value={record.classification} />
          </Field>
          <Field label="Title" wide>
            {mayReadContents ? (
              record.title
            ) : (
              <span className="muted">Not public. The entry exists; its contents are restricted.</span>
            )}
          </Field>
        </dl>
      </Panel>

      {record.voidedAt ? (
        <div className="mb-6">
          <Caution title={`This record was voided on ${formatDate(record.voidedAt)}`}>
            {record.voidReason ?? "No reason was recorded."} A certified copy issued before that
            date remains a true copy of what the register said at the time, but the entry no longer
            stands.
          </Caution>
        </div>
      ) : null}

      {mayReadContents && visibleFields.length > 0 ? (
        <Panel title="Entry">
          <dl className="grid gap-4 sm:grid-cols-2">
            {visibleFields.map((field) => {
              const value = data[field.key];
              if (value === undefined || value === null || value === "") return null;
              const wide =
                field.type === "textarea" ||
                field.type === "richtext" ||
                field.type === "multiselect";
              return (
                <Field key={field.key} label={field.label} wide={wide}>
                  <FieldValue field={field} value={value} />
                </Field>
              );
            })}
          </dl>
        </Panel>
      ) : null}

      <Panel title="Cryptographic position">
        <dl className="space-y-3">
          <Field
            label="Content digest (SHA-256)"
            help="Compare against the digest printed on the certified copy you were given. If they differ, the copy has been altered."
          >
            <span className="digest">{digest}</span>
          </Field>
          {proof ? (
            <>
              <Field label="Ledger positions">
                #{proof.firstSequence}
                {proof.lastSequence !== proof.firstSequence ? ` through #${proof.lastSequence}` : ""}{" "}
                <span className="muted">
                  ({proof.entries.length} {proof.entries.length === 1 ? "act" : "acts"} recorded)
                </span>
              </Field>
              <Field label="Latest entry hash">
                <span className="digest">{proof.entries[proof.entries.length - 1].entryHash}</span>
              </Field>
              <Field
                label="Merkle inclusion proof"
                help="Recompute the root from the leaf and the path to confirm this entry is in the log, without seeing any other entry. RFC 6962 §2.1.1."
              >
                {inclusion ? (
                  <>
                    <span className="digest block">root {inclusion.rootHash}</span>
                    <span className="digest muted mt-1 block">
                      leaf {inclusion.leafHash} · index {inclusion.leafIndex} · tree{" "}
                      {inclusion.treeSize.toLocaleString()}
                    </span>
                    {inclusion.path.length > 0 ? (
                      <span className="digest muted mt-1 block">path {inclusion.path.join(" ")}</span>
                    ) : null}
                  </>
                ) : (
                  <span className="muted">
                    No checkpoint yet covers this entry. Ask the Registrar to cut one.
                  </span>
                )}
              </Field>
              <Field label="External anchor">
                {proof.coveringAnchor ? (
                  <>
                    The chain head at position #{proof.coveringAnchor.sequence} was published
                    externally on {formatDate(proof.coveringAnchor.anchoredAt)} by{" "}
                    {proof.coveringAnchor.method.replaceAll("_", " ").toLowerCase()}
                    {proof.coveringAnchor.externalRef
                      ? `, under reference ${proof.coveringAnchor.externalRef}`
                      : ""}
                    . This entry therefore provably existed no later than that date, independently
                    of anything the Kingdom asserts.
                  </>
                ) : (
                  <span className="muted">
                    None. The recording date rests on the Kingdom&rsquo;s attestation and on the
                    internal consistency of the ledger, not on independent evidence.
                  </span>
                )}
              </Field>
            </>
          ) : (
            <Field label="Ledger positions">
              <span className="muted">No ledger entries reference this record.</span>
            </Field>
          )}
        </dl>
      </Panel>

      <p className="muted text-xs">
        This page reports the contents of a private institution&rsquo;s own register. It is not a
        filing with, an instrument of, or a determination by any government, court, or agency. See{" "}
        <Link href="/verify" className="underline underline-offset-2">
          what verification proves
        </Link>
        .
      </p>
    </>
  );
}
