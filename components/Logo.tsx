/**
 * The lockup. Owner-supplied artwork (`apex logo final.png`), replacing the
 * hand-drawn inline SVG this component used to render.
 *
 * WHY TWO COLOR VARIANTS, NOT ONE IMAGE (this is the part that isn't
 * optional): the previous inline-SVG lockup used `currentColor` for its dark
 * strokes so the header could flip it between the transparent-over-hero state
 * (needs light/white) and the solid-on-scroll state (needs dark navy) without
 * a second asset. A flat raster image can't do that — a single PNG is always
 * one fixed color. Dropping in only the dark-navy artwork would have made the
 * logo invisible against the dark hero in the transparent header state, which
 * is the same class of legibility bug as the Z.24/Z.27 header-flash issue,
 * just permanent instead of transient.
 *
 * So the source image was processed into two variants per size: navy pixels
 * (measured ~RGB(9,26,42), matching --apex-ink almost exactly) recolored to
 * --apex-paper for the light variant; the orange/copper accent is identical
 * in both, matching the original SVG's copper-is-never-recolored rule
 * (§5.2.1). `scheme` selects which pair renders; callers that always sit on
 * one background (the footer) just hardcode it.
 *
 * Plain <img>, not next/image: this is a small, fixed-size, pre-optimized
 * static file that never needs on-demand resizing, and next/image's client
 * runtime wasn't previously in the app's SHARED bundle (only <LogoStrip />,
 * homepage-only, used it). Wiring it into the header — present on every
 * route — promoted it into the shared chunk and broke the J.4 budget by
 * ~3.4KB on the first attempt. A plain <img> costs zero JS, matching the old
 * inline-SVG's actual bundle footprint far more closely.
 *
 * Not yet updated to match: public/logo-full.svg (OG image, JSON-LD `logo`,
 * the IMG-09 van composite) and the favicon/apple-touch-icon set — those are
 * static single-color contexts built by scripts/build-logo.mjs from the old
 * SVG geometry. Flagged, not silently left inconsistent.
 */

export interface LogoProps {
  /** 'mark' renders the icon alone, for constrained contexts. */
  variant?: 'full' | 'mark';
  /** 'light' for the transparent-over-hero header state and the dark footer; 'dark' everywhere else. */
  scheme?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
}

// /logo-*, not /logo/*: proxy.ts's matcher excludes the `logo-` PREFIX (for
// logo-full.svg et al.) from the locale rewrite, not a `/logo/` folder — a
// subfolder path 404'd in production because it got silently rewritten to
// /en/logo/... first. See proxy.ts's matcher comment.
const SOURCES = {
  mark: { dark: '/logo-apex-mark-dark.png', light: '/logo-apex-mark-light.png', width: 212, height: 148 },
  full: { dark: '/logo-apex-full-dark.png', light: '/logo-apex-full-light.png', width: 614, height: 148 },
} as const;

export default function Logo({ variant = 'full', scheme = 'dark', className, priority }: LogoProps) {
  const { dark, light, width, height } = SOURCES[variant];

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={scheme === 'light' ? light : dark}
      alt=""
      role="presentation"
      width={width}
      height={height}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
    />
  );
}
