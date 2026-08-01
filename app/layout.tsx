import type { Metadata, Viewport } from 'next';
import { Geist, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

/**
 * Root layout.
 *
 * Appendix F.0 — <html lang>, fonts, and the site-wide JSON-LD graph.
 * Appendix J.2 — all three families via next/font/google for automatic
 * self-hosting and preloading, font-display: swap, metrics-matched fallbacks.
 */

// Display and interface. H1–H4, eyebrows, button labels, nav labels. 600–800.
const geist = Geist({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--ff-geist',
});

// Body. All body copy, form labels, card descriptions. 400–600.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--ff-inter',
});

/**
 * Numerals only. WEIGHT 500 ONLY — no other Roboto weight is loaded (§4.3, J.2)
 * — and applied exclusively through the .num utility, never a raw font-family
 * declaration.
 *
 * MANDATORY SUBSETTING (§4.3). The file is restricted by `unicode-range` to
 * digits, punctuation and the star glyph, which cuts it to 6.6KB against
 * ~15KB+ for a full Latin subset. next/font/google cannot express a
 * unicode-range restriction, so scripts/build-fonts.mjs subsets the file at
 * build time via the Google Fonts `text` parameter and it is self-hosted
 * through next/font/local, which can declare it.
 *
 * The range is what makes this correct rather than merely smaller: the browser
 * downloads this face ONLY when it actually needs one of these glyphs, so
 * pages with no numerals never fetch it at all.
 */
const roboto = localFont({
  src: './fonts/roboto-500-numerals.woff2',
  weight: '500',
  style: 'normal',
  display: 'swap',
  variable: '--ff-roboto',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0030-0039, U+002B, U+002C, U+002D, U+002E, U+0028, U+0029, U+0024, U+0025, U+00B0, U+2605',
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.apexcomfortsystems.com'),
  title: 'Apex Comfort Systems | Licensed HVAC Repair & Installation, Phoenix Metro',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0A1421',
  // 1.4.10 Reflow / 1.4.4 Resize text — zoom is never capped (I.12).
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${roboto.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
