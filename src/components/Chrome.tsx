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
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The application shell.
 *
 * Navigation is filtered by clearance rather than merely hidden: a register the
 * principal cannot read is not listed, because an officer who can see that a
 * "Sealed Discipline" register exists has already learned something.
 */

function NavSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="overline mb-1.5 flex items-center gap-1.5 px-3">
        <span aria-hidden className="h-px w-2.5 bg-[var(--gilt-line)]" />
        {label}
      </p>
      <div className="space-y-px">{children}</div>
    </div>
  );
}

function Nav({ principal }: { principal: Principal }) {
  const groups = groupedRegistries()
    .map((entry) => ({
      ...entry,
      registries: entry.registries.filter(
        (registry) =>
          canView(principal.clearance, registry.defaultClassification) ||
          asRole(principal.role) === "SOVEREIGN" ||
          registry.restrictedTo?.includes(asRole(principal.role)),
      ),
    }))
    .filter((entry) => entry.registries.length > 0);

  return (
    <nav className="space-y-5">
      <NavSection label="Office">
        <NavLink href="/" exact>
          Home
        </NavLink>
        <NavLink href="/search">Search the registers</NavLink>
        <NavLink href="/verify">Verify a document</NavLink>
        <NavLink href="/chain">The ledger chain</NavLink>
        <NavLink href="/log">Transparency log</NavLink>
        <NavLink href="/calendar">Deadlines</NavLink>
        <NavLink href="/gazette">Official gazette</NavLink>
        {isAuthenticated(principal) ? <NavLink href="/account">Your account</NavLink> : null}
      </NavSection>

      {groups.map((entry) => (
        <NavSection key={entry.group} label={REGISTRY_GROUP_LABELS[entry.group]}>
          {entry.registries.map((registry) => (
            <NavLink key={registry.slug} href={`/registry/${registry.slug}`}>
              {registry.shortTitle}
            </NavLink>
          ))}
        </NavSection>
      ))}

      {isAuthenticated(principal) ? (
        <NavSection label="Treasury &amp; Identity">
          {can(principal.role, "registry:financial") ||
          principal.role === "SOVEREIGN" ||
          can(principal.role, "audit:read") ? (
            <>
              <NavLink href="/treasury" exact>
                The Treasury
              </NavLink>
              <NavLink href="/treasury/journal">Journal</NavLink>
              <NavLink href="/treasury/accounts">Chart of accounts</NavLink>
              <NavLink href="/treasury/currency">The Mint · Apex Mark</NavLink>
            </>
          ) : null}
          <NavLink href="/credentials" exact>
            Credentials
          </NavLink>
          <NavLink href="/approvals">Dual control</NavLink>
        </NavSection>
      ) : null}

      {isAuthenticated(principal) ? (
        <NavSection label="External Affairs">
          <NavLink href="/dispatch">Dispatch &amp; delivery</NavLink>
          <NavLink href="/standing">The standing packet</NavLink>
        </NavSection>
      ) : null}

      {isAuthenticated(principal) ? (
        <NavSection label="Lands &amp; Lettings">
          <NavLink href="/zomes" exact>Zomes &amp; lettings</NavLink>
          <NavLink href="/bookings">Bookings</NavLink>
          <NavLink href="/stays">Apex Stays</NavLink>
        </NavSection>
      ) : null}

      <NavSection label="Reference">
        <NavLink href="/doctrine" exact>
          Manuals &amp; doctrine
        </NavLink>
        <NavLink href="/doctrine/templates">Instrument templates</NavLink>
        <NavLink href="/charter">The Charter</NavLink>
        <NavLink href="/verify">Verify a certificate</NavLink>
        <NavLink href="/credentials/verify">Check a credential</NavLink>
      </NavSection>

      {can(principal.role, "audit:read") || can(principal.role, "user:manage") ? (
        <NavSection label="Administration">
          {can(principal.role, "audit:read") ? <NavLink href="/audit">Audit log</NavLink> : null}
          {can(principal.role, "user:manage") ? (
            <NavLink href="/principals">Principals &amp; offices</NavLink>
          ) : null}
        </NavSection>
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
      <header className="no-print surface raised sticky top-0 z-50 border-b border-[var(--rule-strong)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="text-[var(--gilt-line)] transition-transform group-hover:scale-105">
              <Seal size={38} />
            </span>
            <span className="min-w-0">
              <span className="display block truncate text-[18px] font-semibold leading-none tracking-tight">
                Apex Kingdom
              </span>
              <span className="overline mt-1 block truncate text-[10px]">
                Office of the Registrar
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3 text-[13px]">
            <ThemeToggle />
            <span aria-hidden className="hidden h-6 w-px bg-[var(--rule)] sm:block" />
            {signedIn ? (
              <>
                <Link href="/account" className="hidden text-right leading-tight sm:block">
                  <span className="block font-medium underline-offset-2 hover:underline">
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
                    className="rounded-sm border border-[var(--rule-strong)] px-2.5 py-1 text-[13px] transition-colors hover:surface-tint"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <span className="muted hidden sm:inline">Public register</span>
                <Link
                  href="/sign-in"
                  className="rounded-sm border border-[var(--accent)] bg-[var(--accent)] px-3 py-1 font-medium text-[var(--page-raised)] transition-opacity hover:opacity-90"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-7 sm:px-6 lg:flex-row lg:gap-9">
        {/* Collapsed into a disclosure on small screens so the shell needs no client JS to open. */}
        <aside className="no-print lg:w-[15rem] lg:shrink-0">
          <details className="lg:hidden" name="nav">
            <summary className="surface cursor-pointer list-none rounded-sm border border-[var(--rule-strong)] px-3 py-2 text-[13px] font-medium">
              Registers &amp; sections
            </summary>
            <div className="mt-3">
              <Nav principal={principal} />
            </div>
          </details>
          <div className="hidden lg:sticky lg:top-[5.25rem] lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
            <Nav principal={principal} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="no-print mt-10 border-t border-[var(--rule)]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-[var(--gilt-line)] opacity-70">
              <Seal size={26} />
            </span>
            <div className="muted text-xs leading-relaxed">
              <p>
                Maintained under the Charter of Apex Kingdom, Art. IV. Entries in these registers are
                records of the Kingdom&rsquo;s own acts and holdings. They are not filings with, and
                carry no authority over, any government, court, or person outside the Kingdom.
              </p>
              <p className="mt-1.5">
                Nothing in this system is legal advice.{" "}
                <Link href="/doctrine/01-LEGAL-POSTURE" className="link">
                  Read the legal posture memorandum
                </Link>{" "}
                before relying on any position recorded here.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
