'use client';

import { useLayoutEffect } from 'react';

/**
 * §4.11 / C.14 — the entrance-motion threshold, implemented.
 *
 * "Entrance motion is a PAGE-LOAD device, not a scroll device. Compute the
 *  threshold once at mount: any section whose offsetTop < 1.5 × innerHeight is
 *  animation-eligible; everything else renders statically and is NEVER
 *  OBSERVED. Do not attach an IntersectionObserver to sections below the
 *  threshold — not 'observe and skip', but no observer at all."
 *
 * That is exactly what this does, and it is the whole implementation: one
 * measurement pass at mount, zero observers, zero scroll listeners. The two
 * permitted scroll-triggered animations live in their own components —
 * <StatBlock />'s count-up and <MobileStickyBar />'s slide-in — each firing
 * once only.
 *
 * Sections opt in by rendering `data-entrance`. They render VISIBLE by
 * default: the hidden state is applied here, in a layout effect before paint,
 * so a JS failure degrades to fully visible content rather than a blank page.
 *
 * Mounted once, in the locale layout. Not in J.4's 'use client' list because
 * J.4 enumerates components from Appendix B; this is the mechanism §4.11
 * requires and is logged as an Appendix Z addition.
 */

export const MOTION_ENTRANCE_THRESHOLD = 1.5;

/** Maximum four staggered items (--stagger-cards, §4.11, C.14). */
const MAX_STAGGERED = 4;
const STAGGER_MS = 60;

export default function EntranceMotion() {
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // Instant opacity swap — i.e. nothing to do.

    const limit = MOTION_ENTRANCE_THRESHOLD * window.innerHeight;
    const sections = document.querySelectorAll<HTMLElement>('[data-entrance]');

    const eligible: HTMLElement[] = [];
    sections.forEach((section) => {
      // Sections below the threshold are left entirely alone. No observer is
      // attached to them, and no class is added or removed.
      if (section.offsetTop < limit) eligible.push(section);
    });

    if (eligible.length === 0) return;

    const items: HTMLElement[] = [];
    eligible.forEach((section) => {
      const children = section.querySelectorAll<HTMLElement>('[data-entrance-item]');
      const list = children.length ? Array.from(children) : [section];
      list.forEach((el) => {
        el.classList.add('entrance-hidden');
        items.push(el);
      });
    });

    // Reveal on the next frame so the hidden state is committed first.
    const raf = requestAnimationFrame(() => {
      items.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i, MAX_STAGGERED - 1) * STAGGER_MS}ms`;
        el.classList.add('entrance-ready');
        el.classList.remove('entrance-hidden');
      });
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
