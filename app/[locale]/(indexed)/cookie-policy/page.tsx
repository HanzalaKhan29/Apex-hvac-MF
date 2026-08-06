import type { Metadata } from 'next';
import { Cookie, ShieldCheck, Settings2 } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import FeatureRow from '@/components/FeatureRow';
import PhoneLink from '@/components/PhoneLink';
import { SITE_URL } from '@/lib/contact';

/**
 * `/cookie-policy`. Universal Website Build Checklist, Phase 6.
 *
 * UNLIKE /privacy-policy and /terms-of-service, this page does NOT route
 * through LegalPageTemplate's counsel-gated body/outline split. Those two
 * carry real legal exposure (consumer rights, TCPA consent, liability) and
 * ship no invented text until counsel reviews them. This page is a factual
 * inventory of what the site's own code actually does, verified directly
 * against the source rather than assumed:
 *
 *   - the ONE cookie currently set in production is `apex_lead_last4`, an
 *     httpOnly session cookie from lib/actions/submit-lead.ts (10-minute
 *     expiry, set only after a form submission)
 *   - GA4 (components/GoogleAnalytics.tsx) renders nothing unless
 *     NEXT_PUBLIC_GA_ID is set, and a live check of the deployed site found
 *     no Google Analytics script loading, meaning it is currently off
 *   - Cloudflare Turnstile is wired server-side
 *     (lib/actions/submit-lead.ts's verifyTurnstile) but no widget script is
 *     mounted in QuoteCard.tsx or CallbackForm.tsx, so it sets no cookie yet
 *     either
 *
 * No jurisdiction-specific compliance claims (GDPR, CCPA) appear here
 * deliberately. That is a legal-scope question for counsel's pass over the
 * other two documents, not something to assert unreviewed.
 *
 * No em dashes in the body copy below (check:emdash, Appendix Z).
 */

const title = 'Cookie Policy | Apex Comfort Systems';
const description =
  'What cookies this website sets, what each one does, and how to control them.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/cookie-policy`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function CookiePolicyPage() {
  return (
    <Section labelledBy="cookie-heading" width="narrow">
      <SectionHeading
        heading="Cookie Policy"
        level={1}
        id="cookie-heading"
        lede="A plain list of what this site actually sets in your browser, why, and how long each one sticks around. Nothing here is invented or copied from a template: it is checked directly against this site's code."
      />

      <ul className="mt-s6 grid list-none gap-s5">
        <FeatureRow
          icon={ShieldCheck}
          title="apex_lead_last4 (strictly necessary)"
          description="Set only after you submit the quote or callback form. Holds the last four digits of the phone number you gave, so the thank-you page can confirm it back to you without ever putting your full number in a URL. HttpOnly (JavaScript on the page cannot read it), and it expires automatically after 10 minutes. There is no way to opt out of this one and still receive a working confirmation page, since it carries no tracking information at all, only a fragment of the number you just typed."
          headingLevel={2}
        />
        <FeatureRow
          icon={Cookie}
          title="Google Analytics, GA4 (not currently active)"
          description="This site's code is built to load Google Analytics after the page finishes loading, never before, so it cannot slow anything down. It is currently switched off: no analytics script is set up, so no analytics cookies (the usual _ga and _ga_ pair) are being set on this site right now. If it is turned on later, only usage measurement is enabled by default, not ad tracking or ad personalization, and this page will be updated to say so plainly."
          headingLevel={2}
        />
        <FeatureRow
          icon={Settings2}
          title="Cloudflare Turnstile, spam protection (not currently active)"
          description="A planned defense against bots filling out the quote and callback forms. The server-side check for it exists, but the widget itself is not switched on yet, so it sets no cookie today. When it is switched on, it works invisibly in the background to confirm a real person is submitting the form, the same way a spam filter checks a letter before it reaches your inbox."
          headingLevel={2}
        />
      </ul>

      <div className="mt-s7">
        <h2 className="text-h2 measure-display">Cookies this site does not use</h2>
        <p className="mt-s3 text-body measure-body text-n-700">
          No advertising cookies. No cross-site tracking. No cookie is ever
          sold or shared with a data broker. Nothing on this site tracks you
          across other websites.
        </p>
      </div>

      <div className="mt-s7">
        <h2 className="text-h2 measure-display">Controlling cookies</h2>
        <p className="mt-s3 text-body measure-body text-n-700">
          Every modern browser lets you view, block or delete cookies from
          its settings menu. Blocking the one strictly necessary cookie above
          will not stop you from submitting a form, it will only stop the
          thank-you page from confirming the phone number back to you.
        </p>
      </div>

      <div className="mt-s7">
        <h2 className="text-h2 measure-display">Questions</h2>
        <p className="mt-s3 text-body measure-body text-n-700">
          Call <PhoneLink display="label-only" context="service-page" /> with
          any question about how this site handles cookies or your
          information.
        </p>
      </div>
    </Section>
  );
}
