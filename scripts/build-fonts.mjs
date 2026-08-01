/**
 * §4.3 / J.2 — mandatory Roboto subsetting.
 *
 * "Roboto loads with unicode-range restricted to digits, punctuation and the
 *  star glyph: U+0030-0039, U+002B, U+002C, U+002D, U+002E, U+0028, U+0029,
 *  U+0024, U+0025, U+00B0, U+2605. This reduces the file to roughly 3–5KB
 *  versus ~15KB+ for a full Latin subset. WEIGHT 500 ONLY — no other Roboto
 *  weight is loaded."
 *
 * next/font/google cannot express a unicode-range restriction, so the file is
 * subsetted here at build time via the Google Fonts CSS API's `text` parameter
 * and then self-hosted through next/font/local, which CAN declare it.
 *
 * Run: npm run assets:fonts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
// next/font/local resolves a module path and fingerprints the file into the
// build output, so it lives under app/ rather than public/ — serving it from
// public/ as well would ship the same bytes twice.
const outDir = join(here, '..', 'app', 'fonts');
mkdirSync(outDir, { recursive: true });

/** Exactly the glyph set §4.3 specifies, in codepoint order. */
const GLYPHS = '0123456789+,-.()$%°★';

export const UNICODE_RANGE =
  'U+0030-0039, U+002B, U+002C, U+002D, U+002E, U+0028, U+0029, U+0024, U+0025, U+00B0, U+2605';

const cssUrl =
  'https://fonts.googleapis.com/css2?family=Roboto:wght@500' +
  `&text=${encodeURIComponent(GLYPHS)}` +
  '&display=swap';

console.log('\n  §4.3 / J.2 — Roboto numeral subset\n');
console.log(`  glyphs: ${GLYPHS}`);

const css = await fetch(cssUrl, {
  headers: {
    // woff2 is only served to a UA that advertises support for it.
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  },
}).then((r) => {
  if (!r.ok) throw new Error(`Google Fonts CSS returned ${r.status}`);
  return r.text();
});

/*
 * The subsetted file is served from a /l/font?kit=... URL rather than a path
 * ending in .woff2, so match on the format() hint instead of the extension.
 */
const match = css.match(/url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/);
if (!match) {
  console.error('\n  Could not find a woff2 URL in the returned CSS:\n');
  console.error(css.slice(0, 600));
  process.exit(1);
}

const font = Buffer.from(await (await fetch(match[1])).arrayBuffer());
const outPath = join(outDir, 'roboto-500-numerals.woff2');
writeFileSync(outPath, font);

const kb = font.length / 1024;
console.log(`  weight: 500 only`);
console.log(`  output: app/fonts/roboto-500-numerals.woff2  ${kb.toFixed(1)} KB`);
console.log(
  `  budget: 3–5 KB against ~15 KB+ for a full Latin subset — ${kb <= 6 ? 'MET' : 'OVER'}\n`
);
