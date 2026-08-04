import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { currencyState, verifyCurrency, formatMarks, MARK } from "@/lib/currency";
import { PageHeader, Panel, Stat, ButtonLink, Caution, EmptyState } from "@/components/ui";
import { OpenWalletForm } from "@/components/CurrencyForms";
import { openWalletAction } from "@/app/actions/currency";
import { formatCents } from "@/lib/treasury";

export const metadata: Metadata = { title: "The Mint — Apex Mark" };
export const dynamic = "force-dynamic";

export default async function CurrencyPage() {
  const principal = await getPrincipal();
  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";
  const mayRead = mayKeep || can(principal.role, "audit:read");

  if (!isAuthenticated(principal) || !mayRead) {
    return (
      <PageHeader
        overline="The Mint"
        title="Not within your commission"
        lede="The Apex Mark is kept by the Treasurer and the Sovereign, and may be read by the Auditor."
      />
    );
  }

  const [state, problems, wallets] = await Promise.all([
    currencyState(),
    verifyCurrency(),
    prisma.currencyAccount.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  const outstandingUsd = formatCents(Math.round((state.outstandingMinor * MARK.pegUsdCents) / MARK.minorPerUnit));

  return (
    <>
      <PageHeader
        overline="Treasury · The Mint"
        title="The Apex Mark"
        lede={
          <>
            The Kingdom&rsquo;s own unit of account: <strong>{MARK.symbol}</strong>, one Mark to the
            United States dollar, fully reserved and redeemable at par. Used within the membership
            for the Kingdom&rsquo;s own goods and services — not legal tender, not minted as coin,
            and never moved between third parties.
          </>
        }
        actions={<ButtonLink href="/doctrine/16-THE-APEX-MARK">The legal basis</ButtonLink>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="In circulation"
          value={<>{MARK.symbol}{formatMarks(state.outstandingMinor)}</>}
          detail={`Across ${state.activeWalletCount} active ${state.activeWalletCount === 1 ? "wallet" : "wallets"}`}
        />
        <Stat
          label="Reserve held"
          value={<>${outstandingUsd === "0.00" ? formatCents(state.reserveCents) : formatCents(state.reserveCents)}</>}
          detail="United States dollars backing the Marks"
          tone="success"
        />
        <Stat
          label="Backing"
          value={state.fullyReserved ? "100%" : "SHORT"}
          detail={state.fullyReserved ? "Every Mark is backed by a dollar" : "Reserve is below Marks outstanding"}
          tone={state.fullyReserved ? "success" : "danger"}
        />
        <Stat
          label="Integrity"
          value={problems.length === 0 ? "Intact" : `${problems.length}`}
          detail={problems.length === 0 ? "Wallets, books and reserve agree" : "Discrepancies found"}
          tone={problems.length === 0 ? "success" : "danger"}
        />
      </div>

      {problems.length > 0 ? (
        <Panel title="The money supply does not reconcile" tone="seal">
          <p className="mb-3 text-sm">
            The wallets, the double-entry books, and the reserve are checked against one another.
            They disagree, which means either the ledger was edited outside this application or a
            Mark exists that is not backed. Stop issuing and investigate before anything else moves.
          </p>
          <ul className="space-y-2 text-sm">
            {problems.slice(0, 20).map((problem, index) => (
              <li key={index} className="border-l-[3px] border-seal-600 pl-3">
                <strong>{problem.kind.replaceAll("_", " ").toLowerCase()}</strong>
                <span className="muted block text-xs">{problem.detail}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <div className="mb-6">
        <Caution title="What the Mark is, and the lines it does not cross">
          A member gives the Kingdom dollars and receives Marks; spends them on the Kingdom&rsquo;s
          own goods and services; and redeems the rest for dollars at any time. There is no
          transfer between members, because moving value between third parties is money transmission
          under 18 U.S.C. § 1960. Nothing here is coined or printed to circulate as money — that is
          a separate offence under § 486. And the Mark earns nothing and is redeemable at par, so it
          is a credit, not an investment. Every issuance and redemption is recorded on the books and
          committed to the hash chain. Read the memorandum before scaling this, and have counsel
          look at it before you take dollars from anyone outside a small, closed membership.
        </Caution>
      </div>

      {mayKeep ? (
        <Panel title="Open a wallet" description="One per member. Issuance is confined to members, which is what keeps the loop closed.">
          <OpenWalletForm action={openWalletAction} />
        </Panel>
      ) : null}

      <Panel title="Wallets" description={`${state.walletCount} in total`}>
        {wallets.length === 0 ? (
          <EmptyState title="No wallets yet">
            Open a wallet for a member, then issue Marks against the dollars they deposit.
          </EmptyState>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Wallet</th>
                  <th className="overline pb-1.5 pr-3">Holder</th>
                  <th className="overline pb-1.5 pr-3">Status</th>
                  <th className="overline pb-1.5 pr-3 text-right">Balance</th>
                  <th className="overline pb-1.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td className="tabular py-2.5 pr-3">{wallet.number}</td>
                    <td className="py-2.5 pr-3">{wallet.holderName}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${
                          wallet.status === "ACTIVE"
                            ? "border-moss-500 text-moss-700 dark:text-moss-100"
                            : wallet.status === "FROZEN"
                              ? "border-seal-600 text-seal-600"
                              : "border-ink-300 text-ink-600 dark:text-ink-300"
                        }`}
                      >
                        {wallet.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="tabular py-2.5 pr-3 text-right">
                      {MARK.symbol}
                      {formatMarks(wallet.balanceMinor)}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/treasury/currency/${wallet.id}`}
                        className="link text-[13px]"
                      >
                        open
                      </Link>
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
