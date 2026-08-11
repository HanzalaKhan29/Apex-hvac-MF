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

---

## Z.18 — Motion additions and Supabase lead store

Two things added beyond the blueprint, decided with the user after reviewing a
10-item motion wishlist against §4.11's restraint rule. Four of the ten
conflicted directly with the blueprint (scroll-reveal on every section against
§4.11's own "most reliable tell of a templated build" line; button scale
against "no scale transform"; a logo marquee against B.30's explicit ban;
Framer Motion/GSAP/Lenis against J.4's "no animation library" and the ~220KB
bundle ceiling). The user chose blueprint restraint over the wishlist; two
items from it did not conflict and were added.

**Cursor spotlight.** `components/PointerSpotlight.tsx` + `.cursor-spotlight`
in `globals.css`. A soft `--apex-copper` radial glow trailing the pointer at
10% opacity. Gated on `(hover: hover) and (pointer: fine)` in CSS and skipped
before a listener even attaches in JS, so a touch device pays zero cost, not a
hidden-but-computing one. Position is written straight to two CSS custom
properties via a single `requestAnimationFrame` loop with the target lerped at
0.12/frame — never through `setState`, which would re-render on every pointer
event. Respects `prefers-reduced-motion`.

**Hero background drift.** `.hero-drift` in `globals.css`. The existing §5.3
radial highlight now pans slowly (22s loop) via `background-position` rather
than sitting static. A `radial-gradient`'s `at <position>` clause is fixed at
parse time and cannot itself be animated — the gradient is declared with its
default center origin, oversized via `background-size: 160% 160%` for panning
room, and `background-position` is what the keyframe actually moves.

**Why these two specifically.** Neither carries content, both sit at or below
the threshold of conscious notice, and neither needs a script tag beyond a
single rAF loop already paying for itself in restraint. They read as ambient
texture — the way film grain or a vignette would — not as "the page has an
animation," which is the exact distinction §4.11 draws.

**Not implemented, and why:** React's experimental `ViewTransition` API
(canary-only feature bundled in Next's App Router) was considered for
route-level page transitions. Declined for a client-facing $10-20K portfolio
build where stability outweighs a page-transition flourish — an experimental
flag is upside risk for the agency, not for the visitor.

### Supabase — a persistent lead store, additive to G.3

The blueprint's transport is fully specified: Server Action → Resend →
dispatch inbox (G.3), no database. `supabase/schema.sql`, `lib/supabase.ts`
and a `recordLead()` call in `submit-lead.ts` add a **queryable copy**
alongside that transport, never instead of it.

- Fires **after** the Resend email has already succeeded, and is never
  `await`-ed into the failure path — a Supabase outage must not turn into a
  G.2 "we couldn't send that" for a lead the dispatch inbox already has.
- `recordLead()` never throws. Unconfigured (`SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` unset) is a silent no-op, not a startup error.
- RLS is enabled on `leads` with **no policies** — only the service-role key
  can touch the table, and that key is loaded through `server-only`, which
  makes importing it from a Client Component a build error.
- The actual Supabase project was not created — no CLI, no account access,
  and creating accounts on the user's behalf is out of scope regardless. The
  user runs `supabase/schema.sql` once in a new project's SQL editor and adds
  the two env vars; everything else is already wired.

### Vercel

Linked to the `metric-front` team as `apex-comfort-systems` via the CLI,
which was already authenticated in this environment. Deployed as a
**preview**, not production, per the deploy skill's default.

---

## Z.19 — page-load entrance stagger on the brand strip, stats band, process steps and reviews

**Owner request** (screenshot-reported: these bands read as static, no motion
at all). Wired the existing §4.11 mechanism (`<EntranceMotion />`,
`data-entrance` / `data-entrance-item`) into `<LogoStrip />`, `<StatsSection />`,
`<ProcessSection />` and `<ReviewsSection />` — previously only the homepage
`<ServicesGrid />` opted in. `<EntranceMotion />`'s own threshold measurement
(anything below 1.5× viewport height at mount is never observed) keeps this
a no-op below the fold, so no new observer cost on `/reviews` or any service
page. No change to the mechanism itself.

Real brand marks (Carrier, Trane, Lennox, Rheem, York, Daikin — files
supplied by the owner) now render in `<LogoStrip />` under the unchanged
"Brands We Service" heading. §9.4's `manufacturerDealerBrands` gate still
locks the **partnership** framing ("Systems We Install"); showing a brand's
mark to truthfully describe equipment serviced is ordinary nominative use
and does not require dealer-status confirmation. If that reading changes,
`showLogos` in `LogoStrip.tsx` reverts to the text list.

## Z.20 — transparent-header legibility scrim

**Owner-reported bug** (screenshot): the header row read as low-contrast on
first paint at the top of the homepage, resolving once scrolled. Root cause
not conclusively reproduced in isolation (source-level contrast check on
`text-apex-paper` over `bg-apex-ink` shows ~18:1), but the ambient
`.hero-drift` highlight (Z.18) can pass a lighter frame directly under the
nav during its 22s loop. Fix is defensive rather than diagnostic: a fixed
dark gradient scrim sits behind the header row only while
`transparentUntilScroll` is active, fading out with the same transition as
the background-color swap on scroll. `.hero-drift` also gained
`will-change: background-position` to reduce first-paint compositor cost.

## Z.21 — process-step connector fill (scroll-triggered)

**Owner request.** B.27 originally specified no motion for
`<ProcessSection />`; the owner asked for the 1→2→3→4 connector to visibly
draw in while scrolling the sequence. Third exception to §4.11's
page-load-only rule, alongside `<StatBlock />`'s count-up and
`<MobileStickyBar />`'s slide-in: one-shot `IntersectionObserver` per
connector, `prefers-reduced-motion` renders the final state via a
`motion-reduce:` CSS variant rather than a synchronous `setState` in the
effect (avoids the `react-hooks/set-state-in-effect` failure mode already
hit once in this build — see Z.16).

## Z.22 — illustrative stats figures

**Owner request**, explicit and one-time: "systems installed" and "customer
satisfaction" render B.18's em-dash fallback per §9.4 because no real figure
exists. The owner asked for illustrative numbers so the fixed four-column
stats band is not left with two blank slots on a live client-facing site.
`lib/placeholders.ts` now carries `2,500+` / `98%` for these two keys, each
still flagged `placeholder: true` with a note stating CLIENT ACTION IS STILL
REQUIRED before launch. This is a one-time, explicitly requested exception to
the "nothing fabricated ships" rule stated at the top of this register — the
rule holds everywhere else.

## Z.23 — hardening pass

`poweredByHeader: false` (stops the `X-Powered-By: Next.js` response header)
and a `Cross-Origin-Opener-Policy: same-origin-allow-popups` header added to
`next.config.ts` alongside the existing CSP/HSTS/frame-ancestors set (Z.9?).
Reviewed all three `dangerouslySetInnerHTML` call sites (`<JsonLd />`,
`<FAQAccordion />`, `<GoogleAnalytics />`) — all serialize through
`serialiseJsonLd()`, which escapes `<`, `>` and `&`, or interpolate only
build-time env values, never user input. No change needed there.

---

## Z.24 — header transition-flash fix

Owner-reported: the header briefly read as washed-out at page load, settling a
moment later. Not reproducible from a static style inspection — the computed
colors and the Z.20 scrim were both already correct at rest, which pointed at
a transient first-paint state rather than a wrong value. `SiteHeader.tsx`
withholds the background/scrim transition for one tick after mount
(`useSyncExternalStore`), so nothing can visibly fade in from a wrong state on
first paint regardless of what triggered it.

## Z.25 — real Framer Motion reviews marquee

Owner-requested motion for `/reviews`. `<ReviewsMarquee />` (Framer Motion,
dynamically imported from the route file only, never the shared
`<ReviewsSection />`, so the homepage bundle never pays for it — see the note
in `ReviewsSection.tsx`) renders the full review set as a three-column,
per-column-speed vertical loop, pause on hover/focus, static grid fallback
under `prefers-reduced-motion`. Adapted from the owner-supplied reference
rather than copy-pasted: the reference used real Unsplash headshots pinned to
invented names, which would misuse a real person's photo on a fabricated
testimonial — dropped the avatars, kept the loop/pause/spring mechanics.

**Follow-up (this session):** the original implementation wrapped each
`<ReviewCard />` (which itself renders `<li>`) inside a second `motion.li`,
and wrapped each duplicate-loop pass in a `<div>` — both invalid as children
of `<ul>`, both firing real hydration errors on every load in dev and
production alike. Fixed by making `<ReviewCard />` itself the animated list
item (`tabIndex`/`ariaHidden`/`className` props added, applied to its own
`<li>`) instead of double-wrapping it; the redundant Framer `whileHover`
spring was dropped since `<ReviewCard />` already has its own CSS hover lift.

## Z.26 — logo strip auto-scroll marquee

| | |
|---|---|
| **Blueprint** | B.30 / §6.2 / H.2.2: no marquee, no auto-scroll, at any width, for the manufacturer band. |
| **Decision** | Overridden. Owner explicitly requested continuous motion on the brand logos. |
| **Decided by** | User, explicitly. |

Implemented as pure CSS (`.apex-logo-track` / `@keyframes apex-logo-scroll` in
`globals.css`), the same compositor-only technique as `hero-drift` and
`cursor-spotlight` (Z.18) — no JS, no animation library, J.4 still holds. The
brand list renders twice back to back so `translateX(-50%)` loops seamlessly;
the second pass is `aria-hidden` and untabbable (`tabIndex={-1}`) so assistive
tech sees the real six brands once, not twelve. Pause-on-hover/focus (WCAG
2.2.2) is plain `:hover` / `:focus-within` — no listener. Reduced-motion needs
no extra code: the I.8 global rule already zeroes every `animation-duration`
on the page.

Replaces the page-load entrance stagger `<LogoStrip />` opted into in Z.19 —
continuous motion supersedes a one-time reveal, the same reason
`<ReviewsMarquee />` never used `data-entrance` either.

**Separately found while touching this component:** `manufacturer-carrier.png`
shipped genuinely cropped at the file level (the oval and top of the wordmark
were clipped), not a CSS/aspect-ratio bug — the old declared 262×142 matched
the file's real dimensions exactly, so the file itself was the bad asset.
Owner supplied a replacement (`carrier png final.png`, 1536×1024, transparent
background with a soft glow halo). Processed it: cropped to content using the
file's own alpha channel (threshold >120, to trim the halo down to the crisp
oval+wordmark rather than keep the full glow spread), downscaled to 367×148 to
match the sibling logos' scale. `lib/content.ts`'s declared dimensions updated
to match. Verified via a fetched canvas readback against the running server,
not just visual inspection — 367×148 natural size, real transparent pixels
present, Next's image-optimization output confirmed 200/image-png. (One
gotcha hit while verifying: `next start`'s `.next/cache/images` cache doesn't
invalidate on a source file swap during local testing — had to clear it by
hand to stop it serving the old cropped image under the same optimizer URL.
Not an issue in a real deploy, where the cache starts empty.)

