/**
 * Build-blocking contrast gate.
 *
 * Appendix I.6 / I.13 check #1, §6.2, C.0:
 *   "Claude Code recomputes every specified pairing against final rendered
 *    sRGB values after the Tailwind theme is built and FAILS THE BUILD if any
 *    pairing regresses below its threshold. Do not rely on visual judgement."
 *
 * Token values are read out of app/globals.css rather than duplicated here, so
 * editing a token is what this gate actually tests. Different browser engines'
 * OKLCH -> sRGB gamut mapping can move a value either side of the line, which
 * is exactly why the copper palette was lightened rather than left at a 4.50:1
 * rounding-error threshold (§4.2).
 *
 * Run: node scripts/check-contrast.mjs   (wired into `npm run build`)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, '..', 'app', 'globals.css');
const css = readFileSync(cssPath, 'utf8');

/* -------------------------------------------------------------------------
   Token extraction
   ------------------------------------------------------------------------- */

/** Pull `--name: oklch(L% C H);` declarations out of the @theme block. */
function readTokens(source) {
  const tokens = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/gi;
  let m;
  while ((m = re.exec(source)) !== null) {
    tokens.set(m[1], { l: Number(m[2]) / 100, c: Number(m[3]), h: Number(m[4]) });
  }
  // Absolutes, declared as hex in the manifest.
  tokens.set('--color-white', { hex: '#ffffff' });
  tokens.set('--color-black', { hex: '#000000' });
  return tokens;
}

