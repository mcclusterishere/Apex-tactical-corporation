import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { canWriteRegistry } from "@/lib/authz";
import { getRegistry } from "@/registries";
import { toFormRegistry } from "@/registries/types";
import { PageHeader, Panel, Caution } from "@/components/ui";
import { RecordForm } from "@/components/RecordForm";
import { Markdown } from "@/components/Markdown";
import { createRecordAction } from "@/app/actions/records";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const registry = getRegistry(slug);
  return { title: registry ? `New ${registry.recordLabel}` : "New entry" };
}

export default async function NewRecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const registry = getRegistry(slug);
  if (!registry) notFound();

  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) {
    redirect(`/sign-in?next=${encodeURIComponent(`/registry/${slug}/new`)}`);
  }
  if (!canWriteRegistry(principal.role, registry.restrictedTo)) {
    return (
      <>
        <PageHeader
          overline={registry.title}
          title="Not within your commission"
          lede={`Entries in the ${registry.title} are restricted to ${
            registry.restrictedTo?.join(", ") ?? "officers with recording authority"
          }.`}
        />
        <Panel>
          <p className="text-sm">
            Separation of duties is deliberate. If your office should carry this power, the Sovereign
            can amend your commission from the principals page.
          </p>
        </Panel>
      </>
    );
  }

  const action = createRecordAction.bind(null, registry.slug);

  return (
    <>
      <PageHeader
        overline={registry.title}
        title={`Record a new ${registry.recordLabel.toLowerCase()}`}
        lede={registry.description}
      />

      {registry.guidance ? (
        <details className="surface mb-6 rounded-sm border border-[var(--rule)]" open>
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold">
            Before you enter this — how the register is kept
          </summary>
          <div className="border-t border-[var(--rule)] px-4 py-4">
            <Markdown source={registry.guidance} />
          </div>
        </details>
      ) : null}

      <div className="mb-6">
        <Caution title="Record the facts as they are">
          A register is only worth what its accuracy is worth. Enter dates you can document, leave
          blank what you do not yet know, and use the amendment procedure when better information
          arrives — every amendment is recorded with its reason, which is precisely what makes the
          register credible to someone who did not write it.
        </Caution>
      </div>

      <RecordForm
        registry={toFormRegistry(registry)}
        action={action}
        submitLabel={`Record ${registry.recordLabel.toLowerCase()}`}
        cancelHref={`/registry/${registry.slug}`}
      />
    </>
  );
}
