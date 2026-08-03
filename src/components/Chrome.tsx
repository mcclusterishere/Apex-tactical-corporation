import Link from "next/link";
import type { ReactNode } from "react";
import { groupedRegistries } from "@/registries";
import { REGISTRY_GROUP_LABELS } from "@/registries/types";
import { canView } from "@/lib/classification";
import { can } from "@/lib/authz";
import { ROLE_LABELS, asRole } from "@/lib/authz";
import type { Principal } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";
import { Seal } from "@/components/Seal";

/**
 * The application shell.
 *
 * Navigation is filtered by clearance rather than merely hidden: a register the
 * principal cannot read is not listed, because an officer who can see that a
 * "Sealed Discipline" register exists has already learned something.
 */

function NavLink({
  href,
  children,
  muted,
}: {
  href: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-sm px-2 py-1 text-[13px] transition-colors hover:bg-ink-100 dark:hover:bg-ink-800 ${
        muted ? "muted" : ""
      }`}
    >
      {children}
    </Link>
  );
}

function Nav({ principal }: { principal: Principal }) {
  const groups = groupedRegistries()
    .map((entry) => ({
      ...entry,
      registries: entry.registries.filter(
        (registry) =>
          // Listed when the default classification is within reach, or when the
          // principal's office is named as a keeper of that register.
          canView(principal.clearance, registry.defaultClassification) ||
          asRole(principal.role) === "SOVEREIGN" ||
          registry.restrictedTo?.includes(asRole(principal.role)),
      ),
    }))
    .filter((entry) => entry.registries.length > 0);

  return (
    <nav className="space-y-5">
      <div>
        <p className="overline mb-1.5 px-2">Office</p>
        <NavLink href="/">Registrar&rsquo;s desk</NavLink>
        <NavLink href="/chain">The ledger chain</NavLink>
        <NavLink href="/log">Transparency log</NavLink>
        <NavLink href="/calendar">Deadlines</NavLink>
        <NavLink href="/gazette">Official gazette</NavLink>
        <NavLink href="/search">Search the registers</NavLink>
        {isAuthenticated(principal) ? <NavLink href="/account">Your account</NavLink> : null}
      </div>

      {groups.map((entry) => (
        <div key={entry.group}>
          <p className="overline mb-1.5 px-2">{REGISTRY_GROUP_LABELS[entry.group]}</p>
          {entry.registries.map((registry) => (
            <NavLink key={registry.slug} href={`/registry/${registry.slug}`}>
              {registry.shortTitle}
            </NavLink>
          ))}
        </div>
      ))}

      {isAuthenticated(principal) ? (
        <div>
          <p className="overline mb-1.5 px-2">Treasury &amp; Identity</p>
          {can(principal.role, "registry:financial") ||
          principal.role === "SOVEREIGN" ||
          can(principal.role, "audit:read") ? (
            <>
              <NavLink href="/treasury">The Treasury</NavLink>
              <NavLink href="/treasury/journal">Journal</NavLink>
              <NavLink href="/treasury/accounts">Chart of accounts</NavLink>
            </>
          ) : null}
          <NavLink href="/credentials">Credentials</NavLink>
          <NavLink href="/approvals">Dual control</NavLink>
        </div>
      ) : null}

      {isAuthenticated(principal) ? (
        <div>
          <p className="overline mb-1.5 px-2">External Affairs</p>
          <NavLink href="/dispatch">Dispatch &amp; delivery</NavLink>
          <NavLink href="/standing">The standing packet</NavLink>
        </div>
      ) : null}

      <div>
        <p className="overline mb-1.5 px-2">Reference</p>
        <NavLink href="/doctrine">Manuals &amp; doctrine</NavLink>
        <NavLink href="/doctrine/templates">Instrument templates</NavLink>
        <NavLink href="/charter">The Charter</NavLink>
        <NavLink href="/verify">Verify a certificate</NavLink>
        <NavLink href="/credentials/verify">Check a credential</NavLink>
      </div>

      {can(principal.role, "audit:read") || can(principal.role, "user:manage") ? (
        <div>
          <p className="overline mb-1.5 px-2">Administration</p>
          {can(principal.role, "audit:read") ? (
            <NavLink href="/audit">Audit log</NavLink>
          ) : null}
          {can(principal.role, "user:manage") ? (
            <NavLink href="/principals">Principals &amp; offices</NavLink>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}

export function Chrome({
  principal,
  children,
}: {
  principal: Principal;
  children: ReactNode;
}) {
  const signedIn = isAuthenticated(principal);

  return (
    <div className="min-h-screen">
      <header className="no-print surface border-b border-[var(--rule-strong)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Seal size={34} />
            <span className="min-w-0">
              <span className="display block truncate text-[15px] font-bold leading-tight">
                Apex Kingdom
              </span>
              <span className="muted block truncate text-[11px] leading-tight">
                Office of the Registrar &middot; Apex Tactical Corporation
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3 text-[13px]">
            {signedIn ? (
              <>
                <Link href="/account" className="hidden text-right sm:block">
                  <span className="block leading-tight underline-offset-2 hover:underline">
                    {principal.displayName}
                  </span>
                  <span className="muted block text-[11px] leading-tight">
                    {principal.mustResetPw ? (
                      <span className="text-seal-600">Change your password</span>
                    ) : (
                      (principal.officeTitle ?? ROLE_LABELS[asRole(principal.role)])
                    )}
                  </span>
                </Link>
                <form action="/api/sign-out" method="post">
                  <button
                    type="submit"
                    className="rounded-sm border border-[var(--rule-strong)] px-2.5 py-1 text-[13px] transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <span className="muted hidden sm:inline">Viewing the public register</span>
                <Link
                  href="/sign-in"
                  className="rounded-sm border border-[var(--rule-strong)] px-2.5 py-1 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
        {/* Collapsed into a disclosure on small screens so the shell needs no client JS. */}
        <aside className="no-print lg:w-56 lg:shrink-0">
          <details className="lg:hidden" name="nav">
            <summary className="surface cursor-pointer list-none rounded-sm border border-[var(--rule-strong)] px-3 py-2 text-[13px] font-medium">
              Registers &amp; sections
            </summary>
            <div className="mt-3">
              <Nav principal={principal} />
            </div>
          </details>
          <div className="hidden lg:block lg:sticky lg:top-6">
            <Nav principal={principal} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="no-print mt-8 border-t border-[var(--rule)]">
        <div className="muted mx-auto max-w-[1400px] px-4 py-5 text-xs sm:px-6">
          <p>
            Maintained under the Charter of Apex Kingdom, Art. IV. Entries in these registers are
            records of the Kingdom&rsquo;s own acts and holdings. They are not filings with, and
            carry no authority over, any government, court, or person outside the Kingdom.
          </p>
          <p className="mt-1.5">
            Nothing in this system is legal advice.{" "}
            <Link href="/doctrine/01-LEGAL-POSTURE" className="underline underline-offset-2">
              Read the legal posture memorandum
            </Link>{" "}
            before relying on any position recorded here.
          </p>
        </div>
      </footer>
    </div>
  );
}
