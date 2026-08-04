import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { formatMarks, MARK } from "@/lib/currency";
import { PageHeader, Panel, Stat, Field, EmptyState } from "@/components/ui";
import { MovementForm, FreezeForm } from "@/components/CurrencyForms";
import { issueAction, spendAction, redeemAction, freezeWalletAction } from "@/app/actions/currency";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Wallet" };
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  ISSUE: "Issued",
  SPEND: "Spent",
  REDEEM: "Redeemed",
  ADJUST: "Adjusted",
  REVERSAL: "Reversal",
};

export default async function WalletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await getPrincipal();
  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";
  const mayRead = mayKeep || can(principal.role, "audit:read");
  if (!isAuthenticated(principal) || !mayRead) notFound();

  const wallet = await prisma.currencyAccount.findUnique({
    where: { id },
    include: { entries: { orderBy: { seq: "desc" }, take: 200 } },
  });
  if (!wallet) notFound();

  const frozen = wallet.status === "FROZEN";
  const active = wallet.status === "ACTIVE";

  return (
    <>
      <PageHeader
        overline={
          <Link href="/treasury/currency" className="link">
            The Mint
          </Link>
        }
        title={wallet.holderName}
        lede={
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular">{wallet.number}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${
                active
                  ? "border-moss-500 text-moss-700 dark:text-moss-100"
                  : frozen
                    ? "border-seal-600 text-seal-600"
                    : "border-ink-300 text-ink-600 dark:text-ink-300"
              }`}
            >
              {wallet.status.toLowerCase()}
            </span>
          </span>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Balance"
          value={<>{MARK.symbol}{formatMarks(wallet.balanceMinor)}</>}
          detail={`${MARK.plural} held`}
        />
        <Stat
          label="Redeemable for"
          value={<>${formatMarks(wallet.balanceMinor)}</>}
          detail="United States dollars, at par, on demand"
          tone="success"
        />
        <Stat label="Opened" value={<span className="text-base">{formatTimestamp(wallet.createdAt).split(",")[0]}</span>} detail={`by ${wallet.openedBy}`} />
      </div>

      {frozen ? (
        <Panel tone="seal" title="This wallet is frozen">
          <p className="text-sm">Nothing moves in or out until it is released. Release it below.</p>
        </Panel>
      ) : null}

      {mayKeep && active ? (
        <>
          <Panel title="Issue" description="Dollars in, Marks out. The dollars enter the reserve and back the Marks the instant they exist.">
            <MovementForm
              action={issueAction}
              walletId={wallet.id}
              verb="issue"
              label="Issue Marks"
              tone="primary"
              help="Record the dollars received from the member; an equal number of Marks is credited here and the reserve rises to match."
            />
          </Panel>
          <Panel title="Spend" description="The member consumes Marks for the Kingdom's own goods or services.">
            <MovementForm
              action={spendAction}
              walletId={wallet.id}
              verb="spend"
              label="Record spend"
              tone="default"
              help="The Marks are retired and the Kingdom recognises the revenue. The dollar that backed them is released from the reserve into operating cash."
            />
          </Panel>
          <Panel title="Redeem for dollars" description="The promise that makes the Mark trustworthy: par, on demand. Requires re-authentication.">
            <MovementForm
              action={redeemAction}
              walletId={wallet.id}
              verb="redeem"
              label="Redeem"
              tone="danger"
              help="Dollars leave the reserve and return to the member. This is the one movement that takes money out of the Kingdom, so it always steps up."
            />
          </Panel>
        </>
      ) : null}

      {mayKeep ? (
        <Panel title={frozen ? "Release this wallet" : "Freeze this wallet"}>
          <FreezeForm action={freezeWalletAction} walletId={wallet.id} frozen={!frozen} />
        </Panel>
      ) : null}

      <Panel title="History" description="Every movement, most recent first, each committed to the hash chain">
        {wallet.entries.length === 0 ? (
          <EmptyState title="Nothing has moved yet">
            Issue Marks against a member&rsquo;s deposit to open this wallet&rsquo;s history.
          </EmptyState>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">#</th>
                  <th className="overline pb-1.5 pr-3">Movement</th>
                  <th className="overline pb-1.5 pr-3">Memo</th>
                  <th className="overline pb-1.5 pr-3 text-right">Change</th>
                  <th className="overline pb-1.5 pr-3 text-right">Balance</th>
                  <th className="overline pb-1.5">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {wallet.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="tabular muted py-2.5 pr-3">{entry.seq}</td>
                    <td className="py-2.5 pr-3">{TYPE_LABEL[entry.type] ?? entry.type}</td>
                    <td className="muted py-2.5 pr-3">{entry.memo ?? "—"}</td>
                    <td
                      className={`tabular py-2.5 pr-3 text-right ${
                        entry.deltaMinor >= 0 ? "text-moss-700 dark:text-moss-100" : "text-seal-600"
                      }`}
                    >
                      {entry.deltaMinor >= 0 ? "+" : "−"}
                      {MARK.symbol}
                      {formatMarks(Math.abs(entry.deltaMinor))}
                    </td>
                    <td className="tabular py-2.5 pr-3 text-right">
                      {MARK.symbol}
                      {formatMarks(entry.balanceAfterMinor)}
                    </td>
                    <td className="tabular muted whitespace-nowrap py-2.5 text-xs">
                      {formatTimestamp(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
