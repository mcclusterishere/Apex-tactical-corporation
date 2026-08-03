import Link from "next/link";
import type { Metadata } from "next";
import { listDocs, listTemplates } from "@/lib/docs";
import { PageHeader, Panel, EmptyState, Caution } from "@/components/ui";

export const metadata: Metadata = { title: "Manuals & doctrine" };
export const dynamic = "force-dynamic";

export default async function DoctrinePage() {
  const [docs, templates] = await Promise.all([listDocs(), listTemplates()]);

  return (
    <>
      <PageHeader
        overline="Reference library"
        title="Manuals &amp; doctrine"
        lede="How the Kingdom's affairs are conducted, why each register is kept the way it is, and what the law actually supports. Written to be read by whoever holds the office next."
      />

      <div className="mb-6">
        <Caution title="Read the legal posture memorandum first">
          It sets out plainly which of the Kingdom&rsquo;s asserted positions will hold, which will
          not, and what to do instead. Everything else in this library assumes it.
        </Caution>
      </div>

      <Panel title="Manuals">
        {docs.length === 0 ? (
          <EmptyState title="No manuals on file">
            Documents placed in <code className="tabular">docs/</code> as markdown appear here
            automatically.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {docs.map((doc) => (
              <li key={doc.slug} className="py-3">
                <Link
                  href={`/doctrine/${doc.slug}`}
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  {doc.title}
                </Link>
                <p className="muted mt-0.5 text-sm">{doc.standfirst}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Instrument templates"
        description="Drafting starting points, with notes on what each choice is doing"
      >
        {templates.length === 0 ? (
          <EmptyState title="No templates on file">
            Markdown files in <code className="tabular">docs/templates/</code> appear here.
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

      <p className="muted text-xs">
        Nothing in this library is legal advice, and reading it creates no attorney-client
        relationship. It is an operating manual prepared to organise the Kingdom&rsquo;s affairs.
        The matters it covers turn on facts and on jurisdiction, and warrant licensed Connecticut
        counsel before action is taken.
      </p>
    </>
  );
}
