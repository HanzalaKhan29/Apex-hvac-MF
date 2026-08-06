'use client';

import { useEffect } from 'react';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/contact';

/**
 * Universal Website Build Checklist, Phase 6 — page-level error boundary.
 *
 * Catches a runtime error thrown by a page/component under [locale]. Does
 * NOT catch an error thrown by app/[locale]/layout.tsx itself (Next never
 * routes a segment's own layout errors to that segment's error.tsx) — that
 * case falls through to app/error.tsx one level up.
 *
 * DELIBERATELY minimal, no imported components (Section/SectionHeading/
 * Button etc.): error.tsx is a client boundary that ships in every page's
 * client bundle under this segment, so anything it imports counts against
 * J.4's build-blocking bundle budget for EVERY route, not just the error
 * path. First attempt reused the shared components and blew the budget by
 * ~26KB shared-chunk-wide — plain markup with existing (already-compiled,
 * zero marginal-JS-cost) Tailwind utility classes instead.
 *
 * Never renders `error.message` or `error.stack` to the visitor; that's for
 * the server log only.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[locale error boundary]', error);
  }, [error]);

  return (
    <section className="mx-auto max-w-[640px] px-s4 py-[96px] text-center">
      <h1 className="text-h1 text-apex-ink">Something went wrong on our end.</h1>
      <p className="mt-s3 text-body text-n-700">
        Not your connection, not your AC. This page hit a snag. Try again, or
        call and skip the site entirely.
      </p>

      <div className="mt-s5 flex flex-col gap-s3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-14 items-center justify-center gap-s2 rounded-md border border-transparent bg-apex-copper px-[34px] py-[18px] text-center font-geist font-bold text-body text-white hover:bg-apex-copper-hover"
        >
          Try again
        </button>
        <a
          href={`tel:${PHONE_E164}`}
          className="inline-flex min-h-14 items-center justify-center gap-s2 rounded-md border-[1.5px] border-n-200 bg-transparent px-[34px] py-[18px] text-center font-geist font-bold text-body text-apex-ink hover:bg-n-100"
        >
          Call Now — {PHONE_DISPLAY}
        </a>
      </div>
    </section>
  );
}
