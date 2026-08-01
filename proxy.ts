import { NextResponse, type NextRequest } from 'next/server';

/**
 * F.1 — locale handling.
 *
 * The App Router [locale] segment ships from the start with `en` as the sole
 * configured locale, so adding Spanish later is a CONTENT TASK RATHER THAN A
 * REFACTOR (§8.4). Retrofitting i18n into a five-template Next.js site after
 * launch is meaningfully more work than accounting for it now, and there is
 * zero migration cost to doing it here.
 *
 * `localePrefix: 'as-needed'`: the default locale renders UNPREFIXED, so
 * canonical URLs are /services/ac-repair, never /en/services/ac-repair —
 * §8.1 requires clean, keyword-bearing slugs.
 *
 * Both halves of F.1 and F.3's third rule live here rather than split with
 * next.config:
 *
 *   1. An unprefixed request is REWRITTEN onto the `en` segment. No redirect,
 *      no visible prefix, no duplicate URL.
 *   2. An external request for the PREFIXED form is REDIRECTED 308 to the
 *      canonical unprefixed path, so /en/* can never become an indexable
 *      duplicate (F.3).
 *
 * Keeping (2) here rather than in next.config's redirect table is load-bearing,
 * not stylistic: a proxy runs BEFORE next.config redirects, so a config-level
 * /en → / redirect would fire on the rewrite this proxy has just performed and
 * loop the request. Rewrites are internal and do not re-enter the proxy, so
 * both rules coexist safely in one place.
 */

export const config = {
  matcher: [
    /*
     * Everything except Next internals, the static asset roots, and the
     * generated metadata routes, which must be served at their real paths.
     */
    '/((?!_next/|images/|brands/|fonts/|favicon\\.|icon-|apple-touch-icon|logo-|site\\.webmanifest|robots\\.txt|sitemap\\.xml).*)',
  ],
};

const DEFAULT_LOCALE = 'en';
const PREFIX = `/${DEFAULT_LOCALE}`;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // (2) The prefixed form is never canonical.
  if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) {
    url.pathname = pathname.slice(PREFIX.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  // (1) Resolve the unprefixed request onto the locale segment.
  url.pathname = `${PREFIX}${pathname === '/' ? '' : pathname}`;

  return NextResponse.rewrite(url);
}
