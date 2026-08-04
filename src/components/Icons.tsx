/**
 * A small set of line icons, drawn inline so they render identically in the
 * browser, in print, and on a machine with no network access — the same
 * discipline as the Seal. All strokes are `currentColor`, so an icon takes the
 * colour of its surrounding text and works in light and dark without a second
 * asset. Sized in `em` by default so an icon scales with the type around it.
 *
 * These are the friendly, unmistakable signposts of the front door: large,
 * plain, and few. An elder should know what a card does from its picture before
 * reading a word of it.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Base({ size = "1em", children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Verify a document — a seal ribbon over a check. */
export function IconVerify(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l7 3v5c0 4.2-2.8 7.4-7 8.6C7.8 18.4 5 15.2 5 11V6l7-3z" />
      <path d="M9 11.5l2.2 2.2L15.5 9.4" />
    </Base>
  );
}

/** Search the records — a magnifier. */
export function IconSearch(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </Base>
  );
}

/** Read the Charter — a scroll. */
export function IconCharter(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" />
      <path d="M6 6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1" />
      <path d="M10 9h5M10 12.5h5M10 16h3" />
    </Base>
  );
}

/** Claim your identity — a person on a card. */
export function IconIdentity(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16.2c.4-1.6 1.6-2.4 3-2.4s2.6.8 3 2.4" />
      <path d="M14.5 10h4M14.5 13h4" />
    </Base>
  );
}

/** Book a stay — a domed home (a zome). */
export function IconStay(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M4 12v7h16v-7" />
      <path d="M12 4v0M4 12h16" />
      <path d="M10 19v-4h4v4" />
    </Base>
  );
}

/** The official gazette — a folded broadsheet. */
export function IconGazette(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 5h13a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5z" />
      <path d="M18 8h2v9a2 2 0 0 1-2 2" />
      <path d="M7 8h7M7 11h7M7 14h4" />
    </Base>
  );
}

/** The ledger chain — interlocking links. */
export function IconLedger(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="9" width="9" height="6" rx="3" />
      <rect x="12" y="9" width="9" height="6" rx="3" />
    </Base>
  );
}

/** The registers — a stack of filed records. */
export function IconRegisters(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M4 14h16M9 4v16" />
    </Base>
  );
}

/** The Treasury — coins. */
export function IconTreasury(props: IconProps) {
  return (
    <Base {...props}>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
      <path d="M5 6.5v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-5" />
      <path d="M5 11.5v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-5" />
    </Base>
  );
}

/** Your account — a keyed shield. */
export function IconAccount(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="9" r="3" />
      <path d="M5.5 19c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5" />
    </Base>
  );
}

/** Deadlines / calendar — a dated leaf. */
export function IconCalendar(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
      <path d="M9 13h2v2H9z" />
    </Base>
  );
}

/** Arrow, for "go here". */
export function IconArrow(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Base>
  );
}
