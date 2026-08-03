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
 * Z.26 — auto-scroll marquee, owner-requested. This is an explicit override
 * of the rule above (kept in the paragraph for the history): §6.2/B.30/H.2.2
 * originally barred auto-playing motion here. Pause-on-hover/focus (WCAG
 * 2.2.2) and prefers-reduced-motion (I.8, automatic) are the mitigations, the
 * same pair <ReviewsMarquee /> uses. Pure CSS (.apex-logo-track in
 * globals.css) — no animation library, J.4 still holds.
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

  const renderLogo = (
    brand: LogoStripProps['brands'][number],
    pass: number
  ) => (
    <li
      key={`pass${pass}-${brand.name}`}
      aria-hidden={pass > 0 || undefined}
      // mr-s6, not the track's gap: flex `gap` never adds space after the
      // LAST child, so a 2-pass max-content track built with `gap` is a few
      // dozen px short of being exactly 2x the true repeat distance —
      // translateX(-50%) would then under-shoot the loop point and jump.
      // Margin on every item, including the last, makes the track's total
      // width exactly periodic, so -50% lands exactly on the seam.
      className="mr-s6 flex shrink-0 items-center justify-center"
    >
      {logosPermitted ? (
        <Image
          src={`/brands/${brand.src}`}
          alt={brand.name}
          width={brand.width}
          height={brand.height}
          tabIndex={pass > 0 ? -1 : undefined}
          // No max-width cap: each brand mark keeps its own aspect ratio at a
          // fixed 36px height, so York/Daikin's much wider marks render at
          // full height instead of being letterboxed down to ~24px by a cap
          // sized for the old single-brand grid layout.
          className="h-9 w-auto object-contain opacity-60 grayscale transition-all duration-[var(--dur-hover)] ease-out hover:scale-105 hover:opacity-100 hover:grayscale-0"
        />
      ) : (
        <span className="text-body font-semibold text-n-700">{brand.name}</span>
      )}
    </li>
  );

  return (
    <Section ground="paper" labelledBy="logostrip-heading">
      <h2
        id="logostrip-heading"
        className="eyebrow text-center text-[var(--accent)]"
      >
        {label}
      </h2>

      {/* Z.26 — continuous auto-scroll, rendered twice back to back so
          translateX(-50%) loops seamlessly (needs .apex-logo-track's own
          `width: max-content` in globals.css — percentages resolve against
          the element's own box, not its overflowing content, and without
          that the loop distance is silently wrong).

          The viewport itself is deliberately capped at max-w-2xl (42rem /
          672px), narrower than six real logos ever span (measured: ~940px
          with normal spacing) — six items don't fill 672px, so the strip
          always has something to reveal, and a repeat of pass one can never
          land inside a 672px window at the same time as pass zero, at any
          screen size, without depending on a specific viewport width to stay
          true. Pass two is aria-hidden and untabbable so assistive tech and
          keyboard users see the real six brands once, not twelve. */}
      <div
        role="group"
        aria-label={label}
        className="apex-logo-viewport relative mx-auto mt-s5 max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        tabIndex={logosPermitted ? 0 : undefined}
      >
        <ul className="apex-logo-track m-0 flex list-none items-center p-0">
          {brands.map((brand) => renderLogo(brand, 0))}
          {brands.map((brand) => renderLogo(brand, 1))}
        </ul>
      </div>
    </Section>
  );
}
