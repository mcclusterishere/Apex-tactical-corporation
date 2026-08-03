"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { FieldDef, FormRegistry } from "@/registries/types";
import { CLASSIFICATIONS, CLASSIFICATION_LABELS, CLASSIFICATION_DESCRIPTIONS } from "@/lib/classification";
import type { FormState } from "@/app/actions/records";

/**
 * The universal entry form.
 *
 * Rendered from a RegistryDef, so opening a new register produces a working
 * form with no additional code. Field help is shown inline rather than behind a
 * tooltip because the guidance is the point — most entry errors in a register
 * of this kind are people confidently filling in a field they have
 * misunderstood.
 */

const INPUT_CLASS =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function FieldControl({
  field,
  value,
  error,
}: {
  field: FieldDef;
  value: string | string[] | undefined;
  error?: string;
}) {
  const describedBy = [field.help ? `${field.key}-help` : null, error ? `${field.key}-error` : null]
    .filter(Boolean)
    .join(" ");
  const common = {
    id: field.key,
    name: field.key,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : undefined,
    className: `${INPUT_CLASS} ${error ? "border-seal-600" : ""}`,
  };

  switch (field.type) {
    case "textarea":
    case "richtext":
      return (
        <textarea
          {...common}
          rows={field.type === "richtext" ? 10 : 4}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          maxLength={field.maxLength ?? 20000}
        />
      );

    case "select":
      return (
        <select {...common} defaultValue={typeof value === "string" ? value : ""}>
          <option value="">— not stated —</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "multiselect": {
      const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
      return (
        <fieldset
          className="surface space-y-1.5 rounded-sm border border-[var(--rule-strong)] px-3 py-2"
          aria-describedby={describedBy || undefined}
        >
          {field.options?.map((option) => (
            <label key={option.value} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name={field.key}
                value={option.value}
                defaultChecked={selected.has(option.value)}
                className="mt-1"
              />
              <span>
                {option.label}
                {option.help ? <span className="muted block text-xs">{option.help}</span> : null}
              </span>
            </label>
          ))}
        </fieldset>
      );
    }

    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            id={field.key}
            name={field.key}
            defaultChecked={Boolean(value) && value !== ""}
            aria-describedby={describedBy || undefined}
          />
          <span>Yes</span>
        </label>
      );

    case "date":
      return <input {...common} type="date" defaultValue={typeof value === "string" ? value : ""} />;

    case "number":
    case "money":
      return (
        <input
          {...common}
          type="text"
          inputMode="decimal"
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder ?? (field.type === "money" ? "0.00" : undefined)}
        />
      );

    case "email":
      return <input {...common} type="email" defaultValue={typeof value === "string" ? value : ""} />;

    case "phone":
      return <input {...common} type="tel" defaultValue={typeof value === "string" ? value : ""} />;

    case "url":
      return (
        <input
          {...common}
          type="text"
          inputMode="url"
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder ?? "https://"}
        />
      );

    case "recordRef":
      return (
        <input
          {...common}
          type="text"
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder ?? "AK-XXX-000000"}
        />
      );

    default:
      return (
        <input
          {...common}
          type="text"
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          maxLength={field.maxLength ?? 500}
        />
      );
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-white"
    >
      {pending ? "Recording…" : label}
    </button>
  );
}

