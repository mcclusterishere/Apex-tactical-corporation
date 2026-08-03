/**
 * Record classification.
 *
 * Four levels, ordered. A principal may see a record when their clearance rank
 * is at least the record's rank.
 *
 * SEALED exists because some material genuinely must not circulate even among
 * officers: church discipline files, the personal data of minors, counsel's work
 * product, ceremonial knowledge held under cultural protocol. A single "private"
 * flag collapses those distinctions and invites over-disclosure.
 */

export const CLASSIFICATIONS = ["PUBLIC", "MEMBERS", "OFFICERS", "SEALED"] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

const RANK: Record<Classification, number> = {
  PUBLIC: 0,
  MEMBERS: 1,
  OFFICERS: 2,
  SEALED: 3,
};

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  PUBLIC: "Public",
  MEMBERS: "Members",
  OFFICERS: "Officers",
  SEALED: "Sealed",
};

export const CLASSIFICATION_DESCRIPTIONS: Record<Classification, string> = {
  PUBLIC:
    "Open to the world. Appears in the public register and is citable by outside parties.",
  MEMBERS: "Visible to enrolled citizens and affiliates of the Kingdom.",
  OFFICERS: "Visible to commissioned officers of the Kingdom only.",
  SEALED:
    "Restricted to the Sovereign, the Registrar, and any principal expressly named. Not disclosed without a written order.",
};

export function classificationRank(value: string): number {
  return RANK[value as Classification] ?? RANK.SEALED;
}

export function isClassification(value: string): value is Classification {
  return (CLASSIFICATIONS as readonly string[]).includes(value);
}

/** Whether a clearance level is sufficient to view material at `required`. */
export function canView(clearance: Classification, required: string): boolean {
  return classificationRank(clearance) >= classificationRank(required);
}
