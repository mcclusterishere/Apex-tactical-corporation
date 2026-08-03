/**
 * The seal of the Office of the Registrar.
 *
 * Drawn rather than imported so it renders identically in the browser, in print,
 * and on a certified copy produced on a machine with no network access. The
 * apex device is a chevron over a horizon rule; the surrounding legend names the
 * office, not the Kingdom, because a seal attests to who certified a document.
 */
export function Seal({ size = 40, title }: { size?: number; title?: string }) {
  const id = "seal-legend";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title ?? "Seal of the Office of the Registrar, Apex Kingdom"}
      className="shrink-0"
    >
      <defs>
        <path id={id} d="M 50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" fill="none" />
      </defs>

      <circle cx="50" cy="50" r="47.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="43.5" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.1" />

      {/* Legend set around the inner ring. */}
      <text
        fontSize="7.6"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        letterSpacing="1.5"
        fill="currentColor"
      >
        <textPath href={`#${id}`} startOffset="25%" textAnchor="middle">
          APEX KINGDOM
        </textPath>
      </text>
      <text
        fontSize="5.4"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.1"
        fill="currentColor"
      >
        <textPath href={`#${id}`} startOffset="75%" textAnchor="middle">
          OFFICE OF THE REGISTRAR
        </textPath>
      </text>

      {/* Apex device: chevron above a horizon, with a ledger rule beneath. */}
      <path
        d="M 50 32 L 66 56 L 58 56 L 50 44 L 42 56 L 34 56 Z"
        fill="currentColor"
      />
      <rect x="34" y="61" width="32" height="1.8" fill="currentColor" />
      <rect x="38" y="66" width="24" height="1.4" fill="currentColor" opacity="0.65" />
      <rect x="42" y="71" width="16" height="1.4" fill="currentColor" opacity="0.4" />

      {/* Stars marking the break in the legend. */}
      <circle cx="12.5" cy="50" r="1.5" fill="currentColor" />
      <circle cx="87.5" cy="50" r="1.5" fill="currentColor" />
    </svg>
  );
}
