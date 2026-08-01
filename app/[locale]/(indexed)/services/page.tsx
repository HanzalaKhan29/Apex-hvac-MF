import type { Metadata } from 'next';
import Link from 'next/link';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import ServicesGrid from '@/components/ServicesGrid';
import FooterCTA from '@/components/FooterCTA';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/contact';
import { CITY_LIST, cityPath } from '@/lib/cities';
import { serviceCards } from '@/lib/ui';
import { HOME } from '@/lib/content';

/**
 * A.2 — `/services`, the services index. Template: StandardPageTemplate.
 *
 * PURPOSE: destination of the mega-menu's "View All Services" link and the
 * <ServicesGrid /> button, and the BREADCRUMB PARENT for all six service
 * pages. Required rather than optional — a breadcrumb whose parent 404s is a
 * defect (§3.1's index-route clarification).
 */

const title = 'HVAC Services in Phoenix, AZ | Apex Comfort Systems';
const description =
  'AC repair, replacement, heating, commercial HVAC, maintenance plans and air quality across Phoenix metro. Licensed and insured. Flat-rate pricing.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/services`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ServicesIndexPage() {
  return (
    <>
      <Section labelledBy="services-index-heading">
        <SectionHeading
          eyebrow={HOME.services.eyebrow}
          heading="HVAC Service for Every Failure Mode"
          level={1}
          id="services-index-heading"
          lede="Six services, each with its own page describing the failure modes we actually see in Phoenix housing stock, what a visit covers, and what is included in the flat-rate price."
        />
      </Section>

      <ServicesGrid variant="full" items={serviceCards()} ground="n50" id="all-services" heading=" " />

      {/* Service-areas strip — §8.1 internal linking. */}
      <Section labelledBy="areas-strip-heading">
        <h2 id="areas-strip-heading" className="text-h2">
          Where we work
        </h2>
        <ul className="mt-s4 grid list-none grid-cols-1 gap-s3 md:grid-cols-2 lg:grid-cols-5">
          {CITY_LIST.map((city) => (
            <li key={city.slug}>
              <Link
                href={cityPath(city.slug)}
                className="flex min-h-11 items-center font-geist font-bold text-[var(--accent)]"
              >
                {city.name} →
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />

      <JsonLd
        nodes={[
          {
            type: 'BreadcrumbList',
            trail: [
              { name: 'Home', item: '/' },
              { name: 'Services', item: '/services' },
            ],
          },
        ]}
      />
    </>
  );
}
