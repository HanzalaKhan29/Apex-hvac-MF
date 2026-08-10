'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { submitLead, type LeadResult } from '@/lib/actions/submit-lead';
import { SERVICE_LIST, type ServiceSlug } from '@/lib/services';
import { useSessionPrefill } from '@/lib/use-session-prefill';
import { track } from './Analytics';
import FormField from './FormField';
import ConsentNotice from './ConsentNotice';
import FormError from './FormError';

/**
 * B.11 — <QuoteCard />
 *
 * THE PRIMARY CONVERSION MECHANISM. Exactly four fields — Service Needed,
 * Name, Phone, Zip (§3.4). DO NOT EXPAND IT; every additional field costs
 * roughly 10% of submissions (§1.4).
 *
 * VARIANTS
 *   hero — elevated card at --r-2xl with --shadow-lg, header "Get Your
 *          Flat-Rate Quote", sub "No obligation · Upfront pricing · Response
 *          within 30 minutes". That is the "Respond" term per §2.5's
 *          vocabulary table, never blended with dispatch or same-day.
 *   page — same fields, flat on --apex-paper inside a <Section />.
 *
 * id="quote" (Z.40 fix, real bug): BOTH variants carry it. It was
 * hero-variant-conditional before — `isHero ? undefined : 'quote'` — which
 * meant the homepage, the one route where <MobileStickyBar />'s "Get Quote"
 * and <Hero />'s own primary CTA BOTH point at `#quote` (lib/routes.ts's
 * `ROUTES_WITH_FORM` includes `/`), had no element with that id at all.
 * Clicking either button did nothing — no scroll, no error, just silence.
 * Confirmed by reading the id logic and ROUTES_WITH_FORM together, not by
 * guessing from the symptom.
 *
 * RESPONSIVE (B.11, H.5.8): at md+ Service and Zip share a row while Name and
 * Phone stay full-width; below md all four are full-width. The submit button is
 * always full-width. Field height and padding are constant across breakpoints
 * so the card's height does not shift.
 *
 * ACCESSIBILITY (§9.3a, §6.2, G.6): real associated labels always visible above
 * each field — never placeholder-as-label. Errors carry aria-invalid,
 * aria-describedby and role="alert". Submit is aria-busy while pending with the
 * label changing to "Sending…"; it STAYS FOCUSABLE and never shifts position
 * (CLS). Fields become readonly rather than disabled during submission, so
 * their values stay announceable (G.2, Appendix Z).
 */

export interface QuoteCardProps {
  variant?: 'hero' | 'page';
  formLocation: 'hero' | 'contact' | 'service-page';
  defaultService?: ServiceSlug;
}

const SERVICE_OPTIONS = SERVICE_LIST.map((service) => ({
  value: service.slug,
  label: service.cardTitle,
}));

