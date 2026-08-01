import { Award, CalendarClock, ShieldCheck, Star, Timer } from 'lucide-react';
import type { TrustBadgeProps } from '@/components/TrustBadge';
import { SERVICE_LIST, servicePath, serviceLinkLabel, type ServiceSlug } from './services';
import { CITY_LIST, cityPath } from './cities';
import { SERVICE_ICONS } from './service-icons';
import { ph } from './placeholders';

/** <ServiceCard /> props for all six services, in §5.5 card order. */
export function serviceCards() {
  return SERVICE_LIST.map((service) => ({
    icon: SERVICE_ICONS[service.slug],
    title: service.cardTitle,
    description: service.cardDescription,
    href: servicePath(service.slug),
    linkLabel: serviceLinkLabel(service),
  }));
}

/** Related-services cards for a given service (A.4, §8.1 internal linking). */
export function relatedCards(slugs: readonly ServiceSlug[]) {
  return slugs.map((slug) => {
    const service = SERVICE_LIST.find((s) => s.slug === slug)!;
    return {
      icon: SERVICE_ICONS[slug],
      title: service.cardTitle,
      description: service.cardDescription,
      href: servicePath(slug),
      linkLabel: serviceLinkLabel(service),
    };
  });
}

/** <ServiceCard variant="city" /> props for all five cities. */
export function cityCards() {
  return CITY_LIST.map((city) => ({
    variant: 'city' as const,
    title: city.name,
    description: city.details[0].description.slice(0, 130),
    href: cityPath(city.slug),
    linkLabel: `${city.name} →`,
  }));
}

/**
 * §5.3's hero trust row, and the identical row on every service and city page
 * (A.3, A.6).
 *
 * §9.4's rating rules are enforced MECHANICALLY here rather than by
 * discipline: <TrustBadge /> renders nothing where `numeric` is null, so if
 * review volume drops under 50 the count entry becomes null and disappears,
 * and if the rating drops under 4.5 the whole rating badge disappears and the
 * row falls back to the remaining signals (B.16).
 *
 * Copy uses the "same-day" term correctly per §2.5's vocabulary table — never
 * "guaranteed", never blended with respond or dispatch.
 */
export function heroTrustRow(): TrustBadgeProps[] {
  const rating = ph('googleRating');
  const count = ph('reviewCount');

  return [
    {
      icon: Award,
      numeric: ph('yearsInBusiness'),
      label: 'Years Serving Phoenix',
    },
    {
      icon: Star,
      // "4.9★" is one numeric unit, so the star sits in Roboto with the digits
      // and the row reads exactly as §5.3 writes it: `4.9★ (800+ Reviews)`.
      // U+2605 is in the Roboto unicode-range subset (§4.3) for this reason.
      numeric: rating ? `${rating}★` : null,
      label: count ? `(${count} Reviews)` : 'Rating',
    },
    {
      icon: CalendarClock,
      label: 'Same-Day Service Available',
    },
  ];
}

/**
 * A.3 / A.6 — the trust row shared by all six service pages and all five city
 * pages. The response-time badge is the "Respond" term and is never blended
 * with dispatch or same-day language (§2.5). It is §9.4-flagged and must be
 * operationally true before launch.
 */
export function pageTrustRow(): TrustBadgeProps[] {
  return [
    { icon: ShieldCheck, label: 'Licensed · Bonded · Insured' },
    {
      icon: Timer,
      label: `We respond within ${ph('responseWindow')}, 24/7`,
    },
    { icon: CalendarClock, label: 'Same-Day Service Available' },
  ];
}

/** §3.4's CTA label lock. No other quote-CTA wording appears anywhere. */
export const CTA = {
  full: 'Get Your Flat-Rate Quote',
  header: 'Get a Quote',
  sticky: 'Get Quote',
  call: 'Call Now — 24/7',
} as const;
