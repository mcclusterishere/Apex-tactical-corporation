"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A navigation link that knows whether it is the page you are on.
 *
 * The active entry carries a gilt tick and a tinted ground, so the sidebar
 * always answers "where am I" without a second glance. `exact` is passed for the
 * handful of hrefs that are prefixes of their siblings (the desk, the treasury,
 * the doctrine index), so those do not stay lit while you are on a child page.
 */
export function NavLink({
  href,
  children,
  exact,
}: {
  href: string;
  children: ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative block rounded-[3px] py-[5px] pl-3 pr-2 text-[13px] leading-snug transition-colors ${
        active
          ? "surface-tint font-medium text-[var(--text)]"
          : "text-[var(--text-muted)] hover:surface-tint hover:text-[var(--text)]"
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 h-[15px] w-[2.5px] -translate-y-1/2 rounded-full transition-colors ${
          active ? "bg-[var(--gilt-line)]" : "bg-transparent"
        }`}
      />
      {children}
    </Link>
  );
}
