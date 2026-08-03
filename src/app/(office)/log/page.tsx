import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { currentTree } from "@/lib/merkle";
import { PageHeader, Panel, Stat, ButtonLink, EmptyState, Caution } from "@/components/ui";
import { CheckpointForm } from "@/components/LogForms";
import { cutCheckpointAction } from "@/app/actions/log";
import { formatTimestamp, shortHash } from "@/lib/format";

export const metadata: Metadata = { title: "Transparency log" };
export const dynamic = "force-dynamic";

export default async function LogPage() {
  const principal = await getPrincipal();

  const [tree, checkpoints, entryCount] = await Promise.all([
    currentTree(),
    prisma.merkleCheckpoint.findMany({ orderBy: { treeSize: "desc" }, take: 25 }),
    prisma.ledgerEntry.count(),
  ]);

  const latest = checkpoints[0];
  const uncommitted = latest ? tree.size - latest.treeSize : tree.size;

  return (
    <>
      <PageHeader
        overline="Public verification"
        title="The transparency log"
        lede="A Merkle tree over every ledger entry. It lets the Kingdom prove that one record is in the log — without disclosing any other record — to someone who does not trust it."
        actions={<ButtonLink href="/verify">Verify a certificate</ButtonLink>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Log size" value={tree.size.toLocaleString()} detail={`${entryCount} ledger entries`} />
        <Stat
          label="Checkpoints"
          value={checkpoints.length.toLocaleString()}
          detail={latest ? `Latest covers ${latest.treeSize} entries` : "None cut"}
          tone={latest ? "success" : "warning"}
        />
        <Stat
          label="Not yet in a checkpoint"
          value={uncommitted.toLocaleString()}
          detail="Entries with no published root covering them"
          tone={uncommitted > 20 ? "warning" : "default"}
        />
      </div>

      <Panel title="Current tree head">
        <p className="overline">Root hash over {tree.size} entries</p>
        <p className="digest mt-1 select-all">{tree.root}</p>
        <p className="muted mt-2 text-sm">
          This value commits to every ledger entry at once. Change any entry — its content, its
          order, its timestamp — and this root changes. Publish it and the Kingdom has fixed its
          entire history in one line of text.
        </p>
      </Panel>

      {can(principal.role, "chain:anchor") ? (
        <Panel
          title="Cut a checkpoint"
          description="Fixes the current root so proofs can be issued against it. Cut one before issuing any certificate that will be relied upon."
        >
          <CheckpointForm action={cutCheckpointAction} />
        </Panel>
      ) : null}

      {!latest && tree.size > 0 ? (
        <div className="mb-6">
          <Caution title="No checkpoint has been cut">
            Proofs are issued against a published root, not against the live tree — a proof against
            a root nobody has seen proves nothing. Cut a checkpoint, then publish it in the gazette
            and anchor it externally.
          </Caution>
        </div>
      ) : null}

      <Panel title="Checkpoints" description="Each fixes the log at a size. Publish them.">
        {checkpoints.length === 0 ? (
          <EmptyState title="No checkpoints cut" />
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Tree size</th>
                  <th className="overline pb-1.5 pr-3">Cut</th>
                  <th className="overline pb-1.5 pr-3">Signed</th>
                  <th className="overline pb-1.5">Root</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {checkpoints.map((checkpoint) => (
                  <tr key={checkpoint.id}>
                    <td className="tabular py-2 pr-3">{checkpoint.treeSize.toLocaleString()}</td>
                    <td className="tabular muted whitespace-nowrap py-2 pr-3 text-xs">
                      {formatTimestamp(checkpoint.createdAt)}
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {checkpoint.signature ? (
                        <span className="text-moss-700 dark:text-moss-100">yes</span>
                      ) : (
                        <span className="muted">no</span>
                      )}
                    </td>
                    <td className="tabular muted py-2 text-xs" title={checkpoint.rootHash}>
                      {shortHash(checkpoint.rootHash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="What an inclusion proof is, and why it matters here">
        <div className="prose-doc text-sm">
          <p>
            The hash chain proves the ledger is internally consistent, but checking it means reading
            every entry. Most of this register is member data, sealed discipline files, and financial
            detail — the Kingdom cannot hand a municipal clerk the whole ledger to prove one deed.
          </p>
          <p>
            A Merkle tree solves exactly that. An inclusion proof is a short list of hashes — about
            twenty for a log of a million entries — that lets anyone recompute the published root
            from a single entry. If it matches, that entry is in the log. If it does not, it is not.
            Nothing about any other entry is revealed, because every value in the proof is a digest.
          </p>
          <p>
            The proof is on every certified extract. A recipient can check it with thirty lines of
            code and no cooperation from the Kingdom, which is the whole point: a verification that
            requires the issuer&rsquo;s help verifies nothing.
          </p>
          <p>
            The companion property is <em>consistency</em>: given two published roots, anyone can
            check that the later log is an append-only extension of the earlier one. That is what
            stops the Kingdom publishing one history today and a different one tomorrow — and it is
            why the roots must be published somewhere outside the Kingdom&rsquo;s control. See{" "}
            <Link href="/chain" className="underline underline-offset-2">
              the ledger chain
            </Link>{" "}
            for anchoring.
          </p>
        </div>
      </Panel>
    </>
  );
}
