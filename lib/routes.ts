import { SERVICE_LIST, servicePath } from './services';
import { CITY_LIST, cityPath } from './cities';

/**
 * A.0.6 route index / F.6 sitemap source / A.17's client-side route filter.
 *
 * The 23 indexable routes, in Appendix A order. /thank-you and /404 are
 * excluded — both are noindex and neither appears in sitemap.xml (F.6).
 *
 * /blog and /blog/<slug> are RESERVED, NOT REDIRECTED (§3.1, F.3). They return
 * the standard 404 at v1; a redirect would imply the content moved, and it
 * does not exist yet.
 */

export interface RouteEntry {
  path: string;
  label: string;
}

export const INDEXABLE_ROUTES: readonly RouteEntry[] = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'HVAC Services' },
  ...SERVICE_LIST.map((service) => ({
    path: servicePath(service.slug),
    label: service.cardTitle,
  })),
  { path: '/service-areas', label: 'Service Areas' },
  ...CITY_LIST.map((city) => ({
    path: cityPath(city.slug),
    label: `HVAC Service in ${city.name}`,
  })),
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/reviews', label: 'Reviews' },
  { path: '/financing', label: 'Financing' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-of-service', label: 'Terms of Service' },
];

/** Routes that contain a form, so the sticky bar links to #quote (B.6). */
export const ROUTES_WITH_FORM = new Set(['/', '/contact']);
