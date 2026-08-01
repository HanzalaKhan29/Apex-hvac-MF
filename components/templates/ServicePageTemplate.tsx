import Link from 'next/link';
import { ListChecks, Search, TriangleAlert } from 'lucide-react';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import FeatureRow from '@/components/FeatureRow';
import ServicesGrid from '@/components/ServicesGrid';
import FinancingBanner from '@/components/FinancingBanner';
import LogoStrip from '@/components/LogoStrip';
import FAQAccordion from '@/components/FAQAccordion';
import FooterCTA from '@/components/FooterCTA';
import JsonLd from '@/components/JsonLd';
import { PHONE_E164, SERVICE_AREAS } from '@/lib/contact';
import { CITY_LIST, cityPath } from '@/lib/cities';
import { servicePath, type Service } from '@/lib/services';
import { HOME, MANUFACTURER_BRANDS } from '@/lib/content';
import { CTA, pageTrustRow, relatedCards } from '@/lib/ui';

/**
 * B.33 — ServicePageTemplate. A.3's seven-section sequence.
 *
 *   1 Service hero      eyebrow, H1, §8.2 direct-answer lede, trust row, CTA
 *                       row, service image
 *   2 Service body      failure modes, what we do, what's included — 3 rows
 *   3 Financing banner  AC REPLACEMENT & INSTALLATION ONLY (§3.3)
 *   4 Manufacturer strip AC REPLACEMENT & INSTALLATION ONLY (§3.3), same gate
 *   5 Related services  2–3 sibling cards (§8.1 internal linking)
 *   6 Service areas     links to the five city pages (§8.1)
 *   7 FAQ module        4–6 questions per §8.3's content map
 *
 * The lede is §8.2's direct-answer paragraph — what the service is, who it is
 * for, and the differentiator, inside the first 100 words, written to be
 * QUOTABLE STANDALONE. That is the GEO extraction surface, and it is why the
 * copy reads as a statement rather than a pitch.
 *
 * Structured data (A.3): Service and BreadcrumbList are emitted here.
 * FAQPage is emitted by <FAQAccordion /> itself, scoped to this page's four
 * questions only, so it is never declared twice (§8.3, B.31).
 */

const BODY_ICONS = [TriangleAlert, Search, ListChecks];

export default function ServicePageTemplate({ service }: { service: Service }) {
  const isReplacement = service.slug === 'ac-replacement-installation';

  return (
    <>
      <Hero
        variant="service"
        eyebrow={service.eyebrow}
        heading={service.h1}
        subhead={service.lede}
        trustItems={pageTrustRow()}
        primaryCta={{ label: CTA.full, href: '/contact' }}
        secondaryCta={{ label: CTA.call, href: `tel:${PHONE_E164}` }}
        image={{
          src: service.image,
          alt: service.imageAlt,
          focalPoint: service.focalPoint,
        }}
      />

      {/* 2 — Service body. Copy caps at --measure-body (§4.3, A.3). */}
      <Section ground="n50" labelledBy="service-body-heading">
        <h2 id="service-body-heading" className="text-h2 measure-display">
          What we actually do on a {service.cardTitle.toLowerCase()} call
        </h2>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-2">
          {service.body.map((item, i) => (
            <li key={item.title} className={i === 2 ? 'lg:col-span-2' : undefined}>
              <ul className="list-none">
                <FeatureRow
                  icon={BODY_ICONS[i] ?? ListChecks}
                  title={item.title}
                  description={item.description}
                  headingLevel={3}
                />
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3 and 4 — AC Replacement & Installation only (§3.3, A.4.2). */}
      {isReplacement ? (
        <>
          <FinancingBanner
            heading={HOME.financing.heading}
            body={HOME.financing.body}
            cta={{ label: 'See financing options', href: '/financing' }}
          />
          <LogoStrip brands={MANUFACTURER_BRANDS} />
        </>
      ) : null}

      {/* 5 — Related services. */}
      <ServicesGrid
        variant="related"
        heading="Related services"
        items={relatedCards(service.related)}
        id="related"
      />

      {/* 6 — Service areas (§8.1 internal linking). */}
      <Section ground="n50" labelledBy="service-areas-heading">
        <h2 id="service-areas-heading" className="text-h2">
          {service.cardTitle} across Phoenix metro
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

      {/* 7 — FAQ module. Emits its own scoped FAQPage schema. */}
      <FAQAccordion
        items={service.faq}
        eyebrow="COMMON QUESTIONS"
        heading={`${service.cardTitle} questions`}
        id="service-faq"
      />

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />

      <JsonLd
        nodes={[
          {
            type: 'Service',
            serviceType: service.serviceType,
            areaServed: SERVICE_AREAS,
          },
          {
            type: 'BreadcrumbList',
            trail: [
              { name: 'Home', item: '/' },
              { name: 'Services', item: '/services' },
              { name: service.cardTitle, item: servicePath(service.slug) },
            ],
          },
        ]}
      />
    </>
  );
}
