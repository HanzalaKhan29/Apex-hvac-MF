import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePageTemplate from '@/components/templates/ServicePageTemplate';
import { SITE_URL } from '@/lib/contact';
import { SERVICE_SLUGS, SERVICES, isServiceSlug, servicePath } from '@/lib/services';

/**
 * A.3 / A.4 — the six service pages. Template: ServicePageTemplate.
 *
 * The six differ ONLY in the values tabulated in A.4, so they share one
 * template and one route — but each ships individually with its own H1,
 * eyebrow, serviceType, image, related-services set, SEO title, meta
 * description and four-question FAQ set.
 *
 * F.0 / J.6: generateStaticParams over a CLOSED LIST with dynamicParams: false,
 * so an unknown slug renders not-found.tsx rather than attempting a build.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const service = SERVICES[slug];
  const url = `${SITE_URL}${servicePath(slug)}`;

  return {
    title: service.seoTitle,
    description: service.metaDescription,
    // A.0.3 — every page declares a self-referencing canonical. No
    // service×city URL combinations exist (§8.1).
    alternates: { canonical: url },
    openGraph: {
      title: service.seoTitle,
      description: service.metaDescription,
      type: 'website',
      url,
      images: [`/images/${service.image}`],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();

  return <ServicePageTemplate service={SERVICES[slug]} />;
}
