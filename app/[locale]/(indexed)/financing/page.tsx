import type { Metadata } from 'next';
import { CalendarRange, Percent, ScrollText } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import FinancingBanner from '@/components/FinancingBanner';
import FeatureRow from '@/components/FeatureRow';
import ProcessStep from '@/components/ProcessStep';
import FooterCTA from '@/components/FooterCTA';
import FinancingViewEvent from '@/components/FinancingViewEvent';
import { SITE_URL } from '@/lib/contact';
import { HOME } from '@/lib/content';
import { EM_DASH, ph } from '@/lib/placeholders';

/**
 * A.11 — `/financing`. StandardPageTemplate.
 *
 * PURPOSE: handle the cost objection where it naturally arises for the
 * planned-replacement segment (§1.3, §3.3).
 *
 * EVERY FIGURE HERE IS CLIENT ACTION REQUIRED (§9.4, A.11). Any APR, term
 * length or "0%" claim requires the actual lender agreement, and "0% financing
 * available" with no qualifying language is a LENDING-ADVERTISING EXPOSURE.
 * Until the agreement is supplied, figures render the A.0.5 em-dash fallback
 * and THE "0%" PHRASING DOES NOT APPEAR ANYWHERE ON THIS PAGE.
 *
 * STRUCTURED DATA (A.11): no Offer or PriceSpecification markup — emitting
 * either would require the exact figures §9.4 withholds.
 *
 * ANALYTICS (A.11, §8.6): reaching this route fires `financing_view` with an
 * `entry_point` parameter.
 */

const title = 'HVAC Financing in Phoenix, AZ | Apex Comfort Systems';
const description =
  'Financing options for new HVAC systems across Phoenix metro. Licensed and insured contractor, flat-rate pricing, no surprises. Call 24/7.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/financing` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/financing`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function FinancingPage() {
  const apr = ph('financingApr') ?? EM_DASH;
  const term = ph('financingTerm') ?? EM_DASH;

  return (
    <>
      <FinancingViewEvent />

      <Section labelledBy="financing-page-heading">
        <SectionHeading
          eyebrow="FINANCING"
          heading="A failed system is rarely a planned expense."
          level={1}
          id="financing-page-heading"
          lede="Financing lets the decision be about the right system for your home rather than what you can cover this month. Options are presented before you commit to anything, and the terms come from the lender in writing, not from a salesperson's estimate on your kitchen table."
        />
      </Section>

      <FinancingBanner
        heading={HOME.financing.heading}
        body={HOME.financing.body}
        cta={{ label: 'Get your flat-rate quote', href: '#quote' }}
      />

      <Section ground="n50" labelledBy="terms-heading">
        <h2 id="terms-heading" className="text-h2 measure-display">
          Terms
        </h2>
        <p className="mt-s3 text-body measure-body text-n-700">
          The figures below come directly from the lender agreement. Where you
          see an em-dash, that term has not yet been confirmed in writing and we
          will not publish a number we cannot stand behind.
        </p>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-3">
          <FeatureRow
            icon={Percent}
            title={`Rate: ${apr}`}
            description="The annual percentage rate is set by the lender and depends on credit approval and the plan selected. It is disclosed in full before you sign anything."
            headingLevel={3}
          />
          <FeatureRow
            icon={CalendarRange}
            title={`Term length: ${term}`}
            description="Term length determines the monthly payment and the total cost of credit. Both figures are shown side by side so the trade-off is visible rather than buried."
            headingLevel={3}
          />
          <FeatureRow
            icon={ScrollText}
            title="Qualifying language"
            description="Financing is subject to credit approval. Not all applicants qualify, and the advertised rate may not be the rate you are offered. Full terms are provided by the lender before you commit."
            headingLevel={3}
          />
        </ul>
      </Section>

      <Section labelledBy="apply-heading">
        <h2 id="apply-heading" className="text-h2 measure-display">
          How to apply
        </h2>
        {/* Steps describe the SEQUENCE, not the terms (A.11). */}
        <ol className="mt-s6 grid list-none grid-cols-1 gap-s5 md:grid-cols-3">
          {[
            {
              title: 'Get the quote first',
              description:
                'We price the job flat-rate before financing enters the conversation, so you are comparing systems rather than monthly payments.',
            },
            {
              title: 'Apply with the lender',
              description:
                'The application goes to the lender directly, not through us. A decision usually comes back the same day.',
            },
            {
              title: 'Schedule the install',
              description:
                'Once approval is confirmed we book the install. The financing terms come from the lender in writing before any work starts.',
            },
          ].map((step, i, arr) => (
            <ProcessStep
              key={step.title}
              index={i + 1}
              title={step.title}
              description={step.description}
              isLast={i === arr.length - 1}
            />
          ))}
        </ol>
      </Section>

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
