import type { Metadata } from 'next';
import Image from 'next/image';
import { BadgeCheck, FileBadge, Receipt, ShieldCheck, Timer, Users } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import FeatureRow from '@/components/FeatureRow';
import ProcessSection from '@/components/ProcessSection';
import FooterCTA from '@/components/FooterCTA';
import { SITE_URL } from '@/lib/contact';
import { HOME } from '@/lib/content';
import { gateOpen, ph } from '@/lib/placeholders';

/**
 * A.8 — `/about`. StandardPageTemplate.
 *
 * PURPOSE: carry the trust signals that do not fit elsewhere — licensing
 * detail, certification evidence, team and workmanship — for the segment that
 * researches before calling (§1.3, §3.3).
 *
 * §9.4 GATES (A.8, H.5.3): the ROC number and NATE are BOTH gated. NATE
 * renders only when the condition is met; otherwise THE ROW IS REMOVED, NOT
 * SOFTENED, and the remaining rows reflow. Technician bios and headshots are
 * CLIENT ACTION REQUIRED, so no Person markup is emitted and no bio
 * placeholder with a fabricated name renders — where bios are absent the
 * credentials band stands alone.
 */

const title = 'About Apex Comfort Systems | Phoenix HVAC Contractor';
const description =
  'Licensed and insured HVAC contractor serving Phoenix metro. Two-hour dispatch window, flat-rate pricing, and technicians who show up. Call 24/7.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/about`,
    images: ['/images/about-team-shop-bay.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function AboutPage() {
  const roc = ph('rocNumber');

  const credentials = [
    {
      icon: ShieldCheck,
      title: 'Licensed, bonded and insured',
      description:
        'Arizona-licensed for residential and commercial HVAC, bonded, and carrying general liability and workers’ compensation cover. Certificates are available on request before any work is booked.',
    },
    // Renders only when the real ROC number is supplied (§9.4).
    ...(roc
      ? [
          {
            icon: FileBadge,
            title: `Arizona ROC ${roc}`,
            description:
              'Our licence number is published here and in our terms of service so it can be checked against the Arizona Registrar of Contractors before you book.',
          },
        ]
      : []),
    // Removed, not softened, when no currently certified technician is on staff.
    ...(gateOpen('nateCertified')
      ? [
          {
            icon: BadgeCheck,
            title: 'NATE-certified technicians',
            description:
              'Background-checked, licensed and drug-screened, on a named manufacturer-specific certification track rather than an adjective stack.',
          },
        ]
      : []),
    {
      icon: Users,
      title: 'Employed technicians, not subcontractors',
      description:
        'The person who arrives works for us, is trained by us, and is accountable to us. That is what makes a workmanship commitment meaningful rather than a line in a brochure.',
    },
  ];

  return (
    <>
      <Section labelledBy="about-heading">
        <SectionHeading
          eyebrow="ABOUT APEX"
          heading="Climate control is infrastructure, not a commodity repair."
          level={1}
          id="about-heading"
          lede="For Phoenix homeowners and businesses who treat cooling as critical infrastructure, Apex Comfort Systems brings engineering-grade precision and hospitality-grade responsiveness to every job — because in a market where AC failure is a genuine emergency, “good enough” isn’t a service tier we offer."
        />
      </Section>

      {/* Full-width media band. Informative image, descriptive alt (§6.2). */}
      <Section width="full-bleed" as="div">
        <div className="relative aspect-[4/3] w-full lg:aspect-[21/9]">
          <Image
            src="/images/about-team-shop-bay.jpg"
            alt="Four Apex Comfort Systems technicians standing beside a service van in a shop bay"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: '50% 45%' }}
          />
        </div>
      </Section>

      <Section ground="n50" labelledBy="credentials-heading">
        <h2 id="credentials-heading" className="text-h2 measure-display">
          What backs the work
        </h2>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-2">
          {credentials.map((item) => (
            <FeatureRow key={item.title} {...item} headingLevel={3} />
          ))}
        </ul>
      </Section>

      {/* §5.7's copy, VERBATIM — including the 4pm cutoff qualifier, which is
          load-bearing: it is what makes the claim operationally defensible
          rather than the unconditional guarantee §2.5 forbids (B.19). */}
      <Section labelledBy="commitments-heading">
        <h2 id="commitments-heading" className="text-h2 measure-display">
          Two commitments we will put in writing
        </h2>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-2">
          <FeatureRow
            icon={Timer}
            title="Two-Hour Dispatch Window"
            description="Call before 4pm and a technician is on the way within two hours — same-day service, available seven days a week. Emergency calls jump the queue, day or night."
            headingLevel={3}
          />
          <FeatureRow
            icon={Receipt}
            title="Upfront, Flat-Rate Pricing"
            description="The price is quoted before the work starts and does not move once you approve it. No hourly meter, no discovered extras, no surprises on the invoice."
            headingLevel={3}
          />
        </ul>
      </Section>

      {/* Reuses the homepage's four steps (A.8 section 5). */}
      <ProcessSection
        eyebrow={HOME.process.eyebrow}
        heading={HOME.process.heading}
        steps={HOME.process.steps.map((s) => ({ ...s }))}
        ground="n50"
        id="about-process"
      />

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
