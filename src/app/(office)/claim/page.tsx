import type { Metadata } from "next";
import { PageHeader, Panel, Caution } from "@/components/ui";
import { IdentityClaimForm } from "@/components/IdentityClaimForm";

export const metadata: Metadata = { title: "Claim your identity" };
export const dynamic = "force-dynamic";

export default function ClaimPage() {
  return (
    <>
      <PageHeader
        overline="Public service"
        title="Claim your identity"
        lede="Prove who you are to the Office of the Registrar. No account required. An identity check is not an application for membership and does not create one — it establishes that you are the person you say you are, so that the Registrar can deal with you about records that may concern you."
      />

      <Panel title="Begin">
        <IdentityClaimForm />
      </Panel>

      <Panel title="What happens to your documents">
        <div className="prose-doc text-sm">
          <p>
            The check itself is run by <strong>Didit</strong>, an independent identity
            verification service. You will leave this site, present your document and a photograph
            of your face to them, and return here afterwards.
          </p>
          <p>
            <strong>Apex Kingdom never receives your document.</strong> Not the image, not a scan,
            not your photograph, not any measurement of your face. Those stay with the verifier
            under their own retention policy.
          </p>
          <p>What this register keeps is deliberately small:</p>
          <ul>
            <li>the name you claimed, and the name on the document;</li>
            <li>the <em>type</em> of document and the country that issued it;</li>
            <li>a one-way cryptographic digest of the document number — enough for the
              Registrar to notice the same document being used twice, and useless to anyone who
              took it;</li>
            <li>your year of birth, not your date of birth;</li>
            <li>whether the verifier approved the check, and when.</li>
          </ul>
          <p>
            If you later ask the Registrar to forget you, those details can be erased. The
            register&rsquo;s ledger records only that a claim was made and how it was decided —
            it never held your name, so there is nothing about you left in it.
          </p>
        </div>
      </Panel>

      <Caution title="An identity check is not an admission">
        A successful check tells the Registrar that your document is genuine and that it is yours.
        It does not enrol you, confer citizenship or membership, and creates no rights against
        anyone. Every verified claim is placed before an officer, who decides what if anything
        follows. Nobody is admitted to the Kingdom by a machine.
      </Caution>
    </>
  );
}
