import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { canView } from "@/lib/classification";
import { canReadRecord } from "@/lib/access";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import { getRecordProof } from "@/lib/chain";
import { proveEntry } from "@/lib/merkle";
import { recordDigest } from "@/lib/records";
import { recordAudit } from "@/lib/audit";
import { FieldValue } from "@/components/FieldValue";
import { Seal } from "@/components/Seal";
import { formatDate, formatTimestamp } from "@/lib/format";
import { publicUrl } from "@/lib/origin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await prisma.record.findUnique({
    where: { id },
    select: { recordNumber: true },
  });
  return { title: record ? `Certified copy — ${record.recordNumber}` : "Certified copy" };
}

/**
 * A certified extract from the register.
 *
 * This is the artefact that leaves the building — attached to a demand letter,
 * handed to a municipal clerk, exhibited to a filing. It is designed to be
 * printed, and everything on it is designed to be independently checkable by
 * someone who has no reason to trust the Kingdom: the record's content digest,
 * its position in the ledger chain, the covering external anchor if one exists,
 * and a verification address that requires no account.
 *
 * It attests to one thing only, and says so plainly: that this is what the
 * register contains and when it was entered. It does not attest that the
 * contents are true, and a certificate that overclaimed would be worth nothing
 * the first time someone tested it.
 */