Owner then supplied clean replacements for the other five brands too (`trane
final.png`, `lennox final.png`, `rheem final.png`, `york final.png`, `daikin
final.png`, all 1024×1024, transparent). Same alpha-bbox crop, downscaled to
148px tall to match. `lib/content.ts` dimensions updated for all five.

### Follow-up: two real defects found by measurement, not by eye

Owner reported the marquee showed a repeated logo and asked for it fixed
without guesswork. Verified with real `getBoundingClientRect()` /
`getComputedStyle()` reads against the running build (this sandbox's browser
pane doesn't composite frames, so a screenshot can't prove motion — DOM
measurement was the only way to get real evidence rather than assume):

1. **`max-w-[7.5rem]` clipped wide logos unevenly.** York's true aspect ratio
   needs ~178px width at the fixed 36px height; capped to 120px, `object-contain`
   letterboxed the actual rendered mark down to ~24px tall — visibly smaller
   than Carrier or Rheem next to it. Same for Daikin (~28px) and Lennox
   (~34px). The cap was sized for the old single-logo grid cell and never
   revisited for the marquee's flex row, which doesn't need it — removed;
   each logo now renders at its own aspect ratio, uniformly 36px tall
   (confirmed: `heights: [36]` across all 12 rendered `<li>`, no outliers).

2. **The loop was wrong at the CSS level, in two compounding ways.**
   - `translateX(%)` resolves against the *track element's own box*, not its
     overflowing children. `.apex-logo-track` had no explicit width, so its
     box stayed clipped to `.apex-logo-viewport`'s width (measured: track box
     1137px while its content actually spanned to 2925px) — `-50%` was moving
     by half of the wrong number entirely. Fixed with `width: max-content` on
     the track, the standard fix for this exact class of bug.
   - Flex `gap` doesn't add space after the last child, so a two-pass
     `max-content` track built with `gap-s6` came out ~48px short of being
     exactly double the true repeat distance — `-50%` under-shot the seam by
     that amount, which would show as a small jump every loop. Fixed by
     moving the spacing from the track's `gap` to `mr-s6` on every item
     (including the last), which *is* periodic. Verified after the fix: the
     `-50%` shift (990.94px) matches the actual pass-to-pass offset for every
     one of the six logos (990.93–990.94px, sub-pixel rounding only) —
     confirmed genuinely seamless, not assumed.
   - Separately, six logos only span ~940px even with normal spacing, well
     under the page's own 1280px content ceiling (measured directly: content
     width stays 1280px at both 1920px and 2560px window widths, confirming
     it's a hard cap, not a guess) — a two-pass loop at that width put the
     repeat's first item inside the same viewport as the original (measured:
     duplicate "Carrier" at `left: 991px` inside an 1137px view). Rather than
     fight for a spacing value tuned to today's six logo widths (which would
     silently break again the next time a brand logo changes size — as
     happened twice already in this session), `.apex-logo-viewport` is capped
     at `max-w-2xl` (672px) regardless of section width. Six logos never fit
     inside 672px, so the strip always has something to reveal and the
     repeat can never land in view — true at any screen size structurally,
     not by coincidence of the current asset set.

---

## Z.27 — header scrim fixed a live, reproducible washed-out flash

| | |
|---|---|
| **Owner-reported** | Live site (`apex-comfort-systems.vercel.app`): header renders washed-out/illegible on first paint, corrects itself after scrolling a few pixels. Screenshotted both states. |
| **Root cause** | Z.20's scrim gradient (`from-black/45 via-black/15 to-transparent`) fades to fully transparent at the BOTTOM of its own height — which is exactly where the nav row (logo, links) sits, not the topbar. The topbar got real coverage; the row people actually read got almost none. Z.20's own stated purpose — "guarantees legibility independent of whatever the hero is doing behind it" — didn't hold for the one row that mattered. |
| **Fix** | Flat `bg-black/45`, no gradient. Every pixel of the scrim's height gets the same coverage, so the nav row's legibility no longer depends on where a gradient stop happens to land. |

