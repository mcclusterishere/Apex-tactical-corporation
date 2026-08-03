import Link from "next/link";
import type { ReactNode } from "react";
import { CLASSIFICATION_LABELS, type Classification } from "@/lib/classification";
import type { StatusDef } from "@/registries/types";

/** Shared presentational primitives. Server components; no client state. */

const TONE_CLASS: Record<StatusDef["tone"], string> = {
  neutral: "border-ink-300 text-ink-600 dark:text-ink-300",
  active: "border-ink-500 text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-800",
  warning: "border-gilt-500 text-gilt-700 dark:text-gilt-300 bg-gilt-100 dark:bg-transparent",
  danger: "border-seal-500 text-seal-700 dark:text-seal-300 bg-seal-50 dark:bg-transparent",
  success: "border-moss-500 text-moss-700 dark:text-moss-100 bg-moss-100 dark:bg-transparent",
};

export function StatusBadge({ status, statuses }: { status: string; statuses: StatusDef[] }) {
  const def = statuses.find((candidate) => candidate.value === status);
  const tone = def?.tone ?? "neutral";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASS[tone]}`}
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
  SEALED: "border-seal-600 text-seal-700 dark:text-seal-300 bg-seal-50 dark:bg-transparent",
};

export function ClassificationBadge({ value }: { value: string }) {
  const key = (value in CLASSIFICATION_LABELS ? value : "SEALED") as Classification;
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${CLASSIFICATION_CLASS[key]}`}
    >
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
    <header className="masthead-rule mb-6 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {overline ? <p className="overline mb-1">{overline}</p> : null}
          <h1 className="text-2xl leading-tight sm:text-[1.75rem]">{title}</h1>
          {lede ? <div className="muted mt-2 max-w-3xl text-sm">{lede}</div> : null}
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
    <section className={`surface avoid-break mb-6 rounded-sm border ${border}`}>
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {description ? <p className="muted mt-0.5 text-xs">{description}</p> : null}
          </div>
          {actions ? <div className="no-print flex gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="min-w-0 px-4 py-4">{children}</div>
    </section>
  );
}

type ButtonTone = "primary" | "default" | "danger" | "quiet";

const BUTTON_CLASS: Record<ButtonTone, string> = {
  primary:
    "bg-ink-800 text-ink-50 border-ink-800 hover:bg-ink-700 dark:bg-ink-100 dark:text-ink-900 dark:border-ink-100 dark:hover:bg-white",
  default:
    "surface border-[var(--rule-strong)] hover:bg-ink-50 dark:hover:bg-ink-800",
  danger:
    "border-seal-600 text-seal-700 dark:text-seal-300 hover:bg-seal-50 dark:hover:bg-seal-900/30",
  quiet: "border-transparent hover:bg-ink-100 dark:hover:bg-ink-800",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-sm border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

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
      <dt className="overline mb-0.5">{label}</dt>
      <dd className="text-sm">{children}</dd>
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
    <div className="border border-dashed border-[var(--rule-strong)] px-6 py-10 text-center">
      <p className="display text-base font-semibold">{title}</p>
      {children ? <div className="muted mx-auto mt-1.5 max-w-md text-sm">{children}</div> : null}
      {action ? <div className="no-print mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** A short, unmissable statement of a legal or operational constraint. */
export function Caution({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="avoid-break border-l-[3px] border-gilt-500 bg-gilt-100/60 px-4 py-3 dark:bg-transparent">
      <p className="text-[13px] font-semibold">{title}</p>
      <div className="muted mt-1 text-[13px]">{children}</div>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="border-l-[3px] border-seal-600 bg-seal-50 px-4 py-3 text-[13px] text-seal-900 dark:bg-transparent dark:text-seal-300"
    >
      {children}
    </div>
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
          : "border-l-[var(--rule-strong)]";

  const body = (
    <>
      <p className="overline">{label}</p>
      <p className="display mt-1 text-2xl leading-none">{value}</p>
      {detail ? <p className="muted mt-1.5 text-xs">{detail}</p> : null}
    </>
  );

  const className = `surface block border border-l-[3px] ${accent} px-3.5 py-3 ${
    href ? "transition-colors hover:bg-ink-50 dark:hover:bg-ink-800" : ""
  }`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
