import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, Panel, Caution } from "@/components/ui";

export const metadata: Metadata = { title: "Verify a certified copy" };

export default async function VerifyIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  // The lookup form is a plain GET so that a verification is a shareable URL —
  // a recipient can be sent straight to the result rather than instructions.
  const { number } = await searchParams;
  const trimmed = number?.trim();
  if (trimmed) redirect(`/verify/${encodeURIComponent(trimmed.toUpperCase())}`);

  return (
    <>
      <PageHeader
        overline="Public service"
        title="Verify a certified copy"
        lede="Confirm that a document presented as an extract from the Apex Kingdom register matches what the register actually contains. No account is required."
      />

      <Panel title="Enter the record number">
        <form action="/verify" className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="number" className="overline mb-1 block">
              Record number
            </label>
            <input
              id="number"
              name="number"
              placeholder="AK-IP-000014"
              className="surface tabular w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-2 text-sm uppercase outline-none focus:border-ink-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-2 text-sm font-medium text-ink-50 hover:bg-ink-700 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
          >
            Verify
          </button>
        </form>
        <p className="muted mt-3 text-sm">
          The number appears at the head of every certified extract, in the form{" "}
          <span className="tabular">AK-XXX-000000</span>.
        </p>
      </Panel>

      <Panel title="What verification proves, and what it does not">
        <div className="prose-doc text-sm">
          <p>
            Each entry in the register is committed to an append-only ledger in which every entry is
            bound by a cryptographic hash to the entry before it. Changing any historical entry
            changes its hash, which breaks every link after it. Verification recomputes those hashes
            and reports whether the chain is intact.
          </p>
          <p>
            <strong>What this establishes:</strong> that the entry you were shown is the entry the
            Kingdom recorded, that its contents have not been altered since, and that it occupies a
            fixed position in a sequence that cannot be silently rewritten.
          </p>
          <p>
            <strong>What it does not establish:</strong> that anything recorded in the entry is
            true. The Kingdom certifies what its own register says. It does not certify the
            underlying facts, and no certified extract should be read as a determination by any
            court, agency, or government.
          </p>
          <p>
            Where an entry is covered by an <em>external anchor</em>, the verification result will
            say so. An anchor is a publication of the ledger&rsquo;s head hash somewhere outside the
            Kingdom&rsquo;s control on a fixed date. That is what converts an internal record into
            proof of the date on which something existed, and it is the difference between a
            well-kept file and evidence.
          </p>
        </div>
      </Panel>

      <Caution title="If a verification fails">
        A number that returns nothing, or a digest that does not match the document in your hand,
        means the document was not issued by this office or has been altered since it was. Contact
        the Office of the Registrar before relying on it.
      </Caution>
    </>
  );
}
