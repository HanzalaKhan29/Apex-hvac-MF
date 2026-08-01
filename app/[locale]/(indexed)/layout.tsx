import JsonLd from '@/components/JsonLd';

/**
 * A.0.4 — the site-wide structured-data graph.
 *
 * HVACBusiness and Organization are emitted once per route, on EVERY INDEXABLE
 * ROUTE. Page-specific nodes (Service, BreadcrumbList, FAQPage) are appended
 * by the individual templates.
 *
 * WHY THIS IS A ROUTE GROUP RATHER THAN A CONDITIONAL IN THE LOCALE LAYOUT.
 * A.14 and A.17 require structured data to be SUPPRESSED ENTIRELY on
 * /thank-you and /404 — emitting HVACBusiness from a noindex page or a 404
 * response would attach the entity to a non-page. Suppressing it by reading
 * the pathname inside the locale layout works, but reading a request header
 * opts the whole subtree into dynamic rendering, and J.6 requires all 23
 * indexable routes to be STATICALLY GENERATED. Expressing the exclusion
 * structurally instead costs nothing: `(indexed)` does not appear in any URL,
 * /thank-you and not-found.tsx simply sit outside it, and every route in here
 * stays static.
 */
export default function IndexedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <JsonLd nodes={[{ type: 'HVACBusiness' }, { type: 'Organization' }]} />
    </>
  );
}
