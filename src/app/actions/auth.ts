"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  hashPassword,
  createSession,
  pruneSessions,
  getPrincipal,
  assertPermission,
  ANONYMOUS,
  checkThrottle,
  recordLoginAttempt,
  clearFailures,
  clientIp,
} from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { asRole, isRole } from "@/lib/authz";

export interface AuthState {
  error?: string;
  ok?: boolean;
  message?: string;
}

/**
 * Sign in.
 *
 * The failure message is identical whether the account does not exist, the
 * password is wrong, or the account has been deactivated. Distinguishing them
 * would let anyone enumerate which officers hold accounts, and the roll of
 * officers is not something to hand out at a login form.
 */
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  const ip = await clientIp();

  // Throttle before touching the password. Without this the sign-in form is an
  // unlimited password oracle for anyone who can reach the deployment.
  const throttle = await checkThrottle(email, ip);
  if (throttle.blocked) {
    await recordLoginAttempt(email, ip, false, "throttled");
    return { error: throttle.reason ?? "Too many attempts. Try again shortly." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run a verification, even with no user, so that a missing account and
  // a wrong password take the same amount of time.
  const stored =
    user?.passwordHash ??
    "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  const valid = await verifyPassword(password, stored);

  if (!user || !valid || !user.active) {
    const reason = user ? (user.active ? "Bad password" : "Account inactive") : "No such account";
    await recordLoginAttempt(email, ip, false, reason);
    await recordAudit(
      { ...ANONYMOUS, email, displayName: email || "unknown" },
      "auth.signin.failed",
      email,
      reason,
    );
    return { error: "Those credentials were not accepted." };
  }

  await recordLoginAttempt(email, ip, true);
  await clearFailures(email);

  // A session begins MFA-satisfied only when the officer has no second factor
  // enrolled. Where one exists it must be presented before the session can act.
  await createSession(user.id, { mfaSatisfied: user.totpSecretEnc === null });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await pruneSessions();
  await recordAudit(
    {
      ...ANONYMOUS,
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: asRole(user.role),
      officeTitle: user.officeTitle,
      mustResetPw: user.mustResetPw,
    },
    "auth.signin",
    user.email,
  );

  // Only same-origin relative paths, so a crafted `next` cannot bounce the
  // officer to an external site that imitates this one.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const principal = await getPrincipal();
  if (principal.id === "anonymous") return { error: "Sign in first." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 12) {
    return { error: "Choose a password of at least 12 characters. Longer is better than complex." };
  }
  if (next !== confirm) return { error: "The two new passwords do not match." };

  const user = await prisma.user.findUnique({ where: { id: principal.id } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "The current password was not accepted." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), mustResetPw: false },
  });
  // Every other session for this principal is invalidated: a password change is
  // frequently a response to a suspected compromise.
  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await recordAudit(principal, "auth.password.change", user.email);
  await createSession(user.id);

  return { ok: true, message: "Password changed. All other sessions have been signed out." };
}

export async function createPrincipalAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "user:manage");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Refused." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const officeTitle = String(formData.get("officeTitle") ?? "").trim();
  const role = String(formData.get("role") ?? "OBSERVER");
  const password = String(formData.get("password") ?? "");

  if (!email || !displayName) return { error: "Name and email are both required." };
  if (!isRole(role)) return { error: "That is not a recognised office." };
  if (password.length < 12) {
    return { error: "Set an initial password of at least 12 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A principal with that email already exists." };

  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      officeTitle: officeTitle || null,
      role,
      passwordHash: await hashPassword(password),
      mustResetPw: true,
    },
  });
  await recordAudit(principal, "principal.create", user.email, `Commissioned as ${role}`);

  return {
    ok: true,
    message: `${displayName} has been commissioned as ${role}. They must change the password at first sign-in.`,
  };
}

export async function setPrincipalActiveAction(
  userId: string,
  active: boolean,
): Promise<AuthState> {
  const principal = await getPrincipal();
  try {
    assertPermission(principal, "user:manage");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Refused." };
  }

  if (userId === principal.id && !active) {
    return { error: "You cannot deactivate your own account." };
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { active } });
  if (!active) {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await recordAudit(principal, active ? "principal.activate" : "principal.deactivate", user.email);
  return { ok: true, message: `${user.displayName} is now ${active ? "active" : "inactive"}.` };
}
