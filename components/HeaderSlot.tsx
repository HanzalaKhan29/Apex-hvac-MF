'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from './SiteHeader';
import type { MegaMenuItem } from './MegaMenu';

/**
 * Supplies <SiteHeader /> with the current path (for aria-current) and decides
 * `transparentUntilScroll`, which B.1 sets true on HomeTemplate and false
 * everywhere else — HomeTemplate is the only template whose hero sits on
 * --apex-ink for the header to be transparent over (B.33).
 */
export default function HeaderSlot({
  services,
  cities,
}: {
  services: readonly MegaMenuItem[];
  cities: readonly MegaMenuItem[];
}) {
  const pathname = usePathname() ?? '/';
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  return (
    <SiteHeader
      currentPath={path}
      transparentUntilScroll={path === '/'}
      services={services}
      cities={cities}
    />
  );
}
