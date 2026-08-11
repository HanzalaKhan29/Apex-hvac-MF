import Script from 'next/script';

/**
 * G.4 layer 3 — the Cloudflare Turnstile widget.
 *
 * Z.45 (Appendix Z) — THIS COMPONENT DID NOT EXIST, and that was a latent
 * production outage, not a cosmetic gap.
 *
 * `submitLead`'s `verifyTurnstile()` has always read `TURNSTILE_SECRET_KEY`
 * and, when that secret is present, rejected any submission without a
 * `cf-turnstile-response` token. But nothing anywhere rendered a widget, so
 * that token could never exist. The moment anyone set `TURNSTILE_SECRET_KEY`
 * in the Vercel environment — which `.env.example` actively invites, and
 * which the project's own notes list as a pending task — EVERY lead
 * submission on the site would have failed closed on the verification
 * branch. The site's entire conversion path, dead, from setting one
 * documented env var.
 *
 * The rest of the integration was already in place: `next.config.ts`'s CSP
 * allows `challenges.cloudflare.com` in `script-src`, `connect-src` and
 * `frame-src`, and the COOP header comment already anticipates the widget's
 * popup path. Only the render was missing.
 *
 * RENDERS NOTHING UNLESS `NEXT_PUBLIC_TURNSTILE_SITE_KEY` IS SET. That is
 * deliberate and load-bearing: it keeps current production behaviour bit-for-
 * bit unchanged (the key is unset today), and it means the widget and the
 * server-side enforcement switch on together rather than one without the
 * other — which is the exact failure this component exists to close.
 *
 * `interaction-only` is Turnstile's current equivalent of the "invisible"
 * mode `submitLead` describes: the challenge stays hidden and only surfaces
 * if Cloudflare decides this visitor needs to interact.
 *
 * The script injects a hidden `<input name="cf-turnstile-response">` into the
 * enclosing <form>, which is why this must be rendered INSIDE the form
 * element — that is how the token reaches the Server Action's FormData.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function TurnstileWidget() {
  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        id="cf-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={SITE_KEY}
        data-appearance="interaction-only"
        data-response-field-name="cf-turnstile-response"
      />
    </>
  );
}
