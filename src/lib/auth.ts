import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { asRole, clearanceOf, can, type Permission, type Role } from "@/lib/authz";
import type { Classification } from "@/lib/classification";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export const SESSION_COOKIE = "apex_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// scrypt rather than bcrypt/argon2: it is in the Node standard library, so there
// is no native module to fail to compile on a host we do not control. These
// parameters cost roughly 100ms per hash, which is the point.
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nRaw, rRaw, pRaw, saltB64, hashB64] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(hashB64, "base64");
  } catch {
    return false;
  }

  let derived: Buffer;
  try {
    derived = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
      N,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    });
  } catch {
    return false;
  }

  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/**
 * Sessions are opaque random tokens. Only the SHA-256 of the token is stored, so
 * a dump of the session table does not let the holder impersonate anyone. The
 * token itself is high-entropy and single-use per login, so a plain digest is
 * sufficient here — password hashing rules do not apply to random secrets.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface Principal {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  officeTitle: string | null;
  clearance: Classification;
  mustResetPw: boolean;
  /** Whether the principal has a second factor enrolled at all. */
  mfaEnrolled: boolean;
  /** Whether THIS session has presented it. A session that has not may read but not act. */
  mfaSatisfied: boolean;
  /** Whether the officer re-authenticated recently enough for a consequential act. */
  stepUpValid: boolean;
  sessionId: string | null;
}

export const ANONYMOUS: Principal = {
  id: "anonymous",
  email: "",
  displayName: "Public",
  role: "OBSERVER",
  officeTitle: null,
  clearance: "PUBLIC",
  mustResetPw: false,
  mfaEnrolled: false,
  mfaSatisfied: false,
  stepUpValid: false,
  sessionId: null,
};

/**
 * How long a step-up re-authentication remains valid.
 *
 * Long enough to complete a batch of related work, short enough that an
 * unattended screen does not stay authorised for a disbursement. Fifteen
 * minutes is the figure most systems settle on for the same reason.
 */
export const STEP_UP_TTL_MS = 15 * 60 * 1000;

export async function createSession(
  userId: string,
  options?: { mfaSatisfied?: boolean },
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const hdrs = await headers();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: hdrs.get("user-agent")?.slice(0, 400) ?? null,
      mfaAt: options?.mfaSatisfied ? new Date() : null,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolve the current principal, or ANONYMOUS when unauthenticated. */
export async function getPrincipal(): Promise<Principal> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return ANONYMOUS;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt.getTime() < Date.now() ||
    !session.user.active
  ) {
    return ANONYMOUS;
  }

  const role = asRole(session.user.role);
  const mfaEnrolled = session.user.totpSecretEnc !== null;
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    role,
    officeTitle: session.user.officeTitle,
    clearance: clearanceOf(role),
    mustResetPw: session.user.mustResetPw,
    mfaEnrolled,
    // A principal with no second factor enrolled is treated as satisfied, so
    // that enrolment can be adopted gradually rather than locking everyone out
    // the moment it ships. Enforcement of enrolment itself is a policy decision
    // surfaced in the interface, not a silent lockout here.
    mfaSatisfied: !mfaEnrolled || session.mfaAt !== null,
    stepUpValid:
      session.stepUpAt !== null &&
      Date.now() - session.stepUpAt.getTime() < STEP_UP_TTL_MS,
    sessionId: session.id,
  };
}

export function isAuthenticated(principal: Principal): boolean {
  return principal.id !== "anonymous";
}

/** Throw unless the principal holds `permission`. For use in server actions. */
export function assertPermission(principal: Principal, permission: Permission): void {
  if (!can(principal.role, permission)) {
    throw new Error(
      `Refused: the office of ${principal.role} does not carry the power "${permission}".`,
    );
  }
}

/** Remove expired and long-revoked sessions. Called opportunistically on login. */
export async function pruneSessions(): Promise<void> {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  await prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }] },
  });
}

/**
 * Throw unless this session has cleared its second factor.
 *
 * Read access does not require it — an officer who has typed their password can
 * see what they are cleared to see. Writing does. The split exists because the
 * realistic attack on a system like this is a stolen or reused password, and the
 * damage from a read is recoverable in a way that a forged register entry is not.
 */
