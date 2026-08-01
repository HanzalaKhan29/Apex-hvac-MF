/**
 * The canonical NAP block — Appendix F.0, §8.5, §9.1's binding rule.
 *
 * The phone number is defined ONCE, here. No component may render a phone
 * number except through <PhoneLink /> (§9.1), which reads it from this module.
 * That is what makes NAP consistency (§8.5) and the DNI pattern (§8.6) a
 * one-place concern.
 *
 * The number in HVACBusiness JSON-LD, in the footer NAP block, and in
 * <PhoneLink />'s default is ALWAYS the canonical Google Business Profile
 * number. Dynamic number insertion never rewrites structured data (§8.6).
 */

import { ph } from './placeholders';

export const BUSINESS_NAME = 'Apex Comfort Systems';

/** §2.1 — "Comfort, Engineered." */
export const TAGLINE = 'Comfort, Engineered.';

export const SITE_URL = 'https://www.apexcomfortsystems.com';

/** Display form. §9.4-flagged — confirm before launch. */
export const PHONE_DISPLAY = ph('phone') ?? '';

/** E.164, for tel: hrefs and structured data. */
export const PHONE_E164 = '+16025550100';

export const EMAIL = ph('email');

/**
 * §8.5 — the address must mirror the Google Business Profile exactly.
 * Street address is CLIENT ACTION REQUIRED; the locality, region and country
 * are load-bearing for LocalBusiness schema and are stated in §2.1.
 */
export const ADDRESS = {
  streetAddress: null as string | null,
  addressLocality: 'Phoenix',
  addressRegion: 'AZ',
  postalCode: null as string | null,
  addressCountry: 'US',
} as const;

/**
 * §2.1 market order — Phoenix, Scottsdale, Tempe, Mesa, Chandler.
 *
 * A.5: these five strings are byte-identical everywhere they appear — the
 * footer, /service-areas, every Service node's areaServed, and the Google
 * Business Profile — so NAP and coverage facts never diverge (§8.2, §8.5).
 */
export const SERVICE_AREAS = [
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
] as const;

/** §5.1 topbar line. */
export const EMERGENCY_LINE = '24/7 Emergency Service — Phoenix Metro';

/**
 * A.0.4 — openingHoursSpecification. 24/7 is the emergency dispatch
 * availability described in §2.5, not a same-day promise.
 */
export const OPENING_HOURS = {
  dayOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  opens: '00:00',
  closes: '23:59',
} as const;

export const PRICE_RANGE = '$$';
