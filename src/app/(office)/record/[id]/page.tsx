import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can, canWriteRegistry } from "@/lib/authz";
import { canView } from "@/lib/classification";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import { getRecordProof } from "@/lib/chain";
import { recordAccess } from "@/lib/audit";
import { recordDigest } from "@/lib/records";
import {
  PageHeader,
  Panel,
  StatusBadge,
  ClassificationBadge,
  ButtonLink,
  Field,
  Caution,
} from "@/components/ui";
import { FieldValue } from "@/components/FieldValue";
import {
  VoidRecordForm,
  SupersedeForm,
  RelateForm,
  IssueHoldForm,
  ReleaseHoldForm,
  CompleteDeadlineForm,
} from "@/components/RecordActions";
import {
  voidRecordAction,
  supersedeRecordAction,
  relateRecordAction,
  issueHoldAction,
  releaseHoldAction,
  completeDeadlineAction,
} from "@/app/actions/records";
import { AttachmentForm, CustodyForm } from "@/components/AttachmentForm";
import { addAttachmentAction, logCustodyAction } from "@/app/actions/attachments";
import {
  formatDate,
  formatTimestamp,
  formatDateShort,
  shortHash,
  daysUntil,
  describeDueIn,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await prisma.record.findUnique({
    where: { id },
    select: { recordNumber: true, title: true },
  });
  return { title: record ? `${record.recordNumber} — ${record.title}` : "Record" };
}

