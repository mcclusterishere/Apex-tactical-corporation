import Link from "next/link";
import type { ReactNode } from "react";
import { CLASSIFICATION_LABELS, type Classification } from "@/lib/classification";
import type { StatusDef } from "@/registries/types";
import { IconArrow } from "@/components/Icons";

/** Shared presentational primitives. Server components; no client state. */

const TONE_CLASS: Record<StatusDef["tone"], string> = {
  neutral: "border-ink-300 text-ink-600 dark:border-ink-600 dark:text-ink-300",
  active: "border-ink-400 text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-800/60",
  warning: "border-gilt-500 text-gilt-700 dark:text-gilt-300 bg-gilt-100 dark:bg-gilt-500/10",
  danger: "border-seal-500 text-seal-700 dark:text-seal-300 bg-seal-50 dark:bg-seal-500/10",
  success: "border-moss-500 text-moss-700 dark:text-moss-100 bg-moss-100 dark:bg-moss-500/10",
};

export function StatusBadge({ status, statuses }: { status: string; statuses: StatusDef[] }) {
  const def = statuses.find((candidate) => candidate.value === status);
  const tone = def?.tone ?? "neutral";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${TONE_CLASS[tone]}`}
      title={def?.help}
    >
      {def?.label ?? status}
    </span>
  );
}

const CLASSIFICATION_CLASS: Record<Classification, string> = {
  PUBLIC: "border-moss-500 text-moss-700 dark:text-moss-100",
  MEMBERS: "border-ink-400 text-ink-600 dark:text-ink-300",
  OFFICERS: "border-gilt-600 text-gilt-700 dark:text-gilt-300",
  SEALED: "border-seal-600 text-seal-700 dark:text-seal-300 bg-seal-50 dark:bg-seal-500/10",
};

export function ClassificationBadge({ value }: { value: string }) {
  const key = (value in CLASSIFICATION_LABELS ? value : "SEALED") as Classification;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${CLASSIFICATION_CLASS[key]}`}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      {CLASSIFICATION_LABELS[key]}
    </span>
  );
}

