import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { can } from "@/lib/authz";
import { PageHeader, Caution, Panel } from "@/components/ui";
import { JournalForm } from "@/components/JournalForm";
import { postJournalAction } from "@/app/actions/treasury";
import { DUAL_CONTROL_THRESHOLD_CENTS } from "@/lib/treasury";
import { StepUpPrompt } from "@/components/SecurityForms";
import { stepUpAction } from "@/app/actions/security";

export const metadata: Metadata = { title: "Post a journal entry" };
export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) redirect("/sign-in?next=%2Ftreasury%2Fnew");

  const mayKeep = can(principal.role, "registry:financial") || principal.role === "SOVEREIGN";
  if (!mayKeep) {
    return (
      <PageHeader
        overline="Treasury"
        title="Not within your commission"
        lede="The books are kept by the Treasurer and the Sovereign."
      />
    );
  }

  const [accounts, funds] = await Promise.all([
    prisma.account.findMany({ where: { active: true }, orderBy: { code: "asc" } }),
    prisma.fund.findMany({ where: { active: true }, orderBy: { code: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        overline="Treasury"
        title="Post a journal entry"
        lede="Every transaction touches at least two accounts and must balance. That constraint is what makes an error detectable."
      />

      {!principal.mfaSatisfied ? (
        <div className="mb-6">
          <Caution title="This session has not presented your second factor">
            You can read the books but not post to them. Confirm your authenticator from your
            account page.
          </Caution>
        </div>
      ) : null}

      {!principal.stepUpValid ? (
        <Panel
          title="Re-authenticate for larger entries"
          description={`Entries of ${(DUAL_CONTROL_THRESHOLD_CENTS / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} or more require your password again.`}
        >
          <StepUpPrompt action={stepUpAction} />
        </Panel>
      ) : null}

      <JournalForm
        action={postJournalAction}
        accounts={accounts.map((a) => ({ code: a.code, name: a.name, type: a.type }))}
        funds={funds.map((f) => ({ code: f.code, name: f.name, restriction: f.restriction }))}
      />
    </>
  );
}
