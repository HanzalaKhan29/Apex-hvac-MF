import type { Metadata } from 'next';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import FAQAccordion from '@/components/FAQAccordion';
import Button from '@/components/Button';
import PhoneLink from '@/components/PhoneLink';
import FooterCTA from '@/components/FooterCTA';
import { SITE_URL } from '@/lib/contact';
import { HOME, MAIN_FAQ } from '@/lib/content';
import { CTA } from '@/lib/ui';

/**
 * A.12 — `/faq`. StandardPageTemplate.
 *
 * PURPOSE: the primary AEO asset — a question set grounded in real Phoenix
 * HVAC search behaviour, with ANSWER-FIRST formatting for featured snippets
 * and voice results (§8.3).
 *
 * The seven questions are §8.3's seed set, VERBATIM AND IN ORDER. No service
 * page re-declares any of them, which is what prevents the duplicate-schema
 * signal dilution §8.3 warns about.
 *
 * Answers to the cost, response-speed, financing and brands questions all
 * touch §9.4-gated values; each renders the STRUCTURAL answer and defers the
 * specific figure or brand list rather than stating an invented one.
 *
 * The "still have a question" block is TEXT AND CTA ONLY. §4.8 permits an
 * inline-confirmation form here as the single exception to the redirect rule,
 * but that form is NOT BUILT AT V1 — nothing in the blueprint specifies its
 * fields, transport or destination, so it is logged in Appendix Z as resolved
 * out of scope (G.0).
 */

const title = 'HVAC FAQ | Phoenix Metro | Apex Comfort Systems';
const description =
  'Answers on AC repair cost, response times, financing and service areas across Phoenix metro. Licensed and insured HVAC. Call 24/7 for a quote.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/faq`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function FaqPage() {
  return (
    <>
      <Section labelledBy="faq-page-heading">
        <SectionHeading
          eyebrow="QUESTIONS"
          heading="Straight answers, first sentence."
          level={1}
          id="faq-page-heading"
          lede="Every answer below leads with the answer. If a figure depends on your system or on a lender's terms, we say what it depends on rather than quoting a number that changes on the day."
        />
      </Section>

      {/* Emits FAQPage schema scoped to these seven questions only (§8.3). */}
      <FAQAccordion
        items={MAIN_FAQ}
        heading="Common questions"
        ground="n50"
        id="main-faq"
      />

      <Section labelledBy="still-asking-heading">
        <div className="grid gap-s5 md:grid-cols-2 md:items-center">
          <div>
            <h2 id="still-asking-heading" className="text-h2 measure-display">
              Still have a question?
            </h2>
            <p className="mt-s3 text-body-lg measure-body">
              Describe what the system is doing and we will tell you what it
              usually means before anyone is dispatched. Calling gets the
              fastest answer.
            </p>
          </div>
          <div className="flex flex-col gap-s3 sm:flex-row md:justify-end">
            <Button variant="primary" href="/contact" fullWidth className="sm:w-auto">
              {CTA.full}
            </Button>
            <span className="inline-flex items-center">
              <PhoneLink display="full" context="service-page" />
            </span>
          </div>
        </div>
      </Section>

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
