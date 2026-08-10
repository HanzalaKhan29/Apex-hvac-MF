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
 * MOTION (B.23; §4.11's threshold restriction lifted by Z.32). `animateEntrance`
 * still marks the grid `data-entrance` for CARD-LEVEL stagger (each
 * <ServiceCard /> reveals individually) — originally the homepage-only
 * distinction. Every other instance is no longer static: <EntranceMotion />'s
 * generic `[data-ground]` sweep now fades the whole <Section /> (heading +
 * grid together) as one block when it scrolls into view, since it isn't
 * marked `data-entrance` and so falls through to that fallback.
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
