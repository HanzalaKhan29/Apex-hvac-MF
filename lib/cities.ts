/**
 * The five city pages — Appendix A.6 and A.7.
 *
 * §8.4 item 4 requires AT LEAST ONE locally-specific detail per city so the
 * five pages are not thin duplicates. A.7 fixes that detail verbatim; the
 * second feature row is an observation in the same register, drawn from the
 * same housing stock §7's IMG-11 prompts describe for that city.
 *
 * No detail asserts a statistic, a rating, a job count, or any other
 * §9.4-flagged value (A.7).
 */

export const CITY_SLUGS = [
  'phoenix',
  'scottsdale',
  'tempe',
  'mesa',
  'chandler',
] as const;

export type CitySlug = (typeof CITY_SLUGS)[number];

export interface CityDetail {
  readonly title: string;
  readonly description: string;
}

export interface City {
  readonly slug: CitySlug;
  /** The name as it appears in SERVICE_AREAS — byte-identical (§8.2, §8.5). */
  readonly name: string;
  readonly h1: string;
  readonly eyebrow: string;
  /** Production filename from Appendix D.1.14–D.1.18. */
  readonly image: string;
  /**
   * D.1.14–18 and I.11: all five city heroes are DECORATIVE. Each page's H1
   * already states the city name, so empty alt is technically correct and less
   * noisy for screen-reader users. Deliberate, not an omission.
   */
  readonly imageAlt: '';
  readonly focalPoint: string;
  /** §8.2 direct-answer lede. Names the city in the first sentence (A.6). */
  readonly lede: string;
  /** Two rows; the first is A.7's fixed detail, verbatim. */
  readonly details: readonly [CityDetail, CityDetail];
  readonly seoTitle: string;
  readonly metaDescription: string;
}

/** A.6 — the shared meta description pattern for all five city pages. */
const metaFor = (city: string) =>
  `Licensed and insured HVAC in ${city}, AZ. Same-day service available, flat-rate pricing, no surprises. Call 24/7 or get your flat-rate quote.`;

