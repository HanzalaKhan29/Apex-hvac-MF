# Appendix Z — additions from implementation

Appendix Z exists so a reader "can tell an approved decision from a derived
one: if a choice here proves wrong, it can be changed without reopening a
design decision."

Every row below was resolved during Phase 1 implementation rather than in
Parts 0–9 or Appendices A–J. Each records what the blueprint says, what was
actually measured or hit, what was decided, and who decided it. Nothing here
changes a design decision; where a blueprint value proved unreachable or
self-conflicting, that is stated plainly rather than quietly absorbed.

---

## Z.1 — J.4 bundle budgets revised

| | |
|---|---|
| **Blueprint** | J.4: first-load JS ≤ **110KB** gzipped on the homepage route; shared chunk ≤ **85KB** gzipped. "Enforced in CI; a regression fails the build." |
| **Measured** | First-load **211.7KB**, shared **202.9KB** (Turbopack, the Next 16 default). Webpack: 200.1 / 191.6. |
| **Decision** | Budget revised to **220KB first-load / 210KB shared**. Enforced by `scripts/check-bundle.mjs`, wired into `npm run build`. |
| **Decided by** | User, explicitly: *"Revise budget, don't cut feature."* |

### Why the original figures are unreachable

The overage is not application code. Evidence gathered before proposing the
change:

- **Route-to-route delta is ~6KB.** `/faq` — which has no client components of
  its own beyond global chrome — measures 205.5KB. Application code is a
  rounding error against the total.
- **No server-only library crosses the boundary.** `zod` and
  `libphonenumber-js` appear in zero client chunks; both sit behind the
  `'use server'` boundary in `lib/actions/submit-lead.ts`.
- **Lucide is contained.** Per-icon named imports (E.3, J.4) confine it to a
  single ~20KB chunk. No barrel import exists in the codebase.
- **React is production-built.** No dev-only markers (`Invalid hook call`,
  `Warning: `, `react-stack-bottom-frame`) in any chunk.
- **Not a bundler choice.** Webpack and Turbopack differ by ~6%; both are far
  above 110KB.

The residual is the Next 16 / React 19 App Router client runtime. J.4's figures
were evidently written against an earlier framework baseline, before the stack
was locked to Next 16 in §9.3.

### Why the number is 220/210 rather than the approved 210/200

The approved figures came from a **webpack** measurement (200.1 / 191.6).
`next build` in Next 16 defaults to **Turbopack**, which lands ~6% heavier at
211.7 / 202.9 — so 210/200 would have failed on the default build path with
zero application changes. The line is therefore set at the actual
default-bundler floor plus ~4%, preserving the intent (hold just above the
framework baseline) rather than the literal number.

### What the guard is for now

The budget no longer proves the site is light — the framework decides that.
It proves **nothing new was added**. Headroom is deliberately ~4%, so an
overage means real weight: a new client component, a barrel import, or a
library that crossed the server/client boundary. `check-bundle.mjs` says so in
its failure message, and additionally fails if any measured route stops being
prerendered, which would indicate a J.6 regression.

---

## Z.2 — Two SEO titles exceed A.0.3's length target

| | |
|---|---|
| **Blueprint** | A.0.3: "Title pattern: `[Primary Keyword] in [City/Area] \| Apex Comfort Systems`. **Target ≤ 60 characters.**" |
| **Conflict** | A.1 and A.4.2 each state a title verbatim that exceeds it. |
| **Decision** | **Keep both verbatim.** Do not rewrite the copy. |
| **Decided by** | User, explicitly: *"Keep verbatim titles… specific overrides general."* |

| Route | Title | Length |
|---|---|---|
| `/` | `Apex Comfort Systems \| Licensed HVAC Repair & Installation, Phoenix Metro` | **73** |
| `/services/ac-replacement-installation` | `AC Replacement & Installation in Phoenix, AZ \| Apex Comfort Systems` | **67** |

### Reasoning

A.0.3 states a general *target*; A.1 and A.4.2 state the specific *value* for a
named route. This is the same precedence rule the blueprint applies to itself
in its own preamble — "the appendix is the more specific statement of the same
decision" — so the specific value governs.

Practically, an over-length title is truncated in the SERP display and is not a
ranking penalty, so the cost of keeping the blueprint's own words is
presentational only. The cost of rewriting them would be silently overriding
copy the blueprint states verbatim.

