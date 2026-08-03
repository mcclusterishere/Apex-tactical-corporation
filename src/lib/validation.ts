import type { FieldDef, RegistryDef } from "@/registries/types";

/**
 * Validate and normalise a submitted record payload against a registry's field
 * definitions.
 *
 * Normalisation matters as much as validation here. Dates are stored as
 * `YYYY-MM-DD` strings rather than Date objects because a registry entry records
 * a calendar day on which something happened — the day a mark was first used in
 * commerce, the day a letter was served — and attaching a timezone to that turns
 * one date into two depending on where the reader sits. Timestamps of when the
 * Registrar acted are separate, and those do carry full precision.
 */

export interface ValidationResult {
  ok: boolean;
  data: Record<string, unknown>;
  errors: Record<string, string>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function coerceField(
  field: FieldDef,
  raw: unknown,
): { value: unknown; error?: string } {
  if (isBlank(raw)) {
    return { value: undefined };
  }

  switch (field.type) {
    case "number":
    case "money": {
      const text = String(raw).replace(/[$,\s]/g, "");
      const num = Number(text);
      if (!Number.isFinite(num)) {
        return { value: undefined, error: "Must be a number." };
      }
      if (field.min !== undefined && num < field.min) {
        return { value: undefined, error: `Must be at least ${field.min}.` };
      }
      if (field.max !== undefined && num > field.max) {
        return { value: undefined, error: `Must be at most ${field.max}.` };
      }
      // Money is held as an integer number of cents. Floating point cents are
      // how ledgers end up off by a penny and then off by a thousand.
      const value = field.type === "money" ? Math.round(num * 100) : num;

      /*
       * `Number.isFinite` above passes 1e308. Multiplying it by 100 does not:
       * the result is Infinity, which canonicalise refuses to serialise, so the
       * request dies as an unhandled 500 instead of as a field error the officer
       * can act on. Anything beyond the safe-integer range is also a number this
       * system cannot represent honestly — arithmetic on it silently stops being
       * exact, which in a ledger is worse than refusing it.
       */
      if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
        return {
          value: undefined,
          error:
            field.type === "money"
              ? "That amount is too large to record exactly. Enter it in a unit this register can hold."
              : "That number is too large to record exactly.",
        };
      }
      return { value };
    }

    case "boolean": {
      if (typeof raw === "boolean") return { value: raw };
      const text = String(raw).toLowerCase();
      return { value: text === "true" || text === "on" || text === "yes" || text === "1" };
    }

    case "date": {
      const text = String(raw).trim();
      if (!DATE_RE.test(text)) {
        return { value: undefined, error: "Use the date picker, or enter YYYY-MM-DD." };
      }
      const parsed = new Date(`${text}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) {
        return { value: undefined, error: "Not a real calendar date." };
      }
      // Reject dates the calendar rolled over, e.g. 2025-02-30 -> Mar 2.
      if (parsed.toISOString().slice(0, 10) !== text) {
        return { value: undefined, error: "Not a real calendar date." };
      }
      return { value: text };
    }

    case "select": {
      const text = String(raw);
      const allowed = field.options?.some((option) => option.value === text);
      if (!allowed) return { value: undefined, error: "Choose one of the listed options." };
      return { value: text };
    }

    case "multiselect": {
      const list = Array.isArray(raw) ? raw.map(String) : [String(raw)];
      const permitted = new Set(field.options?.map((option) => option.value) ?? []);
      const bad = list.filter((item) => !permitted.has(item));
      if (bad.length > 0) {
        return { value: undefined, error: `Not valid options: ${bad.join(", ")}.` };
      }
      return { value: list };
    }

    case "email": {
      const text = String(raw).trim();
      if (!EMAIL_RE.test(text)) return { value: undefined, error: "Not a valid email address." };
      return { value: text.toLowerCase() };
    }

    case "url": {
      let text = String(raw).trim();
      if (!/^https?:\/\//i.test(text)) text = `https://${text}`;
      try {
        const parsed = new URL(text);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return { value: undefined, error: "Only http and https addresses are accepted." };
        }
        return { value: parsed.toString() };
      } catch {
        return { value: undefined, error: "Not a valid web address." };
      }
    }

    default: {
      const text = String(raw).trim();
      const limit = field.maxLength ?? (field.type === "textarea" || field.type === "richtext" ? 20000 : 500);
      if (text.length > limit) {
        return { value: undefined, error: `Too long — limit is ${limit.toLocaleString()} characters.` };
      }
      return { value: text };
    }
  }
}

export function validateRecordData(
  registry: RegistryDef,
  input: Record<string, unknown>,
): ValidationResult {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of registry.fields) {
    const { value, error } = coerceField(field, input[field.key]);
    if (error) {
      errors[field.key] = error;
      continue;
    }
    if (value === undefined) {
      if (field.required) errors[field.key] = `${field.label} is required.`;
      continue;
    }
    data[field.key] = value;
  }

  return { ok: Object.keys(errors).length === 0, data, errors };
}

/** Derive a record title from its data when the registry declares a title field. */
export function deriveTitle(
  registry: RegistryDef,
  data: Record<string, unknown>,
  fallback: string,
): string {
  if (registry.titleField) {
    const value = data[registry.titleField];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 300);
  }
  const firstText = registry.fields.find(
    (field) => (field.type === "text" || field.type === "person") && data[field.key],
  );
  if (firstText) {
    const value = data[firstText.key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 300);
  }
  return fallback;
}
