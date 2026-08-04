import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Panel, EmptyState, Stat } from "@/components/ui";
import { NewZomeForm } from "@/components/BookingForms";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Zomes & lettings" };
export const dynamic = "force-dynamic";

export default async function ZomesPage() {
  const principal = await getPrincipal();
  const manage = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";

  const zomes = await prisma.zome.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } }, select: { totalCents: true, nights: true } },
    },
  });

  const revenue = zomes.reduce((s, z) => s + z.bookings.reduce((a, b) => a + b.totalCents, 0), 0);
  const nights = zomes.reduce((s, z) => s + z.bookings.reduce((a, b) => a + b.nights, 0), 0);

  return (
    <>
      <PageHeader
        overline="The Kingdom's lands, at work"
        title="Zomes & lettings"
        lede="The structures on the Kingdom's land and what they earn. Every booking is a link in the same ledger as everything else — the calendar and the revenue are as tamper-evident as the rest of the register."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Zomes" value={String(zomes.length)} />
        <Stat label="Nights let" value={String(nights)} />
        <Stat label="Revenue booked" value={formatMoney(revenue)} />
      </div>

      <Panel title="The zomes">
        {zomes.length === 0 ? (
          <EmptyState title="No zomes yet">Create the first one below.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Where</th>
                <th className="py-2 font-medium">Nightly</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Earned</th>
              </tr>
            </thead>
            <tbody>
              {zomes.map((z) => (
                <tr key={z.id} className="border-b border-[var(--rule)]">
                  <td className="py-2"><Link href={`/zomes/${z.id}`} className="underline">{z.name}</Link></td>
                  <td className="py-2">{z.location ?? "—"}</td>
                  <td className="py-2 tabular">{formatMoney(z.nightlyCents)}</td>
                  <td className="py-2">{z.status}</td>
                  <td className="py-2 tabular">{formatMoney(z.bookings.reduce((a, b) => a + b.totalCents, 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {manage ? (
        <Panel title="Add a zome">
          <NewZomeForm />
        </Panel>
      ) : null}
    </>
  );
}
