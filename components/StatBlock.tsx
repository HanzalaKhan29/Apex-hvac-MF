'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EM_DASH } from '@/lib/placeholders';

/**
 * B.18 — <StatBlock />
 *
 * A single statistic: Roboto numeral, count-up, label (§5.6).
 *
 * PLACEHOLDER RULE (§9.4, A.0.5, B.18): where `value` is null the block
 * renders the label with an EM-DASH in the numeral slot. It is NOT omitted —
 * unlike <TrustBadge />, the stats grid is a fixed four-column composition and
 * dropping a member would change the approved layout. No figure is invented.
 *
 * ACCESSIBILITY (B.18, I.5): the final value is present in the DOM from first
 * paint; the count-up animates a VISUAL LAYER ONLY, so assistive technology
 * and non-JS readers always receive the real number.
 *
 * MOTION: counts up from 0 on scroll-into-view, ONCE ONLY, over --dur-counter
 * (1400ms), ease-out. This is one of the only two permitted scroll-triggered
 * animations in the system (§4.11); the other is <MobileStickyBar />.
 * Under prefers-reduced-motion the final value displays immediately.
 */

export interface StatBlockProps {
  value: string | null;
  label: string;
  ground?: 'ink' | 'paper';
}

/** Splits "800+" into { number: 800, prefix: '', suffix: '+' } so the numeric
 *  part can animate while any decoration stays put. */
function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  if (!match) return null;
  const digits = Number(match[2].replace(/,/g, ''));
  if (!Number.isFinite(digits)) return null;
  return { prefix: match[1], target: digits, suffix: match[3], raw: match[2] };
}

export default function StatBlock({ value, label, ground = 'ink' }: StatBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  /*
   * MUST be memoised on the raw string.
   *
   * parseValue returns a fresh object, so computing it inline made it a NEW
   * dependency identity on every render. Each setDisplay re-ran the effect,
   * which disconnected and rebuilt the IntersectionObserver, which fired
   * again because the element was still on screen, which started a second
   * rAF loop, and so on. The competing loops overwrote each other and the
   * counter froze part-way: the stats band rendered "1+" and "0+" instead of
   * "15+" and "800+". The label under it made that look like real data.
   */
  const parsed = useMemo(() => (value ? parseValue(value) : null), [value]);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!parsed || !ref.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // Final value already rendered; never animate.

    const node = ref.current;
    let cancelled = false;
    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect(); // Once only.

        const duration = 1400; // --dur-counter
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / duration);
          // ease-out
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(parsed.target * eased).toLocaleString('en-US'));
          if (t < 1) frame = requestAnimationFrame(tick);
          else setDisplay(null); // Hand back to the real value in the DOM.
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [parsed]);

  const tone = ground === 'ink' ? 'text-apex-paper' : 'text-apex-ink';
  const labelTone = ground === 'ink' ? 'text-apex-paper/70' : 'text-n-700';

  return (
    <div ref={ref} className="flex flex-col gap-s1">
      {/* No icon per stat — the number carries the visual weight (§5.6). */}
      <p className={`num text-h1 leading-none ${tone}`}>
        {parsed ? (
          <>
            {parsed.prefix}
            {/* aria-hidden animated layer over the real value, so screen
                readers never hear a counting number. */}
            <span aria-hidden={display !== null || undefined}>
              {display ?? parsed.raw}
            </span>
            {display !== null ? (
              <span className="visually-hidden">{parsed.raw}</span>
            ) : null}
            {parsed.suffix}
          </>
        ) : (
          <span aria-hidden="true">{EM_DASH}</span>
        )}
      </p>
      <p className={`text-small font-medium ${labelTone}`}>{label}</p>
    </div>
  );
}
