import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";
import { Seal } from "@/components/Seal";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const principal = await getPrincipal();
  if (isAuthenticated(principal)) redirect("/");
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <Seal size={72} />
        </div>
        <h1 className="display mt-3 text-xl">Apex Kingdom</h1>
        <p className="overline mt-1">Office of the Registrar</p>
      </div>

      <div className="surface rounded-sm border border-[var(--rule-strong)] px-6 py-6">
        <h2 className="text-base">Sign in</h2>
        <p className="muted mt-1 text-sm">
          Accounts are issued to commissioned officers. Each officer signs in under their own name —
          a shared login destroys the audit trail that makes this register worth keeping.
        </p>
        <div className="mt-5">
          <SignInForm next={next} />
        </div>
      </div>

      <p className="muted mt-6 text-center text-sm">
        <Link href="/" className="underline underline-offset-2">
          Return to the public register
        </Link>
        {" · "}
        <Link href="/verify" className="underline underline-offset-2">
          Verify a certified copy
        </Link>
      </p>
    </main>
  );
}
