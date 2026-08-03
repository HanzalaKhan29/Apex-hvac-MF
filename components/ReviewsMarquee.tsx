'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ReviewCard, { type ReviewCardProps } from './ReviewCard';

/**
 * Z.25 — owner-requested marquee layout for the full review set (`/reviews`),
 * built with Framer Motion per the owner's own reference component.
 *
 * Adapted rather than copy-pasted: the reference used fake avatar photos
 * (real Unsplash headshots) pinned to invented names, which would misuse a
 * real person's photo on a fabricated testimonial — a step past "no motion,"
 * a misrepresentation. Dropped the avatars, kept everything else: the
 * three-column vertical loop, per-column speed variance, hover/focus pause,
 * spring lift on the active card. Cards stay <ReviewCard />, so demo-mode
 * attribution (no Google "G", no stars, no verified badge — §5.10) is
 * unchanged regardless of which layout renders it.
 *
 * ACCESSIBILITY: continuous auto-playing motion needs a way to stop it
 * (WCAG 2.2.2). Hover/focus-within pauses each column, and
 * prefers-reduced-motion swaps in the plain static grid entirely — no
 * partial-motion state to reason about under either condition.
 */

export interface ReviewsMarqueeProps {
  reviews: readonly Omit<ReviewCardProps, 'mode'>[];
  mode: 'demo' | 'live';
}

function Column({
  items,
  mode,
  duration,
  columnIndex,
  visibilityClassName,
}: {
  items: readonly Omit<ReviewCardProps, 'mode'>[];
  mode: 'demo' | 'live';
  duration: number;
  columnIndex: number;
  visibilityClassName?: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={[
        'min-w-0 flex-1 overflow-hidden',
        visibilityClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.ul
        animate={paused ? undefined : { y: '-50%' }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        className="m-0 flex list-none flex-col gap-s4 p-0"
      >
        {[0, 1].flatMap((pass) =>
          items.map((review, i) => (
            <ReviewCard
              key={`${columnIndex}-${pass}-${i}`}
              {...review}
              mode={mode}
              tabIndex={pass === 1 ? -1 : 0}
              ariaHidden={pass === 1}
              // Scale/lift now lives on <ReviewCard />'s own <figure> (shared
              // with the static-grid usage) — this className only adds what's
              // unique to the marquee: the focus-visible ring, since the
              // li's hover:scale-[1.02] would otherwise double-stack with
              // the figure's own hover:scale-[1.02] on top of it.
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-copper"
            />
          ))
        )}
      </motion.ul>
    </div>
  );
}

export default function ReviewsMarquee({ reviews, mode }: ReviewsMarqueeProps) {
  const reducedMotion = useReducedMotion();
  // Avoids an SSR/client mismatch: prefers-reduced-motion is only knowable
  // client-side, so the very first render always matches the server (motion
  // on), and the static swap happens a tick later if the query matches.
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (reducedMotion && ready) {
    return (
      <ul className="grid list-none items-stretch gap-s3 md:grid-cols-2 md:gap-s4 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <li key={`${review.attribution}-${i}`}>
            <ReviewCard {...review} mode={mode} />
          </li>
        ))}
      </ul>
    );
  }

  const columns = [
    reviews.filter((_, i) => i % 3 === 0),
    reviews.filter((_, i) => i % 3 === 1),
    reviews.filter((_, i) => i % 3 === 2),
  ].filter((col) => col.length > 0);

  return (
    <div
      role="region"
      aria-label="Scrolling customer reviews"
      className="flex max-h-[42rem] gap-s4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
    >
      {/* Matches the reduced-motion fallback's own md:grid-cols-2
          lg:grid-cols-3 — three columns squeezed a card down to ~140px on a
          440px phone, wrapping review text one word per line. Column count
          now tracks viewport the same way the static grid already does. */}
      {columns.map((col, i) => (
        <Column
          key={i}
          items={col}
          mode={mode}
          duration={16 + i * 3}
          columnIndex={i}
          visibilityClassName={i === 1 ? 'hidden md:block' : i === 2 ? 'hidden lg:block' : undefined}
        />
      ))}
    </div>
  );
}
