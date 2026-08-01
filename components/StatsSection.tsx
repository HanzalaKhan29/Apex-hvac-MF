import Section from './Section';
import StatBlock, { type StatBlockProps } from './StatBlock';

/**
 * B.24 — <StatsSection />
 *
 * The four-stat band on --apex-ink (§5.6).
 *
 * RESPONSIVE (H.2.4): 4 across at lg+, 2×2 at md–lg, 2×2 below md. NEVER a
 * single column — a four-item vertical stack reads as a list, not a stat band.
 * Numerals stay in Roboto with tabular-nums at every width so the two rows
 * align in the 2×2 arrangement.
 *
 * The band is a named <section> with a visually-hidden heading, so the
 * landmark is not anonymous (B.24, I.1).
 *
 * Motion is delegated to <StatBlock />'s once-only count-up.
 */

export interface StatsSectionProps {
  /** Exactly 4 (B.24). */
  stats: readonly StatBlockProps[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <Section ground="ink" labelledBy="stats-heading">
      <h2 id="stats-heading" className="visually-hidden">
        Apex Comfort Systems by the numbers
      </h2>
      {/* Z.19 — page-load entrance stagger (see <LogoStrip />); independent of
          and additive to <StatBlock />'s own once-only count-up. */}
      <div data-entrance className="grid grid-cols-2 gap-s5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} data-entrance-item>
            <StatBlock {...stat} ground="ink" />
          </div>
        ))}
      </div>
    </Section>
  );
}
