import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/contact';
import { INDEXABLE_ROUTES } from '@/lib/routes';

/**
 * F.6 / §8.1 / §3.1's sitemap clarification — sitemap.xml, generated from the
 * App Router route tree. NO MANUALLY MAINTAINED SITEMAP FILE EXISTS.
 *
 * Includes all 23 indexable routes from A.0.6. Excludes /thank-you and /404.
 *
 * No `priority` and no `changefreq`: both are ignored by every major crawler
 * and inventing them adds noise (Appendix Z).
 *
 * `lastmod` comes from the build timestamp of the content layer at v1, which
 * is honest, rather than a fabricated per-page date. Once a CMS or content
 * layer exists it emits real content-update timestamps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified,
  }));
}
