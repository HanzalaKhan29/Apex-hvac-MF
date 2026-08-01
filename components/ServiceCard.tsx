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
 */

export interface ServiceCardProps {
  variant?: 'service' | 'city' | 'compact';
  icon?: LucideIcon;
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
  title,
  description,
  href,
  linkLabel,
}: ServiceCardProps) {
  const compact = variant === 'compact';

  return (
    <li className="group relative flex">
      <article
        className={[
          'relative flex w-full flex-col cursor-pointer',
          'rounded-xl border border-n-200 bg-white',
          // Shadow ACCOMPANIES the 1px border, it does not replace it (§4.7).
          'shadow-sm group-hover:shadow-md group-focus-within:shadow-md',
          // 4px lift on hover — the signature interaction.
          'transition-[translate,box-shadow] duration-[var(--dur-hover)] ease-out',
          'group-hover:-translate-y-1 group-focus-within:-translate-y-1',
          'overflow-hidden',
          compact ? 'p-s4' : 'p-s4 md:px-[28px] md:py-s5',
        ].join(' ')}
      >
        {/* The spec line: solid copper at rest, inverting to ink on hover. */}
        <span
          aria-hidden="true"
          className={[
            'absolute inset-x-0 top-0 h-0.5 bg-apex-copper',
            'transition-colors duration-[var(--dur-hover)] ease-out',
            'group-hover:bg-apex-ink group-focus-within:bg-apex-ink',
          ].join(' ')}
        />

        {Icon && !compact ? (
          /* Icon badge: 48px squircle at --r-lg — a radius one step BELOW the
             parent card's --r-xl, never equal and never larger (§4.6a's
             nesting rule). Inverts to copper fill with a white icon. */
          <span
            className={[
              'mb-s4 inline-flex size-12 items-center justify-center rounded-lg bg-n-100',
              'transition-colors duration-[var(--dur-hover)] ease-out',
              'group-hover:bg-apex-copper group-focus-within:bg-apex-copper',
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
      </article>
    </li>
  );
}
