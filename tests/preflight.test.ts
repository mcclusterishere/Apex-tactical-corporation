import { inspectEnvironment, preflight, PreflightError } from "@/lib/preflight";

let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => { c ? pass++ : fail++; if (!c) console.log("  FAIL:", n); };

// A filesystem that always answers "yes", so storage findings do not contaminate
// the assertions about everything else. Individual cases override it.
const goodFs = { exists: () => true, writable: () => true };

const STRONG = "8Wq2fJ4nR7tYvB1cX0mZ6aL3sK9pD5gH2uE8iO4rT7yN";

function findings(env: Record<string, string | undefined>, fs = goodFs) {
  return inspectEnvironment(env as NodeJS.ProcessEnv, fs);
}
function keys(env: Record<string, string | undefined>, severity?: string, fs = goodFs) {
  return findings(env, fs)
    .filter((f) => !severity || f.severity === severity)
    .map((f) => f.key);
}

const PROD = { NODE_ENV: "production", DATABASE_URL: "file:../data/ledger.db", APEX_MASTER_KEY: STRONG, APEX_PUBLIC_ORIGIN: "https://registry.example" };
const DEV = { NODE_ENV: "development", DATABASE_URL: "file:../data/ledger.db" };

// --- the master key ---------------------------------------------------------
ok("production without a master key is fatal",
  keys({ ...PROD, APEX_MASTER_KEY: undefined }, "fatal").includes("APEX_MASTER_KEY"));

ok("development without a master key is only a warning",
  keys({ ...DEV }, "fatal").length === 0 &&
  keys({ ...DEV }, "warning").includes("APEX_MASTER_KEY"));

ok("a short master key is fatal in production",
  keys({ ...PROD, APEX_MASTER_KEY: "tooshort" }, "fatal").includes("APEX_MASTER_KEY"));

ok("31 characters is still too short",
  keys({ ...PROD, APEX_MASTER_KEY: "a".repeat(31) }, "fatal").includes("APEX_MASTER_KEY"));

ok("32 characters is accepted",
  !keys({ ...PROD, APEX_MASTER_KEY: "a".repeat(32) }, "fatal").includes("APEX_MASTER_KEY"));

ok("a key copied from documentation is refused",
  keys({ ...PROD, APEX_MASTER_KEY: "changeme-changeme-changeme-changeme" }, "fatal")
    .includes("APEX_MASTER_KEY"));

ok("a key beginning 'example' is refused",
  keys({ ...PROD, APEX_MASTER_KEY: "example-key-that-is-long-enough-to-pass" }, "fatal")
    .includes("APEX_MASTER_KEY"));

ok("a strong key raises nothing",
  !keys({ ...PROD }).includes("APEX_MASTER_KEY"));

// --- the database -----------------------------------------------------------
ok("a missing DATABASE_URL is fatal even in development",
  keys({ ...DEV, DATABASE_URL: undefined }, "fatal").includes("DATABASE_URL"));

ok("SQLite in production warns but does not refuse",
  keys({ ...PROD }, "fatal").length === 0 &&
  keys({ ...PROD }, "warning").includes("DATABASE_URL"));

ok("SQLite in development says nothing",
  !keys({ ...DEV, APEX_MASTER_KEY: STRONG }).includes("DATABASE_URL"));

ok("postgres without sslmode warns in production",
  keys({ ...PROD, DATABASE_URL: "postgresql://u:p@h:5432/apex" }, "warning")
    .includes("DATABASE_URL"));

ok("postgres with sslmode=require is clean",
  !keys({ ...PROD, DATABASE_URL: "postgresql://u:p@h:5432/apex?sslmode=require" })
    .includes("DATABASE_URL"));

ok("postgres with sslmode=verify-full is clean",
  !keys({ ...PROD, DATABASE_URL: "postgres://u:p@h:5432/apex?sslmode=verify-full" })
    .includes("DATABASE_URL"));

// --- the evidence store -----------------------------------------------------
ok("a storage directory that cannot be created is fatal in production",
  keys(PROD, "fatal", { exists: () => false, writable: () => false }).includes("STORAGE_DIR"));

ok("an unwritable storage directory is fatal in production",
  keys(PROD, "fatal", { exists: () => true, writable: () => false }).includes("STORAGE_DIR"));

ok("an unwritable storage directory is only a warning in development",
  keys({ ...DEV, APEX_MASTER_KEY: STRONG }, "fatal", { exists: () => true, writable: () => false })
    .length === 0);

// --- the public origin ------------------------------------------------------
ok("production without a public origin warns",
  keys({ ...PROD, APEX_PUBLIC_ORIGIN: undefined }, "warning").includes("APEX_PUBLIC_ORIGIN"));

ok("an origin carrying a path is refused as malformed",
  keys({ ...PROD, APEX_PUBLIC_ORIGIN: "https://registry.example/office" }, "warning")
    .includes("APEX_PUBLIC_ORIGIN"));

ok("plaintext http in production warns",
  keys({ ...PROD, APEX_PUBLIC_ORIGIN: "http://registry.example" }, "warning")
    .includes("APEX_PUBLIC_ORIGIN"));

ok("http on localhost in development is fine",
  !keys({ ...DEV, APEX_MASTER_KEY: STRONG, APEX_PUBLIC_ORIGIN: "http://localhost:3000" })
    .includes("APEX_PUBLIC_ORIGIN"));

// --- the whole check --------------------------------------------------------
{
  // A well-formed production environment must not throw.
  let threw = false;
  try {
    preflight({ ...PROD, DATABASE_URL: "postgresql://u:p@h:5432/apex?sslmode=require" } as NodeJS.ProcessEnv);
  } catch { threw = true; }
  ok("a sound production environment starts", !threw);
}

{
  // The failure this whole module exists to prevent.
  let error: unknown = null;
  try {
    preflight({ ...PROD, APEX_MASTER_KEY: undefined } as NodeJS.ProcessEnv);
  } catch (e) { error = e; }
  ok("a production environment with no master key refuses to start", error instanceof PreflightError);
  ok("and names the variable in the message",
    error instanceof Error && error.message.includes("APEX_MASTER_KEY"));
  ok("and tells the operator what to type",
    error instanceof Error && error.message.includes("openssl rand"));
}

console.log(`preflight: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
