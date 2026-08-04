import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Panel, EmptyState, Stat } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const principal = await getPrincipal();
  if (!(can(principal.role, "registry:financial") || principal.role === "SOVEREIGN")) {
    return (
      <>
        <PageHeader overline="Lettings" title="Bookings" />
        <EmptyState title="Not available to you">Managing lettings is a financial power.</EmptyState>
      </>
    );
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { checkIn: "desc" },
    take: 300,
    include: { zome: { select: { name: true, id: true } } },
  });

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const revenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((a, b) => a + b.totalCents, 0);

  return (
    <>
      <PageHeader overline="Lettings" title="Bookings" lede="Every stay across every zome." />
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total bookings" value={String(bookings.length)} />
        <Stat label="Live (confirmed)" value={String(confirmed.length)} />
        <Stat label="Revenue" value={formatMoney(revenue)} />
      </div>
      <Panel title="All bookings">
        {bookings.length === 0 ? (
          <EmptyState title="No bookings yet">Take one from any listed zome.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="py-2 font-medium">Guest</th>
                <th className="py-2 font-medium">Zome</th>
                <th className="py-2 font-medium">In</th>
                <th className="py-2 font-medium">Out</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-[var(--rule)]">
                  <td className="py-2">{b.guestName}</td>
                  <td className="py-2"><Link href={`/zomes/${b.zome.id}`} className="underline">{b.zome.name}</Link></td>
                  <td className="py-2 tabular">{formatDate(b.checkIn)}</td>
                  <td className="py-2 tabular">{formatDate(b.checkOut)}</td>
                  <td className="py-2 tabular">{formatMoney(b.totalCents)}</td>
                  <td className="py-2">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
