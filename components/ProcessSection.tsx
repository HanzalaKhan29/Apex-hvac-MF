import Section from './Section';
import SectionHeading from './SectionHeading';
import ProcessStep, { type ProcessStepProps } from './ProcessStep';

/**
 * B.27 — <ProcessSection />
 *
 * The "How It Works" sequence (§5.9).
 *
 * Renders an <ol>, so the sequence is conveyed structurally and not only
 * visually (I.1). Numbering is legitimate here because this genuinely IS a
 * sequence and the order carries information.
 *
 * RESPONSIVE (H.2.7): 4 across at lg+, 2×2 at md–lg, single column below md
 * with the connector rule rendered vertically.
 *
 * MOTION: none.
 */

export interface ProcessSectionProps {
  eyebrow?: string;
  heading: string;
  steps: readonly Omit<ProcessStepProps, 'index' | 'isLast'>[];
  ground?: 'paper' | 'n50';
  id?: string;
}

export default function ProcessSection({
  eyebrow,
  heading,
  steps,
  ground = 'paper',
  id = 'process',
}: ProcessSectionProps) {
  const headingId = `${id}-heading`;
  const columns =
    steps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <Section id={id} ground={ground} labelledBy={headingId}>
      <SectionHeading
        eyebrow={eyebrow}
        heading={heading}
        level={2}
        id={headingId}
      />
      <ol className={`mt-s6 grid list-none grid-cols-1 gap-s5 ${columns}`}>
        {steps.map((step, i) => (
          <ProcessStep
            key={step.title}
            {...step}
            index={i + 1}
            isLast={i === steps.length - 1}
          />
        ))}
      </ol>
    </Section>
  );
}
