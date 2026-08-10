import Image from 'next/image';
import Section from './Section';
import SectionHeading from './SectionHeading';
import FeatureRow, { type FeatureRowProps } from './FeatureRow';

/**
 * B.25 — <WhyApexSection />
 *
 * The evidence-led image/text split with a floating stat badge overlay (§5.7).
 * Evidence, not claims: this replaces phase0's four-feature icon-and-claim
 * list, which was the weakest section in the original and identical across
 * every competitor reference.
 *
 * RESPONSIVE (H.2.5): two columns with media left at roughly 4:5 at lg+;
 * single column with media above text at 16:9 below.
 *
 * THIS IS PRECISELY THE FIXED-ASPECT CROP CONTEXT §4.10 LEGISLATES FOR. The
 * image declares object-position 62% 45% (IMG-01), which holds the technician
 * in frame at BOTH ratios. Without it, object-fit: cover's centre default
 * crops the subject's head at the 4:5 crop.
 *
 * MOTION (Z.32): the section now scroll-reveals as a whole via
 * <EntranceMotion />'s generic `[data-ground]` sweep (opt-out, not opt-in —
 * see that file). The photo additionally carries `data-parallax` for a
 * subtle scroll-scrubbed depth drift, independent of the reveal.
 */

export interface WhyApexSectionProps {
  eyebrow?: string;
  heading: string;
  image: { src: string; alt: string; focalPoint: string };
  badge: { value: string | null; label: string };
  /** 4 rows (B.25). */
  features: readonly FeatureRowProps[];
}

export default function WhyApexSection({
  eyebrow,
  heading,
  image,
  badge,
  features,
}: WhyApexSectionProps) {
  return (
    <Section ground="n50" labelledBy="why-apex-heading">
      <div className="grid gap-s6 lg:grid-cols-2 lg:items-center">
        <div className="relative order-first min-w-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl lg:aspect-[4/5]">
            <div data-parallax="-10" className="absolute inset-[-8%]">
              <Image
                src={`/images/${image.src}`}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                style={{ objectFit: 'cover', objectPosition: image.focalPoint }}
              />
            </div>
          </div>

          {/*
           * Floating stat badge at --z-raised, offset so it never overlaps the
           * subject's face at either aspect ratio: bottom-left below lg, where
           * the 16:9 crop puts the technician right of centre; bottom-right at
           * lg+, where the 4:5 crop moves him left.
           *
           * Where `value` is null the badge does not render (§9.4) — unlike
           * <StatBlock /> this is an overlay, not a grid member, so omitting it
           * changes nothing structural (B.25).
           */}
          {badge.value !== null ? (
            <div className="absolute bottom-s4 left-s4 z-[var(--z-raised)] rounded-xl bg-apex-ink px-s4 py-s3 text-apex-paper shadow-lg lg:left-auto lg:right-s4">
              <p className="num text-h3 leading-none">{badge.value}</p>
              <p className="mt-s1 text-micro font-semibold uppercase tracking-[0.08em] text-apex-copper-dark">
                {badge.label}
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <SectionHeading
            eyebrow={eyebrow}
            heading={heading}
            level={2}
            id="why-apex-heading"
          />
          <ul className="mt-s6 flex list-none flex-col gap-s5">
            {features.map((feature) => (
              <FeatureRow key={feature.title} {...feature} headingLevel={3} />
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
