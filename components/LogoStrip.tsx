import Image from 'next/image';
import Section from './Section';
import { gateOpen } from '@/lib/placeholders';

/**
 * B.30 — <LogoStrip />
 *
 * The manufacturer authority signal, placed immediately after the hero on the
 * homepage and on the AC Replacement service page (§5.4, §3.3). It proves
 * technical legitimacy exactly where the purchase decision happens.
 *
 * THE GATE IS A HARD RULE, NOT A PREFERENCE (§9.4, B.30, D.2).
 * These are third-party trademarks. Only brands Apex is a genuine AUTHORIZED
 * DEALER OR SERVICER for may appear, and each requires that brand's own
 * logo-usage terms to be checked. If dealer status exists for fewer than four
 * brands, the strip is replaced by a "Brands We Service" TEXT LIST, which
 * asserts servicing rather than partnership and requires no permission.
 *
 * Per Appendix Z, the text list is the DEFAULT STATE, not a fallback branch:
 * until dealer status is confirmed, the text list is what ships. That is the
 * current state — `manufacturerDealerBrands` is null in lib/placeholders.ts.
 *
 * No marquee and no auto-scroll at any width — auto-playing motion is barred
 * by §6.2 (B.30, H.2.2).
 */

export interface LogoStripProps {
  brands: readonly { name: string; src: string }[];
  heading?: string;
}

export default function LogoStrip({ brands, heading }: LogoStripProps) {
  // §9.4's gate. Logos ship only when dealer status is confirmed for four or
  // more brands; otherwise the text list is what renders.
  const logosPermitted = gateOpen('manufacturerDealerBrands') && brands.length >= 4;

  const label = logosPermitted ? heading ?? 'Systems We Install' : 'Brands We Service';

  return (
    <Section ground="paper" labelledBy="logostrip-heading">
      <h2
        id="logostrip-heading"
        className="eyebrow text-center text-[var(--accent)]"
      >
        {label}
      </h2>

      <ul
        className={[
          'mt-s4 grid list-none items-center gap-s4',
          // 3 rows of 2 below md, 2 rows of 3 at md–lg, 1 row of 6 at lg+.
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
        ].join(' ')}
      >
        {brands.map((brand) => (
          <li key={brand.name} className="flex items-center justify-center">
            {logosPermitted ? (
              <Image
                src={`/brands/${brand.src}`}
                alt={brand.name}
                width={120}
                height={40}
                className="h-10 w-auto opacity-55 grayscale transition duration-[var(--dur-hover)] ease-out hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span className="text-body font-semibold text-n-700">{brand.name}</span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