export function assertMfa(principal: Principal): void {
  if (!isAuthenticated(principal)) {
    throw new Error("Sign in first.");
  }
  if (!principal.mfaSatisfied) {
    throw new Error(
      "This session has not presented your second factor. Confirm it from your account page before recording anything.",
    );
  }
}

/**
 * Throw unless the officer re-authenticated within the step-up window.
 *
 * Required for acts that move money, issue or revoke credentials, unseal
 * material, or alter signing keys — the ones where "I walked away from my desk"
 * is a plausible defence and the consequences are not reversible by an
 * amendment.
 */
export function assertStepUp(principal: Principal, act: string): void {
  assertMfa(principal);
  if (!principal.stepUpValid) {
    throw new Error(
      `${act} requires you to confirm your password again. Re-authenticate and repeat the action within ${Math.round(
        STEP_UP_TTL_MS / 60000,
      )} minutes.`,
    );
  }
}

/** Record a successful step-up against the current session. */
export async function markStepUp(sessionId: string): Promise<void> {
  await prisma.session.update({ where: { id: sessionId }, data: { stepUpAt: new Date() } });
}

/** Record that this session has presented its second factor. */
export async function markMfa(sessionId: string): Promise<void> {
  await prisma.session.update({ where: { id: sessionId }, data: { mfaAt: new Date() } });
}

// ---------------------------------------------------------------------------
// Sign-in throttling
// ---------------------------------------------------------------------------

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_THRESHOLD = 8;
const IP_THRESHOLD = 25;

export interface ThrottleVerdict {
  blocked: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

/**
 * Refuse a sign-in attempt when an account or an address has failed too often.
 *
 * Without this, a public deployment is an unlimited password oracle: an attacker
 * can try every common password against every officer's address at whatever rate
 * the server will serve. Counting failures per account AND per address matters —
 * per-account alone lets one address spray a single guess across many accounts,
 * which is how credential-stuffing actually works.
 *
 * Deliberately not a token bucket in memory: this must survive a restart and
 * work across processes, and the volume is low enough that a table is fine.
 */
export async function checkThrottle(email: string, ip: string | null): Promise<ThrottleVerdict> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);

  const [accountFailures, addressFailures] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email: email.toLowerCase(), success: false, createdAt: { gte: since } },
    }),
    ip
      ? prisma.loginAttempt.count({
          where: { ip, success: false, createdAt: { gte: since } },
        })
      : Promise.resolve(0),
  ]);

  if (accountFailures >= LOCKOUT_THRESHOLD) {
    return {
      blocked: true,
      reason:
        "Too many failed attempts against this account. It is locked for a short period. " +
        "If this was not you, change the password once you regain access.",
      retryAfterSeconds: Math.round(LOCKOUT_WINDOW_MS / 1000),
    };
  }
  if (addressFailures >= IP_THRESHOLD) {
    return {
      blocked: true,
      reason: "Too many failed attempts from this address.",
      retryAfterSeconds: Math.round(LOCKOUT_WINDOW_MS / 1000),
    };
  }
  return { blocked: false };
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean,
  reason?: string,
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: { email: email.toLowerCase().slice(0, 320), ip, success, reason: reason ?? null },
    });
    // Opportunistic pruning; the table is only useful for a short window.
    if (Math.random() < 0.02) {
      await prisma.loginAttempt.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      });
    }
  } catch (error) {
    console.error("[auth] failed to record login attempt", error);
  }
}

/** Clear the failure counter for an account after a successful sign-in. */
export async function clearFailures(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: { email: email.toLowerCase(), success: false },
  });
}

/** Current request's client address, as far as it can be trusted. */
export async function clientIp(): Promise<string | null> {
  try {
    const hdrs = await headers();
    // Behind Cloudflare, CF-Connecting-IP is set by the edge and is the value to
    // trust. X-Forwarded-For is client-controllable when nothing rewrites it, so
    // it is only a fallback.
    return (
      hdrs.get("cf-connecting-ip") ??
      hdrs.get("x-real-ip") ??
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null
    );
  } catch {
    return null;
  }
}
