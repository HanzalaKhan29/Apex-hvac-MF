'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

/**
 * B.3 — <MegaMenu />
 *
 * The Services and Service Areas dropdown panels, implementing §3.2's
 * interaction specification IN FULL.
 *
 * PANEL CONTENT is fixed (§3.2): link lists only. No promotional cards, no
 * imagery, no featured blocks. The trailing "View All" link is a member of the
 * panel for keyboard purposes.
 *
 * TRIGGER. Click/tap on the parent item. Hover MAY open it after a 150ms
 * intent delay as a desktop enhancement, but click works independently and the
 * item is a real <button aria-expanded>, never a hover-only <div>. Hover-only
 * menus are inoperable on touch and hostile to keyboard users, and
 * touch-capable laptops make "desktop means hover" a false assumption.
 *
 * KEYBOARD (§3.2, B.3, I.2).
 *   Enter / Space  open, move focus to the first panel item
 *   Escape         close, return focus to the trigger
 *   Tab from last  close the panel and continue to the next header item —
 *                  focus never escapes into hidden content
 *   Arrow keys     move within the panel
 *   Home / End     jump to first / last
 *
 * DISMISSAL. Escape, outside click, focus leaving the panel, or route change.
 *
 * ARIA. Trigger: aria-expanded, aria-controls. Panel: role="group",
 * aria-labelledby. The panel is `hidden` when closed — NOT opacity: 0, which
 * would leave it in the tab order.
 *
 * MOTION. --dur-menu (180ms) opacity plus 4px translateY on the panel only.
 * No item stagger. Instant under prefers-reduced-motion.
 */

export interface MegaMenuItem {
  label: string;
  href: string;
}

export interface MegaMenuProps {
  triggerLabel: 'Services' | 'Service Areas';
  items: readonly MegaMenuItem[];
  viewAllLabel: string;
  viewAllHref: '/services' | '/service-areas';
  currentPath: string;
}

const HOVER_INTENT_MS = 150;

export default function MegaMenu({
  triggerLabel,
  items,
  viewAllLabel,
  viewAllHref,
  currentPath,
}: MegaMenuProps) {
  const reactId = useId();
  const panelId = `megamenu-${reactId}`;
  const triggerId = `${panelId}-trigger`;

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();

  /** All focusable panel members, in order. The View All link is the last. */
  const panelLinks = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []),
    []
  );

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  /*
   * Dismissal: route change (§3.2).
   *
   * Adjusted DURING RENDER rather than in an effect. Closing the panel is a
   * reaction to a prop changing, not synchronisation with an external system,
   * and doing it in an effect costs an extra render pass with the stale panel
   * still open — which on a slow device is a visible flash of the old menu
   * over the new page. This is React's documented "adjusting state when props
   * change" pattern.
   */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Dismissal: outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  // Dismissal: Escape anywhere while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  /*
   * §3.2: "Enter / Space on the trigger opens and moves focus to the first
   * panel item."
   *
   * Moving focus cannot happen in the key handler. The panel carries the
   * `hidden` attribute while closed — deliberately, so it stays out of the tab
   * order — and a hidden element is not focusable. Calling focus() before
   * React has committed the un-hidden panel is a silent no-op, which is
   * exactly what it did. The flag below defers the focus move to an effect
   * that runs after the DOM update, so the panel is really open by then.
   */
  const focusFirstOnOpen = useRef(false);

  useEffect(() => {
    if (!open || !focusFirstOnOpen.current) return;
    focusFirstOnOpen.current = false;
    panelLinks()[0]?.focus();
  }, [open, panelLinks]);

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') {
      return;
    }

    /*
     * preventDefault on keydown suppresses the button's native activation
     * click for Enter and Space, and suppresses page scroll for Space and
     * ArrowDown. That leaves exactly ONE code path that changes state, which
     * matters: the previous version let the key handler and the native click
     * both toggle, and they cancelled each other out so the panel never opened.
     *
     * Enter and Space toggle (ArrowDown only opens), so a keyboard user can
     * close the panel the same way they opened it, without reaching for Escape.
     */
    event.preventDefault();

    if (open && event.key !== 'ArrowDown') {
      close(true);
      return;
    }

    focusFirstOnOpen.current = true;
    setOpen(true);
  };

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const links = panelLinks();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        links[Math.min(index + 1, links.length - 1)]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index <= 0) close(true);
        else links[index - 1]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        links[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        links[links.length - 1]?.focus();
        break;
      case 'Tab':
        // Tab from the LAST panel item closes the panel and continues to the
        // next header item. Focus never escapes into hidden content.
        if (!event.shiftKey && index === links.length - 1) close();
        // Shift+Tab from the first item returns to the trigger naturally.
        if (event.shiftKey && index === 0) close();
        break;
      default:
        break;
    }
  };

  // Hover intent — a desktop ENHANCEMENT only. Click works independently.
  const onMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setOpen(true), HOVER_INTENT_MS);
  };
  const onMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpen(false);
  };

  const allItems = [...items, { label: viewAllLabel, href: viewAllHref }];

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // Dismissal: focus leaving the panel.
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={onTriggerKeyDown}
        className="inline-flex min-h-11 shrink-0 items-center gap-s1 whitespace-nowrap font-geist font-bold transition-colors duration-[var(--dur-button)] ease-out hover:text-[var(--accent)]"
      >
        {triggerLabel}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className={`size-4 transition-transform duration-[var(--dur-menu)] ease-out ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="group"
        aria-labelledby={triggerId}
        // `hidden` when closed, not opacity: 0 (§3.2, B.3).
        hidden={!open}
        onKeyDown={onPanelKeyDown}
        className={[
          'absolute left-0 top-full z-[var(--z-megamenu)] mt-s2 w-64',
          'rounded-xl border border-n-200 bg-white p-s2 shadow-lg',
          'transition-[opacity,translate] duration-[var(--dur-menu)] ease-out',
          open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
        ].join(' ')}
      >
        <ul className="flex list-none flex-col">
          {allItems.map((item, i) => {
            const isViewAll = i === items.length;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={currentPath === item.href ? 'page' : undefined}
                  className={[
                    'flex min-h-11 items-center rounded-md px-s3 text-body',
                    'transition-colors duration-[var(--dur-button)] ease-out hover:bg-n-100',
                    isViewAll
                      ? 'mt-s1 border-t border-n-200 pt-s3 font-geist font-bold text-[var(--accent)]'
                      : 'text-n-950',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
