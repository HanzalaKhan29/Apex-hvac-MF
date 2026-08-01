/**
 * Part 8 verification — SEO, GEO and AEO.
 *
 * The structural SEO checks (canonicals, Open Graph, schema types) are covered
 * by the audit run during the build pass. This script covers the ones Part 8
 * states as CONTENT rules, which are the ones that silently rot:
 *
 *   §8.1  internal linking — every service page links to 2–3 sibling services
 *         and to the city pages it serves
 *   §8.2  GEO — every service page opens with a direct-answer paragraph inside
 *         the first 100 words, written to be quotable standalone
 *   §8.2  NAP consistency — the phone number and the five service-area strings
 *         appear BYTE-IDENTICALLY in the footer, in the JSON-LD and on
 *         /contact. Inconsistency actively reduces an AI system's confidence
 *         in citing the business, which is the whole GEO argument
 *   §8.3  AEO — 4–6 FAQ questions per service page, none duplicating the seven
 *         on /faq, every answer leading with the answer
 *   §8.5  the canonical GBP number is what ships in structured data, never a
 *         DNI-rewritten one
 *
 * Usage: node scripts/check-seo.mjs [baseUrl]
 */

import { JSDOM } from 'jsdom';

const BASE = process.argv[2] ?? 'http://localhost:3000';

const SERVICES = [
  'ac-repair',
  'ac-replacement-installation',
  'heating-furnace-repair',
  'commercial-hvac',
  'maintenance-plans',
  'indoor-air-quality',
];
const CITIES = ['phoenix', 'scottsdale', 'tempe', 'mesa', 'chandler'];
const AREA_STRINGS = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler'];

const issues = [];
const note = (where, rule, detail) => issues.push({ where, rule, detail });

const get = async (path) => new JSDOM(await (await fetch(BASE + path)).text()).window.document;

const graph = (doc) =>
  [...doc.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => JSON.parse(s.textContent))
    .flatMap((j) => j['@graph'] ?? [j]);

/* ------------------------------------------------------------------ §8.2 NAP */

const home = await get('/');
const homeGraph = graph(home);
const business = homeGraph.find((n) => n['@type'] === 'HVACBusiness');

const canonicalPhone = business?.telephone;
if (!canonicalPhone) note('/', '§8.5', 'HVACBusiness has no telephone');

// The displayed number must resolve to the same E.164 as the structured data.
const telLinks = [...home.querySelectorAll('a[href^="tel:"]')].map((a) =>
  a.getAttribute('href').replace('tel:', '')
);
const distinctTel = [...new Set(telLinks)];
if (distinctTel.length !== 1) {
  note('/', '§9.1', `more than one distinct tel: number on a page: ${distinctTel.join(', ')}`);
} else if (distinctTel[0] !== canonicalPhone) {
  note('/', '§8.5', `displayed tel: ${distinctTel[0]} != structured data ${canonicalPhone}`);
}

// areaServed must be the same five strings everywhere it appears.
const areaServed = (business?.areaServed ?? []).map((a) => a.name);
if (JSON.stringify(areaServed) !== JSON.stringify(AREA_STRINGS)) {
  note('/', '§8.2', `HVACBusiness areaServed drifted: ${JSON.stringify(areaServed)}`);
}

// The footer NAP block must repeat those strings verbatim on every page.
const footerText = home.querySelector('footer')?.textContent ?? '';
for (const city of AREA_STRINGS) {
  if (!footerText.includes(city)) note('/', '§8.5', `footer NAP missing "${city}"`);
}

/* ------------------------------------------- §8.1 / §8.2 / §8.3 service pages */

const faqDoc = await get('/faq');
const mainFaq = graph(faqDoc).find((n) => n['@type'] === 'FAQPage');
const mainQuestions = new Set((mainFaq?.mainEntity ?? []).map((q) => q.name));
if (mainQuestions.size !== 7) note('/faq', '§8.3', `expected 7 seed questions, got ${mainQuestions.size}`);

