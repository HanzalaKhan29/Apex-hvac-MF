'use client';

import { useEffect } from 'react';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/contact';

/**
 * Universal Website Build Checklist, Phase 6 — root-layout error boundary.
 *
 * The ONLY boundary that catches an error thrown by app/layout.tsx itself
 * (fonts, <html>, the metadata block). Next requires this file to render its
 * own <html> and <body> because it fully replaces the root layout when
 * active — globals.css and every other component in the tree came from the
 * layout that just failed, so none of it can be trusted here. Inline styles
 * only, brand colours as literal hex (matching app/globals.css's
 * --color-apex-ink / --color-apex-copper / --color-apex-paper tokens), no
 * imported components beyond the two phone constants (plain strings, not
 * components — safe regardless of what broke).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error boundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#0A1421',
          color: '#FAF8F4',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
            Something went wrong on our end.
          </h1>
          <p style={{ fontSize: '16px', lineHeight: 1.5, marginBottom: '28px', opacity: 0.85 }}>
            Not your connection, not your AC. Try again, or call and skip the
            site entirely.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'stretch',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '48px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#AD5622',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href={`tel:${PHONE_E164}`}
              style={{
                minHeight: '48px',
                borderRadius: '10px',
                border: '1.5px solid rgba(250,248,244,0.35)',
                color: '#FAF8F4',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Call Now — {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
