import Section from '@/components/Section';
import SectionHeading from '@/components/SectionHeading';
import ServicesGrid from '@/components/ServicesGrid';
import Button from '@/components/Button';
import RouteSearch from '@/components/RouteSearch';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/contact';
import { SERVICE_LIST, servicePath, serviceLinkLabel } from '@/lib/services';
import { CTA } from '@/lib/ui';

/**
 * B.33 — NotFoundTemplate. A.17's four blocks.
 *
 *   1 H1 — "That page moved. Your AC problem didn't." (§9.2, verbatim)
 *   2 Primary action — Call Now
 *   3 Links to the six service pages
 *   4 Search — a client-side filter over the 23 indexable routes
 *
 * PURPOSE: recover a lost visitor INTO the funnel rather than ending the
 * session. The H1 makes the point that the page failed but the problem did not.
 *
 * The body lives here rather than in a route file because TWO routes render it:
 * app/[locale]/not-found.tsx (for notFound() raised inside the locale segment)
 * and app/not-found.tsx (for paths that never resolve into that segment at
 * all). Both must look identical and both must carry chrome — A.17 is explicit
 * that the mobile sticky bar renders here as everywhere else, since a visitor
 * who has hit a dead end is exactly the visitor who most needs a visible phone
 * number.
 *
 * Emits NO structured data (A.17): attaching HVACBusiness to a 404 response
 * would bind the entity to a non-page.
 */
export default function NotFoundTemplate() {
  const compactItems = SERVICE_LIST.map((service) => ({
    variant: 'compact' as const,
    title: service.cardTitle,
    href: servicePath(service.slug),
    linkLabel: serviceLinkLabel(service),
  }));

  return (
    <>
      <Section labelledBy="notfound-heading">
        <SectionHeading
          heading="That page moved. Your AC problem didn't."
          level={1}
          id="notfound-heading"
          lede="The link you followed doesn't exist any more. Here's the fastest way to whatever you were actually looking for."
        />

        <div className="mt-s5 flex flex-col gap-s3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            href={`tel:${PHONE_E164}`}
            fullWidth
            className="sm:w-auto"
          >
            Call Now — {PHONE_DISPLAY}
          </Button>
          <Button
            variant="outline-light"
            size="lg"
            href="/contact"
            fullWidth
            className="sm:w-auto"
          >
            {CTA.full}
          </Button>
        </div>
      </Section>

      <ServicesGrid
        variant="compact"
        heading="Our services"
        items={compactItems}
        ground="n50"
        id="notfound-services"
      />

      <Section labelledBy="notfound-search-heading">
        <h2 id="notfound-search-heading" className="text-h2">
          Or search the site
        </h2>
        <div className="mt-s4">
          <RouteSearch />
        </div>
      </Section>
    </>
  );
}
