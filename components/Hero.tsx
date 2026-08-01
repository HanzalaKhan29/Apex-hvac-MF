import Image from 'next/image';
import type { ReactNode } from 'react';
import Button from './Button';
import TrustBadge, { type TrustBadgeProps } from './TrustBadge';

/**
 * B.10 — <Hero />
 *
 * The first screen on every route that has one (§5.3).
 *
 * VARIANTS
 *   home    — asymmetric two-column 58/42. Ground --apex-ink with a low-opacity
 *             radial highlight in --apex-copper-dark. NO BACKGROUND
 *             PHOTOGRAPHY: text and form legibility over the dark ground stays
 *             maximal and the hero's image payload is zero (§5.3, IMG-02).
 *             Its LCP element is therefore the H1 — text, not an image (J.1).
 *   service — H1 at --text-h1, the §8.2 direct-answer lede as subhead, trust
 *             row, CTA row, and a service image on the media side.
 *   city    — as service, with a DECORATIVE city image (alt="") and no text
 *             overlay on the image at any breakpoint (A.6, H.4.1).
 *
 * MOTION (§4.11): headline and subhead perform a staggered reveal ON PAGE LOAD
 * ONLY, never scroll-triggered — --dur-hero (600ms), --ease-brand,
 * --stagger-hero (80ms). The quote card slides in from the right after
 * --delay-quotecard (150ms) over --dur-quotecard (700ms). Under
 * prefers-reduced-motion both render instantly at final state.
 */

export interface HeroProps {
  variant: 'home' | 'service' | 'city';
  eyebrow: string;
  heading: string;
  subhead: string;
  trustItems: readonly TrustBadgeProps[];
  primaryCta: { label: string; href: string };
  /** Always a tel: link, rendered through <PhoneLink /> by the caller. */
  secondaryCta: { label: string; href: string };
  image?: { src: string; alt: string; focalPoint: string };
  /** <QuoteCard />, home variant only. */
  children?: ReactNode;
}

/** Per-line stagger, applied as a multiple of --stagger-hero. */
const delay = (step: number) => ({
  animationDelay: `calc(var(--stagger-hero) * ${step})`,
});

export default function Hero({
  variant,
  eyebrow,
  heading,
  subhead,
  trustItems,
  primaryCta,
  secondaryCta,
  image,
  children,
}: HeroProps) {
  const isHome = variant === 'home';
  const onInk = isHome;

  return (
    <section
      aria-labelledby="hero-heading"
      data-ground={onInk ? 'ink' : 'paper'}
      className={[
        'relative overflow-hidden',
        onInk
          ? 'bg-apex-ink text-apex-paper [--accent:var(--color-apex-copper-dark)]'
          : 'bg-apex-paper text-n-950 [--accent:var(--color-apex-copper)]',
        'px-[var(--section-padding-inline)]',
        'py-s7 lg:py-s9',
      ].join(' ')}
    >
      {onInk ? (
        /* A very subtle radial highlight in --apex-copper-dark at low opacity.
           It scales with the section, not with a fixed pixel offset (H.2.1).
           hero-drift (Appendix Z) gives it a 22s ambient position loop —
           background-position only, compositor-friendly, suppressed under
           prefers-reduced-motion by the global rule. */
        <div
          aria-hidden="true"
          className="hero-drift pointer-events-none absolute inset-0 opacity-[0.16]"
        />
      ) : null}

      <div
        className={[
          'container-max relative grid items-center gap-s6',
          isHome
            ? 'lg:grid-cols-[58fr_42fr] lg:gap-s6'
            : 'lg:grid-cols-2 lg:gap-s6',
        ].join(' ')}
      >
        <div className="min-w-0">
          <p className="eyebrow hero-rise text-[var(--accent)]" style={delay(0)}>
            {eyebrow}
          </p>

          <h1
            id="hero-heading"
            className={[
              'hero-rise measure-display mt-s2',
              isHome ? 'text-display' : 'text-h1',
            ].join(' ')}
            style={delay(1)}
          >
            {heading}
          </h1>

          <p
            className={[
              'hero-rise measure-body mt-s3 text-body-lg',
              onInk ? 'text-apex-paper/80' : 'text-n-700',
            ].join(' ')}
            style={delay(2)}
          >
            {subhead}
          </p>

          {/* CTA row — a real PAIR of controls, never a single control with a
              split hit area (B.10). Full-width and stacked below sm. */}
          <div
            className="hero-rise mt-s5 flex flex-col gap-s3 sm:flex-row sm:flex-wrap md:items-center"
            style={delay(3)}
          >
            <Button
              variant="primary"
              size="lg"
              href={primaryCta.href}
              fullWidth
              className="sm:w-auto"
            >
              {primaryCta.label}
            </Button>
            <Button
              variant={onInk ? 'ghost' : 'outline-light'}
              size="lg"
              href={secondaryCta.href}
              fullWidth
              className="sm:w-auto"
            >
              {secondaryCta.label}
            </Button>
          </div>

          {/* Trust row. Wraps to two lines below md; badges never truncate. */}
          <ul
            className="hero-rise mt-s5 flex flex-wrap gap-x-s5 gap-y-s2"
            style={delay(4)}
          >
            {trustItems.map((item) => (
              <TrustBadge
                key={item.label}
                {...item}
                ground={onInk ? 'ink' : 'paper'}
              />
            ))}
          </ul>
        </div>

        {isHome && children ? (
          <div className="hero-card min-w-0">{children}</div>
        ) : null}

        {!isHome && image ? (
          <div
            className={[
              'hero-rise relative min-w-0 overflow-hidden rounded-2xl',
              // Service: 4:3 below lg, 16:9 at lg+ (H.3.1).
              // City:    3:2 below lg, 16:9 at lg+ (H.4.1).
              variant === 'service'
                ? 'aspect-[4/3] lg:aspect-[16/9]'
                : 'aspect-[3/2] lg:aspect-[16/9]',
            ].join(' ')}
            style={delay(2)}
          >
            <Image
              src={`/images/${image.src}`}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              style={{ objectFit: 'cover', objectPosition: image.focalPoint }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
