'use client';

import { useEffect } from 'react';
import { track } from './Analytics';

/**
 * §8.6 / A.11 — the `financing_view` GA4 event.
 *
 * Fires once when /financing is reached, with an `entry_point` parameter taken
 * from the referrer so the objection-handling path can be attributed: the
 * question worth answering is whether people arrive here from the homepage
 * banner, from the AC Replacement service page, or from search.
 */
export default function FinancingViewEvent() {
  useEffect(() => {
    const referrer = document.referrer;
    let entryPoint = 'direct';

    if (referrer) {
      try {
        const url = new URL(referrer);
        entryPoint =
          url.origin === window.location.origin ? url.pathname : 'external';
      } catch {
        entryPoint = 'unknown';
      }
    }

    track('financing_view', { entry_point: entryPoint });
  }, []);

  return null;
}
