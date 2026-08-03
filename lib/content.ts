/**
 * Shared page copy. §8.4's v1 obligation: all UI copy lives in a single
 * message catalogue, never inline in components — the architecture that makes
 * the Phase 2 Spanish translation a content task rather than a refactor.
 *
 * Every §9.4-flagged value is read from lib/placeholders.ts, never written
 * here as a literal.
 */

import { ph } from './placeholders';

/* -------------------------------------------------------------------------
   Homepage — §5, A.1
   ------------------------------------------------------------------------- */

export const HOME = {
  hero: {
    eyebrow: 'PHOENIX METRO · LICENSED HVAC CONTRACTOR',
    heading: 'Comfort, Engineered for Phoenix Heat.',
    subhead:
      'Licensed residential and commercial HVAC. Same-day repair, flat-rate pricing, and technicians who show up when they say they will. Serving Phoenix, Scottsdale, Tempe, Mesa, and Chandler.',
  },

  services: {
    eyebrow: 'WHAT WE DO',
    heading: 'HVAC Service for Every Failure Mode',
  },

  /**
   * §5.6 — four stats. Two have values stated in v1.1 (years, reviews); the
   * other two have NONE and render B.18's em-dash until the client supplies
   * them. No figure is invented (§9.4).
   */
  stats: [
    { value: ph('yearsInBusiness'), label: 'Years serving Phoenix' },
    { value: ph('reviewCount'), label: 'Customer reviews' },
    { value: ph('systemsInstalled'), label: 'Systems installed' },
    { value: ph('satisfactionPct'), label: 'Customer satisfaction' },
  ],

  whyApex: {
    eyebrow: 'WHY APEX',
    heading: 'Evidence, not adjectives.',
    badge: { value: ph('yearsInBusiness'), label: 'Years in Phoenix' },
  },

  financing: {
    heading: 'Financing available on system replacement.',
    body: 'A failed system is rarely a planned expense. Financing options are presented before you commit to anything, so the decision is about the right system rather than what you can cover this month.',
  },

  process: {
    eyebrow: 'HOW IT WORKS',
    heading: 'Four steps, no surprises in between.',
    steps: [
      {
        title: 'Call or request a quote',
        description:
          'A dispatcher takes the details and books the window, not an answering service. Emergency calls jump the queue, day or night.',
      },
      {
        title: 'On-site diagnosis',
        description:
          'A licensed technician measures rather than guesses: pressures, electrical draw, airflow. You get the finding in plain language.',
      },
      {
        title: 'Flat-rate price, approved first',
        description:
          'The price is quoted before anything is opened up, and it does not move once you approve it. No hourly meter, no discovered extras.',
      },
      {
        title: 'Work completed and verified',
        description:
          'We confirm the fix with the same instruments used to diagnose it, and leave a written summary of what failed and what was done.',
      },
    ],
  },

  reviews: {
    eyebrow: 'WHAT CUSTOMERS SAY',
    heading: 'Reviews, with the detail that makes them real.',
  },

  footerCta: {
    heading: 'Tell us what the system is doing.',
    body: 'Describe the fault and we will tell you what it usually means before anyone is dispatched. Call for the fastest answer, or leave your details and a dispatcher calls back within 30 minutes.',
  },
} as const;

/**
 * §5.10 — homepage reviews, curated for service-type diversity: ONE EMERGENCY
 * REPAIR, ONE COMMERCIAL, ONE FINANCING OR INSTALL (B.28). That curation rule
 * is how commercial evidence reaches the homepage now that §3.3's homepage
 * projects teaser grid is withdrawn.
 *
 * DEMO MODE (§5.10): neutral quotation treatment, no Google "G", no star row,
 * no verified badge, initials-plus-city attribution, and the in-card
 * "Illustrative" label. All of it is illustrative structure — see §9.4's
 * reviewContent flag. NO Review or AggregateRating markup is emitted anywhere
 * while this is the case.
 */
export const DEMO_REVIEWS = [
  {
    quote:
      'Called at 6am on a Saturday with the AC dead and the house already at 88°F. Technician was here before 9 and had it running by 10. Told me exactly what the part cost before he fitted it.',
    attribution: 'M.R., Chandler',
    serviceTag: 'AC Repair',
  },
  {
    quote:
      'We run four retail units across the valley. Apex took over the maintenance contract last year and the difference is the reporting. I can see which rooftop unit is trending badly before it strands a store on a Friday.',
    attribution: 'D.L., Phoenix',
    serviceTag: 'Commercial HVAC',
  },
  {
    quote:
      'They ran the load calculation and came back a half-tonne smaller than the unit we had. Explained why, showed the numbers, and walked us through the financing before we agreed to anything.',
    attribution: 'S.K., Scottsdale',
    serviceTag: 'AC Replacement',
  },
  {
    quote:
      'Second opinion after another company quoted a full replacement. Their technician found a stuck contactor instead, a $200 fix. Not every call ends in a big-ticket sale here, and that is exactly why we call them first now.',
    attribution: 'J.P., Tempe',
    serviceTag: 'AC Repair',
  },
  {
    quote:
      'Twice-yearly maintenance plan caught a refrigerant leak before it took the compressor with it. The visit report showed pressures against last spring so the drop was obvious, not a guess.',
    attribution: 'A.N., Mesa',
    serviceTag: 'Maintenance',
  },
  {
    quote:
      'Furnace stopped mid-cold-snap on a Sunday night. Dispatcher called back in under ten minutes and a technician had heat running again before midnight. Straightforward invoice, no overtime surprise.',
    attribution: 'R.T., Chandler',
    serviceTag: 'Heating Repair',
  },
  {
    quote:
      'Restaurant kitchen unit went down on a Friday lunch rush. They moved us ahead of the queue and had a tech on the roof within the hour. That kind of response is the whole reason we keep the contract.',
    attribution: 'C.V., Phoenix',
    serviceTag: 'Commercial HVAC',
  },
  {
    quote:
      'Duct system was original to the house and leaking badly at every joint. Full resealing dropped the upstairs temperature by several degrees without touching the thermostat. Should have called sooner.',
    attribution: 'K.B., Scottsdale',
    serviceTag: 'Ductwork',
  },
  {
    quote:
      'New install crew laid drop cloths room to room, walked us through the thermostat before leaving, and the permit inspection passed on the first visit. Nothing about it felt rushed.',
    attribution: 'E.H., Tempe',
    serviceTag: 'AC Replacement',
  },
] as const;

