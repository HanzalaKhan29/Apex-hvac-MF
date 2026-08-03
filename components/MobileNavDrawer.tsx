'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import PhoneLink from './PhoneLink';
import Button from './Button';
import type { MegaMenuItem } from './MegaMenu';

/**
 * B.4 — <MobileNavDrawer />
 *
 * The below-lg navigation surface. NATIVE DISCLOSURE SEMANTICS, not a
 * re-skinned mega-menu — §3.2 is explicit that a hover panel is never
 * reproduced inside a drawer.
 *
 * Sections use native <details>/<summary> with a shared `name`, which is the
 * platform's own exclusive-accordion behaviour: ONE OPEN AT A TIME, all closed
 * by default (§3.2, B.4). Contrast <FAQAccordion />, where multiple may be
 * open simultaneously — that difference is deliberate.
 *
 * CRITICAL STACKING RULE (B.4, §4.4, §6.1): the drawer and its scrim sit at
 * --z-nav-overlay (70); <MobileStickyBar /> sits at --z-stickybar (80),
 * DELIBERATELY ABOVE, so the phone stays reachable with the menu open. The
 * scrim ends at calc(100dvh - var(--stickybar-h)) so the sticky bar is never
 * dimmed.
 *
 * Focus is trapped inside the drawer while open and returns to the hamburger
 * on close. Escape closes. The scrim is aria-hidden and click-dismisses.
 */

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
  services: readonly MegaMenuItem[];
  cities: readonly MegaMenuItem[];
}

const FOCUSABLE =
  'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function MobileNavDrawer({
  open,
  onClose,
  currentPath,
  services,
  cities,
}: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Move focus into the drawer.
    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Intentional, escapable focus trap (I.2).
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const section = (label: string, items: readonly MegaMenuItem[], viewAll: MegaMenuItem) => (
    <details name="apex-drawer" className="border-b border-n-200">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-s3 font-geist font-bold transition-colors duration-[var(--dur-button)] ease-out [&::-webkit-details-marker]:hidden hover:text-[var(--accent)]">
        {label}
        <ChevronDown aria-hidden="true" strokeWidth={2} className="size-5" />
      </summary>
      <ul className="flex list-none flex-col pb-s3">
        {[...items, viewAll].map((item, i) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              aria-current={currentPath === item.href ? 'page' : undefined}
              className={[
                'flex min-h-11 items-center rounded-md px-s3 text-body',
                i === items.length
                  ? 'font-geist font-bold text-[var(--accent)]'
                  : 'text-n-700',
              ].join(' ')}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );

  return (
    <div className="lg:hidden">
      {/* Scrim. Stops short of the sticky bar so the bar is never dimmed. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-x-0 top-0 z-[var(--z-nav-overlay)] h-[calc(100dvh-var(--stickybar-h))] bg-apex-ink/60 transition-opacity duration-[var(--dur-hover)] ease-out"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        /* overscroll-contain stops the scroll chaining to the page behind the
           drawer once it reaches its own end, which on iOS otherwise scrolls
           the body under the overlay and leaves the user somewhere else when
           they close it. */
        className="fixed inset-y-0 right-0 z-[var(--z-nav-overlay)] flex w-[min(88vw,22rem)] flex-col overflow-y-auto overscroll-contain bg-apex-paper px-s4 pb-[calc(var(--stickybar-h)+var(--s-4))] pt-s3 shadow-lg transition-transform duration-[var(--dur-hover)] ease-out"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-md"
          >
            <X aria-hidden="true" strokeWidth={2} className="size-6" />
            <span className="visually-hidden">Close navigation</span>
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-s2 flex flex-col">
          {section('Services', services, {
            label: 'View All Services',
            href: '/services',
          })}
          {section('Service Areas', cities, {
            label: 'View All Service Areas',
            href: '/service-areas',
          })}

          <ul className="flex list-none flex-col">
            {[
              { label: 'About', href: '/about' },
              { label: 'Projects', href: '/projects' },
              { label: 'Reviews', href: '/reviews' },
              { label: 'Financing', href: '/financing' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <li key={item.href} className="border-b border-n-200">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={currentPath === item.href ? 'page' : undefined}
                  className="flex min-h-12 items-center py-s3 font-geist font-bold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-s5 flex flex-col gap-s3">
          <PhoneLink display="full" context="header" />
          <Button variant="primary" href="/contact" fullWidth>
            Get a Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
