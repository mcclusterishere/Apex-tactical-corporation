import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { ACCOUNT_TYPES, RESTRICTIONS, isDebitNormal } from "@/lib/treasury";
import { PageHeader, Panel, EmptyState, Caution } from "@/components/ui";
import { ChartForms } from "@/components/ChartForms";
import { createAccountAction, createFundAction } from "@/app/actions/treasury";

export const metadata: Metadata = { title: "Chart of accounts" };
export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const principal = await getPrincipal();
  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";

  if (!isAuthenticated(principal) || !mayKeep) {
    return (
      <PageHeader
        overline="Treasury"
        title="Not within your commission"
        lede="The chart of accounts is kept by the Treasurer and the Sovereign."
      />
    );
  }

  const [accounts, funds] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.fund.findMany({ orderBy: { code: "asc" } }),
  ]);

  const byType = ACCOUNT_TYPES.map((type) => ({
    type,
    rows: accounts.filter((a) => a.type === type),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <PageHeader
        overline="Treasury"
        title="Chart of accounts and funds"
        lede="The structure the books are kept in. Accounts classify what a transaction touched; funds carry the restriction it is subject to."
      />

      <div className="mb-6">
        <Caution title="Getting the account type right matters more than the name">
          Assets and expenses are debit-normal; liabilities, net assets, and revenue are
          credit-normal. An account classified the wrong way produces a set of books that balances
          perfectly and reports the opposite of the truth, which is the hardest kind of error to
          find.
        </Caution>
      </div>

      <Panel title="Accounts" description={`${accounts.length} on the chart`}>
        {accounts.length === 0 ? (
          <EmptyState title="No accounts yet">
            A workable starting chart: 1000 Cash at bank, 1100 Contributions receivable, 1500 Land
            and buildings, 2000 Accounts payable, 2100 Payroll liabilities, 3000 Net assets without
            donor restriction, 3100 Net assets with donor restriction, 4000 Tithes and offerings,
            4100 Grants, 5000 Ministry expense, 5100 Occupancy, 5200 Salaries and stipends, 5900
            Professional fees.
          </EmptyState>
        ) : (
          <div className="space-y-5">
            {byType.map((group) => (
              <div key={group.type}>
                <h3 className="overline mb-1.5">
                  {group.type.replace("_", " ")} · normally {isDebitNormal(group.type) ? "debit" : "credit"}
                </h3>
                <div className="scroll-x">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-[var(--rule)]">
                      {group.rows.map((account) => (
                        <tr key={account.id} className={account.active ? undefined : "opacity-60"}>
                          <td className="tabular w-24 py-1.5 pr-3">{account.code}</td>
                          <td className="py-1.5 pr-3">{account.name}</td>
                          <td className="muted py-1.5 text-xs">
                            {account.subtype ?? ""}
                            {account.description ? ` — ${account.description}` : ""}
                            {account.active ? "" : " (closed)"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Funds" description={`${funds.length} open`}>
        {funds.length === 0 ? (
          <EmptyState title="No funds yet">
            At minimum open one unrestricted general fund. Open a separate fund for every restricted
            gift — the restriction is legally binding and a commingled restricted gift is a breach
            of trust that is very hard to unwind.
          </EmptyState>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--rule)]">
                {funds.map((fund) => (
                  <tr key={fund.id}>
                    <td className="tabular w-24 py-1.5 pr-3">{fund.code}</td>
                    <td className="py-1.5 pr-3">{fund.name}</td>
                    <td className="py-1.5 pr-3 text-xs">
                      {fund.restriction === "UNRESTRICTED" ? (
                        <span className="muted">unrestricted</span>
                      ) : (
                        <span className="text-gilt-700 dark:text-gilt-300">
                          {fund.restriction.replace("_", " ").toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="muted py-1.5 text-xs">{fund.purpose ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ChartForms
        accountAction={createAccountAction}
        fundAction={createFundAction}
        accountTypes={[...ACCOUNT_TYPES]}
        restrictions={[...RESTRICTIONS]}
      />
    </>
  );
}
