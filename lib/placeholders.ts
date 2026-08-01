/**
 * §9.4 placeholder register / A.0.5 placeholder handling.
 *
 * Every §9.4-flagged value is read from this single module. Each entry is
 * typed `{ value: string | null; placeholder: true }`.
 *
 *   - Where v1.1 states an example value, that exact string carries forward
 *     unchanged.
 *   - Where v1.1 states no value, `value` is null, the entry is marked
 *     CLIENT ACTION REQUIRED, and the consuming component renders the
 *     fallback specified in Appendix B rather than any invented figure.
 *
 * NOTHING FABRICATED SHIPS TO PRODUCTION. `npm run report:placeholders`
 * enumerates every flagged entry in use; §9.5 step 11 is satisfied by that
 * report, not by inspection.
 */

export interface PlaceholderEntry {
  readonly value: string | null;
  readonly placeholder: true;
  /** Why this is gated, and what has to be true before it may ship. */
  readonly note: string;
}

const flag = (value: string | null, note: string): PlaceholderEntry => ({
  value,
  placeholder: true,
  note,
});

export const placeholders = {
  /* --- Contact ---------------------------------------------------------- */

  phone: flag(
    '(602) 555-0100',
    'Inherited phase0 placeholder. Confirm the real number before launch. Must match the Google Business Profile exactly (§8.5).'
  ),
  email: flag(
    'info@apexcomfortsystems.com',
    'Inherited phase0 placeholder pattern. Confirm before launch.'
  ),

  /* --- Licensing and credentials ---------------------------------------- */

  rocNumber: flag(
    null,
    'Arizona ROC license number. Must be the real number. Footer and /terms-of-service render nothing until supplied.'
  ),
  nateCertified: flag(
    null,
    'NATE is an individual technician credential. Requires at least one currently certified technician on staff. If unsatisfied the claim is REMOVED, not softened. This governs the header microline, the /about credentials row, and the Why Apex feature row.'
  ),
  bbbAccredited: flag(
    null,
    'BBB or other trust micro-badges in the footer. Client-provided; renders only when supplied.'
  ),

  /* --- Hero trust row (§5.3) — the highest-visibility unverified claim ---- */

  yearsInBusiness: flag(
    '15+',
    'Years serving Phoenix. Verify against real trading history before launch.'
  ),
  googleRating: flag(
    '4.9',
    'Must match the live Google Business Profile on launch day and be re-verified quarterly. IF UNDER 4.5, REMOVE THE RATING FROM THE HERO ENTIRELY and rely on other trust signals.'
  ),
  reviewCount: flag(
    '800+',
    'Must match the live Google Business Profile. IF REAL REVIEW VOLUME IS UNDER 50, REMOVE THE COUNT and show the rating only.'
  ),

  /* --- Stats band (§5.6) ------------------------------------------------- */
  /* Two of the four have values stated in v1.1; the other two have none and
     render the em-dash fallback until the client supplies them (B.18). */

  systemsInstalled: flag(
    null,
    'No figure is stated in v1.1 and none is invented here. <StatBlock /> renders an em-dash in the numeral slot; the slot is NOT omitted, because the stats grid is a fixed four-column composition.'
  ),
  satisfactionPct: flag(
    null,
    'As above: no figure stated, none invented.'
  ),

  /* --- Response-time promise (§2.5, §3.4) -------------------------------- */

  responseWindow: flag(
    '30 minutes',
    'The "Respond" term (§2.5): a human calls back. Must be an operationally true commitment, not aspirational copy, before it ships.'
  ),
  dispatchWindow: flag(
    'two hours',
    'The "Dispatch" term (§2.5): a technician assigned and en route, with the 4pm cutoff qualifier. Must be operationally true independently.'
  ),

  /* --- Commercial gates -------------------------------------------------- */

  manufacturerDealerBrands: flag(
    null,
    'Carrier / Trane / Lennox / Rheem / York / Daikin are third-party trademarks. Only brands Apex is a genuine authorized dealer or servicer for may appear, and each requires the brand logo-usage terms to be checked. FEWER THAN FOUR CONFIRMED means <LogoStrip /> ships the "Brands We Service" TEXT LIST, which is the default state rather than a fallback branch (§5.4, Appendix Z).'
  ),
  financingApr: flag(
    null,
    'Any APR, term length or "0%" claim requires the actual lender agreement. "0% financing available" with no qualifying language is a lending-advertising exposure. Until supplied, figures render the em-dash fallback and the "0%" phrasing does not appear.'
  ),
  financingTerm: flag(null, 'As above: requires the lender agreement.'),
  maintenancePlanTiers: flag(
    null,
    'Plan tier names, inclusions and pricing. No price or tier figure is invented; the body renders the inclusion structure with tier values as the em-dash fallback (A.4.5).'
  ),

  /* --- Third-party profiles ---------------------------------------------- */

  googleBusinessProfileUrl: flag(
    null,
    'Used by the /reviews leave-a-review prompt, which DOES NOT RENDER until supplied, and by Organization sameAs, which omits the array entirely rather than shipping placeholder URLs (A.0.4).'
  ),

  /* --- Legal ------------------------------------------------------------- */

  privacyPolicyBody: flag(
    null,
    'CLIENT ACTION REQUIRED and counsel-reviewed before launch. No draft legal text is supplied; the route ships structure plus a build-blocking placeholder entry (A.15).'
  ),
  termsOfServiceBody: flag(
    null,
    'As above (A.16).'
  ),
  tcpaConsentReviewed: flag(
    null,
    'The TCPA consent copy in G.5 is legally operative. COUNSEL reviews before launch; the client approval alone is not sufficient.'
  ),

  /* --- Content that is AI-generated placeholder --------------------------- */

  reviewContent: flag(
    null,
    'All review content is illustrative. Real reviews only, sourced from the actual Google Business Profile. Demo-mode attribution (no Google branding, no stars, no verified badge) applies until real data exists (§5.10). NO Review or AggregateRating markup is emitted in demo mode.'
  ),
  technicianBios: flag(
    null,
    'Real staff or licensed stock only, never fabricated names or credentials. No Person markup is emitted and no bio placeholder with a fabricated name renders (A.8).'
  ),
  projectPhotography: flag(
    null,
    'All five /projects images are AI-generated placeholders, launch-acceptable only as an explicitly temporary measure. Client names, addresses, job values and dates are all withheld; captions carry installation type and city only.'
  ),
} as const;

export type PlaceholderKey = keyof typeof placeholders;

/** Reads a flagged value, or null where the client has not supplied one. */
export function ph(key: PlaceholderKey): string | null {
  return placeholders[key].value;
}

/**
 * B.18's fallback: the stats grid is a fixed four-column composition, so a
 * missing value renders an em-dash rather than dropping the slot.
 */
export const EM_DASH = '—';

export function phOrDash(key: PlaceholderKey): string {
  return placeholders[key].value ?? EM_DASH;
}

/** True when a §9.4 gate is satisfied and the gated content may render. */
export function gateOpen(key: PlaceholderKey): boolean {
  return placeholders[key].value !== null;
}
