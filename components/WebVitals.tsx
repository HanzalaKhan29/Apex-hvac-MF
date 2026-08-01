'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { track } from './Analytics';

/**
 * J.7 — Core Web Vitals are monitored, not checked once.
 *
 * "Field data from the `web-vitals` library reported into GA4 as a NON-KEY
 *  EVENT, loaded afterInteractive."
 *
 * Uses Next's built-in `useReportWebVitals` rather than adding the `web-vitals`
 * package: Next already bundles the collector for its own instrumentation, so
 * this adds no third-party bytes — which matters directly against J.5's 0KB
 * above-the-fold third-party budget.
 *
 * NON-KEY is deliberate (§8.6). The key events are `generate_lead` and
 * `phone_click`; marking a diagnostic metric as a key event would pollute the
 * conversion reporting that every quantitative claim in §1.4 depends on.
 *
 * The J.1 targets these measure against, on mobile over throttled 4G:
 *   LCP < 2.5s   INP < 200ms   CLS < 0.1
 *
 * Values are rounded the way GA4 expects — CLS scaled by 1000 since GA4 metric
 * values are integers, everything else to whole milliseconds.
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    track('web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      metric_rating: metric.rating,
      metric_id: metric.id,
      page_path: window.location.pathname,
      non_interaction: true,
    });
  });

  return null;
}
