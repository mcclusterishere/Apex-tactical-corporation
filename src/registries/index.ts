import type { RegistryDef, RegistryGroup } from "@/registries/types";
import { REGISTRY_GROUPS } from "@/registries/types";

// Governance & Law
import instruments from "@/registries/instruments";
import tribunal from "@/registries/tribunal";
import consents from "@/registries/consents";
import permits from "@/registries/permits";
import appointmentsElections from "@/registries/appointments-elections";

// People & Offices
import citizens from "@/registries/citizens";
import offices from "@/registries/offices";
import vitalRecords from "@/registries/vital-records";
import ordinations from "@/registries/ordinations";
import households from "@/registries/households";
import benefits from "@/registries/benefits";

// Identity & Credentials
import credentialsIssued from "@/registries/credentials-issued";

// Property & Territory
import realProperty from "@/registries/real-property";
import chattels from "@/registries/chattels";
import sacredSites from "@/registries/sacred-sites";

// Assets & Entities
import assetRegister from "@/registries/asset-register";
import custody from "@/registries/custody";
import entities from "@/registries/entities";

// Rights & Enforcement
import intellectualProperty from "@/registries/intellectual-property";
import culturalHeritage from "@/registries/cultural-heritage";
import enforcement from "@/registries/enforcement";
import notices from "@/registries/notices";
import infringements from "@/registries/infringements";

// External Relations
import governmentContacts from "@/registries/government-contacts";
import agreements from "@/registries/agreements";
import recordsRequests from "@/registries/records-requests";
import publicBodies from "@/registries/public-bodies";
import publicSafety from "@/registries/public-safety";
import recognitions from "@/registries/recognitions";

// Evidence & Custody
import evidence from "@/registries/evidence";
import incidents from "@/registries/incidents";

// Treasury & Obligations
import obligations from "@/registries/obligations";
import memberAccounts from "@/registries/member-accounts";
import procurement from "@/registries/procurement";

// Stewardship & Finance
import contributions from "@/registries/contributions";
import privacyRequests from "@/registries/privacy-requests";

/**
 * The registers of the Kingdom.
 *
 * To open a new register: add a definition file beside this one and list it
 * here. Nothing else needs to change — the list views, forms, search,
 * numbering, certification, access control, deadlines, and the hash chain are
 * all generic over RegistryDef.
 */
export const REGISTRIES: readonly RegistryDef[] = [
  instruments,
  tribunal,
  consents,
  permits,
  appointmentsElections,

  citizens,
  offices,
  vitalRecords,
  ordinations,
  households,
  benefits,

  credentialsIssued,

  realProperty,
  chattels,
  sacredSites,

  assetRegister,
  custody,
  entities,

  intellectualProperty,
  culturalHeritage,
  enforcement,
  notices,
  infringements,

  governmentContacts,
  publicBodies,
  agreements,
  recordsRequests,
  publicSafety,
  recognitions,

  evidence,
  incidents,

  obligations,
  memberAccounts,
  procurement,

  contributions,
  privacyRequests,
];

const BY_SLUG = new Map(REGISTRIES.map((registry) => [registry.slug, registry]));

export function getRegistry(slug: string): RegistryDef | undefined {
  return BY_SLUG.get(slug);
}

export function registriesInGroup(group: RegistryGroup): RegistryDef[] {
  return REGISTRIES.filter((registry) => registry.group === group).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title),
  );
}

export function groupedRegistries(): { group: RegistryGroup; registries: RegistryDef[] }[] {
  return REGISTRY_GROUPS.map((group) => ({ group, registries: registriesInGroup(group) })).filter(
    (entry) => entry.registries.length > 0,
  );
}

/**
 * Fail fast on a malformed registry set.
 *
 * These run at module load, so a defective definition takes the application
 * down at startup rather than issuing colliding record numbers for a year
 * before anyone notices. A loud failure at boot is cheap; a silent one that
 * corrupts a register is not.
 */
function assertRegistriesAreWellFormed(): void {
  const slugs = new Set<string>();
  const prefixes = new Map<string, string>();

  for (const registry of REGISTRIES) {
    if (slugs.has(registry.slug)) {
      throw new Error(`Duplicate registry slug: ${registry.slug}`);
    }
    slugs.add(registry.slug);

    const existing = prefixes.get(registry.numberPrefix);
    if (existing) {
      throw new Error(
        `Registries "${existing}" and "${registry.slug}" share the number prefix "${registry.numberPrefix}".`,
      );
    }
    prefixes.set(registry.numberPrefix, registry.slug);

    const fieldKeys = new Set<string>();
    for (const field of registry.fields) {
      if (fieldKeys.has(field.key)) {
        throw new Error(`Registry "${registry.slug}" declares field "${field.key}" twice.`);
      }
      fieldKeys.add(field.key);

      if ((field.type === "select" || field.type === "multiselect") && !field.options?.length) {
        throw new Error(
          `Registry "${registry.slug}" field "${field.key}" is a ${field.type} with no options.`,
        );
      }
    }

    for (const column of registry.listColumns) {
      if (!fieldKeys.has(column)) {
        throw new Error(
          `Registry "${registry.slug}" lists column "${column}", which is not one of its fields.`,
        );
      }
    }

    if (registry.titleField && !fieldKeys.has(registry.titleField)) {
      throw new Error(
        `Registry "${registry.slug}" names title field "${registry.titleField}", which does not exist.`,
      );
    }

    if (!registry.statuses.some((status) => status.value === registry.defaultStatus)) {
      throw new Error(
        `Registry "${registry.slug}" defaults to status "${registry.defaultStatus}", which it does not declare.`,
      );
    }

    // voidRecord and supersedeRecord set these statuses; a register that does
    // not declare them would render an unlabelled badge after either operation.
    for (const required of ["VOID", "SUPERSEDED"]) {
      if (!registry.statuses.some((status) => status.value === required)) {
        throw new Error(
          `Registry "${registry.slug}" does not declare a "${required}" status, which the record lifecycle sets.`,
        );
      }
    }

    for (const rule of registry.deadlineRules ?? []) {
      const field = registry.fields.find((candidate) => candidate.key === rule.fromField);
      if (!field) {
        throw new Error(
          `Registry "${registry.slug}" deadline rule "${rule.id}" reads field "${rule.fromField}", which does not exist.`,
        );
      }
      if (field.type !== "date") {
        throw new Error(
          `Registry "${registry.slug}" deadline rule "${rule.id}" reads "${rule.fromField}", which is a ${field.type} field, not a date.`,
        );
      }
    }
  }

  // Cross-registry references are checked after every slug is known, so order
  // of declaration does not matter.
  for (const registry of REGISTRIES) {
    for (const field of registry.fields) {
      if (field.type === "recordRef" && field.refRegistry && !slugs.has(field.refRegistry)) {
        throw new Error(
          `Registry "${registry.slug}" field "${field.key}" references register "${field.refRegistry}", which does not exist.`,
        );
      }
    }
  }
}

assertRegistriesAreWellFormed();