`SiteHeader.tsx`'s scrim block, `app/globals.css` untouched (the scrim is a
plain className, not a `.apex-*` utility).

## Z.28 — logo replaced with owner-supplied artwork; raster PNG, not SVG

| | |
|---|---|
| **Blueprint** | E.0/E.1: the lockup ships as inline SVG using `currentColor`, specifically so the header can flip it between the transparent-over-hero state (light) and the solid-on-scroll state (dark) without a second asset. |
| **Owner action** | Supplied new artwork (`apex logo final.png`) to replace the hand-drawn mark. |
| **Constraint that survived the swap** | A flat raster image is always one fixed color — dropping in just the new artwork would make the logo invisible against the dark hero in the transparent header state, the same legibility class as Z.27, just permanent. |
| **Decision** | Processed the source into two color variants per size (mark/full × dark/light) rather than one image. Navy pixels (measured ~RGB(9,26,42), matching `--apex-ink` almost exactly) recolored to `--apex-paper` for the light pair; the orange/copper accent is untouched in both, preserving the original SVG's "copper is never recolored" rule (§5.2.1). `<Logo scheme="dark" \| "light">` selects the pair; `SiteHeader.tsx` passes it from the same `transparent` boolean that already drove the text-color classes. `SiteFooter.tsx` hardcodes `"light"` (dark footer, always). |

**Two defects found building this, both caught before commit, not after:**

1. **Bundle regression.** First pass used `next/image`. `<LogoStrip />`
   (homepage-only) was the only other `next/image` consumer, so its client
   runtime lived in a route-specific chunk. Wiring it into `<SiteHeader />` —
   present on every route — promoted that runtime into the truly-shared
   chunk and pushed it to 213.4KB against the 210KB budget. Fixed by using a
   plain `<img>` instead: this is a small, fixed-size, pre-optimized static
   file that never needs on-demand resizing, so there was no reason to pay
   for `next/image`'s client code at all. Back to 208.2KB.
2. **404 in production.** Files initially lived under `public/logo/`.
   `proxy.ts`'s matcher excludes paths starting with the literal prefix
   `logo-` (for `logo-full.svg` et al.) from the locale rewrite — it does not
   exclude a `/logo/` folder. Every request for `/logo/apex-logo-*.png` was
   silently rewritten to `/en/logo/apex-logo-*.png` first and 404'd, since no
   file exists there. Fixed by renaming to `public/logo-apex-{mark,full}-
   {dark,light}.png`, matching the existing convention instead of adding a
   new one. Verified after the fix: all four variants return 200, both in a
   direct `curl` and from the rendered `<img>` tags' `naturalWidth`.

**Known follow-up, not done in this pass:** `public/logo-full.svg` /
`logo-mark.svg` / their `-inverse` siblings (the OG image composition, the
JSON-LD `logo` property, the IMG-09 van composite) and the favicon /
apple-touch-icon set are still built by `scripts/build-logo.mjs` from the old
hand-drawn geometry. The on-site header/footer logo and these static assets
now show two different marks. Flagged rather than left silently
inconsistent — updating them needs either re-running that script against
traced vector geometry of the new artwork, or a decision to serve the new
PNG in those contexts too.

## Z.29 — sitewide hover-motion consistency pass

Owner-requested premium hover treatment (lift + subtle scale + shadow,
Stripe/Linear-style) across every genuinely interactive surface. Declined
`motion-framer`/`animejs`/`scroll-reveal-libraries` for this — everything
asked for (scale, translate, shadow, ~280ms ease-out) is plain CSS
`transition`/`transform`, which the codebase already used in three different
hand-rolled forms (`ServiceCard`, `ReviewCard`, `LogoStrip`); this pass makes
them consistent rather than adding a fourth pattern via a library. Zero
bundle cost, and `prefers-reduced-motion` compliance is automatic — the I.8
global rule already zeroes every `transition-duration` on the page, so
nothing extra was needed for any of this.

`--dur-hover` (card hover) 200ms → 280ms; `--dur-button` (button hover)
160ms → 180ms — both now sit inside the requested 250–350/150–350ms window
and every existing consumer of these tokens picked up the change for free.

- `ServiceCard.tsx` — added `scale-[1.02]` alongside the existing 4px lift
  (now 6px, `-translate-y-1.5`); icon badge gets `rotate-3` on hover/focus.
- `ReviewCard.tsx` (the static-grid `<figure>`, shared by `ReviewsSection`
  and the `/reviews` marquee) — same scale+lift addition. `ReviewsMarquee.tsx`
  had its own `hover:scale-[1.02]` on the wrapper `<li>` from when the figure
  had no hover of its own; left in place it would have double-stacked
  (scale × scale) with the figure's own new hover — stripped to just the
  focus-visible ring, which is the only thing that was actually unique to
  the marquee context.
- `ProjectCard.tsx` — was shadow-only (no lift) at the card level, only the
  inner image zoomed on hover. Added the missing 6px lift to the `<figure>`;
  left the image's own zoom as-is (it already reads as the "subtle parallax"
  the brief asked for, doubling up scale on both card and image would be the
  "exaggerated" effect the brief explicitly said to avoid).
- `Button.tsx` — lift 1px → 2px. No scale added (the existing "no scale
  transform" rule at line 69 is a deliberate prior restraint decision, not
  an oversight) — the background-color swap to each variant's `-hover` token
  (`copper-hover`, `ink-2`, `white/10`, `n-100`) already reads as "brighten,"
  so no separate `brightness()` filter was layered on.
- `QuoteCard.tsx` / `CallbackForm.tsx` submit buttons — these are raw
  `<button>`s duplicating `Button.tsx`'s primary-variant color but not its
  lift. Added the matching 2px lift for consistency.
- `FAQAccordion.tsx` / `MobileNavDrawer.tsx` accordion `<summary>` rows —
  had zero hover feedback despite being clickable (every other interactive
  row in the system — nav links, footer links, mega-menu items — has one).
  Added a text-color shift to `--accent` on hover, no lift/shadow (these are
  borderless list rows, not cards — a lift would look out of place).
- `FeatureRow.tsx` — **real bug found and fixed while auditing this**, not
  a style gap: the non-link render branch (`return <li className="group
  flex...">`) carried the `group` class unconditionally, so a purely
  informational row (no `href`) still fired the link-style icon-invert
  on hover — implying the row was clickable when it wasn't. `group` is now
  only present on the branch that actually renders a `<Link>`. The link
  branch additionally gets `rotate-3` on its icon badge, matching
  `ServiceCard`.

