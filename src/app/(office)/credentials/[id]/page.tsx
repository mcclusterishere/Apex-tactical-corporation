import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { recordAudit } from "@/lib/audit";
import {
  CREDENTIAL_TYPE_LABELS,
  CREDENTIAL_DISCLAIMER,
  type CredentialType,
} from "@/lib/credentials";
import { publicUrl } from "@/lib/origin";
import { Seal } from "@/components/Seal";
import { Panel, Field, Caution, ButtonLink } from "@/components/ui";
import { formatDate, formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Credential" };
export const dynamic = "force-dynamic";

/**
 * The credential as it is handed over.
 *
 * Two constraints shaped every choice on this page.
 *
 * The first is legal. This must not read as state identification. It carries no
 * photograph frame styled like a licence, no bearer height or eye colour, no
 * seal-of-state imitation, and it states in its own text what it is not. See
 * Conn. Gen. Stat. § 53a-130a and 18 U.S.C. § 1028. A credential that a
 * reasonable person could mistake for a government document is not a stronger
 * credential — it is an offence, and it converts the holder into a defendant.
 *
 * The second is evidentiary. The card is worth nothing on its own; its value is
 * that a stranger can check it. So the verification address and code are given
 * the same visual weight as the holder's name, and the text tells the reader
 * plainly to use them rather than to trust the paper.
 */
export default async function CredentialCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) notFound();

  const credential = await prisma.credential.findUnique({
    where: { id },
    include: { signingKey: true },
  });
  if (!credential) notFound();

  // A credential names a person. Reading one is reading member data, so it is
  // limited to the offices that issue or examine credentials rather than to
  // anyone who happens to be signed in. `record:certify` is the same permission
  // that gates issuance; `audit:read` lets the Auditor examine without issuing.
  const mayRead =
    can(principal.role, "record:certify") ||
    can(principal.role, "audit:read") ||
    principal.role === "SOVEREIGN";
  if (!mayRead) notFound();

  await recordAudit(principal, "credential.view", credential.credentialNumber);

  const typeLabel =
    CREDENTIAL_TYPE_LABELS[credential.type as CredentialType] ?? credential.type;
  const verifyAt = await publicUrl(`/credentials/verify/${credential.verificationCode}`);

  const now = new Date();
  const expired = credential.expiresAt !== null && credential.expiresAt < now;
  const notYet = credential.effectiveFrom !== null && credential.effectiveFrom > now;
  const inForce = credential.status === "ACTIVE" && !expired && !notYet;

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="overline">Credential</p>
          <h1 className="text-2xl font-semibold tracking-tight">{credential.credentialNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/credentials">Back to credentials</ButtonLink>
          <ButtonLink href={verifyAt}>Check it as a stranger would</ButtonLink>
        </div>
      </div>

      {!inForce ? (
        <div className="no-print mb-6">
          <Caution title="This credential is not in force">
            {credential.status === "REVOKED"
              ? `Revoked ${credential.revokedAt ? formatDate(credential.revokedAt) : ""}. ${credential.revokedReason ?? ""}`
              : credential.status === "SUSPENDED"
                ? "Suspended. It must not be relied on until the suspension is lifted."
                : expired
                  ? `Expired ${formatDate(credential.expiresAt!)}.`
                  : notYet
                    ? `Not effective until ${formatDate(credential.effectiveFrom!)}.`
                    : `Status: ${credential.status}.`}{" "}
            Printing it in this state would put a card in circulation that the public check
            correctly rejects.
          </Caution>
        </div>
      ) : null}

      {/* The card itself. Sized near ISO/IEC 7810 ID-1 so it prints and cuts. */}
      <section className="avoid-break surface mx-auto max-w-[560px] rounded-sm border-2 border-[var(--rule-strong)] px-6 py-6">
        <header className="flex items-start gap-4 border-b border-[var(--rule)] pb-4">
          <Seal size={64} />
          <div className="min-w-0">
            <p className="overline">Apex Kingdom &middot; Office of the Registrar</p>
            <h2 className="text-lg font-semibold leading-tight tracking-tight">{typeLabel}</h2>
            <p className="tabular muted text-xs">{credential.credentialNumber}</p>
          </div>
        </header>

        <dl className="grid gap-4 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="overline mb-1">Holder</dt>
            <dd className="text-xl font-semibold leading-tight">{credential.subjectName}</dd>
          </div>
          {credential.standing ? (
            <div className="sm:col-span-2">
              <dt className="overline mb-1">Standing</dt>
              <dd className="text-sm">{credential.standing}</dd>
            </div>
          ) : null}
          <Field label="Issued">{formatDate(credential.issuedAt)}</Field>
          <Field label="Expires">
            {credential.expiresAt ? (
              formatDate(credential.expiresAt)
            ) : (
              <span className="muted">no expiry</span>
            )}
          </Field>
        </dl>

        <div className="rounded-sm border border-[var(--rule)] px-4 py-3">
          <p className="overline mb-1">Verify this credential</p>
          <p className="tabular break-all text-sm">{verifyAt}</p>
          <p className="tabular mt-1 text-lg tracking-widest">{credential.verificationCode}</p>
          <p className="muted mt-2 text-xs leading-relaxed">
            {credential.signature
              ? "This credential is cryptographically signed. The page above confirms the signature, so an altered or fabricated card fails there even where it looks convincing. Do not rely on the appearance of this card — check it."
              : "This credential is unsigned. The page above confirms the Kingdom's record of it. Do not rely on the appearance of this card — check it."}
          </p>
        </div>

        <footer className="mt-4 border-t border-[var(--rule)] pt-3">
          <p className="text-[11px] leading-relaxed">
            <strong>This is not identification.</strong> {CREDENTIAL_DISCLAIMER}
          </p>
        </footer>
      </section>

      <div className="no-print mt-8">
        <Panel title="What was signed">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Payload digest">
              <span className="digest break-all">{credential.payloadHash}</span>
            </Field>
            <Field label="Signature">
              {credential.signature ? (
                <span className="digest break-all">{credential.signature}</span>
              ) : (
                <span className="muted">
                  Unsigned. The issuing officer held no signing key, or did not supply their
                  passphrase.
                </span>
              )}
            </Field>
            <Field label="Signing key">
              {credential.signingKey ? (
                <>
                  <span className="digest break-all block">{credential.signingKey.fingerprint}</span>
                  <span className="muted text-xs">
                    {credential.signingKey.label ?? "unlabelled"}
                    {credential.signingKey.revokedAt
                      ? ` — revoked ${formatDate(credential.signingKey.revokedAt)}`
                      : ""}
                  </span>
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </Field>
            <Field label="Issued by">{credential.issuedBy}</Field>
          </dl>
          <p className="muted mt-4 text-xs leading-relaxed">
            The payload is the canonical form of everything the credential asserts. The signature is
            over that payload, so changing any assertion — the name, the standing, the expiry —
            breaks it. Recorded {formatTimestamp(credential.createdAt)}.
          </p>
        </Panel>
      </div>
    </>
  );
}
