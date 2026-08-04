import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPrincipal } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Panel, Field, EmptyState, Caution } from "@/components/ui";
import { IdentityReviewForm } from "@/components/IdentityReviewForm";
import { formatDate } from "@/lib/format";
import { isApproved } from "@/lib/identity";

export const metadata: Metadata = { title: "Identity claim" };
export const dynamic = "force-dynamic";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const principal = await getPrincipal();
  if (!can(principal.role, "record:amend")) {
    return (
      <>
        <PageHeader overline="Office" title="Identity claim" />
        <EmptyState title="Not available to you">
          You do not hold the power to see identity claims.
        </EmptyState>
      </>
    );
  }

  const { id } = await params;
  const claim = await prisma.identityClaim.findUnique({
    where: { id },
    include: {
      reviewedBy: { select: { displayName: true } },
      citizenRecord: { select: { recordNumber: true, title: true } },
    },
  });
  if (!claim) notFound();

  const approved = isApproved(claim.status);
  const verifiedName = `${claim.verifiedGivenName ?? ""} ${claim.verifiedFamilyName ?? ""}`.trim();

  return (
    <>
      <PageHeader
        overline="Identity claim"
        title={claim.claimedName}
        lede={`Opened ${formatDate(claim.createdAt)}. Verifier status: ${claim.status}.`}
      />

      <Panel title="What the claimant said">
        <Field label="Name claimed">{claim.claimedName}</Field>
        <Field label="Email">{claim.claimedEmail ?? "—"}</Field>
        <Field label="Who they say they are">{claim.claimedBasis ?? "—"}</Field>
      </Panel>

      <Panel title="What the verifier found">
        <Field label="Status">{claim.status}</Field>
        <Field label="Name on the document">{verifiedName || "—"}</Field>
        <Field label="Document">
          {claim.documentType
            ? `${claim.documentType}${claim.documentCountry ? ` · ${claim.documentCountry}` : ""}`
            : "—"}
        </Field>
        <Field label="Year of birth">{claim.birthYear ?? "—"}</Field>
        <Field label="Verified at">{claim.verifiedAt ? formatDate(claim.verifiedAt) : "—"}</Field>
        <Field label="Document digest">
          <span className="tabular break-all text-xs">{claim.documentDigest ?? "—"}</span>
        </Field>
        <p className="muted mt-3 text-xs">
          The digest is a one-way hash of the document number. It exists so the same document
          cannot be used to claim two identities without the Registrar noticing. It cannot be
          turned back into a number, and no image of the document was ever received.
        </p>
      </Panel>

      {verifiedName && verifiedName.toLowerCase() !== claim.claimedName.trim().toLowerCase() ? (
        <Caution title="The claimed name and the document name differ">
          The person claimed <strong>{claim.claimedName}</strong> but the document reads{" "}
          <strong>{verifiedName}</strong>. That is often innocent — a married name, a middle name,
          a shortened form — but it is a difference, and it should be understood before the claim
          is accepted rather than after.
        </Caution>
      ) : null}

      {claim.reviewState === "PENDING" ? (
        <Panel title="Decide">
          <IdentityReviewForm claimId={claim.id} canAccept={approved} />
        </Panel>
      ) : (
        <Panel title="Decision">
          <Field label="Outcome">{claim.reviewState}</Field>
          <Field label="By">{claim.reviewedBy?.displayName ?? "—"}</Field>
          <Field label="When">{claim.reviewedAt ? formatDate(claim.reviewedAt) : "—"}</Field>
          <Field label="Note">{claim.reviewNote ?? "—"}</Field>
          <Field label="Attached to">
            {claim.citizenRecord
              ? `${claim.citizenRecord.recordNumber} — ${claim.citizenRecord.title}`
              : "—"}
          </Field>
        </Panel>
      )}
    </>
  );
}
