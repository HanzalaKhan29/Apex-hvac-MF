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
 *
 * ICON BADGE — Z.38 (Appendix Z), owner-requested visual polish pass. Was a
 * bare +/x glyph; now sits in the same 40px circular ring <ServiceCard />'s
 * icon badge already uses, so the accordion reads as part of the same
 * component language instead of a one-off. Still the native <details>
 * engine underneath — [open] drives the rotation and ring fill purely via
 * the existing `group`/CSS selector, no JS added.
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
          <details key={item.question} className="faq-item group border-b border-n-200">
            <summary className="group/row flex min-h-11 cursor-pointer list-none items-center gap-s3 py-s3 [&::-webkit-details-marker]:hidden">
              <h3 className="flex-1 text-h4 text-apex-ink transition-colors duration-[var(--dur-button)] ease-out group-hover/row:text-[var(--accent)]">
                {item.question}
              </h3>
              {/* Same 40px ring <ServiceCard />'s icon badge uses (Z.38) —
                  fills copper and the glyph turns white once open. Two
                  Tailwind variants were tried first: a hand-written
                  `[&[open]_...]` selector, then the built-in `group-open:`.
                  Neither actually compiled in this Tailwind v4 setup —
                  checked directly in the served stylesheet, not assumed —
                  so this falls back to two plain-CSS rules in globals.css
                  (`.faq-item[open] .faq-icon-ring` / `.faq-icon-glyph`),
                  the same hand-written-CSS approach the codebase already
                  uses for .hero-drift and .cursor-spotlight. */}
              <span className="faq-icon-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-n-200 bg-n-100 transition-colors duration-[var(--dur-hover)] ease-out group-hover/row:border-apex-copper">
                <Plus
                  aria-hidden="true"
                  strokeWidth={2}
                  className="faq-icon-glyph size-5 shrink-0 text-apex-ink transition-transform duration-[var(--dur-hover)] ease-out"
                />
              </span>
            </summary>
            <p className="pb-s4 pr-[52px] text-body text-n-700">{item.answer}</p>
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
