import type { Metadata } from "next";
import "./globals.css";

// System font stacks rather than next/font/google: the build must not depend on
// reaching a font CDN, and this application is expected to run on restricted
// networks and on hosts without outbound access.

export const metadata: Metadata = {
  title: {
    default: "Office of the Registrar — Apex Kingdom",
    template: "%s — Apex Kingdom Register",
  },
  description:
    "The official register of Apex Kingdom, maintained by Apex Tactical Corporation: instruments, offices, property, intellectual property, external relations, and evidence, kept on a tamper-evident ledger.",
  // The register holds personal data on members. Search engines are not invited.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