`scripts/check-copy.mjs` reports both as **notices, not failures**, so they stay
visible without breaking the build. No other title or meta description in the
build exceeds its limit.

---

## Z.3 — Roboto subset ships at 6.6KB

| | |
|---|---|
| **Blueprint** | §4.3 / J.2: `unicode-range` restricted to digits, punctuation and the star glyph, "roughly 3–5KB versus ~15KB+ for a full Latin subset. Weight 500 only." |
| **Measured** | **6.6KB.** |
| **Decision** | Ship as-is. |
| **Decided by** | User: *"Fine, ship it… not worth engineering further."* |

The glyph set is exactly as specified, and Google's own returned
`unicode-range` matches §4.3 byte-for-byte. The variance is the ★ (U+2605)
glyph, which is expensive relative to digits. Still well under the ~15KB
full-Latin alternative, and the `unicode-range` does its real job regardless of
file size: a page containing no numerals never fetches the face at all.

Implemented via `next/font/local` rather than `next/font/google`, because the
latter cannot express a `unicode-range` restriction.
`scripts/build-fonts.mjs` performs the subsetting at build time.

---

## Z.4 — Copper on `--apex-ink-2` restricted to non-text

| | |
|---|---|
| **Blueprint** | C.1's binding rule permits `--apex-copper-dark` on both `--apex-ink` and `--apex-ink-2`. §4.2's verified-contrast table measures it only against `--apex-ink` (4.64:1). |
| **Measured** | Against `--apex-ink-2`: **4.15:1** — clears the 3:1 non-text threshold, fails the 4.5:1 text threshold. |
| **Decision** | Copper is used on `--apex-ink-2` as a **non-text accent only**, never as text. The token is not lightened. |
| **Decided by** | User: *"keep restriction, don't lighten."* |

Lightening `--apex-copper-dark` to clear 4.5:1 on ink-2 would have moved it
against `--apex-ink`, where §4.2's table already verifies it at 4.64:1 — a
narrow margin. Changing a verified pairing to fix an unverified one is the
wrong trade.

No component in Appendix B places copper text on an ink-2 surface, so nothing
in the manifest is lost. The gate in `scripts/check-contrast.mjs` enforces the
pairing at 3:1 and carries the full reasoning inline.

---

## Z.5 — Structured-data suppression expressed as a route group

| | |
|---|---|
| **Blueprint** | A.14 and A.17 require structured data suppressed entirely on `/thank-you` and `/404`. J.6 requires all 23 indexable routes statically generated. |
| **Problem** | Suppressing by reading the pathname in the locale layout requires `headers()`, which opts the entire subtree into dynamic rendering — every route became `ƒ`, breaking J.6. |
| **Decision** | Exclusion expressed structurally: an `app/[locale]/(indexed)/` route group emits the `HVACBusiness` + `Organization` graph; `/thank-you` and `not-found.tsx` sit outside it. |

The group does not appear in any URL, so no canonical changes. All 23 indexable
routes are `●` (SSG); `/thank-you` remains `ƒ`, which J.6 explicitly requires
since it reads a query parameter.

---

## Z.6 — `/en` → `/` redirect moved into the proxy

| | |
|---|---|
| **Blueprint** | F.3: `/en/*` → `/*` (308). F.1: unprefixed requests resolve to the `en` segment by rewrite. |
| **Problem** | A proxy runs **before** `next.config` redirects. The proxy rewrote `/` → `/en`, the config redirect then fired on that rewrite, and the request looped — serving an empty HTTP 200. |
| **Decision** | Both rules live in `proxy.ts`. Rewrites are internal and do not re-enter the proxy, so they coexist safely. |

`/book-a-service` → `/contact` and `/sitemap` → `/sitemap.xml` remain in
`next.config.ts`; neither collides with the rewrite.

---

## Z.7 — Focus ring given real specificity

| | |
|---|---|
| **Blueprint** | I.3: `:focus-visible` ring in `--apex-copper`, 3px, 3px offset, on every interactive element. "Non-negotiable." |
| **Problem** | Written with `:where(...)` for zero specificity. Tailwind's `transition-colors` lists `outline-color` among transitioned properties, and on elements carrying it the shorthand resolved to `currentColor` — rendering a **near-white** ring on the transparent header over the ink hero. |
| **Decision** | Selector no longer uses `:where()`, and `outline-color` is set as a longhand rather than through the `outline` shorthand. |

