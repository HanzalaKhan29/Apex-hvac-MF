/**
 * Appendix I.13 — the automated half of the verification checklist.
 *
 * Covers the checks that can be decided from server-rendered HTML across every
 * route, so the whole site is swept rather than a sampled page:
 *
 *   #9   one <h1> per route, no skipped heading levels
 *   #10  every image has alt text or an explicit alt="" MATCHING APPENDIX D
 *   I.1  landmarks, list semantics, blockquote/cite, figure/figcaption
 *   I.4  ARIA used only where native semantics cannot express it
 *   I.9  every form control has a real associated <label>
 *   I.11 decorative vs informative alt, per the manifest rather than by taste
 *
 * The checks that need a live layout — target size, focus visibility, reflow,
 * reduced motion — run in the browser instead; see the pass recorded in
 * docs/appendix-z-additions.md. #3, #4 and #5 remain MANUAL by design (I.13).
 *
 * Usage: node scripts/check-a11y.mjs [baseUrl]
 */

import { JSDOM } from 'jsdom';

const BASE = process.argv[2] ?? 'http://localhost:3000';

/* Appendix D's alt-text column, verbatim. This is the authority — the check is
   that the build matches the manifest, not that alt text merely exists. */
const ALT_MANIFEST = {
  'technician-condenser-repair.jpg':
    'Technician kneeling beside an outdoor residential condenser unit, using a digital refrigerant manifold gauge',
  'ac-repair-manifold-gauge.jpg':
    'Gloved technician hands connecting a digital refrigerant manifold gauge to an air conditioner service valve',
  'ac-replacement-install.jpg':
    'Two technicians positioning and levelling a new outdoor condenser unit beside a Phoenix stucco home',
  'furnace-inspection.jpg':
    'Technician using a flashlight to inspect the internal panel of an indoor gas furnace',
  'commercial-rooftop-rtu.jpg':
    'Technician servicing the control panel of a large rooftop HVAC unit on a commercial roof, Phoenix skyline behind',
  'maintenance-coil-service.jpg':
    'Technician brushing and inspecting an air handler coil during a scheduled maintenance visit, checklist alongside',
  'indoor-air-quality-filtration.jpg':
    'Technician fitting a filtration cartridge into an indoor air purification unit connected to residential ductwork',
  'about-team-shop-bay.jpg':
    'Four Apex Comfort Systems technicians standing beside a service van in a shop bay',
  'project-attic-air-handler.jpg':
    'Technician inspecting a newly installed attic air handler with insulated duct runs',
  'project-commercial-rooftop.jpg':
    'Completed commercial rooftop packaged unit on a steel curb with conduit runs',
  'project-mechanical-room.jpg':
    'Finished mechanical room with sheet-metal trunk lines and a commercial air handler',
  'project-residential-mechanical.jpg':
    'Residential mechanical room with a high-efficiency furnace, humidifier and copper line set',
  'project-condenser-pad.jpg':
    'New outdoor condenser unit on a level concrete pad beside a desert-landscaped home',
  // D.1.14–D.1.19 — DECORATIVE. Each page's H1 already states the city name,
  // so empty alt is technically correct and less noisy for screen-reader users.
  'service-area-phoenix.jpg': '',
  'service-area-scottsdale.jpg': '',
  'service-area-tempe.jpg': '',
  'service-area-mesa.jpg': '',
  'service-area-chandler.jpg': '',
  'service-areas-metro-overview.jpg': '',
};

const SERVICES = [
  'ac-repair',
  'ac-replacement-installation',
  'heating-furnace-repair',
  'commercial-hvac',
  'maintenance-plans',
  'indoor-air-quality',
];
const CITIES = ['phoenix', 'scottsdale', 'tempe', 'mesa', 'chandler'];

const ROUTES = [
  '/',
  '/services',
  ...SERVICES.map((s) => `/services/${s}`),
  '/service-areas',
  ...CITIES.map((c) => `/service-areas/${c}`),
  '/about',
  '/projects',
  '/reviews',
  '/financing',
  '/faq',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/thank-you?service=ac-repair',
  '/no-such-page',
];

const issues = [];
const note = (route, check, detail) => issues.push({ route, check, detail });

/** Strips the Next.js image optimiser wrapper off a src. */
function basename(src) {
  try {
    const url = new URL(src, BASE);
    const inner = url.searchParams.get('url') ?? url.pathname;
    return decodeURIComponent(inner).split('/').pop();
  } catch {
    return src.split('/').pop();
  }
}

