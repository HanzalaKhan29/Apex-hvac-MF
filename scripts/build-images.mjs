/**
 * Appendix D — image manifest. Source → production pipeline.
 *
 * Run: npm run assets:images
 *
 * D.0's production rules, enforced here:
 *   - SOURCE FORMAT. High-quality JPEG or WebP before ingest, never PNG. The
 *     delivered set is 100% PNG, the wrong container for photographs, so every
 *     production filename below carries .jpg and is transcoded here.
 *   - RESOLUTION. Minimum 2x the largest displayed size. The delivered city
 *     set at 1568px is roughly 1.1x against a full-bleed context needing
 *     ~2880px on a 1440px viewport, so the city set is upscaled to >=2880px
 *     before the AVIF/WebP pipeline. D.0 permits regenerate OR upscale.
 *   - RENAME MAP INTEGRITY. Every production filename maps to exactly one
 *     source, and every source appears exactly once — as a production entry,
 *     as UNUSED, as REFERENCE ONLY, or as SUPERSEDED.
 *
 * next/image generates the AVIF and WebP variants from these JPEGs at request
 * time, with a JPEG fallback (J.3).
 */

import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SRC = join(root, '..', 'assest', 'images');
const OUT = join(root, 'public', 'images');
mkdirSync(OUT, { recursive: true });

const INK = '#0A1421';
const COPPER = '#AD5622';

/**
 * D.1 — the rename map.
 *
 * `status` records the Appendix D disposition. REGENERATE and RETOUCH entries
 * still build from the delivered source so the site is complete and reviewable,
 * and are reported at the end as outstanding art-direction work — they are NOT
 * silently treated as approved.
 */
const MAP = [
  // D.1.1
  {
    src: 'img 1.png',
    out: 'technician-condenser-repair.jpg',
    slot: 'IMG-01',
    status: 'APPROVED',
    width: 2400,
  },
  // D.1.2
  {
    src: 'img3.png',
    out: 'ac-repair-manifold-gauge.jpg',
    slot: 'IMG-03',
    status: 'REGENERATE',
    note: 'Damp concrete with visible algae under flat cool overcast light reads Pacific Northwest, not Phoenix — the only image breaking the site-wide warm desert grade. §7 corrects the PROMPT at source; regenerate from the corrected prompt rather than re-running the original.',
    width: 2400,
  },
  // D.1.3
  { src: 'img 4.png', out: 'ac-replacement-install.jpg', slot: 'IMG-04', status: 'APPROVED', width: 2400 },
  // D.1.4
  { src: 'img 5.png', out: 'furnace-inspection.jpg', slot: 'IMG-05', status: 'APPROVED', width: 2400 },
  // D.1.5
  {
    src: 'img 6.png',
    out: 'commercial-rooftop-rtu.jpg',
    slot: 'IMG-06',
    status: 'APPROVED',
    note: 'Soft-focus background canopy reads slightly non-Sonoran. Low-priority connoisseur-level item, not a regeneration trigger (§7.1).',
    width: 2400,
  },
  // D.1.6
  { src: 'img 7.png', out: 'maintenance-coil-service.jpg', slot: 'IMG-07', status: 'APPROVED', width: 2400 },
  // D.1.7
  {
    src: 'img 8.png',
    out: 'indoor-air-quality-filtration.jpg',
    slot: 'IMG-08',
    status: 'RETOUCH',
    note: 'Composition and lighting approved. A legible third-party equipment logo is visible — a direct violation of this prompt’s own negative-prompt instruction. Clone it out; no regeneration needed.',
    width: 2400,
  },
  // D.1.8
  {
    src: 'img 9.png',
    out: 'about-team-shop-bay.jpg',
    slot: 'IMG-09',
    status: 'REGENERATE',
    note: 'Carries an "APEX COMFORT SYSTEMS" wordmark and a mountain mark matching NONE of the four logo files, on both van and shirt patches, on the highest-scrutiny page for brand coherence. Regenerate with a plain unmarked white van and unbranded shirts, then composite the real logo-full.svg in post. Do not re-prompt for the logo.',
    width: 2800,
  },
  // D.1.9–D.1.13 — project set, five curated from six delivered
  { src: 'img 10.1.png', out: 'project-attic-air-handler.jpg', slot: 'IMG-10', status: 'APPROVED', width: 2400 },
  {
    src: 'img 10.2.png',
    out: 'project-commercial-rooftop.jpg',
    slot: 'IMG-10',
    status: 'CROPPED',
    note: 'The technician was half-framed walking out of shot at the left edge, which reads as a mistake. Cropped out entirely; the unit alone is a legitimate portfolio shot. The Appendix D object-position assumes this cropped frame.',
    cropLeftPct: 0.2,
    width: 2400,
  },
  { src: 'img 10.3.png', out: 'project-mechanical-room.jpg', slot: 'IMG-10', status: 'APPROVED', width: 2400 },
  { src: 'img 10.4.png', out: 'project-residential-mechanical.jpg', slot: 'IMG-10', status: 'APPROVED', width: 2400 },
  { src: 'img 10.5.png', out: 'project-condenser-pad.jpg', slot: 'IMG-10', status: 'APPROVED', width: 2400 },

  // D.1.14–D.1.18 — city set. Upscaled to >=2880px per D.0.
  {
    src: '11.1 phoenix arizona.png',
    out: 'service-area-phoenix.jpg',
    slot: 'IMG-11',
    status: 'REGENERATE',
    note: 'Depicts North Scottsdale-style luxury desert-contemporary architecture with near-field granite mountains, which is not Phoenix proper’s housing stock (mid-century ranch and 1970s–90s block-and-stucco), and was near-interchangeable with the real Scottsdale image. Use §7’s corrected Phoenix prompt.',
    width: 2880,
  },
  { src: '11.2 Scottsdale.png', out: 'service-area-scottsdale.jpg', slot: 'IMG-11', status: 'APPROVED', width: 2880 },
  { src: 'img 11.3 tempe.png', out: 'service-area-tempe.jpg', slot: 'IMG-11', status: 'APPROVED', width: 2880 },
  { src: 'img 11.4 mesa.png', out: 'service-area-mesa.jpg', slot: 'IMG-11', status: 'APPROVED', width: 2880 },
  {
    // The source filename typo (`chadler`) is CORRECTED in the production
    // filename and must not propagate into the asset path (D.1.18).
    src: 'img 11.5 chadler.png',
    out: 'service-area-chandler.jpg',
    slot: 'IMG-11',
    status: 'REGENERATE',
    note: 'Shows near-field mountains Chandler does not have at that scale; Chandler is flat valley floor. Use §7’s corrected Chandler prompt.',
    width: 2880,
  },
  // D.1.19
  {
    src: '11.6 Greater Phoenix Metropolitan Area.png',
    out: 'service-areas-metro-overview.jpg',
    slot: 'IMG-11 metro',
    status: 'APPROVED',
    width: 2880,
  },
];

