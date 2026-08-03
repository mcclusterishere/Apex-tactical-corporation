import { headers } from "next/headers";

/**
 * The address a stranger uses to check the Kingdom's work.
 *
 * This matters more than it looks. A certified extract is worth attaching to a
 * demand letter only because the recipient can verify it without the Kingdom's
 * cooperation. A certificate that prints "/verify/AK-INST-000001" tells them
 * nothing about *where*, and one that prints "localhost:3000" because the
 * process was behind a proxy tells them something false.
 *
 * `APEX_PUBLIC_ORIGIN` is therefore the authority when set. The request headers
 * are only a fallback, and they are attacker-controlled — a `Host` header is
 * whatever the client sent — so they are used for convenience in development
 * and never trusted to be right.
 */

const CONFIGURED = process.env.APEX_PUBLIC_ORIGIN?.replace(/\/+$/, "") || null;

/** The configured public origin, or null if the deployment has not declared one. */
export function configuredOrigin(): string | null {
  return CONFIGURED && /^https?:\/\/[^/]+$/.test(CONFIGURED) ? CONFIGURED : null;
}

/**
 * Best-effort origin for the current request.
 *
 * Prefers the configured value; falls back to forwarded headers. Callers that
 * are producing a durable artefact — a printed certificate, a credential — should
 * use `publicUrl`, which is honest about not knowing.
 */
export async function requestOrigin(): Promise<string | null> {
  const configured = configuredOrigin();
  if (configured) return configured;

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return null;
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    // Called outside a request scope (a script, a build-time render).
    return null;
  }
}

/**
 * An absolute verification address for a printed document, or the bare path if
 * the deployment has not declared where it lives.
 *
 * Returning the path rather than guessing is deliberate: a wrong address on a
 * certificate is worse than an incomplete one, because the recipient who tries
 * it and fails concludes the whole document is fabricated.
 */
export async function publicUrl(path: string): Promise<string> {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  const origin = await requestOrigin();
  return origin ? `${origin}${normalised}` : normalised;
}
