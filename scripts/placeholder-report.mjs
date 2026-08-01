/**
 * §9.5 step 11 / A.0.5 — the placeholder report.
 *
 * "The build emits a placeholder report enumerating every flagged entry in
 *  use. §9.5 step 11 is satisfied by that report, not by inspection."
 *
 * Run: npm run report:placeholders
 *
 * Reads lib/placeholders.ts directly rather than importing it, so the report
 * needs no build step and cannot drift from the register.
 *
 * Two classes are distinguished, because they carry different risk:
 *   SHIPPING A VALUE — an example value from v1.1 is live on the site right
 *     now. These are the dangerous ones: they look real.
 *   GATED / WITHHELD — no value exists, so the consuming component renders the
 *     Appendix B fallback (em-dash, removal, or non-render). Nothing is
 *     invented, but the content is incomplete until the client supplies it.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'lib', 'placeholders.ts'), 'utf8');

/* Match:  key: flag(<value>, '<note>'),  across newlines. */
const re = /^\s{2}([a-zA-Z]+):\s*flag\(\s*(null|'(?:[^'\\]|\\.)*')\s*,\s*((?:'(?:[^'\\]|\\.)*')|(?:"(?:[^"\\]|\\.)*"))\s*,?\s*\)/gms;

const entries = [];
let match;
while ((match = re.exec(source)) !== null) {
  const [, key, rawValue, rawNote] = match;
  const value = rawValue === 'null' ? null : rawValue.slice(1, -1);
  const note = rawNote.slice(1, -1).replace(/\\'/g, "'").replace(/\s+/g, ' ');
  entries.push({ key, value, note });
}

if (entries.length === 0) {
  console.error('\n  Could not parse lib/placeholders.ts. Report not produced.\n');
  process.exit(1);
}

const shipping = entries.filter((e) => e.value !== null);
const withheld = entries.filter((e) => e.value === null);

const wrap = (text, width, indent) => {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line.trim());
      line = word;
    } else {
      line += ' ' + word;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map((l) => indent + l).join('\n');
};

console.log('\n' + '='.repeat(76));
console.log('  §9.4 PLACEHOLDER REPORT — Apex Comfort Systems');
console.log('  Nothing in this list may ship to production as real data.');
console.log('='.repeat(76));

console.log(
  `\n  ── SHIPPING A VALUE (${shipping.length}) ───────────────────────────────────────\n`
);
console.log('  These render on the live site right now and LOOK REAL.');
console.log('  Each must be verified against reality or replaced before launch.\n');
for (const entry of shipping) {
  console.log(`  ● ${entry.key} = ${JSON.stringify(entry.value)}`);
  console.log(wrap(entry.note, 68, '      '));
  console.log('');
}

console.log(
  `  ── GATED / WITHHELD (${withheld.length}) ──────────────────────────────────────\n`
);
console.log('  No value exists, so the consuming component renders its');
console.log('  Appendix B fallback. Nothing is invented — but the content is');
console.log('  incomplete until the client supplies these.\n');
for (const entry of withheld) {
  console.log(`  ○ ${entry.key}`);
  console.log(wrap(entry.note, 68, '      '));
  console.log('');
}

console.log('='.repeat(76));
console.log(
  `  ${entries.length} flagged entries — ${shipping.length} shipping a value, ${withheld.length} withheld.`
);
console.log('  Counsel reviews the TCPA consent copy and both legal documents');
console.log('  before launch; client approval alone is not sufficient (§9.4).');
console.log('='.repeat(76) + '\n');
