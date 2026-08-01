import Section from './Section';
import SectionHeading from './SectionHeading';
import ServiceCard, { type ServiceCardProps } from './ServiceCard';
import Button from './Button';

/**
 * B.23 — <ServicesGrid />
 *
 * The card grid used for services on the homepage, the services index, every
 * service page's related-services block, city pages and /404 (§5.5, §9.1).
 *
 * VARIANTS
 *   full     — six cards, 3×2
 *   related  — two or three sibling cards (§8.1's internal-linking rule)
 *   city     — five city cards
 *   compact  — title-and-link cards, /404 only
 *
 * RESPONSIVE (H.2.3): 3 columns at lg+, 2 at md–lg, 1 below md. Gap --s-4
 * desktop, --s-3 mobile. align-items: stretch throughout, with each card's
 * link pinned to the bottom, so six cards of varying copy length produce even
 * heights without a min-height hack (§5.5).
 *
 * MOTION (§4.11, B.23): the homepage instance is the one grid above the
 * entrance threshold and the only one that animates in. Every other instance
 * renders statically with NO IntersectionObserver attached at all — not
 * "observe and skip". Opting in is `animateEntrance`, which only marks the
 * grid; <EntranceMotion /> does the single threshold measurement.
 */

export interface ServicesGridProps {
  variant?: 'full' | 'related' | 'city' | 'compact';
  eyebrow?: string;
  heading?: string;
  items: readonly ServiceCardProps[];
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Marks this grid animation-eligible. Homepage services grid only (B.23). */
  animateEntrance?: boolean;
  ground?: 'paper' | 'n50';
  id?: string;
}

export default function ServicesGrid({
  variant = 'full',
  eyebrow,
  heading,
  items,
  showViewAll,
  viewAllHref = '/services',
  viewAllLabel = 'View All Services',
  animateEntrance,
  ground = 'paper',
  id,
}: ServicesGridProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <Section id={id} ground={ground} labelledBy={headingId}>
      {heading ? (
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          level={2}
          id={headingId}
        />
      ) : null}

      {/* Rendered as a <ul> of <li> cards so the count is announced (I.1). */}
      <ul
        data-entrance={animateEntrance ? '' : undefined}
        className={[
          heading ? 'mt-s6' : '',
          'grid list-none items-stretch gap-s3 md:gap-s4',
          variant === 'compact'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {items.map((item) => (
          <ServiceCard key={item.href} {...item} variant={variant === 'full' ? 'service' : variant === 'related' ? 'service' : variant} />
        ))}
      </ul>

      {showViewAll ? (
        <div className="mt-s6">
          {/* A <Button variant="ink">, not a card (B.23). */}
          <Button variant="ink" href={viewAllHref}>
            {viewAllLabel}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
