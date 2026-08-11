import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import PhoneLink from '@/components/PhoneLink';
import GenerateLeadEvent from '@/components/GenerateLeadEvent';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/contact';
import { ph } from '@/lib/placeholders';

/**
 * A.14 / §9.3b / G.7 — `/thank-you`. ConfirmationTemplate.
 *
 * The funnel terminus (§3.5) and the destination conversion GA4 and Google Ads
 * attribute against (§8.6). Redirect is the correct primary pattern precisely
 * because it is the only one that gives them a real destination conversion;
 * inline confirmation has no URL.
 *
 * NO FORMS. NO NEWSLETTER SIGNUP. The conversion has happened (§9.3b).
 *
 * The primary action is the PHONE, not a back-to-home link: the user has just
 * expressed intent and the phone is the highest-converting path.
 *
 * Structured data is SUPPRESSED entirely on this route — emitting HVACBusiness
 * from a noindex page would contribute a non-page to the entity graph (A.14).
 * That is why <JsonLd /> is absent here even though the locale layout renders
 * it: see the layout note and the `robots` export below.
 */

export const metadata: Metadata = {
  title: 'Thank You | Apex Comfort Systems',
  // Excluded from indexing, from sitemap.xml and from robots.txt crawling.
  robots: { index: false, follow: false },
};

/** G.7 — three contextual links, driven by ?service=. */
const CONTEXTUAL_LINKS: Record<
  string,
  readonly { label: string; href: string }[]
> = {
  'ac-repair': [
    { label: 'What to check while you wait', href: '/faq' },
    { label: 'AC repair pricing', href: '/services/ac-repair' },
    { label: 'Financing', href: '/financing' },
  ],
  'ac-replacement-installation': [
    { label: 'Choosing a system size', href: '/faq' },
    {
      label: 'Replacement & installation',
      href: '/services/ac-replacement-installation',
    },
    { label: 'Financing', href: '/financing' },
  ],
  'heating-furnace-repair': [
    { label: 'Furnace warning signs', href: '/faq' },
    { label: 'Heating & furnace repair', href: '/services/heating-furnace-repair' },
    { label: 'Maintenance plans', href: '/services/maintenance-plans' },
  ],
  'commercial-hvac': [
    { label: 'Our commercial work', href: '/projects' },
    { label: 'Commercial HVAC', href: '/services/commercial-hvac' },
    { label: 'Service areas', href: '/service-areas' },
  ],
  'maintenance-plans': [
    { label: 'What a visit includes', href: '/faq' },
    { label: 'Maintenance plans', href: '/services/maintenance-plans' },
    { label: 'Indoor air quality', href: '/services/indoor-air-quality' },
  ],
  'indoor-air-quality': [
    { label: 'Phoenix dust and air quality', href: '/faq' },
    { label: 'Indoor air quality', href: '/services/indoor-air-quality' },
    { label: 'Maintenance plans', href: '/services/maintenance-plans' },
  ],
  general: [
    { label: 'Our services', href: '/services' },
    { label: 'Service areas', href: '/service-areas' },
    { label: 'Financing', href: '/financing' },
  ],
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  /*
   * The parameter is VALIDATED AGAINST THIS CLOSED LIST before use and is
   * NEVER ECHOED INTO THE PAGE AS TEXT, which closes the reflected-content
   * vector on the one route that reads a query string (§9.3b, Appendix Z).
   *
   * Z.45 — the guard uses hasOwnProperty, NOT the `in` operator. `in` walks
   * the prototype chain, so `?service=constructor` (and toString, valueOf,
   * __proto__, hasOwnProperty) passed the old check, resolved to a function
   * off Object.prototype instead of a link array, and threw a TypeError on
   * `.map()` below — an unauthenticated 500 on a live route, reproducible by
   * hand. Verified against each of those five keys before and after.
   */
  const key =
    service && Object.prototype.hasOwnProperty.call(CONTEXTUAL_LINKS, service)
      ? service
      : 'general';
  const links = CONTEXTUAL_LINKS[key];

  // Masked to the last four digits; the full number is never in the URL (G.7).
  const last4 = (await cookies()).get('apex_lead_last4')?.value;
  const maskedPhone = last4 ? `(•••) •••-${last4}` : 'the number you gave us';

  return (
    <>
      <GenerateLeadEvent serviceType={key} />

      <Section labelledBy="thankyou-heading">
        <SectionHeading
          heading="We've got it. Here's what happens next."
          level={1}
          id="thankyou-heading"
        />

        <p className="mt-s4 text-body-lg measure-body">
          A dispatcher will call you at{' '}
          <span className="num">{maskedPhone}</span> within{' '}
          <span className="num">{ph('responseWindow')}</span>. If it&rsquo;s
          after 10pm, we&rsquo;ll call first thing — unless you marked this an
          emergency, in which case we&rsquo;re calling now.
        </p>

        <div className="mt-s5">
          <Button variant="primary" size="lg" href={`tel:${PHONE_E164}`} fullWidth className="md:w-auto">
            Call Now — {PHONE_DISPLAY}
          </Button>
        </div>

        {/* Navigation, not a CTA (A.14). */}
        <nav aria-label="Related information" className="mt-s7">
          <ul className="grid list-none grid-cols-1 gap-s3 md:grid-cols-3">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-xl border border-n-200 bg-white px-s4 py-s3 font-geist font-bold text-[var(--accent)] shadow-sm"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="visually-hidden">
          <PhoneLink display="label-only" context="thank-you" />
        </p>
      </Section>
    </>
  );
}
