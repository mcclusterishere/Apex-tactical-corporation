import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { packetReadiness } from "@/lib/correspondence";
import { publicUrl } from "@/lib/origin";
import { getRegistry } from "@/registries";
import { PageHeader, Panel, Stat, ButtonLink, Caution } from "@/components/ui";
import { oneParam } from "@/lib/format";

export const metadata: Metadata = { title: "The standing packet" };
export const dynamic = "force-dynamic";

const VARIANTS = [
  {
    key: "POLICE",
    label: "Police department",
    lede: "Sent when designating a liaison, reporting an incident, or requesting a security assessment. The officer reading it wants to know who to call back and whether there is a real place with real people at it.",
  },
  {
    key: "LAND_USE",
    label: "Municipal land use",
    lede: "Sent to a zoning or planning authority. The reader is, or will consult, the town attorney — who is weighing whether a decision against you is defensible under RLUIPA. Give them the documents that make that calculation concrete.",
  },
  {
    key: "LEGISLATOR",
    label: "Legislator's office",
    lede: "Sent to a state or federal legislator. The aide reading it is deciding whether this is casework for constituents. Keep it short: who you are, how many constituents, what you are asking for.",
  },
  {
    key: "AGENCY",
    label: "State or federal agency",
    lede: "Sent to an agency in a programme or regulatory context. The reader is applying published criteria and needs the documents those criteria name.",
  },
  {
    key: "GRANTMAKER",
    label: "Grantmaker or foundation",
    lede: "Sent with an application. This reader will not proceed without documented tax status and governance, however sympathetic they are.",
  },
] as const;

/**
 * The packet the Kingdom sends on first contact.
 *
 * On first contact an outside body decides one question, and it decides it in
 * about forty seconds from whatever is in front of it: is this a real
 * institution, or a private person with a theory. Everything afterwards follows
 * from that judgement — whether the letter is answered, whether the meeting
 * happens, whether the town attorney treats a RLUIPA reference as a risk or as
 * noise.
 *
 * The packet is the intervention at exactly that moment. It is also the
 * cheapest thing in this entire system: a certificate of incorporation, a
 * registered agent, a certificate of insurance and a named attorney cost a few
 * hundred dollars between them and change every subsequent interaction. Nothing
 * else here has that ratio.
 *
 * This page reports honestly what the Kingdom can actually produce today, from
 * the registers, rather than from a checklist somebody ticked.
 */