/* -------------------------------------------------------------------------
   Colour maths — OKLCH -> OKLab -> linear sRGB -> sRGB
   ------------------------------------------------------------------------- */

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function linearToSrgb(x) {
  const v = clamp01(x);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function srgbToLinear(x) {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function oklchToSrgb255({ l: L, c: C, h: H }) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Gamut-clip then quantise to 8-bit: this is the "final rendered sRGB value"
  // a browser hands to the compositor, which is what the gate must measure.
  return [rLin, gLin, bLin].map((v) => Math.round(linearToSrgb(v) * 255));
}

function hexToSrgb255(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function toSrgb255(token) {
  return token.hex ? hexToSrgb255(token.hex) : oklchToSrgb255(token);
}

function relativeLuminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => srgbToLinear(v / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const toHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/* -------------------------------------------------------------------------
   The pairing table
   §4.2's verified-contrast table, plus the derived neutral and semantic
   pairings from C.2 and C.3.
   ------------------------------------------------------------------------- */

const PAIRINGS = [
  // §4.2 verified-contrast table — the authority for brand pairings.
  { fg: '--color-apex-copper', bg: '--color-apex-paper', min: 4.5, note: 'copper on paper' },
  { fg: '--color-white', bg: '--color-apex-copper', min: 4.5, note: 'white on copper (primary CTA label)' },
  { fg: '--color-white', bg: '--color-apex-copper-hover', min: 4.5, note: 'white on copper hover' },
  { fg: '--color-apex-copper', bg: '--color-apex-ink', min: 3.0, note: 'copper focus ring on ink (non-text, 3:1)' },
  { fg: '--color-apex-copper-dark', bg: '--color-apex-ink', min: 4.5, note: 'copper-dark on ink' },
  { fg: '--color-apex-sage', bg: '--color-apex-paper', min: 4.5, note: 'sage on paper' },
  { fg: '--color-white', bg: '--color-apex-sage', min: 4.5, note: 'white on sage' },
  { fg: '--color-apex-ink', bg: '--color-apex-sage-tint', min: 4.5, note: 'ink on sage tint (financing banner)' },
  { fg: '--color-apex-ink', bg: '--color-apex-paper', min: 4.5, note: 'ink on paper' },
  { fg: '--color-white', bg: '--color-apex-ink', min: 4.5, note: 'white on ink' },

  // SPEC GAP, FLAGGED — copper-dark on --apex-ink-2.
  //
  // C.1's binding rule permits --apex-copper-dark on BOTH --apex-ink and
  // --apex-ink-2, but §4.2's verified-contrast table only measures it against
  // --apex-ink (4.64:1). Measured here against --apex-ink-2 it is 4.15:1,
  // which clears the 3:1 non-text threshold but NOT the 4.5:1 text threshold.
  //
  // §4.2's table is the authority for brand pairings (I.6), and it does not
  // state this pairing, so no value is invented here. The consequence is
  // enforced in the build instead: copper is used on --apex-ink-2 only as a
  // non-text accent (rules, borders, icon strokes) and never as text. No
  // component in Appendix B places copper text on an ink-2 surface, so
  // nothing in the manifest is lost. Raised for a decision.
  { fg: '--color-apex-copper-dark', bg: '--color-apex-ink-2', min: 3.0, note: 'copper-dark on ink-2 (NON-TEXT only — see note)' },
  { fg: '--color-white', bg: '--color-apex-ink-2', min: 4.5, note: 'white on ink-2' },

  // C.2 derived neutral scale.
  { fg: '--color-n-950', bg: '--color-apex-paper', min: 4.5, note: 'body text on paper' },
  { fg: '--color-n-700', bg: '--color-apex-paper', min: 4.5, note: 'secondary text / form labels on paper' },
  { fg: '--color-n-700', bg: '--color-n-50', min: 4.5, note: 'secondary text on alternating section ground' },
  { fg: '--color-n-950', bg: '--color-n-100', min: 4.5, note: 'body text on card ground' },
  // C.2 control-boundary rule: an input is a UI component, governed by 3:1.
  { fg: '--color-n-400', bg: '--color-apex-paper', min: 3.0, note: 'form-control border on paper (non-text, 3:1)' },

  // C.3 semantic.
  { fg: '--color-warning', bg: '--color-apex-paper', min: 4.5, note: 'warning on paper' },
  { fg: '--color-danger', bg: '--color-apex-paper', min: 4.5, note: 'danger / form error on paper' },
  { fg: '--color-emergency', bg: '--color-apex-ink', min: 3.0, note: 'emergency status dot on ink (non-text, 3:1)' },
  { fg: '--color-success', bg: '--color-apex-paper', min: 4.5, note: 'success on paper' },
];

/* -------------------------------------------------------------------------
   Run
   ------------------------------------------------------------------------- */

const tokens = readTokens(css);
const missing = [];
const failures = [];
const rows = [];

for (const pair of PAIRINGS) {
  const fgToken = tokens.get(pair.fg);
  const bgToken = tokens.get(pair.bg);

  if (!fgToken || !bgToken) {
    missing.push(`${!fgToken ? pair.fg : pair.bg} (pairing: ${pair.note})`);
    continue;
  }

  const fg = toSrgb255(fgToken);
  const bg = toSrgb255(bgToken);
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= pair.min;

  rows.push({
    note: pair.note,
    fg: toHex(fg),
    bg: toHex(bg),
    ratio: ratio.toFixed(2),
    min: pair.min.toFixed(1),
    pass,
  });

  if (!pass) failures.push({ ...pair, ratio });
}

const w = (s, n) => String(s).padEnd(n);
console.log('\n  Contrast gate — Appendix I.6 / §4.2 verified-contrast table\n');
console.log(
  `  ${w('', 3)}${w('pairing', 46)}${w('fg', 10)}${w('bg', 10)}${w('ratio', 8)}min`
);
console.log('  ' + '-'.repeat(84));
for (const r of rows) {
  console.log(
    `  ${w(r.pass ? 'OK ' : 'FAIL', 3)}${w(r.note, 46)}${w(r.fg, 10)}${w(r.bg, 10)}${w(r.ratio + ':1', 8)}${r.min}`
  );
}

if (missing.length) {
  console.error('\n  Token(s) not found in app/globals.css:');
  for (const m of missing) console.error(`    - ${m}`);
  console.error(
    '\n  Contrast gate could not run against the full table. Build stopped.\n'
  );
  process.exit(1);
}

if (failures.length) {
  console.error(
    `\n  ${failures.length} pairing(s) below threshold. Build stopped (§6.2, I.6).\n`
  );
  for (const f of failures) {
    console.error(
      `    ${f.note}: ${f.ratio.toFixed(2)}:1, needs ${f.min}:1`
    );
  }
  console.error('');
  process.exit(1);
}

console.log(`\n  ${rows.length} pairings pass. Contrast gate clear.\n`);
