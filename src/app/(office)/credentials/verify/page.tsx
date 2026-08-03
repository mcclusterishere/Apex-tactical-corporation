import type { Metadata } from "next";
import { checkCredential, CREDENTIAL_DISCLAIMER } from "@/lib/credentials";
import { PageHeader, Panel, Field, Caution, EmptyState } from "@/components/ui";
import { CredentialLookupForm } from "@/components/CredentialForms";
import { Seal } from "@/components/Seal";
import { formatDate, oneParam } from "@/lib/format";

export const metadata: Metadata = { title: "Check a credential" };
export const dynamic = "force-dynamic";

const STATUS_COPY: Record<string, { label: string; tone: "good" | "bad" | "warn"; detail: string }> = {
  VALID: { label: "Valid", tone: "good", detail: "This credential is in force." },
  EXPIRED: { label: "Expired", tone: "bad", detail: "It was validly issued but has passed its expiry date." },
  NOT_YET_EFFECTIVE: { label: "Not yet effective", tone: "warn", detail: "Issued, but its effective date has not arrived." },
  SUSPENDED: { label: "Suspended", tone: "bad", detail: "In force but suspended. Do not rely on it." },
  REVOKED: { label: "Revoked", tone: "bad", detail: "Withdrawn by the Kingdom. Do not rely on it." },
  REPLACED: { label: "Replaced", tone: "warn", detail: "Superseded by a later credential." },
  UNKNOWN: { label: "Not found", tone: "bad", detail: "No credential bears this code." },
};

export default async function VerifyCredentialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const code = oneParam((await searchParams).code);
  const trimmed = code?.trim();

  if (!trimmed) {
    return (
      <>
        <PageHeader
          overline="Public service"
          title="Check a credential"
          lede="Confirm whether a credential presented as issued by Apex Kingdom is genuine and still in force. No account required."
        />
        <Panel title="Enter the verification code">
          <CredentialLookupForm />
          <p className="muted mt-3 text-sm">
            The code is printed on the credential in the form{" "}
            <span className="tabular">XXXXX-XXXXX</span>.
          </p>
        </Panel>
        <Panel title="What this check does and does not tell you">
          <div className="prose-doc text-sm">
            <p>
              It confirms that the Kingdom issued a credential bearing this code, to the person
              named, with the standing shown, and whether it remains in force. Where the credential
              was signed, it also confirms the signature is genuine — so an altered or fabricated
              card fails here even if it looks convincing.
            </p>
            <p>
              <strong>It does not make the credential identification.</strong> {CREDENTIAL_DISCLAIMER}
            </p>
          </div>
        </Panel>
      </>
    );
  }

  const result = await checkCredential(trimmed);
  const copy = STATUS_COPY[result.status] ?? STATUS_COPY.UNKNOWN;

  if (!result.found) {
    return (
      <>
        <PageHeader overline="Credential check" title="Not found" />
        <Panel tone="seal">
          <EmptyState title={`No credential bears the code ${trimmed.toUpperCase()}`}>
            A card presenting this code was not issued by the Office of the Registrar, or the code
            has been transcribed incorrectly. Codes take the form{" "}
            <span className="tabular">XXXXX-XXXXX</span> and never contain the letters I, L, O, or U.
          </EmptyState>
          <div className="mt-4">
            <CredentialLookupForm />
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Credential check"
        title={copy.label}
        lede={copy.detail}
      />

      <section className="surface mb-6 rounded-sm border border-[var(--rule-strong)] px-5 py-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Seal size={76} />
          <div className="min-w-0 flex-1">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Credential number">
                <span className="tabular">{result.credentialNumber}</span>
              </Field>
              <Field label="Type">{result.typeLabel}</Field>
              <Field label="Holder">{result.subjectName}</Field>
              <Field label="Standing">{result.standing ?? <span className="muted">—</span>}</Field>
              <Field label="Issued">{formatDate(result.issuedAt)}</Field>
              <Field label="Expires">
                {result.expiresAt ? formatDate(result.expiresAt) : <span className="muted">no expiry</span>}
              </Field>
            </dl>
          </div>
        </div>
      </section>

      {result.status === "REVOKED" && result.revokedReason ? (
        <div className="mb-6">
          <Caution title="This credential has been revoked">{result.revokedReason}</Caution>
        </div>
      ) : null}

      <Panel title="Cryptographic check">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Record integrity">
            {result.payloadIntact ? (
              <span className="text-moss-700 dark:text-moss-100">
                Intact — the stored credential matches its own digest.
              </span>
            ) : (
              <span className="text-seal-600">
                FAILED — the stored record does not match its digest. Report this to the Registrar.
              </span>
            )}
          </Field>
          <Field label="Signature">
            {!result.signaturePresent ? (
              <span className="muted">
                Unsigned. The Kingdom&rsquo;s record is authentic, but this credential carries no
                cryptographic signature.
              </span>
            ) : result.signatureValid ? (
              <span className="text-moss-700 dark:text-moss-100">
                Valid — signed by {result.signerName}.
              </span>
            ) : (
              <span className="text-seal-600">
                INVALID — the signature does not verify. Do not rely on this credential.
              </span>
            )}
          </Field>
        </dl>
      </Panel>

      <Panel title="The limits of this credential" tone="caution">
        <p className="text-sm">{CREDENTIAL_DISCLAIMER}</p>
      </Panel>

      <Panel title="Check another">
        <CredentialLookupForm />
      </Panel>
    </>
  );
}