**Deliberately not touched:** `Hero.tsx`, `WhyApexSection.tsx`, and the
`/about` team photo — none of these images sit inside a link or button.
Adding a hover-zoom to a purely decorative image would imply an action that
doesn't exist, which is a worse UX than no motion at all; "images" in the
brief is read here as "images that are part of something clickable"
(`ProjectCard`'s, which already had it). Same reasoning for `StatBlock` and
`ProcessStep` — neither is interactive, so neither gained a hover state.

Verified via the compiled stylesheet (`document.styleSheets`), not just by
reading the JSX: confirmed `group-hover:scale-[1.02]`,
`group-hover:-translate-y-1.5`, `group-hover:rotate-3`,
`hover:-translate-y-0.5` and the FAQ's `group-hover/row:text-` selectors all
exist as real compiled CSS rules, not silently dropped by an invalid
arbitrary-value string. `check:bundle` unaffected (208.2KB shared, unchanged
— everything here is CSS). Mobile swept for regressions across `/`,
`/services`, `/reviews`, `/about`, `/projects`, `/faq`, `/contact` at 375px:
no horizontal overflow on any of them, and the `/reviews` marquee (Z.29's
neighbor, Z.26/Z.27's era) renders one full-width column instead of the
three-cramped-into-335px state from before that fix.

## Z.30 — mega-menu closed while moving the cursor into its own panel

| | |
|---|---|
| **Owner-reported** | Opening Services or Service Areas by hover, then moving the cursor down toward a link in the panel, closed the menu before the cursor ever reached it. |
| **Root cause** | `MegaMenu.tsx`'s `onMouseEnter`/`onMouseLeave` sit on the wrapper `<div>`, which should make trigger→panel movement a non-event (both are children of the same hoverable box). But the panel is `position: absolute` (`top-full mt-s2`) — absolute children don't contribute to their parent's layout height, so the `mt-s2` gap between trigger and panel sits outside the wrapper's actual hit-area. The cursor exits that hit-area while crossing the gap, firing `onMouseLeave` — which closed the panel with no grace period — before it ever lands on the panel itself. |
| **Fix** | `onMouseLeave` now schedules the close after `CLOSE_GRACE_MS` (200ms) instead of calling it synchronously, mirroring the existing `HOVER_INTENT_MS` (150ms) open-delay pattern already in the file. `onMouseEnter` clears any pending close. A normal gap transit (well under 200ms) lands back on the trigger or the panel before the timer fires and cancels it; genuinely moving away still closes on schedule. |

**Verified with real mouse events, not a guess and not JS-dispatched
synthetic events** (a first attempt using
`element.dispatchEvent(new MouseEvent('mouseenter'/'mouseover', ...))`
never reached React's handlers at all in testing — React derives
`onMouseEnter`/`onMouseLeave` from native `mouseover`/`mouseout` since the
real enter/leave events don't bubble, and even correctly-constructed
synthetic dispatches didn't reproduce it reliably enough to trust; switched
to Playwright's `.hover()`, which drives genuine OS-level input). Confirmed
both directions: hovering the trigger then hovering a panel link keeps
`aria-expanded="true"` and the panel un-hidden throughout; hovering an
unrelated element far from the menu closes it within the grace window.

Also added a `useEffect` cleanup for the shared hover timer on unmount —
missing before, now both the open-intent and close-grace paths use it.

## Z.31 — J.4 bundle budget revised a second time, for error.tsx

| | |
|---|---|
| **Gap** | No `error.tsx` (page-level) or `global-error.tsx` (root-layout-level) existed anywhere in `app/`. Any unhandled runtime error showed Next's default, unbranded overlay/blank screen instead of an on-brand recovery page — Universal Website Build Checklist Phase 6. |
| **Root cause of the budget hit** | `app/[locale]/error.tsx` must be a Client Component (`'use client'`) — that's a Next.js requirement, not a choice — so its own JS, however small, ships in the client bundle for every route under `[locale]`, not just the error path. First attempt reused the shared `<Section>`/`<SectionHeading>`/`<Button>`/`<HeaderSlot>`/`<SiteFooter>` components for full chrome parity with `NotFoundTemplate`; that alone added ~26KB to the shared chunk because those components (previously rendered server-side everywhere else) got pulled into the client bundle through the error boundary's client-component boundary. Rewritten with plain markup and zero component imports (existing Tailwind utility classes only — zero marginal JS cost), which cut it to ~3.7KB — the floor cost of React's client-side error-boundary runtime itself, not reducible further without dropping the boundary entirely. |
| **Decision** | Owner approved raising `BUDGET_FIRST_LOAD_KB` 220→225 and `BUDGET_SHARED_KB` 210→215 (measured floor with the boundary: 221.6 / 211.9) rather than shipping without a branded error page. Confirmed with the owner directly — not assumed — since J.4 is an explicitly build-blocking, already-once-revised gate. |
| **Scope kept minimal** | Only `app/[locale]/error.tsx` (page-level) + `app/global-error.tsx` (root-layout-level, own `<html>`/`<body>`, inline styles — the root layout that supplies `globals.css` is exactly what this one exists to catch, so it can't depend on it) were added. A third tier — a root-segment `app/error.tsx` to catch `app/[locale]/layout.tsx` failures specifically with full chrome — was prototyped, cost another ~10KB, and was dropped; that failure mode falls through to `global-error.tsx` instead, which is still on-brand, just without the header/footer. |

## Z.32 — §4.11's "page-load only" motion rule lifted; sitewide scroll-reveal, parallax and inertial smooth scroll (owner-requested)

| | |
|---|---|
| **Ask** | Owner referenced the agency's own site, metricfront.netlify.app, and asked for the same premium scroll feel on Apex: Lenis-style smooth (inertial) scroll, content revealing as it scrolls into view rather than only at page load, and parallax depth on decorative imagery. Explicit tool choice: GSAP + ScrollTrigger, even though `framer-motion` is already a dependency (used by `<ReviewsMarquee />`). |
| **Conflict flagged and confirmed before building** | §4.11 as written is a deliberate restraint rule: "Entrance motion is a PAGE-LOAD device, not a scroll device," calling sitewide scroll-triggered fade-ups "the most reliable tell of a templated build." Before touching anything, this was surfaced to the owner directly rather than silently overridden, given three prior scroll-triggered exceptions (`<StatBlock />` count-up, `<MobileStickyBar />` slide-in, `<ProcessStep />` connector fill — Z.21) existed specifically because §4.11 forbade a general mechanism. Owner confirmed: override it. |
| **Mechanism** | `EntranceMotion.tsx` rewritten around gsap + ScrollTrigger + Lenis (previously vanilla JS driving a one-time, above-the-fold-only threshold reveal — see the file's own history). Opt-OUT model, not opt-in: any `<Section />` (all of which already carry `data-ground`) scroll-reveals by default; `<Hero />` alone opts out via `data-motion="none"` since it already animates on page load and is usually on screen at that point. Sections marked `data-entrance` (the prior mechanism's attribute, kept for continuity) get per-child stagger instead of a whole-block fade. `data-parallax="<percent>"` on a decorative element (hero glow, hero/service imagery, `<WhyApexSection />`'s photo) adds an independent scroll-scrubbed depth drift — never on text, so legibility is never in motion. Lenis is wired to GSAP's own ticker (`gsap.ticker.add` → `lenis.raf`, `lagSmoothing(0)`) per the pairing GSAP's docs recommend, not a separate rAF loop. |
| **Bundle budget (J.4)** | gsap + ScrollTrigger + lenis are real weight against a budget with almost no headroom (Z.31 left it at 225 / 215 KB against a measured 221.6 / 211.9 KB floor). `<EntranceMotion />` is never statically imported — `<EntranceMotionLoader />` (new, one-line) wraps it in `next/dynamic(..., { ssr: false })`, the same technique J.6 already used for `<MegaMenu />` / `<MobileNavDrawer />`, so the chunk ships as a separate post-hydration download and isn't counted against first-load JS. `ssr: false` is only legal inside a Client Component, and `app/[locale]/layout.tsx` is a Server Component by design, hence the wrapper rather than calling `dynamic()` at the layout call site directly (this failed the build once, with Turbopack's own error naming the rule, before the wrapper was added). Measured after: 210.2 KB first-load / 200.5 KB shared — both LOWER than the pre-existing floor, confirming the lazy chunk isn't counted at all. |
| **Accessibility (I.8, WCAG 2.3.3) unchanged** | `<EntranceMotion />` still checks `prefers-reduced-motion: reduce` first and returns before touching gsap, ScrollTrigger, or Lenis at all if it matches — same bailout shape as every other motion component in the system. Content renders at its true final state from SSR/CSS either way, so reduced-motion visitors and any visitor whose JS fails to load see the real page, not a hidden one. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate: 21/21 pass; bundle gate: pass, see numbers above), `npx eslint` on every touched file — all clean. Devtools inspection of the live dev server confirmed: off-screen `[data-ground]` sections render `opacity:0` / `translateY(28px)` pre-scroll (the "from" state gsap sets immediately on mount) while `<Hero />` and sections nesting `data-entrance` correctly render at `opacity:1` (excluded from the whole-section fade, avoiding a double-animate); the `EntranceMotion` chunk downloads as its own separate file, confirming the dynamic-import split is real and not just configured; `html.lenis` is present, confirming Lenis initialized. **Not independently confirmed in this pass**: the live opacity 0→1 transition firing on an actual scroll gesture — this agent's browser pane does not composite frames (screenshots and `requestAnimationFrame` both stall in it), so a real scroll-and-watch-it-reveal check couldn't be performed end-to-end here. The wiring matches GSAP's and Lenis's own documented integration recipe exactly; a manual check in a normal browser tab (`npm run dev`, scroll the homepage) is the recommended final confirmation before treating this as fully verified. |

## Z.33 — every heading sitewide was rendering at font-weight 400, not 800 (real bug, not a design opinion)

| | |
|---|---|
| **Trigger** | Owner said the site "doesn't look good" and asked for a design pass referencing two competitor sites (velocityflowinc.com, mechanicalone.com) plus several design-critique skills. Before making any subjective style change, computed styles were pulled from the live homepage to see what was actually rendering, per the standing rule to root-cause with evidence rather than guess. |
| **Finding** | `getComputedStyle` on the homepage's `<h1>`, `<h2>`, and `<h3>` all returned `font-weight: 400` — identical to body text. Every heading on every page was indistinguishable in weight from a paragraph. This is very likely the single biggest reason the whole site read as flat/generic, independent of any color or layout opinion. |
| **Root cause** | `app/globals.css`'s base layer sets `:where(h1, h2, h3, h4, h5, h6) { font-weight: 800; ... }`. `:where()` zeroes selector specificity. `@import 'tailwindcss'` (line 1) pulls in Tailwind v4's own preflight, which resets headings with a plain `h1, h2, h3, h4, h5, h6 { font-weight: inherit; ... }` — a real element selector, specificity 0-0-1. Specificity is compared before source order, so Tailwind's reset won outright regardless of this file's base layer coming later in the same cascade layer. Headings inherited `body`'s 400 weight instead of the intended 800/700. |
| **Fix** | Dropped `:where()` from both heading rules (`:where(h1...)` → `h1, h2, h3, h4, h5, h6`), matching Tailwind's own selector specificity so same-layer source order (this file's rule comes after the imported preflight) decides it correctly. No downside: the only thing `:where()` could have been protecting — a component's own Tailwind utility class overriding the base weight — was never actually coming from the zero specificity; Tailwind's `utilities` cascade layer unconditionally outranks `base` regardless of specificity, so utility overrides still win exactly as before. |
| **Verified** | Computed `font-weight` on `<h1>`/`<h2>`/`<h3>` before: `400/400/400`. After: `800/800/700` (matches the rule's own intent). `npm run build` (contrast gate 21/21, bundle gate pass) and `npx eslint` clean afterward. |

## Z.34 — homepage eyebrow decluttering (9 → 6, only 2 are marketing kickers)

| | |
|---|---|
| **Finding** | The homepage rendered 9 elements with the `.eyebrow` treatment (small uppercase tracked label). Several independently-loaded design-critique skills flag "an eyebrow above every section" as the single most-violated AI-generated-design tell, capping it at roughly one per three sections. |
| **Breakdown** | Of the 9: `<Hero />`'s eyebrow (justified — the one legitimate above-the-fold geo/credential signal), `<LogoStrip />`'s "Brands We Service" and `<SiteFooter />`'s three column headings ("Services" / "Company" / "Service Areas") are a structurally different pattern (the label IS the heading, or a footer nav-group label, not a kicker sitting above a separate real headline) and were left alone. That left four genuine "kicker above a real headline" instances: `<ServicesGrid />` ("WHAT WE DO"), `<WhyApexSection />` ("WHY APEX"), `<ProcessSection />` ("HOW IT WORKS"), `<ReviewsSection />` ("WHAT CUSTOMERS SAY"). |
| **Decision** | Kept `<ProcessSection />`'s "HOW IT WORKS" alongside the hero's — it labels a genuine numbered sequence, the one case the anti-eyebrow rule itself carves out as legitimate. Dropped the other three (`WHAT WE DO`, `WHY APEX`, `WHAT CUSTOMERS SAY`) by no longer passing `eyebrow` from `app/[locale]/(indexed)/page.tsx` to those three components — their headings (`HVAC Service for Every Failure Mode`, `Evidence, not adjectives.`, `Reviews, with the detail that makes them real.`) already read as complete, confident section titles on their own; the eyebrow was decoration, not information. `HOME.services.eyebrow` / `.whyApex.eyebrow` / `.reviews.eyebrow` are left in `lib/content.ts` unused rather than deleted, in case a future template reintroduces them. Net: 2 marketing eyebrows across 8 homepage sections, well inside the roughly-one-per-three budget. |
| **Scope** | Homepage only, per the owner's explicit choice (site-wide asked, homepage-first agreed as the lower-risk first pass). `<LogoStrip />` and `<SiteFooter />` are shared chrome and were not touched. |
| **Brand color** | Explicitly kept `--apex-copper` / `--apex-ink` / `--apex-sage` — not shifted toward either reference site's red accent. Both `velocityflowinc.com` (`#ef0718`) and `mechanicalone.com` (`#ed1d24`) converge on nearly the same red, a generic HVAC-industry cliché; Apex's copper is the more distinctive, already contrast-audited choice, and per this codebase's own redesign discipline a brand that already has a color stays that color unless the owner asks otherwise. |
| **Verified** | `document.querySelectorAll('.eyebrow').length` on the live homepage: 9 before, 6 after (list confirmed: hero, LogoStrip, ProcessSection, and the three footer columns — no stray marketing kickers left). `npm run typecheck` and `npm run build` clean after. |


## Z.35 — <ServiceCard /> gets real photography instead of an icon tile

| | |
|---|---|
| **Trigger** | Owner supplied full-page screenshots of both reference sites (not just the earlier partial DOM inspection) and said the site still hadn't been made more premium. Re-reading the screenshots end to end: both sites' "premium" read comes largely from real photography on every service card, not from icon tiles — the exact pattern this component rendered. |
| **Root cause** | `<Service>` (lib/services.ts) and `<City>` (lib/cities.ts) already carried a real `image` / `imageAlt` / `focalPoint` per entry, used on the detail pages — but `serviceCards()` / `relatedCards()` / `cityCards()` (lib/ui.ts) never passed it through to `<ServiceCard />`, and the component had no image slot at all. The data existed; the card just never read it. |
| **Fix** | `<ServiceCard />` now renders the photo at the top of the card (4:3, `object-position` from `focalPoint`, same gentle hover-zoom `<ProjectCard />` already established) when an `image` is supplied. Icon and photo are never shown together — the icon badge is suppressed whenever a photo is present, since a second visual stacked on a real photo is clutter, not richness. The copper spec-line top border is unchanged; it predates the photography question and is the one ownable brand device (§4.7). `lib/ui.ts`'s three card-prop builders now thread `image`/`imageAlt`/`focalPoint` through. City cards keep `imageAlt=""` (decorative, matching the existing Hero city-variant rule at A.6/H.4.1) rather than inventing alt text. |
| **Hero image — considered, not added** | The owner also asked whether a hero photo (two candidates generated from prompts given this session) should go on the homepage hero. Weighed against §5.3/J.1's LCP-performance decision (H1 text is the homepage's LCP element, zero image payload). Re-examined against the reference screenshots specifically: neither reference actually runs a large photographic hero background either — mechanicalone.com's hero is a plain-background contact form, velocityflowinc.com uses a small inset photo beside the copy, structurally close to Apex's existing QuoteCard slot. Decision: leave the homepage hero as-is; the reference sites' photographic feel comes from their service/feature cards, not their hero, which is exactly what Z.35 addresses. Not a closed door — flagged for the owner if they want it revisited with real LCP measurement. |
| **Verified** | `npm run typecheck` and `npm run build` clean (contrast gate 21/21; bundle gate pass — first-load 210.2→215.4 KB, shared 200.5→205.8 KB, both still comfortably under the 225/215 budget, the `next/image` import in a previously image-free component accounting for the delta). Live dev server: all 6 homepage service cards confirmed rendering their real photo with correct alt text via `next/image`'s optimized URL. |


## Z.36 — new full-bleed photo trust band (fourth distinct layout family on the homepage)

| | |
|---|---|
| **Trigger** | Owner sent a full-page screenshot of the live current homepage alongside both reference sites and said the redesign still hadn't gone far enough — the page still read as card, card, card end to end. |
| **Fix** | New component, `<TrustPhotoBand />`, inserted as 5b (between Why Apex and the financing banner): full-bleed, `about-team-shop-bay.jpg` (a real Apex crew and branded van) as background, flat ink scrim, heading + 3-point checklist + the same `CTA.full` label used everywhere else. A fourth distinct section-layout family alongside the card grids and `<WhyApexSection />`'s image/text split, which is the actual point — repeating one shape end to end is the "Section-Layout-Repetition" tell more than one loaded design-critique skill names directly. |
| **Scrim bug avoided, not just fixed** | First draft used a left-to-right gradient scrim. Caught before shipping by recognizing `<SiteHeader />`'s own Z.20/Z.27 history: that scrim also started as a gradient, and Z.27 is the record of the real owner-reported bug it caused (the gradient didn't reliably cover wherever the content actually sat). This component's text is centered by `container-max` inside a full-bleed section, so its left edge lands at a different fraction of a full-width gradient depending on viewport width — the same failure shape. Switched to a flat, uniform-opacity `bg-apex-ink/80` before it ever shipped, applying the codebase's own prior lesson pre-emptively. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21; bundle gate pass, 215.4/205.8 KB, no change from Z.35's numbers since no new heavy dependency was added), `npx eslint` clean. Live dev server: section renders, image loads via `next/image`, heading computed to `font-weight: 800` (post-Z.33) and near-white against the ink/photo background. |

---

**Note on user-supplied reference images this session**: the owner generated two candidate photos with prompts given earlier in this pass and asked for them to replace `commercial-rooftop-rtu.jpg` and `technician-condenser-repair.jpg`. They were shared as inline chat images, not as files on this machine's filesystem — there is no local path to read them from, so they have not been saved. The owner needs to either save the two files into `public/images/` under those exact names themselves, or share a filesystem path / re-run the generation through a connected tool that writes to disk.


## Z.37 — homepage "Recent work" teaser, real project photography

| | |
|---|---|
| **Trigger** | Owner, after seeing the live redesigned site, said it still read as cheap next to the two references and asked for another pass. |
| **Fix** | New 5a section on the homepage: a three-card teaser pulling from `/projects`'s real completed-work photography, plus a "View All Projects" link. `PROJECTS` moved from an inline array in `app/[locale]/(indexed)/projects/page.tsx` into `lib/projects.ts` (matching `lib/services.ts` / `lib/cities.ts`'s existing one-file-per-content-domain pattern) so the homepage teaser and the full page read the same captions rather than a second, driftable copy. |
| **Placement reasoning** | Sits between `<WhyApexSection />` and `<TrustPhotoBand />`, not next to `<ServicesGrid />` or between `<ProcessSection />`/`<ReviewsSection />` (already two adjacent card grids) — a third card grid in a row would be the exact repetition pattern this redesign pass has been working against. Ground is `"paper"`, deliberately not `"n50"`, because `<WhyApexSection />` immediately above already uses `"n50"`; repeating it would merge the two sections into one band with no visible seam. |
| **Verified** | `npm run typecheck`, `npm run build` (bundle gate pass, unchanged from the prior push since `<ProjectCard />` was already bundled elsewhere), `npx eslint`, `npm run check:emdash` all clean. Confirmed on the live dev server: the homepage teaser renders 3 real photos with correct alt text, and `/projects` itself still renders all 5 after the data move. Pushed (`2c57822..a6188fd`) and live via Vercel auto-deploy. |


