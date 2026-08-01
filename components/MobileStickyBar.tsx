'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { PHONE_E164 } from '@/lib/contact';

/**
 * B.6 — <MobileStickyBar />
 *
 * THE SINGLE HIGHEST-LEVERAGE CONVERSION ELEMENT ON THE SITE. §1.4: a sticky
 * click-to-call bar lifts conversions 25–40%, the largest documented
 * individual optimisation. Its visual weight is deliberately high-contrast,
 * not an afterthought UI element (§3.4).
 *
 * LABELS ARE LOCKED (§3.4's CTA label lock): `Call Now` (left, filled) and
 * `Get Quote` (right, inverse). No other wording.
 *
 * RESPONSIVE (H.1.4): below lg ONLY, on EVERY route. Above lg it does not
 * render and the header `Get a Quote` button carries the role. The two are
 * EXACT COMPLEMENTS — exactly one is present at every viewport width, with no
 * gap and no overlap (§4.5).
 *
 * STACKING (§4.4, §6.1): --z-stickybar (80) sits deliberately ABOVE
 * --z-nav-overlay (70) so the phone stays reachable with the menu open.
 *
 * MOTION (§4.11): slides up ONCE on first scroll past the hero, then stays
 * fixed with no repeated animation — --dur-stickybar (300ms). This is one of
 * only two permitted scroll-triggered animations in the system; the listener
 * removes itself after firing, so nothing stays attached to scroll.
 */

export interface MobileStickyBarProps {
  /** '#quote' where the page has a form, otherwise '/contact'. */
  quoteHref: string;
}

export default function MobileStickyBar({ quoteHref }: MobileStickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal once past roughly the first viewport, i.e. past the hero.
    const threshold = Math.min(window.innerHeight * 0.6, 520);

    const reveal = () => {
      setVisible(true);
      window.removeEventListener('scroll', onScroll);
    };

    const onScroll = () => {
      if (window.scrollY > threshold) reveal();
    };

    if (reduced || window.scrollY > threshold) {
      reveal();
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-[var(--z-stickybar)] lg:hidden',
        'bg-apex-ink shadow-bar',
        // The safe-area inset is part of --stickybar-h; pad for it here so the
        // buttons sit above the iOS home indicator.
        'pb-[env(safe-area-inset-bottom,0px)]',
        'transition-transform duration-[var(--dur-stickybar)] ease-out',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      <div className="grid grid-cols-2 gap-s2 p-s2">
        {/* Both buttons exceed the 44×44 standalone-control minimum (I.7). */}
        <a
          href={`tel:${PHONE_E164}`}
          data-phone-link
          data-link-location="sticky-bar"
          className="inline-flex min-h-12 items-center justify-center gap-s2 rounded-md bg-apex-copper font-geist font-bold text-white"
        >
          <Phone aria-hidden="true" strokeWidth={2} className="size-5" />
          Call Now
        </a>
        <Link
          href={quoteHref}
          className="inline-flex min-h-12 items-center justify-center rounded-md border-[1.5px] border-white/35 font-geist font-bold text-apex-paper"
        >
          Get Quote
        </Link>
      </div>
    </div>
  );
}
