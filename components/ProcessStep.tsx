'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * B.21 — <ProcessStep />
 *
 * One numbered step in the "How It Works" sequence (§5.9, §9.1).
 *
 * VISUAL (§5.9): the number sits in an OUTLINED RING in --apex-copper with the
 * numeral itself in --apex-ink — deliberately not the filled navy circle that
 * phase0 and all four competitor references use. Numeral set in Roboto via the
 * .num utility.
 *
 * Rendered as a list item inside an <ol> (B.27), so the sequence is conveyed
 * structurally and not only visually (I.1). The connector rule between steps is
 * decorative and aria-hidden.
 *
 * Numbering is legitimate here: this is a real sequence, and the order carries
 * information the reader needs.
 *
 * MOTION (Z.21, owner-requested addition — B.27 originally specified none):
 * the connector fills in copper, once, as it scrolls into view, so steps 1→4
 * visibly "connect" while reading down the sequence. Third scroll-triggered
 * exception alongside <StatBlock />'s count-up and <MobileStickyBar />'s
 * slide-in — same one-shot IntersectionObserver pattern, same
 * prefers-reduced-motion bailout to the final state.
 */

export interface ProcessStepProps {
  index: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function ProcessStep({
  index,
  title,
  description,
  isLast,
}: ProcessStepProps) {
  const connectorRef = useRef<HTMLSpanElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    if (isLast || !connectorRef.current) return;
    // Reduced motion: the .motion-reduce: fill class below already renders
    // the final state via CSS alone, so the observer is skipped entirely
    // rather than calling setState synchronously here.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const node = connectorRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setGrown(true);
        observer.disconnect();
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLast]);

  return (
    <li className="relative flex gap-s3 md:flex-col md:gap-s3">
      {!isLast ? (
        <span
          ref={connectorRef}
          aria-hidden="true"
          className={[
            'absolute overflow-hidden bg-n-200',
            // Vertical connector below md, horizontal across the row at md+.
            'left-6 top-14 h-[calc(100%-2rem)] w-px',
            'md:left-14 md:top-6 md:h-px md:w-[calc(100%-3.5rem)]',
          ].join(' ')}
        >
          <span
            className={[
              'absolute inset-0 bg-apex-copper',
              'origin-top transition-transform duration-700 ease-out md:origin-left',
              'motion-reduce:scale-y-100 motion-reduce:md:scale-x-100',
              grown ? 'scale-y-100 md:scale-x-100' : 'scale-y-0 md:scale-x-0',
            ].join(' ')}
          />
        </span>
      ) : null}

      <span
        className={[
          'relative z-[var(--z-raised)] inline-flex size-12 shrink-0 items-center justify-center',
          // Outlined ring, not a filled circle.
          'rounded-full border-2 border-apex-copper bg-apex-paper',
        ].join(' ')}
      >
        <span className="num text-h4 text-apex-ink">{index}</span>
      </span>

      <div className="min-w-0">
        <h3 className="text-h4 text-apex-ink">{title}</h3>
        <p className="mt-s1 text-body measure-body text-n-700">{description}</p>
      </div>
    </li>
  );
}