export const CITIES: Record<CitySlug, City> = {
  phoenix: {
    slug: 'phoenix',
    name: 'Phoenix',
    h1: 'HVAC Service in Phoenix, AZ',
    eyebrow: 'PHOENIX, ARIZONA',
    image: 'service-area-phoenix.jpg',
    imageAlt: '',
    focalPoint: '50% 65%',
    lede:
      'Apex Comfort Systems provides licensed residential and commercial HVAC service across Phoenix, from the central corridor to the north and south valley. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week. We know the housing stock here well enough to check the usual local causes first rather than working through a generic script.',
    details: [
      {
        title: 'Original duct runs in central-corridor housing',
        description:
          'Central-corridor housing stock is largely 1960s–70s block-and-stucco with original duct runs and undersized returns. That is the most common cause of uneven cooling on repair calls in these neighbourhoods.',
      },
      {
        title: 'Block wall construction changes the load calculation',
        description:
          'Painted concrete block holds heat well into the evening and re-radiates it indoors long after sunset, so a replacement sized purely on floor area tends to come out short. The calculation has to account for the wall assembly, not just the square footage.',
      },
    ],
    seoTitle: 'HVAC Service in Phoenix, AZ | Apex Comfort Systems',
    metaDescription: metaFor('Phoenix'),
  },

  scottsdale: {
    slug: 'scottsdale',
    name: 'Scottsdale',
    h1: 'HVAC Service in Scottsdale, AZ',
    eyebrow: 'SCOTTSDALE, ARIZONA',
    image: 'service-area-scottsdale.jpg',
    imageAlt: '',
    focalPoint: '50% 65%',
    lede:
      'Apex Comfort Systems provides licensed residential and commercial HVAC service throughout Scottsdale, including the Troon and Pinnacle Peak corridors. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week. Larger custom homes here need a different diagnostic sequence, and we start from that assumption rather than discovering it on site.',
    details: [
      {
        title: 'Multi-zone and dual-system homes',
        description:
          'Larger custom homes in the Troon and Pinnacle Peak corridors commonly run multi-zone or dual-system setups, which change both the diagnostic sequence and the replacement quote.',
      },
      {
        title: 'Zone dampers and controls fail quietly',
        description:
          'On a zoned system a failed damper motor or a miscalibrated zone controller presents exactly like a failing compressor: one part of the house will not cool while the equipment reads normal. Checking the zoning before condemning the equipment is what keeps a control repair from becoming a system quote.',
      },
    ],
    seoTitle: 'HVAC Service in Scottsdale, AZ | Apex Comfort Systems',
    metaDescription: metaFor('Scottsdale'),
  },

  tempe: {
    slug: 'tempe',
    name: 'Tempe',
    h1: 'HVAC Service in Tempe, AZ',
    eyebrow: 'TEMPE, ARIZONA',
    image: 'service-area-tempe.jpg',
    imageAlt: '',
    focalPoint: '50% 65%',
    lede:
      'Apex Comfort Systems provides licensed residential and commercial HVAC service across Tempe, including the mid-century neighbourhoods around the university and the older established streets south of the lake. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week.',
    details: [
      {
        title: 'Shaded condensers and retrofitted line sets',
        description:
          'Mid-century ranch stock with mature tree cover means shaded condensers and long, retrofitted line sets. Both are worth checking before a system is written off as failed.',
      },
      {
        title: 'Rental turnover leaves undocumented equipment history',
        description:
          'A lot of Tempe housing has cycled through rental ownership, so equipment often carries mixed-vintage parts and no service record. We read the nameplate and the actual measurements rather than trusting what the last invoice claimed was fitted.',
      },
    ],
    seoTitle: 'HVAC Service in Tempe, AZ | Apex Comfort Systems',
    metaDescription: metaFor('Tempe'),
  },

  mesa: {
    slug: 'mesa',
    name: 'Mesa',
    h1: 'HVAC Service in Mesa, AZ',
    eyebrow: 'MESA, ARIZONA',
    image: 'service-area-mesa.jpg',
    imageAlt: '',
    focalPoint: '50% 65%',
    lede:
      'Apex Comfort Systems provides licensed residential and commercial HVAC service across Mesa, covering the tile-roof tract neighbourhoods and the older central grid alike. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week. Attic-mounted equipment is the norm here, and it changes what we check first.',
    details: [
      {
        title: 'Attic air handlers and duct leakage',
        description:
          'Tile-roof tract housing typically places the air handler in the attic, where summer attic temperatures make duct leakage a far larger efficiency loss than the equipment rating suggests.',
      },
      {
        title: 'Condensate overflow is an attic problem, not a nuisance',
        description:
          'An attic air handler with a blocked primary drain sends water through the ceiling below before anyone notices a comfort problem. Clearing the condensate line and confirming the secondary pan switch actually works is part of every visit here, not an optional extra.',
      },
    ],
    seoTitle: 'HVAC Service in Mesa, AZ | Apex Comfort Systems',
    metaDescription: metaFor('Mesa'),
  },

  chandler: {
    slug: 'chandler',
    name: 'Chandler',
    h1: 'HVAC Service in Chandler, AZ',
    eyebrow: 'CHANDLER, ARIZONA',
    image: 'service-area-chandler.jpg',
    imageAlt: '',
    focalPoint: '50% 65%',
    lede:
      'Apex Comfort Systems provides licensed residential and commercial HVAC service across Chandler, including the master-planned subdivisions south and east of downtown. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week. Two-storey homes on a single system are the common local pattern, and that shapes the diagnosis.',
    details: [
      {
        title: 'One system across two floors',
        description:
          '1990s–2000s master-planned two-storey homes usually run a single system across both floors, which is the standard starting point for upstairs-won’t-cool complaints.',
      },
      {
        title: 'Return air is usually the constraint',
        description:
          'In these floor plans the upstairs return is frequently undersized for the load it carries, so the equipment reads healthy while the second floor runs several degrees warm. Measuring return static before quoting equipment is what separates a duct fix from an unnecessary system replacement.',
      },
    ],
    seoTitle: 'HVAC Service in Chandler, AZ | Apex Comfort Systems',
    metaDescription: metaFor('Chandler'),
  },
};

export const CITY_LIST: readonly City[] = CITY_SLUGS.map((slug) => CITIES[slug]);

export function isCitySlug(value: unknown): value is CitySlug {
  return typeof value === 'string' && (CITY_SLUGS as readonly string[]).includes(value);
}

export function cityPath(slug: CitySlug): string {
  return `/service-areas/${slug}`;
}