export default async function StandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Fstanding");

  const requested = oneParam((await searchParams).for)?.toUpperCase();
  const variant = VARIANTS.find((candidate) => candidate.key === requested) ?? null;

  const readiness = await packetReadiness();
  const scoped = variant
    ? readiness.filter((entry) =>
        (entry.item.variants as readonly string[]).includes(variant.key),
      )
    : readiness;

  const essential = scoped.filter((entry) => entry.item.essential);
  const essentialHeld = essential.filter((entry) => entry.held || !entry.item.registry).length;
  const documented = scoped.filter((entry) => entry.held).length;
  const trackable = scoped.filter((entry) => entry.item.registry).length;

  const verifyAt = await publicUrl("/verify");

  return (
    <>
      <PageHeader
        overline="External affairs"
        title="The standing packet"
        lede="What goes to an outside body on first contact, what each item proves, and what the Kingdom can actually produce today."
        actions={<ButtonLink href="/dispatch">Dispatch and delivery</ButtonLink>}
      />

      <div className="mb-6">
        <Caution title="The forty-second judgement">
          A recipient decides whether this is an institution or an individual with a theory long
          before they read the argument. They decide it from the documents. An incorporation
          certificate, a registered agent, a certificate of insurance, and a named attorney cost a
          few hundred dollars between them and change every interaction that follows — which is a
          better return than anything else in this system. Assertions of status, by contrast, cost
          nothing and are worth exactly that.
        </Caution>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Documented"
          value={`${documented} / ${trackable}`}
          detail="Items with a live record behind them"
          tone={documented === trackable ? "success" : documented === 0 ? "danger" : "warning"}
        />
        <Stat
          label="Essential items"
          value={`${essentialHeld} / ${essential.length}`}
          detail="Without these the packet does not do its job"
          tone={essentialHeld === essential.length ? "success" : "warning"}
        />
        <Stat
          label="Packet"
          value={variant ? variant.label : "Full"}
          detail={variant ? `${scoped.length} items for this recipient` : "Every item, all recipients"}
        />
      </div>

      <Panel title="Assemble for a particular recipient">
        <p className="muted mb-3 text-sm">
          Sending everything to everyone reads as unfocused, which is the opposite of the impression
          the packet exists to create. Pick the recipient and send that subset.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/standing"
            className={`rounded-sm border px-3 py-1.5 text-[13px] ${
              variant ? "border-[var(--rule-strong)]" : "border-ink-800 bg-ink-800 text-ink-50 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
            }`}
          >
            Full packet
          </Link>
          {VARIANTS.map((candidate) => (
            <Link
              key={candidate.key}
              href={`/standing?for=${candidate.key}`}
              className={`rounded-sm border px-3 py-1.5 text-[13px] ${
                variant?.key === candidate.key
                  ? "border-ink-800 bg-ink-800 text-ink-50 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
                  : "border-[var(--rule-strong)]"
              }`}
            >
              {candidate.label}
            </Link>
          ))}
        </div>
        {variant ? <p className="mt-4 text-sm leading-relaxed">{variant.lede}</p> : null}
      </Panel>

      <Panel
        title={variant ? `Contents — ${variant.label}` : "Contents of the full packet"}
        description="In the order they should be assembled"
      >
        <ol className="space-y-4">
          {scoped.map((entry, index) => {
            const registry = entry.item.registry ? getRegistry(entry.item.registry) : undefined;
            return (
              <li
                key={entry.item.key}
                className="border-l-[3px] pl-4"
                style={{
                  borderColor: entry.held
                    ? "var(--moss-600, #4a6741)"
                    : entry.item.essential
                      ? "var(--seal-600, #8b2635)"
                      : "var(--rule)",
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    <span className="tabular muted mr-2">{index + 1}.</span>
                    {entry.item.label}
                  </p>
                  <span className="shrink-0 text-xs">
                    {entry.item.registry ? (
                      entry.held ? (
                        <span className="text-moss-700 dark:text-moss-100">
                          {entry.recordCount} on file
                        </span>
                      ) : (
                        <span className="text-seal-600">
                          {entry.item.essential ? "Missing — essential" : "Not yet on file"}
                        </span>
                      )
                    ) : (
                      <span className="muted">Produced, not filed</span>
                    )}
                  </span>
                </div>
                <p className="muted mt-1 text-xs leading-relaxed">
                  <strong>Proves:</strong> {entry.item.proves}
                </p>
                <p className="muted mt-1 text-xs leading-relaxed">
                  <strong>If absent:</strong> {entry.item.ifAbsent}
                </p>
                {registry ? (
                  <p className="mt-1 text-xs">
                    <Link
                      href={`/registry/${registry.slug}`}
                      className="underline underline-offset-2"
                    >
                      {registry.title}
                    </Link>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="What deliberately does not go in">
        <div className="prose-doc text-sm">
          <p>
            <strong>Membership lists and personal data.</strong> Not because they are secret, but
            because supplying them invites scrutiny of individuals who did not ask for it, and
            because the Kingdom then holds a disclosure it cannot retract. Give numbers, never names.
          </p>
          <p>
            <strong>Financial detail beyond what was asked for.</strong> Volunteering accounts to a
            body that did not request them creates an expectation that they will be volunteered
            again, and to whoever asks next.
          </p>
          <p>
            <strong>Internal governance disputes, and anything sealed.</strong> A packet is an
            introduction, not a disclosure exercise.
          </p>
          <p>
            <strong>Any claim of status the Kingdom cannot document on request.</strong> This is the
            one that actually does damage. An overstated claim is rarely caught at the moment it is
            made — it is caught months later by somebody who was inclined to help, and what is lost
            is that person, permanently.
          </p>
        </div>
      </Panel>

      <Panel title="The item nobody else has">
        <p className="text-sm leading-relaxed">
          Every institution&rsquo;s packet asks to be believed. This one can tell the recipient
          where to go and check, without the Kingdom&rsquo;s cooperation and without an account:{" "}
          <span className="tabular break-all">{verifyAt}</span>. Each certified extract carries its
          own digest and its position in an append-only ledger, and a recipient can confirm both
          with a script the Kingdom hands them and does not control.
        </p>
        <p className="muted mt-3 text-sm leading-relaxed">
          That inverts the usual posture. Rather than asserting that the records are honest, it
          invites the recipient to test it — which is a far stronger position, and is available
          precisely because the register was built to be checkable by people who have no reason to
          trust its keeper.
        </p>
      </Panel>
    </>
  );
}