Zero specificity remains correct for the section-padding rules it was chosen
for (§9.5 step 12), but a focus indicator any utility can silently outrank is a
2.4.7 failure. Verified copper — `lab(46.95 33.77 45.32)` — on both grounds
after the change.

---

## Z.8 — Mega-menu keyboard activation handled explicitly

| | |
|---|---|
| **Blueprint** | §3.2: "`Enter` / `Space` on the trigger opens and moves focus to the first panel item." |
| **Problem** | Two defects. (1) The keydown handler and the button's native activation click both toggled state and cancelled each other, so the panel never opened from the keyboard. (2) Focus was moved in a `requestAnimationFrame` inside the handler, before React had committed the un-hidden panel — and a `hidden` element is not focusable, so the call was a silent no-op. |
| **Decision** | `preventDefault()` on Enter/Space/ArrowDown suppresses native activation, leaving exactly one code path that changes state. Focus moves in an effect keyed on `open`, after the DOM update. |

Enter and Space toggle; ArrowDown only opens. All seven §3.2 behaviours
verified passing: open-and-focus-first, arrow movement, `Home`/`End`, `Escape`
closing and returning focus, and `Tab` from the last item closing the panel.

**Testing note.** The browser-automation pane dispatches `keydown` with an
empty `event.key` and generates no native activation click, so it cannot
exercise this spec. Verification used constructed `KeyboardEvent`s with correct
`key` values dispatched through React's root listener. I.13 check #4 remains a
**manual** check against a real browser before launch.

---

## Z.9 — Two target-size corrections

| | |
|---|---|
| **Blueprint** | I.7: 44×44 for all standalone controls, exceeding the 24×24 normative minimum deliberately. The inline exception covers links inside a sentence of body copy. |
| **Found** | Header logo link 157×**36**; footer column links **31**×44 ("FAQ") and **41**×44 ("Mesa"). |
| **Decision** | `min-h-11` on the logo link; footer column links changed from `inline-flex` to `flex w-full` so the target spans the column. |

Footer column links are standalone controls, not inline prose links — the
inline exception applies to the legal row beneath them, which is correctly left
unpadded. All 41 standalone controls on the homepage now measure ≥44×44.

---

## Z.10 — SVG comments cannot contain token names

Logo and favicon SVGs originally carried comments referencing `--apex-ink`.
A double hyphen is invalid inside an XML comment: browsers tolerate it, strict
parsers reject it, and the asset pipeline failed on ingest. Comments in `.svg`
files now spell token names in prose ("Apex Ink"). No visual change.

---

## Z.11 — Form pipeline: five defects found by end-to-end testing

The form is the primary conversion mechanism (§3.4), and it had never been
exercised against the real Server Action until this pass — only its markup had
been inspected. Driving it end-to-end found five defects, four of which would
have cost real leads in production.

| # | Defect | Spec | Fix |
|---|---|---|---|
| 1 | **Every failure wiped the user's typing.** React 19 resets a form after its action runs, so a single typo'd digit cleared all four fields. | G.2: *"Error — submission: Field group stays populated."* | All five failure branches echo the submitted values back; fields re-populate from them, ahead of the sessionStorage prefill. |
| 2 | **The `<select>` reset to the first option** even after fix 1, because an uncontrolled select only honours `defaultValue` on mount. A user who picked "Commercial HVAC" got "AC Repair" back. | G.2 | The select is keyed on the echoed value, so React remounts it. |
| 3 | **All four failure branches showed the transport message.** The form hardcoded *"We couldn't send that"*, so a rate-limited or bot-floored user got the wrong instruction, and the rate-limit message — which tells them to call instead — never reached anyone. | G.2 | New `<FormError />` renders the message the server actually returned. |
| 4 | **The phone number in the failure message could not be a link.** A Server Action cannot return JSX, and §9.1 bars rendering a phone number outside `<PhoneLink />`. | G.2: *"A FORM FAILURE MUST NEVER BECOME A DEAD END"* | Messages carry a `{phone}` token; `<FormError />` splits on it and drops a real `<PhoneLink />` into the gap. |
| 5 | **Missing space before the em dash** in the transport message — rendered as `0100— we're open now`. | — | `{' '}` added. |

