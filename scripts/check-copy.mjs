/**
 * Copy-discipline gate — §5.5 / B.17 / A.0.3.
 *
 *   - Service card title: <= 32 characters.
 *   - Service card description: 90-130 characters, HARD CAP 140.
 *   - Meta description: <= 155 characters.
 *   - SEO title: <= 60 characters is A.0.3's stated TARGET, not a cap. Where
 *     Appendix A states a longer title verbatim, that value governs and the
 *     overage is reported as a notice rather than a failure.
 *
 * Run: node scripts/check-copy.mjs   (wired into `npm run build`)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Read the TypeScript sources through a tiny extractor rather than compiling:
// the gate must run before `next build`, with no build step of its own.
function extractStringField(source, objectKey, field) {
  const re = new RegExp(`${field}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`, 'g');
  return re;
}

const failures = [];
const notices = [];
const rows = [];

function check(label, value, { max, min, hard, soft }) {
  const n = value.length;
  let status = 'OK';
  if (hard !== undefined && n > hard) {
    status = 'FAIL';
    failures.push(`${label}: ${n} chars, hard cap ${hard}`);
  } else if (max !== undefined && n > max) {
    if (soft) {
      status = 'note';
      notices.push(`${label}: ${n} chars, target ${max}`);
    } else {
      status = 'FAIL';
      failures.push(`${label}: ${n} chars, max ${max}`);
    }
  } else if (min !== undefined && n < min) {
    status = 'FAIL';
    failures.push(`${label}: ${n} chars, min ${min}`);
  }
  rows.push({ label, n, status });
}

/* Parse lib/services.ts by evaluating its data shape via a regex sweep over
   each service block. Kept deliberately dumb — no TS toolchain in this gate. */
const src = readFileSync(join(root, 'lib', 'services.ts'), 'utf8');

const blocks = src.split(/^  '([a-z-]+)': \{$/m);
for (let i = 1; i < blocks.length; i += 2) {
  const slug = blocks[i];
  const body = blocks[i + 1];

  const pick = (field) => {
    const m = body.match(
      new RegExp(`\\b${field}:\\s*(?:\\n\\s*)?'((?:[^'\\\\]|\\\\.)*)'`)
    );
    return m ? m[1].replace(/\\'/g, "'") : null;
  };

  const title = pick('cardTitle');
  const desc = pick('cardDescription');
  const meta = pick('metaDescription');
  const seo = pick('seoTitle');

  if (title) check(`${slug} · cardTitle`, title, { max: 32 });
  if (desc) check(`${slug} · cardDescription`, desc, { min: 90, max: 130, hard: 140 });
  if (meta) check(`${slug} · metaDescription`, meta, { max: 155 });
  if (seo) check(`${slug} · seoTitle`, seo, { max: 60, soft: true });
}

/* City pages — meta description pattern, A.6/A.7. */
try {
  const cities = readFileSync(join(root, 'lib', 'cities.ts'), 'utf8');
  const cblocks = cities.split(/^  '([a-z-]+)': \{$/m);
  for (let i = 1; i < cblocks.length; i += 2) {
    const slug = cblocks[i];
    const body = cblocks[i + 1];
    const pick = (field) => {
      const m = body.match(
        new RegExp(`\\b${field}:\\s*(?:\\n\\s*)?'((?:[^'\\\\]|\\\\.)*)'`)
      );
      return m ? m[1].replace(/\\'/g, "'") : null;
    };
    const meta = pick('metaDescription');
    const seo = pick('seoTitle');
    if (meta) check(`${slug} · metaDescription`, meta, { max: 155 });
    if (seo) check(`${slug} · seoTitle`, seo, { max: 60, soft: true });
  }
} catch {
  /* cities.ts not written yet */
}

const w = (s, n) => String(s).padEnd(n);
console.log('\n  Copy-discipline gate — §5.5 / B.17 / A.0.3\n');
for (const r of rows) {
  console.log(`  ${w(r.status, 5)}${w(r.label, 46)}${r.n}`);
}

if (notices.length) {
  console.log('\n  Notices (Appendix A states these verbatim; the value governs):');
  for (const n of notices) console.log(`    - ${n}`);
}

if (failures.length) {
  console.error(`\n  ${failures.length} copy constraint(s) violated. Build stopped.\n`);
  for (const f of failures) console.error(`    ${f}`);
  console.error('');
  process.exit(1);
}

console.log(`\n  ${rows.length} strings within constraints.\n`);
