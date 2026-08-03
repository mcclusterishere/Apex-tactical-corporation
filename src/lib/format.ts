/**
 * Formatting helpers.
 *
 * Everything here renders in UTC. A register entry says a thing happened on a
 * calendar day; rendering that day in the reader's local timezone means two
 * officers in different places see two different dates on the same record,
 * which is exactly the kind of discrepancy that gets a witness impeached.
 */

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FMT.format(date);
}

export function formatDateShort(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_SHORT_FMT.format(date);
}

/** Full instant, explicitly labelled UTC so nobody has to guess. */
export function formatTimestamp(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return `${DATETIME_FMT.format(date)} UTC`;
}

/** ISO calendar day, for form inputs. */
export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Money is stored in integer cents; render it as dollars. */
export function formatMoney(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "—";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/** Days from today until `due`; negative when overdue. */
export function daysUntil(due: Date | string): number {
  const date = typeof due === "string" ? new Date(`${due}T00:00:00Z`) : due;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dueUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.round((dueUtc - todayUtc) / 86_400_000);
}

export function describeDueIn(days: number): string {
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days < 30) return `due in ${days} days`;
  const months = Math.round(days / 30);
  return `due in about ${months} month${months === 1 ? "" : "s"}`;
}

/** Abbreviate a digest for inline display: first 8 and last 8 characters. */
export function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Read one value out of a query string.
 *
 * Next types `searchParams` optimistically as `{ q?: string }`, but the runtime
 * hands back `string[]` whenever a parameter appears more than once — and
 * `?q=a&q=b` is something anyone can type, or a crawler can generate, or a
 * mangled redirect can produce. The optimistic type means `q.trim()` compiles
 * and then throws at runtime, which on `/verify` and `/search` is an
 * unauthenticated 500 on the two pages the Kingdom most wants strangers to be
 * able to use.
 *
 * Taking the first occurrence matches what every other server does.
 */
export function oneParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