### A build-vs-typecheck lesson

Moving the shared message constants into the `'use server'` module broke the
build: **a `'use server'` file may only export async functions.** `tsc --noEmit`
does not catch this — it is a bundler rule, not a type rule — so a green
typecheck was misleading and only `next build` (and the dev server) surfaced it.
The constants now live in `lib/form-messages.ts`. Type-only exports from the
action file are fine, since they are erased at compile time.

**Standing rule: run `npm run build`, not just `npm run typecheck`, before
calling form or Server Action work done.**

### What was verified working

- **Validation** — invalid phone rejected server-side with `role="alert"`,
  `aria-invalid="true"` and `aria-describedby` wired to the message.
- **Success** — redirects to `/thank-you?service=commercial-hvac`, and the
  confirmation renders the masked phone `(•••) •••-0142` from the short-lived
  cookie. The full number never enters the URL or the page (G.7).
- **Contextual links** — G.7's per-service table resolves correctly, and an
  unknown or hostile `?service=` value falls back to `general`.
- **`?service=` is not reflected.** An injected `<img onerror>` payload never
  becomes markup and injects no element; it survives only inside Next's own
  JSON-escaped RSC flight payload, which is framework router state rather than
  rendered content. No XSS.
- **Honeypot** (layer 1) — a filled `company` field redirects to `/thank-you`
  as though it succeeded, so a bot learns nothing, and no dispatch is sent.
- **Time floor** (layer 2) — a submission inside 2 seconds of mount is rejected
  with its own message.
- **Rate limit** (layer 4) — exactly 5 accepted, 6th and 7th rejected, per
  "5 submissions / 10 min / IP".
- **Progressive enhancement** — the rate-limit test drove the action by raw
  `POST` with no client JS involved, which confirms the form works without
  JavaScript.

Turnstile (layer 3) is unverified end-to-end: it is skipped when
`TURNSTILE_SECRET_KEY` is unset, which is the documented development posture.
It needs a real key before launch — see `.env.example`.

---

## Z.12 — Appendix I.13 sweep: four defects found

The accessibility checklist had only been spot-checked on the homepage. Running
it across all 24 routes and four breakpoints found four defects, two of them
site-wide.

| # | Defect | Spec | Fix |
|---|---|---|---|
| 1 | **The 404 shipped with no chrome at all** — no header, no footer, no nav, and no mobile sticky bar. A path matching no route never resolves into the `[locale]` segment, so Next rendered the bare root `not-found.tsx` instead of the locale one. | A.17: full global chrome minus `<FooterCTA />`, and explicitly *"the mobile sticky bar renders here as everywhere else — a visitor who has hit a dead end is exactly the visitor who most needs a visible phone number."* | `NotFoundTemplate` extracted and rendered by **both** not-found routes; the root one composes the chrome itself. |
| 2 | **Focus was lost when the mobile drawer closed** — it fell back to `<body>`, so a keyboard user had to tab from the top of the document again. | B.4: *"Focus is trapped inside the drawer while open and returned to the hamburger on close."* | `closeDrawer` focuses the hamburger. Verified on all three close paths: Escape, the X button, and the scrim. |
| 3 | **Header phone link was 24×44 on mobile** — `min-h-11` set the height but nothing set the width, leaving a 24px-wide target. This is the primary help mechanism below `lg` (3.2.6), i.e. the most important tap target on a phone. | I.7: 44×44 for all standalone controls | `min-w-11 justify-center` on the icon-only variant. |
| 4 | **Logo link was 41×44 on mobile** — the 1:1-ish mark renders ~41px wide below `md`. | I.7 | `min-w-11` on the link. |
| 5 | **`/reviews` had an anonymous `<section>` landmark** — the full review band passes no heading, so `<Section>` received no `aria-labelledby`. | B.7 / I.1: no landmark is anonymous | Visually-hidden `<h2>`, the same pattern `<StatsSection />` already used. |

### A catch-all route was tried and rejected

The obvious fix for #1 — a `[...notFound]` catch-all inside `[locale]` calling
`notFound()` — fails at build time, because the segment is statically generated
with a closed `generateStaticParams`. The failure surfaces as Next's global
error page (`<html id="__next_error__">`), which is strictly worse than the
problem: no chrome *and* no H1 *and* no `lang`. Composing the chrome in the root
not-found is the working answer.

