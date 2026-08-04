import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Panel, Field, EmptyState } from "@/components/ui";
import { BookForm } from "@/components/BookingForms";
import { calendar } from "@/lib/bookings";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Zome" };
export const dynamic = "force-dynamic";

const CELL: Record<string, string> = {
  FREE: "bg-[var(--surface-2)] text-[var(--ink-500)]",
  BOOKED: "bg-moss-100 text-moss-800 dark:bg-moss-900/40 dark:text-moss-200",
  BLOCKED: "bg-gilt-100 text-gilt-800 dark:bg-gilt-900/40 dark:text-gilt-200",
};

export default async function ZomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await getPrincipal();
  const manage = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";
  const { id } = await params;

  const zome = await prisma.zome.findUnique({
    where: { id },
    include: { bookings: { orderBy: { checkIn: "asc" } } },
  });
  if (!zome) notFound();

  const today = new Date();
  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    .toISOString()
    .slice(0, 10);
  const days = await calendar(zome.id, from, 60);

  const upcoming = zome.bookings.filter((b) => b.status === "CONFIRMED" && b.checkOut >= today);

  return (
    <>
      <PageHeader overline="Zome" title={zome.name} lede={zome.location ?? undefined} />

      <Panel title="The zome">
        <Field label="Nightly rate">{formatMoney(zome.nightlyCents)}</Field>
        <Field label="Cleaning fee">{formatMoney(zome.cleaningCents)}</Field>
        <Field label="Sleeps">{zome.sleeps}</Field>
        <Field label="Status">{zome.status}</Field>
        {zome.description ? <Field label="About">{zome.description}</Field> : null}
      </Panel>

      <Panel title="Next 60 nights">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {days.map((d) => (
            <div key={d.date} className={`rounded-sm px-1 py-1.5 ${CELL[d.state]}`} title={d.label ?? d.state}>
              <div className="tabular">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
        <p className="muted mt-3 text-xs">
          Green = booked · amber = blocked · plain = free. A checkout day and the next check-in day
          share a square and that is not a conflict — it is a turnover.
        </p>
      </Panel>

      <Panel title="Upcoming stays">
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing booked yet">The calendar is open.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="py-2 font-medium">Guest</th>
                <th className="py-2 font-medium">In</th>
                <th className="py-2 font-medium">Out</th>
                <th className="py-2 font-medium">Nights</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Channel</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((b) => (
                <tr key={b.id} className="border-b border-[var(--rule)]">
                  <td className="py-2">{b.guestName}</td>
                  <td className="py-2 tabular">{formatDate(b.checkIn)}</td>
                  <td className="py-2 tabular">{formatDate(b.checkOut)}</td>
                  <td className="py-2 tabular">{b.nights}</td>
                  <td className="py-2 tabular">{formatMoney(b.totalCents)}</td>
                  <td className="py-2">{b.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {manage && zome.status !== "RETIRED" ? (
        <Panel title="Take a booking">
          <BookForm zomeId={zome.id} />
        </Panel>
      ) : null}
    </>
  );
}