/**
 * D.3 — sources that never enter the build.
 *   img 10.png       UNUSED — posed idle stance against a mid-task-only prompt
 *   4.monogram.png   UNUSED — retired from primary brand use (§5.2.1)
 *   download*.png    REFERENCE ONLY — competitor/inspiration screenshots
 *   1./2./3. logos   SUPERSEDED — replaced by the redrawn SVG set
 */
const EXCLUDED = ['img 10.png'];

async function build() {
  console.log('\n  Appendix D — source to production\n');
  const outstanding = [];

  for (const entry of MAP) {
    const from = join(SRC, entry.src);
    if (!existsSync(from)) {
      console.log(`  MISSING  ${entry.src}`);
      continue;
    }

    let pipeline = sharp(from);
    const meta = await pipeline.metadata();

    if (entry.cropLeftPct) {
      const left = Math.round(meta.width * entry.cropLeftPct);
      pipeline = pipeline.extract({
        left,
        top: 0,
        width: meta.width - left,
        height: meta.height,
      });
    }

    const buffer = await pipeline
      .resize({ width: entry.width, withoutEnlargement: false, kernel: 'lanczos3' })
      // JPEG, not PNG: the correct container for photographs (D.0).
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();

    writeFileSync(join(OUT, entry.out), buffer);

    const kb = (buffer.length / 1024).toFixed(0);
    const up = meta.width < entry.width ? ` (upscaled from ${meta.width}px)` : '';
    console.log(
      `  ${entry.status.padEnd(10)} ${entry.out.padEnd(36)} ${entry.width}px ${kb}KB${up}`
    );

    if (entry.status !== 'APPROVED') {
      outstanding.push(entry);
    }
  }

  /* D.2 — og-default.jpg. GAP: no source exists. Produced from brand assets:
     --apex-ink ground, the inverse lockup centred at 40% width, a --apex-copper
     rule beneath. No photography, no §9.4-flagged text. */
  const ogW = 1200;
  const ogH = 630;
  const logoW = Math.round(ogW * 0.4);
  const logo = await sharp(join(root, 'public', 'logo-full-inverse.svg'), { density: 600 })
    .resize({ width: logoW })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const og = await sharp({
    create: { width: ogW, height: ogH, channels: 3, background: INK },
  })
    .composite([
      {
        input: await sharp(logo)
          .composite([{ input: Buffer.from(`<svg><rect width="${logoW}" height="${logoMeta.height}" fill="#FAF8F4"/></svg>`), blend: 'in' }])
          .toBuffer(),
        left: Math.round((ogW - logoW) / 2),
        top: Math.round(ogH / 2 - logoMeta.height / 2 - 24),
      },
      {
        input: Buffer.from(
          `<svg width="120" height="4"><rect width="120" height="4" fill="${COPPER}"/></svg>`
        ),
        left: Math.round((ogW - 120) / 2),
        top: Math.round(ogH / 2 + logoMeta.height / 2 + 8),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  writeFileSync(join(OUT, 'og-default.jpg'), og);
  console.log(
    `  PRODUCED   ${'og-default.jpg'.padEnd(36)} ${ogW}x${ogH} ${(og.length / 1024).toFixed(0)}KB`
  );

  console.log(`\n  Excluded per D.3: ${EXCLUDED.join(', ')}\n`);

  if (outstanding.length) {
    console.log('  OUTSTANDING ART DIRECTION (§7, Appendix D) — built from the');
    console.log('  delivered source so the site is complete, but NOT approved:\n');
    for (const e of outstanding) {
      console.log(`    ${e.status} — ${e.out} (${e.slot})`);
      console.log(`      ${e.note}\n`);
    }
  }
}

await build();
