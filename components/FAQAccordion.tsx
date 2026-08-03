import { Plus } from 'lucide-react';
import Section from './Section';
import SectionHeading from './SectionHeading';
import type { FaqItem } from '@/lib/services';
import { serialiseJsonLd } from '@/lib/jsonld';

/**
 * B.31 — <FAQAccordion />
 *
 * The FAQ module, with FAQPage schema scoped PER PAGE (§8.3, §9.1).
 *
 * SCHEMA RULE (§8.3, B.31): each instance emits FAQPage scoped to ITS OWN
 * questions only, and never re-declares the main FAQ page's set. Service-page
 * question sets are non-duplicate of /faq's seven by construction (§8.3's
 * content map), which is what prevents the duplicate-schema signal dilution
 * §8.3 warns about.
 *
 * CONTENT RULE (§8.3): every answer leads with the direct answer in the first
 * sentence, elaboration after. This is the AEO mechanism, not a style
 * preference — it is what makes an answer extractable as a featured snippet or
 * a voice result.
 *
 * ACCESSIBILITY (B.31, I.2): native <details>/<summary> — no ARIA disclosure
 * pattern is hand-rolled. All items closed by default; MULTIPLE MAY BE OPEN
 * simultaneously, unlike the mobile nav drawer where one-at-a-time is
 * deliberate. <summary> meets the 44px standalone-control minimum.
 */

export interface FAQAccordionProps {
  items: readonly FaqItem[];
  /** Default true. Set false where another instance on the page owns the schema. */
  emitSchema?: boolean;
  eyebrow?: string;
  heading?: string;
  ground?: 'paper' | 'n50';
  id?: string;
}

export default function FAQAccordion({
  items,
  emitSchema = true,
  eyebrow,
  heading = 'Questions we get asked',
  ground = 'paper',
  id = 'faq',
}: FAQAccordionProps) {
  const headingId = `${id}-heading`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <Section id={id} ground={ground} labelledBy={headingId}>
      <SectionHeading eyebrow={eyebrow} heading={heading} level={2} id={headingId} />

      {/* Full width, capped at --measure-body. NEVER two columns: a
          two-column accordion reflows the whole page on every open and close,
          which is both a CLS problem and a reading problem (H.5.7). */}
      <div className="mt-s6 measure-body">
        {items.map((item) => (
          <details
            key={item.question}
            className="group border-b border-n-200 [&[open]_.faq-icon]:rotate-45"
          >
            <summary className="group/row flex min-h-11 cursor-pointer list-none items-center justify-between gap-s3 py-s3 [&::-webkit-details-marker]:hidden">
              <h3 className="text-h4 text-apex-ink transition-colors duration-[var(--dur-button)] ease-out group-hover/row:text-[var(--accent)]">
                {item.question}
              </h3>
              <Plus
                aria-hidden="true"
                strokeWidth={2}
                className="faq-icon size-5 shrink-0 text-[var(--accent)] transition-transform duration-[var(--dur-hover)] ease-out"
              />
            </summary>
            <p className="pb-s4 text-body text-n-700">{item.answer}</p>
          </details>
        ))}
      </div>

      {emitSchema ? (
        <script
          type="application/ld+json"
          // Scoped to this page's questions only (§8.3).
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(schema) }}
        />
      ) : null}
    </Section>
  );
}
