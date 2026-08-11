import type { ReactNode } from 'react';

/**
 * B.7 — <Section />
 *
 * The generic wrapper that enforces the spacing tokens (§9.1). Every band of
 * page content is wrapped in one; NO PAGE APPLIES SECTION PADDING DIRECTLY.
 *
 * This is the single place section padding is expressed, which is what stops
 * the padding-cancellation collisions dense section-based marketing pages are
 * prone to (§9.5 step 12): there is no competing `.section` rule to lose to a
 * later element selector, because there is only ever one rule.
 *
 * `ground="ink"` also switches every descendant accent to --apex-copper-dark
 * per §4.2's binding contextual-accent rule. It does that by rebinding the
 * --accent custom property, which descendants read; they never hard-code a
 * copper token and therefore cannot get the pairing wrong. Elevation on ink
 * grounds is expressed by --apex-ink-2 surface lift, never by shadow (§4.6a),
 * which each component handles via its own `ground` prop.
 */

export interface SectionProps {
  children: ReactNode;
  as?: 'section' | 'div' | 'article';
  ground?: 'paper' | 'ink' | 'n50' | 'sage-tint';
  width?: 'default' | 'narrow' | 'full-bleed';
  id?: string;
  /**
   * Points at the id of this section's own heading, so the landmark is named
   * rather than anonymous (B.7, I.1).
   *
   * Appendix Z class — B.7's prop list does not include this, but B.7's
   * accessibility rule requires `aria-labelledby` on every `as="section"`.
   * <Section /> is a Server Component (J.4's 'use client' list is exhaustive
   * and does not include it), so it cannot generate an id with useId, and a
   * context provider would force it client-side. Passing the id explicitly is
   * the only server-safe way to satisfy the rule.
   */
  labelledBy?: string;
  /**
   * Permitted for one-off grid definitions only — never spacing or colour (B.7).
   *
   * WHERE IT LANDS DEPENDS ON `width` (Z.43): for the default and narrow
   * widths it goes on the inner container (the grid it is meant for); for
   * `full-bleed` there IS no inner container, so it goes on the section
   * element itself. Before Z.43 the full-bleed case dropped it entirely,
   * which broke <TrustPhotoBand />'s positioning contract silently — if you
   * add a full-bleed section with an absolutely-positioned background layer,
   * this is the prop that gives it a containing block.
   */
  className?: string;
}

const GROUND = {
  paper: 'bg-apex-paper text-n-950 [--accent:var(--color-apex-copper)]',
  ink: 'bg-apex-ink text-apex-paper [--accent:var(--color-apex-copper-dark)]',
  n50: 'bg-n-50 text-n-950 [--accent:var(--color-apex-copper)]',
  'sage-tint': 'bg-apex-sage-tint text-apex-ink [--accent:var(--color-apex-copper)]',
} as const;

const INNER = {
  // Capped at --container-max (1280px) and centred.
  default: 'container-max',
  // Capped at --measure-body (68ch) for long-form prose.
  narrow: 'w-full mx-auto max-w-[var(--measure-body)]',
  // No inner container at all.
  'full-bleed': '',
} as const;

export default function Section({
  children,
  as: Tag = 'section',
  ground = 'paper',
  width = 'default',
  id,
  labelledBy,
  className,
}: SectionProps) {
  const isFullBleed = width === 'full-bleed';

  return (
    <Tag
      id={id}
      data-ground={ground}
      aria-labelledby={Tag === 'section' ? labelledBy : undefined}
      className={[
        GROUND[ground],
        // Section padding compresses INTENTIONALLY, not proportionally:
        // --s-7 (64px) below lg, --s-8 (96px) at lg+ (§6.1 item 6, H.0 rule 3).
        'py-s7 lg:py-s8',
        // Fluid inline padding — avoids a fixed value that feels cramped at
        // tablet widths (C.8). Suppressed for full-bleed bands.
        isFullBleed ? '' : 'px-[var(--section-padding-inline)]',
        /*
         * Z.43 — REAL BUG, this line is the fix. `className` used to be applied
         * ONLY to the inner <div> below, which full-bleed does not render — so
         * for width="full-bleed" the caller's className was silently DISCARDED.
         *
         * <TrustPhotoBand /> passes `relative overflow-hidden` here precisely so
         * its full-bleed <Image fill> (position: absolute; inset: 0) has a
         * positioned containing block. With the class dropped, the section
         * stayed position: static, no ancestor up to <html> was positioned, and
         * the image resolved against the INITIAL CONTAINING BLOCK instead —
         * painting the crew photo across the top of the document, over the hero,
         * on every load until <EntranceMotion />'s lazily-loaded GSAP chunk
         * happened to put a `transform` on the section (which incidentally
         * creates a containing block) and the image snapped into place.
         *
         * That accidental rescue is exactly why it read as "image aati hai,
         * phir form" and why it looked fine in any measurement taken after the
         * page had settled. Confirmed on the live site by walking the ancestor
         * chain: section position:static with only a GSAP matrix on it, and
         * <main>/<body> both static with no transform.
         */
        isFullBleed ? className : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isFullBleed ? (
        children
      ) : (
        <div className={[INNER[width], className].filter(Boolean).join(' ')}>
          {children}
        </div>
      )}
    </Tag>
  );
}
