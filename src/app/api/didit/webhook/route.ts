import { NextResponse } from "next/server";
import { recordDecision, verifyWebhook, isClaimStatus } from "@/lib/identity";

/**
 * Receive a verification decision from the identity verifier.
 *
 * This is the one endpoint in the register that an outside party can write
 * through, so it is written defensively and refuses on anything short of a
 * fully valid, freshly signed request:
 *
 *   - The raw body is read as text BEFORE parsing, because the signature is over
 *     the exact bytes sent. Parsing first and re-serialising would change the
 *     bytes and every signature would fail.
 *   - HMAC-SHA256 is compared in constant time, so the comparison cannot leak
 *     the expected signature one byte at a time.
 *   - A timestamp older than five minutes is refused, so a captured request
 *     cannot be replayed.
 *   - An unrecognised status is refused rather than stored, so the verifier
 *     inventing a new value can never be read as an approval.
 *
 * Unsigned requests are refused outright. If the webhook secret is not
 * configured, this endpoint fails closed — it does not fall back to trusting
 * whatever arrives.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed. An unconfigured secret must never mean "accept anything".
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Exact bytes, before any parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  const timestamp = request.headers.get("x-timestamp");

  if (!verifyWebhook(rawBody, signature, timestamp, secret)) {
    return NextResponse.json({ error: "Bad signature." }, { status: 401 });
  }

  let payload: { session_id?: unknown; status?: unknown; decision?: unknown };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const sessionId = typeof payload.session_id === "string" ? payload.session_id : null;
  if (!sessionId) {
    return NextResponse.json({ error: "No session." }, { status: 400 });
  }

  // The envelope carries a status; the decision object carries the detail. Take
  // the detail when present, and refuse anything whose status is not one of the
  // values this register knows.
  const decision =
    payload.decision && typeof payload.decision === "object"
      ? (payload.decision as Record<string, unknown>)
      : { status: payload.status };

  if (!isClaimStatus(decision.status)) {
    return NextResponse.json({ error: "Unrecognised status." }, { status: 400 });
  }

  try {
    await recordDecision(sessionId, decision);
  } catch (error) {
    // A claim we do not hold is not our problem, and not an error worth
    // retrying — answer 200 so the verifier stops resending it.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("No claim matches")) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    return NextResponse.json({ error: "Could not record decision." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
