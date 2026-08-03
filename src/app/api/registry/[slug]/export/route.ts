import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPrincipal, isAuthenticated } from "@/lib/auth";
import { canView } from "@/lib/classification";
import { visibleClassifications } from "@/lib/queries";
import { getRegistry } from "@/registries";
import { parseJson } from "@/lib/canonical";
import { recordAudit } from "@/lib/audit";
import { getChainHead } from "@/lib/chain";
import { recordDigest } from "@/lib/records";

/**
 * Export a register as CSV.
 *
 * The realistic use is handing a whole register to counsel, an accountant, or an
 * agency. Three things travel with every row that a naive export would omit and
 * that make the file usable as evidence rather than merely as data:
 *
 *   - the record's content digest, so a recipient can tie any row back to a
 *     certified extract and to the ledger;
 *   - the classification, so material does not get forwarded onward by someone
 *     who could not tell that a row was sealed;
 *   - a header block naming the chain head at the moment of export, which dates
 *     the whole file against the ledger.
 *
 * Rows above the exporter's clearance are not included, and the count of what
 * was withheld is stated in the header rather than silently dropped — an export
 * that quietly omits rows is worse than one that refuses.
 */

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text: string;
  if (Array.isArray(value)) text = value.join("; ");
  else if (typeof value === "object") text = JSON.stringify(value);
  else text = String(value);

  // Neutralise spreadsheet formula injection. A cell beginning with one of these
  // is executed on open by Excel and Sheets, which turns an exported register
  // into an attack on whoever the Kingdom sends it to.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  if (/["\n\r,]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const principal = await getPrincipal();
  const registry = getRegistry(slug);

  if (!registry) return new NextResponse("No such register", { status: 404 });
  if (!isAuthenticated(principal)) {
    return new NextResponse("Sign in to export a register.", { status: 401 });
  }
  if (!canView(principal.clearance, registry.defaultClassification)) {
    return new NextResponse("No such register", { status: 404 });
  }

  const visible = visibleClassifications(principal);
  const [records, total, head] = await Promise.all([
    prisma.record.findMany({
      where: { registry: registry.slug, classification: { in: visible } },
      orderBy: { recordNumber: "asc" },
    }),
    prisma.record.count({ where: { registry: registry.slug } }),
    getChainHead(),
  ]);

  const withheld = total - records.length;

  // Fields the principal may read, in declaration order.
  const fields = registry.fields.filter(
    (field) => !field.classification || canView(principal.clearance, field.classification),
  );

  const lines: string[] = [];
  lines.push(`# ${registry.title} — Apex Kingdom, Office of the Registrar`);
  lines.push(`# Exported ${new Date().toISOString()} by ${principal.displayName} (${principal.role})`);
  lines.push(
    `# ${records.length} of ${total} entries. ${
      withheld > 0
        ? `${withheld} withheld as above ${principal.clearance.toLowerCase()} clearance.`
        : "No entries withheld."
    }`,
  );
  if (head) {
    lines.push(`# Ledger head at export: position ${head.sequence}, ${head.entryHash}`);
  }
  lines.push(
    "# Each row carries the SHA-256 content digest of the entry. Verify any entry at /verify/<record number>.",
  );
  lines.push("");

  const header = [
    "Record number",
    "Title",
    "Status",
    "Classification",
    "Effective date",
    "Recorded at",
    "Void",
    "Void reason",
    ...fields.map((field) => field.label),
    "Content digest (SHA-256)",
  ];
  lines.push(header.map(csvCell).join(","));

  for (const record of records) {
    const data = parseJson<Record<string, unknown>>(record.data, {});
    const row = [
      record.recordNumber,
      record.title,
      registry.statuses.find((status) => status.value === record.status)?.label ?? record.status,
      record.classification,
      record.effectiveDate ? record.effectiveDate.toISOString().slice(0, 10) : "",
      record.recordedAt.toISOString(),
      record.voidedAt ? "VOID" : "",
      record.voidReason ?? "",
      ...fields.map((field) => {
        const value = data[field.key];
        // Money is stored in integer cents; export it as dollars.
        if (field.type === "money" && typeof value === "number") return (value / 100).toFixed(2);
        if (field.type === "select") {
          return field.options?.find((option) => option.value === value)?.label ?? value;
        }
        return value;
      }),
      recordDigest(record),
    ];
    lines.push(row.map(csvCell).join(","));
  }

  await recordAudit(
    principal,
    "registry.export",
    registry.slug,
    `${records.length} entries exported${withheld > 0 ? `, ${withheld} withheld` : ""}`,
  );

  const filename = `apex-${registry.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  // A BOM so Excel opens UTF-8 correctly; without it, accented names arrive mangled.
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
