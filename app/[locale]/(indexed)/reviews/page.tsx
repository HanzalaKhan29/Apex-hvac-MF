import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import FooterCTA from '@/components/FooterCTA';
import { SITE_URL } from '@/lib/contact';
import { DEMO_REVIEWS, HOME } from '@/lib/content';
import { ph } from '@/lib/placeholders';

/**
 * Z.25 — dynamically imported HERE, not from a component shared with the
 * homepage. Framer Motion (<ReviewsMarquee />'s dependency) only needs to
 * reach this one route's bundle; keeping the import local to this route file
 * is what actually achieves that with Next's dynamic-chunk analysis — see the
 * note in components/ReviewsSection.tsx for why a shared-component version of
 * this blew the homepage's J.4 budget on the first attempt.
 */
const ReviewsMarquee = dynamic(() => import('@/components/ReviewsMarquee'));

/**
 * A.10 — `/reviews`. StandardPageTemplate.
 *
 * ATTRIBUTION MODE (A.10, §5.10): DEMO / PRE-LAUNCH. Neutral quotation
 * treatment, no Google "G", no star row, no verified badge, initials-plus-city
 * attribution, and the in-card "Illustrative — replaced with real Google
 * reviews at launch." label. Live mode activates only when content is pulled
 * from the Google Business Profile via the Places API or an authorized widget,
 * never hand-transcribed.
 *
 * STRUCTURED DATA (A.10, §8.1): NO Review or AggregateRating markup is emitted
 * in demo mode. Fabricated structured data is explicitly out of bounds.
 *
 * The page lede carries NO RATING AND NO COUNT while §9.4's review data is
 * unverified.
 */

const title = 'Customer Reviews | Apex Comfort Systems, Phoenix AZ';
const description =
  'What Phoenix metro customers say about Apex Comfort Systems — AC repair, replacement and commercial HVAC. Licensed and insured. Call 24/7.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/reviews` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/reviews`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ReviewsPage() {
  const gbpUrl = ph('googleBusinessProfileUrl');

  return (
    <>
      <Section labelledBy="reviews-page-heading">
        <SectionHeading
          eyebrow="CUSTOMER REVIEWS"
          heading="What customers say, with the detail that makes it real."
          level={1}
          id="reviews-page-heading"
          lede="Vague five-star quotes read as fake. These are tagged by service type and city, because that is what a real review looks like. At launch they are replaced wholesale by verified reviews pulled from our Google Business Profile."
        />
      </Section>

      <Section id="all-reviews" ground="n50" labelledBy="all-reviews-heading">
        {/* B.7 / I.1 — a landmark is never anonymous; this band IS the page,
            so the heading is visually hidden rather than omitted, exactly as
            <ReviewsSection /> does for this same case. */}
        <h2 id="all-reviews-heading" className="visually-hidden">
          Customer reviews
        </h2>
        <ReviewsMarquee reviews={DEMO_REVIEWS.map((r) => ({ ...r }))} mode="demo" />
      </Section>

      {/* Leave-a-review prompt. The URL is CLIENT ACTION REQUIRED and THE
          BLOCK DOES NOT RENDER until it is supplied (A.10). */}
      {gbpUrl ? (
        <Section labelledBy="leave-review-heading" width="narrow">
          <h2 id="leave-review-heading" className="text-h2">
            Worked with us recently?
          </h2>
          <p className="mt-s3 text-body-lg">
            Reviews are the main way people decide who to let into their home.
            If we did right by you, saying so publicly genuinely helps.
          </p>
          <div className="mt-s4">
            <Button variant="ink" href={gbpUrl}>
              Leave a Google review
            </Button>
          </div>
        </Section>
      ) : null}

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
