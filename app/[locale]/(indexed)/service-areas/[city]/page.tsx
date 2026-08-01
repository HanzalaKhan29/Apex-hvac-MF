import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityPageTemplate from '@/components/templates/CityPageTemplate';
import { SITE_URL } from '@/lib/contact';
import { CITIES, CITY_SLUGS, cityPath, isCitySlug } from '@/lib/cities';

/**
 * A.6 / A.7 — the five city pages. Template: CityPageTemplate.
 *
 * Each ships individually with its own H1, image, locally-specific detail and
 * SEO title. §8.4 item 4's requirement — at least one locally-specific detail
 * per city — is what stops these being thin duplicates, and it is a v1
 * obligation rather than Phase 2 content.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  if (!isCitySlug(slug)) return {};
  const city = CITIES[slug];
  const url = `${SITE_URL}${cityPath(slug)}`;

  return {
    title: city.seoTitle,
    description: city.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: city.seoTitle,
      description: city.metaDescription,
      type: 'website',
      url,
      images: [`/images/${city.image}`],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  if (!isCitySlug(slug)) notFound();

  return <CityPageTemplate city={CITIES[slug]} />;
}
