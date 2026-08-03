/**
 * The acts that route through dual control.
 *
 * Kept out of the server-action module because a `"use server"` file may export
 * nothing but async functions — a constraint that exists so a client bundle can
 * never accidentally inline server-only data.
 */

export const SUBJECT_TYPES = [
  "JOURNAL_ENTRY",
  "DISBURSEMENT",
  "CREDENTIAL",
  "UNSEAL",
  "KEY_REVOCATION",
  "OBLIGATION_ISSUE",
  "RECORD_VOID",
] as const;

export type ApprovalSubject = (typeof SUBJECT_TYPES)[number];

export const SUBJECT_LABELS: Record<string, string> = {
  JOURNAL_ENTRY: "Journal entry",
  DISBURSEMENT: "Disbursement of funds",
  CREDENTIAL: "Issue of a credential",
  UNSEAL: "Unsealing of restricted material",
  KEY_REVOCATION: "Revocation of a signing key",
  OBLIGATION_ISSUE: "Issue of an obligation",
  RECORD_VOID: "Voiding of a record",
};
