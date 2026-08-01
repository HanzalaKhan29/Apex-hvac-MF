/**
 * B.8 — <SectionHeading />
 *
 * The eyebrow-plus-heading unit used at the top of every content band, so
 * eyebrow casing, tracking, colour and heading measure are defined ONCE rather
 * than per section (§4.3's rules would otherwise have to hold in ~10 places).
 */

export interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  level?: 1 | 2 | 3;
  lede?: string;
  align?: 'start' | 'center';
  /** Applied to the heading element so <Section labelledBy> can point at it. */
  id?: string;
}

export default function SectionHeading({
  eyebrow,
  heading,
  level = 2,
  lede,
  align = 'start',
  id,
}: SectionHeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';

  // Display scale for the page title, section scale below it.
  const size =
    level === 1 ? 'text-h1' : level === 2 ? 'text-h2' : 'text-h3';

  const centered = align === 'center';

  return (
    <div className={centered ? 'text-center' : undefined}>
      {eyebrow ? (
        /*
         * The eyebrow is NOT a heading element — it is a <p> — so heading
         * levels are never skipped and the eyebrow does not pollute the
         * document outline (B.8, I.1).
         *
         * Colour resolves from --accent, which <Section ground="ink"> rebinds
         * to --apex-copper-dark, so §4.2's contextual-accent rule holds
         * without this component knowing which ground it sits on.
         */
        <p className={`eyebrow text-[var(--accent)] ${centered ? '' : ''}`}>
          {eyebrow}
        </p>
      ) : null}

      <Tag
        id={id}
        className={[
          size,
          // Geist 800 and --tracking-tight come from the base layer.
          // Capped at --measure-display (24ch): without this the H1 runs the
          // full 1152px content width at desktop and reads as a banner rather
          // than a headline (§4.3, C.6).
          'measure-display',
          centered ? 'mx-auto' : '',
          eyebrow ? 'mt-s2' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {heading}
      </Tag>

      {lede ? (
        <p
          className={[
            'text-body-lg measure-body mt-s3',
            centered ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
