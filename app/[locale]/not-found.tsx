import NotFoundTemplate from '@/components/templates/NotFoundTemplate';

/**
 * A.17 — the 404 for notFound() raised INSIDE the locale segment, which is
 * what an unknown /services/<slug> or /service-areas/<city> hits, since both
 * dynamic segments run generateStaticParams over a closed list with
 * dynamicParams: false (F.4).
 *
 * Chrome is inherited from app/[locale]/layout.tsx. This file sits OUTSIDE the
 * (indexed) route group, so no structured data is emitted (A.17, Z.5).
 *
 * Paths that never resolve into this segment at all are handled by
 * app/not-found.tsx, which composes the same template with the same chrome.
 */
export default function LocaleNotFound() {
  return <NotFoundTemplate />;
}
