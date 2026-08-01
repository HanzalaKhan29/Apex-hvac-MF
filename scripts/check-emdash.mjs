/**
 * Em-dash guard.
 *
 * An em dash in body copy is one of the strongest "written by an AI" tells in
 * English prose, and this site is a portfolio artifact whose whole job is to
 * read as though a person wrote it. All authored copy uses full stops, colons
 * or restructured clauses instead, rewritten so the sentence still reads
 * naturally rather than swapped punctuation-for-punctuation.
 *
 * A small number of uses are ALLOWED, and only these. Every one is a string
 * Blueprint v1.1.1 states VERBATIM:
 *
 *   3.4   CTA label lock, which the blueprint calls exhaustive
 *   5.1   the topbar emergency line
 *   5.3   the hero CTA row
 *   5.7   the two-hour dispatch copy, whose 4pm qualifier is load-bearing
 *   5.10  the illustrative-review label
 *   2.2   the positioning statement
 *   9.3a  the form-failure message
 *   9.3b  the thank-you time commitment
 *   A.9 / A.10   two meta descriptions
 *   B.1   the logo link's accessible name
 *
 * plus B.18's mandated em-dash fallback in the stat numeral slot, which is a
 * UI token rather than prose.
 *
 * Rewriting any of those would silently override copy the blueprint fixes, so
 * they are allowlisted and the guard fails on anything new.
 *
 * Run: node scripts/check-emdash.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const EM = '—';

/* Matched on a distinctive fragment of the full source line, so incidental
   reformatting does not silently break the allowlist. */
const ALLOWED = [
  `24/7 Emergency Service ${EM} Phoenix Metro`,
  `${EM} we're open now`,
  'export const EM_DASH',
  `'Call Now ${EM} 24/7'`,
  `Illustrative ${EM} replaced with real Google`,
  `aria-label="Apex Comfort Systems ${EM} home"`,
  `Call Now ${EM} {PHONE_DISPLAY}`,
  `every job ${EM} because in a market`,
  `within two hours ${EM} same-day service`,
  `Phoenix metro ${EM} installs, rooftop units`,
  `Apex Comfort Systems ${EM} AC repair, replacement`,
  `call first thing ${EM} unless you marked this`,
];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(p)) files.push(p);
  }
};
['lib', 'components', 'app'].forEach(walk);

/** Blank out comments so only code and strings are examined. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) =>
      p1 + ' '.repeat(Math.max(0, m.length - p1.length))
    );
}

const hits = [];
for (const file of files) {
  stripComments(readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      if (line.includes(EM)) hits.push({ file, line: i + 1, text: line.trim() });
    });
}

const isAllowed = (text) => ALLOWED.some((frag) => text.includes(frag));
const violations = hits.filter((h) => !isAllowed(h.text));

console.log('\n  Em-dash guard\n');
console.log(`  total in non-comment source : ${hits.length}`);
console.log(`  blueprint-verbatim (allowed): ${hits.length - violations.length}`);
console.log(`  violations                  : ${violations.length}\n`);

if (violations.length) {
  console.error('  Em dashes found in authored copy. Rewrite with a full stop, a');
  console.error('  colon, or a restructured clause rather than swapping the');
  console.error('  punctuation, so the sentence still reads naturally.\n');
  for (const v of violations) {
    console.error(`    ${v.file}:${v.line}`);
    console.error(`      ${v.text.slice(0, 140)}`);
  }
  console.error('');
  process.exit(1);
}

console.log('  No em dashes in authored copy.\n');
