/**
 * B.21 — <ProcessStep />
 *
 * One numbered step in the "How It Works" sequence (§5.9, §9.1).
 *
 * VISUAL (§5.9): the number sits in an OUTLINED RING in --apex-copper with the
 * numeral itself in --apex-ink — deliberately not the filled navy circle that
 * phase0 and all four competitor references use. Numeral set in Roboto via the
 * .num utility.
 *
 * Rendered as a list item inside an <ol> (B.27), so the sequence is conveyed
 * structurally and not only visually (I.1). The connector rule between steps is
 * decorative and aria-hidden.
 *
 * Numbering is legitimate here: this is a real sequence, and the order carries
 * information the reader needs.
 */

export interface ProcessStepProps {
  index: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function ProcessStep({
  index,
  title,
  description,
  isLast,
}: ProcessStepProps) {
  return (
    <li className="relative flex gap-s3 md:flex-col md:gap-s3">
      {!isLast ? (
        <span
          aria-hidden="true"
          className={[
            'absolute bg-n-200',
            // Vertical connector below md, horizontal across the row at md+.
            'left-6 top-14 h-[calc(100%-2rem)] w-px',
            'md:left-14 md:top-6 md:h-px md:w-[calc(100%-3.5rem)]',
          ].join(' ')}
        />
      ) : null}

      <span
        className={[
          'relative z-[var(--z-raised)] inline-flex size-12 shrink-0 items-center justify-center',
          // Outlined ring, not a filled circle.
          'rounded-full border-2 border-apex-copper bg-apex-paper',
        ].join(' ')}
      >
        <span className="num text-h4 text-apex-ink">{index}</span>
      </span>

      <div className="min-w-0">
        <h3 className="text-h4 text-apex-ink">{title}</h3>
        <p className="mt-s1 text-body measure-body text-n-700">{description}</p>
      </div>
    </li>
  );
}