## Z.38 — declined a shadcn/framer-motion component dump; polished the native form select and FAQ accordion instead

| | |
|---|---|
| **Ask** | Owner pasted two "shadcn component integration" prompts (a monochrome FAQ block, a custom animated `<select>` replacement) and asked for them to be copy-pasted in verbatim, referencing a screenshot of the native `<select>` popup looking plain. |
| **Declined as-is, explained why** | Neither component fits this codebase. The dropdown component has no real form control at all — div-based options with an onClick handler and no `name` attribute — so nothing about a selection would ever reach `submitLead`'s `FormData` read; wiring it in would silently break the lead form's "Service needed" field, the site's highest-value conversion path. The FAQ component uses generic placeholder copy (not Apex's real, SEO-written FAQ content), a monochrome black/white palette (dropping the copper/ink brand this whole session has been protecting), untyped JS (would fail `tsc --noEmit`), and injects a raw `<style>` tag into `document.head` on mount (an SSR/hydration-mismatch risk in the App Router). The codebase also isn't a shadcn project — it has its own bespoke `<Section>`/`<FormField>`/`<Button>` system, not a `/components/ui` shadcn tree. |
| **Dropdown — owner-confirmed tradeoff, not silently decided** | The part of the screenshot the owner circled (the open option list) is the browser/OS's own native popup rendering — CSS cannot restyle it while keeping a real `<select>`, and `<FormField />`'s own header already documents why it's native-only: "native `<select>` for the dropdowns — no custom listbox (§6.1 item 3)," because mobile is 70-78% of this form's traffic (§1.4) and the OS picker beats any custom overlay there. Asked directly rather than guessing; owner chose to keep native and just polish the trigger. |
| **What shipped instead** | `<FormField />`'s select trigger: `hover:border-n-700` on the control itself, and the chevron now runs through `peer-hover`/`peer-focus` (color shift + 180° rotate on focus) — CSS-only, the `<select>` element and its `name`/`FormData` behavior are completely untouched. `<FAQAccordion />`: the bare +/x glyph now sits in the same 40px circular ring `<ServiceCard />`'s icon badge already uses, filling copper with a white glyph once a question is open — native `<details>`/`<summary>` unchanged (still no hand-rolled ARIA disclosure pattern, per B.31/I.2). |
| **A real Tailwind finding along the way** | First attempt drove the open-state ring/glyph styling with a hand-written `[&[open]_.foo]:` arbitrary variant, then with Tailwind's built-in `group-open:` variant (the documented pattern for exactly a `<details>` parent). Neither actually generated a CSS rule in this project's Tailwind v4 build — checked directly in the served stylesheet both times, not assumed. Fell back to two plain CSS rules in `globals.css` (`.faq-item[open] .faq-icon-ring` / `.faq-icon-glyph`), the same hand-written-CSS approach the file already uses for `.hero-drift` and `.cursor-spotlight`. The selector itself was verified correct via `Element.matches()` (pure DOM/CSSOM, not render-dependent) and by confirming the exact rule text in the served CSS; a live before/after `getComputedStyle` re-render check was attempted but this agent's browser pane doesn't composite frames post-mutation (the same limitation noted in Z.32), so that specific visual confirmation could not be completed here. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass at 215.5/205.8 KB, no meaningful change), `npx eslint`, `npm run check:emdash` all clean. |


