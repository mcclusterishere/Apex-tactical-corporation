import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { trialBalance, fundBalances, verifyBooks, formatCents, isDebitNormal } from "@/lib/treasury";
import { PageHeader, Panel, Stat, ButtonLink, EmptyState, Caution } from "@/components/ui";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = { title: "Treasury" };
export const dynamic = "force-dynamic";

export default async function TreasuryPage() {
  const principal = await getPrincipal();
  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";

  if (!isAuthenticated(principal) || !(mayKeep || can(principal.role, "audit:read"))) {
    return (
      <PageHeader
        overline="Treasury"
        title="Not within your commission"
        lede="The books are kept by the Treasurer and the Sovereign, and may be read by the Auditor."
      />
    );
  }

  const [tb, funds, books, recent, accountCount] = await Promise.all([
    trialBalance(),
    fundBalances(),
    verifyBooks(),
    prisma.journalEntry.findMany({
      where: { status: { in: ["POSTED", "REVERSED"] } },
      orderBy: { date: "desc" },
      take: 12,
      include: { postings: true },
    }),
    prisma.account.count({ where: { active: true } }),
  ]);

  const assets = tb.rows.filter((r) => r.type === "ASSET").reduce((s, r) => s + r.balance, 0);
  const liabilities = tb.rows.filter((r) => r.type === "LIABILITY").reduce((s, r) => s + r.balance, 0);
  const restricted = funds
    .filter((f) => f.restriction !== "UNRESTRICTED")
    .reduce((s, f) => s + f.balanceCents, 0);

  return (
    <>
      <PageHeader
        overline="Stewardship"
        title="The Treasury"
        lede="Double-entry books for the Kingdom. Every entry balances, posted entries are never edited, and every posting carries the fund whose restriction it is subject to."
        actions={
          mayKeep ? (
            <>
              <ButtonLink href="/treasury/journal">Journal</ButtonLink>
              <ButtonLink href="/treasury/new" tone="primary">
                Post an entry
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href="/treasury/journal">Journal</ButtonLink>
          )
        }
      />

      {!books.trialBalanced || books.unbalanced.length > 0 ? (
        <div className="mb-6">
          <Caution title="The books do not balance">
            {books.unbalanced.length > 0
              ? `${books.unbalanced.length} posted ${books.unbalanced.length === 1 ? "entry does" : "entries do"} not balance. Postings were altered outside this application. Preserve the database before writing anything further.`
              : "The trial balance does not foot. Run `npm run chain:verify` and preserve the database."}
          </Caution>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total assets" value={formatCents(assets)} detail="Debit balances less credits" />
        <Stat label="Total liabilities" value={formatCents(liabilities)} />
        <Stat
          label="Restricted funds"
          value={formatCents(restricted)}
          detail="Not available for general operations"
          tone={restricted > 0 ? "warning" : "default"}
        />
        <Stat
          label="Books"
          value={books.trialBalanced && books.unbalanced.length === 0 ? "Balanced" : "Out"}
          detail={`${books.entriesChecked} entries, ${accountCount} accounts`}
          tone={books.trialBalanced && books.unbalanced.length === 0 ? "success" : "danger"}
        />
      </div>

      <Panel
        title="Trial balance"
        description="Every account with activity. Debits and credits must foot to the same figure."
      >
        {tb.rows.length === 0 ? (
          <EmptyState title="No entries posted">
            Open a chart of accounts and post the first entry. The chart is opened from the entry
            form.
          </EmptyState>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Code</th>
                  <th className="overline pb-1.5 pr-3">Account</th>
                  <th className="overline pb-1.5 pr-3">Type</th>
                  <th className="overline pb-1.5 pr-3 text-right">Debits</th>
                  <th className="overline pb-1.5 pr-3 text-right">Credits</th>
                  <th className="overline pb-1.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {tb.rows.map((row) => (
                  <tr key={row.accountId}>
                    <td className="tabular py-2 pr-3">{row.code}</td>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="muted py-2 pr-3 text-xs">
                      {row.type.replace("_", " ").toLowerCase()}
                      <span className="ml-1">({isDebitNormal(row.type) ? "Dr" : "Cr"})</span>
                    </td>
                    <td className="tabular py-2 pr-3 text-right">{formatCents(row.debits)}</td>
                    <td className="tabular py-2 pr-3 text-right">{formatCents(row.credits)}</td>
                    <td className="tabular py-2 text-right font-semibold">
                      {formatCents(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--rule-strong)]">
                  <td className="py-2 pr-3" colSpan={3}>
                    <span className="overline">Totals</span>
                  </td>
                  <td className="tabular py-2 pr-3 text-right font-semibold">
                    {formatCents(tb.totalDebits)}
                  </td>
                  <td className="tabular py-2 pr-3 text-right font-semibold">
                    {formatCents(tb.totalCredits)}
                  </td>
                  <td className="tabular py-2 text-right">
                    {tb.balanced ? (
                      <span className="text-moss-700 dark:text-moss-100">balanced</span>
                    ) : (
                      <span className="text-seal-600">OUT</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      {funds.length > 0 ? (
        <Panel
          title="Funds"
          description="Donor restrictions bind the Kingdom. A restricted balance is not available for general operations."
        >
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Code</th>
                  <th className="overline pb-1.5 pr-3">Fund</th>
                  <th className="overline pb-1.5 pr-3">Restriction</th>
                  <th className="overline pb-1.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {funds.map((fund) => (
                  <tr key={fund.id}>
                    <td className="tabular py-2 pr-3">{fund.code}</td>
                    <td className="py-2 pr-3">{fund.name}</td>
                    <td className="py-2 pr-3 text-xs">
                      {fund.restriction === "UNRESTRICTED" ? (
                        <span className="muted">Unrestricted</span>
                      ) : (
                        <span className="text-gilt-700 dark:text-gilt-300">
                          {fund.restriction.replace("_", " ").toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="tabular py-2 text-right">{formatCents(fund.balanceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Recent entries"
        actions={<ButtonLink href="/treasury/journal">Full journal</ButtonLink>}
      >
        {recent.length === 0 ? (
          <EmptyState title="Nothing posted yet" />
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule-strong)]">
                  <th className="overline pb-1.5 pr-3">Number</th>
                  <th className="overline pb-1.5 pr-3">Date</th>
                  <th className="overline pb-1.5 pr-3">Memo</th>
                  <th className="overline pb-1.5 pr-3">Status</th>
                  <th className="overline pb-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {recent.map((entry) => {
                  const amount = entry.postings.reduce((s, p) => s + p.debitCents, 0);
                  return (
                    <tr key={entry.id} className={entry.status === "REVERSED" ? "opacity-60" : undefined}>
                      <td className="tabular py-2 pr-3">
                        <Link href="/treasury/journal" className="underline underline-offset-2">
                          {entry.entryNumber}
                        </Link>
                      </td>
                      <td className="tabular muted py-2 pr-3 text-xs">{formatDateShort(entry.date)}</td>
                      <td className="py-2 pr-3">{entry.memo}</td>
                      <td className="muted py-2 pr-3 text-xs">{entry.status.toLowerCase()}</td>
                      <td className="tabular py-2 text-right">{formatCents(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="muted text-xs">
        These are the Kingdom&rsquo;s own books. They are not filed with any authority. See{" "}
        <Link href="/doctrine/08-TREASURY-AND-FINANCIAL-CONTROL" className="underline underline-offset-2">
          the financial control manual
        </Link>{" "}
        for the monthly close, segregation of duties, and the § 4958 rebuttable presumption
        procedure.
      </p>
    </>
  );
}
