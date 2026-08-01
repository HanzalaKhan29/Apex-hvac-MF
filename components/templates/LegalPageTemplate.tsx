import { TriangleAlert } from 'lucide-react';
import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import PhoneLink from '@/components/PhoneLink';

/**
 * B.33 — LegalPageTemplate. Serves /privacy-policy and /terms-of-service.
 *
 * Global chrome MINUS <FooterCTA /> (A.0.1, A.15): a conversion block above a
 * legal disclosure undermines both. Minimal and text-focused, body capped at
 * --measure-body.
 *
 * CONTENT (A.15, A.16, §9.4): the policy text is CLIENT ACTION REQUIRED and
 * COUNSEL-REVIEWED BEFORE LAUNCH. NO DRAFT LEGAL TEXT IS SUPPLIED — the route
 * ships with the structure and a build-blocking placeholder entry, which is
 * what renders below. Shipping invented legal prose for a licensed contractor
 * would be worse than shipping an obvious gap.
 */

export interface LegalPageTemplateProps {
  heading: string;
  lastUpdated: string | null;
  /** Section headings the finished document is expected to carry. */
  outline: readonly string[];
  body: string | null;
}

export default function LegalPageTemplate({
  heading,
  lastUpdated,
  outline,
  body,
}: LegalPageTemplateProps) {
  return (
    <Section labelledBy="legal-heading" width="narrow">
      <SectionHeading heading={heading} level={1} id="legal-heading" />

      <p className="mt-s2 text-small text-n-700">
        Last updated:{' '}
        {lastUpdated ? (
          <span className="num">{lastUpdated}</span>
        ) : (
          <span>not yet published</span>
        )}
      </p>

      {body ? (
        <div className="mt-s5 flex flex-col gap-s3 text-body">
          {body.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <>
          <div
            role="note"
            className="mt-s5 flex gap-s3 rounded-xl border border-n-200 bg-n-50 p-s4"
          >
            <TriangleAlert
              aria-hidden="true"
              strokeWidth={2}
              className="size-6 shrink-0 text-warning"
            />
            <div>
              <p className="text-h4 text-apex-ink">
                This document has not been published yet.
              </p>
              <p className="mt-s2 text-body text-n-700">
                The text is drafted and reviewed by counsel before launch. The
                client&rsquo;s approval alone is not sufficient for a licensed
                contractor collecting personal data. No placeholder legal
                language is shown here, because invented legal prose is more
                dangerous than an obvious gap.
              </p>
              <p className="mt-s3 text-body text-n-700">
                For any question about how we handle your information in the
                meantime, call{' '}
                <PhoneLink display="label-only" context="service-page" />.
              </p>
            </div>
          </div>

          <div className="mt-s6">
            <h2 className="text-h3">What this document will cover</h2>
            <ul className="mt-s3 flex list-disc flex-col gap-s2 pl-s4 text-body text-n-700">
              {outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Section>
  );
}