export default function QuoteCard({
  variant = 'hero',
  formLocation,
  defaultService,
}: QuoteCardProps) {
  const [state, formAction, pending] = useActionState<LeadResult | null, FormData>(
    submitLead,
    null
  );

  const { prefill, hasPrefill, remember, clear } = useSessionPrefill();
  const [mountedAt] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  // §8.6 — form_start fires on FIRST focus in any field.
  const onFocusCapture = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track('form_start', { form_location: formLocation });
  };

  // §8.6 — form_error fires on server-side validation failure.
  /*
   * Web Interface Guidelines: focus the first errored field on a failed
   * submit. Without it a keyboard or screen-reader user is left at the submit
   * button with the error announced but no idea which field to correct, and
   * on mobile the offending field may be off-screen entirely.
   *
   * The global scroll-margin-block rule (I.3) means focusing it also scrolls
   * it clear of the sticky header and the sticky bar (2.4.11).
   */
  useEffect(() => {
    if (!state || state.ok || !state.fieldErrors) return;
    const first = Object.keys(state.fieldErrors)[0];
    if (!first) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${first}"]`)
      ?.focus();
  }, [state]);

  useEffect(() => {
    if (state && !state.ok) {
      track('form_error', {
        form_location: formLocation,
        field: state.fieldErrors ? Object.keys(state.fieldErrors)[0] : 'form',
      });
    }
  }, [state, formLocation]);

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  /*
   * G.2 — the field group stays populated on failure. React 19 resets a form
   * after its action runs, so without this a typo'd digit would wipe
   * everything the user typed. Echoed values win over the sessionStorage
   * prefill, since they are what this person just entered.
   */
  const echoed = state && !state.ok ? (state.values ?? {}) : {};
  const initial = (field: string, fallback?: string) => echoed[field] ?? fallback;

  const isHero = variant === 'hero';

  return (
    <div
      id="quote"
      className={
        isHero
          ? 'rounded-2xl bg-apex-paper p-s4 text-n-950 shadow-lg md:p-s5 [--accent:var(--color-apex-copper)]'
          : 'rounded-2xl border border-n-200 bg-apex-paper p-s4 md:p-s5'
      }
    >
      <h2 className="text-h3 text-apex-ink">Get Your Flat-Rate Quote</h2>
      <p className="mt-s1 text-small text-n-700">
        No obligation · Upfront pricing · Response within 30 minutes
      </p>

      <form
        ref={formRef}
        action={formAction}
        onFocusCapture={onFocusCapture}
        onSubmit={() => {
          const data = new FormData(formRef.current!);
          remember({
            name: String(data.get('name') ?? ''),
            phone: String(data.get('phone') ?? ''),
            zip: String(data.get('zip') ?? ''),
            email: String(data.get('email') ?? ''),
          });
        }}
        className="mt-s4 flex flex-col gap-s3"
      >
        <input type="hidden" name="formType" value="quote" />
        <input type="hidden" name="formLocation" value={formLocation} />
        <input type="hidden" name="mountedAt" value={mountedAt} />

        {/* G.4 layer 1 — honeypot. Off-screen via a class, NOT display:none,
            which some bots detect and skip. */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="company-field">Company</label>
          <input id="company-field" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-s3 md:grid-cols-2">
          <div className="md:col-span-1">
            <FormField
              /* An uncontrolled <select> only honours defaultValue on mount,
                 so on a re-render after a failed submit it snaps back to the
                 first option. Keying it on the echoed value remounts the
                 control, which keeps the selection the user made (G.2). */
              key={`service-${initial('service', defaultService) ?? ''}`}
              kind="select"
              name="service"
              label="Service needed"
              required
              readOnly={pending}
              defaultValue={initial('service', defaultService)}
              placeholder="Select a service"
              options={SERVICE_OPTIONS}
              error={errors.service}
            />
          </div>
          <div className="md:col-span-1">
            <FormField
              kind="text"
              name="zip"
              label="ZIP code"
              required
              readOnly={pending}
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              spellCheck={false}
              defaultValue={initial('zip', prefill.zip)}
              error={errors.zip}
            />
          </div>
        </div>

        <FormField
          kind="text"
          name="name"
          label="Name"
          required
          readOnly={pending}
          autoComplete="name"
          maxLength={60}
          defaultValue={initial('name', prefill.name)}
          error={errors.name}
        />

        <FormField
          kind="tel"
          name="phone"
          label="Phone"
          required
          readOnly={pending}
          inputMode="tel"
          autoComplete="tel"
          spellCheck={false}
          defaultValue={initial('phone', prefill.phone)}
          error={errors.phone}
        />

        {/*
         * Owner-requested addition (Z.26): OPTIONAL email, purely so a
         * customer confirmation can be sent. Not required — B.11's locked
         * four-field count stays the mandatory set; this is an opt-in fifth
         * field, which is a materially smaller conversion cost than a
         * required one.
         */}
        <FormField
          kind="email"
          name="email"
          label="Email (optional)"
          readOnly={pending}
          autoComplete="email"
          spellCheck={false}
          defaultValue={initial('email', prefill.email)}
          error={errors.email}
        />

        {hasPrefill ? (
          /* 3.3.7 Redundant Entry — a VISIBLE clear control accompanies
             pre-populated fields (§6.2, I.9). */
          <button
            type="button"
            onClick={() => {
              clear();
              formRef.current?.reset();
            }}
            className="self-start text-micro text-n-700 underline underline-offset-2"
          >
            Not you? Clear
          </button>
        ) : null}

        {/* G.2 — submission error. The field group stays populated, and the
            message carries a live tel: link: A FORM FAILURE MUST NEVER BECOME
            A DEAD END. Placed ABOVE the submit button. */}
        {state && !state.ok && !state.fieldErrors ? (
          <FormError message={state.error} />
        ) : null}

        {/* Consent is BEFORE the submit button in DOM order and BENEATH it
            visually; `order` flips the pair (G.5). */}
        <div className="flex flex-col gap-s2">
          <ConsentNotice />
          <button
            type="submit"
            aria-busy={pending || undefined}
            className="order-1 inline-flex min-h-14 w-full items-center justify-center rounded-md bg-apex-copper px-s4 font-geist font-bold text-white transition-[background-color,translate] duration-[var(--dur-button)] ease-out hover:-translate-y-0.5 hover:bg-apex-copper-hover"
          >
            {pending ? 'Sending…' : 'Get Your Flat-Rate Quote'}
          </button>
        </div>
      </form>
    </div>
  );
}
