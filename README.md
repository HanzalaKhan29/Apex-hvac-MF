# Apex Comfort Systems

Marketing site for a licensed residential + commercial HVAC contractor in the
Phoenix, AZ metro. Built to **Blueprint v1.1.1 FINAL** — Parts 0–9 plus
Appendices A–J and Z, all normative.

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4

---

## Quick start

```bash
npm install
cp .env.example .env.local   # see "Environment" below
npm run dev
```

The site runs unprefixed at `/` — the `[locale]` segment ships from day one
with `en` as the only configured locale (F.1, §8.4), resolved by rewrite in
`proxy.ts`, so adding Spanish later is a content task rather than a refactor.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | **Contrast gate → build → bundle gate.** Any gate failing stops the build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:a11y` | Appendix I.13 sweep across all 24 routes |
| `npm run check:seo` | Part 8 SEO / GEO / AEO verification |
| `npm run check:copy` | §5.5 / §3.4 copy-length constraints |
| `npm run check:emdash` | Em-dash guard: no AI-tell punctuation in authored copy |
| `npm run check:contrast` | §4.2 verified-contrast table (build-blocking) |
| `npm run check:bundle` | J.4 bundle budgets (build-blocking) |
| `npm run report:placeholders` | **§9.4 register — run before calling anything content-complete** |
| `npm run assets:images` | Appendix D source→production image pipeline |
| `npm run assets:logo` | Appendix E logo SVG set |
| `npm run assets:fonts` | §4.3 Roboto numeral subset |

The `check:*` scripts that need a running server take a base URL:
`npm run check:a11y -- http://localhost:3000`.

> **Run `npm run build`, not just `npm run typecheck`,** before calling form or
> Server Action work done. A `'use server'` module may only export async
> functions — `tsc` does not catch that, only the bundler does (Z.11).

---

## Architecture

```
app/
├── layout.tsx              <html lang>, three fonts, favicon + manifest
├── globals.css             THE Appendix C token manifest (@theme)
├── robots.ts · sitemap.ts  F.5 · F.6
├── not-found.tsx           404 for paths that never reach [locale] — composes chrome
└── [locale]/
    ├── layout.tsx          global chrome, mounted exactly once (A.0.1, B.33)
    ├── not-found.tsx       404 for notFound() inside the segment
    ├── thank-you/          ConfirmationTemplate — outside (indexed), no schema
    └── (indexed)/          emits HVACBusiness + Organization on every route in it
        ├── page.tsx        HomeTemplate
        ├── services/[slug] ServicePageTemplate  ×6
        ├── service-areas/[city]  CityPageTemplate ×5
        └── …               StandardPageTemplate ×8, LegalPageTemplate ×2

components/     Appendix B, one file per component + templates/
lib/            contact · services · cities · placeholders · content · routes
proxy.ts        F.1 locale rewrite + F.3's /en → / redirect
scripts/        the gates above
docs/           appendix-z-additions.md — every derived decision, with reasoning
```

**Read `docs/appendix-z-additions.md` before changing anything structural.** It
records twelve decisions that look arbitrary until you know what was measured —
including why the bundle budget was revised, why the `(indexed)` route group
exists, and why the `/en` redirect lives in the proxy rather than the config.

### Rules the build enforces mechanically

- **Design tokens.** `globals.css` clears each Tailwind namespace before
  redeclaring it, so a colour, radius, shadow or type size absent from
  Appendix C cannot be reached from a utility class.
- **Contrast.** `check-contrast.mjs` recomputes §4.2's table from the token
  values in `globals.css` and fails the build on any regression.
- **Placeholders.** Every §9.4-flagged value is read from `lib/placeholders.ts`.
  Setting one to `null` makes the consuming component do the right thing
  automatically — the stats grid renders an em-dash, a trust badge disappears,
  the manufacturer strip falls back to a text list, the NATE row is removed.
