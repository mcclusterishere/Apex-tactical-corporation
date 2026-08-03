import type { RegistryDef, RegistryGroup } from "@/registries/types";
import { REGISTRY_GROUPS } from "@/registries/types";

import instruments from "@/registries/instruments";
import tribunal from "@/registries/tribunal";
import consents from "@/registries/consents";

import citizens from "@/registries/citizens";
import offices from "@/registries/offices";
import vitalRecords from "@/registries/vital-records";
import ordinations from "@/registries/ordinations";

import realProperty from "@/registries/real-property";
import chattels from "@/registries/chattels";
import sacredSites from "@/registries/sacred-sites";

import intellectualProperty from "@/registries/intellectual-property";
import culturalHeritage from "@/registries/cultural-heritage";
import enforcement from "@/registries/enforcement";
import notices from "@/registries/notices";
import infringements from "@/registries/infringements";

import governmentContacts from "@/registries/government-contacts";
import agreements from "@/registries/agreements";
import recordsRequests from "@/registries/records-requests";

import evidence from "@/registries/evidence";

import contributions from "@/registries/contributions";
import privacyRequests from "@/registries/privacy-requests";

/**
 * The registers of the Kingdom.
 *
 * To open a new register: add a definition file beside this one and list it
 * here. Nothing else needs to change — the list views, forms, search,
 * numbering, certification, access control, and the hash chain are all generic
 * over RegistryDef.
 */
export const REGISTRIES: readonly RegistryDef[] = [
  instruments,
  tribunal,
  consents,

  citizens,
  offices,
  vitalRecords,
  ordinations,

  realProperty,
  chattels,
  sacredSites,

  intellectualProperty,
  culturalHeritage,
  enforcement,
  notices,
  infringements,

  governmentContacts,
  agreements,
  recordsRequests,

  evidence,

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
 * Fail fast on a malformed registry set. A duplicate number prefix would issue
 * colliding record numbers across two registers, which is the kind of defect
 * that is invisible until it has corrupted a year of filings.
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
}

assertRegistriesAreWellFormed();
