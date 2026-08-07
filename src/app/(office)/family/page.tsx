import Link from "next/link";
import type { Metadata } from "next";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Hero, ActionCard, Panel } from "@/components/ui";
import { IconStay, IconIdentity, IconLedger, IconCalendar } from "@/components/Icons";
import { Seal } from "@/components/Seal";
import { NIGHTS_PER_STAY, formatStays, balanceOf } from "@/lib/stays";

export const metadata: Metadata = { title: "The Family Plan" };
export const dynamic = "force-dynamic";

/**
 * The pitch IS the app. This page is what a family member opens on their
 * phone: what the network is, how Stays work, and the two buttons that matter
 * — earn and stay. Mobile-first: one column, big type, thumb-sized targets.
 */

const KEEPERS = [
  { name: "Carl McCluster", line: "Father" },
  { name: "Regina Brinkley", line: "Mother" },
  { name: "Mollye Fortt", line: "Grandmother" },
  { name: "Betty McCluster", line: "Grandmother" },
];

const STEPS = [
  {
    n: "1",
    title: "Work earns Stays",
    body: "Every family property posts tasks — mow it, fix it, pay its taxes, keep its books. Claim a task, do it, and a second family member confirms it. The reward lands as Stays.",
  },
  {
    n: "2",
    title: "Two nights make one Stay",
    body: "One Apex Stay is two nights: check in the afternoon, the whole day between, out by midday. Every property in the network measures in the same unit.",
  },
  {
    n: "3",
    title: "Gift them freely",
    body: "Send Stays to any family member — for a birthday, a hard month, a holiday week. What can't be done is selling them or cashing them out. They are hospitality, not money.",
  },
  {
    n: "4",
    title: "Stay by spending them",
    body: "Book any family place with your Stays. No Stays, no stay — the retreat belongs to the people who keep it, and every night is earned by somebody's work.",
  },
];

export default async function FamilyPage() {
  const principal = await getPrincipal();
  const signedIn = isAuthenticated(principal);

  const [balance, listedZomes] = await Promise.all([
    signedIn ? balanceOf(principal.id) : Promise.resolve(0),
    prisma.zome.findMany({ where: { status: "LISTED" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <Hero
        eyebrow="Apex Kingdom · The Family Network"
        seal={<Seal size={72} />}
        title="Our places, kept by our hands."
        lede={
          <>
            The family&rsquo;s properties — Weldon, Decatur, and what comes next — held together,
            worked together, and enjoyed together. Work earns <strong>Stays</strong>. Stays are
            nights. Nights are how the family uses what the family keeps.
          </>
        }
        actions={
          signedIn ? (
            <span className="surface-tint inline-flex items-center gap-2 rounded-lg border border-[var(--rule)] px-4 py-2 text-[15px]">
              <IconStay size="1.2em" />
              <span>
                Your balance: <strong>{formatStays(balance)}</strong>
              </span>
            </span>
          ) : (
            <Link
              href="/sign-in?next=%2Ffamily"
              className="inline-flex items-center rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-semibold text-[var(--page-raised)]"
            >
              Sign in to see your Stays
            </Link>
          )
        }
      />

      {/* The walkthrough — one column, readable on a phone in a hallway. */}
      <section aria-label="How it works" className="mb-8 space-y-3">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="surface flex gap-4 rounded-xl border border-[var(--rule)] p-4"
          >
            <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gilt-line)] text-[15px] font-semibold text-[var(--gilt-line)]">
              {step.n}
            </span>
            <div className="min-w-0">
              <h2 className="display text-[1.05rem] font-semibold leading-tight">{step.title}</h2>
              <p className="muted mt-1 text-[14px] leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* The two buttons that matter. */}
      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <ActionCard href="/stays" icon={<IconLedger />} title="Earn & gift" tone="gilt">
          The task board, your balance, and gifting Stays to family.
        </ActionCard>
        <ActionCard href="/zomes" icon={<IconCalendar />} title="Book a stay">
          {listedZomes.length > 0
            ? `${listedZomes.length} famil${listedZomes.length === 1 ? "y place" : "y places"} on the calendar.`
            : "The first family place lists soon — Weldon is coming."}
        </ActionCard>
      </section>

      <Panel
        title="The Keepers of the Stays"
        description="The elders who hold the ledger and confirm the work. Two-person rule: nobody credits their own labour."
      >
        <ul className="divide-y divide-[var(--rule)]">
          {KEEPERS.map((keeper) => (
            <li key={keeper.name} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="font-medium">{keeper.name}</span>
              <span className="muted text-sm">{keeper.line}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="The one rule" description="Written into the software, not just the family meeting.">
        <p className="text-[15px] leading-relaxed">
          <strong>No Stays, no stay.</strong> A night at a family place costs{" "}
          {NIGHTS_PER_STAY === 2 ? "half a Stay" : "Stays"} per night, and Stays only come from
          work confirmed by another member — or as a gift from someone who earned them. Nobody
          squats on what the family keeps alive; everybody who contributes always has a place to
          go. That&rsquo;s the whole covenant, and the booking system enforces it to the night.
        </p>
        <p className="muted mt-3 text-[13px] leading-relaxed">
          Stays have no dollar value, cannot be bought or cashed out, and never convert to the Apex
          Mark. See <Link href="/doctrine/24-APEX-STAYS" className="link">the doctrine</Link> for
          the rules in full.
        </p>
      </Panel>

      <div className="mb-4 mt-6 text-center">
        <Link href="/claim" className="link inline-flex items-center gap-1.5 text-[14px]">
          <IconIdentity size="1.1em" /> New here? Claim your identity to join the register.
        </Link>
      </div>
    </div>
  );
}
