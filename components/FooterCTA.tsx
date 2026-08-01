import Section from './Section';
import CallbackForm from './CallbackForm';
import PhoneLink from './PhoneLink';
import { SERVICE_AREAS } from '@/lib/contact';

/**
 * B.29 — <FooterCTA />
 *
 * The final conversion beat before the footer — contact info left, callback
 * form right (§5.11). Structure kept as-is from phase0; only the colour and
 * type systems change.
 *
 * RENDERING RULE (A.0.1, B.29): OMITTED on /thank-you, /404, /privacy-policy
 * and /terms-of-service. A conversion block above a legal disclosure
 * undermines both, and on /thank-you the conversion has already happened.
 *
 * ACCESSIBILITY (B.29, I.10): the phone number appears BEFORE the form in DOM
 * order, consistent with 3.2.6's rule that the phone is the first contact
 * affordance.
 *
 * MOTION: none — below the §4.11 entrance threshold on every page.
 */

export interface FooterCTAProps {
  heading: string;
  body: string;
}

export default function FooterCTA({ heading, body }: FooterCTAProps) {
  return (
    <Section ground="paper" labelledBy="footer-cta-heading">
      {/* Elevated panel at --r-2xl (§4.6a). */}
      <div className="rounded-2xl bg-apex-ink px-s4 py-s6 text-apex-paper md:px-s6 [--accent:var(--color-apex-copper-dark)]">
        <div className="grid gap-s6 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0">
            <h2 id="footer-cta-heading" className="text-h2 measure-display">
              {heading}
            </h2>
            <p className="mt-s3 text-body-lg measure-body text-apex-paper/80">
              {body}
            </p>

            <div className="mt-s5 text-h3">
              <PhoneLink display="full" context="footer" />
            </div>

            <p className="mt-s3 text-small text-apex-paper/70">
              Serving {SERVICE_AREAS.join(', ')}.
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-apex-paper p-s4 text-n-950 md:p-s5 [--accent:var(--color-apex-copper)]">
            <h3 className="text-h4 text-apex-ink">Prefer we call you?</h3>
            <p className="mt-s1 text-small text-n-700">
              Leave your details and a dispatcher calls back within 30 minutes.
            </p>
            <div className="mt-s4">
              <CallbackForm formLocation="footer" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
