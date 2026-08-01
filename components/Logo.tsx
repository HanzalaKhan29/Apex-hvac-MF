/**
 * The lockup, inlined.
 *
 * Appendix E.1 defines logo-full.svg / logo-full-inverse.svg as files, and
 * those files exist in public/ for the uses that need a real asset — the
 * og-default.jpg composition, the structured-data `logo` property, and the
 * IMG-09 van composite. On-site, the lockup is inlined instead: E.0 notes the
 * logo sits in the header on every page and therefore counts directly against
 * the §6.3 LCP budget, and inlining removes that request entirely.
 *
 * Geometry is identical to public/logo-full.svg — both come from
 * scripts/build-logo.mjs, which is the single geometry source.
 *
 * The ink strokes and the wordmark resolve from currentColor, so the header
 * can flip the lockup between its transparent-over-hero and solid-on-scroll
 * states without loading a second asset. The copper is fixed: logo files are
 * never recoloured by CSS (§5.2.1, E.1).
 */

export interface LogoProps {
  /** 'mark' renders the 1:1 mark alone, for constrained contexts. */
  variant?: 'full' | 'mark';
  className?: string;
}

const MARK = (
  <g fill="none" strokeLinecap="butt" strokeLinejoin="miter">
    <g stroke="#AD5622" strokeWidth="9">
      <path d="M40 44 L3 56" />
      <path d="M34 59 L6 68" />
      <path d="M28 73 L11 79" />
    </g>
    <g stroke="currentColor" strokeWidth="11">
      <path d="M16 80 L56 8 L96 80" />
      <path d="M35 80 L56 41 L77 80" />
    </g>
  </g>
);

const FONT_STACK =
  "var(--font-geist), ui-sans-serif, system-ui, -apple-system, sans-serif";

export default function Logo({ variant = 'full', className }: LogoProps) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 100 86"
        role="presentation"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {MARK}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 186 40"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g transform="translate(0 1) scale(0.4535)">{MARK}</g>
      <text
        x="58"
        y="24.5"
        fontFamily={FONT_STACK}
        fontSize="28"
        fontWeight="800"
        letterSpacing="-0.02em"
        textLength="124"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
      >
        APEX
      </text>
      {/*
       * §5.2.1's copper-in-logo exception: the wordmark subtitle is set in
       * copper as BRAND IDENTITY, not as an affordance. This is the only
       * permitted non-actionable use of copper anywhere in the system.
       */}
      <text
        x="58"
        y="35.5"
        fontFamily={FONT_STACK}
        fontSize="7.4"
        fontWeight="700"
        letterSpacing="0.16em"
        textLength="124"
        lengthAdjust="spacing"
        fill="#AD5622"
      >
        COMFORT SYSTEMS
      </text>
    </svg>
  );
}
