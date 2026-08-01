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
  /** Permitted for one-off grid definitions only — never spacing or colour (B.7). */
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
