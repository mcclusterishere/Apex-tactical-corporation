/**
 * Deterministic JSON serialisation.
 *
 * The integrity of the whole ledger rests on the ability to re-derive the exact
 * same bytes from the same logical payload, years later, on a different machine,
 * possibly after a database migration. `JSON.stringify` does not guarantee that:
 * key order follows insertion order, which changes when data round-trips through
 * a different driver or ORM version.
 *
 * This module implements a restricted profile of JCS (RFC 8785):
 *   - object keys sorted by UTF-16 code unit
 *   - no insignificant whitespace
 *   - `undefined` members dropped; `null` preserved
 *   - Date serialised as an ISO-8601 UTC string with millisecond precision
 *   - non-finite numbers rejected rather than silently coerced to null
 *
 * Do not "optimise" this file. Any change to its output invalidates every hash
 * previously written and breaks verification of the historical chain.
 */

export type CanonicalValue =
  | string
  | number
  | boolean
  | null
  | Date
  | CanonicalValue[]
  | { [key: string]: CanonicalValue | undefined };

function serialise(value: CanonicalValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return "null";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError("canonicalise: refusing to serialise an Invalid Date");
    }
    return JSON.stringify(value.toISOString());
  }

  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) {
        throw new TypeError(
          `canonicalise: refusing to serialise non-finite number (${String(value)})`,
        );
      }
      // Negative zero and positive zero must hash identically.
      return Object.is(value, -0) ? "0" : JSON.stringify(value);
    case "object":
      break;
    default:
      throw new TypeError(`canonicalise: unsupported type ${typeof value}`);
  }

  if (Array.isArray(value)) {
    // Array holes and undefined members become null, matching JSON semantics.
    const items = value.map((item) => serialise(item) ?? "null");
    return `[${items.join(",")}]`;
  }

  const source = value as { [key: string]: CanonicalValue | undefined };
  const parts: string[] = [];
  for (const key of Object.keys(source).sort()) {
    const encoded = serialise(source[key]);
    if (encoded === undefined) continue; // drop undefined members entirely
    parts.push(`${JSON.stringify(key)}:${encoded}`);
  }
  return `{${parts.join(",")}}`;
}

/** Serialise a value to its canonical JSON form. */
export function canonicalise(value: CanonicalValue): string {
  const result = serialise(value);
  if (result === undefined) {
    throw new TypeError("canonicalise: top-level value may not be undefined");
  }
  return result;
}

/**
 * Parse a JSON payload stored in the database back into a plain object.
 * Returns an empty object for malformed input rather than throwing, so that a
 * single corrupt row cannot take down a list view; corruption surfaces through
 * chain verification instead, which is where it belongs.
 */
export function parseJson<T = Record<string, unknown>>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}
