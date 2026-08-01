'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Menu, Star } from 'lucide-react';
import Logo from './Logo';
import Topbar from './Topbar';
import type { MegaMenuItem } from './MegaMenu';
import PhoneLink from './PhoneLink';
import Button from './Button';
import { SERVICE_AREAS } from '@/lib/contact';
import { ph } from '@/lib/placeholders';

/**
 * J.6 — <MegaMenu /> and <MobileNavDrawer /> are THE ONLY components in the
 * build that are dynamically imported, since exactly one of the two is ever
 * needed at a given viewport width: the mega-menus render at lg+ and the
 * drawer below lg, and they are exact complements.
 *
 * <MegaMenu /> keeps SSR on, so the six service and five city links sit in the
 * server-rendered HTML for crawlers and for the §8.2 GEO extraction surface.
 * <MobileNavDrawer /> disables it — the component returns null until the
 * hamburger is pressed, so server-rendering it produces nothing but cost.
 */
const MegaMenu = dynamic(() => import('./MegaMenu'));
const MobileNavDrawer = dynamic(() => import('./MobileNavDrawer'), { ssr: false });

/**
 * B.1 — <SiteHeader />
 *
 * The sticky primary chrome: logo lockup, primary navigation with both
 * mega-menus, phone link, and the header quote button. Composes <Topbar />,
 * <MegaMenu /> and <MobileNavDrawer /> (§5.2, §3.2).
 *
 * RESPONSIVE (B.1, H.1.2)
 *   lg+   horizontal nav, both mega-menus, phone link, `Get a Quote` button,
 *         height --header-h (72px). Rating micro-badge renders here ONLY when
 *         §9.4's review data exists; absent that data it does not render at all.
 *   <lg   logo, always-visible tap-to-call phone icon, hamburger; 64px; NO
 *         mega-menu and NO header quote button — the sticky bar carries that
 *         role, and the two are exact complements (§4.5).
 *
 * MOTION (B.1, §5.2): the transparent→solid transition is a background and
 * shadow change only. backdrop-filter: blur applies at lg+ ONLY. Below lg the
 * header transitions directly to opaque --apex-paper at 95% alpha with no
 * blur — a blurred sticky header repaints on every scroll frame on mid-range
 * Android and is a common INP regression against the <200ms target (§6.3), and
 * the two treatments are visually near-identical on a phone.
 *
 * Sticky header on scroll uses --shadow-sm only; NO SHADOW in the transparent
 * resting state (§4.6a).
 *
 * ACCESSIBILITY (B.1, I.10): <header> landmark, real <nav aria-label="Primary">,
 * logo link labelled, active item aria-current="page". Below lg, <PhoneLink />
 * is the FIRST contact affordance in DOM order, satisfying 3.2.6 Consistent
 * Help; at lg+ the topbar carries that position first, then the header.
 */

export interface SiteHeaderProps {
  currentPath: string;
  /** Default true on HomeTemplate, false elsewhere (B.1). */
  transparentUntilScroll?: boolean;
  services: readonly MegaMenuItem[];
  cities: readonly MegaMenuItem[];
}

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Reviews', href: '/reviews' },
];

