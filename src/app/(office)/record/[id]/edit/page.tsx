import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can, canWriteRegistry } from "@/lib/authz";
import { canReadRecord } from "@/lib/access";
import { canView } from "@/lib/classification";
import { getRegistry } from "@/registries";
import { toFormRegistry } from "@/registries/types";
import { parseJson } from "@/lib/canonical";
import { PageHeader, Panel, Caution } from "@/components/ui";
import { RecordForm } from "@/components/RecordForm";
import { amendRecordAction } from "@/app/actions/records";
import { toDateInput } from "@/lib/format";

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
  return { title: record ? `Amend ${record.recordNumber}` : "Amend record" };
}

export default async function EditRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await getPrincipal();

  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) notFound();

  const registry = getRegistry(record.registry);
  if (!registry) notFound();
  // Registry keepers may read the register they keep, even above their clearance.
  if (!canReadRecord(principal, record, registry)) notFound();

  if (!isAuthenticated(principal)) {
    redirect(`/sign-in?next=${encodeURIComponent(`/record/${id}/edit`)}`);
  }
  if (!canWriteRegistry(principal.role, registry.restrictedTo)) {
    return (
      <>
        <PageHeader
          overline={registry.title}
          title="Not within your commission"
          lede={`Amending entries in the ${registry.title} is reserved to other offices.`}
        />
      </>
    );
  }

  const stored = parseJson<Record<string, unknown>>(record.data, {});

  /**
   * Only fields within the amender's clearance are put in front of them.
   *
   * The record detail page already filters these out of the rendered view. This
   * form must too, and for a stronger reason: `initial` is serialised into the
   * client payload of a client component, so an above-clearance value placed
   * here is shipped to the browser and readable in the page source whether or
   * not any input renders it. Filtering the display alone would have been
   * worthless.
   *
   * `amendRecord` carries the withheld values forward server-side, so omitting
   * them here does not blank them on save.
   */
  const amendableFields = registry.fields.filter(
    (field) => !field.classification || canView(principal.clearance, field.classification),
  );
  const withheldCount = registry.fields.length - amendableFields.length;
  const formRegistry = { ...toFormRegistry(registry), fields: amendableFields };

  // Convert stored values into the string/string[] shapes the form controls use.
  const initialData: Record<string, string | string[]> = {};
  for (const field of amendableFields) {
    const value = stored[field.key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      initialData[field.key] = value.map(String);
    } else if (field.type === "money" && typeof value === "number") {
      initialData[field.key] = (value / 100).toFixed(2);
    } else if (typeof value === "boolean") {
      initialData[field.key] = value ? "on" : "";
    } else {
      initialData[field.key] = String(value);
    }
  }

  const action = amendRecordAction.bind(null, record.id);

  return (
    <>
      <PageHeader
        overline={`${registry.title} · ${record.recordNumber}`}
        title={`Amend ${record.title}`}
        lede="The previous state is preserved in the ledger. This entry supplements the record; it does not erase what came before."
      />

      {withheldCount > 0 ? (
        <div className="mb-6">
          <Caution title="Part of this record is not shown to you">
            {withheldCount === 1
              ? "One field on this record is classified above your clearance."
              : `${withheldCount} fields on this record are classified above your clearance.`}{" "}
            They are not displayed, not sent to your browser, and will be carried forward
            unchanged when you save — you cannot blank them by accident. The ledger will note
            that this amendment was made without sight of them.
          </Caution>
        </div>
      ) : null}

      <div className="mb-6">
        <Caution title="Amendments are recorded, not silent">
          The ledger will hold a diff of exactly what changed, your stated reason, and the full
          post-amendment state, signed into the chain. That permanence is what makes the register
          worth citing — correct errors openly and the record stays credible.
        </Caution>
      </div>

      {record.voidedAt ? (
        <Panel tone="seal">
          <p className="text-sm">
            This record is void and cannot be amended. Record a fresh entry and mark it as
            superseding this one if the substance needs to be restated.
          </p>
        </Panel>
      ) : (
        <RecordForm
          registry={formRegistry}
          action={action}
          submitLabel="Record the amendment"
          cancelHref={`/record/${record.id}`}
          requireReason
          canReclassify={can(principal.role, "record:seal")}
          initial={{
            title: record.title,
            status: record.status,
            classification: record.classification,
            effectiveDate: toDateInput(record.effectiveDate),
            data: initialData,
          }}
        />
      )}
    </>
  );
}