/**
 * §5.4 — the manufacturer strip. GATED (§9.4, B.30, D.2). Until dealer status
 * is confirmed for four or more brands, <LogoStrip /> renders these as a
 * "Brands We Service" TEXT LIST, which asserts servicing rather than
 * partnership and requires no permission. That is the DEFAULT state.
 */
/**
 * width/height are each file's REAL intrinsic pixel size (verified via the
 * PNG header, not guessed). Next/Image's `aspect-ratio: auto W/H` falls back
 * to these props only until the real image decodes; a mismatched fallback
 * (e.g. a generic 140×48 box against Carrier's real 262×142 oval) reserves
 * the wrong box during that load window, which read as a cropped logo.
 */
export const MANUFACTURER_BRANDS = [
  { name: 'Carrier', src: 'manufacturer-carrier.png', width: 367, height: 148 },
  { name: 'Trane', src: 'manufacturer-trane.png', width: 468, height: 148 },
  { name: 'Lennox', src: 'manufacturer-lennox.png', width: 527, height: 148 },
  { name: 'Rheem', src: 'manufacturer-rheem.png', width: 153, height: 148 },
  { name: 'York', src: 'manufacturer-york.png', width: 733, height: 148 },
  { name: 'Daikin', src: 'manufacturer-daikin.png', width: 642, height: 148 },
] as const;

/**
 * §8.3 — the main FAQ page's seven questions, verbatim and in order (A.12).
 * No service page re-declares any of them (§8.3's content map).
 *
 * Answers lead with the direct answer in the first sentence, elaboration after
 * — the AEO mechanism, not a style preference. Answers touching §9.4-gated
 * values render the structural answer and defer the specific figure.
 */
export const MAIN_FAQ = [
  {
    question: 'How much does AC repair cost in Phoenix?',
    answer:
      'Repairs are quoted at a flat rate, given on site before any work starts, so the number you approve is the number you pay. What it comes to depends on the fault. A capacitor or contactor is at the low end, a compressor or coil at the high end. Our published price list is confirmed with each customer before booking rather than advertised as a range that changes on the day.',
  },
  {
    question: 'How fast can you send a technician?',
    answer:
      'We respond within 30 minutes, 24/7. That is a human calling you back, not an automated acknowledgement. Dispatch is a separate promise: call before 4pm and a technician is on the way within two hours, seven days a week. Same-day completion is available and depends on capacity, so we tell you which of those three you are getting when we call.',
  },
  {
    question: 'Do you offer financing for a new AC system?',
    answer:
      'Yes, financing is available for system replacement, and the options are presented before you commit to anything. Terms depend on the lender and on credit approval. The specific rates and term lengths are set out on our financing page once the lender agreement is confirmed, rather than advertised here.',
  },
  {
    question: 'How often should I service my HVAC system?',
    answer:
      'Twice a year in Phoenix: once before the cooling season and once before the heating season. That is more than the national default for a real reason: cooling equipment here runs a far longer season at a higher duty cycle, and the desert dust load fouls coils and filters faster than an annual visit can keep ahead of.',
  },
  {
    question: 'What brands of HVAC systems do you install?',
    answer:
      'We service all major residential and commercial brands regardless of who installed the system. The specific brands we are an authorised dealer for are confirmed before launch, because dealer status is a factual claim about a manufacturer relationship rather than a marketing line.',
  },
  {
    question: 'Do you service commercial properties?',
    answer:
      'Yes. Offices, retail, restaurants and multi-tenant buildings across the Phoenix metro, on rooftop packaged units and split systems. Commercial work runs under maintenance contracts or emergency call-out, and a portfolio of properties can sit under one contract with a single account contact.',
  },
  {
    question: 'What areas do you serve?',
    answer:
      'Phoenix, Scottsdale, Tempe, Mesa and Chandler. Each has its own service page describing the housing stock and the faults we see most there. If you are just outside those five, call anyway. We would rather tell you honestly whether we can reach you than take a booking we cannot hold.',
  },
] as const;
