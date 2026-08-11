/**
 * Appendix E — logo and icon manifest. Single geometry source.
 *
 * Emits every asset in E.1 and E.2 from one set of constants, so the SVG
 * lockups, the favicon and the raster app icons can never drift apart:
 *
 *   logo-full.svg           logo-mark.svg           favicon.svg
 *   logo-full-inverse.svg   logo-mark-inverse.svg   favicon.ico
 *   apple-touch-icon.png    icon-192.png            icon-512.png
 *   icon-512-maskable.png
 *
 * Run: npm run assets:logo
 *
 * E.0 — the mark is an abstracted duct/vent chevron: angled parallel bars
 * suggesting directed airflow, reading simultaneously as a peak. No literal
 * snowflake or flame. Every file uses currentColor or the exact token hexes
 * #0A1421 and #AD5622, and no other values.
 */

import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');

const INK = '#0A1421';
const COPPER = '#AD5622';
const PAPER = '#FAF8F4';

/* ---------------------------------------------------------------------------
   Geometry
   --------------------------------------------------------------------------- */

const VB = { w: 100, h: 86 };

const INK_STROKE = 11;
const COPPER_STROKE = 9;

/*
 * Explicit path data, not a parametric construction.
 *
 * The first version derived the arms from unit vectors and a bisector offset.
 * It was tidy but it produced the WRONG SHAPE: the left arm came out far
 * shorter than the right, so the mark read as a "7" or a flag rather than a
 * peak, and the copper bars ran at the arm angle and cut straight through the
 * triangle instead of trailing away from it.
 *
 * These paths were arrived at by rendering candidates against the delivered
 * `2.brand icon.png` and comparing, then frozen. Once a mark is settled, an
 * explicit path is more honest than a formula that has to be reverse-engineered
 * to be adjusted.
 *
 * Reads as a peak with directed airflow trailing behind it (§5.2.1): two
 * nested chevrons, and three copper bars that tuck behind the left arm and
 * shorten as they fall away.
 */
const INK_PATHS = [
  'M16 80 L56 8 L96 80',   // outer peak
  'M35 80 L56 41 L77 80',  // nested inner peak
];

const COPPER_PATHS = [
  'M40 44 L3 56',
  'M34 59 L6 68',
  'M28 73 L11 79',
];

/** Copper is drawn FIRST so the ink chevron overlaps it, as in the reference. */
function markBody({ inkColor, copperColor }) {
  const paths = (list) =>
    list.map((d) => `      <path d="${d}"/>`).join(String.fromCharCode(10));

  return [
    `  <g fill="none" stroke-linecap="butt" stroke-linejoin="miter">`,
    `    <g stroke="${copperColor}" stroke-width="${COPPER_STROKE}">`,
    paths(COPPER_PATHS),
    `    </g>`,
    `    <g stroke="${inkColor}" stroke-width="${INK_STROKE}">`,
    paths(INK_PATHS),
    `    </g>`,
    `  </g>`,
  ].join(String.fromCharCode(10));
}

/** Monochrome variant for the raster app icons (E.2: mark in a single tone). */
function markBodyMono(stroke) {
  return markBody({ inkColor: stroke, copperColor: stroke });
}

/* ---------------------------------------------------------------------------
   E.1 — logo assets
   --------------------------------------------------------------------------- */

const A11Y = `  <title>Apex Comfort Systems</title>`;

function markSvg({ inkColor }) {
  const h = 40;
  const w = +((VB.w / VB.h) * h).toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" width="${w}" height="${h}" role="img" aria-label="Apex Comfort Systems">
${A11Y}
${markBody({ inkColor, copperColor: COPPER })}
</svg>
`;
}

// Horizontal lockup: mark scaled to 40 tall, then the wordmark block.
const LOCKUP_SCALE = 40 / VB.h;
const MARK_W = VB.w * LOCKUP_SCALE;
const WORD_X = +(MARK_W + 10).toFixed(1);
const WORD_W = 118;
const FULL_W = +(WORD_X + WORD_W).toFixed(0);

const FONT = `Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`;

function fullSvg({ inkColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FULL_W} 40" width="${FULL_W}" height="40" role="img" aria-label="Apex Comfort Systems">
${A11Y}
  <g transform="scale(${LOCKUP_SCALE.toFixed(4)})">
${markBody({ inkColor, copperColor: COPPER }).replace(/^/gm, '  ')}
  </g>
  <!-- Wordmark. textLength locks the metrics so the lockup keeps its
       proportions even where the Geist webfont is unavailable, which is the
       case for standalone file use: og-default.jpg, the structured-data logo
       property, and the IMG-09 van composite. Inline in the header and
       footer, Geist resolves normally. -->
  <text x="${WORD_X}" y="24.5" font-family="${FONT}"
        font-size="28" font-weight="800" letter-spacing="-0.02em"
        textLength="${WORD_W}" lengthAdjust="spacingAndGlyphs"
        fill="${inkColor}">APEX</text>
  <!-- Section 5.2.1 copper-in-logo exception: the subtitle is set in copper as
       brand identity, not as an affordance. This is the only permitted
       non-actionable use of copper anywhere in the system. -->
  <text x="${WORD_X}" y="35.5" font-family="${FONT}"
        font-size="7.4" font-weight="700" letter-spacing="0.16em"
        textLength="${WORD_W}" lengthAdjust="spacing"
        fill="${COPPER}">COMFORT SYSTEMS</text>
</svg>
`;
}

