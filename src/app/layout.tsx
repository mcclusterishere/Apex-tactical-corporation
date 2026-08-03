import type { Metadata } from "next";
import "./globals.css";
import { fraunces, publicSans, plexMono } from "./fonts/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

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
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable}`}
      // The pre-paint script sets data-theme on this element before React
      // hydrates, so its attributes legitimately differ from the server render.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: sets the theme from the reader's local time
            (or their pinned choice) so the page never flashes the wrong colour. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
