import { existsSync, accessSync, constants } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Startup configuration checks.
 *
 * A misconfigured deployment should fail at boot, loudly, in front of whoever
 * deployed it — not four hours later in front of an officer half-way through
 * enrolling their second factor. That is not a hypothetical: this module exists
 * because an unset `APEX_MASTER_KEY` produced exactly that failure, and the
 * symptom (a button that does nothing) gave no hint of the cause.
 *
 * The rule for what belongs here: a check belongs in preflight if the
 * consequence of getting it wrong is discovered by a user rather than by the
 * operator. Everything else belongs in the code path that needs it.
 */

export type Severity = "fatal" | "warning";

export interface Finding {
  readonly severity: Severity;
  readonly key: string;
  readonly message: string;
  /** What the operator should actually type. */
  readonly remedy?: string;
}

export class PreflightError extends Error {
  readonly findings: readonly Finding[];
  constructor(findings: readonly Finding[]) {
    super(
      `Refusing to start: ${findings.length} configuration ${
        findings.length === 1 ? "problem" : "problems"
      }.\n\n` +
        findings
          .map((f) => `  ${f.key}\n    ${f.message}${f.remedy ? `\n    → ${f.remedy}` : ""}`)
          .join("\n\n") +
        "\n",
    );
    this.name = "PreflightError";
    this.findings = findings;
  }
}

/**
 * Inspect an environment and report what is wrong with it.
 *
 * Pure over its inputs so it can be tested against hypothetical environments
 * rather than only the one the tests happen to run in. `fsProbe` is injected for
 * the same reason.
 */