## Z.39 — TrustPhotoBand button/sticky-bar collision fixed; MobileNavDrawer visual polish

| | |
|---|---|
| **Bug report** | Owner sent a screenshot showing what looked like two stacked/overlapping orange CTA buttons near the bottom of the viewport on `<TrustPhotoBand />`. |
| **Root cause** | `<TrustPhotoBand />`'s own CTA button (copper, "Get Your Flat-Rate Quote") sat in normal document flow near the bottom of that section. `<MobileStickyBar />` is `position: fixed` at the viewport bottom on every route below `lg`, `z-[var(--z-stickybar)]` (80). Whenever a user scrolled to a point where the section's own button was near the bottom of the viewport, the fixed sticky bar rendered on top of it, and because both use the same copper "quote" styling, it read as a duplicated/glitched button rather than two separate, intentional elements. |
| **Fix** | Removed the CTA button from `<TrustPhotoBand />` entirely rather than repositioning it. It was also genuine redundancy independent of the visual bug: the hero, footer CTA, financing banner, and the always-present sticky bar already own the "get a quote" intent on every scroll position below `lg` — this section's job is the trust checklist, not another conversion ask (the design-critique skills loaded this session name this exact pattern, "No Duplicate CTA Intent"). `cta` is no longer a prop on the component; the page call site no longer passes one. |
| **MobileNavDrawer polish (Z.39, same pass)** | Owner also flagged the mobile nav drawer as "too basic" against a screenshot. Added: a header row with the Apex mark (previously just a bare close button, no brand presence in the panel itself); a background tint + copper text on whichever `<details>` section is currently open, so the active section is visually obvious rather than inferred from the chevron alone; the phone link + CTA footer moved into a bordered, tinted block so it reads as a distinct "always visible" zone instead of trailing off the plain list. The open-chevron rotation and the active-row tint are plain CSS (`.drawer-item[open] ...` in globals.css), not a Tailwind `group-open:`/`[&[open]_...]` variant — both were confirmed not to compile in this project's Tailwind v4 build while working on `<FAQAccordion />` earlier in this session (Z.38), so the same known-working plain-CSS fallback was reused directly rather than re-discovering that dead end. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass, no meaningful change), `npx eslint`, `npm run check:emdash` all clean. |


