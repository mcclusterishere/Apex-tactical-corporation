import { redirect } from "next/navigation";

/**
 * A clean, printable verification address.
 *
 * A credential card carries a URL that somebody has to be able to read off
 * paper and type into a phone. `/credentials/verify/ABCDE-FGHIJ` survives that;
 * `/credentials/verify?code=ABCDE-FGHIJ` does not — the query string is where
 * transcription goes wrong, and a query string in printed matter looks like an
 * error even when it is correct.
 *
 * The check itself lives in one place. This only normalises the code and hands
 * it over, so there is no second implementation to drift.
 */
export default async function VerifyByPathPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/credentials/verify?code=${encodeURIComponent(decodeURIComponent(code).trim())}`);
}
