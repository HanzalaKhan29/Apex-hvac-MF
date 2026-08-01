'use client';

import { useEffect } from 'react';
import { track } from './Analytics';

/**
 * §8.6 / §9.3b / G.8 — the `generate_lead` KEY event.
 *
 * Fires on the /thank-you page view with `service_type`, `form_location` and
 * `page_referrer`. This is the destination conversion GA4 and Google Ads
 * attribute against, and it is the reason the form redirects rather than
 * confirming inline.
 */
export default function GenerateLeadEvent({ serviceType }: { serviceType: string }) {
  useEffect(() => {
    track('generate_lead', {
      service_type: serviceType,
      // The form that produced the lead, inferred from where the user came
      // from; the action also records it server-side on the dispatch email.
      form_location: document.referrer.includes('/contact') ? 'contact' : 'hero',
      page_referrer: document.referrer || 'direct',
    });
  }, [serviceType]);

  return null;
}
