import Section from './Section';
import SectionHeading from './SectionHeading';
import ReviewCard, { type ReviewCardProps } from './ReviewCard';
import Button from './Button';

/**
 * B.28 — <ReviewsSection />
 *
 * The curated review band (homepage) and the full set (/reviews) (§5.10).
 *
 * CURATION RULE (B.28, §5.10): `curated` is EXACTLY THREE cards selected for
 * service-type diversity — one emergency repair, one commercial, one financing
 * or install. This is not decorative. It is how commercial evidence reaches
 * the homepage now that §3.3's homepage projects teaser grid is withdrawn.
 *
 * MODE PROPAGATION: `mode` is read from one place and passed down. A page
 * cannot mix demo and live cards.
 *
 * STRUCTURED DATA: this component emits NO review markup. Review and
 * AggregateRating are emitted by the page-level <JsonLd /> and only in live
 * mode (§8.1, A.10). Fabricated structured data is never emitted.
 *
 * No carousel at any width: §6.2's 2.5.7 row bars a drag-only control, and a
 * carousel would need prev/next buttons as the primary control anyway.
 */

export interface ReviewsSectionProps {
  variant?: 'curated' | 'full';
  mode: 'demo' | 'live';
  reviews: readonly Omit<ReviewCardProps, 'mode'>[];
  eyebrow?: string;
  heading?: string;
  lede?: string;
  showViewAll?: boolean;
  ground?: 'paper' | 'n50';
  id?: string;
}

export default function ReviewsSection({
  variant = 'curated',
  mode,
  reviews,
  eyebrow,
  heading,
  lede,
  showViewAll,
  ground = 'paper',
  id = 'reviews',
}: ReviewsSectionProps) {
  const headingId = `${id}-heading`;
  const shown = variant === 'curated' ? reviews.slice(0, 3) : reviews;

  return (
    <Section id={id} ground={ground} labelledBy={headingId}>
      {heading ? (
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          lede={lede}
          level={2}
          id={headingId}
        />
      ) : (
        /* B.7 / I.1 — a landmark is never anonymous. On /reviews the band is
           the whole page and needs no visible heading, so it carries a
           visually-hidden one instead, exactly as <StatsSection /> does. */
        <h2 id={headingId} className="visually-hidden">
          Customer reviews
        </h2>
      )}

      {/*
       * H.2.8 — 1 column below md; 2 at md–lg with the third card full-width
       * beneath; 3 at lg+. Uniform grid with align-items: stretch, so quotes of
       * differing length produce even card heights at every width (H.5.5).
       */}
      <ul
        className={[
          heading ? 'mt-s6' : '',
          'grid list-none items-stretch gap-s3 md:grid-cols-2 md:gap-s4 lg:grid-cols-3',
          variant === 'curated' ? '[&>li:nth-child(3)]:md:col-span-2 [&>li:nth-child(3)]:lg:col-span-1' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {shown.map((review, i) => (
          <ReviewCard key={`${review.attribution}-${i}`} {...review} mode={mode} />
        ))}
      </ul>

      {showViewAll ? (
        <div className="mt-s6">
          <Button variant="ink" href="/reviews">
            Read All Reviews
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
