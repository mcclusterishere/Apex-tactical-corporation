/**
 * Runs once, before the first request is served.
 *
 * The only thing here is the configuration preflight, and it is deliberately
 * the first thing that happens: a deployment missing its master key should fail
 * in front of the operator who deployed it, not in front of an officer half-way
 * through enrolling a second factor.
 *
 * Note the explicit `process.exit`. Next.js logs a throwing instrumentation
 * hook and then carries on serving — the process stays up, binds its port, and
 * answers 200. That is the worst available outcome: a load balancer health
 * check passes, traffic is routed to an instance that cannot seal a secret, and
 * the failure surfaces one officer at a time. A misconfigured deployment must
 * be visibly dead, not quietly broken.
 */
export async function register(): Promise<void> {
  // Node runtime only. The edge runtime has no filesystem to probe and does not
  // run the code paths preflight is protecting.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { preflight, PreflightError } = await import("@/lib/preflight");

  try {
    preflight();
  } catch (error) {
    if (error instanceof PreflightError) {
      console.error(`\n[preflight] ${error.message}`);
      console.error(
        "See .env.example for what each of these is and why it matters.\n" +
          "Nothing has been written and no request has been served.\n",
      );
      // Fail closed. `next build` loads this hook too, and a build that cannot
      // produce a runnable deployment should likewise stop rather than emit one.
      process.exit(1);
    }
    throw error;
  }
}