export function RecordForm({
  registry,
  action,
  submitLabel,
  cancelHref,
  initial,
  requireReason,
  canReclassify,
}: {
  registry: FormRegistry;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  cancelHref: string;
  initial?: {
    title?: string;
    status?: string;
    classification?: string;
    effectiveDate?: string;
    data?: Record<string, string | string[]>;
  };
  requireReason?: boolean;
  canReclassify?: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: false });
  const values = state.values ?? initial?.data ?? {};

  // Preserve declaration order within each section while grouping.
  const sections: { name: string; fields: FieldDef[] }[] = [];
  for (const field of registry.fields) {
    const name = field.section ?? "Particulars";
    let section = sections.find((candidate) => candidate.name === name);
    if (!section) {
      section = { name, fields: [] };
      sections.push(section);
    }
    section.fields.push(field);
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.ok ? (
        <div
          role="alert"
          className="border-l-[3px] border-seal-600 bg-seal-50 px-4 py-3 text-[13px] text-seal-900 dark:bg-transparent dark:text-seal-300"
        >
          {state.message}
        </div>
      ) : null}

      {requireReason ? (
        <div className="surface rounded-sm border border-gilt-500 px-4 py-3">
          <label htmlFor="_reason" className="overline mb-1 block">
            Reason for the amendment <span className="text-seal-600">required</span>
          </label>
          <input
            id="_reason"
            name="_reason"
            className={INPUT_CLASS}
            placeholder="e.g. Registration number issued by the Copyright Office; corrected from the certificate."
            aria-describedby="_reason-help"
          />
          <p id="_reason-help" className="muted mt-1 text-xs">
            Committed to the ledger alongside the change. An amendment without a stated reason is
            the first thing an opposing party will ask about.
          </p>
          {state.fieldErrors?.reason ? (
            <p className="mt-1 text-xs text-seal-600">{state.fieldErrors.reason}</p>
          ) : null}
        </div>
      ) : null}

      <fieldset className="surface rounded-sm border border-[var(--rule)] px-4 py-4">
        <legend className="overline px-1">Register entry</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="_title" className="overline mb-1 block">
              Title of the entry
            </label>
            <input
              id="_title"
              name="_title"
              className={INPUT_CLASS}
              defaultValue={initial?.title ?? ""}
              placeholder={`Leave blank to take the title from the ${registry.recordLabel.toLowerCase()}`}
            />
          </div>

          <div>
            <label htmlFor="_status" className="overline mb-1 block">
              Status
            </label>
            <select
              id="_status"
              name="_status"
              className={INPUT_CLASS}
              defaultValue={initial?.status ?? registry.defaultStatus}
            >
              {registry.statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="_effectiveDate" className="overline mb-1 block">
              Effective date
            </label>
            <input
              id="_effectiveDate"
              name="_effectiveDate"
              type="date"
              className={INPUT_CLASS}
              defaultValue={initial?.effectiveDate ?? ""}
              aria-describedby="_effectiveDate-help"
            />
            <p id="_effectiveDate-help" className="muted mt-1 text-xs">
              The day the underlying act took effect, which may precede the day it was recorded.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="_classification" className="overline mb-1 block">
              Classification
            </label>
            <select
              id="_classification"
              name="_classification"
              className={INPUT_CLASS}
              defaultValue={initial?.classification ?? registry.defaultClassification}
              disabled={canReclassify === false}
            >
              {CLASSIFICATIONS.map((level) => (
                <option key={level} value={level}>
                  {CLASSIFICATION_LABELS[level]} — {CLASSIFICATION_DESCRIPTIONS[level]}
                </option>
              ))}
            </select>
            {canReclassify === false ? (
              <p className="muted mt-1 text-xs">
                Reclassification requires the power to seal. The current level is retained.
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      {sections.map((section) => (
        <fieldset
          key={section.name}
          className="surface rounded-sm border border-[var(--rule)] px-4 py-4"
        >
          <legend className="overline px-1">{section.name}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const wide =
                field.type === "textarea" ||
                field.type === "richtext" ||
                field.type === "multiselect";
              const error = state.fieldErrors?.[field.key];
              return (
                <div key={field.key} className={wide ? "sm:col-span-2" : undefined}>
                  <label htmlFor={field.key} className="overline mb-1 block">
                    {field.label}
                    {field.required ? <span className="ml-1 text-seal-600">required</span> : null}
                  </label>
                  <FieldControl field={field} value={values[field.key]} error={error} />
                  {field.help ? (
                    <p id={`${field.key}-help`} className="muted mt-1 text-xs">
                      {field.help}
                    </p>
                  ) : null}
                  {error ? (
                    <p id={`${field.key}-error`} className="mt-1 text-xs text-seal-600">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href={cancelHref}
          className="rounded-sm border border-[var(--rule-strong)] px-4 py-1.5 text-[13px] transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          Cancel
        </Link>
        <p className="muted text-xs">
          Recording this entry writes a permanent link in the ledger chain. Entries are amended and
          voided, never deleted.
        </p>
      </div>
    </form>
  );
}
