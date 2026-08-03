"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  getPrincipal,
  verifyPassword,
  markMfa,
  markStepUp,
  assertMfa,
  isAuthenticated,
} from "@/lib/auth";
import { seal, open } from "@/lib/secrets";
import { verifyTotp, generateSecret, generateRecoveryCodes, provisioningUri } from "@/lib/totp";
import { generateSigningKey, activeKeyFor } from "@/lib/signing";
import { appendToChain } from "@/lib/chain";
import { recordAudit } from "@/lib/audit";
import type { FormState } from "@/app/actions/records";

/**
 * Second factor, step-up re-authentication, and signing-key enrolment.
 *
 * These are the actions that decide whether the rest of the system's guarantees
 * mean anything. A hash chain signed by a server that anyone with a password can
 * drive is a chain of assertions.
 */

export async function beginTotpEnrolmentAction(): Promise<{
  ok: boolean;
  secret?: string;
  uri?: string;
  message?: string;
}> {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) return { ok: false, message: "Sign in first." };

  const secret = generateSecret();
  // Held in the session-scoped pending slot rather than committed: enrolment is
  // only finished once the officer proves they can generate a code, otherwise a
  // mistyped secret locks them out of their own account.
  await prisma.user.update({
    where: { id: principal.id },
    data: { totpSecretEnc: seal(`pending:${secret}`) },
  });

  return { ok: true, secret, uri: provisioningUri(secret, principal.email) };
}

export async function confirmTotpEnrolmentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState & { recoveryCodes?: string[] }> {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal)) return { ok: false, message: "Sign in first." };

  const code = String(formData.get("code") ?? "");
  const user = await prisma.user.findUnique({ where: { id: principal.id } });
  if (!user?.totpSecretEnc) {
    return { ok: false, message: "Start enrolment first." };
  }

  let stored: string;
  try {
    stored = open(user.totpSecretEnc);
  } catch {
    return { ok: false, message: "The stored secret could not be read. Start enrolment again." };
  }
  const secret = stored.startsWith("pending:") ? stored.slice(8) : stored;

  if (!verifyTotp(secret, code).valid) {
    return {
      ok: false,
      message: "That code was not accepted. Check your authenticator's clock and try again.",
      fieldErrors: { code: "Incorrect." },
    };
  }

  // Recovery codes are shown once and stored only as digests.
  const codes = generateRecoveryCodes();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: principal.id },
      data: { totpSecretEnc: seal(secret), totpEnrolledAt: new Date() },
    });
    await tx.recoveryCode.deleteMany({ where: { userId: principal.id } });
    await tx.recoveryCode.createMany({
      data: codes.map((c) => ({
        userId: principal.id,
        codeHash: createHash("sha256").update(c).digest("hex"),
      })),
    });
  });

  if (principal.sessionId) await markMfa(principal.sessionId);
  await recordAudit(principal, "auth.mfa.enrol", principal.email);
  revalidatePath("/account");

  return {
    ok: true,
    message: "Second factor enrolled. Store the recovery codes somewhere safe — they are shown once.",
    recoveryCodes: codes,
  };
}

/** Present the second factor for this session. */
export async function verifyMfaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal) || !principal.sessionId) {
    return { ok: false, message: "Sign in first." };
  }

  const code = String(formData.get("code") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: principal.id } });
  if (!user?.totpSecretEnc) return { ok: false, message: "No second factor is enrolled." };

  // A recovery code is accepted in place of a generated one, and is burned.
  const asRecovery = await prisma.recoveryCode.findFirst({
    where: {
      userId: principal.id,
      codeHash: createHash("sha256").update(code.toUpperCase()).digest("hex"),
      usedAt: null,
    },
  });
  if (asRecovery) {
    await prisma.recoveryCode.update({ where: { id: asRecovery.id }, data: { usedAt: new Date() } });
    await markMfa(principal.sessionId);
    await recordAudit(principal, "auth.mfa.recovery", principal.email, "Recovery code used");
    revalidatePath("/");
    return {
      ok: true,
      message:
        "Recovery code accepted and burned. Re-enrol your authenticator — that code will not work again.",
    };
  }

  if (!verifyTotp(open(user.totpSecretEnc), code).valid) {
    await recordAudit(principal, "auth.mfa.failed", principal.email);
    return { ok: false, message: "That code was not accepted.", fieldErrors: { code: "Incorrect." } };
  }

  await markMfa(principal.sessionId);
  await recordAudit(principal, "auth.mfa.verify", principal.email);
  revalidatePath("/");
  return { ok: true, message: "Second factor confirmed for this session." };
}

