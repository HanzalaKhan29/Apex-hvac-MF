import SkipLink from '@/components/SkipLink';
import HeaderSlot from '@/components/HeaderSlot';
import SiteFooter from '@/components/SiteFooter';
import StickyBarSlot from '@/components/StickyBarSlot';
import Analytics from '@/components/Analytics';
import PointerSpotlight from '@/components/PointerSpotlight';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import WebVitals from '@/components/WebVitals';
import NotFoundTemplate from '@/components/templates/NotFoundTemplate';
import { SERVICE_LIST, servicePath } from '@/lib/services';
import { CITY_LIST, cityPath } from '@/lib/cities';

/**
 * A.17 / F.4 — `/404`. NotFoundTemplate. Returns HTTP 404.
 *
 * WHY THE CHROME IS COMPOSED HERE rather than inherited.
 * A path that matches no route never resolves into the [locale] segment, so
 * Next renders this root not-found instead of app/[locale]/not-found.tsx —
 * which means it does NOT get app/[locale]/layout.tsx and would otherwise ship
 * with no header, no footer, no nav and no mobile sticky bar. A.17 requires
 * full global chrome minus <FooterCTA />, and is explicit about the sticky bar:
 * "a visitor who has hit a dead end is exactly the visitor who most needs a
 * visible phone number." So the chrome is assembled here to match.
 *
 * A catch-all route inside [locale] was tried first and rejected: it fails at
 * build time because the segment is statically generated with a closed
 * generateStaticParams, and the failure surfaces as Next's global error page —
 * strictly worse than the problem it was meant to fix.
 *
 * <html> and <body>, the fonts and the base stylesheet still come from
 * app/layout.tsx, so lang="en" holds (WCAG 3.1.1).
 *
 * NO structured data (A.17), and no <FooterCTA /> — NotFoundTemplate carries
 * its own CTA block.
 */

const SERVICE_NAV = SERVICE_LIST.map((service) => ({
  label: service.cardTitle,
  href: servicePath(service.slug),
}));

const CITY_NAV = CITY_LIST.map((city) => ({
  label: city.name,
  href: cityPath(city.slug),
}));

export default function RootNotFound() {
  return (
    <>
      <SkipLink />
      <PointerSpotlight />
      <HeaderSlot services={SERVICE_NAV} cities={CITY_NAV} />

      <main id="main" tabIndex={-1}>
        <NotFoundTemplate />
      </main>

      <SiteFooter services={SERVICE_NAV} cities={CITY_NAV} />
      <StickyBarSlot />
      <Analytics />
      <GoogleAnalytics />
      <WebVitals />
    </>
  );
}
