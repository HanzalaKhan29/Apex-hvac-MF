import {
  ADDRESS,
  BUSINESS_NAME,
  OPENING_HOURS,
  PHONE_E164,
  PRICE_RANGE,
  SERVICE_AREAS,
  SITE_URL,
} from '@/lib/contact';
import { ph } from '@/lib/placeholders';
import type { FaqItem } from '@/lib/services';
import { serialiseJsonLd } from '@/lib/jsonld';

/**
 * B.32 — <JsonLd />
 *
 * THE single emitter for every structured-data node, so schema is never
 * inlined ad hoc in a page and the canonical phone number can never be
 * rewritten by DNI inside markup (§8.1, §8.6).
 *
 * HARD CONSTRAINTS (B.32):
 *   - AggregateRating and Review nodes are emitted ONLY when real, verifiable
 *     review data is present. FABRICATED STRUCTURED DATA IS NEVER EMITTED
 *     (§8.1, §9.4). In demo mode nothing rating-shaped is output anywhere,
 *     including on /reviews.
 *   - `telephone` always resolves from lib/contact.ts — the canonical GBP
 *     number — regardless of any DNI script on the page (§8.6).
 *   - `areaServed` strings are the same five values used in the footer, on
 *     /service-areas and on the Google Business Profile, byte-identical
 *     (§8.2, §8.5).
 *   - Suppressed entirely on /thank-you and /404: emitting HVACBusiness from a
 *     noindex page or a 404 response would attach the entity to a non-page
 *     (A.14, A.17).
 *
 * Renders no visible output, so responsive/motion/accessibility do not apply.
 */

export type SchemaNode =
  | { type: 'HVACBusiness' }
  | { type: 'Organization' }
  | { type: 'Service'; serviceType: string; areaServed: readonly string[] }
  | { type: 'BreadcrumbList'; trail: readonly { name: string; item: string }[] }
  | { type: 'FAQPage'; items: readonly FaqItem[] }
  | { type: 'AggregateRating'; ratingValue: number; reviewCount: number };

export interface JsonLdProps {
  nodes: readonly SchemaNode[];
}

const BUSINESS_ID = `${SITE_URL}/#business`;
const ORG_ID = `${SITE_URL}/#organization`;

function buildNode(node: SchemaNode): object | null {
  switch (node.type) {
    case 'HVACBusiness':
      return {
        '@type': 'HVACBusiness',
        '@id': BUSINESS_ID,
        name: BUSINESS_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-mark.svg`,
        image: `${SITE_URL}/logo-mark.svg`,
        // Always the canonical GBP number. DNI never reaches this (§8.6).
        telephone: PHONE_E164,
        priceRange: PRICE_RANGE,
        address: {
          '@type': 'PostalAddress',
          // Street and postal code are CLIENT ACTION REQUIRED and are omitted
          // rather than invented (A.0.5).
          ...(ADDRESS.streetAddress ? { streetAddress: ADDRESS.streetAddress } : {}),
          addressLocality: ADDRESS.addressLocality,
          addressRegion: ADDRESS.addressRegion,
          ...(ADDRESS.postalCode ? { postalCode: ADDRESS.postalCode } : {}),
          addressCountry: ADDRESS.addressCountry,
        },
        areaServed: SERVICE_AREAS.map((name) => ({ '@type': 'City', name })),
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: OPENING_HOURS.dayOfWeek,
            opens: OPENING_HOURS.opens,
            closes: OPENING_HOURS.closes,
          },
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: PHONE_E164,
          areaServed: 'US',
          availableLanguage: 'en',
        },
      };

    case 'Organization': {
      // sameAs values are CLIENT ACTION REQUIRED; the array is OMITTED
      // ENTIRELY rather than shipped with placeholder URLs (A.0.4).
      const gbp = ph('googleBusinessProfileUrl');
      return {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: BUSINESS_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-mark.svg`,
        ...(gbp ? { sameAs: [gbp] } : {}),
      };
    }

    case 'Service':
      return {
        '@type': 'Service',
        serviceType: node.serviceType,
        provider: { '@id': BUSINESS_ID },
        // The mechanism by which an AI system establishes coverage beyond
        // Phoenix (§8.1, §8.2).
        areaServed: node.areaServed.map((name) => ({ '@type': 'City', name })),
      };

    case 'BreadcrumbList':
      return {
        '@type': 'BreadcrumbList',
        itemListElement: node.trail.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.item}`,
        })),
      };

    case 'FAQPage':
      return {
        '@type': 'FAQPage',
        mainEntity: node.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      };

    case 'AggregateRating':
      // Only reachable in live mode. §8.1's caveat stands: self-hosted
      // AggregateRating is NOT eligible for star rich results, and that
      // expectation is not set with the client. It is implemented for GEO/AEO
      // extraction value only.
      if (ph('reviewContent') === null) return null;
      return {
        '@type': 'AggregateRating',
        itemReviewed: { '@id': BUSINESS_ID },
        ratingValue: node.ratingValue,
        reviewCount: node.reviewCount,
      };

    default:
      return null;
  }
}

export default function JsonLd({ nodes }: JsonLdProps) {
  const graph = nodes.map(buildNode).filter(Boolean);
  if (graph.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serialiseJsonLd({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
