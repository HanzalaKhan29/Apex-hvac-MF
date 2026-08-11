'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { submitLead, type LeadResult } from '@/lib/actions/submit-lead';
import { useSessionPrefill } from '@/lib/use-session-prefill';
import { track } from './Analytics';
import FormField from './FormField';
import ConsentNotice from './ConsentNotice';
import TurnstileWidget from './TurnstileWidget';
import FormError from './FormError';

/**
 * B.12 — <CallbackForm />
 *
 * The footer-CTA variant — name, phone, best-time-to-call — using the
 * IDENTICAL transport and validation pattern as <QuoteCard /> (§9.1, G.0).
 *
 * ACCESSIBILITY: identical requirements to <QuoteCard />, INCLUDING the TCPA
 * consent block. The disclosure is required wherever a phone number is
 * collected and a callback promised, not only in the hero (B.12, G.5).
 *
 * SUCCESS BEHAVIOUR (B.12, §4.8's corrected success-state rule): redirects to
 * /thank-you exactly as <QuoteCard /> does, with ?service=general since this
 * form has no service field. Inline confirmation is NOT used here.
 *
 * MOTION: none. This section sits below the §4.11 entrance threshold on every
 * page and therefore has no entrance animation and NO IntersectionObserver
 * attached at all.
 */

export interface CallbackFormProps {
  formLocation: 'footer';
}

const BEST_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'any', label: 'Any time' },
];

export default function CallbackForm({ formLocation }: CallbackFormProps) {
  const [state, formAction, pending] = useActionState<LeadResult | null, FormData>(
    submitLead,
    null
  );

  const { prefill, hasPrefill, remember, clear } = useSessionPrefill();
  const [mountedAt] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  const onFocusCapture = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track('form_start', { form_location: formLocation });
  };

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

  return (
    <form
      ref={formRef}
      action={formAction}
      onFocusCapture={onFocusCapture}
      onSubmit={() => {
        const data = new FormData(formRef.current!);
        remember({
          name: String(data.get('name') ?? ''),
          phone: String(data.get('phone') ?? ''),
          email: String(data.get('email') ?? ''),
        });
      }}
      className="flex flex-col gap-s3"
    >
      <input type="hidden" name="formType" value="callback" />
      <input type="hidden" name="formLocation" value={formLocation} />
      <input type="hidden" name="mountedAt" value={mountedAt} />

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company-callback">Company</label>
        <input id="company-callback" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {/* G.4 layer 3 — Turnstile. Renders nothing until the site key is
          configured (Z.45); must sit inside the <form> so its injected
          hidden input reaches the Server Action's FormData. */}
      <TurnstileWidget />

      {/* H.2.9 — three fields in a row at md+, stacked below. */}
      <div className="grid gap-s3 md:grid-cols-3">
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
        <FormField
          /* Same remount rule as the quote form's service select (G.2). */
          key={`bestTime-${initial('bestTime') ?? ''}`}
          kind="select"
          name="bestTime"
          defaultValue={initial('bestTime')}
          label="Best time to call"
          required
          readOnly={pending}
          placeholder="Select a time"
          options={BEST_TIME_OPTIONS}
          error={errors.bestTime}
        />
      </div>

      {/* Owner-requested (Z.26): optional email, so a confirmation can be
          sent. Not part of B.12's required set. */}
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

      {state && !state.ok && !state.fieldErrors ? (
        <FormError message={state.error} />
      ) : null}

      <div className="flex flex-col gap-s2">
        <ConsentNotice />
        <button
          type="submit"
          aria-busy={pending || undefined}
          /* Z.45 — same double-submit guard as <QuoteCard />; see the comment
             there for why this is aria-disabled rather than `disabled`. */
          aria-disabled={pending || undefined}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
          className="order-1 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-apex-copper px-s4 font-geist font-bold text-white transition-[background-color,translate] duration-[var(--dur-button)] ease-out hover:-translate-y-0.5 hover:bg-apex-copper-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
        >
          {pending ? 'Sending…' : 'Request a Callback'}
        </button>
      </div>
    </form>
  );
}
