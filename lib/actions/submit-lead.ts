'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { SERVICE_SLUGS } from '@/lib/services';
import { FORM_MESSAGES } from '@/lib/form-messages';
import { recordLead } from '@/lib/supabase';

/**
 * Appendix G — the Server Action.
 *
 * Two forms ship at v1 and share ONE action, one validation schema family and
 * one transport (G.0):
 *   Quote    <QuoteCard />    Service Needed, Name, Phone, Zip
 *   Callback <CallbackForm /> Name, Phone, Best time to call, Message
 *
 * FIELD COUNT IS LOCKED (§3.4). The quote form stays at exactly four fields.
 * Do not expand it — every additional field costs roughly 10% of submissions.
 *
 * TRANSPORT (G.3): Server Action → transactional email (Resend) → dispatch
 * inbox. The action returns a typed result; NO CLIENT-SIDE API KEYS, ever.
 * On success it redirects to /thank-you?service=<slug>, which is the only
 * pattern that gives GA4 and Google Ads a real destination conversion.
 */

/* -------------------------------------------------------------------------
   G.1 — fields and validation
   ------------------------------------------------------------------------- */

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your name.')
  .max(60, 'That name is too long.')
  // Strip HTML server-side (G.1).
  .transform((v) => v.replace(/<[^>]*>/g, ''));

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter a phone number so we can call you back.')
  .transform((v, ctx) => {
    const parsed = parsePhoneNumberFromString(v, 'US');
    if (!parsed || !parsed.isValid() || parsed.country !== 'US') {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid 10-digit US phone number.',
      });
      return z.NEVER;
    }
    return parsed.format('E.164');
  });

const zipSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Enter a 5-digit ZIP code.');

const messageSchema = z
  .string()
  .trim()
  .max(1000, 'Keep it under 1000 characters.')
  .transform((v) => v.replace(/<[^>]*>/g, ''))
  .optional();

const quoteSchema = z.object({
  formType: z.literal('quote'),
  service: z.enum(SERVICE_SLUGS),
  name: nameSchema,
  phone: phoneSchema,
  zip: zipSchema,
});

const callbackSchema = z.object({
  formType: z.literal('callback'),
  name: nameSchema,
  phone: phoneSchema,
  bestTime: z.enum(['morning', 'afternoon', 'evening', 'any']),
  message: messageSchema,
});

const leadSchema = z.discriminatedUnion('formType', [quoteSchema, callbackSchema]);

/**
 * Phoenix metro ZIP prefixes. Out-of-area ZIPs SUBMIT SUCCESSFULLY and route
 * normally — NEVER BLOCK A LEAD (G.1, §9.3a). They are tagged so dispatch
 * knows before calling.
 */
const METRO_ZIP_PREFIXES = ['850', '851', '852', '853'];

function isOutOfArea(zip: string | undefined): boolean {
  if (!zip) return false;
  return !METRO_ZIP_PREFIXES.some((prefix) => zip.startsWith(prefix));
}

/* -------------------------------------------------------------------------
   G.4 — spam protection. All four layers, not optional and not substitutable.
   ------------------------------------------------------------------------- */

/** Layer 2 — reject any submission arriving under 2 seconds from form mount. */
const MIN_SUBMIT_MS = 2000;

/** Layer 4 — 5 submissions per 10 minutes per IP, enforced server-side. */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const rateBuckets = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  rateBuckets.set(ip, hits);
  return hits.length > RATE_LIMIT.max;
}

/** Layer 3 — Cloudflare Turnstile, invisible mode. */
async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Not configured (local development): the other three layers still apply.
  if (!secret) return true;
  if (!token) return false;

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
      }
    );
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------
   Transport
   ------------------------------------------------------------------------- */

async function sendToDispatch(lead: Record<string, string | boolean>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DISPATCH_INBOX;

  if (!apiKey || !to) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Transactional email is not configured.');
    }
    // Local development: the pipeline is exercised without a live provider.
    console.info('[submit-lead] dispatch email not configured; lead:', lead);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const rows = Object.entries(lead)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');

  const subject = lead.outOfArea
    ? `[OUT OF AREA] New lead: ${lead.name}`
    : `New lead: ${lead.name}`;

  await resend.emails.send({
    from: process.env.DISPATCH_FROM ?? 'leads@apexcomfortsystems.com',
    to,
    subject,
    text: rows,
  });
}

/* -------------------------------------------------------------------------
   Action
   ------------------------------------------------------------------------- */

/**
 * G.2 — "Error — submission: Field group stays populated."
 *
 * React 19 resets a form after its action runs, so on any failure the user's
 * typed values would be wiped — which on the primary conversion mechanism is
 * a lead thrown away over a typo'd digit. Every failure branch therefore
 * echoes the submitted values back, and the fields re-populate from them.
 *
 * Free-text message content is echoed too (it is the user's own text going
 * straight back to the user's own screen); it is only excluded from the
 * sessionStorage persistence in §6.2's redundant-entry rule.
 */
