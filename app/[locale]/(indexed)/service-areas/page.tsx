import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import ServicesGrid from '@/components/ServicesGrid';
import FooterCTA from '@/components/FooterCTA';
import JsonLd from '@/components/JsonLd';
import { PHONE_E164, SERVICE_AREAS, SITE_URL } from '@/lib/contact';
import { HOME } from '@/lib/content';
import { CTA, cityCards, pageTrustRow, serviceCards } from '@/lib/ui';

/**
 * A.5 — `/service-areas`, the service-areas index. StandardPageTemplate.
 *
 * PURPOSE: destination of the "View All Service Areas" mega-menu link, the
 * breadcrumb parent for the five city pages, and A SINGLE PAGE STATING THE
 * WHOLE COVERAGE FOOTPRINT FOR GEO EXTRACTION (§8.2).
 *
 * The areaServed values here and in every Service node are the same five
 * strings, BYTE-IDENTICAL, so NAP and coverage facts never diverge (§8.2, §8.5).
 */

const title = 'HVAC Service Areas | Phoenix Metro | Apex Comfort Systems';
const description =
  'Licensed and insured HVAC across Phoenix, Scottsdale, Tempe, Mesa and Chandler. Same-day service available, flat-rate pricing. Call 24/7 for a quote.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/service-areas` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/service-areas`,
    images: ['/images/service-areas-metro-overview.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ServiceAreasIndexPage() {
  return (
    <>
      <Hero
        variant="city"
        eyebrow="PHOENIX METROPOLITAN AREA"
        heading="HVAC Service Across Phoenix Metro"
        subhead="Apex Comfort Systems covers five Phoenix-metro cities with licensed residential and commercial HVAC: Phoenix, Scottsdale, Tempe, Mesa and Chandler. Same-day service is available, pricing is flat-rate and given before work starts, and emergency dispatch runs seven days a week across the whole footprint."
        trustItems={pageTrustRow()}
        primaryCta={{ label: CTA.full, href: '/contact' }}
        secondaryCta={{ label: CTA.call, href: `tel:${PHONE_E164}` }}
        image={{
          src: 'service-areas-metro-overview.jpg',
          // Decorative — the H1 and coverage statement carry the geography.
          alt: '',
          focalPoint: '50% 60%',
        }}
      />

      <ServicesGrid
        variant="city"
        heading="The five cities we cover"
        items={cityCards()}
        ground="n50"
        id="cities"
      />

      {/* Coverage statement — the five cities named VERBATIM as they appear on
          the Google Business Profile (§8.5). This is the GEO extraction
          surface for the coverage claim. */}
      <Section labelledBy="coverage-heading" width="narrow">
        <h2 id="coverage-heading" className="text-h2">
          Our coverage, stated plainly
        </h2>
        <p className="mt-s3 text-body-lg">
          Apex Comfort Systems serves {SERVICE_AREAS.slice(0, -1).join(', ')} and{' '}
          {SERVICE_AREAS[SERVICE_AREAS.length - 1]}, Arizona. Every service we
          offer is available in all five cities. If you are just outside that
          footprint, call anyway. We would rather tell you honestly whether we can
          reach you than take a booking we cannot hold.
        </p>
      </Section>

      <ServicesGrid
        variant="full"
        heading="Services available in every area"
        items={serviceCards()}
        id="area-services"
      />

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />

      <JsonLd
        nodes={[
          {
            type: 'BreadcrumbList',
            trail: [
              { name: 'Home', item: '/' },
              { name: 'Service Areas', item: '/service-areas' },
            ],
          },
        ]}
      />
    </>
  );
}
