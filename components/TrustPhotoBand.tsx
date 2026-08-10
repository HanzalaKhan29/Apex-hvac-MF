import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import Section from './Section';
import Button from './Button';

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
 * CTA: reuses CTA.full verbatim rather than inventing new wording — a
 * repeated identical CTA reinforcing one intent down a long page is the
 * correct pattern (an inconsistent RELABEL of the same intent is the anti-
 * pattern the design skills flag, not repetition itself).
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
  cta: { label: string; href: string };
}

export default function TrustPhotoBand({ heading, body, cta }: TrustPhotoBandProps) {
  return (
    <Section
      ground="ink"
      width="full-bleed"
      labelledBy="trust-photo-heading"
      className="relative overflow-hidden"
    >
      <Image
        src="/images/about-team-shop-bay.jpg"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: '30% 50%' }}
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

          <div className="mt-s6">
            <Button variant="primary" size="lg" href={cta.href}>
              {cta.label}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
