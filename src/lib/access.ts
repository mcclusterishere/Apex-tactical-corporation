import { prisma } from "@/lib/db";
import { canView, type Classification } from "@/lib/classification";
import { can, asRole, type Permission, type Role } from "@/lib/authz";
import { getRegistry } from "@/registries";
import type { RegistryDef } from "@/registries/types";
import type { Principal } from "@/lib/auth";

/**
 * The single place a mutation is authorised.
 *
 * This module exists because of a real defect. Authorisation was previously
 * spread across each server action, and `restrictedTo` — the per-register
 * separation-of-duties control — was checked on only two of the eight paths
 * that mutate a record. The result was internally inconsistent: a Registrar
 * could VOID an entry in the sealed financial register but not AMEND the same
 * row, and a Clerk could insert the first link into an evidence custody chain
 * they were never meant to touch.
 *
 * Scattered authorisation always ends this way. Every check now lives here, and
 * every mutating action calls `assertCanMutate` before it does anything else.
 *
 * Two rules, applied together:
 *
 *   READ  — clearance must reach the record's classification, OR the principal's
 *           office is named in the register's `restrictedTo`. The second clause
 *           matters: the Treasurer keeps the sealed contributions register but
 *           holds only OFFICERS clearance, so without it the officer responsible
 *           for a register could not read it.
 *
 *   WRITE — the principal must hold the operation's permission AND, where the
 *           register declares `restrictedTo`, hold one of those offices. The
 *           Sovereign is never excluded by `restrictedTo`; that is deliberate
 *           and is the only bypass.
 */

export class AccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessError";
  }
}

interface RecordLike {
  id: string;
  registry: string;
  classification: string;
  recordNumber?: string;
}

/**
 * Whether a principal may read a record.
 *
 * Being named in a register's `restrictedTo` grants read access to that register
 * only — it is not a general clearance uplift. An officer trusted with the
 * financial register does not thereby gain access to discipline files.
 */
export function canReadRecord(
  principal: Principal,
  record: RecordLike,
  registry?: RegistryDef,
): boolean {
  if (canView(principal.clearance, record.classification)) return true;

  const definition = registry ?? getRegistry(record.registry);
  const role = asRole(principal.role);
  if (role === "SOVEREIGN") return true;
  return Boolean(definition?.restrictedTo?.includes(role));
}

/** The classifications a principal may read within one register. */
export function readableClassificationsFor(
  principal: Principal,
  registry: RegistryDef | undefined,
): Classification[] {
  const all: Classification[] = ["PUBLIC", "MEMBERS", "OFFICERS", "SEALED"];
  const role = asRole(principal.role);
  if (role === "SOVEREIGN") return all;
  if (registry?.restrictedTo?.includes(role)) return all;
  return all.filter((level) => canView(principal.clearance, level));
}

export interface MutateOptions {
  /** The global permission the operation requires. */
  permission: Permission;
  /** Human phrase naming the act, used in the refusal message. */
  act: string;
  /** Skip the read check — only for operations on a record not yet created. */
  skipReadCheck?: boolean;
}

/**
 * Authorise a mutation of an existing record. Throws AccessError on refusal.
 *
 * Every server action that changes a record, its attachments, its custody, its
 * holds, or its relations must call this. The signature deliberately requires
 * the record so that no caller can authorise an act "in general" and then apply
 * it to a row they were not entitled to touch.
 */
export async function assertCanMutate(
  principal: Principal,
  recordId: string,
  options: MutateOptions,
): Promise<{ record: RecordLike & { voidedAt: Date | null }; registry: RegistryDef }> {
  if (principal.id === "anonymous") {
    throw new AccessError("Sign in first.");
  }

  const record = await prisma.record.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      registry: true,
      classification: true,
      recordNumber: true,
      voidedAt: true,
    },
  });
  if (!record) throw new AccessError("No such record.");

  const registry = getRegistry(record.registry);
  if (!registry) throw new AccessError("No such register.");

  // Read first: a principal who cannot see a record must not learn of its
  // existence through a write refusal that distinguishes "forbidden" from
  // "not found".
  if (!options.skipReadCheck && !canReadRecord(principal, record, registry)) {
    throw new AccessError("No such record.");
  }

  if (!can(principal.role, options.permission)) {
    throw new AccessError(
      `Refused: the office of ${principal.role} does not carry the power to ${options.act}.`,
    );
  }

  assertRegistryWrite(principal, registry, options.act);

  return { record, registry };
}

/**
 * Enforce a register's `restrictedTo` for a write.
 *
 * Separated so it can also gate creation, where there is no record yet.
 */
export function assertRegistryWrite(
  principal: Principal,
  registry: RegistryDef,
  act: string,
): void {
  const role = asRole(principal.role);
  if (role === "SOVEREIGN") return;

  if (registry.restrictedTo && registry.restrictedTo.length > 0) {
    if (!registry.restrictedTo.includes(role)) {
      throw new AccessError(
        `Refused: the ${registry.title} is kept by ${formatRoles(registry.restrictedTo)}. ` +
          `The office of ${role} may not ${act} in it. This separation is deliberate — ` +
          "see the register's guidance.",
      );
    }
  }
}

function formatRoles(roles: readonly Role[]): string {
  const labels = roles.map((role) => role.toLowerCase());
  if (labels.length === 1) return `the ${labels[0]}`;
  return `the ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * Refuse a mutation while the record is under an unreleased legal hold.
 *
 * Previously only voiding was blocked. Amendment was not — which defeats the
 * point: a hold exists to freeze a record's state while a dispute is live, and
 * rewriting the content of a held record is exactly the spoliation the hold was
 * issued to prevent. Reclassifying it is the same problem in a different field.
 */
export async function assertNotHeld(recordId: string, act: string): Promise<void> {
  const holds = await prisma.legalHold.findMany({
    where: { recordId, releasedAt: null },
    select: { matter: true },
  });
  if (holds.length === 0) return;

  const matters = holds.map((hold) => hold.matter).join("; ");
  throw new AccessError(
    `Refused: this record is under legal hold (${matters}). It cannot be ${act} while the ` +
      "hold stands. If the change is genuinely necessary, release the hold first and record why — " +
      "altering held material is the spoliation the hold exists to prevent.",
  );
}

/**
 * A principal who has not changed an issued password may read but not act.
 *
 * The initial password was chosen by whoever commissioned the account and has
 * almost certainly travelled through an inbox. Attribution in the ledger is
 * worth nothing while two people know the credential.
 */
export function assertPasswordChanged(principal: Principal): void {
  if (principal.mustResetPw) {
    throw new AccessError(
      "This account is still using the password it was issued with. Change it from your account " +
        "page before recording anything — every act is attributed to you, and attribution means " +
        "nothing while someone else knows your password.",
    );
  }
}
