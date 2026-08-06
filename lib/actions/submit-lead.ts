'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { SERVICE_SLUGS } from '@/lib/services';
import { FORM_MESSAGES } from '@/lib/form-messages';
import { recordLead } from '@/lib/supabase';
import { businessNotificationHtml, customerConfirmationHtml } from '@/lib/email-templates';

/**
 * Appendix G — the Server Action.
 *
 * Two forms ship at v1 and share ONE action, one validation schema family and
 * one transport (G.0):
 *   Quote    <QuoteCard />    Service Needed, Name, Phone, Zip (+ optional Email, Z.26)
 *   Callback <CallbackForm /> Name, Phone, Best time to call (+ optional Email, Z.26)
 *
 * FIELD COUNT IS LOCKED (§3.4). The quote form stays at exactly four required
 * fields, the callback form at exactly three. Do not expand either — every
 * additional field costs roughly 10% of submissions.
 *
 * `callbackSchema` below still accepts an optional `message`, matching an
 * earlier draft of this comment that listed it as a real field. No form
 * actually renders that textarea (found during an audit pass, not by
 * design), so it stays permanently undefined in production. Left in the
 * schema rather than removed, since deleting it would be a silent contract
 * change for the email template that already reads `lead.message`, and
 * `.optional()` means it costs nothing to leave.
 *
 * TRANSPORT (G.3, reordered by Z.26): Server Action → Supabase (`leads`) →
 * business notification email → customer confirmation email (only if an
 * email was given) → /thank-you redirect. NO CLIENT-SIDE API KEYS, ever.
 *
 * Z.26 flips G.3's original priority on owner instruction: "email fail ho to
 * bhi DB save honi chahiye, DB fail ho to email na jaye." The database write
 * is now the step the pipeline requires — it runs first and its failure is
 * what returns G.2's submission error. Both emails are best-effort after
 * that: each is wrapped in its own try/catch, logs on failure, and never
 * turns into a user-facing error once the lead is safely in the database.
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

/**
 * Z.26 — OPTIONAL. Empty string transforms to undefined rather than failing
 * validation, since the field itself is optional on both forms.
 */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v.length ? v : undefined))
  .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Enter a valid email address.',
  })
  .optional();

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
  email: emailSchema,
  zip: zipSchema,
});

const callbackSchema = z.object({
  formType: z.literal('callback'),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
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

/**
 * Z.26 — best-effort by design. Never throws: a Resend outage or missing
 * config must not turn a lead that already saved to Supabase into a G.2
 * error for the customer. Logged, not surfaced.
 */
async function sendBusinessNotification(
  lead: Parameters<typeof businessNotificationHtml>[0]
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DISPATCH_INBOX;

  if (!apiKey || !to) {
    console.info('[submit-lead] business notification not configured; lead saved regardless:', lead);
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const subject = lead.outOfArea
      ? `[OUT OF AREA] New lead: ${lead.name}`
      : `New lead: ${lead.name}`;

    await resend.emails.send({
      // No verified sending domain yet (Z.26) — Resend's own test sender,
      // which only delivers to the Resend account owner's address, until
      // apexcomfortsystems.com is verified. Swap DISPATCH_FROM once it is.
      from: process.env.DISPATCH_FROM ?? 'Apex Comfort Systems <onboarding@resend.dev>',
      to,
      subject,
      html: businessNotificationHtml(lead),
    });
  } catch (error) {
    console.error(
      '[submit-lead] business notification failed (non-fatal, lead already saved):',
      error instanceof Error ? error.message : error
    );
  }
}

/** Best-effort, and only attempted when the customer gave an email. */
async function sendCustomerConfirmation(name: string, email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[submit-lead] customer confirmation not configured; skipped for', email);
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.DISPATCH_FROM ?? 'Apex Comfort Systems <onboarding@resend.dev>',
      to: email,
      subject: 'We got your request: Apex Comfort Systems',
      html: customerConfirmationHtml({ name }),
    });
  } catch (error) {
    console.error(
      '[submit-lead] customer confirmation failed (non-fatal):',
      error instanceof Error ? error.message : error
    );
  }
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
  const formLocation = String(formData.get('formLocation') ?? 'unknown');

  /*
   * Z.26 — Supabase is now the step that must succeed (owner instruction:
   * "database save fail ho to email bhi send na ho"). Runs first and
   * blocking; its failure is what returns G.2's submission error, exactly
   * where the old Resend-throw branch used to sit.
   */
  try {
    await recordLead({
      form_type: data.formType,
      form_location: formLocation,
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.formType === 'quote' ? data.service : undefined,
      zip: data.formType === 'quote' ? data.zip : undefined,
      out_of_area: outOfArea,
      best_time: data.formType === 'callback' ? data.bestTime : undefined,
      message: data.formType === 'callback' ? data.message : undefined,
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
      values: echoValues(formData),
    };
  }

  /*
   * Both emails are best-effort from here (Z.26): "email fail ho jaye to bhi
   * lead database mein save honi chahiye" — it already is, so neither of
   * these can turn into a user-facing failure. Each catches its own errors
   * internally; awaited so the redirect below reflects real completion, not
   * fire-and-forget.
   */
  await sendBusinessNotification({
    formType: data.formType,
    name: data.name,
    phone: data.phone,
    email: data.email,
    service: data.formType === 'quote' ? data.service : undefined,
    zip: data.formType === 'quote' ? data.zip : undefined,
    outOfArea,
    bestTime: data.formType === 'callback' ? data.bestTime : undefined,
    message: data.formType === 'callback' ? data.message : undefined,
  });

  if (data.email) {
    await sendCustomerConfirmation(data.name, data.email);
  }

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
