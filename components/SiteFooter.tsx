import Link from 'next/link';
import Logo from './Logo';
import PhoneLink from './PhoneLink';
import type { MegaMenuItem } from './MegaMenu';
import { ADDRESS, BUSINESS_NAME, SERVICE_AREAS, TAGLINE } from '@/lib/contact';
import { ph } from '@/lib/placeholders';

/**
 * B.5 — <SiteFooter />
 *
 * Four-column footer — brand and licence info, services, company, service
 * areas — plus the legal links row and NAP block (§5.12).
 *
 * RESPONSIVE (B.5, H.1.5): 4 columns at lg+, 2 at md–lg, single column below
 * md stacked brand → services → company → service areas → legal. Bottom
 * padding adds --stickybar-h so the sticky bar never covers the legal row;
 * because that token resolves to 0 at lg+, one rule is correct at both ends.
 *
 * ACCESSIBILITY (B.5, I.7): <footer> landmark, each column has a real heading.
 * LEGAL LINKS ARE EXEMPT FROM THE 44px TARGET RULE — they sit inside a
 * sentence-level row, and padding them would break line rhythm (§6.2's 2.5.8
 * inline exception).
 *
 * CONTENT GATES (§9.4, B.5): the ROC number, BBB or other trust micro-badges,
 * and the email address are all CLIENT ACTION REQUIRED. Each renders ONLY when
 * supplied; none has an invented fallback value.
 *
 * The NAP block is real text, byte-identical to the HVACBusiness JSON-LD and
 * to the Google Business Profile (§8.5).
 */

export interface SiteFooterProps {
  services: readonly MegaMenuItem[];
  cities: readonly MegaMenuItem[];
}

const COMPANY_LINKS: MegaMenuItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Financing', href: '/financing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

function Column({
  heading,
  items,
}: {
  heading: string;
  items: readonly MegaMenuItem[];
}) {
  return (
    <div>
      <h2 className="eyebrow text-apex-copper-dark">{heading}</h2>
      <ul className="mt-s3 flex list-none flex-col gap-s2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              /* `flex w-full` rather than `inline-flex` so the target spans the
                 column width. A short label like "FAQ" or "Mesa" is only ~31px
                 wide inline, which clears the 24px normative minimum but not
                 Apex's own 44×44 standalone-control standard (I.7). These are
                 column links, not inline prose links, so the inline exception
                 does not apply to them — it applies to the legal row below. */
              className="flex w-full min-h-11 items-center text-body text-apex-paper/75 transition-colors duration-[var(--dur-button)] ease-out hover:text-apex-paper"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({ services, cities }: SiteFooterProps) {
  const roc = ph('rocNumber');
  const email = ph('email');
  const bbb = ph('bbbAccredited');

  return (
    <footer
      className="bg-apex-ink text-apex-paper [--accent:var(--color-apex-copper-dark)]"
      // Never covered by the sticky bar; the token is 0 at lg+ (H.1.5).
      style={{ paddingBottom: 'var(--stickybar-h)' }}
    >
      <div className="container-max px-[var(--section-padding-inline)] py-s7 lg:py-s8">
        <div className="grid gap-s6 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand and licence info. */}
          <div>
            <Logo variant="full" scheme="light" className="h-10 w-auto" />
            <p className="mt-s3 text-body text-apex-paper/75">{TAGLINE}</p>

            {/* NAP — byte-identical to the JSON-LD and the GBP (§8.5). */}
            <address className="mt-s4 flex flex-col gap-s1 not-italic text-small text-apex-paper/75">
              <span>{BUSINESS_NAME}</span>
              {ADDRESS.streetAddress ? <span>{ADDRESS.streetAddress}</span> : null}
              <span>
                {ADDRESS.addressLocality}, {ADDRESS.addressRegion}
                {ADDRESS.postalCode ? ` ${ADDRESS.postalCode}` : ''}
              </span>
              <PhoneLink display="full" context="footer" />
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="transition-colors duration-[var(--dur-button)] ease-out hover:text-apex-paper"
                >
                  {email}
                </a>
              ) : null}
            </address>

            <p className="mt-s3 text-micro text-apex-paper/60">
              Licensed · Bonded · Insured
              {/* Renders only when the real ROC number is supplied (§9.4). */}
              {roc ? (
                <>
                  {' · '}
                  <span>
                    Arizona ROC <span className="num">{roc}</span>
                  </span>
                </>
              ) : null}
            </p>

            {bbb ? (
              <p className="mt-s2 text-micro text-apex-paper/60">{bbb}</p>
            ) : null}
          </div>

          <Column heading="Services" items={services} />
          <Column heading="Company" items={COMPANY_LINKS} />
          <Column heading="Service Areas" items={cities} />
        </div>

        {/* Legal row — ordinary inline links, deliberately NOT padded to 44px. */}
        <div className="mt-s6 flex flex-col gap-s2 border-t border-apex-paper/15 pt-s4 text-micro text-apex-paper/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS_NAME}. Serving{' '}
            {SERVICE_AREAS.join(', ')}.
          </p>
          <p className="flex flex-wrap gap-x-s3 gap-y-s1">
            <Link href="/privacy-policy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="underline underline-offset-2">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="underline underline-offset-2">
              Cookie Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
