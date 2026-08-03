"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

interface Line {
  key: number;
  accountCode: string;
  fundCode: string;
  debit: string;
  credit: string;
  memo: string;
}

const EMPTY = (key: number): Line => ({
  key,
  accountCode: "",
  fundCode: "",
  debit: "",
  credit: "",
  memo: "",
});

/** Parse for display only. The server re-parses and is the authority. */
function toCents(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return 0;
  const negative = cleaned.startsWith("-");
  const [whole, fraction = ""] = cleaned.replace("-", "").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return negative ? -cents : cents;
}

function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100).toLocaleString()}.${String(abs % 100).padStart(2, "0")}`;
}

function Submit({ balanced }: { balanced: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || !balanced}
      className="rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      title={balanced ? undefined : "Debits must equal credits before an entry can be posted."}
    >
      {pending ? "Posting…" : "Post entry"}
    </button>
  );
}

export function JournalForm({
  action,
  accounts,
  funds,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  accounts: { code: string; name: string; type: string }[];
  funds: { code: string; name: string; restriction: string }[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  const [lines, setLines] = useState<Line[]>([EMPTY(1), EMPTY(2)]);
  const [nextKey, setNextKey] = useState(3);

  const totalDebits = lines.reduce((sum, line) => sum + toCents(line.debit), 0);
  const totalCredits = lines.reduce((sum, line) => sum + toCents(line.credit), 0);
  const difference = totalDebits - totalCredits;
  const hasAmounts = totalDebits > 0 || totalCredits > 0;
  const balanced = hasAmounts && difference === 0;

  const update = (key: number, field: keyof Omit<Line, "key">, value: string) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, [field]: value } : line)),
    );

  if (accounts.length === 0) {
    return (
      <div className="border-l-[3px] border-gilt-500 bg-gilt-100/60 px-4 py-3 text-sm dark:bg-transparent">
        <p className="font-semibold">There is no chart of accounts yet.</p>
        <p className="muted mt-1">
          Open accounts before posting. Conventionally: 1xxx assets, 2xxx liabilities, 3xxx net
          assets, 4xxx revenue, 5xxx and above expenses.{" "}
          <Link href="/treasury/accounts" className="underline underline-offset-2">
            Open the chart of accounts
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-[13px] ${state.ok ? "text-moss-700 dark:text-moss-100" : "text-seal-600"}`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="je-date" className="overline mb-1 block">
            Transaction date
          </label>
          <input id="je-date" name="date" type="date" className={INPUT} required />
          <p className="muted mt-1 text-xs">The day it happened, not the day it is entered.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="je-memo" className="overline mb-1 block">
            Memo
          </label>
          <input
            id="je-memo"
            name="memo"
            className={INPUT}
            placeholder="What this transaction is — a stranger should understand it in a year."
          />
          {state.fieldErrors?.memo ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.memo}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="je-ref" className="overline mb-1 block">
          Reference
        </label>
        <input
          id="je-ref"
          name="reference"
          className={INPUT}
          placeholder="Cheque number, invoice, deposit slip, or the record number this evidences."
        />
      </div>

      <fieldset className="surface rounded-sm border border-[var(--rule)] px-4 py-4">
        <legend className="overline px-1">Postings</legend>

        <div className="scroll-x">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rule-strong)]">
                <th className="overline pb-1.5 pr-2">Account</th>
                <th className="overline pb-1.5 pr-2">Fund</th>
                <th className="overline pb-1.5 pr-2">Debit</th>
                <th className="overline pb-1.5 pr-2">Credit</th>
                <th className="overline pb-1.5 pr-2">Line memo</th>
                <th className="pb-1.5" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key}>
                  <td className="py-1.5 pr-2 align-top">
                    <select
                      name="accountCode"
                      value={line.accountCode}
                      onChange={(event) => update(line.key, "accountCode", event.target.value)}
                      className={`${INPUT} min-w-[13rem]`}
                      aria-label="Account"
                    >
                      <option value="">— select —</option>
                      {accounts.map((account) => (
                        <option key={account.code} value={account.code}>
                          {account.code} · {account.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2 align-top">
                    <select
                      name="fundCode"
                      value={line.fundCode}
                      onChange={(event) => update(line.key, "fundCode", event.target.value)}
                      className={`${INPUT} min-w-[9rem]`}
                      aria-label="Fund"
                    >
                      <option value="">—</option>
                      {funds.map((fund) => (
                        <option key={fund.code} value={fund.code}>
                          {fund.code}
                          {fund.restriction !== "UNRESTRICTED" ? " (restricted)" : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2 align-top">
                    <input
                      name="debit"
                      value={line.debit}
                      onChange={(event) => update(line.key, "debit", event.target.value)}
                      className={`${INPUT} tabular w-28 text-right`}
                      placeholder="0.00"
                      inputMode="decimal"
                      aria-label="Debit"
                    />
                  </td>
                  <td className="py-1.5 pr-2 align-top">
                    <input
                      name="credit"
                      value={line.credit}
                      onChange={(event) => update(line.key, "credit", event.target.value)}
                      className={`${INPUT} tabular w-28 text-right`}
                      placeholder="0.00"
                      inputMode="decimal"
                      aria-label="Credit"
                    />
                  </td>
                  <td className="py-1.5 pr-2 align-top">
                    <input
                      name="lineMemo"
                      value={line.memo}
                      onChange={(event) => update(line.key, "memo", event.target.value)}
                      className={INPUT}
                      aria-label="Line memo"
                    />
                  </td>
                  <td className="py-1.5 align-top">
                    {lines.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => setLines((c) => c.filter((l) => l.key !== line.key))}
                        className="muted px-1 text-xs underline underline-offset-2"
                        aria-label="Remove line"
                      >
                        remove
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--rule-strong)]">
                <td className="py-2 pr-2" colSpan={2}>
                  <span className="overline">Totals</span>
                </td>
                <td className="tabular py-2 pr-2 text-right font-semibold">{money(totalDebits)}</td>
                <td className="tabular py-2 pr-2 text-right font-semibold">{money(totalCredits)}</td>
                <td className="py-2 pr-2 text-xs" colSpan={2}>
                  {!hasAmounts ? (
                    <span className="muted">Enter amounts</span>
                  ) : difference === 0 ? (
                    <span className="text-moss-700 dark:text-moss-100">Balanced</span>
                  ) : (
                    <span className="text-seal-600">
                      Out by {money(Math.abs(difference))} —{" "}
                      {difference > 0 ? "credits short" : "debits short"}
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={() => {
            setLines((current) => [...current, EMPTY(nextKey)]);
            setNextKey((k) => k + 1);
          }}
          className="mt-3 rounded-sm border border-[var(--rule-strong)] px-3 py-1 text-[13px]"
        >
          Add a line
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Submit balanced={balanced} />
        <Link
          href="/treasury"
          className="rounded-sm border border-[var(--rule-strong)] px-4 py-1.5 text-[13px]"
        >
          Cancel
        </Link>
        <p className="muted text-xs">
          A posted entry is never edited. Correcting one means posting its reversal, and both stay on
          the books.
        </p>
      </div>
    </form>
  );
}
