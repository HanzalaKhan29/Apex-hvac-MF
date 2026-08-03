import type { NextConfig } from 'next';

/**
 * Appendix F — Routing manifest.
 * F.2 canonical URLs, F.3 redirects, J.3 image pipeline, J.6 rendering.
 */
const nextConfig: NextConfig = {
  // F.2 — trailing slashes normalised off.
  trailingSlash: false,

  // OWASP A05 — stop advertising the framework/version in every response.
  poweredByHeader: false,

  // J.3 — AVIF and WebP variants generated from JPEG sources.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Appendix H's declared layout widths; keeps the generated variant set tight.
    deviceSizes: [480, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [96, 128, 256, 384],
  },

  /**
   * Security headers — OWASP A05 (Security Misconfiguration).
   *
   * Not specified by the blueprint, which covers design, content and
   * performance rather than transport security. Added because this site
   * collects personal data (name, phone, ZIP) on behalf of a licensed
   * contractor, and shipping it with no CSP, no clickjacking defence and no
   * MIME-sniffing protection would be negligent regardless of what the spec
   * enumerates. Logged in Appendix Z.
   *
   * The CSP is deliberately conservative but NOT nonce-based: Next's App
   * Router inlines RSC payload scripts, so a nonce-only policy needs
   * per-request middleware and forces every route dynamic, which would break
   * J.6's requirement that all 23 indexable routes are statically generated.
   * 'unsafe-inline' for scripts is the cost of that trade and is stated here
   * rather than hidden.
   */
  async headers() {
    // Dev-only: React's dev bundle uses eval() to reconstruct stack traces
    // across module boundaries (React never does this in production — see
    // its own console message). Without 'unsafe-eval' here, `next dev` spams
    // a harmless-but-noisy console error on every navigation. Scoped to
    // development so production's CSP stays exactly as strict as before.
    const isDev = process.env.NODE_ENV === 'development';
    const csp = [
      "default-src 'self'",
      // googletagmanager: GA4 (§8.6). challenges.cloudflare.com: Turnstile (G.4).
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://challenges.cloudflare.com`,
      // Tailwind injects styles; next/font emits inline @font-face.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com",
      'frame-src https://challenges.cloudflare.com',
      // Clickjacking defence. Modern equivalent of X-Frame-Options.
      "frame-ancestors 'none'",
      "base-uri 'self'",
      // The forms post to their own origin via Server Actions and nowhere else.
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            // Nothing here needs any of these, so all are denied outright.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Two years, subdomains included. Safe here because the site is
            // HTTPS-only and F.2 already requires one canonical host.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Isolates this browsing context from cross-origin openers
            // (Spectre-class defence). "allow-popups" so the Turnstile
            // widget's own popup path, if it ever needs one, still works.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },

  // F.3 — redirect table. All three are defensive; none of these paths was ever live.
  async redirects() {
    return [
      {
        // Route cut in v1.1 (§3.4). The quote form is the booking mechanism.
        source: '/book-a-service',
        destination: '/contact',
        statusCode: 301,
      },
      {
        // The HTML site-map page is cut (§3.1). This catches the intuitive guess.
        source: '/sitemap',
        destination: '/sitemap.xml',
        statusCode: 301,
      },
      /*
       * F.3's third rule — /en/* → /* (308) — is enforced in proxy.ts, not
       * here. A proxy runs BEFORE next.config redirects, so a config-level
       * rule would fire on the rewrite the proxy just performed and loop the
       * request. See the comment block in proxy.ts.
       */
    ];
  },
};

export default nextConfig;
