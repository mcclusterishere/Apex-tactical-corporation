import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can, canWriteRegistry } from "@/lib/authz";
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
  if (!canView(principal.clearance, record.classification)) notFound();

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

  // Convert stored values into the string/string[] shapes the form controls use.
  const initialData: Record<string, string | string[]> = {};
  for (const field of registry.fields) {
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
          registry={toFormRegistry(registry)}
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
