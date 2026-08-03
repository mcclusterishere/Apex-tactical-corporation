import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { canReadRecord } from "@/lib/access";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import { recordAudit } from "@/lib/audit";
import { publicUrl } from "@/lib/origin";
import { correspondenceShape, readField, dispatchMethod } from "@/lib/correspondence";
import { Seal } from "@/components/Seal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Letter" };
export const dynamic = "force-dynamic";

/**
 * A register entry rendered as a formal letter, ready to print and post.
 *
 * The point of this page is narrow and worth stating. An outside public office
 * triages incoming correspondence, and what moves a letter from the courtesy
 * pile to the action pile is not the strength of its claim — it is that it looks
 * like it came from an institution that will still be there in six months. A
 * fixed return address, a reference number, a named signatory holding a named
 * office, a subject line, a specific request, and a date by which a reply is
 * sought. That is the whole intervention, and it costs nothing.
 *
 * What this page will not render, in any circumstance, is anything wearing the
 * dress of process. There is no seal-of-state device, no case caption, no
 * "ORDERED", no return date compelling attendance, and no assertion that the
 * recipient is under the Kingdom's jurisdiction. Those are not stylistic choices:
 * a document that imitates process is an offence under 18 U.S.C. § 1521 and
 * Conn. Gen. Stat. §§ 53a-130 and 53a-137 et seq., and it forfeits every real
 * protection the Kingdom actually holds.
 */
