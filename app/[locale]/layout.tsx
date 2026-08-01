import SkipLink from '@/components/SkipLink';
import HeaderSlot from '@/components/HeaderSlot';
import SiteFooter from '@/components/SiteFooter';
import StickyBarSlot from '@/components/StickyBarSlot';
import Analytics from '@/components/Analytics';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import WebVitals from '@/components/WebVitals';
import EntranceMotion from '@/components/EntranceMotion';
import { SERVICE_LIST, servicePath } from '@/lib/services';
import { CITY_LIST, cityPath } from '@/lib/cities';

/**
 * The global chrome, mounted ONCE (A.0.1, B.33).
 *
 * All seven templates read global chrome from here rather than composing it
 * individually, so <SkipLink />, <Topbar />, <SiteHeader />, <SiteFooter /> and
 * <MobileStickyBar /> exist exactly once in the tree (B.33, Appendix Z).
 *
 * DOM ORDER (A.0.1)
 *   1. <SkipLink />        first focusable element on the page
 *   2. <Topbar />          lg+ only, composed inside <SiteHeader />
 *   3. <SiteHeader />      sticky, --z-header
 *   4. <main id="main">    the page's ordered sections
 *   5. <FooterCTA />       rendered by the template, since four routes omit it
 *   6. <SiteFooter />
 *   7. <MobileStickyBar /> below lg only, --z-stickybar
 *
 * This layout deliberately reads NO request state, so every route beneath it
 * can be statically generated (J.6). The site-wide JSON-LD graph lives in the
 * (indexed) route group instead — see the note in that layout.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // `en` is the sole configured locale at v1 (F.1, §8.4).
  return [{ locale: 'en' }];
}

const SERVICE_NAV = SERVICE_LIST.map((service) => ({
  label: service.cardTitle,
  href: servicePath(service.slug),
}));

const CITY_NAV = CITY_LIST.map((city) => ({
  label: city.name,
  href: cityPath(city.slug),
}));

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <HeaderSlot services={SERVICE_NAV} cities={CITY_NAV} />

      {/* tabindex="-1" so the skip link's focus actually lands (B.9, I.2). */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <SiteFooter services={SERVICE_NAV} cities={CITY_NAV} />
      <StickyBarSlot />

      <Analytics />
      <GoogleAnalytics />
      <WebVitals />
      <EntranceMotion />
    </>
  );
}
