import Link from "next/link";
import type { FieldDef } from "@/registries/types";
import { formatDate, formatMoney } from "@/lib/format";

/**
 * Render one stored field value for display.
 *
 * Values arrive from a JSON payload, so nothing about their runtime type is
 * guaranteed by the compiler — a record written before a field's type was
 * changed will still be holding the old shape. Every branch therefore checks
 * what it actually received rather than trusting the declaration.
 */
export function FieldValue({
  field,
  value,
  compact,
}: {
  field: FieldDef;
  value: unknown;
  compact?: boolean;
}) {
  if (value === undefined || value === null || value === "") {
    return <span className="muted">—</span>;
  }

  switch (field.type) {
    case "date":
      return <span className="tabular">{formatDate(typeof value === "string" ? value : null)}</span>;

    case "money":
      return (
        <span className="tabular">{formatMoney(typeof value === "number" ? value : null)}</span>
      );

    case "number":
      return (
        <span className="tabular">
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </span>
      );

    case "boolean":
      return value ? (
        <span>Yes</span>
      ) : (
        <span className="muted">No</span>
      );

    case "select": {
      const option = field.options?.find((candidate) => candidate.value === value);
      return <span>{option?.label ?? String(value)}</span>;
    }

    case "multiselect": {
      const list = Array.isArray(value) ? value.map(String) : [String(value)];
      if (list.length === 0) return <span className="muted">—</span>;
      return (
        <span className="flex flex-wrap gap-1">
          {list.map((item) => {
            const option = field.options?.find((candidate) => candidate.value === item);
            return (
              <span
                key={item}
                className="rounded-sm border border-[var(--rule-strong)] px-1.5 py-0.5 text-xs"
              >
                {option?.label ?? item}
              </span>
            );
          })}
        </span>
      );
    }

    case "url": {
      const href = String(value);
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="break-all underline underline-offset-2"
        >
          {compact ? new URL(href).hostname : href}
        </a>
      );
    }

    case "email":
      return (
        <a href={`mailto:${String(value)}`} className="underline underline-offset-2">
          {String(value)}
        </a>
      );

    case "recordRef": {
      const number = String(value);
      return (
        <Link href={`/verify/${encodeURIComponent(number)}`} className="tabular underline underline-offset-2">
          {number}
        </Link>
      );
    }

    case "textarea":
    case "richtext": {
      const text = String(value);
      if (compact) {
        return <span>{text.length > 90 ? `${text.slice(0, 90)}…` : text}</span>;
      }
      return <span className="block whitespace-pre-wrap">{text}</span>;
    }

    default:
      return <span>{String(value)}</span>;
  }
}
