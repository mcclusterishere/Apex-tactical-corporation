import Link from "next/link";
import type { Metadata } from "next";
import { listTemplates } from "@/lib/docs";
import { PageHeader, Panel, EmptyState, Caution } from "@/components/ui";

export const metadata: Metadata = { title: "Instrument templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <>
      <PageHeader
        overline="Reference library"
        title="Instrument templates"
        lede="Drafting starting points for the documents the Kingdom sends out. Each carries notes explaining what the drafting is doing and what was deliberately left out."
      />

      <div className="mb-6">
        <Caution title="A template is a starting point, not a filing">
          Every one of these must be adapted to the facts before it goes out, and the consequential
          ones — anything asserting a right against a named party, anything a member signs — should
          be reviewed by licensed counsel the first time. The cost of one review is a fraction of
          the cost of one letter that cannot be defended.
        </Caution>
      </div>

      <Panel>
        {templates.length === 0 ? (
          <EmptyState title="No templates on file">
            Markdown files in <code className="tabular">docs/templates/</code> appear here
            automatically.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {templates.map((template) => (
              <li key={template.slug} className="py-3">
                <Link
                  href={`/doctrine/templates/${template.slug}`}
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  {template.title}
                </Link>
                <p className="muted mt-0.5 text-sm">{template.standfirst}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