export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) {
    redirect(`/sign-in?next=${encodeURIComponent(`/record/${id}/letter`)}`);
  }

  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) notFound();

  const registry = getRegistry(record.registry);
  if (!registry) notFound();
  if (!canReadRecord(principal, record, registry)) notFound();

  const shape = correspondenceShape(record.registry);
  if (!shape) {
    // Not a correspondence register. Rendering a deed as a letter would produce
    // a document that looks official and says nothing.
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="display text-xl">This entry is not correspondence</h1>
        <p className="muted mt-3 text-sm">
          Letters are produced from the registers that hold communications — Government-to-Government
          Contact, Notices and Proof of Service, Public Records Requests, and Public Safety Liaison.
          The {registry.title} is not one of them.
        </p>
      </div>
    );
  }

  await recordAudit(principal, "record.letter", record.recordNumber, "Letter rendered for dispatch");

  const data = parseJson<Record<string, unknown>>(record.data, {});
  const subject = readField(data, shape.subject) ?? record.title;
  const recipient = readField(data, shape.recipient);
  const recipientTitle = readField(data, shape.recipientTitle);
  const body = readField(data, shape.body);
  const address = readField(data, shape.address);
  const content = readField(data, shape.content);
  const signedBy = readField(data, shape.signedBy) ?? principal.displayName;
  const sentOn = readField(data, shape.sentOn);
  const responseDue = readField(data, shape.responseDue);
  const method = dispatchMethod(readField(data, shape.method) ?? undefined);

  const verifyAt = await publicUrl(`/verify/${record.recordNumber}`);
  const letterDate = sentOn ? formatDate(new Date(`${sentOn}T00:00:00Z`)) : formatDate(new Date());

  // A salutation that is wrong is worse than one that is generic. Only use a
  // name where one was actually recorded.
  const salutation = recipient
    ? `Dear ${recipientTitle ? `${recipientTitle} ${recipient.split(/\s+/).slice(-1)[0]}` : recipient}`
    : "To whom it may concern";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 border-b border-[var(--rule)] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="muted flex-1 text-sm">
            Print this, or save it as a PDF, on the Kingdom&rsquo;s letterhead. Everything below is
            drawn from the register entry — amend the entry, not the printout, so that what was sent
            and what is on file remain the same document.
          </p>
          <a
            href={`/record/${record.id}`}
            className="rounded-sm border border-[var(--rule-strong)] px-3 py-1.5 text-[13px]"
          >
            Back to record
          </a>
        </div>
        {!content ? (
          <p className="mt-3 text-[13px] text-seal-600">
            This entry has no body text recorded, so the letter below has nothing to say. Record the
            substance in the entry first.
          </p>
        ) : null}
        {method && method.weight <= 2 && responseDue ? (
          <p className="mt-3 text-[13px] text-seal-600">
            A reply date is recorded, but the dispatch method is {method.label.toLowerCase()}, which
            cannot prove the letter arrived. If the date matters, send by certified mail with return
            receipt or a courier signature service.
          </p>
        ) : null}
      </div>

      <article className="surface border border-[var(--rule-strong)] px-10 py-10 print:border-0 print:px-0 print:py-0">
        {/* Letterhead. Institutional, not governmental: a seal of the Kingdom's
            own device, its own name, and a return address. No state device. */}
        <header className="flex items-start gap-5 border-b border-[var(--rule-strong)] pb-5">
          <Seal size={68} />
          <div className="min-w-0 flex-1">
            <h1 className="display text-lg leading-tight tracking-tight">APEX KINGDOM</h1>
            <p className="overline mt-0.5">Office of the Registrar · Apex Tactical Corporation</p>
            <p className="muted mt-2 text-xs leading-relaxed">
              A religious society, cultural institution and charitable trust
              <br />
              Constituted by Charter of 29 May 2025, effective <em>nunc pro tunc</em> to 30 October 2010
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="overline">Our reference</p>
            <p className="tabular text-sm font-semibold">{record.recordNumber}</p>
          </div>
        </header>

        <p className="mt-6 text-sm">{letterDate}</p>

        <address className="mt-5 whitespace-pre-line text-sm not-italic leading-relaxed">
          {recipient ? <strong className="block">{recipient}</strong> : null}
          {recipientTitle ? <span className="block">{recipientTitle}</span> : null}
          {body ? <span className="block">{body}</span> : null}
          {address ?? ""}
        </address>

        <p className="mt-6 text-sm">
          <strong>Subject: {subject}</strong>
        </p>
        {responseDue ? (
          <p className="mt-1 text-sm">
            <strong>Reply requested by: {formatDate(new Date(`${responseDue}T00:00:00Z`))}</strong>
          </p>
        ) : null}

        <p className="mt-6 text-sm">{salutation},</p>

        <div className="mt-4 space-y-3 whitespace-pre-line text-sm leading-relaxed">
          {content ?? "[The substance of this communication has not yet been recorded.]"}
        </div>

        <div className="mt-8">
          <p className="text-sm">Yours faithfully,</p>
          <div className="mt-10 w-64 border-b border-[var(--rule-strong)]" />
          <p className="mt-1 text-sm font-semibold">{signedBy}</p>
          <p className="muted text-sm">
            {principal.officeTitle ?? "for the Office of the Registrar"}, Apex Kingdom
          </p>
        </div>

        {/*
          The verification footer is the unusual part, and it is the part that
          does the most work. Every other institution's letterhead asks to be
          believed. This one tells the recipient where to go and check, without
          the Kingdom's cooperation and without an account. Inviting verification
          is a far stronger position than asserting trust.
        */}
        <footer className="mt-10 border-t border-[var(--rule)] pt-4">
          <p className="muted text-xs leading-relaxed">
            This communication is recorded in the {registry.title} of Apex Kingdom under reference{" "}
            <span className="tabular">{record.recordNumber}</span>, on an append-only ledger. Its
            existence, date and contents may be confirmed independently at{" "}
            <span className="tabular break-all">{verifyAt}</span> — no account is required and the
            Kingdom&rsquo;s cooperation is not needed.
          </p>
          <p className="muted mt-2 text-xs leading-relaxed">
            Apex Kingdom is a private religious society and charitable trust. This letter is
            correspondence. It is not process of any court, it asserts no authority over any person
            or property outside the Kingdom&rsquo;s own membership and holdings, and it requires
            nothing of the recipient beyond the courtesy of a reply.
          </p>
        </footer>
      </article>
    </div>
  );
}
