import Link from 'next/link';
import { Home, Wrench } from 'lucide-react';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import FeatureRow from '@/components/FeatureRow';
import ServicesGrid from '@/components/ServicesGrid';
import FooterCTA from '@/components/FooterCTA';
import JsonLd from '@/components/JsonLd';
import { PHONE_E164 } from '@/lib/contact';
import { CITY_LIST, cityPath, type City } from '@/lib/cities';
import { HOME } from '@/lib/content';
import { CTA, pageTrustRow, serviceCards } from '@/lib/ui';

/**
 * B.33 — CityPageTemplate. A.6's four-section sequence.
 *
 *   1 City hero              eyebrow, H1, direct-answer lede naming the city in
 *                            the first sentence, trust row, CTA row, city image
 *   2 Locally-specific block §8.4 item 4 requires AT LEAST ONE locally-specific
 *                            detail per city so the five pages are not thin
 *                            duplicates. The detail is fixed in A.7
 *   3 Service grid           all six services, each linking to the SERVICE page,
 *                            not a city×service URL (§8.1's no-combinatorial-
 *                            URL rule)
 *   4 Neighbouring areas     the other four city pages (§8.1)
 *
 * IMAGES (A.6, D.1.14–18, I.11): the hero image is DECORATIVE — alt="" —
 * because the H1 already states the city name. Deliberate, not an omission.
 * No text overlay sits on the city image at any breakpoint, which is what
 * keeps §7's Scottsdale mountain note a standing consideration rather than an
 * action item.
 *
 * Structured data (A.6): BreadcrumbList only. NO city-scoped Service node —
 * service markup lives on the service pages, so a single service is never
 * claimed twice under two URLs.
 */

const DETAIL_ICONS = [Home, Wrench];

export default function CityPageTemplate({ city }: { city: City }) {
  const neighbours = CITY_LIST.filter((c) => c.slug !== city.slug);

  return (
    <>
      <Hero
        variant="city"
        eyebrow={city.eyebrow}
        heading={city.h1}
        subhead={city.lede}
        trustItems={pageTrustRow()}
        primaryCta={{ label: CTA.full, href: '/contact' }}
        secondaryCta={{ label: CTA.call, href: `tel:${PHONE_E164}` }}
        image={{
          src: city.image,
          // Decorative — the H1 carries the geography (§6.2, §7, I.11).
          alt: city.imageAlt,
          focalPoint: city.focalPoint,
        }}
      />

      <Section ground="n50" labelledBy="city-detail-heading">
        <h2 id="city-detail-heading" className="text-h2 measure-display">
          What we see on {city.name} calls
        </h2>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-2">
          {city.details.map((detail, i) => (
            <FeatureRow
              key={detail.title}
              icon={DETAIL_ICONS[i] ?? Home}
              title={detail.title}
              description={detail.description}
              headingLevel={3}
            />
          ))}
        </ul>
      </Section>

      <ServicesGrid
        variant="full"
        heading={`Services we provide in ${city.name}`}
        items={serviceCards()}
        id="city-services"
      />

      <Section ground="n50" labelledBy="neighbours-heading">
        <h2 id="neighbours-heading" className="text-h2">
          Also serving
        </h2>
        <ul className="mt-s4 grid list-none grid-cols-1 gap-s3 md:grid-cols-2 lg:grid-cols-4">
          {neighbours.map((neighbour) => (
            <li key={neighbour.slug}>
              <Link
                href={cityPath(neighbour.slug)}
                className="flex min-h-11 items-center font-geist font-bold text-[var(--accent)]"
              >
                {neighbour.name} →
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
              { name: 'Service Areas', item: '/service-areas' },
              { name: city.name, item: cityPath(city.slug) },
            ],
          },
        ]}
      />
    </>
  );
}
