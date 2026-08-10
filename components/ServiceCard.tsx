import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * B.17 — <ServiceCard />
 *
 * The signature card: a ROUTER to a service, city or related page, not a full
 * pitch (§5.5, §4.7).
 *
 * THE SPEC-LINE CARD (§4.7). A 2px top border showing SOLID --apex-copper by
 * default — not the phase0 pattern of transparent-until-hover. On hover the
 * card lifts 4px and the border transitions to --apex-ink, inverting the
 * resting state. This is the one ownable device in the card language.
 *
 * The whole card is NOT a single link (B.17, I.5). The link is the labelled
 * control, so a screen-reader user gets one clear target named "AC Repair &
 * Diagnostics" rather than a paragraph-length link name. The card surface
 * delegates its click to that link via a stretched ::after overlay, which
 * needs no JavaScript — <ServiceCard /> is a Server Component (J.4).
 *
 * Hover-only affordances have a focus-visible equivalent: the border inversion
 * and the icon-badge fill both also fire on :focus-within (§6.1 item 5).
 *
 * PHOTOGRAPHY — Z.35 (Appendix Z), owner-requested redesign pass referencing
 * velocityflowinc.com and mechanicalone.com. Both reference sites carry their
 * "premium" read largely through real photography on every service card, not
 * through icon tiles — the identical-icon-card-grid this component rendered
 * before is flagged directly by name in more than one loaded design-critique
 * skill as the most common tell of a templated build. `<Service>` and
 * `<City>` (lib/services.ts, lib/cities.ts) already carried a real `image` /
 * `imageAlt` / `focalPoint` per entry for their own detail pages; this card
 * simply started reading it. Icon and photo are never shown together — a
 * second visual on top of a real photo is clutter, and the photo alone reads
 * as more premium than an icon-plus-photo stack. The copper spec-line stays
 * regardless: it is the one ownable brand device (§4.7) and predates the
 * photography question entirely.
 */

export interface ServiceCardProps {
  variant?: 'service' | 'city' | 'compact';
  icon?: LucideIcon;
  /** Shown above the icon/title when present; icon is suppressed (Z.35). */
  image?: string;
  imageAlt?: string;
  /** object-position pair, e.g. "50% 65%" (Appendix D convention). */
  focalPoint?: string;
  /** <= 32 characters (§5.5). */
  title: string;
  /** 90–130 characters, hard cap 140 (§5.5). */
  description?: string;
  href: string;
  /** '[Name] →' — never 'Learn More' (§2.4 rule 5, §3.4). */
  linkLabel: string;
}

export default function ServiceCard({
  variant = 'service',
  icon: Icon,
  image,
  imageAlt,
  focalPoint = '50% 50%',
  title,
  description,
  href,
  linkLabel,
}: ServiceCardProps) {
  const compact = variant === 'compact';
  const hasPhoto = Boolean(image) && !compact;

  return (
    <li className="group relative flex">
      <article
        className={[
          'relative flex w-full flex-col cursor-pointer',
          'rounded-xl border border-n-200 bg-white',
          // Shadow ACCOMPANIES the 1px border, it does not replace it (§4.7).
          'shadow-sm group-hover:shadow-md group-focus-within:shadow-md',
          // 6px lift + a hair of scale on hover — the signature interaction.
          'transition-[translate,scale,box-shadow] duration-[var(--dur-hover)] ease-out',
          'group-hover:-translate-y-1.5 group-hover:scale-[1.02]',
          'group-focus-within:-translate-y-1.5 group-focus-within:scale-[1.02]',
          'overflow-hidden',
          hasPhoto ? '' : compact ? 'p-s4' : 'p-s4 md:px-[28px] md:py-s5',
        ].join(' ')}
      >
        {/* The spec line: solid copper at rest, inverting to ink on hover. */}
        <span
          aria-hidden="true"
          className={[
            'absolute inset-x-0 top-0 z-10 h-0.5 bg-apex-copper',
            'transition-colors duration-[var(--dur-hover)] ease-out',
            'group-hover:bg-apex-ink group-focus-within:bg-apex-ink',
          ].join(' ')}
        />

        {hasPhoto ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={`/images/${image}`}
              alt={imageAlt ?? ''}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              style={{ objectFit: 'cover', objectPosition: focalPoint }}
              // Gentle zoom on hover — the photo itself carries the lift
              // feedback the icon badge used to (Z.35), never on a link's own
              // image per the codebase's own hover-image convention
              // (ProjectCard is the only other place this pattern lives).
              className="transition-transform duration-[var(--dur-hover)] ease-out group-hover:scale-105 group-focus-within:scale-105"
            />
          </div>
        ) : null}

        <div className={hasPhoto ? 'flex flex-1 flex-col p-s4 md:px-[28px] md:py-s5' : 'flex flex-1 flex-col'}>
          {Icon && !compact && !hasPhoto ? (
            /* Icon badge: 48px squircle at --r-lg — a radius one step BELOW the
               parent card's --r-xl, never equal and never larger (§4.6a's
               nesting rule). Inverts to copper fill with a white icon. */
            <span
              className={[
                'mb-s4 inline-flex size-12 items-center justify-center rounded-lg bg-n-100',
                'transition-[background-color,rotate] duration-[var(--dur-hover)] ease-out',
                'group-hover:bg-apex-copper group-focus-within:bg-apex-copper',
                'group-hover:rotate-3 group-focus-within:rotate-3',
              ].join(' ')}
            >
              <Icon
                aria-hidden="true"
                strokeWidth={2}
                className="size-6 text-apex-ink transition-colors duration-[var(--dur-hover)] ease-out group-hover:text-white group-focus-within:text-white"
              />
            </span>
          ) : null}

          <h3 className="text-h3 text-apex-ink">{title}</h3>

          {description ? (
            <p className="mt-s2 text-body text-n-700">{description}</p>
          ) : null}

          {/*
           * Pinned to the card bottom via margin-top:auto, with the grid at
           * align-items:stretch, so cards of varying copy length produce even
           * heights without a min-height hack (§5.5, B.17).
           *
           * The ::after overlay is what makes the whole card clickable while
           * keeping this link the single labelled control.
           */}
          <Link
            href={href}
            className={[
              'mt-auto pt-s4 inline-flex min-h-11 items-center font-geist font-bold',
              'text-[var(--accent)]',
              'after:absolute after:inset-0 after:content-[""]',
              'transition-colors duration-[var(--dur-hover)] ease-out',
            ].join(' ')}
          >
            {linkLabel}
          </Link>
        </div>
      </article>
    </li>
  );
}
