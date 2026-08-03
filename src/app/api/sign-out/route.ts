import { NextResponse } from "next/server";
import { destroySession, getPrincipal } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const principal = await getPrincipal();
  if (principal.id !== "anonymous") {
    await recordAudit(principal, "auth.signout", principal.email);
  }
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
