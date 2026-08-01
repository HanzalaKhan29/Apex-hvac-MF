import type { Metadata } from 'next';
import LegalPageTemplate from '@/components/templates/LegalPageTemplate';
import { SITE_URL } from '@/lib/contact';
import { ph } from '@/lib/placeholders';

/**
 * A.15 — `/privacy-policy`. LegalPageTemplate.
 *
 * Required for a licensed contractor collecting personal data, and the
 * destination of the TCPA consent link beneath every submit button (§9.3a).
 */

const title = 'Privacy Policy | Apex Comfort Systems';
const description =
  'How Apex Comfort Systems collects, uses and protects personal information submitted through this website.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/privacy-policy`,
    images: ['/images/og-default.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageTemplate
      heading="Privacy Policy"
      lastUpdated={null}
      body={ph('privacyPolicyBody')}
      outline={[
        'What personal information we collect through the quote and callback forms: name, phone number, ZIP code, and any message you write.',
        'How that information is used: to contact you about your request, to dispatch a technician, and to keep a service record against your equipment.',
        'Consent to contact you by phone or text, including by automated means, and how to withdraw it.',
        'Who the information is shared with: our dispatch team, and lenders only where you apply for financing.',
        'How long records are kept, and how to request a copy or deletion.',
        'Analytics and call-tracking cookies, and how to opt out.',
        'How to contact us about anything in this policy.',
      ]}
    />
  );
}
