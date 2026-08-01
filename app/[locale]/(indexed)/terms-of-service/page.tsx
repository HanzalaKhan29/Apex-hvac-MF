import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/templates/LegalPageTemplate';
import { SITE_URL } from '@/lib/contact';
import { ph } from '@/lib/placeholders';

/**
 * A.16 — `/terms-of-service`. LegalPageTemplate.
 *
 * Identical in structure, template, chrome, CTA treatment and structured data
 * to A.15. Licensing and ROC disclosure appears here in full as well as in the
 * footer line (§5.12), with the ROC number itself §9.4-gated.
 */

const title = 'Terms of Service | Apex Comfort Systems';
const description =
  'Terms governing use of the Apex Comfort Systems website and the services requested through it.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/terms-of-service` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/terms-of-service`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function TermsOfServicePage() {
  return (
    <LegalPageTemplate
      heading="Terms of Service"
      lastUpdated={null}
      body={ph('termsOfServiceBody')}
      outline={[
        'Who we are, and our Arizona ROC licence number in full.',
        'What requesting a quote through this site does and does not commit you to.',
        'How flat-rate pricing is quoted, approved and invoiced.',
        'Workmanship and parts warranty terms, and what voids them.',
        'Scheduling, access, cancellation and rescheduling.',
        'Financing: that it is provided by a third-party lender, subject to credit approval, on the lender’s own terms.',
        'Limitation of liability, dispute resolution, and governing law.',
      ]}
    />
  );
}
