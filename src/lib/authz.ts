import type { Classification } from "@/lib/classification";

/**
 * Offices and their powers.
 *
 * Roles are named for the offices the Charter contemplates (Art. IV §3, Art. VII
 * §2) rather than for generic software tiers, so that a commission issued on
 * paper and an account in this system describe the same thing.
 *
 * Separation of duties is deliberate. The Registrar records; Counsel prosecutes
 * rights; the Treasurer handles funds; the Auditor can read everything but write
 * nothing. Concentrating all of these in one login defeats the point of keeping
 * a ledger at all — a record nobody but the author can contradict is not a
 * record, it is a diary.
 */

export const ROLES = [
  "SOVEREIGN",
  "REGISTRAR",
  "COUNSEL",
  "TREASURER",
  "CLERK",
  "AUDITOR",
  "MEMBER",
  "OBSERVER",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SOVEREIGN: "Sovereign / Founder",
  REGISTRAR: "Registrar General",
  COUNSEL: "Counsel to the Kingdom",
  TREASURER: "Treasurer",
  CLERK: "Clerk of the Register",
  AUDITOR: "Auditor",
  MEMBER: "Citizen / Member",
  OBSERVER: "Observer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SOVEREIGN:
    "Full authority under Charter Art. VII. May promulgate instruments, seal and unseal records, release legal holds, and administer principals.",
  REGISTRAR:
    "Keeper of the registers. Records, amends, certifies, and anchors the chain. Cannot alter its own audit trail.",
  COUNSEL:
    "Conducts rights enforcement. Manages the enforcement docket, issues legal holds, and handles evidence.",
  TREASURER:
    "Maintains the financial stewardship register and issues contribution acknowledgements.",
  CLERK: "Enters and amends records in assigned registers. No sealing, no holds, no anchoring.",
  AUDITOR:
    "Read-only across all classifications including sealed material. Writes nothing. Exists so the ledger can be checked by someone who cannot change it.",
  MEMBER: "Enrolled citizen. Reads public and member-level records.",
  OBSERVER: "Public visitor. Reads public records and verifies certificates.",
};

export const PERMISSIONS = [
  "record:create",
  "record:amend",
  "record:void",
  "record:seal",
  "record:certify",
  "attachment:add",
  "custody:log",
  "hold:issue",
  "hold:release",
  "deadline:manage",
  "chain:anchor",
  "gazette:publish",
  "user:manage",
  "audit:read",
  "registry:financial",
  "registry:enforcement",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const GRANTS: Record<Role, readonly Permission[]> = {
  SOVEREIGN: PERMISSIONS,
  REGISTRAR: [
    "record:create",
    "record:amend",
    "record:void",
    "record:seal",
    "record:certify",
    "attachment:add",
    "custody:log",
    "hold:issue",
    "deadline:manage",
    "chain:anchor",
    "gazette:publish",
    "audit:read",
  ],
  COUNSEL: [
    "record:create",
    "record:amend",
    "record:certify",
    "attachment:add",
    "custody:log",
    "hold:issue",
    "deadline:manage",
    "registry:enforcement",
    "audit:read",
  ],
  TREASURER: [
    "record:create",
    "record:amend",
    "attachment:add",
    "deadline:manage",
    "registry:financial",
  ],
  CLERK: ["record:create", "record:amend", "attachment:add"],
  AUDITOR: ["audit:read"],
  MEMBER: [],
  OBSERVER: [],
};

const CLEARANCE: Record<Role, Classification> = {
  SOVEREIGN: "SEALED",
  REGISTRAR: "SEALED",
  AUDITOR: "SEALED",
  COUNSEL: "OFFICERS",
  TREASURER: "OFFICERS",
  CLERK: "OFFICERS",
  MEMBER: "MEMBERS",
  OBSERVER: "PUBLIC",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function asRole(value: string | null | undefined): Role {
  return value && isRole(value) ? value : "OBSERVER";
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  return GRANTS[asRole(role)].includes(permission);
}

export function clearanceOf(role: string | null | undefined): Classification {
  return CLEARANCE[asRole(role)];
}

export function permissionsOf(role: string | null | undefined): readonly Permission[] {
  return GRANTS[asRole(role)];
}

/**
 * Roles that may enter records in a given registry. A registry may declare
 * `restrictedTo` to keep, say, the financial register out of general hands.
 */
export function canWriteRegistry(
  role: string | null | undefined,
  restrictedTo?: readonly Role[],
): boolean {
  const actual = asRole(role);
  if (!can(actual, "record:create") && !can(actual, "record:amend")) return false;
  if (!restrictedTo || restrictedTo.length === 0) return true;
  return restrictedTo.includes(actual) || actual === "SOVEREIGN";
}
