import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readDoc, listTemplates } from "@/lib/docs";
import { Markdown } from "@/components/Markdown";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const templates = await listTemplates();
  const template = templates.find((candidate) => candidate.slug === slug);
  return { title: template?.title ?? "Template" };
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = await readDoc(slug, "templates");
  if (!source) notFound();

  return (
    <article>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3">
        <Link href="/doctrine/templates" className="muted text-sm underline underline-offset-2">
          ← Instrument templates
        </Link>
        <ButtonLink href="/doctrine">Manuals &amp; doctrine</ButtonLink>
      </div>

      <Markdown source={source} />

      <p className="muted mt-10 border-t border-[var(--rule)] pt-4 text-xs">
        This template is an operating aid, not legal advice, and using it creates no attorney-client
        relationship. Adapt it to the facts, and have consequential instruments reviewed by licensed
        Connecticut counsel before they are signed or sent.
      </p>
    </article>
  );
}
