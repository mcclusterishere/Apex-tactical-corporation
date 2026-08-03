import type { Classification } from "@/lib/classification";
import type { Role } from "@/lib/authz";

/**
 * A registry is a declared register of the Kingdom: the Roll of Citizens, the
 * Register of Instruments, the Intellectual Property Portfolio, and so on.
 *
 * Registries are data, not code. Adding a new register means adding one file to
 * src/registries and listing it in src/registries/index.ts — no migration, no
 * new tables, no new pages. Everything downstream (list views, forms, search,
 * certification, the hash chain, access control, exports) is generic.
 *
 * The reason to build it this way: an institution's record-keeping needs change
 * faster than its software gets rewritten. A register the Kingdom cannot open
 * for itself is a register it will end up keeping in a spreadsheet instead.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "date"
  | "number"
  | "money"
  | "select"
  | "multiselect"
  | "boolean"
  | "email"
  | "phone"
  | "url"
  | "person"
  | "jurisdiction"
  | "recordRef";

export interface FieldOption {
  value: string;
  label: string;
  /** Shown beneath the option in forms. Use it to explain consequences. */
  help?: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Guidance shown with the field. Say what the field is FOR, not what it is. */
  help?: string;
  placeholder?: string;
  options?: FieldOption[];
  /** For recordRef fields: which registry the referenced record must belong to. */
  refRegistry?: string;
  /** Hide from list/detail views below this clearance. */
  classification?: Classification;
  /** Show in the compact summary at the top of the detail page. */
  summary?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  /** Group fields into fieldsets on the form. */
  section?: string;
}

export interface StatusDef {
  value: string;
  label: string;
  /** Tailwind-ish token consumed by the StatusBadge component. */
  tone: "neutral" | "active" | "warning" | "danger" | "success";
  help?: string;
}

/**
 * A deadline the registry generates automatically from a record's own data.
 *
 * This exists because the expensive mistakes in rights work are almost never
 * legal subtleties — they are calendar misses. A copyright registered more than
 * three months after publication and after infringement began cannot draw
 * statutory damages or attorney's fees (17 U.S.C. § 412), which is frequently
 * the difference between a case worth bringing and one that is not. A trademark
 * registration dies if the § 8 declaration is not filed in its window. Nobody
 * remembers these. The register should.
 */
export interface DeadlineRule {
  id: string;
  title: string;
  /** Field whose date value the offset is measured from. */
  fromField: string;
  offsetDays: number;
  severity: "CRITICAL" | "HIGH" | "ROUTINE";
  /** Statutory or regulatory source, cited on the reminder. */
  authority?: string;
  detail?: string;
  /** Only generate when this predicate holds over the record's data. */
  when?: (data: Record<string, unknown>) => boolean;
}

export interface RegistryDef {
  slug: string;
  /** Formal name, as it would appear on a certificate. */
  title: string;
  /** Short name for navigation. */
  shortTitle: string;
  /** Singular noun for one entry, e.g. "Citizen", "Instrument". */
  recordLabel: string;
  recordLabelPlural: string;
  description: string;
  /** Grouping in the navigation sidebar. */
  group: RegistryGroup;
  /** Prefix for record numbers, e.g. "CIT" produces AK-CIT-000001. */
  numberPrefix: string;
  /** Charter article or other authority under which the register is kept. */
  authority?: string;
  /**
   * Longer explanation of why this register exists and how to use it well.
   * Rendered on the registry index page. This is where institutional knowledge
   * lives so it does not have to live in one person's head.
   */
  guidance?: string;
  fields: FieldDef[];
  /** Field keys shown as columns in the list view, after Number and Title. */
  listColumns: string[];
  /** Field key used to derive a record's title when not given explicitly. */
  titleField?: string;
  statuses: StatusDef[];
  defaultStatus: string;
  defaultClassification: Classification;
  /** Restrict write access to these offices. Sovereign always retains access. */
  restrictedTo?: readonly Role[];
  deadlineRules?: DeadlineRule[];
  /** Sort order in the sidebar within a group. */
  order?: number;
}

/**
 * The part of a RegistryDef that may cross into a client component.
 *
 * `deadlineRules` carries a `when` predicate, and functions cannot be
 * serialised across the server/client boundary — passing a whole RegistryDef to
 * a form component fails at render time. The entry form needs none of the
 * deadline machinery, so it takes this projection instead.
 */
export type FormRegistry = Omit<RegistryDef, "deadlineRules">;

export function toFormRegistry(registry: RegistryDef): FormRegistry {
  const { deadlineRules: _deadlineRules, ...rest } = registry;
  return rest;
}

export const REGISTRY_GROUPS = [
  "governance",
  "people",
  "identity",
  "property",
  "enterprise",
  "rights",
  "relations",
  "evidence",
  "treasury",
  "stewardship",
] as const;

export type RegistryGroup = (typeof REGISTRY_GROUPS)[number];

export const REGISTRY_GROUP_LABELS: Record<RegistryGroup, string> = {
  governance: "Governance & Law",
  people: "People & Offices",
  property: "Property & Territory",
  rights: "Rights & Enforcement",
  relations: "External Relations",
  evidence: "Evidence & Custody",
  stewardship: "Stewardship & Finance",
  identity: "Identity & Credentials",
  enterprise: "Assets & Entities",
  treasury: "Treasury & Obligations",
};

export const REGISTRY_GROUP_BLURBS: Record<RegistryGroup, string> = {
  governance:
    "The Charter, the instruments promulgated under it, and the decisions of the Kingdom's tribunals.",
  people: "Who belongs to the Kingdom, who holds office, and by what commission.",
  property: "What the Kingdom holds, where, and on what title.",
  rights:
    "What the Kingdom owns in the way of intellectual and cultural property, and what it is doing to defend it.",
  relations:
    "Every dealing with an outside government, agency, tribe, or institution — and what came of it.",
  evidence:
    "Material collected for use in a proceeding, with the custody record that makes it usable.",
  stewardship: "Funds received and disbursed, and the accounting owed to members and donors.",
  identity: "Who the Kingdom has recognised, and the credentials issued to them.",
  enterprise: "What the Kingdom holds, who holds it, and the bodies chartered under it.",
  treasury:
    "Obligations, accounts, and purchasing — the money side of the institution, where the controls matter most.",
};