/* ---------------------------------------------------------------------------
   E.2 — favicon
   ---------------------------------------------------------------------------
   E.2 originally read "A favicon is not a scaled-down logo," and reduced the
   mark to two strokes (outer chevron + longest airflow bar) so it would
   survive a 16x16 read without turning into a grey blob.

   Z.43 (Appendix Z) — that reduction is now DROPPED ENTIRELY, owner-requested
   twice: the abstracted two-stroke version did not read as Apex's mark to the
   person who owns the brand, which is the only test that actually matters for
   a favicon. The favicon is now the REAL mark — the same INK_PATHS and
   COPPER_PATHS every other asset in this file draws — so the tab icon, the
   header lockup, the app icons and the OG image are finally one shape.

   TRADEOFF, stated rather than hidden: five strokes at 16x16 is genuinely
   tighter than two. It reads correctly at 32 and 48 (both shipped in the .ico)
   and on any HiDPI tab strip, where the SVG is used instead. If the 16px .ico
   frame ever looks muddy on a specific setup, drop 16 from the `for` loop at
   the bottom of this file so browsers scale the 32px frame down instead —
   that keeps one shape everywhere rather than re-abstracting the mark.

   The mark's own 100x86 space is centred in a square viewBox so it fills the
   icon rather than sitting in letterbox bars. */

const FAV_VIEWBOX = '-2 -8 104 104';
const FAV_GROUND_RECT = 'x="-2" y="-8" width="104" height="104"';

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FAV_VIEWBOX}" width="32" height="32">
  <!-- E.2 acceptance test: render at 16x16 in a browser tab beside four other
       open tabs. If the mark reads as a grey blob rather than a distinct
       shape, see the Z.43 note in scripts/build-logo.mjs. -->
  <style>
    .peak { stroke: ${INK}; }
    .ground { fill: ${PAPER}; }
    @media (prefers-color-scheme: dark) {
      .peak { stroke: ${PAPER}; }
      .ground { fill: ${INK}; }
    }
  </style>
  <rect class="ground" ${FAV_GROUND_RECT}/>
  <g fill="none" stroke-linecap="butt" stroke-linejoin="miter">
    <g stroke="${COPPER}" stroke-width="${COPPER_STROKE}">
${COPPER_PATHS.map((d) => `      <path d="${d}"/>`).join(String.fromCharCode(10))}
    </g>
    <g class="peak" stroke-width="${INK_STROKE}">
${INK_PATHS.map((d) => `      <path d="${d}"/>`).join(String.fromCharCode(10))}
    </g>
  </g>
</svg>
`;
}

/* Z.43 — the .ico's PNG frames. Same real mark as faviconSvg(); favicon.ico
   has no media query, so this is the light-mode rendering only, matching the
   SVG's default/no-preference branch. */
const faviconRaster = ({ ground, stroke }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FAV_VIEWBOX}">
  <rect ${FAV_GROUND_RECT} fill="${ground}"/>
${markBody({ inkColor: stroke, copperColor: COPPER })}
</svg>`;

/** Full mark, monochrome, on a solid ground — for the raster app icons. */
function iconRaster({ ground, stroke, scale = 1 }) {
  const iw = VB.h; // square canvas
  const inset = (VB.w - iw) / 2;
  const s = scale;
  const cx = VB.w / 2;
  const cy = VB.h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${inset} 0 ${iw} ${VB.h}">
  <rect x="${inset}" y="0" width="${iw}" height="${VB.h}" fill="${ground}"/>
  <g transform="translate(${(cx * (1 - s)).toFixed(2)} ${(cy * (1 - s)).toFixed(2)}) scale(${s})">
${markBodyMono(stroke)}
  </g>
</svg>`;
}

/* ---------------------------------------------------------------------------
   ICO container — PNG-in-ICO, multi-resolution
   --------------------------------------------------------------------------- */

function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;

  entries.forEach(({ size, data }, i) => {
    const p = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, p);
    dir.writeUInt8(size >= 256 ? 0 : size, p + 1);
    dir.writeUInt8(0, p + 2);
    dir.writeUInt8(0, p + 3);
    dir.writeUInt16LE(1, p + 4);
    dir.writeUInt16LE(32, p + 6);
    dir.writeUInt32LE(data.length, p + 8);
    dir.writeUInt32LE(offset, p + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

/* ---------------------------------------------------------------------------
   Emit
   --------------------------------------------------------------------------- */

const write = (name, contents) => {
  const buf = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
  writeFileSync(join(publicDir, name), buf);
  console.log(`  ${name.padEnd(26)} ${(buf.length / 1024).toFixed(1)} KB`);
};

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

console.log('\n  Appendix E — logo and icon manifest\n');

write('logo-mark.svg', markSvg({ inkColor: INK }));
write('logo-mark-inverse.svg', markSvg({ inkColor: 'currentColor' }));
write('logo-full.svg', fullSvg({ inkColor: INK }));
write('logo-full-inverse.svg', fullSvg({ inkColor: 'currentColor' }));
write('favicon.svg', faviconSvg());

write('apple-touch-icon.png', await png(iconRaster({ ground: INK, stroke: PAPER }), 180));
write('icon-192.png', await png(iconRaster({ ground: INK, stroke: PAPER }), 192));
write('icon-512.png', await png(iconRaster({ ground: INK, stroke: PAPER }), 512));
// Maskable: a square inscribed in a circle of 40% radius has side ~56.6%.
write(
  'icon-512-maskable.png',
  await png(iconRaster({ ground: INK, stroke: PAPER, scale: 0.566 }), 512)
);

const ico = [];
for (const size of [16, 32, 48]) {
  ico.push({ size, data: await png(faviconRaster({ ground: PAPER, stroke: INK }), size) });
}
write('favicon.ico', buildIco(ico));

console.log('');
