import Section from './Section';
import Button from './Button';

/**
 * B.26 — <FinancingBanner />
 *
 * The financing beat as a STANDALONE SECTION rather than a feature-list item —
 * 0% financing is a primary objection-killer for $8–15K system replacements
 * and deserves its own visual moment (§0.2, §5.8).
 *
 * VISUAL (§5.8, §4.2): --apex-sage-tint ground with --apex-ink text — NOT
 * white on --apex-sage, which failed AA at 3.54:1 before the palette
 * correction. Ink on sage tint measures ~16.2:1. Radius --r-2xl, the elevated
 * card class. No shadow: the tint carries the separation.
 *
 * COPY CONSTRAINT (§9.4, B.26): any APR, term length or "0%" claim requires
 * the actual lender agreement. Until supplied, the banner states that
 * financing is AVAILABLE and links to /financing; it does not state a rate.
 * "0% financing available" with no qualifying language is a lending-
 * advertising exposure.
 */

export interface FinancingBannerProps {
  heading: string;
  body: string;
  cta: { label: string; href: '/financing' | '#quote' };
}

export default function FinancingBanner({ heading, body, cta }: FinancingBannerProps) {
  return (
    <Section ground="paper" labelledBy="financing-heading">
      <div className="rounded-2xl bg-apex-sage-tint px-s4 py-s5 text-apex-ink md:flex md:items-center md:justify-between md:gap-s6 md:px-s6 md:py-s6">
        <div className="min-w-0">
          <h2 id="financing-heading" className="text-h2 measure-display">
            {heading}
          </h2>
          <p className="mt-s2 text-body-lg measure-body">{body}</p>
        </div>
        <div className="mt-s4 shrink-0 md:mt-0">
          {/* A <Button variant="ink"> for contrast against the tint (B.26). */}
          <Button variant="ink" href={cta.href} fullWidth className="md:w-auto">
            {cta.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}