export function PageHeader({
  overline,
  title,
  lede,
  actions,
}: {
  overline?: ReactNode;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="masthead-rule mb-7 pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {overline ? (
            <p className="overline mb-2 flex items-center gap-1.5">
              <span aria-hidden className="h-px w-3 bg-[var(--gilt-line)]" />
              {overline}
            </p>
          ) : null}
          <h1 className="display text-[1.75rem] leading-[1.1] sm:text-[2.05rem]">{title}</h1>
          {lede ? <div className="muted mt-2.5 max-w-3xl text-sm leading-relaxed">{lede}</div> : null}
        </div>
        {actions ? <div className="no-print flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  tone = "default",
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  tone?: "default" | "caution" | "seal";
}) {
  const border =
    tone === "caution"
      ? "border-gilt-500"
      : tone === "seal"
        ? "border-seal-500"
        : "border-[var(--rule)]";
  return (
    <section className={`surface avoid-break mb-6 overflow-hidden rounded-lg border ${border}`}>
      {title ? (
        <div className="surface-tint flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] px-5 py-3">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-semibold tracking-tight">{title}</h2>
            {description ? <p className="muted mt-0.5 text-xs leading-snug">{description}</p> : null}
          </div>
          {actions ? <div className="no-print flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="min-w-0 px-5 py-4">{children}</div>
    </section>
  );
}

type ButtonTone = "primary" | "default" | "danger" | "quiet";

const BUTTON_CLASS: Record<ButtonTone, string> = {
  primary:
    "border-[var(--accent)] bg-[var(--accent)] text-[var(--page-raised)] hover:opacity-90",
  default: "surface border-[var(--rule-strong)] hover:surface-tint",
  danger:
    "border-seal-600 text-seal-700 dark:text-seal-300 hover:bg-seal-50 dark:hover:bg-seal-500/10",
  quiet: "border-transparent hover:surface-tint",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-[5px] border px-3.5 py-1.5 text-[13px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50";

export function ButtonLink({
  href,
  children,
  tone = "default",
  target,
}: {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  target?: string;
}) {
  return (
    <Link href={href} target={target} className={`${BUTTON_BASE} ${BUTTON_CLASS[tone]}`}>
      {children}
    </Link>
  );
}

export function buttonClass(tone: ButtonTone = "default"): string {
  return `${BUTTON_BASE} ${BUTTON_CLASS[tone]}`;
}

/** Label/value pair as used throughout record detail views. */
export function Field({
  label,
  children,
  help,
  wide,
}: {
  label: string;
  children: ReactNode;
  help?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="overline mb-1">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
      {help ? <p className="muted mt-0.5 text-xs">{help}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="surface-tint rounded-md border border-dashed border-[var(--rule-strong)] px-6 py-12 text-center">
      <p className="display text-lg font-semibold">{title}</p>
      {children ? <div className="muted mx-auto mt-2 max-w-md text-sm leading-relaxed">{children}</div> : null}
      {action ? <div className="no-print mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** A short, unmissable statement of a legal or operational constraint. */
export function Caution({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="avoid-break rounded-r-md border-l-[3px] border-gilt-500 bg-gilt-100/70 px-4 py-3 dark:bg-gilt-500/10">
      <p className="text-[13px] font-semibold">{title}</p>
      <div className="muted mt-1 text-[13px] leading-relaxed">{children}</div>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-r-md border-l-[3px] border-seal-600 bg-seal-50 px-4 py-3 text-[13px] text-seal-900 dark:bg-seal-500/10 dark:text-seal-300"
    >
      {children}
    </div>
  );
}

/**
 * The greeter band at the top of the front door. Warm parchment ground, the
 * seal set large like the head of a piece of letterhead, one plain sentence of
 * what this is, and — for a first-time or elderly visitor — nothing to decipher.
 * The gravitas is carried by the type and the seal, not by clutter.
 */
export function Hero({
  eyebrow,
  title,
  lede,
  seal,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  seal?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="hero-band avoid-break mb-8 overflow-hidden rounded-xl border border-[var(--rule-strong)]">
      <div className="flex flex-col items-start gap-6 px-6 py-8 sm:flex-row sm:items-center sm:px-9 sm:py-10">
        {seal ? (
          <div className="text-[var(--gilt-line)] opacity-90 drop-shadow-sm">{seal}</div>
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="overline mb-2.5 flex items-center gap-1.5">
              <span aria-hidden className="h-px w-3.5 bg-[var(--gilt-line)]" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="display text-[2rem] leading-[1.05] sm:text-[2.6rem]">{title}</h1>
          {lede ? (
            <div className="mt-3.5 max-w-2xl text-[15.5px] leading-relaxed text-[var(--text-muted)]">
              {lede}
            </div>
          ) : null}
          {actions ? (
            <div className="no-print mt-5 flex flex-wrap gap-2.5">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * A large, unmissable "what do you want to do?" card. One picture, one plain
 * verb, one line of help. Big enough to hit with a thumb, calm enough to read at
 * a glance, and it lifts a hair toward the reader on hover so it plainly invites
 * a click. This is the load-bearing element of the simple front door.
 */
export function ActionCard({
  href,
  icon,
  title,
  children,
  tone = "default",
  external,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  tone?: "default" | "gilt";
  external?: boolean;
}) {
  const ring =
    tone === "gilt"
      ? "text-[var(--gilt-line)] bg-gilt-100 dark:bg-gilt-500/15"
      : "text-[var(--link)] bg-[color-mix(in_srgb,var(--link)_12%,transparent)]";
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="action-card surface group flex min-h-[9.5rem] flex-col rounded-xl border border-[var(--rule)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--rule-strong)] hover:raised focus-visible:-translate-y-0.5"
    >
      <span
        className={`mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-lg text-[22px] ${ring}`}
      >
        {icon}
      </span>
      <span className="display flex items-center gap-1.5 text-[1.15rem] font-semibold leading-tight">
        {title}
        <span
          aria-hidden
          className="translate-x-0 text-[var(--text-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        >
          <IconArrow size="0.7em" />
        </span>
      </span>
      {children ? (
        <span className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
          {children}
        </span>
      ) : null}
    </Link>
  );
}

export function Stat({
  label,
  value,
  detail,
  href,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href?: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const accent =
    tone === "danger"
      ? "border-l-seal-600"
      : tone === "warning"
        ? "border-l-gilt-500"
        : tone === "success"
          ? "border-l-moss-500"
          : "border-l-[var(--gilt-line)]";

  const body = (
    <>
      <p className="overline">{label}</p>
      <p className="display mt-1.5 text-[1.7rem] leading-none">{value}</p>
      {detail ? <p className="muted mt-2 text-xs leading-snug">{detail}</p> : null}
    </>
  );

  const className = `surface block rounded-md border border-[var(--rule)] border-l-[3px] ${accent} px-4 py-3.5 ${
    href ? "transition-all hover:raised hover:-translate-y-px" : ""
  }`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
