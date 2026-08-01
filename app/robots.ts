import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/contact';

/**
 * F.5 / §8.1 — robots.txt, generated.
 *
 * Allows all crawling EXCEPT /thank-you (matching its noindex meta tag) and
 * any future /api/* routes. Points to sitemap.xml. No wildcard disallow, no
 * crawl-delay.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/thank-you', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
