/**
 * G.2 — submission-level failure messages.
 *
 * These live OUTSIDE lib/actions/submit-lead.ts on purpose: a `'use server'`
 * module may only export async functions, so a shared constant declared there
 * breaks the build (TypeScript does not catch it — it is a bundler rule).
 *
 * "A FORM FAILURE MUST NEVER BECOME A DEAD END", and the phone number in the
 * message has to be a LIVE tel: link. A Server Action cannot return JSX, and
 * §9.1's binding rule says no component may render a phone number except
 * through <PhoneLink />. So each message carries a {phone} token and
 * <FormError /> splits on it, dropping a real <PhoneLink /> into the gap.
 *
 * Four failure branches, four different instructions. Showing the transport
 * message to a rate-limited user points them at the wrong remedy.
 */
export const PHONE_TOKEN = '{phone}';

export const FORM_MESSAGES = {
  /** G.4 layer 2 — time-to-submit floor. */
  tooFast: 'That submission came through too quickly. Try again.',

  /** G.4 layer 3 — Turnstile verification failed. */
  verification: "We couldn't verify that submission. Please try again.",

  /** G.4 layer 4 — IP rate limit. Sends them to the phone, which still works. */
  rateLimit: `Too many requests from this connection. Call us at ${PHONE_TOKEN} and we'll take the details directly.`,

  /** G.3 — transport failed. The likeliest real-world failure. */
  transport: `We couldn't send that. Call us at ${PHONE_TOKEN} — we're open now.`,

  /** Field-level validation. The per-field messages carry the detail. */
  fieldErrors: 'Check the highlighted fields.',
} as const;
