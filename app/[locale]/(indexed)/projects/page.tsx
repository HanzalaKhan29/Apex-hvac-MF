import type { Metadata } from 'next';
import { Building2, ClipboardList } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import ProjectCard from '@/components/ProjectCard';
import FeatureRow from '@/components/FeatureRow';
import FooterCTA from '@/components/FooterCTA';
import { SITE_URL } from '@/lib/contact';
import { HOME } from '@/lib/content';
import { PROJECTS } from '@/lib/projects';

/**
 * A.9 — `/projects`. StandardPageTemplate.
 *
 * PURPOSE: documentary evidence of finished workmanship — the trust asset
 * COMMERCIAL BUYERS SPECIFICALLY REQUIRE (§3.3, §1.3).
 *
 * §9.4: no Review or case-study markup is emitted. Client names, addresses,
 * job values and dates are CLIENT ACTION REQUIRED and NONE IS INVENTED HERE.
 * Captions carry the installation type and city only.
 *
 * PHOTOGRAPHY STATUS (A.9): all five images are AI-generated placeholders.
 * Per §9.4 these are launch-acceptable only as an explicitly temporary measure
 * and are replaced by real completed-job photography as it becomes available.
 *
 * Five images fill the 2×3 grid with one wide cell; the sixth delivered
 * candidate was dropped for a posed idle stance against a mid-task-only
 * prompt, and no regeneration is required to replace it (§7, D.1.9–13).
 *
 * Z.37 — the PROJECTS data that used to live inline here now lives in
 * lib/projects.ts, so the homepage's three-card teaser reads the same
 * captions instead of a second, driftable copy of them.
 */

const title = 'HVAC Projects & Installations | Apex Comfort Systems';
const description =
  'Completed residential and commercial HVAC work across Phoenix metro — installs, rooftop units and mechanical rooms. Licensed and insured. Call 24/7.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/projects`,
    images: ['/images/project-attic-air-handler.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ProjectsPage() {
  return (
    <>
      <Section labelledBy="projects-heading">
        <SectionHeading
          eyebrow="COMPLETED WORK"
          heading="Finished work, photographed as it was left."
          level={1}
          id="projects-heading"
          lede="Installations photographed on completion rather than staged afterwards. Captions state the installation type and the city. No client names, no job values, no invented case-study numbers."
        />
      </Section>

      <Section ground="n50" labelledBy="project-grid-heading">
        <h2 id="project-grid-heading" className="visually-hidden">
          Project gallery
        </h2>
        {/* 2×3 with one wide cell at lg+; 2 columns at md–lg with the wide card
            spanning both; single column below md where `wide` has no effect. */}
        <ul className="grid list-none grid-cols-1 gap-s3 md:grid-cols-2 md:gap-s4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.image.src} {...project} />
          ))}
        </ul>
      </Section>

      <Section labelledBy="commercial-capability-heading">
        <h2 id="commercial-capability-heading" className="text-h2 measure-display">
          Commercial capability
        </h2>
        <ul className="mt-s6 grid list-none gap-s5 lg:grid-cols-2">
          <FeatureRow
            icon={Building2}
            title="Rooftop units and packaged equipment"
            description="RTU diagnostics, compressor and economiser service, controls troubleshooting and curb-level repairs across offices, retail and multi-tenant buildings."
            href="/services/commercial-hvac"
            headingLevel={3}
          />
          <FeatureRow
            icon={ClipboardList}
            title="Contracts and documented reporting"
            description="Scheduled visits with a written condition report per unit, and asset tagging so equipment history follows the machine rather than the technician."
            href="/services/commercial-hvac"
            headingLevel={3}
          />
        </ul>
      </Section>

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
