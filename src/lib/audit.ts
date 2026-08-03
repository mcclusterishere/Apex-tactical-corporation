import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import type { Principal } from "@/lib/auth";

/**
 * The audit log answers "who looked and who touched", which is a different
 * question from the one the hash chain answers ("what did the Kingdom do").
 *
 * Both are needed. The chain proves the register was not rewritten. The audit
 * log shows that sealed material was accessed by a particular officer at a
 * particular time — which is what you need when the question is not whether a
 * record was altered but whether it leaked.
 *
 * Audit writes never block or fail the operation they describe. A logging fault
 * that rolls back a legitimate filing would be worse than the gap in the log.
 */
export async function recordAudit(
  principal: Principal,
  action: string,
  subject?: string | null,
  detail?: string | null,
): Promise<void> {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const hdrs = await headers();
      ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      userAgent = hdrs.get("user-agent")?.slice(0, 400) ?? null;
    } catch {
      // Outside a request context (scripts, seeds). Not an error.
    }

    await prisma.auditEvent.create({
      data: {
        actorId: principal.id === "anonymous" ? null : principal.id,
        actorLabel: `${principal.displayName} (${principal.role})`,
        action,
        subject: subject ?? null,
        detail: detail?.slice(0, 2000) ?? null,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("[audit] failed to write audit event", { action, subject, error });
  }
}

/** Log access to material above member level. Called from sealed/officer views. */
export async function recordAccess(
  principal: Principal,
  subject: string,
  classification: string,
): Promise<void> {
  if (classification === "PUBLIC" || classification === "MEMBERS") return;
  await recordAudit(principal, "record.view", subject, `Classification: ${classification}`);
}
