'use client';

import { useEffect } from 'react';

/**
 * §8.6 — measurement, event layer.
 *
 * A single delegated click listener that fires `phone_click` for every `tel:`
 * link on the page. Per Appendix Z, GA4 events are emitted from the form layer
 * and <PhoneLink /> rather than via GTM triggers, because <PhoneLink /> is
 * already the single source of truth for every tel: link, so `link_location`
 * cannot drift.
 *
 * <PhoneLink /> itself stays a SERVER COMPONENT — J.4's 'use client' list is
 * exhaustive and does not include it — so the binding is by data attribute
 * rather than an onClick prop. That is the whole reason this component exists.
 *
 * `generate_lead` and `phone_click` are both KEY EVENTS. Phone is the primary
 * conversion channel (§1.4: 60–70% of HVAC conversions) and must not be
 * configured as secondary.
 *
 * PERFORMANCE GUARD (J.5): no analytics vendor script is loaded here. Total
 * third-party JS above the fold is 0KB — a hard budget, not a goal. This
 * listener pushes to the dataLayer if one exists and is otherwise inert, so
 * GA4/GTM can be attached `afterInteractive` without re-instrumentation.
 *
 * Consent (§8.6): the wrapper is consent-mode-aware by construction — it emits
 * into the dataLayer rather than calling a vendor API directly, so a consent
 * gate can be enabled without touching this file.
 */

type DataLayerWindow = Window & { dataLayer?: unknown[] };

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}

export default function Analytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLElement>('[data-phone-link]');
      if (!link) return;

      track('phone_click', {
        link_location: link.dataset.linkLocation ?? 'unknown',
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
