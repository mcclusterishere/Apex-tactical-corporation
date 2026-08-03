import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The doctrine library: manuals and instrument templates held as markdown in
 * docs/ and read at request time.
 *
 * Kept as files rather than database rows deliberately. These documents are the
 * Kingdom's operating knowledge; they belong in version control where changes
 * are reviewable and the history is legible, and they must remain readable if
 * this application never runs again.
 */

const DOCS_ROOT = path.join(process.cwd(), "docs");

export interface DocSummary {
  slug: string;
  title: string;
  standfirst: string;
  order: number;
}

function safeJoin(root: string, ...segments: string[]): string | null {
  const target = path.resolve(root, ...segments);
  const rootResolved = path.resolve(root);
  // Reject anything that escapes the docs tree, however it was encoded.
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) return null;
  return target;
}

/** First heading, or the filename if the document has none. */
function extractTitle(source: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(source);
  return match ? match[1].trim() : fallback;
}

/** First italic line or first paragraph after the title, for the index page. */
function extractStandfirst(source: string): string {
  const withoutTitle = source.replace(/^#\s+.+$/m, "").trim();
  const firstBlock = withoutTitle.split(/\n\s*\n/)[0] ?? "";
  return firstBlock
    .replace(/^[*_]+|[*_]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

async function listMarkdown(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

export async function listDocs(): Promise<DocSummary[]> {
  const files = await listMarkdown(DOCS_ROOT);
  const docs: DocSummary[] = [];

  for (const file of files) {
    const target = safeJoin(DOCS_ROOT, file);
    if (!target) continue;
    const source = await readFile(target, "utf8").catch(() => "");
    if (!source) continue;
    const slug = file.replace(/\.md$/, "");
    const numeric = /^(\d+)/.exec(slug);
    docs.push({
      slug,
      title: extractTitle(source, slug),
      standfirst: extractStandfirst(source),
      order: numeric ? Number(numeric[1]) : 999,
    });
  }

  return docs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function listTemplates(): Promise<DocSummary[]> {
  const dir = path.join(DOCS_ROOT, "templates");
  const files = await listMarkdown(dir);
  const docs: DocSummary[] = [];

  for (const file of files) {
    const target = safeJoin(dir, file);
    if (!target) continue;
    const source = await readFile(target, "utf8").catch(() => "");
    if (!source) continue;
    const slug = file.replace(/\.md$/, "");
    docs.push({
      slug,
      title: extractTitle(source, slug),
      standfirst: extractStandfirst(source),
      order: 0,
    });
  }

  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

export async function readDoc(slug: string, subdir?: string): Promise<string | null> {
  // Reject separators outright rather than relying on normalisation alone.
  if (slug.includes("/") || slug.includes("\\") || slug.includes("..")) return null;
  const base = subdir ? path.join(DOCS_ROOT, subdir) : DOCS_ROOT;
  const target = safeJoin(base, `${slug}.md`);
  if (!target) return null;
  return readFile(target, "utf8").catch(() => null);
}
