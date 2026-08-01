'use client';

import { usePathname } from 'next/navigation';
import MobileStickyBar from './MobileStickyBar';
import { ROUTES_WITH_FORM } from '@/lib/routes';

/**
 * Resolves <MobileStickyBar />'s `quoteHref` from the current route: '#quote'
 * where the page has a form, otherwise '/contact' (B.6, §3.4's booking rule —
 * all "Book" CTAs resolve to #quote on the current page, or /contact where no
 * form is present).
 *
 * The bar is mounted once in the locale layout so it exists exactly once in
 * the tree (B.33), and the layout is a Server Component, so route awareness
 * lives in this thin client boundary rather than pushing the layout client-side.
 */
export default function StickyBarSlot() {
  const pathname = usePathname() ?? '/';
  // Strip the internal /en rewrite prefix so the comparison is against the
  // canonical, unprefixed path (F.1).
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  return <MobileStickyBar quoteHref={ROUTES_WITH_FORM.has(path) ? '#quote' : '/contact'} />;
}
