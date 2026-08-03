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
}

export const ANONYMOUS: Principal = {
  id: "anonymous",
  email: "",
  displayName: "Public",
  role: "OBSERVER",
  officeTitle: null,
  clearance: "PUBLIC",
  mustResetPw: false,
};

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const hdrs = await headers();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: hdrs.get("user-agent")?.slice(0, 400) ?? null,
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
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    role,
    officeTitle: session.user.officeTitle,
    clearance: clearanceOf(role),
    mustResetPw: session.user.mustResetPw,
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
