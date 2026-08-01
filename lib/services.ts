/**
 * The six service pages — Appendix A.4, §5.5, §8.3's per-service FAQ map.
 *
 * Pure data: no UI imports, so the Server Action (Appendix G) can validate the
 * service enum against this module without pulling components into its bundle.
 * Icons are mapped separately in lib/service-icons.ts.
 *
 * Copy discipline (§5.5, B.17): card title <= 32 characters, card description
 * 90-130 characters with a hard cap of 140. Enforced by scripts/check-copy.mjs.
 */

export const SERVICE_SLUGS = [
  'ac-repair',
  'ac-replacement-installation',
  'heating-furnace-repair',
  'commercial-hvac',
  'maintenance-plans',
  'indoor-air-quality',
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface ServiceBodyItem {
  readonly title: string;
  readonly description: string;
}

export interface Service {
  readonly slug: ServiceSlug;
  /** Card title. <= 32 characters (§5.5). */
  readonly cardTitle: string;
  /** Card description. 90-130 characters, hard cap 140 (§5.5). */
  readonly cardDescription: string;
  /** Page H1 (A.4). */
  readonly h1: string;
  /** Page eyebrow (A.4). */
  readonly eyebrow: string;
  /** Schema.org Service.serviceType (A.4). */
  readonly serviceType: string;
  /** Production filename from Appendix D. */
  readonly image: string;
  /** Alt text from Appendix D. */
  readonly imageAlt: string;
  /** object-position pair from Appendix D. */
  readonly focalPoint: string;
  /**
   * The §8.2 direct-answer lede: what the service is, who it is for, and the
   * differentiator, inside the first 100 words, written to be quotable
   * standalone. This is the GEO extraction surface.
   */
  readonly lede: string;
  /** Service body — failure modes, what we do, what's included (A.3 §2). */
  readonly body: readonly ServiceBodyItem[];
  /** 2-3 sibling services (A.4, §8.1 internal linking). */
  readonly related: readonly ServiceSlug[];
  readonly seoTitle: string;
  readonly metaDescription: string;
  /** 4-6 questions, none duplicated from /faq's seven (§8.3). */
  readonly faq: readonly FaqItem[];
}

export const SERVICES: Record<ServiceSlug, Service> = {
  'ac-repair': {
    slug: 'ac-repair',
    cardTitle: 'AC Repair & Diagnostics',
    cardDescription:
      'AC not cooling? Same-day diagnostics, refrigerant recharge, and compressor repair on all major brands.',
    h1: 'AC Repair in Phoenix, AZ',
    eyebrow: 'AC REPAIR & DIAGNOSTICS',
    serviceType: 'AC Repair',
    image: 'ac-repair-manifold-gauge.jpg',
    imageAlt:
      'Gloved technician hands connecting a digital refrigerant manifold gauge to an air conditioner service valve',
    focalPoint: '45% 50%',
    lede:
      'Apex Comfort Systems repairs residential and commercial air conditioning across the Phoenix metro. A licensed technician diagnoses the fault on site, gives you the flat-rate price before any work starts, and carries the parts that cover most common failures, including capacitors, contactors, fan motors and refrigerant leaks, so a single visit usually ends with cold air. Same-day service is available seven days a week, and emergency calls jump the queue day or night.',
    body: [
      {
        title: 'The failure modes we see most',
        description:
          'Warm air from the vents, a unit that runs without cooling, short cycling, frozen evaporator coils, a tripped breaker that will not reset, and water pooling at the air handler. Each has a different cause and a different fix, so the diagnosis comes first, not the quote.',
      },
      {
        title: 'What the visit looks like',
        description:
          'The technician measures refrigerant pressures and superheat, checks the electrical draw against the nameplate rating, inspects the coils and the condensate line, and tests the thermostat call. You get the finding in plain language and the flat-rate price before anything is opened up.',
      },
      {
        title: "What's included",
        description:
          'On-site diagnosis, the flat-rate repair price with no hourly surprises, parts carried on the van for the common failures, and a written summary of what failed and why. If the honest answer is that replacement beats repair, we say so and show you the maths.',
      },
    ],
    related: [
      'ac-replacement-installation',
      'maintenance-plans',
      'indoor-air-quality',
    ],
    seoTitle: 'AC Repair in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'Same-day AC repair available across Phoenix metro. Licensed and insured technicians, flat-rate pricing, no surprises. Call 24/7 or get a flat-rate quote.',
    faq: [
      {
        question: 'What are signs my AC needs repair vs. replacement?',
        answer:
          'Repair usually wins when the system is under about ten years old and the fault is a single component: a capacitor, contactor, fan motor or a fixable leak. Replacement usually wins when the system is past twelve years, uses R-22 refrigerant, or the compressor or condenser coil has failed, because those repairs approach the cost of a new system. We give you both numbers on the same visit so the choice is yours, not ours.',
      },
      {
        question: 'Why is my AC blowing warm air?',
        answer:
          'The most common causes are low refrigerant from a leak, a failed capacitor stopping the compressor, a tripped breaker on the condenser circuit, or a frozen evaporator coil from restricted airflow. A blocked filter causes the last of those more often than anything else in Phoenix, where dust load is high. Turn the system to fan-only to let a frozen coil thaw before a technician arrives. It makes the diagnosis faster.',
      },
      {
        question: 'How long does an AC repair typically take?',
        answer:
          'Most repairs finish in the same visit, usually within one to two hours once the technician is on site. Capacitor, contactor and thermostat replacements are quick. A refrigerant leak that has to be located, repaired and recharged takes longer, and a failed compressor or coil is a parts-order job rather than a same-visit fix. You are told which category you are in before work begins.',
      },
      {
        question: 'Do you repair all AC brands?',
        answer:
          'Yes. We service all major residential and commercial brands regardless of who installed the system. Diagnostic procedure and the common failure parts are largely shared across manufacturers, and brand-specific components are ordered where a repair needs them.',
      },
    ],
  },

  'ac-replacement-installation': {
    slug: 'ac-replacement-installation',
    cardTitle: 'AC Replacement & Install',
    cardDescription:
      'System past saving? Right-sized replacement with a permitted install, old unit hauled away, and financing available.',
    h1: 'AC Replacement & Installation in Phoenix, AZ',
    eyebrow: 'AC REPLACEMENT & INSTALLATION',
    serviceType: 'AC Installation',
    image: 'ac-replacement-install.jpg',
    imageAlt:
      'Two technicians positioning and levelling a new outdoor condenser unit beside a Phoenix stucco home',
    focalPoint: '50% 55%',
    lede:
      'Apex Comfort Systems replaces and installs complete cooling systems for Phoenix-area homeowners and businesses. Every replacement starts with a load calculation rather than a guess at tonnage, because an oversized unit short-cycles and never dehumidifies. You get the flat-rate price in writing, a permitted install, the old equipment hauled away, and financing options presented before you commit to anything.',
    body: [
      {
        title: 'Sizing is a calculation, not a guess',
        description:
          'We run a room-by-room load calculation against your actual square footage, insulation, window area and orientation. Matching the tonnage that was there before repeats whatever mistake was made last time, and in Phoenix an oversized system cools fast, shuts off, and leaves the house clammy and uneven.',
      },
      {
        title: 'The install is the product',
        description:
          'Line sets are evacuated to a measured vacuum, the charge is weighed in rather than guessed, the pad is levelled, and the ductwork connection is sealed. Two identical units installed two different ways do not perform the same, and the difference shows up on your power bill every month for the next fifteen years.',
      },
      {
        title: "What's included",
        description:
          'Load calculation, equipment and labour at a flat rate, permit and inspection, removal and disposal of the old system, a commissioning report with the measured charge and airflow, and the manufacturer warranty registered in your name before we leave.',
      },
    ],
    related: ['ac-repair', 'maintenance-plans', 'indoor-air-quality'],
    seoTitle: 'AC Replacement & Installation in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'New AC systems installed across Phoenix metro. Licensed and insured, flat-rate pricing, financing available. Call 24/7 or get a flat-rate quote.',
    faq: [
      {
        question: 'How long does a full system replacement take?',
        answer:
          'A straight residential changeout is a one-day job, typically six to eight hours from arrival to commissioning. It runs longer when the ductwork needs modification, the electrical service needs upgrading, or the air handler sits in a tight attic. We tell you which of those apply after the site survey, not on the day.',
      },
      {
        question: 'What size AC unit do I need for my home?',
        answer:
          'The right size comes from a load calculation, not from the tonnage of the old unit or a rule of thumb per square foot. The calculation accounts for your insulation, window area and orientation, ceiling height, and duct condition. In Phoenix the west-facing glass load matters more than most homeowners expect, and it frequently changes the answer.',
      },
      {
        question: "What's the difference between SEER ratings?",
        answer:
          'SEER measures cooling output per unit of electricity across a season, so a higher number means lower running cost for the same comfort. The gap matters more in Phoenix than almost anywhere else because the cooling season is long and the equipment runs hard. Whether the higher-SEER unit pays back within the time you plan to own the home is the question worth asking, and we run that comparison with your actual utility rate.',
      },
      {
        question: 'Can I finance a new system?',
        answer:
          'Yes. Financing is available for system replacement, and the options are presented before you commit to anything. Terms depend on the lender and on credit approval; the specific rates and term lengths are set out on our financing page rather than quoted here.',
      },
    ],
  },

  'heating-furnace-repair': {
    slug: 'heating-furnace-repair',
    cardTitle: 'Heating & Furnace Repair',
    cardDescription:
      'No heat on a cold desert morning? Ignition, heat exchanger and thermostat repair on gas and electric furnaces.',
    h1: 'Heating & Furnace Repair in Phoenix, AZ',
    eyebrow: 'HEATING & FURNACE REPAIR',
    serviceType: 'Furnace Repair',
    image: 'furnace-inspection.jpg',
    imageAlt:
      'Technician using a flashlight to inspect the internal panel of an indoor gas furnace',
    focalPoint: '42% 45%',
    lede:
      'Apex Comfort Systems repairs gas and electric furnaces and heat pumps across the Phoenix metro. Desert winters are short, which is exactly why heating faults tend to surface all at once on the first genuinely cold morning, after months of the system sitting idle. A licensed technician diagnoses the fault on site, prices the repair flat-rate before starting, and treats any suspected gas or carbon-monoxide issue as an emergency rather than a scheduling problem.',
    body: [
      {
        title: 'The failure modes we see most',
        description:
          'A furnace that ignites and then shuts down after a few seconds, a blower running with no heat, a pilot or hot-surface igniter that will not light, a cracked heat exchanger found on inspection, and thermostats that were never configured for heat-pump changeover.',
      },
      {
        title: 'Safety is checked before comfort',
        description:
          'Every heating call includes a combustion and venting check. A cracked heat exchanger or a blocked flue is a carbon-monoxide risk, not an efficiency note, and we will red-tag a system and tell you plainly rather than patch around it. If you smell gas, leave the building and call the gas utility first, then us.',
      },
      {
        title: "What's included",
        description:
          'On-site diagnosis, combustion and venting safety check, the flat-rate repair price before work starts, common ignition and control parts carried on the van, and a written summary of the finding. Electric and gas furnaces and heat pumps are all serviced.',
      },
    ],
    related: ['ac-repair', 'maintenance-plans', 'indoor-air-quality'],
    seoTitle: 'Furnace Repair in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'Heating and furnace repair across Phoenix metro. Licensed and insured technicians, flat-rate pricing, same-day service available. Call 24/7.',
    faq: [
      {
        question: 'How often should a furnace be serviced in Phoenix?',
        answer:
          'Once a year, before the first cold snap. Phoenix furnaces run few hours compared with colder climates, but they sit idle for eight or nine months collecting dust, and that idle period is what causes most first-cold-morning failures. An annual check catches igniter wear, flame-sensor fouling and blocked flues before they leave you without heat.',
      },
      {
        question: 'What are warning signs of a failing furnace?',
        answer:
          'Short cycling, a burner flame that is yellow rather than blue, soot around the unit, a rising gas bill without a change in use, banging on start-up, and rooms that never reach the thermostat setting. Any of these is worth a diagnosis before the system fails outright.',
      },
      {
        question: 'Is a gas smell near my furnace an emergency?',
        answer:
          'Yes. Leave the building, do not switch anything electrical on or off, and call your gas utility from outside. Then call us. A gas smell is never something to wait on or troubleshoot yourself, and we treat those calls as emergency dispatch day or night.',
      },
      {
        question: 'Do you service electric and gas furnaces?',
        answer:
          'Yes. Gas furnaces, electric furnaces and heat pumps, which are common in Phoenix housing stock. Heat pumps in particular are often misdiagnosed as failed when the real fault is a thermostat that was never set up for changeover, so that is checked before anything is replaced.',
      },
    ],
  },

  'commercial-hvac': {
    slug: 'commercial-hvac',
    cardTitle: 'Commercial HVAC',
    cardDescription:
      'Rooftop unit down? Emergency RTU service and scheduled maintenance for single sites or multi-property portfolios.',
    h1: 'Commercial HVAC in Phoenix, AZ',
    eyebrow: 'COMMERCIAL HVAC',
    serviceType: 'Commercial HVAC Service',
    image: 'commercial-rooftop-rtu.jpg',
    imageAlt:
      'Technician servicing the control panel of a large rooftop HVAC unit on a commercial roof, Phoenix skyline behind',
    focalPoint: '60% 50%',
    lede:
      'Apex Comfort Systems services commercial HVAC for offices, retail, restaurants and multi-tenant buildings across the Phoenix metro. We work on rooftop packaged units, split systems and light commercial refrigeration, under scheduled maintenance contracts or on emergency call-out. Facilities managers get one account contact rather than a dispatch queue, documented visit reports for every site, and portfolio-wide contracts where more than one property is involved.',
    body: [
      {
        title: 'Rooftop units and packaged equipment',
        description:
          'RTU diagnostics, compressor and economiser service, belt and bearing replacement, controls troubleshooting and curb-level repairs. Phoenix rooftops run at ambient temperatures well above the design envelope for months, which is why condenser-coil condition and economiser dampers are the first things checked.',
      },
      {
        title: 'Maintenance contracts and reporting',
        description:
          'Scheduled visits with a written condition report per unit, asset tagging so equipment history follows the machine rather than the technician, and prioritised response for contracted sites. Deferred maintenance on commercial equipment is cheap until the day it is not.',
      },
      {
        title: 'Portfolios and multi-tenant buildings',
        description:
          'Multiple properties can run under one contract with one point of contact and consolidated reporting. Tenant-occupied buildings get work scheduled around trading hours where the fault allows it. Completed commercial work is documented on our projects page.',
      },
    ],
    related: ['maintenance-plans', 'ac-repair', 'indoor-air-quality'],
    seoTitle: 'Commercial HVAC in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'Rooftop units, maintenance contracts and multi-property service across Phoenix metro. Licensed and insured commercial HVAC. Call 24/7 for a quote.',
    faq: [
      {
        question: 'Do you offer maintenance contracts for commercial properties?',
        answer:
          'Yes. Commercial maintenance contracts cover scheduled visits, a written condition report for every unit, asset tagging so each machine carries its own service history, and prioritised response ahead of non-contracted call-outs. Visit frequency is set against equipment age and duty rather than sold as a fixed package.',
      },
      {
        question: "What's your response SLA for a rooftop unit failure?",
        answer:
          'Contracted commercial sites are prioritised ahead of general call-outs, and the specific response window is written into the contract rather than promised generically. We would rather agree a target we can hold against your operating hours and equipment criticality than quote a number that sounds good and fails on the first hot Friday.',
      },
      {
        question: 'Do you service multi-tenant buildings?',
        answer:
          'Yes. Multi-tenant work is scheduled around trading hours wherever the fault allows, with access coordinated through building management. Where individual tenants hold their own equipment, we can bill by unit and report by tenant so the recharge is straightforward.',
      },
      {
        question: 'Can you handle a portfolio of properties under one contract?',
        answer:
          'Yes. A portfolio runs under a single contract with one account contact and consolidated reporting across all sites. Equipment history is tracked per asset, so a unit that keeps failing is visible as a pattern rather than as a series of unrelated invoices.',
      },
    ],
  },

  'maintenance-plans': {
    slug: 'maintenance-plans',
    cardTitle: 'Maintenance Plans',
    cardDescription:
      'Avoid the August breakdown. Scheduled visits, priority booking for members, and a written condition report each time.',
    h1: 'HVAC Maintenance Plans in Phoenix, AZ',
    eyebrow: 'MAINTENANCE PLANS',
    serviceType: 'HVAC Maintenance',
    image: 'maintenance-coil-service.jpg',
    imageAlt:
      'Technician brushing and inspecting an air handler coil during a scheduled maintenance visit, checklist alongside',
    focalPoint: '45% 45%',
    lede:
      'Apex Comfort Systems maintenance plans are for Phoenix homeowners and businesses who would rather schedule a visit than wait for a failure in August. Members get scheduled tune-ups, priority booking ahead of general call-outs, and a written condition report after every visit so equipment wear is tracked rather than discovered. Plans keep manufacturer warranty requirements satisfied, which most warranties make conditional on documented annual service.',
    body: [
      {
        title: 'What a visit covers',
        description:
          'Coil cleaning, refrigerant pressure and superheat measurement, electrical draw against nameplate, capacitor and contactor condition, condensate line clearing, filter change, thermostat calibration and a blower and duct-static check. The findings go in writing, with anything trending toward failure flagged early.',
      },
      {
        title: 'Why Phoenix changes the schedule',
        description:
          'Cooling equipment here runs a far longer season and a higher duty cycle than the national average, and the dust load fouls coils and filters faster. That moves maintenance from a nice-to-have to the thing that decides whether a system reaches year twelve or year eight.',
      },
      {
        title: 'Plan tiers and pricing',
        description:
          'Plan tier names, what each includes, and pricing are confirmed with the client before launch and are not stated here. What is fixed is the structure: scheduled visits, priority booking, written reporting, and warranty-compliant documentation.',
      },
    ],
    related: ['ac-repair', 'ac-replacement-installation', 'indoor-air-quality'],
    seoTitle: 'HVAC Maintenance Plans in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'Scheduled HVAC maintenance across Phoenix metro. Licensed and insured technicians, flat-rate pricing, priority scheduling for members. Call 24/7.',
    faq: [
      {
        question: "What's included in a maintenance plan visit?",
        answer:
          'A visit covers coil cleaning, refrigerant pressure and superheat readings, electrical draw checked against the nameplate, capacitor and contactor condition, condensate line clearing, a filter change, thermostat calibration, and a blower and duct-static check. You get the findings in writing, including anything trending toward failure.',
      },
      {
        question: "How many visits per year are recommended in Phoenix's climate?",
        answer:
          'Two: one before the cooling season and one before the heating season. That is a genuine climate difference rather than an upsell: Phoenix cooling equipment runs a much longer season at a higher duty cycle than the national average, and the dust load fouls coils and filters faster than an annual visit can keep ahead of.',
      },
      {
        question: 'Does a maintenance plan affect my warranty?',
        answer:
          'It protects it. Most manufacturer warranties make coverage conditional on documented annual professional maintenance, and a denied claim usually turns on missing paperwork rather than on the fault itself. Plan visits produce that documentation automatically and it stays on file against your equipment.',
      },
      {
        question: 'Can I cancel anytime?',
        answer:
          'Cancellation terms are confirmed in the plan agreement before you sign, and we will not enrol you in something you cannot leave. The specific notice period is part of the tier detail being finalised and is set out in the agreement rather than stated here.',
      },
    ],
  },

  'indoor-air-quality': {
    slug: 'indoor-air-quality',
    cardTitle: 'Indoor Air Quality',
    cardDescription:
      'Dust settling hours after you clean? Filtration, purification and duct sealing matched to Phoenix air and dust load.',
    h1: 'Indoor Air Quality in Phoenix, AZ',
    eyebrow: 'INDOOR AIR QUALITY',
    serviceType: 'Indoor Air Quality Service',
    image: 'indoor-air-quality-filtration.jpg',
    imageAlt:
      'Technician fitting a filtration cartridge into an indoor air purification unit connected to residential ductwork',
    focalPoint: '50% 50%',
    lede:
      'Apex Comfort Systems installs and services whole-home filtration, purification and ventilation for Phoenix properties. Desert dust, haboob season and long stretches of closed-up, recirculated air make indoor air quality a genuine local problem rather than a generic add-on. We measure filter pressure drop, duct leakage and actual airflow before recommending anything, because a filter that is too restrictive for the blower makes both the air and the equipment worse.',
    body: [
      {
        title: 'Phoenix dust is the local variable',
        description:
          'Fine desert dust penetrates further into a duct system than the particulate most filtration is specified for, and haboob season loads filters in days rather than months. Sizing filtration for this climate means accounting for how fast media loads, not just its rated efficiency.',
      },
      {
        title: 'Filtration, purification and duct sealing',
        description:
          'Media filter cabinets sized to your blower, UV and photocatalytic purification where a microbial problem is actually present, and duct sealing where leakage is pulling attic air into the return. Sealing a leaky return often does more for indoor air than any filter you can fit.',
      },
      {
        title: 'We measure first',
        description:
          'Filter pressure drop, static pressure across the air handler, and duct leakage are measured before anything is recommended. A high-MERV filter fitted to a blower that cannot pull through it reduces airflow, freezes coils and shortens equipment life. It is a common and expensive mistake.',
      },
    ],
    related: ['maintenance-plans', 'ac-repair', 'ac-replacement-installation'],
    seoTitle: 'Indoor Air Quality in Phoenix, AZ | Apex Comfort Systems',
    metaDescription:
      'Filtration, purification and duct air quality across Phoenix metro. Licensed and insured technicians, flat-rate pricing. Call 24/7 for a quote.',
    faq: [
      {
        question: 'Do I need an air purifier if I already have a good filter?',
        answer:
          'Often not. A correctly sized media filter handles particulate, which is the dominant indoor air problem in Phoenix. Purification addresses a different category, microbial growth and volatile organic compounds, so it is worth adding only when one of those is actually present. We would rather seal a leaking return duct than sell you a purifier that treats the wrong problem.',
      },
      {
        question: 'How does Phoenix dust affect indoor air quality?',
        answer:
          'Heavily. Fine desert dust is smaller than the particulate most standard filters are specified for, so it passes through and settles indoors, and haboob season can load a filter in days rather than months. It also fouls evaporator coils, which reduces airflow and cooling capacity, so the same dust that affects your air also raises your power bill.',
      },
      {
        question: "What's the difference between a whole-home system and a portable unit?",
        answer:
          'A whole-home system sits in the ductwork and treats all the air the system moves, so every room benefits and there is no appliance in the corner. A portable unit treats one room and only while it runs. Portables are useful for a single problem room; they cannot address duct leakage or coil fouling, which are usually the underlying issue here.',
      },
      {
        question: 'Will this help with allergies?',
        answer:
          'Correctly specified filtration measurably reduces airborne particulate, which is the trigger for many people. We are HVAC contractors rather than clinicians, so we will describe what the equipment removes and what the measurements show rather than make a health claim about your symptoms.',
      },
    ],
  },
};

export const SERVICE_LIST: readonly Service[] = SERVICE_SLUGS.map(
  (slug) => SERVICES[slug]
);

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return (
    typeof value === 'string' && (SERVICE_SLUGS as readonly string[]).includes(value)
  );
}

export function servicePath(slug: ServiceSlug): string {
  return `/services/${slug}`;
}

/** B.17 — link label is '[Name] →', never 'Learn More' (§2.4 rule 5, §3.4). */
export function serviceLinkLabel(service: Service): string {
  return `${service.cardTitle} →`;
}