- **Phone number.** `lib/contact.ts` is the only definition; `<PhoneLink />` is
  the only renderer (§9.1's binding rule). That is what makes NAP consistency
  and the DNI pattern a one-place concern.
- **Motion.** Exactly one `IntersectionObserver` exists in the codebase
  (`<StatBlock />`) and one self-removing scroll listener
  (`<MobileStickyBar />`) — §4.11's two permitted scroll triggers, and nothing
  else observes scroll for animation.

---

## Environment

See `.env.example`. Nothing has a working production default by design.

| Variable | Required | Consequence if unset |
|---|---|---|
| `RESEND_API_KEY`, `DISPATCH_INBOX` | **Yes** | Forms return G.2's error with a live phone link instead of converting. Deliberate — a silently swallowed lead is worse than a visible failure |
| `TURNSTILE_SECRET_KEY` | **Yes at launch** | Spam layer 3 is skipped; the other three still apply |
| `NEXT_PUBLIC_GA_ID` | For measurement | No GA4 script loads; the dataLayer still fills, so events stay inspectable |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonicals, OG URLs, sitemap and JSON-LD `@id` values |

---

## Pre-launch checklist

### 1. Content — run `npm run report:placeholders`

**Seven values ship live and look real.** Each traces to a value the blueprint
states verbatim, so none is invented — but none is verified either:

`(602) 555-0100` · `info@apexcomfortsystems.com` · `15+` years ·
`4.9` rating · `800+` reviews · `30 minutes` respond · `two hours` dispatch

Two carry conditional removal rules from §9.4, enforced mechanically — set them
to `null` in `lib/placeholders.ts` and the UI adapts:

- rating under 4.5 → remove the rating from the hero entirely
- review volume under 50 → remove the count, show the rating only

Sixteen further values are withheld and render their Appendix B fallback:
ROC number, NATE certification, financing APR and term, plan tiers, GBP URL,
both legal documents, technician bios, BBB accreditation.

### 2. Legal — counsel, not just the client (§9.4)

- TCPA consent copy in `lib/form-messages.ts` / `<ConsentNotice />`
- `/privacy-policy` and `/terms-of-service` bodies
- Any financing figure — "0% financing available" with no qualifying language
  is a lending-advertising exposure

### 3. Third-party permissions

- **Manufacturer logos** ship as a "Brands We Service" **text list** by default.
  Logos require genuine authorised-dealer status for four or more brands *and*
  each brand's logo-usage terms checked (§5.4, §9.4).
- **Google "G" and star ratings** stay off until reviews are pulled from the
  Business Profile via the Places API. Demo-mode review cards carry an
  in-card "Illustrative" label and emit **no** `Review`/`AggregateRating`
  markup (§5.10, §8.1).

### 4. Art direction — five items, batched

Building from the delivered sources so the site is complete and reviewable, but
**not approved** (§7, Appendix D):

| Asset | Action |
|---|---|
| `ac-repair-manifold-gauge.jpg` (IMG-03) | Regenerate — reads Pacific Northwest, breaks the desert grade |
| `about-team-shop-bay.jpg` (IMG-09) | Regenerate unbranded, then composite the real logo |
| `service-area-phoenix.jpg` | Regenerate — wrong housing stock for Phoenix proper |
| `service-area-chandler.jpg` | Regenerate — mountains Chandler does not have |
| `indoor-air-quality-filtration.jpg` (IMG-08) | Retouch — clone out a third-party logo |

### 5. Manual accessibility (I.13 — cannot be automated)

- **#3** Tab topbar→footer at 375px and 1440px on each of the seven templates;
  no focused element covered by sticky chrome
- **#4** Mega-menu keyboard on a real keyboard (the automation pane dispatches
  `keydown` with an empty `event.key` — Z.8)
- **#5** Screen-reader pass, VoiceOver and NVDA
- Toggle OS reduced-motion and confirm entrance animation and the stat
  count-up are suppressed

### 6. Measurement

- Mark **`generate_lead` and `phone_click` as key events** in GA4. Phone is the
  primary conversion channel (§1.4) and must not be secondary.
- DNI, if used, rewrites displayed numbers only — never structured data or the
  footer NAP (§8.6). Ship without it rather than delaying launch.

### 7. Hosting

- `www` and apex must collapse to **one** host before launch (F.2)
- Lighthouse CI on homepage + one service page + one city page per deploy (J.7)

---

## Known deviations from the blueprint

All twelve are recorded with measurements and reasoning in
`docs/appendix-z-additions.md`. The three that change a stated value:

1. **J.4 bundle budgets revised** to 220KB / 210KB from 110KB / 85KB. The
   Next 16 + React 19 client runtime alone exceeds the original figures before
   any application code; the route-to-route delta is ~6KB. Approved.
2. **Two SEO titles exceed A.0.3's ≤60 target** (73 and 67 chars). Both are
   stated verbatim in A.1 and A.4.2 — the specific value governs the general
   target. Approved, kept verbatim.
3. **Roboto subset is 6.6KB**, not §4.3's 3–5KB estimate. The ★ glyph is
   expensive; still far under the ~15KB full-Latin alternative. Approved.
4. **J.4 bundle budgets revised again**, 220KB/210KB → 225KB/215KB, for
   `app/[locale]/error.tsx`'s unavoidable client-boundary runtime cost. See
   Z.31.
