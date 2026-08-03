import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readDoc, listDocs } from "@/lib/docs";
import { Markdown } from "@/components/Markdown";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const docs = await listDocs();
  const doc = docs.find((candidate) => candidate.slug === slug);
  return { title: doc?.title ?? "Document" };
}

export default async function DoctrineDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // "templates" is a sibling route, not a document.
  if (slug === "templates") notFound();

  const source = await readDoc(slug);
  if (!source) notFound();

  const docs = await listDocs();
  const index = docs.findIndex((candidate) => candidate.slug === slug);
  const previous = index > 0 ? docs[index - 1] : null;
  const next = index >= 0 && index < docs.length - 1 ? docs[index + 1] : null;

  return (
    <article>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3">
        <Link href="/doctrine" className="muted text-sm underline underline-offset-2">
          ← Manuals &amp; doctrine
        </Link>
        <ButtonLink href="/doctrine">All documents</ButtonLink>
      </div>

      <Markdown source={source} />

      <nav className="no-print mt-10 flex flex-wrap justify-between gap-3 border-t border-[var(--rule)] pt-4 text-sm">
        {previous ? (
          <Link href={`/doctrine/${previous.slug}`} className="underline underline-offset-2">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/doctrine/${next.slug}`} className="underline underline-offset-2">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