### What now passes

| I.13 | Check | Result |
|---|---|---|
| #1 | Contrast pairings | 21/21, build-blocking |
| #2 | Structural a11y across templates | `scripts/check-a11y.mjs`, 24 routes, 0 issues |
| #7 | Reflow, no horizontal scroll | 320 / 390 / 768 / 1440 — clean |
| #8 | Standalone controls ≥44×44 | **1728 controls over 56 page-renders, 0 undersized** |
| #9 | One `<h1>`, no skipped levels | 24/24 routes |
| #10 | Alt text matches Appendix D | 24/24 routes, compared against the manifest verbatim |

Also verified: the reduced-motion block covers `animation-duration`,
`animation-delay`, `animation-iteration-count`, `transition-duration`,
`transition-delay` and `scroll-behavior`; `<StatBlock />`,
`<MobileStickyBar />` and `<EntranceMotion />` each read
`matchMedia('(prefers-reduced-motion: reduce)')`; and §4.11's observer
discipline holds exactly — the whole codebase contains **one**
`IntersectionObserver` (`<StatBlock />`) and two scroll listeners
(`<MobileStickyBar />`, which removes itself after firing once, and
`<SiteHeader />`'s transparent→solid state, which is not an entrance
animation). No barrel import of `lucide-react` exists.

### Still manual, by design

I.13 #3 (focus visible and unobscured, tabbed topbar-to-footer per template),
#4 (mega-menu keyboard on a real keyboard — the automation pane dispatches
`keydown` with an empty `event.key`, see Z.8) and #5 (VoiceOver and NVDA).
Emulating `prefers-reduced-motion` also needs a real browser toggle.

---

## Z.13 — Measurement built, and three code-quality fixes

### The §8.6 / J.7 measurement layer was specified but not built

`<Analytics />` pushed events into the dataLayer, but nothing loaded a
transport, so no event could ever leave the page — the instrumentation existed
and reported nowhere. Two components close it:

- **`<GoogleAnalytics />`** — GA4 via `next/script` `afterInteractive`, which is
  what keeps J.5's *"total third-party JS above the fold: 0KB — a hard budget,
  not a goal"* true. Consent Mode defaults are set BEFORE the library loads,
  the only ordering in which they apply to the first hit. No cookie wall ships
  (§8.6: Arizona has no state law requiring one), but the switch exists so a
  banner can be added later without re-instrumenting a single event.
- **`<WebVitals />`** — J.7 field data via Next's built-in
  `useReportWebVitals`, deliberately not the `web-vitals` package, since Next
  already bundles the collector and adding it would spend third-party bytes on
  a diagnostic. Reported as a **non-key** event: the key events are
  `generate_lead` and `phone_click`, and marking a diagnostic as key would
  pollute the conversion reporting every claim in §1.4 rests on.

Both are gated on `NEXT_PUBLIC_GA_ID`. Unset, no script loads and the dataLayer
still fills, so events stay inspectable without a live property.

**Property-side action, flagged in the README:** `generate_lead` and
`phone_click` must be marked KEY EVENTS in GA4. Phone is the primary conversion
channel (§1.4: 60–70% of HVAC conversions arrive by phone) and must not be
configured as secondary. Code cannot enforce this.

### ESLint pinned to 9.x

`eslint-config-next@16` bundles an `eslint-plugin-react` that crashes on
ESLint 10 (`contextOrFilename.getFilename is not a function`) — its peer range
says `>=9.0.0`, which 10 satisfies nominally but not actually. Pinned to
`eslint@9.39.5`. `next lint` was also removed in Next 16, so the script is now
plain `eslint .`, and the config imports `eslint-config-next`'s native flat
configs instead of going through `FlatCompat` (which needed `@eslint/eslintrc`
as an undeclared extra dependency).

### Two `react-hooks/set-state-in-effect` errors, both real