export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await getPrincipal();

  const record = await prisma.record.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!record) notFound();

  const registry = getRegistry(record.registry);
  if (!registry) notFound();
  // Registry keepers may read the register they keep, even above their clearance.
  if (!canReadRecord(principal, record, registry)) notFound();

  await recordAudit(principal, "record.certify", record.recordNumber, "Certified copy produced");

  const data = parseJson<Record<string, unknown>>(record.data, {});
  const proof = await getRecordProof(record.id);
  const digest = recordDigest(record);
  const issuedAt = new Date();
  const verifyAt = await publicUrl(`/verify/${record.recordNumber}`);

  // An inclusion proof against a published root is what lets the recipient
  // check this extract without asking the Kingdom for anything, and without
  // the Kingdom disclosing any other entry.
  const inclusion = proof ? await proveEntry(proof.lastSequence) : null;

  const visibleFields = registry.fields.filter(
    (field) => !field.classification || canView(principal.clearance, field.classification),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3 border-b border-[var(--rule)] pb-4">
        <p className="muted flex-1 text-sm">
          Print this page, or save it as a PDF, to produce a certified extract. The verification
          address below lets a recipient confirm the contents without an account.
        </p>
        <a
          href={`/record/${record.id}`}
          className="rounded-sm border border-[var(--rule-strong)] px-3 py-1.5 text-[13px]"
        >
          Back to record
        </a>
      </div>

      <article className="surface border border-[var(--rule-strong)] px-8 py-10 print:border-0 print:px-0 print:py-0">
        <header className="masthead-rule pb-5 text-center">
          <div className="flex justify-center">
            <Seal size={78} />
          </div>
          <h1 className="display mt-3 text-xl tracking-tight">APEX KINGDOM</h1>
          <p className="overline mt-1">Office of the Registrar · Apex Tactical Corporation</p>
          <p className="display mt-4 text-lg">Certified Extract from the Register</p>
        </header>

        <section className="mt-6">
          <p className="text-sm leading-relaxed">
            I certify that the following is a true and complete extract from the{" "}
            <strong>{registry.title}</strong> of Apex Kingdom, as that register stood at the date
            and time of issue stated below, and that the entry has been continuously maintained on
            the Kingdom&rsquo;s tamper-evident ledger since the date of its recording.
          </p>
        </section>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 border-y border-[var(--rule)] py-4 sm:grid-cols-2">
          <div>
            <dt className="overline">Record number</dt>
            <dd className="tabular text-base font-semibold">{record.recordNumber}</dd>
          </div>
          <div>
            <dt className="overline">Register</dt>
            <dd className="text-sm">{registry.title}</dd>
          </div>
          <div>
            <dt className="overline">Recorded</dt>
            <dd className="text-sm">{formatTimestamp(record.recordedAt)}</dd>
          </div>
          <div>
            <dt className="overline">Effective date</dt>
            <dd className="text-sm">{formatDate(record.effectiveDate)}</dd>
          </div>
          <div>
            <dt className="overline">Status</dt>
            <dd className="text-sm">
              {registry.statuses.find((status) => status.value === record.status)?.label ??
                record.status}
              {record.voidedAt ? " — VOID" : ""}
            </dd>
          </div>
          <div>
            <dt className="overline">Last amended</dt>
            <dd className="text-sm">{formatTimestamp(record.updatedAt)}</dd>
          </div>
        </dl>

        <section className="mt-6">
          <h2 className="text-base">{record.title}</h2>
          <dl className="mt-3 space-y-3">
            {visibleFields.map((field) => {
              const value = data[field.key];
              if (value === undefined || value === null || value === "") return null;
              return (
                <div key={field.key} className="avoid-break grid grid-cols-1 gap-1 sm:grid-cols-3">
                  <dt className="overline sm:col-span-1">{field.label}</dt>
                  <dd className="text-sm sm:col-span-2">
                    <FieldValue field={field} value={value} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        {record.voidedAt ? (
          <section className="mt-6 border border-seal-500 px-4 py-3">
            <p className="overline">Void notation</p>
            <p className="mt-1 text-sm">
              Voided {formatDate(record.voidedAt)}. {record.voidReason}
            </p>
          </section>
        ) : null}

        {record.attachments.length > 0 ? (
          <section className="avoid-break mt-6">
            <h3 className="overline">Attachments of record</h3>
            <ul className="mt-2 space-y-2">
              {record.attachments.map((attachment) => (
                <li key={attachment.id} className="text-sm">
                  {attachment.filename}{" "}
                  <span className="muted">({(attachment.byteSize / 1024).toFixed(1)} KB)</span>
                  <span className="digest muted block">SHA-256 {attachment.sha256}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="avoid-break mt-8 border-t-2 border-[var(--rule-strong)] pt-4">
          <h3 className="overline">Verification</h3>
          <dl className="mt-2 space-y-2.5 text-sm">
            <div>
              <dt className="overline">Content digest (SHA-256) of the entry</dt>
              <dd className="digest">{digest}</dd>
            </div>
            {proof ? (
              <>
                <div>
                  <dt className="overline">
                    Ledger positions #{proof.firstSequence}
                    {proof.lastSequence !== proof.firstSequence ? `–#${proof.lastSequence}` : ""}
                  </dt>
                  <dd className="digest">
                    {proof.entries[proof.entries.length - 1].entryHash}
                  </dd>
                </div>
                <div>
                  <dt className="overline">External anchor</dt>
                  <dd className="text-sm">
                    {proof.coveringAnchor ? (
                      <>
                        Chain head at position #{proof.coveringAnchor.sequence} was published on{" "}
                        {formatDate(proof.coveringAnchor.anchoredAt)} by{" "}
                        {proof.coveringAnchor.method.replaceAll("_", " ").toLowerCase()}
                        {proof.coveringAnchor.externalRef
                          ? `, reference ${proof.coveringAnchor.externalRef}`
                          : ""}
                        . This entry provably existed no later than that date.
                      </>
                    ) : (
                      <span className="muted">
                        No external anchor presently covers this entry. Its recording date rests on
                        the Kingdom&rsquo;s attestation and the internal consistency of the ledger.
                      </span>
                    )}
                  </dd>
                </div>
              </>
            ) : null}
            {inclusion ? (
              <div>
                <dt className="overline">
                  Merkle inclusion proof — tree of {inclusion.treeSize.toLocaleString()} entries
                </dt>
                <dd>
                  <span className="digest block">root {inclusion.rootHash}</span>
                  <span className="digest muted mt-1 block">
                    leaf {inclusion.leafHash} at index {inclusion.leafIndex}
                  </span>
                  <span className="digest muted mt-1 block">
                    path {inclusion.path.length > 0 ? inclusion.path.join(" ") : "(none — single-entry tree)"}
                  </span>
                  <span className="muted mt-1 block text-xs">
                    Recomputing the root from the leaf and this path confirms the entry is in the
                    Kingdom&rsquo;s log, and discloses nothing about any other entry. The procedure is
                    RFC 6962 §2.1.1.
                  </span>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="overline">Confirm this extract</dt>
              <dd className="tabular break-all text-sm">{verifyAt}</dd>
              <dd className="muted mt-1 text-xs">
                No account and no cooperation from the Kingdom is required. The page recomputes
                this extract&rsquo;s digest and its position in the ledger from the record itself.
              </dd>
            </div>
          </dl>
        </section>

        <section className="avoid-break mt-8">
          <p className="text-sm">
            Issued at {formatTimestamp(issuedAt)} by{" "}
            <strong>{principal.displayName}</strong>
            {principal.officeTitle ? `, ${principal.officeTitle}` : ""}, for the Office of the
            Registrar.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <div className="border-b border-[var(--rule-strong)]" />
              <p className="overline mt-1">Signature of the certifying officer</p>
            </div>
            <div>
              <div className="border-b border-[var(--rule-strong)]" />
              <p className="overline mt-1">Date</p>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-[var(--rule)] pt-3">
          <p className="muted text-xs leading-relaxed">
            This certificate attests to the contents of the Kingdom&rsquo;s own register and to the
            integrity of the ledger on which that register is kept. It does not attest to the truth
            of the matters recorded, and it is not a filing with, an instrument of, or a
            determination by any government, court, or agency. Apex Kingdom is a private religious
            society and cultural institution. Nothing in this certificate asserts authority over any
            person or property outside the Kingdom&rsquo;s own membership and holdings.
          </p>
        </footer>
      </article>
    </div>
  );
}