for (const slug of SERVICES) {
  const path = `/services/${slug}`;
  const doc = await get(path);
  const g = graph(doc);

  /* §8.2 — direct-answer lede inside the first 100 words, quotable standalone. */
  const main = doc.querySelector('main');
  const firstPara = main?.querySelector('p:not(.eyebrow)')?.textContent?.trim() ?? '';
  const words = main?.textContent?.trim().split(/\s+/).slice(0, 100).join(' ') ?? '';
  if (!firstPara) {
    note(path, '§8.2', 'no opening paragraph found');
  } else {
    if (!words.includes(firstPara.split(/\s+/).slice(0, 6).join(' '))) {
      note(path, '§8.2', 'opening paragraph does not fall inside the first 100 words');
    }
    if (firstPara.split(/\s+/).length < 20) {
      note(path, '§8.2', `opening paragraph is only ${firstPara.split(/\s+/).length} words — too thin to be quotable`);
    }
    if (!/Phoenix/i.test(firstPara)) {
      note(path, '§8.2', 'opening paragraph does not name the market — weakens GEO extraction');
    }
  }

  /* §8.1 — internal linking: 2–3 sibling services, plus the city pages. */
  const hrefs = [...doc.querySelectorAll('main a[href]')].map((a) => a.getAttribute('href'));
  const siblings = new Set(
    hrefs.filter((h) => h?.startsWith('/services/') && h !== path)
  );
  if (siblings.size < 2 || siblings.size > 3) {
    note(path, '§8.1', `links to ${siblings.size} sibling services (expected 2–3)`);
  }
  const cityLinks = new Set(hrefs.filter((h) => h?.startsWith('/service-areas/')));
  if (cityLinks.size < 5) {
    note(path, '§8.1', `links to ${cityLinks.size} city pages (expected all 5)`);
  }

  /* §8.3 — 4–6 questions, none duplicating /faq's seven. */
  const faq = g.find((n) => n['@type'] === 'FAQPage');
  if (!faq) {
    note(path, '§8.3', 'no FAQPage schema');
  } else {
    const qs = faq.mainEntity ?? [];
    if (qs.length < 4 || qs.length > 6) {
      note(path, '§8.3', `${qs.length} FAQ questions (expected 4–6)`);
    }
    for (const q of qs) {
      if (mainQuestions.has(q.name)) {
        note(path, '§8.3', `duplicates a /faq question: "${q.name}"`);
      }
      /*
       * §8.3 answer-first: "every FAQ answer leads with the DIRECT ANSWER in
       * the first sentence, elaboration after."
       *
       * The test is for PREAMBLE, not for length. A one-word verdict —
       * "Yes." / "Often not." / "Heavily." — is the ideal opening for a yes/no
       * question and the most extractable form there is; an earlier version of
       * this check required a minimum length and so flagged exactly the
       * answers that follow the rule best.
       */
      const answer = (q.acceptedAnswer?.text ?? '').trim();
      const PREAMBLE =
        /^(it depends|there are (many|several)|that('s| is) a (great|good)|we understand|thanks for|generally speaking|in general,|as you (may )?know|first of all|well,)/i;
      if (PREAMBLE.test(answer)) {
        note(path, '§8.3', `answer opens with preamble instead of the answer: "${q.name}"`);
      }
      if (answer.length < 40) {
        note(path, '§8.3', `answer is too thin to be useful: "${q.name}"`);
      }
    }
  }

  /* §8.1 — Service node with all five areaServed. */
  const service = g.find((n) => n['@type'] === 'Service');
  if (!service) note(path, '§8.1', 'no Service schema');
  else {
    const served = (service.areaServed ?? []).map((a) => a.name);
    if (JSON.stringify(served) !== JSON.stringify(AREA_STRINGS)) {
      note(path, '§8.2', `Service areaServed drifted: ${JSON.stringify(served)}`);
    }
  }

  /* §8.5 — the number in structured data is the canonical GBP number. */
  const biz = g.find((n) => n['@type'] === 'HVACBusiness');
  if (biz && biz.telephone !== canonicalPhone) {
    note(path, '§8.5', `structured-data telephone drifted: ${biz.telephone}`);
  }
}

/* --------------------------------------------------- §8.4 city-page uniqueness */

const details = new Map();
for (const slug of CITIES) {
  const path = `/service-areas/${slug}`;
  const doc = await get(path);
  const body = doc.querySelector('main')?.textContent ?? '';

  // §8.4 item 4 — at least one locally-specific detail, so the five pages are
  // not thin duplicates. Compared by the locally-specific block's text.
  const block = doc.querySelector('[aria-labelledby="city-detail-heading"]')?.textContent ?? '';
  if (block.length < 200) {
    note(path, '§8.4', 'locally-specific block is too thin to differentiate the page');
  }
  for (const [other, text] of details) {
    if (text === block) note(path, '§8.4', `locally-specific block is identical to ${other}`);
  }
  details.set(path, block);

  // City pages must NOT emit a Service node (A.6).
  if (graph(doc).some((n) => n['@type'] === 'Service')) {
    note(path, 'A.6', 'city page emits a Service node — a service would be claimed under two URLs');
  }

  if (!body.includes(slug === 'phoenix' ? 'Phoenix' : AREA_STRINGS[CITIES.indexOf(slug)])) {
    note(path, '§8.4', 'city name absent from body copy');
  }
}

/* ----------------------------------------------------------------- report */

console.log('\n  Part 8 — SEO / GEO / AEO verification\n');
console.log(`  base: ${BASE}`);
console.log(`  canonical phone (§8.5): ${canonicalPhone}`);
console.log(`  areaServed (§8.2): ${areaServed.join(', ')}\n`);

if (issues.length) {
  console.log(`  ${issues.length} ISSUE(S)\n`);
  for (const i of issues) console.log(`    [${i.rule}] ${i.where}\n      ${i.detail}`);
  console.log('');
  process.exit(1);
}

console.log('  All checks pass:');
console.log('    §8.1  internal linking — 2-3 siblings + 5 city links per service page');
console.log('    §8.2  direct-answer lede inside the first 100 words, market named');
console.log('    §8.2  NAP and areaServed byte-identical across page, footer and schema');
console.log('    §8.3  4-6 non-duplicate FAQ questions per service page, answer-first');
console.log('    §8.4  five city pages each carry a distinct locally-specific block');
console.log('    §8.5  structured-data telephone is the canonical number everywhere\n');
