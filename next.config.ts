import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * These matter more than usual here: the register holds personal data on members
 * and the public verification endpoints are, by design, reachable by strangers.
 *
 * The CSP is deliberately strict. Next.js needs 'unsafe-inline' for its
 * hydration bootstrap and, in development, 'unsafe-eval' for fast refresh — the
 * nonce-based alternative requires middleware on every request and is worth
 * revisiting if this ever serves untrusted content. Everything else is locked:
 * no external scripts, no external styles, no frames, no plugins, and form
 * submissions restricted to this origin so a page injected into the DOM cannot
 * post an officer's session anywhere.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // No third-party endpoints. If a future integration needs one, add it here
  // explicitly rather than widening to *.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    serverActions: {
      /**
       * Attachments arrive through a Server Action, and Next caps a Server
       * Action body at 1 MB by default.
       *
       * `MAX_UPLOAD_BYTES` in src/lib/storage.ts is 32 MB and the upload form
       * says so, but with the default in force anything over 1 MB was rejected
       * by the framework before the application ever saw it — so the stated
       * limit was unreachable and the failure arrived as a generic error with no
       * indication that size was the problem. Scanned exhibits, photographs of a
       * site, and recorded correspondence are routinely larger than 1 MB, which
       * is to say the evidence vault could not hold most evidence.
       *
       * Kept slightly above the application's own limit so that an oversized
       * upload is refused by `storage.ts` — which can say what the limit is and
       * what was sent — rather than by the framework.
       */
      bodySizeLimit: "36mb",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Clickjacking: an officer's session must not be framable into a
          // page that overlays its own buttons on the register's.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Record numbers appear in URLs; they should not leak to third-party
          // sites through the Referer header.
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
      {
        // Nothing under the register should ever be cached by an intermediary.
        source: "/(record|registry|treasury|audit|principals|account|credentials)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