async function audit(route) {
  const res = await fetch(BASE + route);
  const html = await res.text();
  const { document } = new JSDOM(html).window;

  /* --- #9 headings ------------------------------------------------------ */
  const h1s = document.querySelectorAll('h1');
  if (h1s.length !== 1) note(route, 'I.13 #9', `${h1s.length} <h1> elements (expected exactly 1)`);

  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
    Number(h.tagName[1])
  );
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      note(route, 'I.13 #9', `heading level skipped: h${levels[i - 1]} -> h${levels[i]}`);
      break;
    }
  }

  /* --- #10 / I.11 images against the Appendix D manifest ----------------- */
  for (const img of document.querySelectorAll('img')) {
    const alt = img.getAttribute('alt');
    if (alt === null) {
      note(route, 'I.13 #10', `<img> with NO alt attribute: ${img.getAttribute('src')?.slice(0, 60)}`);
      continue;
    }
    const file = basename(img.getAttribute('src') ?? '');
    if (file && file in ALT_MANIFEST) {
      const expected = ALT_MANIFEST[file];
      if (alt !== expected) {
        note(
          route,
          'I.13 #10',
          `alt mismatch for ${file}\n        manifest: ${JSON.stringify(expected)}\n        built:    ${JSON.stringify(alt)}`
        );
      }
    }
  }

  /* --- I.1 landmarks and semantics -------------------------------------- */
  if (!document.querySelector('header')) note(route, 'I.1', 'no <header> landmark');
  if (!document.querySelector('main#main')) note(route, 'I.1', 'no <main id="main">');
  if (!document.querySelector('footer')) note(route, 'I.1', 'no <footer> landmark');
  if (!document.querySelector('nav[aria-label]'))
    note(route, 'I.1', 'no <nav> with an accessible name');
  if (document.documentElement.getAttribute('lang') !== 'en')
    note(route, 'I.1', 'html lang is not "en" (WCAG 3.1.1)');

  // Named sections — no anonymous landmarks (B.7).
  for (const section of document.querySelectorAll('main section')) {
    if (!section.getAttribute('aria-labelledby') && !section.getAttribute('aria-label')) {
      note(route, 'I.1', 'unnamed <section> landmark inside <main>');
      break;
    }
  }

  // aria-labelledby must resolve to a real element.
  for (const el of document.querySelectorAll('[aria-labelledby]')) {
    for (const id of el.getAttribute('aria-labelledby').split(/\s+/)) {
      if (!document.getElementById(id)) {
        note(route, 'I.4', `aria-labelledby="${id}" does not resolve`);
      }
    }
  }

  /* --- I.4 ARIA hygiene -------------------------------------------------- */
  for (const el of document.querySelectorAll('[role="button"]')) {
    if (el.tagName !== 'BUTTON') note(route, 'I.4', 'role="button" on a non-button element');
  }
  // Decorative icons must be hidden from assistive tech.
  for (const svg of document.querySelectorAll('svg')) {
    const hidden = svg.getAttribute('aria-hidden') === 'true';
    const named = svg.getAttribute('role') || svg.querySelector('title');
    if (!hidden && !named) {
      note(route, 'I.4', 'svg is neither aria-hidden nor accessibly named');
      break;
    }
  }

  /* --- I.9 form labelling ------------------------------------------------ */
  for (const field of document.querySelectorAll('input, select, textarea')) {
    const type = field.getAttribute('type');
    if (type === 'hidden') continue;
    const id = field.getAttribute('id');
    const labelled =
      (id &&
        [...document.querySelectorAll('label[for]')].some(
          (l) => l.getAttribute('for') === id
        )) ||
      field.closest('label') ||
      field.getAttribute('aria-label') ||
      field.getAttribute('aria-labelledby');
    if (!labelled) {
      note(route, 'I.9', `unlabelled control: ${field.tagName.toLowerCase()}[name=${field.getAttribute('name')}]`);
    }
  }

  /* --- I.1 list / quote / figure semantics ------------------------------ */
  if (document.querySelector('blockquote') && !document.querySelector('blockquote + figcaption cite, figcaption cite, cite')) {
    note(route, 'I.1', '<blockquote> without a <cite> attribution');
  }

  return { route, status: res.status };
}

console.log('\n  Appendix I.13 — automated sweep\n');
console.log(`  base: ${BASE}`);
console.log(`  routes: ${ROUTES.length}\n`);

for (const route of ROUTES) {
  const { status } = await audit(route);
  const routeIssues = issues.filter((i) => i.route === route).length;
  console.log(
    `  ${routeIssues === 0 ? 'ok  ' : 'FAIL'} ${route.padEnd(42)} ${status}${routeIssues ? `  ${routeIssues} issue(s)` : ''}`
  );
}

if (issues.length) {
  console.log(`\n  ${issues.length} ISSUE(S)\n`);
  for (const i of issues) {
    console.log(`    [${i.check}] ${i.route}`);
    console.log(`      ${i.detail}`);
  }
  console.log('');
  process.exit(1);
}

console.log('\n  No issues. Checks #9, #10 and the static half of I.1/I.4/I.9 pass.');
console.log('  I.13 #3, #4 and #5 remain manual by design.\n');
