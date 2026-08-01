import Link from 'next/link';

/**
 * G.5 — TCPA consent. REQUIRED, NOT OPTIONAL.
 *
 * Rendered on BOTH forms — the disclosure is required wherever a phone number
 * is collected and a callback promised, not only in the hero (B.12).
 *
 * RULES (§9.3a, G.5)
 *   - An unchecked checkbox is NOT used. It is a conversion tax. Submit-
 *     implies-consent with clearly visible disclosure is the standard pattern
 *     and satisfies express written consent when the disclosure sits
 *     immediately adjacent to the submit control.
 *   - The disclosure must be visible without scrolling whenever the submit
 *     button is visible. It is never collapsed, truncated, or behind a tooltip.
 *   - In DOM order it is a sibling placed BEFORE the submit button, so screen
 *     readers reach it before activation — while rendering visually BENEATH it.
 *     The parent flips the two with CSS `order`.
 *
 * THIS TEXT IS LEGALLY OPERATIVE. Counsel reviews it before launch (§9.4) —
 * the client's approval alone is not sufficient.
 */
export default function ConsentNotice() {
  return (
    <p className="order-2 text-micro text-n-700">
      By submitting, you agree that Apex Comfort Systems may contact you by phone
      or text about your request, including by automated means. Consent is not a
      condition of purchase. Message and data rates may apply. See our{' '}
      <Link href="/privacy-policy" className="underline underline-offset-2">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