export default async function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await getPrincipal();

  const record = await prisma.record.findUnique({
    where: { id },
    include: {
      attachments: { orderBy: { createdAt: "asc" }, include: { custody: true } },
      deadlines: { orderBy: { dueOn: "asc" } },
      holds: { orderBy: { issuedAt: "desc" } },
      supersededBy: { select: { id: true, recordNumber: true, title: true } },
      supersedes: { select: { id: true, recordNumber: true, title: true } },
      relationsFrom: {
        include: { to: { select: { id: true, recordNumber: true, title: true, registry: true } } },
      },
      relationsTo: {
        include: { from: { select: { id: true, recordNumber: true, title: true, registry: true } } },
      },
    },
  });

  if (!record) notFound();

  const registry = getRegistry(record.registry);
  if (!registry) notFound();

  // Clearance is enforced here, not in the view. A record above the principal's
  // level is indistinguishable from one that does not exist.
  if (!canView(principal.clearance, record.classification)) notFound();

  await recordAccess(principal, record.recordNumber, record.classification);

  const [proof, data] = await Promise.all([
    getRecordProof(record.id),
    Promise.resolve(parseJson<Record<string, unknown>>(record.data, {})),
  ]);

  const digest = recordDigest(record);
  const mayAmend = canWriteRegistry(principal.role, registry.restrictedTo) && !record.voidedAt;
  const activeHolds = record.holds.filter((hold) => hold.releasedAt === null);

  // Fields the principal may see, grouped as declared on the registry.
  const visibleFields = registry.fields.filter(
    (field) => !field.classification || canView(principal.clearance, field.classification),
  );
  const hiddenFieldCount = registry.fields.length - visibleFields.length;

  const sections: { name: string; fields: typeof visibleFields }[] = [];
  for (const field of visibleFields) {
    const name = field.section ?? "Particulars";
    let section = sections.find((candidate) => candidate.name === name);
    if (!section) {
      section = { name, fields: [] };
      sections.push(section);
    }
    section.fields.push(field);
  }

  const summaryFields = visibleFields.filter((field) => field.summary);

  return (
    <>
      <PageHeader
        overline={
          <Link href={`/registry/${registry.slug}`} className="underline underline-offset-2">
            {registry.title}
          </Link>
        }
        title={record.title}
        lede={
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular">{record.recordNumber}</span>
            <StatusBadge status={record.status} statuses={registry.statuses} />
            <ClassificationBadge value={record.classification} />
            {record.voidedAt ? (
              <span className="rounded-sm border border-seal-600 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-seal-600">
                Void
              </span>
            ) : null}
            {activeHolds.length > 0 ? (
              <span className="rounded-sm border border-gilt-600 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gilt-700 dark:text-gilt-300">
                Legal hold
              </span>
            ) : null}
          </span>
        }
        actions={
          <>
            <ButtonLink href={`/record/${record.id}/certificate`}>Certified copy</ButtonLink>
            {mayAmend ? (
              <ButtonLink href={`/record/${record.id}/edit`} tone="primary">
                Amend
              </ButtonLink>
            ) : null}
          </>
        }
      />

      {record.voidedAt ? (
        <div className="mb-6">
          <Caution title={`Voided ${formatDate(record.voidedAt)}`}>
            {record.voidReason ?? "No reason was recorded."} The entry is retained in full; voiding
            is a notation, not a deletion.
          </Caution>
        </div>
      ) : null}

      {record.supersededBy ? (
        <div className="mb-6">
          <Caution title="Superseded">
            Replaced by{" "}
            <Link href={`/record/${record.supersededBy.id}`} className="underline underline-offset-2">
              <span className="tabular">{record.supersededBy.recordNumber}</span> —{" "}
              {record.supersededBy.title}
            </Link>
            . This entry remains on file as part of the chain of title.
          </Caution>
        </div>
      ) : null}

      {activeHolds.length > 0 ? (
        <Panel title="Under legal hold" tone="caution">
          {activeHolds.map((hold) => (
            <div key={hold.id} className="border-b border-[var(--rule)] pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-semibold">{hold.matter}</p>
              <p className="muted mt-0.5 text-sm">{hold.reason}</p>
              <p className="muted mt-1 text-xs">
                Issued {formatDate(hold.issuedAt)} by {hold.issuedBy}
              </p>
              {can(principal.role, "hold:release") ? (
                <ReleaseHoldForm
                  action={releaseHoldAction.bind(null, hold.id)}
                  matter={hold.id}
                />
              ) : null}
            </div>
          ))}
        </Panel>
      ) : null}

      {summaryFields.length > 0 ? (
        <Panel title="At a glance">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryFields.map((field) => (
              <Field key={field.key} label={field.label}>
                <FieldValue field={field} value={data[field.key]} />
              </Field>
            ))}
          </dl>
        </Panel>
      ) : null}

      {sections.map((section) => (
        <Panel key={section.name} title={section.name}>
          <dl className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const wide =
                field.type === "textarea" ||
                field.type === "richtext" ||
                field.type === "multiselect";
              return (
                <Field key={field.key} label={field.label} wide={wide}>
                  <FieldValue field={field} value={data[field.key]} />
                </Field>
              );
            })}
          </dl>
        </Panel>
      ))}

      {hiddenFieldCount > 0 ? (
        <p className="muted mb-6 text-xs">
          {hiddenFieldCount} field{hiddenFieldCount === 1 ? " is" : "s are"} classified above your
          clearance and {hiddenFieldCount === 1 ? "is" : "are"} not shown.
        </p>
      ) : null}

      {record.deadlines.length > 0 ? (
        <Panel title="Deadlines" description="Generated from this record's own dates">
          <ul className="divide-y divide-[var(--rule)]">
            {record.deadlines.map((deadline) => {
              const days = daysUntil(deadline.dueOn);
              const done = deadline.completedAt !== null;
              return (
                <li key={deadline.id} className="py-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="tabular text-xs">{formatDateShort(deadline.dueOn)}</span>
                    <span className="min-w-0 flex-1 text-sm">
                      {done ? <s className="muted">{deadline.title}</s> : deadline.title}
                    </span>
                    {done ? (
                      <span className="muted text-xs">
                        done {formatDateShort(deadline.completedAt)}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`text-xs ${
                            days < 0
                              ? "text-seal-600"
                              : deadline.severity === "CRITICAL"
                                ? "text-gilt-700 dark:text-gilt-300"
                                : "muted"
                          }`}
                        >
                          {describeDueIn(days)}
                        </span>
                        {can(principal.role, "deadline:manage") ? (
                          <CompleteDeadlineForm
                            action={completeDeadlineAction.bind(null, deadline.id)}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                  {deadline.detail ? (
                    <p className="muted mt-0.5 text-xs">{deadline.detail}</p>
                  ) : null}
                  {deadline.authority ? (
                    <p className="muted mt-0.5 text-xs">Authority: {deadline.authority}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

      <Panel
        title="Attachments and custody"
        description="Each item is digested on receipt; the digest is what proves the file has not changed since"
      >
        {record.attachments.length === 0 ? (
          <p className="muted mb-3 text-sm">
            Nothing attached. A register entry describing a document is weaker than one holding it —
            attach the instrument, the certificate, the correspondence, or the capture.
          </p>
        ) : (
          <ul className="mb-3 divide-y divide-[var(--rule)]">
            {record.attachments.map((attachment) => (
              <li key={attachment.id} className="py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <a
                    href={`/api/attachment/${attachment.id}`}
                    className="text-sm underline underline-offset-2"
                  >
                    {attachment.filename}
                  </a>
                  <span className="muted tabular text-xs">
                    {(attachment.byteSize / 1024).toFixed(1)} KB · {attachment.contentType}
                  </span>
                </div>
                <p className="digest muted mt-1">SHA-256 {attachment.sha256}</p>
                {attachment.acquiredFrom || attachment.acquiredAt ? (
                  <p className="muted mt-1 text-xs">
                    Received{attachment.acquiredFrom ? ` from ${attachment.acquiredFrom}` : ""}
                    {attachment.acquiredAt ? ` on ${formatDate(attachment.acquiredAt)}` : ""}
                  </p>
                ) : null}
                {attachment.collectionNote ? (
                  <p className="muted mt-1 text-xs">{attachment.collectionNote}</p>
                ) : null}
                {attachment.custody.length > 0 ? (
                  <ol className="muted mt-1.5 space-y-0.5 text-xs">
                    {attachment.custody.map((event) => (
                      <li key={event.id}>
                        {formatDateShort(event.occurredAt)} — {event.action.toLowerCase()} by{" "}
                        {event.actor}
                        {event.counterparty ? ` · ${event.counterparty}` : ""}
                        {event.note ? ` (${event.note})` : ""}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {can(principal.role, "custody:log") ? (
                  <CustodyForm
                    action={logCustodyAction.bind(null, attachment.id)}
                    attachmentLabel={attachment.filename}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {can(principal.role, "attachment:add") ? (
          <AttachmentForm
            action={addAttachmentAction.bind(null, record.id)}
            defaultClassification={record.classification}
          />
        ) : null}
      </Panel>

      {record.relationsFrom.length > 0 || record.relationsTo.length > 0 || record.supersedes.length > 0 ? (
        <Panel title="Related records">
          <ul className="space-y-1.5 text-sm">
            {record.supersedes.map((other) => (
              <li key={other.id}>
                <span className="overline mr-2">supersedes</span>
                <Link href={`/record/${other.id}`} className="underline underline-offset-2">
                  <span className="tabular">{other.recordNumber}</span> — {other.title}
                </Link>
              </li>
            ))}
            {record.relationsFrom.map((relation) => (
              <li key={relation.id}>
                <span className="overline mr-2">{relation.kind.toLowerCase().replaceAll("_", " ")}</span>
                <Link href={`/record/${relation.to.id}`} className="underline underline-offset-2">
                  <span className="tabular">{relation.to.recordNumber}</span> — {relation.to.title}
                </Link>
              </li>
            ))}
            {record.relationsTo.map((relation) => (
              <li key={relation.id}>
                <span className="overline mr-2">
                  {relation.kind.toLowerCase().replaceAll("_", " ")} by
                </span>
                <Link href={`/record/${relation.from.id}`} className="underline underline-offset-2">
                  <span className="tabular">{relation.from.recordNumber}</span> — {relation.from.title}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel
        title="Ledger history"
        description="Every act affecting this record, as committed to the chain"
        actions={<ButtonLink href="/chain">About the chain</ButtonLink>}
      >
        {proof ? (
          <>
            <div className="scroll-x">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--rule-strong)]">
                    <th className="overline pb-1.5 pr-3">Seq</th>
                    <th className="overline pb-1.5 pr-3">Act</th>
                    <th className="overline pb-1.5 pr-3">By</th>
                    <th className="overline pb-1.5 pr-3">When</th>
                    <th className="overline pb-1.5">Entry hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {proof.entries.map((entry) => (
                    <tr key={entry.sequence}>
                      <td className="tabular py-2 pr-3 align-top">#{entry.sequence}</td>
                      <td className="py-2 pr-3 align-top">
                        {entry.eventType.replaceAll("_", " ").toLowerCase()}
                      </td>
                      <td className="muted py-2 pr-3 align-top text-xs">{entry.actorLabel}</td>
                      <td className="tabular muted whitespace-nowrap py-2 pr-3 align-top text-xs">
                        {formatTimestamp(entry.createdAt)}
                      </td>
                      <td className="tabular muted py-2 align-top text-xs" title={entry.entryHash}>
                        {shortHash(entry.entryHash)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-[var(--rule)] pt-3">
              <p className="overline">Content digest of this record as it now stands</p>
              <p className="digest mt-0.5">{digest}</p>
            </div>

            {proof.coveringAnchor ? (
              <p className="muted mt-3 text-xs">
                Covered by external anchor #{proof.coveringAnchor.sequence} (
                {proof.coveringAnchor.method.replaceAll("_", " ").toLowerCase()}
                {proof.coveringAnchor.externalRef ? `, ref ${proof.coveringAnchor.externalRef}` : ""}
                ) recorded {formatDate(proof.coveringAnchor.anchoredAt)}. This record provably
                existed no later than that date.
              </p>
            ) : (
              <p className="muted mt-3 text-xs">
                No external anchor yet covers this record. Its dates currently rest on the
                Kingdom&rsquo;s own attestation. Anchoring the chain fixes that.
              </p>
            )}
          </>
        ) : (
          <p className="muted text-sm">No ledger entries reference this record.</p>
        )}
      </Panel>

      <Panel title="Recorded">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Recorded at">{formatTimestamp(record.recordedAt)}</Field>
          <Field label="Last amended">{formatTimestamp(record.updatedAt)}</Field>
          <Field label="Effective date">{formatDate(record.effectiveDate)}</Field>
        </dl>
      </Panel>

      {can(principal.role, "record:void") ||
      can(principal.role, "hold:issue") ||
      can(principal.role, "record:amend") ? (
        <Panel title="Registrar&rsquo;s actions">
          {can(principal.role, "hold:issue") ? (
            <IssueHoldForm action={issueHoldAction.bind(null, record.id)} />
          ) : null}
          {can(principal.role, "record:amend") ? (
            <>
              <RelateForm action={relateRecordAction.bind(null, record.id)} />
              <SupersedeForm action={supersedeRecordAction.bind(null, record.id)} />
            </>
          ) : null}
          {can(principal.role, "record:void") && !record.voidedAt ? (
            <VoidRecordForm action={voidRecordAction.bind(null, record.id)} />
          ) : null}
        </Panel>
      ) : null}
    </>
  );
}