export type LeadValues = Record<string, string>;

export type LeadResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      values?: LeadValues;
    };

/** Echoes back what the user typed, minus the machinery fields. */
function echoValues(formData: FormData): LeadValues {
  const skip = new Set([
    'formType',
    'formLocation',
    'mountedAt',
    'company', // honeypot — never echoed
    'cf-turnstile-response',
  ]);
  const values: LeadValues = {};
  for (const [key, value] of formData.entries()) {
    if (skip.has(key) || typeof value !== 'string') continue;
    values[key] = value.replace(/<[^>]*>/g, '').slice(0, 1000);
  }
  return values;
}

export async function submitLead(
  _prev: LeadResult | null,
  formData: FormData
): Promise<LeadResult> {
  const { headers } = await import('next/headers');
  const headerList = await headers();
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'unknown';

  /* Layer 1 — honeypot. Any value at all means a bot filled a field a human
     cannot see. Fail silently as success so the bot does not learn. */
  if ((formData.get('company') as string | null)?.trim()) {
    redirect('/thank-you?service=general');
  }

  /* Layer 2 — time-to-submit floor. */
  const mountedAt = Number(formData.get('mountedAt'));
  if (Number.isFinite(mountedAt) && Date.now() - mountedAt < MIN_SUBMIT_MS) {
    return {
      ok: false,
      error: FORM_MESSAGES.tooFast,
      values: echoValues(formData),
    };
  }

  /* Layer 4 — IP rate limit. */
  if (rateLimited(ip)) {
    return {
      ok: false,
      error: FORM_MESSAGES.rateLimit,
      // A rate-limited person is told to call instead, but they may well wait
      // out the window and retry in the same tab — so their typing survives
      // here too (G.2). This is also the branch a shared office or mobile NAT
      // IP hits soonest, where the submitter is a real customer, not a bot.
      values: echoValues(formData),
    };
  }

  /* Layer 3 — Turnstile. */
  const turnstileOk = await verifyTurnstile(
    formData.get('cf-turnstile-response') as string | undefined,
    ip
  );
  if (!turnstileOk) {
    return {
      ok: false,
      error: FORM_MESSAGES.verification,
      values: echoValues(formData),
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: FORM_MESSAGES.fieldErrors,
      fieldErrors,
      values: echoValues(formData),
    };
  }

  const data = parsed.data;
  const zip = data.formType === 'quote' ? data.zip : undefined;
  const outOfArea = isOutOfArea(zip);

  try {
    await sendToDispatch({
      ...data,
      outOfArea,
      formLocation: String(formData.get('formLocation') ?? 'unknown'),
      submittedAt: new Date().toISOString(),
    });
  } catch {
    /*
     * G.2 — submission error. The field group stays populated and an inline
     * role="alert" message appears ABOVE the submit button. A FORM FAILURE
     * MUST NEVER BECOME A DEAD END, so the message carries a live tel: link.
     */
    return {
      ok: false,
      error: FORM_MESSAGES.transport,
      // Transport failure is the likeliest real-world failure of the four, so
      // this is the branch where losing the user's typing hurts most (G.2).
      values: echoValues(formData),
    };
  }

  /*
   * ADDITION beyond the blueprint (Z.18): a persistent, queryable copy in
   * Supabase alongside the Resend email above. Fired AFTER the email send has
   * already succeeded, and never awaited into the failure path — a Supabase
   * outage must not turn into a G.2 "we couldn't send that" for a lead the
   * dispatch inbox already received. recordLead() never throws; this is
   * belt-and-suspenders, not a second point of failure.
   */
  void recordLead({
    form_type: data.formType,
    form_location: String(formData.get('formLocation') ?? 'unknown'),
    name: data.name,
    phone: data.phone,
    service: data.formType === 'quote' ? data.service : undefined,
    zip: data.formType === 'quote' ? data.zip : undefined,
    out_of_area: outOfArea,
    best_time: data.formType === 'callback' ? data.bestTime : undefined,
    message: data.formType === 'callback' ? data.message : undefined,
  });

  /*
   * G.7 — the thank-you page states "a dispatcher will call you at [masked
   * phone]". The phone is masked to its LAST FOUR DIGITS, and the full number
   * is NEVER reflected into a URL or into the page. A short-lived httpOnly
   * cookie carries the four digits to the confirmation render, which is the
   * only way to satisfy both halves of that rule.
   */
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('apex_lead_last4', data.phone.slice(-4), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });

  /*
   * G.3 — on success, redirect. The callback form has no service field, so it
   * redirects with ?service=general, which is a real row in G.7's contextual
   * link table (Appendix Z).
   */
  const slug = data.formType === 'quote' ? data.service : 'general';
  redirect(`/thank-you?service=${slug}`);
}