export default function SiteHeader({
  currentPath,
  transparentUntilScroll = false,
  services,
  cities,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  /*
   * B.4 — "Focus is trapped inside the drawer while open and RETURNED TO THE
   * HAMBURGER on close." Without this the drawer closes and focus falls back
   * to <body>, so a keyboard user loses their place entirely and has to tab
   * from the top of the document again. Covers every close path: the X button,
   * Escape, the scrim, and following a link.
   */
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!transparentUntilScroll) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentUntilScroll]);

  const transparent = transparentUntilScroll && !scrolled;

  // §9.4 gate — the rating micro-badge does not render at all without real
  // review data, at any width (H.9.3).
  const rating = ph('googleRating');
  const reviewCount = ph('reviewCount');
  const showRating = rating !== null;

  return (
    <header
      className={[
        'sticky top-0 z-[var(--z-header)]',
        'transition-[background-color,box-shadow] duration-[var(--dur-button)] ease-out',
        transparent
          ? 'bg-transparent text-apex-paper [--accent:var(--color-apex-copper-dark)]'
          : 'bg-apex-paper/95 text-n-950 shadow-sm [--accent:var(--color-apex-copper)] lg:backdrop-blur',
      ].join(' ')}
    >
      {/*
       * Z.20 — a fixed dark scrim behind the transparent-resting header row.
       * The transparent state is meant to sit on the dark hero, but the hero's
       * own ambient drift highlight (.hero-drift, Z.18) can pass a lighter
       * patch directly under the nav on some frames, which reads as
       * low-contrast/washed-out text until the header switches to its solid
       * state on scroll. This scrim guarantees legibility independent of
       * whatever the hero is doing behind it. Decorative only, and it fades
       * out with the same transition as the background-color swap above.
       */}
      {transparentUntilScroll ? (
        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(var(--header-h)+var(--topbar-h))]',
            'bg-gradient-to-b from-black/45 via-black/15 to-transparent',
            'transition-opacity duration-[var(--dur-button)] ease-out',
            transparent ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      ) : null}

      <Topbar cities={SERVICE_AREAS} />

      <div className="container-max flex h-[var(--header-h)] items-center justify-between gap-s4 px-[var(--section-padding-inline)]">
        <Link
          href="/"
          aria-label="Apex Comfort Systems — home"
          /* I.7 — 44x44 minimum on both axes. The lockup is 36px tall, and
             below md the 1:1-ish mark renders only ~41px wide, so the link
             needs a floor on width as well as height. */
          className="flex min-h-11 min-w-11 shrink-0 items-center"
        >
          <Logo variant="mark" className="h-9 w-auto md:hidden" />
          <Logo variant="full" className="hidden h-9 w-auto md:block" />
        </Link>

        {/* lg+ — the real primary navigation. */}
        <nav aria-label="Primary" className="hidden min-w-0 lg:block">
          <ul className="flex list-none items-center gap-s4 xl:gap-s5">
            <li>
              <MegaMenu
                triggerLabel="Services"
                items={services}
                viewAllLabel="View All Services"
                viewAllHref="/services"
                currentPath={currentPath}
              />
            </li>
            <li>
              <MegaMenu
                triggerLabel="Service Areas"
                items={cities}
                viewAllLabel="View All Service Areas"
                viewAllHref="/service-areas"
                currentPath={currentPath}
              />
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={currentPath === link.href ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center whitespace-nowrap font-geist font-bold transition-colors duration-[var(--dur-button)] ease-out hover:text-[var(--accent)] aria-[current=page]:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-s3">
          {/*
           * Below lg this <PhoneLink /> is the first contact affordance in DOM
           * order and is always visible — never hidden inside the hamburger
           * (§3.2, I.10).
           */}
          <span className="lg:hidden">
            <PhoneLink display="icon-only" context="header" />
          </span>

          <span className="hidden whitespace-nowrap lg:inline-flex">
            <PhoneLink display="full" context="header" />
          </span>

          {showRating ? (
            <span className="hidden items-center gap-s1 whitespace-nowrap text-small xl:inline-flex">
              <Star
                aria-hidden="true"
                strokeWidth={2}
                className="size-4 fill-apex-copper text-apex-copper"
              />
              <span className="num">{rating}</span>
              {reviewCount ? (
                <span className="text-n-700">({reviewCount})</span>
              ) : null}
            </span>
          ) : null}

          <span className="hidden lg:inline-flex">
            {/* §3.4's CTA label lock: `Get a Quote` at lg+, space-constrained. */}
            <Button variant="primary" href="/contact">
              Get a Quote
            </Button>
          </span>

          <button
            type="button"
            ref={hamburgerRef}
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="inline-flex size-11 items-center justify-center rounded-md lg:hidden"
          >
            <Menu aria-hidden="true" strokeWidth={2} className="size-6" />
            <span className="visually-hidden">Open navigation</span>
          </button>
        </div>
      </div>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        currentPath={currentPath}
        services={services}
        cities={cities}
      />
    </header>
  );
}
