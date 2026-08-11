import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import Section from './Section';

/**
 * Z.36 — <TrustPhotoBand /> (Appendix Z addition, new component).
 *
 * Owner-requested redesign pass referencing velocityflowinc.com and
 * mechanicalone.com's full-page screenshots. Both put a full-bleed,
 * photo-backed trust band mid-page (MechanicalOne's black "Full-Service Home
 * Repair" band, VelocityFlow's photo-card row) — a distinct layout family
 * from the site's card grids and from <WhyApexSection />'s image/text split,
 * which is the point: repeating the same section shape end to end (card,
 * card, card, image-split, card, card) is what the loaded design-critique
 * skills call "Section-Layout-Repetition," one of the more mechanical AI-slop
 * tells. This is a fourth distinct family on the homepage.
 *
 * IMAGE: `about-team-shop-bay.jpg` — a real Apex crew and branded van, not a
 * generic stock technician. Full-bleed background with a FLAT, uniform-opacity
 * ink scrim, deliberately not a left-to-right gradient. A gradient was the
 * first draft here, and <SiteHeader />'s own Z.20/Z.27 history is the exact
 * cautionary tale against it: that scrim also started as a gradient, and Z.27
 * records the real bug it caused — the gradient faded out by the point where
 * the actual content sat, so coverage depended on exactly where content
 * happened to land rather than being guaranteed. This component's text block
 * is horizontally centered by `container-max` inside a full-bleed section, so
 * its left edge lands at very different fractions of a full-width gradient
 * depending on viewport width — same failure shape, so it gets the same flat
 * fix pre-emptively rather than waiting to reproduce the bug.
 *
 * NO CTA BUTTON — Z.39 update (Appendix Z), owner-reported glitch. The
 * button this section carried at launch duplicated an intent every other
 * mechanism on the page already owns (hero, footer CTA, financing banner,
 * and — the actual bug — <MobileStickyBar />, which is FIXED at the
 * viewport bottom on every route below lg). Whenever this section's own
 * button scrolled toward the bottom of the viewport, it sat directly behind
 * or beside the sticky bar's identically-styled copper "Get Quote" button,
 * reading as two stacked/overlapping CTAs. Removing the button here fixes
 * that collision AND removes real redundancy — the design skills loaded
 * this session flag exactly this pattern ("No Duplicate CTA Intent"). This
 * section's job is trust-building (the checklist), not one more conversion
 * ask.
 *
 * MOTION: picked up automatically by <EntranceMotion />'s generic
 * `[data-ground]` sweep (Z.32) like every other section — no bespoke wiring
 * needed here.
 */

const POINTS = [
  'Licensed, insured, background-checked technicians',
  'Marked, branded vehicles: you know who is at the door',
  'Local Phoenix crew, not a subcontracted dispatch',
];

export interface TrustPhotoBandProps {
  heading: string;
  body: string;
}

export default function TrustPhotoBand({ heading, body }: TrustPhotoBandProps) {
  return (
    <Section
      ground="ink"
      width="full-bleed"
      labelledBy="trust-photo-heading"
      className="relative overflow-hidden"
    >
      {/*
       * FOCAL POINT — Z.44 fix, owner-reported ("head is cropped"). This is
       * exactly the fixed-aspect crop case §4.10 legislates for, and the
       * vertical value is derived, not eyeballed.
       *
       * The band is a short, very wide strip (measured: 478px tall) and the
       * source is 2800x1867 (3:2), so `cover` scales to fill width and
       * discards most of the height. At the previous `50%` the visible window
       * began at 22% of the image at 1280px wide and 39.6% at 3440px — and
       * the topmost cap sits at 19.9% (measured against the source, not
       * guessed). So the heads were cut at EVERY desktop width, not just wide
       * ones.
       *
       * 18% puts the window start between 7.9% (1280px) and 14.2% (3440px),
       * clearing the 19.9% head line with room to spare across that whole
       * range. Below lg the box is taller than the image ratio, so `cover`
       * crops horizontally instead and there is no vertical overflow at all —
       * this value is a no-op there, which is why the mobile framing is
       * unchanged.
       */}
      <Image
        src="/images/about-team-shop-bay.jpg"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: '30% 18%' }}
        className="absolute inset-0"
      />
      {/* Flat, uniform-opacity scrim — guarantees text contrast regardless of
          viewport width (see file header: not a gradient, and why). */}
      <div aria-hidden="true" className="absolute inset-0 bg-apex-ink/80" />

      <div className="container-max relative px-[var(--section-padding-inline)]">
        <div className="max-w-[36rem]">
          <h2 id="trust-photo-heading" className="text-h2 measure-display text-apex-paper">
            {heading}
          </h2>
          <p className="mt-s3 text-body-lg measure-body text-apex-paper/85">{body}</p>

          <ul className="mt-s5 flex flex-col gap-s3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-s3">
                <CheckCircle2
                  aria-hidden="true"
                  strokeWidth={2}
                  className="mt-0.5 size-5 shrink-0 text-apex-copper-dark"
                />
                <span className="text-body text-apex-paper/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
