import localFont from "next/font/local";

/**
 * Typefaces, self-hosted.
 *
 * These are downloaded into the repository as latin-subset woff2 files and
 * served from this origin. There is no runtime request to a font CDN and no
 * build-time network dependency — the files are committed — which keeps the
 * strict `font-src 'self'` content-security policy honest and lets the register
 * run on a host with no outbound access. It also means a certified copy renders
 * identically on a machine that has never touched the internet.
 *
 * The pairing is deliberate:
 *
 *   - Fraunces, an "old style" serif with real warmth, carries anything that
 *     speaks with the Kingdom's authority: the masthead, page titles, the great
 *     numbers on the desk, the head of a certificate. A serif is what makes a
 *     document read as an instrument rather than as an interface.
 *   - Public Sans is the typeface of the United States Web Design System. It is
 *     the sound of a competent public institution, and it is used for everything
 *     a person reads at length or acts on.
 *   - IBM Plex Mono sets every figure a person might read aloud or copy onto a
 *     form — record numbers, hashes, sums — where a mistaken character has a cost.
 */

export const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "Iowan Old Style", "Palatino Linotype", "Times New Roman", "serif"],
  src: [
    { path: "./fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "./fraunces-700.woff2", weight: "700", style: "normal" },
  ],
});

export const publicSans = localFont({
  variable: "--font-publicsans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
  src: [
    { path: "./publicsans-400.woff2", weight: "400", style: "normal" },
    { path: "./publicsans-500.woff2", weight: "500", style: "normal" },
    { path: "./publicsans-600.woff2", weight: "600", style: "normal" },
    { path: "./publicsans-700.woff2", weight: "700", style: "normal" },
  ],
});

export const plexMono = localFont({
  variable: "--font-plex",
  display: "swap",
  fallback: ["ui-monospace", "SF Mono", "Cascadia Mono", "Menlo", "Consolas", "monospace"],
  src: [
    { path: "./plexmono-400.woff2", weight: "400", style: "normal" },
    { path: "./plexmono-500.woff2", weight: "500", style: "normal" },
  ],
});
