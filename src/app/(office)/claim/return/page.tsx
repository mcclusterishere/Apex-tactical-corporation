import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/ui";

export const metadata: Metadata = { title: "Identity check submitted" };
export const dynamic = "force-dynamic";

/**
 * Where the verifier returns the claimant.
 *
 * This page deliberately reports NOTHING about the outcome. The claimant
 * arrives here by following a redirect, which anyone could do, so nothing on
 * this page may depend on the result — telling an arbitrary visitor whether a
 * given check passed would be a disclosure in itself. The authoritative result
 * arrives separately, over the signed webhook.
 */
export default function ClaimReturnPage() {
  return (
    <>
      <PageHeader
        overline="Public service"
        title="Thank you — your check has been submitted"
        lede="The verifier has taken your submission. The Office of the Registrar will receive the result directly."
      />

      <Panel title="What happens next">
        <div className="prose-doc text-sm">
          <p>
            The result comes to the Registrar from the verifier, not through this page, which is
            why nothing here tells you whether the check passed. That is deliberate: this address
            can be reached by anyone, and a page that announced results would announce them to
            whoever arrived.
          </p>
          <p>
            A verified claim is placed before an officer. If you gave an email address, the
            Registrar can reach you about it. If you did not, and you wish to follow it up, write
            to the Office of the Registrar.
          </p>
          <p>
            You may close this page. Nothing further is required of you.
          </p>
        </div>
      </Panel>
    </>
  );
}