export function inspectEnvironment(
  env: NodeJS.ProcessEnv,
  fsProbe: {
    exists: (path: string) => boolean;
    writable: (path: string) => boolean;
  } = {
    exists: (path) => existsSync(path),
    writable: (path) => {
      try {
        accessSync(path, constants.W_OK);
        return true;
      } catch {
        return false;
      }
    },
  },
): Finding[] {
  const findings: Finding[] = [];
  const production = env.NODE_ENV === "production";
  const fatalInProduction: Severity = production ? "fatal" : "warning";

  // --- The master key ------------------------------------------------------
  // Everything sealed in the database is sealed under this. Losing it loses
  // every TOTP secret and every sealed field value irrecoverably, and changing
  // it has the same effect as losing it. It is the single most consequential
  // value in the deployment.
  const master = env.APEX_MASTER_KEY;
  if (!master) {
    findings.push({
      severity: fatalInProduction,
      key: "APEX_MASTER_KEY",
      message:
        "Not set. Second factors, sealed field values, and anything else held encrypted at rest " +
        "cannot be written or read without it. In development an ephemeral key is used and " +
        "everything sealed is lost at restart.",
      remedy: 'openssl rand -base64 48   # then set APEX_MASTER_KEY in the environment',
    });
  } else if (master.length < 32) {
    findings.push({
      severity: fatalInProduction,
      key: "APEX_MASTER_KEY",
      message: `Set, but only ${master.length} characters. At least 32 are required.`,
      remedy: "openssl rand -base64 48",
    });
  } else if (/^(changeme|example|test|placeholder|apex)/i.test(master)) {
    // A key that looks like it came from documentation almost certainly did,
    // which means it is in a repository somewhere.
    findings.push({
      severity: fatalInProduction,
      key: "APEX_MASTER_KEY",
      message:
        "Set, but begins with a word that suggests it was copied from documentation. " +
        "A key that appears in a file anyone can read is not a key.",
      remedy: "openssl rand -base64 48",
    });
  }

  // --- The database --------------------------------------------------------
  const database = env.DATABASE_URL;
  if (!database) {
    findings.push({
      severity: "fatal",
      key: "DATABASE_URL",
      message: "Not set. There is nowhere to keep the register.",
      remedy: 'DATABASE_URL="file:../data/ledger.db"   # or a postgresql:// connection string',
    });
  } else if (database.startsWith("file:")) {
    if (production) {
      // Not wrong — SQLite is genuinely correct for a single office — but the
      // operator should have decided this rather than inherited it.
      findings.push({
        severity: "warning",
        key: "DATABASE_URL",
        message:
          "SQLite in production. Correct for a single office on a machine that is backed up; " +
          "wrong for anything with more than one writer or an ephemeral filesystem. " +
          "See docs/13-INFRASTRUCTURE-AND-PORTABILITY.md.",
      });
    }
    if (database.includes("://") && !database.startsWith("file:")) {
      findings.push({
        severity: "fatal",
        key: "DATABASE_URL",
        message: "Malformed SQLite URL.",
      });
    }
  } else if (
    production &&
    /^postgres(ql)?:\/\//.test(database) &&
    !/sslmode=(require|verify-ca|verify-full)/.test(database)
  ) {
    findings.push({
      severity: "warning",
      key: "DATABASE_URL",
      message:
        "Postgres without an explicit sslmode. Member data and sealed material cross this " +
        "connection; on a hosted database it crosses a network the Kingdom does not control.",
      remedy: "append ?sslmode=require to the connection string",
    });
  }

  // --- The evidence store --------------------------------------------------
  // The database without the evidence store proves nothing. A deployment whose
  // storage directory is unwritable will accept an upload and lose it.
  const storage = env.STORAGE_DIR ?? "./storage";
  const storagePath = resolve(process.cwd(), storage);
  const probeTarget = fsProbe.exists(storagePath) ? storagePath : dirname(storagePath);
  if (!fsProbe.exists(probeTarget)) {
    findings.push({
      severity: fatalInProduction,
      key: "STORAGE_DIR",
      message: `${storagePath} does not exist and neither does its parent. Evidence has nowhere to go.`,
      remedy: `mkdir -p ${storagePath}`,
    });
  } else if (!fsProbe.writable(probeTarget)) {
    findings.push({
      severity: fatalInProduction,
      key: "STORAGE_DIR",
      message: `${storagePath} is not writable by this process. Uploads will fail after the record is created.`,
    });
  }

  // --- Public origin -------------------------------------------------------
  // Certificates and credentials print a verification address. If it is wrong,
  // the recipient of a certified extract cannot check it, which is the entire
  // point of issuing one.
  const origin = env.APEX_PUBLIC_ORIGIN;
  if (production && !origin) {
    findings.push({
      severity: "warning",
      key: "APEX_PUBLIC_ORIGIN",
      message:
        "Not set. Certified extracts and credentials will print a verification address derived " +
        "from the request, which is wrong behind a proxy and unusable in a printed document.",
      remedy: 'APEX_PUBLIC_ORIGIN="https://registry.apexkingdom.example"',
    });
  } else if (origin && !/^https?:\/\/[^/]+$/.test(origin)) {
    findings.push({
      severity: "warning",
      key: "APEX_PUBLIC_ORIGIN",
      message: `"${origin}" is not an origin. Expected scheme://host with no trailing path.`,
    });
  } else if (production && origin?.startsWith("http://")) {
    findings.push({
      severity: "warning",
      key: "APEX_PUBLIC_ORIGIN",
      message:
        "Plaintext HTTP. Session cookies and member data would cross the network in the clear, " +
        "and HSTS is served on the assumption they do not.",
    });
  }

  return findings;
}

/** Throw if anything fatal is wrong; log anything merely unwise. */
export function preflight(env: NodeJS.ProcessEnv = process.env): Finding[] {
  const findings = inspectEnvironment(env);
  const fatal = findings.filter((f) => f.severity === "fatal");

  for (const finding of findings.filter((f) => f.severity === "warning")) {
    console.warn(
      `[preflight] ${finding.key}: ${finding.message}${finding.remedy ? ` → ${finding.remedy}` : ""}`,
    );
  }

  if (fatal.length > 0) throw new PreflightError(fatal);
  return findings;
}
