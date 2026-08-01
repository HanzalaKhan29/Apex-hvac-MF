import type { Metadata } from 'next';
import { Clock, MapPin } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import QuoteCard from '@/components/QuoteCard';
import PhoneLink from '@/components/PhoneLink';
import TrustBadge from '@/components/TrustBadge';
import FooterCTA from '@/components/FooterCTA';
import {
  ADDRESS,
  BUSINESS_NAME,
  EMERGENCY_LINE,
  SERVICE_AREAS,
  SITE_URL,
} from '@/lib/contact';
import { HOME } from '@/lib/content';
import { pageTrustRow } from '@/lib/ui';
import { ph } from '@/lib/placeholders';

/**
 * A.13 — `/contact`. StandardPageTemplate.
 *
 * PURPOSE: the destination for every primary CTA on a route without an
 * in-page form, and THE SECOND-HIGHEST-INTENT PAGE ON THE SITE after the
 * homepage hero.
 *
 * The form carries id="quote" (set by <QuoteCard variant="page" />), so #quote
 * anchors from elsewhere resolve here (§3.4, A.13).
 *
 * The NAP block is IDENTICAL to the footer and to the HVACBusiness JSON-LD
 * (§8.5). ContactPoint is emitted on the HVACBusiness node by the root layout
 * with contactType "customer service" and the canonical GBP number.
 *
 * The lede uses the "Respond" term (§2.5) — a human calls you back — and is
 * never blended with dispatch or same-day language.
 */

const title = 'Contact Apex Comfort Systems | Phoenix HVAC, 24/7';
const description =
  'Call or request a flat-rate quote for HVAC service across Phoenix metro. Licensed and insured, same-day service available. We respond within 30 minutes.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/contact`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ContactPage() {
  const email = ph('email');

  return (
    <>
      <Section labelledBy="contact-heading">
        <SectionHeading
          eyebrow="CONTACT"
          heading="Tell us what the system is doing."
          level={1}
          id="contact-heading"
          lede={`We respond within ${ph('responseWindow')}, 24/7. That is a human calling you back, not an automated acknowledgement. Calling is the fastest route; the form is the one to use if you would rather write it down.`}
        />
      </Section>

      <Section ground="n50" labelledBy="contact-split-heading">
        <h2 id="contact-split-heading" className="visually-hidden">
          Contact details and quote form
        </h2>
        <div className="grid gap-s6 lg:grid-cols-2 lg:items-start">
          {/* Contact detail left. The phone comes first in DOM order (I.10). */}
          <div className="min-w-0">
            <p className="text-h3">
              <PhoneLink display="full" context="service-page" />
            </p>

            <ul className="mt-s4 flex list-none flex-col gap-s3">
              <TrustBadge icon={Clock} label={EMERGENCY_LINE} />
              <TrustBadge
                icon={MapPin}
                label={`Serving ${SERVICE_AREAS.join(', ')}`}
              />
            </ul>

            <ul className="mt-s5 flex list-none flex-col gap-s2">
              {pageTrustRow().map((item) => (
                <TrustBadge key={item.label} {...item} />
              ))}
            </ul>

            {email ? (
              <p className="mt-s4 text-body">
                <a href={`mailto:${email}`} className="underline underline-offset-2">
                  {email}
                </a>
              </p>
            ) : null}
          </div>

          {/* Quote form right, with id="quote". */}
          <div className="min-w-0">
            <QuoteCard variant="page" formLocation="contact" />
          </div>
        </div>
      </Section>

      {/* Coverage and NAP — byte-identical to the footer and the JSON-LD. */}
      <Section labelledBy="nap-heading">
        <div className="grid gap-s5 md:grid-cols-2">
          <div>
            <h2 id="nap-heading" className="text-h2">
              Where to find us
            </h2>
            <address className="mt-s3 flex flex-col gap-s1 not-italic text-body text-n-700">
              <span>{BUSINESS_NAME}</span>
              {ADDRESS.streetAddress ? <span>{ADDRESS.streetAddress}</span> : null}
              <span>
                {ADDRESS.addressLocality}, {ADDRESS.addressRegion}
                {ADDRESS.postalCode ? ` ${ADDRESS.postalCode}` : ''}
              </span>
              <PhoneLink display="full" context="footer" />
            </address>
          </div>
          <div>
            <h2 className="text-h2">Coverage</h2>
            <p className="mt-s3 text-body measure-body text-n-700">
              We serve {SERVICE_AREAS.slice(0, -1).join(', ')} and{' '}
              {SERVICE_AREAS[SERVICE_AREAS.length - 1]}, Arizona. Every service
              is available in all five cities.
            </p>
          </div>
        </div>
      </Section>

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