## Z.40 — four real bugs, owner-reported with screenshots: missing #quote anchor, silently-defaulted selects, touch-stuck marquee

| | |
|---|---|
| **1. "Get Quote" button not working** | Real bug, root-caused by reading code, not guessed. `<QuoteCard />`'s `id="quote"` was hero-variant-conditional (`isHero ? undefined : 'quote'`). The homepage uses the hero variant, and `lib/routes.ts`'s `ROUTES_WITH_FORM` includes `/` — so both `<MobileStickyBar />`'s "Get Quote" and `<Hero />`'s own primary CTA point at `#quote` on the one route that had no element with that id at all. Clicking did nothing: no error, no scroll, silence. Fix: both variants now always carry `id="quote"`. Verified safe against duplicate IDs — `<QuoteCard />` is used in exactly two places (`/`, hero variant; `/contact`, page variant), never both on the same page. |
| **2. "Hero glitch," mobile and lightly desktop** | Investigated directly rather than assumed: tested whether `<SiteHeader />`'s scroll-to-opaque transition was somehow stuck transparent after Z.32's Lenis integration (a real, considered risk) by comparing a scrolled homepage against `/contact`'s always-opaque header — the `bg-apex-paper/95` class computes correctly in both cases, so that mechanism is sound. The screenshots most likely show ordinary content passing behind the always-present `<MobileStickyBar />` while scrolling, which happens throughout the whole page by design (any fixed bottom bar does this) and is not unique to the hero. Not treated as a separate bug beyond fix #1: once `#quote` actually resolves, the confusing "nothing happens, page looks stuck" impression the screenshots convey should resolve with it. |
| **3. Form dropdowns silently defaulted** | Real bug, screenshot showed "AC Repair & Diagnostics" pre-selected with a filled radio dot on first open. A native `<select>` with no option marked `selected` and no `defaultValue` just shows its first `<option>` — so every visitor who never touched the dropdown silently submitted "AC Repair & Diagnostics" as their service, regardless of their actual issue, a real lead-routing/data-quality problem, not just a visual one. `<FormField />` gained a `placeholder` prop (kind="select" only): renders a disabled, empty-value first option, and the field starts on it whenever no real `defaultValue` is supplied. Applied to both selects in the codebase — the quote form's "Service needed" ("Select a service") and the callback form's "Best time to call" ("Select a time", which had the same silent-default shape: "Morning" was first in the list and would otherwise win by default). The service field's Zod schema (`z.enum(SERVICE_SLUGS)`) means an unselected submission now actually fails validation instead of silently succeeding with a wrong value. |
| **4. Manufacturer logo marquee freezing on touch** | Real bug, confirmed against the exact same class of issue `.cursor-spotlight` was already written to avoid a few utilities above it in the same file. `.apex-logo-viewport:hover .apex-logo-track { animation-play-state: paused; }` had no `(hover: hover)` guard. Touch browsers simulate a lingering `:hover` state on tap with no real "pointer left" event to clear it, so tapping the strip on a phone froze the marquee until the next unrelated tap elsewhere on the page. Gated the `:hover` rule behind `@media (hover: hover)`; `:focus-within` stays ungated since a real keyboard focus state reverses cleanly on blur and doesn't linger the way touch-simulated hover does. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass, no meaningful change), `npx eslint`, `npm run check:emdash` all clean. Confirmed on a fresh (non-mutated, so trustworthy in this agent's browser pane) page load: `document.getElementById('quote')` resolves on both `/` and `/contact` with no duplicate; the service select's `selectedIndex` is `0` on its own disabled placeholder with `value=""`, not a real service. |


## Z.41 — flash-of-hidden-content on already-visible sections (the persistent "hero glitch" report)