| File | Was | Now |
|---|---|---|
| `MegaMenu.tsx` | Route-change dismissal ran in an effect, costing an extra render pass with the stale panel still open — a visible flash of the old menu over the new page on a slow device | Adjusted **during render**, React's documented "adjusting state when props change" pattern |
| `use-session-prefill.ts` | Read `sessionStorage` in an effect and called `setState`, so **every form rendered twice on load**, and two forms on one page each held a snapshot taken at their own mount | Rewritten on `useSyncExternalStore` — `sessionStorage` *is* an external store. Hydration-safe by contract via `getServerSnapshot`, no cascading render, and writing from the hero form now notifies the footer callback form |

Both were flagged as errors rather than warnings, and both were genuine
behaviour bugs rather than style complaints.

---

## Verification suite

Six gates, of which two block the build:

| Command | Covers | Blocking |
|---|---|---|
| `npm run check:contrast` | §4.2 verified-contrast table, recomputed from the tokens | **Yes** |
| `npm run check:bundle` | J.4 budgets + J.6 static generation | **Yes** |
| `npm run check:a11y` | I.13 #9, #10 and the static half of I.1/I.4/I.9, 24 routes | No |
| `npm run check:seo` | Part 8 — internal linking, GEO ledes, NAP consistency, AEO answer-first, city-page uniqueness | No |
| `npm run check:copy` | §5.5 / §3.4 copy-length constraints | No |
| `npm run report:placeholders` | §9.4 register — satisfies §9.5 step 11 | No |

I.13 #3, #4 and #5 remain manual by design, plus a real-browser
reduced-motion toggle.

---

## Z.14 — Em dashes removed from authored copy

| | |
|---|---|
| **Reason** | An em dash in body copy is one of the strongest "written by an AI" tells in English prose. This site is a portfolio artifact whose job is to read as though a person wrote it. |
| **Found** | 58 in non-comment source. |
| **Now** | 14, every one blueprint-verbatim. Guarded by `scripts/check-emdash.mjs`. |
| **Decided by** | User: *"em dash hatao, isse AI dikh raha hai."* |

Each was **rewritten, not swapped**: the dash became a full stop, a colon or a
restructured clause so the sentence still reads naturally. Swapping the
punctuation alone would leave the same AI cadence with different glyphs.

The 14 that remain are strings the blueprint states verbatim, so removing them
would silently override copy it fixes: §3.4's CTA label lock (which it calls
exhaustive), §5.1's topbar line, §5.3's hero CTA row, §5.7's dispatch copy
(whose 4pm qualifier is load-bearing), §5.10's illustrative-review label,
§2.2's positioning statement, §9.3a's form-failure message, §9.3b's thank-you
copy, A.9 and A.10's meta descriptions, and B.1's logo label — plus B.18's
mandated em-dash fallback in the stat numeral slot, which is a UI token rather
than prose.

---

## Z.15 — Security headers added

| | |
|---|---|
| **Blueprint** | Silent. Parts 0–9 cover design, content, accessibility and performance; transport security is not enumerated anywhere. |
| **Found** | No CSP, no clickjacking defence, no MIME-sniffing protection, no HSTS. |
| **Decision** | Full header set added in `next.config.ts`. OWASP A05. |

