import { Phone } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/contact';

/**
 * B.15 — <PhoneLink />
 *
 * THE single source of truth for the phone number site-wide. No component may
 * render a phone number except through this one (§9.1's binding rule) — that
 * is what makes NAP consistency (§8.5) and the DNI pattern (§8.6) a one-place
 * concern.
 *
 * Analytics: every activation fires the `phone_click` GA4 KEY event with
 * `link_location` (from `context`) and `page_path` (§8.6). The event is bound
 * by data attribute and dispatched by a single delegated listener in
 * <Analytics />, because J.4's 'use client' list is exhaustive and does not
 * include <PhoneLink /> — it stays a Server Component.
 *
 * DNI rule (§8.6): dynamic number insertion may rewrite the DISPLAYED number
 * for paid and referral traffic only. It never rewrites the number in
 * HVACBusiness JSON-LD or in the footer NAP block, both of which always carry
 * the canonical Google Business Profile number from lib/contact.ts.
 *
 * Always a real link, never a button that scripts a call (I.5).
 */

export interface PhoneLinkProps {
  display?: 'full' | 'label-only' | 'icon-only';
  context:
    | 'topbar'
    | 'header'
    | 'hero'
    | 'sticky-bar'
    | 'footer'
    | 'service-page'
    | 'thank-you'
    | 'form-error';
}

export default function PhoneLink({ display = 'full', context }: PhoneLinkProps) {
  /*
   * The form-error context is an inline link inside a sentence and is exempt
   * from the 44×44 standalone-control minimum (§6.2's 2.5.8 inline exception,
   * I.7). Every other context is a standalone control and meets it.
   */
  const inline = context === 'form-error';

  const base = [
    'inline-flex items-center gap-s2 font-geist font-bold',
    'transition-colors duration-[var(--dur-button)] ease-out',
    inline
      ? 'underline underline-offset-2'
      : 'min-h-11 hover:text-[var(--accent)]',
    /*
     * I.7 — the icon-only variant is a 24px glyph, so min-h-11 alone left it
     * 24px WIDE: a 24x44 target, which clears the 24x24 normative minimum but
     * not Apex's own 44x44 standalone-control standard. It is also the primary
     * help mechanism below lg (3.2.6), i.e. the single most important tap
     * target on a phone, so it gets a full square.
     */
    display === 'icon-only' && !inline ? 'min-w-11 justify-center' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={`tel:${PHONE_E164}`}
      data-phone-link
      data-link-location={context}
      className={base}
    >
      {display !== 'label-only' ? (
        <Phone
          aria-hidden="true"
          className={display === 'icon-only' ? 'size-6' : 'size-4 shrink-0'}
          strokeWidth={2}
        />
      ) : null}

      {display === 'icon-only' ? (
        <span className="visually-hidden">Call {PHONE_DISPLAY}</span>
      ) : (
        /* Roboto tabular digits via the .num utility (§4.3, B.15). */
        /* translate="no" keeps machine translation from reformatting the
           digits, which would break NAP consistency (§8.5) the moment a
           browser auto-translates the page. */
        <span className="num" translate="no">
          {PHONE_DISPLAY}
        </span>
      )}
    </a>
  );
}