| | |
|---|---|
| **Report** | Owner said the hero glitch was STILL happening after Z.40, described more precisely this time: "image dikhi, phir load ho raha hai" (an image shows, then it reloads/reappears). |
| **Root cause** | `gsap.from()` defaults to `immediateRender: true` — the instant a tween is created, it snaps its target to the declared "from" values (`opacity: 0` here), before ScrollTrigger evaluates whether that trigger's start line has already been crossed. `<EntranceMotion />` is a `dynamic(..., { ssr: false })` chunk (Z.32, for the bundle budget), so it always finishes loading and executes some time AFTER first paint — meaning any section that was ALREADY on screen at that moment (fully visible, correct, since the browser already painted it from plain SSR/CSS) got yanked to `opacity: 0` for a frame the instant the script ran, then ScrollTrigger immediately fired its already-past-the-line "play" and snapped it back to `opacity: 1`. That flash (visible → hidden → visible again) is exactly what "image shows, then reloads" describes. |
| **Fix** | Added `isAlreadyRevealed(el)`, checked before creating EITHER kind of reveal tween (the `[data-entrance]` stagger-container loop and the generic `[data-ground]` whole-section loop): if the element's `getBoundingClientRect().top` is already above the same `top 85%` line ScrollTrigger itself uses, no tween is created for it at all — it's left exactly as SSR rendered it (`opacity: 1`, no transform), permanently. Only genuinely below-the-fold-at-mount content gets the reveal animation, which is the only case where the animation was ever visible to begin with. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass, no change), `npx eslint`, `npm run check:emdash` all clean. On `/services/ac-repair`'s live dev server, checked ~1.5s after load (past the point the EntranceMotion chunk would have loaded and run): the hero (`data-motion="none"`) sits at `opacity: 1` as expected, and every other section on that page is genuinely far below the fold (`top` values in the thousands of pixels) and correctly still at `opacity: 0`, armed for scroll — none of them show the flash pattern, and the fix's branch (skip-if-already-revealed) is confirmed correct by code review even though this particular page didn't have a section sitting exactly on the fold line to exercise it visually. |


## Z.42 — favicon carries the real brand mark's copper accent

| | |
|---|---|
| **Report** | Owner: "favicon per logo fix karo" — the favicon read as generic/unbranded next to the real two-tone mark used everywhere else on the site. |
| **What it actually was** | Not a bug — a deliberate, documented engineering decision in `scripts/build-logo.mjs` (Appendix E, single geometry source for every logo/icon asset): "A favicon is not a scaled-down logo... No copper at favicon scale," reduced to the two heaviest strokes to survive a stated 16x16 acceptance test (avoid reading as a grey blob). Verified by reading the script and comparing `favicon.svg` against `logo-mark.svg` directly rather than assuming. |
| **Change** | Reversed the "no copper" rule specifically, keeping everything else about the reduction (still exactly two strokes, same widths, same acceptance test): the bar stroke (the shorter of the two, so the smaller colored area, keeping the mark tab-scale-legible) now renders in copper instead of ink, matching the real mark's copper-accent-plus-ink-mountain pattern. Changed in the shared generator (`faviconSvg()` and `faviconRaster()` in `scripts/build-logo.mjs`), then regenerated every derived asset via `npm run assets:logo` (`favicon.svg`, `favicon.ico`) rather than hand-editing the SVG/ICO files directly, so the single-source-of-truth pipeline stays intact. |
| **Verified** | `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass, unrelated to JS bundle anyway) all clean. `favicon.svg` inspected directly post-regeneration: chevron path still `#0A1421`/`#FAF8F4` (light/dark swap unchanged), bar path now `#AD5622` (copper), unconditional across both color schemes. |


## Z.43 — THE hero bug: `<Section>` silently dropped `className` on full-bleed, so TrustPhotoBand's image escaped to the top of the document

| | |
|---|---|
| **Report** | Owner, three separate times across this session, with a mobile screenshot that finally made it unambiguous: the crew photo from `<TrustPhotoBand />` (a mid-page band) was rendering **over the hero at the top of the page** on load, then disappearing once the page settled. Described as "image aati hai, phir form aata hai." Earlier passes (Z.39, Z.41) fixed real but *different* problems and did not touch this one. |
| **Root cause** | `<Section>`'s `className` prop was applied **only to the inner `<div>`** — and `width="full-bleed"` does not render that inner div, it returns `children` directly. So for every full-bleed section, the caller's `className` was **silently discarded**. `<TrustPhotoBand />` passes `relative overflow-hidden` specifically so its `<Image fill>` (which renders as `position: absolute; inset: 0`) has a positioned containing block. With the class dropped, the section stayed `position: static`, and — confirmed by walking the live ancestor chain — `<main>` and `<body>` are static with no transform either. With no positioned ancestor anywhere, the absolutely-positioned image resolved against the **initial containing block**: the top-left of the document. It painted the crew photo across the hero on every single load. |
| **Why it "fixed itself" a second later, and why every measurement looked fine** | `<EntranceMotion />`'s reveal tween puts a `transform` on the section, and a transform incidentally creates a containing block for absolute descendants. So the moment the lazily-loaded GSAP chunk ran, the image snapped into its section. That is the "phir form aata hai" half of the report, and it is also why every devtools measurement taken *after* the page settled showed the image correctly positioned — the live check that finally caught it was reading `position` on the section (`static`) and seeing the only thing containing the image was a GSAP `matrix(...)`. |
| **Fix** | `Section.tsx`: when `isFullBleed`, `className` now goes on the section element itself (there is no inner container to receive it). One line, plus the prop's doc comment updated to state where the class lands per `width`, so the next full-bleed section with a background layer does not rediscover this. |
| **Verified — at the layer the bug actually lived in** | The decisive check is the **raw SSR HTML**, since the bug's whole window was "before JavaScript runs." `curl` of the homepage now returns the section as `class="bg-apex-ink ... py-s7 lg:py-s8 relative overflow-hidden"` — the containing block exists in the very first painted markup, independent of GSAP entirely. Previously those two classes were absent from that string. Also: `npm run typecheck`, `npm run build` (contrast gate 21/21, bundle gate pass, unchanged), `npx eslint`, `npm run check:emdash` all clean. |

## Z.43b — favicon is now the real mark, not an abstraction of it

| | |
|---|---|
| **Ask** | Owner asked twice for "my logo on the favicon." Z.42 had added copper to the two-stroke reduction, which was not what they meant. |
| **Change** | Dropped E.2's "a favicon is not a scaled-down logo" reduction entirely. `faviconSvg()` and `faviconRaster()` now draw the same `INK_PATHS` + `COPPER_PATHS` every other asset in `scripts/build-logo.mjs` uses, centred in a square viewBox (`-2 -8 104 104`) so the mark fills the icon instead of sitting in letterbox bars. Tab icon, header lockup, app icons and OG image are finally one shape. Regenerated through `npm run assets:logo` so the single-geometry-source pipeline stays intact — no hand-edited SVG or ICO. |
| **Tradeoff, stated not hidden** | Five strokes at 16x16 is genuinely tighter than two; that was the original reduction's whole point. It reads correctly at 32 and 48 (both shipped in the .ico) and on any HiDPI tab strip, where the SVG is used instead. Documented in the script: if the 16px frame ever looks muddy, drop 16 from the ICO size loop so browsers downscale the 32px frame, rather than re-abstracting the mark again. |
| **Verified** | `favicon.svg` inspected post-regeneration: identical path data to `logo-mark.svg` (3 copper bars at stroke 9, 2 nested ink chevrons at stroke 11), light/dark ground swap preserved. `favicon.ico` grew 2.1 KB → 3.1 KB, consistent with the added strokes. |