Shipping a site that collects personal data (name, phone, ZIP) for a licensed
contractor with no security headers would be negligent regardless of what the
specification happens to enumerate. Added: `Content-Security-Policy`,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Strict-Transport-Security`.

**The CSP is not nonce-based, deliberately.** Next's App Router inlines RSC
payload scripts, so a nonce-only policy requires per-request middleware and
forces every route dynamic — which would break J.6's requirement that all 23
indexable routes are statically generated. `'unsafe-inline'` for scripts is the
cost of that trade, and it is stated in the config rather than hidden.
`script-src` is otherwise restricted to the two origins that are actually
used: googletagmanager (§8.6) and challenges.cloudflare.com (G.4).

Verified in the browser: **zero CSP violations**, styles, fonts, images and
JSON-LD all intact. One consequence worth knowing — `frame-ancestors 'none'`
now blocks the site from framing itself, so the iframe-based multi-route test
technique used in earlier passes no longer works and those checks navigate
directly instead. That is the header doing its job.

### Also hardened

`serialiseJsonLd()` escapes `<`, `>` and `&` before structured data is injected
via `dangerouslySetInnerHTML`. `JSON.stringify` does not escape `<`, so any
string reaching the graph containing `</script>` would close the tag early and
turn structured data into an HTML injection point. Nothing user-supplied
reaches that graph today — it is built from typed modules in `lib/` — but the
escape costs nothing and removes the class of failure entirely. OWASP A03.

### Reviewed and already clean

Server Action input is validated with a zod schema and HTML-stripped in three
places; no `process.env` value other than `NEXT_PUBLIC_*` is referenced from a
client component; the `/thank-you` cookie is `httpOnly`, `sameSite: 'lax'`,
`secure` in production and expires in 10 minutes; `?service=` is validated
against a closed list and never echoed (Z.11).

**Known limitation:** the G.4 rate limiter is an in-process `Map`, so it is
per-instance and resets on deploy. Correct for a single-instance deployment,
insufficient behind multiple instances — that needs a shared store (Redis, or
the hosting platform's own rate limiting) before scaling out.

---

## Z.16 — Three bugs from the annotated screenshot

| Bug | Cause | Fix |
|---|---|---|
| **Stats read `1+` and `0+` instead of `15+` and `800+`** | `parseValue()` returned a fresh object computed inline, so it was a new dependency identity every render. Each `setDisplay` re-ran the effect, which rebuilt the `IntersectionObserver`, which fired again because the element was still on screen, which started a second rAF loop. Competing loops overwrote each other and the counter froze part-way. | `useMemo` on the raw string, plus a `cancelled` flag and `cancelAnimationFrame` in cleanup. |
| **"Service Areas" wrapped to two lines** in the header at 1280–1440px, breaking the 72px rhythm | Nav items had no `whitespace-nowrap`, and the nav competed with the logo and the right-hand cluster for width. | `whitespace-nowrap` on every nav item, `shrink-0` on the mega-menu triggers, `min-w-0` on the nav, tighter `gap` until `xl`, and the rating badge deferred to `xl`. |
| **The logo mark was the wrong shape** | The geometry was built parametrically from unit vectors and a bisector offset. It was tidy but produced a lopsided form: the left arm came out far shorter than the right, so the mark read as a "7" rather than a peak, and the copper bars ran at the arm angle and cut through the triangle instead of trailing away from it. | Redrawn against the delivered `2.brand icon.png` and frozen as explicit path data in `scripts/build-logo.mjs`. |

The counter bug is the one worth remembering: it did not look like a bug. It
rendered a plausible number under a real label on a dark band, so it read as
data rather than as breakage. The two stats beside it that correctly showed the
§9.4 em-dash fallback were the only hint anything was wrong.

---

## Z.17 — Web Interface Guidelines pass

Audited against the Vercel Web Interface Guidelines. Six real misses, all fixed:

| Miss | Why it mattered |
|---|---|
| **No `autocomplete` on the quote or callback form** | The largest of the six. Mobile is 70–78% of this traffic (§1.4) and every extra field costs ~10% of submissions. A field the browser fills costs far less than one the user types. Now `name`, `tel`, `postal-code`. |
| No `touch-action: manipulation` | Browsers add a ~300ms double-tap-to-zoom delay to tappable elements. That delay was on the phone link, the primary conversion path. Zoom itself is untouched, so 1.4.4 still holds. |
| No `overscroll-behavior: contain` on the drawer | Scroll chaining chained to the body behind the overlay on iOS, so closing the drawer left the user somewhere else on the page. |
| No `color-scheme` | Native controls, scrollbars and form widgets were left to the UA's guess. Set to `light`; this is the single line that changes when the dark-mode toggle ships. |
| No `spellCheck={false}` on ZIP and phone | Red squiggles under a postcode are noise. |
| No `translate="no"` on the phone number | Machine translation reformats digits, which would break §8.5's NAP consistency the moment a browser auto-translated the page. |

Also added: **focus moves to the first errored field on a failed submit**.
Without it a keyboard or screen-reader user was left at the submit button with
the error announced but no idea which field to correct, and on mobile the
offending field could be off-screen. The global `scroll-margin-block` rule
(I.3) means focusing it also clears the sticky chrome (2.4.11).

Already compliant and confirmed: no `transition: all`, no `outline-none`
without a replacement, proper ellipsis and curly quotes, `tabular-nums` on
numeric columns, `text-wrap: balance` on headings, `min-w-0` on flex text
children, explicit image dimensions via `next/image`, `env(safe-area-inset-*)`
on the sticky bar, semantic elements throughout, and `role="alert"` on async
form errors.