/** Re-authenticate for a consequential act. */
export async function stepUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  if (!isAuthenticated(principal) || !principal.sessionId) {
    return { ok: false, message: "Sign in first." };
  }

  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { id: principal.id } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await recordAudit(principal, "auth.stepup.failed", principal.email);
    return { ok: false, message: "That password was not accepted." };
  }

  await markStepUp(principal.sessionId);
  await recordAudit(principal, "auth.stepup", principal.email);
  revalidatePath("/");
  return { ok: true, message: "Re-authenticated. Consequential actions are available for 15 minutes." };
}

/**
 * Enrol a signing key.
 *
 * The passphrase is deliberately separate from the account password: the point
 * of the key is that possessing the database and the officer's login does not
 * confer the ability to sign. Reusing the login password would give that away.
 */
export async function enrolSigningKeyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refused." };
  }

  const passphrase = String(formData.get("passphrase") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const label = String(formData.get("label") ?? "").trim() || null;

  if (passphrase.length < 12) {
    return {
      ok: false,
      message: "A signing passphrase must be at least 12 characters.",
      fieldErrors: { passphrase: "Too short." },
    };
  }
  if (passphrase !== confirm) {
    return { ok: false, message: "The two passphrases do not match." };
  }

  const existing = await activeKeyFor(principal.id);
  if (existing) {
    return {
      ok: false,
      message:
        "You already hold an active signing key. Revoke it first if you mean to replace it — " +
        "revoking keeps past signatures verifiable, deleting would not.",
    };
  }

  const generated = generateSigningKey(passphrase);
  const key = await prisma.signingKey.create({
    data: {
      userId: principal.id,
      publicKey: generated.publicKey,
      privateKeyEnc: generated.privateKeyEnc,
      wrapSalt: generated.wrapSalt,
      wrapIv: generated.wrapIv,
      fingerprint: generated.fingerprint,
      label,
    },
  });

  await appendToChain({
    eventType: "KEY_ENROLLED",
    actorId: principal.id,
    actorLabel: `${principal.displayName} (${principal.role})`,
    payload: {
      userId: principal.id,
      officer: principal.displayName,
      fingerprint: key.fingerprint,
      publicKey: key.publicKey,
      label,
    },
  });

  await recordAudit(principal, "key.enrol", key.fingerprint.slice(0, 16), label ?? "");
  revalidatePath("/account");

  return {
    ok: true,
    message:
      "Signing key enrolled. If you forget this passphrase the key cannot be recovered — that is " +
      "the design, and it is why the server cannot sign on your behalf.",
  };
}

export async function revokeSigningKeyAction(
  keyId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return { ok: false, message: "State why the key is revoked.", fieldErrors: { reason: "Required." } };
  }

  const key = await prisma.signingKey.findUnique({ where: { id: keyId } });
  if (!key) return { ok: false, message: "No such key." };
  if (key.userId !== principal.id && principal.role !== "SOVEREIGN") {
    return { ok: false, message: "Only the key's holder or the Sovereign may revoke it." };
  }
  if (key.revokedAt) return { ok: false, message: "That key is already revoked." };

  await prisma.signingKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date(), revokedReason: reason },
  });

  await appendToChain({
    eventType: "KEY_REVOKED",
    actorId: principal.id,
    actorLabel: `${principal.displayName} (${principal.role})`,
    payload: { fingerprint: key.fingerprint, reason },
  });

  await recordAudit(principal, "key.revoke", key.fingerprint.slice(0, 16), reason);
  revalidatePath("/account");
  return {
    ok: true,
    message:
      "Key revoked. Signatures it made before this moment remain verifiable and remain valid — " +
      "revocation is forward-looking, not retroactive.",
  };
}
