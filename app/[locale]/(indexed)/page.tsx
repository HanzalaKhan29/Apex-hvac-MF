import type { Metadata } from 'next';
import { BadgeCheck, CreditCard, Receipt, Timer } from 'lucide-react';
import Hero from '@/components/Hero';
import QuoteCard from '@/components/QuoteCard';
import LogoStrip from '@/components/LogoStrip';
import ServicesGrid from '@/components/ServicesGrid';
import StatsSection from '@/components/StatsSection';
import WhyApexSection from '@/components/WhyApexSection';
import FinancingBanner from '@/components/FinancingBanner';
import ProcessSection from '@/components/ProcessSection';
import ReviewsSection from '@/components/ReviewsSection';
import FooterCTA from '@/components/FooterCTA';
import { PHONE_E164, SITE_URL } from '@/lib/contact';
import { HOME, DEMO_REVIEWS, MANUFACTURER_BRANDS } from '@/lib/content';
import { CTA, heroTrustRow, serviceCards } from '@/lib/ui';
import { gateOpen } from '@/lib/placeholders';

/**
 * A.1 — `/` Homepage. Template: HomeTemplate.
 *
 * PURPOSE: route visitors to the correct service or city page, and convert the
 * emergency-intent segment directly through the hero form or the phone. THE
 * HOMEPAGE'S JOB IS TO ROUTE, NOT TO CONVERT EVERYONE (§1.4) — dedicated
 * service pages convert at 15–25% against 3–5% for homepage traffic.
 *
 * Ordered sections (§5, sequence carried forward from phase0 per §0.2):
 *   1 Hero + QuoteCard   58/42 asymmetric, --apex-ink, no background photo
 *   2 Manufacturer strip gated by §9.4
 *   3 Services           6 cards, 3×2
 *   4 Stats              4 blocks on --apex-ink
 *   5 Why Apex           image/text split, 4 rows, floating stat badge
 *   6 Financing banner   --apex-sage-tint ground, --apex-ink text
 *   7 Process            4 steps
 *   8 Reviews            3 cards, demo-mode attribution
 */

export const metadata: Metadata = {
  title:
    'Apex Comfort Systems | Licensed HVAC Repair & Installation, Phoenix Metro',
  description:
    'Licensed and insured HVAC for Phoenix metro. Same-day AC repair available, flat-rate pricing, no surprises. Call 24/7 or get your flat-rate quote.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title:
      'Apex Comfort Systems | Licensed HVAC Repair & Installation, Phoenix Metro',
    description:
      'Licensed and insured HVAC for Phoenix metro. Same-day AC repair available, flat-rate pricing, no surprises. Call 24/7 or get your flat-rate quote.',
    type: 'website',
    url: `${SITE_URL}/`,
  },
  twitter: { card: 'summary_large_image' },
};

export default function HomePage() {
  /*
   * §5.7's four features. The NATE row is §9.4-gated and is REMOVED, NOT
   * SOFTENED, when no currently certified technician is on staff (B.19, H.5.3).
   *
   * The financing row does not state "0%": any APR or "0%" claim requires the
   * actual lender agreement, and "0% financing available" with no qualifying
   * language is a lending-advertising exposure (§9.4, B.26).
   */
  const whyFeatures = [
    {
      icon: Timer,
      title: 'Two-Hour Dispatch Window',
      description:
        'Call before 4pm and a technician is on the way within two hours — same-day service, available seven days a week. Emergency calls jump the queue, day or night.',
    },
    {
      icon: Receipt,
      title: 'Upfront, Flat-Rate Pricing',
      description:
        'The price is quoted before the work starts and does not move once you approve it. No hourly meter, no discovered extras, no surprises on the invoice.',
    },
    ...(gateOpen('nateCertified')
      ? [
          {
            icon: BadgeCheck,
            title: 'NATE-Certified Technicians',
            description:
              'Background-checked, licensed and drug-screened, on a named manufacturer-specific certification track rather than an adjective stack.',
          },
        ]
      : []),
    {
      icon: CreditCard,
      title: 'Financing Available',
      description:
        'A failed system is rarely a planned expense. Financing options are presented before you commit, so the decision is about the right system rather than this month’s cash.',
      href: '/financing',
    },
  ];

  return (
    <>
      {/* 1 — Hero. No background photography by design (§5.3, IMG-02): the LCP
             element is the H1, text rather than an image (J.1). */}
      <Hero
        variant="home"
        eyebrow={HOME.hero.eyebrow}
        heading={HOME.hero.heading}
        subhead={HOME.hero.subhead}
        trustItems={heroTrustRow()}
        primaryCta={{ label: CTA.full, href: '#quote' }}
        secondaryCta={{ label: CTA.call, href: `tel:${PHONE_E164}` }}
      >
        <QuoteCard variant="hero" formLocation="hero" />
      </Hero>

      {/* 2 — Manufacturer authority signal, placed immediately after the hero. */}
      <LogoStrip brands={MANUFACTURER_BRANDS} />

      {/* 3 — Services. The ONE grid above the §4.11 entrance threshold, and
             therefore the only one on the site that animates in. */}
      <ServicesGrid
        id="services"
        variant="full"
        eyebrow={HOME.services.eyebrow}
        heading={HOME.services.heading}
        items={serviceCards()}
        showViewAll
        animateEntrance
        ground="n50"
      />

      {/* 4 — Stats. Roboto numerals on --apex-ink; no icon per stat. */}
      <StatsSection stats={HOME.stats.map((s) => ({ ...s }))} />

      {/* 5 — Why Apex. Evidence-led, not claim-led. */}
      <WhyApexSection
        eyebrow={HOME.whyApex.eyebrow}
        heading={HOME.whyApex.heading}
        image={{
          src: 'technician-condenser-repair.jpg',
          alt: 'Technician kneeling beside an outdoor residential condenser unit, using a digital refrigerant manifold gauge',
          focalPoint: '62% 45%',
        }}
        badge={HOME.whyApex.badge}
        features={whyFeatures}
      />

      {/* 6 — Financing. A standalone visual beat, not a feature-list item. */}
      <FinancingBanner
        heading={HOME.financing.heading}
        body={HOME.financing.body}
        cta={{ label: 'See financing options', href: '/financing' }}
      />

      {/* 7 — Process. A real sequence, so an <ol> with numbered rings. */}
      <ProcessSection
        eyebrow={HOME.process.eyebrow}
        heading={HOME.process.heading}
        steps={HOME.process.steps.map((s) => ({ ...s }))}
        ground="n50"
      />

      {/* 8 — Reviews. Demo-mode attribution until real GBP data exists. */}
      <ReviewsSection
        variant="curated"
        mode="demo"
        eyebrow={HOME.reviews.eyebrow}
        heading={HOME.reviews.heading}
        reviews={DEMO_REVIEWS.map((r) => ({ ...r }))}
        showViewAll
      />

      <FooterCTA heading={HOME.footerCta.heading} body={HOME.footerCta.body} />
    </>
  );
}
