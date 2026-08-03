import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { visibleClassifications } from "@/lib/queries";
import { PageHeader, Panel, Caution, ButtonLink } from "@/components/ui";
import { Seal } from "@/components/Seal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "The Charter" };
export const dynamic = "force-dynamic";

const ARTICLES = [
  {
    numeral: "I",
    title: "Establishment and Nature of the Apex Kingdom",
    summary:
      "Constitutes the Kingdom as a single entity combining secular governance, ecclesiastical authority, and a charitable trust holding all assets for the benefit of its members.",
  },
  {
    numeral: "II",
    title: "Membership and Beneficiaries",
    summary:
      "Defines the community as members and affiliates of the Shiloh Baptist Church body together with those who freely unite with the Kingdom, makes every member a beneficiary of the trust, and guarantees free withdrawal without penalty.",
  },
  {
    numeral: "III",
    title: "Sovereignty and Jurisdiction",
    summary:
      "Asserts inherent sovereignty deriving from the Creator and the consent of the community, and claims jurisdiction over persons, lands, and subject matter to the broadest extent allowed by applicable law.",
  },
  {
    numeral: "IV",
    title: "Powers of the Apex Kingdom",
    summary:
      "Enumerates twelve powers: self-governance, legislation, administration, judiciary, law enforcement, contributions, economic and corporate powers, financial management, property and land, treaties and external relations, cultural and religious affairs, and general welfare.",
  },
  {
    numeral: "V",
    title: "Territory and Land Claims",
    summary:
      "Reserves rights to reclaim, restore, acquire, or govern lands with historical, spiritual, or cultural ties, holds aboriginal title claims in abeyance rather than waiving them, and declares current holdings to be territory of the Kingdom.",
  },
  {
    numeral: "VI",
    title: "External Relations and Non-Interference",
    summary:
      "Invokes RFRA, RLUIPA, 25 C.F.R. Part 83, and UNDRIP; asserts sovereign immunity and non-interference; affirms a distinct identity subordinate to no other tribal government or religious hierarchy; and permits voluntary comity and cooperation.",
  },
  {
    numeral: "VII",
    title: "Leadership and Succession",
    summary:
      "Vests supreme executive, legislative, judicial, ecclesiastical, appointive, and fiduciary authority in the Founder, Matthew McCluster, for life, with an exclusive right to designate a successor and a fallback council procedure if none is named.",
  },
  {
    numeral: "VIII",
    title: "Amendments and Interpretation",
    summary:
      "Reserves the amendment power to the Founder in writing, entrenches the sovereign status, nonprofit purpose, beneficial interest of members, and succession by designation, and directs liberal construction in favour of the Kingdom's rights and religious freedom.",
  },
  {
    numeral: "IX",
    title: "Adoption and Effective Date",
    summary:
      "Adopts the Charter, executed 29 May 2025 before a notary with a witness, and declares it effective nunc pro tunc to 30 October 2010 as the foundational date of the Kingdom.",
  },
];

export default async function CharterPage() {
  const principal = await getPrincipal();

  const instruments = await prisma.record.findMany({
    where: {
      registry: "instruments",
      classification: { in: visibleClassifications(principal) },
      voidedAt: null,
    },
    orderBy: { effectiveDate: "asc" },
    take: 25,
    select: {
      id: true,
      recordNumber: true,
      title: true,
      effectiveDate: true,
      status: true,
    },
  });

  return (
    <>
      <PageHeader
        overline="Founding instrument"
        title="The Charter of Apex Kingdom"
        lede="The supreme governing instrument of the Kingdom, executed 29 May 2025 before a notary of the State of Connecticut and declared effective retroactively to 30 October 2010."
        actions={<ButtonLink href="/registry/instruments">Register of Instruments</ButtonLink>}
      />

      <section className="surface mb-6 rounded-sm border border-[var(--rule-strong)] px-5 py-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Seal size={84} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base">Execution and attestation</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="overline">Founder</dt>
                <dd>Matthew McCluster</dd>
              </div>
              <div>
                <dt className="overline">Executed</dt>
                <dd>29 May 2025</dd>
              </div>
              <div>
                <dt className="overline">Witness</dt>
                <dd>Stephanie Arevalo</dd>
              </div>
              <div>
                <dt className="overline">Notary</dt>
                <dd>Joyiesha F. Smoak, State of Connecticut, I.D. SNPC 0185844</dd>
              </div>
              <div>
                <dt className="overline">Declared effective</dt>
                <dd>30 October 2010, nunc pro tunc</dd>
              </div>
              <div>
                <dt className="overline">Affiliated church body</dt>
                <dd>Shiloh Baptist Church and sister congregations</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mb-6">
        <Caution title="On the retroactive effective date">
          The Charter was signed in 2025 and declares itself effective as of 2010. That is an
          ordinary and defensible thing for a founding body to do — it states when the community
          considers itself to have begun. It becomes a problem only if the document is later
          presented as though it had been <em>written</em> in 2010. Record it, cite it, and describe
          it exactly as it is: an instrument executed on 29 May 2025 which declares the Kingdom&rsquo;s
          founding date to be 30 October 2010. An openly retroactive declaration survives scrutiny.
          A document implied to be contemporaneous does not survive the first cross-examination.
        </Caution>
      </div>

      <Panel
        title="The nine articles"
        description="Summaries only. The operative text is the executed instrument itself, which should be recorded in the Register of Instruments and attached in full."
      >
        <ol className="divide-y divide-[var(--rule)]">
          {ARTICLES.map((article) => (
            <li key={article.numeral} className="py-3">
              <h3 className="text-sm font-semibold">
                <span className="tabular muted mr-2">Art. {article.numeral}</span>
                {article.title}
              </h3>
              <p className="muted mt-1 text-sm">{article.summary}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        title="Instruments of record"
        description="Everything promulgated under the Charter's authority"
        actions={<ButtonLink href="/registry/instruments">Open the register</ButtonLink>}
      >
        {instruments.length === 0 ? (
          <p className="muted text-sm">
            No instruments have been recorded. The first entry should be the Charter itself, with
            the executed and notarised original attached — the register is not the instrument, and
            an instrument that exists only on paper in a drawer is one house fire from gone.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {instruments.map((instrument) => (
              <li key={instrument.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                <Link
                  href={`/record/${instrument.id}`}
                  className="tabular underline underline-offset-2"
                >
                  {instrument.recordNumber}
                </Link>
                <span className="min-w-0 flex-1">{instrument.title}</span>
                <span className="muted tabular text-xs">
                  {formatDate(instrument.effectiveDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Reading the Charter alongside the law" tone="caution">
        <p className="text-sm">
          Several provisions of the Charter assert legal positions that United States courts will
          not accept — most consequentially the claims of sovereign immunity from outside process
          (Art. VI §2), exemption from state and federal statutes by virtue of 26 U.S.C.
          § 508(c)(1)(A) (Art. I §2), and jurisdiction over persons who have not consented to it
          (Art. III). Those provisions govern the Kingdom&rsquo;s internal affairs perfectly well.
          Relied on against an outside party, they fail, and failing on them is expensive.
        </p>
        <p className="mt-2 text-sm">
          The legal posture memorandum sets out each assertion, what the law actually provides, and
          what to do instead to achieve the same end. It is the first thing any officer of this
          Kingdom should read.
        </p>
        <div className="mt-4">
          <ButtonLink href="/doctrine/01-LEGAL-POSTURE" tone="primary">
            Read the legal posture memorandum
          </ButtonLink>
        </div>
      </Panel>
    </>
  );
}
