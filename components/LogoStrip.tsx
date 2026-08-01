import Image from 'next/image';
import Section from './Section';
import { gateOpen } from '@/lib/placeholders';

/**
 * B.30 — <LogoStrip />
 *
 * The manufacturer authority signal, placed immediately after the hero on the
 * homepage and on the AC Replacement service page (§5.4, §3.3).
 *
 * THE PARTNERSHIP CLAIM IS STILL GATED (§9.4, B.30, D.2). Only brands Apex is
 * a genuine AUTHORIZED DEALER for may be presented as an installer
 * relationship — that heading ("Systems We Install") stays locked behind
 * `manufacturerDealerBrands` until dealer status is confirmed for four or
 * more brands.
 *
 * Z.19 ADDITION: the logo MARKS themselves (not the partnership claim) now
 * render under the unchanged "Brands We Service" heading. Naming and showing
 * a competitor's or supplier's mark to truthfully describe which equipment a
 * contractor services — grayscale, non-endorsing, no "authorized" language
 * nearby — is ordinary nominative use, distinct from the dealer-partnership
 * claim the gate protects. If that reasoning changes, revert to the text
 * list by setting `showLogos` false below.
 *
 * No marquee and no auto-scroll at any width — auto-playing motion is barred
 * by §6.2 (B.30, H.2.2). Movement here is limited to the page-load entrance
 * stagger shared with the rest of the site (§4.11).
 */

export interface LogoStripProps {
  /** width/height must be the file's real intrinsic size (see lib/content.ts) —
   *  a mismatched fallback ratio is what produced the cropped-looking Carrier
   *  logo before the real load window. */
  brands: readonly { name: string; src: string; width: number; height: number }[];
  heading?: string;
}

const showLogos = true;

export default function LogoStrip({ brands, heading }: LogoStripProps) {
  // §9.4's gate — the PARTNERSHIP heading only. Logo marks render regardless
  // (Z.19); this only decides whether the copy may claim a dealer/installer
  // relationship.
  const dealerConfirmed = gateOpen('manufacturerDealerBrands') && brands.length >= 4;
  const logosPermitted = showLogos && brands.length > 0;

  const label = dealerConfirmed ? heading ?? 'Systems We Install' : 'Brands We Service';

  return (
    <Section ground="paper" labelledBy="logostrip-heading">
      <h2
        id="logostrip-heading"
        className="eyebrow text-center text-[var(--accent)]"
      >
        {label}
      </h2>

      {/*
       * Z.19 — this band sits right after the hero, comfortably inside the
       * §4.11 entrance threshold on every viewport, so it opts into the same
       * page-load reveal <ServicesGrid />'s homepage instance uses (B.23).
       * <EntranceMotion /> does the one threshold measurement; this only
       * marks the grid.
       */}
      <ul
        data-entrance
        className={[
          'mt-s5 grid list-none items-center gap-s5',
          // 3 rows of 2 below md, 2 rows of 3 at md–lg, 1 row of 6 at lg+.
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
        ].join(' ')}
      >
        {brands.map((brand) => (
          <li
            key={brand.name}
            data-entrance-item
            className="flex items-center justify-center"
          >
            {logosPermitted ? (
              <Image
                src={`/brands/${brand.src}`}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                className="h-9 w-auto max-w-[7.5rem] object-contain opacity-60 grayscale transition-all duration-[var(--dur-hover)] ease-out hover:scale-105 hover:opacity-100 hover:grayscale-0"
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
