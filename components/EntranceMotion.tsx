'use client';

import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * §4.11 override — Z.32 (Appendix Z), owner-requested, 2026-08-09.
 *
 * §4.11 previously read: "Entrance motion is a PAGE-LOAD device, not a scroll
 * device," and restricted scroll-triggered animation to three narrow
 * exceptions (<StatBlock />'s count-up, <MobileStickyBar />'s slide-in,
 * <ProcessStep />'s connector fill — Z.21). That restraint rule is
 * DELIBERATELY LIFTED here, owner-approved, in favour of a site-wide
 * scroll-reveal + parallax + inertial-scroll treatment (reference: the
 * agency's own metricfront.netlify.app, which pairs Lenis smooth scroll with
 * scroll-triggered Framer Motion reveals). This file is now that mechanism's
 * single mount point, GSAP/ScrollTrigger-driven instead.
 *
 * WHY GSAP HERE AND NOT FRAMER MOTION, GIVEN FRAMER MOTION IS ALREADY A
 * DEPENDENCY (used by <ReviewsMarquee />): owner's explicit tool choice.
 * ScrollTrigger's scrub/pin primitives are also the more direct route to real
 * parallax (a scroll-position-linked transform), vs. reveal-only patterns.
 *
 * BUNDLE BUDGET (J.4, revised in Appendix Z to a ~3KB-headroom floor — see
 * scripts/check-bundle.mjs): gsap + ScrollTrigger + lenis add real weight, so
 * this component is NEVER statically imported. It is mounted via
 * `next/dynamic(() => import('@/components/EntranceMotion'), { ssr: false })`
 * in app/[locale]/layout.tsx — the same technique J.6 already established for
 * <MegaMenu /> / <MobileNavDrawer /> — so the chunk ships as a separate,
 * post-hydration download and is not counted against first-load JS.
 *
 * THE OPT-OUT MODEL, NOT OPT-IN. Rather than threading a new prop through
 * every section component (dozens of files), this hooks the attribute
 * <Section /> ALREADY puts on every band it renders: `data-ground`. Any
 * section is scroll-reveal-eligible by default; a section opts OUT with
 * `data-motion="none"` (used by <Hero />, which keeps its own page-load
 * stagger and would double-animate if it also scroll-revealed — it is
 * usually already on screen at load).
 *
 * STAGGERED CHILDREN. Sections that already mark `data-entrance` (the former
 * threshold mechanism's attribute — kept as a name for continuity) get their
 * `[data-entrance-item]` children staggered individually instead of fading as
 * one block; a `data-entrance` section is excluded from the whole-section
 * fade below so the two never layer on the same content.
 *
 * PARALLAX. Any element carrying `data-parallax="<percent>"` gets a
 * scroll-scrubbed vertical drift of that many viewport-heights as its
 * containing section crosses the viewport — used sparingly, on decorative
 * layers only (hero glow, hero/service imagery, <WhyApexSection />'s photo),
 * never on text, so legibility is never in motion.
 *
 * ACCESSIBILITY (I.8, WCAG 2.3.3). Under prefers-reduced-motion: reduce this
 * component does nothing at all — no Lenis, no ScrollTrigger, no listener —
 * and returns early before any GSAP call. Content already renders at its
 * final visible state from SSR/CSS, so a reduced-motion visitor (or a visitor
 * whose JS fails to load at all) sees the real page, not a hidden one.
 */
export default function EntranceMotion() {
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---- Lenis inertial scroll, driven by GSAP's ticker (the pairing GSAP's
    // own docs recommend) so ScrollTrigger and the smoothed scroll position
    // never fall out of sync. lagSmoothing(0) stops GSAP from "catching up"
    // after a long tab-switch stall, which otherwise reads as a stutter.
    const lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const EASE = 'power3.out';
      const DUR = 0.8;
      const RISE = 28;

      // ---- Explicit stagger containers (data-entrance) ---------------------
      const staggerContainers = gsap.utils.toArray<HTMLElement>('[data-entrance]');
      staggerContainers.forEach((container) => {
        const items = container.querySelectorAll<HTMLElement>('[data-entrance-item]');
        const targets = items.length ? Array.from(items) : [container];
        gsap.from(targets, {
          opacity: 0,
          y: RISE,
          duration: DUR,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
        });
      });

      // ---- Generic whole-section reveal (every <Section />, opt-out) -------
      const groundSections = gsap.utils.toArray<HTMLElement>('[data-ground]');
      groundSections.forEach((section) => {
        if (section.dataset.motion === 'none') return;
        if (section.hasAttribute('data-entrance')) return;
        if (section.querySelector('[data-entrance]')) return;

        gsap.from(section, {
          opacity: 0,
          y: RISE,
          duration: DUR,
          ease: EASE,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
        });
      });

      // ---- Parallax layers ---------------------------------------------------
      const parallaxEls = gsap.utils.toArray<HTMLElement>('[data-parallax]');
      parallaxEls.forEach((el) => {
        const percent = Number(el.dataset.parallax) || -12;
        const scroller = el.closest<HTMLElement>('section') ?? el;
        gsap.to(el, {
          yPercent: percent,
          ease: 'none',
          scrollTrigger: {
            trigger: scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });
    });

    // Layout settles a beat after web fonts / images finish (esp. the hero
    // and <WhyApexSection />'s fixed-aspect crops), which shifts trigger
    // positions — one refresh on window load keeps start points accurate.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ctx.revert(); // Kills every ScrollTrigger/tween this context created.
    };
  }, []);

  return null;
}
