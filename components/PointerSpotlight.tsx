'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor spotlight. Appendix Z addition, decided with the user — not in the
 * blueprint, does not conflict with it. A soft --apex-copper radial glow that
 * trails the pointer at 8-12% opacity (`.cursor-spotlight` in globals.css).
 *
 * WHY THIS IS SAFE AGAINST §4.11's RESTRAINT RULE. §4.11 exists to stop
 * "everything fades up as you scroll" — content-bearing elements animating in
 * a way the visitor is meant to notice. This is the opposite: it carries no
 * content, sits at aria-hidden, and the target is deliberately below the
 * threshold of conscious perception. It reads as ambient texture, the way a
 * subtle grain or vignette would, not as "the page has an animation."
 *
 * PERFORMANCE. The listener never touches React state — a mouse firing 60+
 * times a second through setState would be exactly the "controlled input,
 * cheap per keystroke" problem the Web Interface Guidelines warn about, just
 * for pointer events instead of keystrokes. Position is written straight to
 * two CSS custom properties on a single fixed div, batched to one write per
 * animation frame, with the actual position LERPED toward the pointer rather
 * than snapped to it — that's what makes the glow feel like it trails rather
 * than teleports.
 *
 * SCOPE. Gated on `(hover: hover) and (pointer: fine)` in CSS AND skipped
 * here in JS before a single listener attaches — a touch device gets zero
 * mousemove cost, not a hidden-but-still-computing one. Also skipped under
 * `prefers-reduced-motion: reduce`.
 */
export default function PointerSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const el = ref.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const LERP = 0.12;

    const tick = () => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;
      el.style.setProperty('--spot-x', `${currentX}px`);
      el.style.setProperty('--spot-y', `${currentY}px`);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-spotlight" />;
}
