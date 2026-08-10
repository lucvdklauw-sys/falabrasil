/** Subtle Rio skyline + palm leaf illustration used as a page backdrop.
 * Kept low-opacity so it never competes with content/readability. */
export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-emerald-50" />

      {/* Rio skyline silhouette (Sugarloaf + Christ the Redeemer) */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.06]"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 300 L0 220 L60 220 L60 180 L100 180 L100 220 L160 220 L200 150 L230 150 L235 120 L240 150 L245 150
             L260 220 L320 220 L320 190 L360 190 L360 220 L420 220 L440 100 L450 100 L455 70 L448 60 L452 50
             L456 60 L450 70 L455 100 L465 100 L480 220 L560 220 L560 200 L600 200 L600 220 L680 220 L700 160
             L740 160 L760 220 L900 220 L900 190 L940 190 L940 220 L1000 220 L1020 170 L1060 170 L1080 220
             L1200 220 L1200 300 Z"
          fill="#002776"
        />
      </svg>

      {/* palm leaves top-right */}
      <svg className="absolute -top-6 -right-6 w-56 h-56 opacity-[0.08]" viewBox="0 0 200 200">
        <g fill="#009739">
          <path d="M100 100 C60 70 30 40 10 10 C50 20 80 45 100 90 Z" />
          <path d="M100 100 C140 70 170 40 190 10 C150 20 120 45 100 90 Z" />
          <path d="M100 100 C70 60 50 25 40 -5 C75 10 95 40 100 90 Z" />
          <path d="M100 100 C130 60 150 25 160 -5 C125 10 105 40 100 90 Z" />
        </g>
      </svg>

      {/* palm leaves bottom-left */}
      <svg className="absolute -bottom-10 -left-10 w-64 h-64 opacity-[0.07]" viewBox="0 0 200 200">
        <g fill="#FFDF00">
          <path d="M100 100 C60 130 30 160 10 190 C50 180 80 155 100 110 Z" />
          <path d="M100 100 C140 130 170 160 190 190 C150 180 120 155 100 110 Z" />
        </g>
      </svg>
    </div>
  );
}
