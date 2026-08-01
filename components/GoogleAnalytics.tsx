'use client';

import Script from 'next/script';

/**
 * §8.6 — GA4, loaded through a CONSENT-MODE-AWARE WRAPPER.
 * J.5 — `afterInteractive`. NEVER render-blocking.
 *
 * PERFORMANCE (J.1, J.5, §6.3): "Total third-party JS above the fold: 0KB.
 * This is a hard budget, not a goal." `afterInteractive` is what satisfies it —
 * nothing here is fetched, parsed or executed before the page is interactive,
 * so the LCP element (the hero H1 on the homepage) never waits on analytics.
 *
 * CONSENT (§8.6): Arizona has no state privacy law requiring an opt-in banner
 * as of this writing, so NO COOKIE WALL SHIPS. But consent mode is initialised
 * explicitly rather than left implicit, so a banner can later flip these
 * defaults to `denied` without re-instrumenting a single event. That is the
 * whole point of the wrapper: the switch exists before it is needed.
 *
 * EVENTS (§8.6, G.8) are emitted into the dataLayer by <Analytics /> and the
 * form layer, NOT by GTM triggers (Appendix Z) — <PhoneLink /> is already the
 * single source of truth for every tel: link, so `link_location` cannot drift.
 * This component only loads the transport; it defines no events itself.
 *
 * `generate_lead` and `phone_click` are marked as KEY EVENTS in the GA4
 * property. Phone is the primary conversion channel (§1.4: 60–70% of HVAC
 * conversions arrive by phone) and must not be configured as secondary — that
 * is a property-side setting, flagged in the launch checklist.
 *
 * Renders nothing when NEXT_PUBLIC_GA_ID is unset, which is the local and
 * preview posture. Absent the ID the dataLayer still fills, so events can be
 * inspected without a live property.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        id="ga4-consent-default"
        strategy="afterInteractive"
        // Consent defaults are set BEFORE the library loads, which is the only
        // ordering in which Consent Mode actually applies to the first hit.
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });
          `,
        }}
      />
      <Script
        id="ga4-lib"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${gaId}', { send_page_view: true });
          `,
        }}
      />
    </>
  );
}
