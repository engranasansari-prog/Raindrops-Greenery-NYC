/** @type {import('next').NextConfig} */

/*
 * Content-Security-Policy — REPORT-ONLY (non-enforcing).
 *
 * This NEVER blocks anything: the browser only logs violations to the console
 * (and to report-uri if we add one later). It exists so we can watch real
 * traffic and confirm the allow-list below is complete BEFORE ever switching to
 * an enforcing `Content-Security-Policy`. Adding it cannot break the site.
 *
 * The directives enumerate every origin the CLIENT actually talks to:
 *   • script  — GA loader (googletagmanager) + Meta Pixel loader (connect.facebook.net).
 *               'unsafe-inline'/'unsafe-eval' cover the inline JSON-LD, the GA &
 *               Pixel bootstrap snippets, and MapLibre GL's expression compiler.
 *   • connect — GA/GTM beacons, Meta Pixel, and the web3forms endpoint the
 *               contact form + chat assistant POST to from the browser.
 *               (The Anthropic chat call is server-side in /api/chat, so it
 *               needs no client connect-src entry.)
 *   • img     — the S3 product-image CDN, CartoDB raster map tiles, tracking
 *               pixels, plus data:/blob: for next/image + MapLibre canvases.
 *   • worker  — blob: for the MapLibre GL web worker.
 *   • style/font — 'unsafe-inline' + data: for next/font and MapLibre's
 *               injected inline styles.
 */
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // Vercel Live / Toolbar — the in-browser preview + comments overlay that only
  // YOU (logged into Vercel) ever load; real customers never request it. Its
  // domains (vercel.live for script/style/frame/font, vercel.com for images,
  // *.pusher.com for the live-comments websocket) are whitelisted per Vercel's
  // CSP guidance so the toolbar works and stops the "CSP missing Vercel Toolbar
  // domains" warning. Harmless on the public site.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://vercel.live",
  "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://api.web3forms.com https://vercel.live https://*.pusher.com wss://*.pusher.com",
  "img-src 'self' data: blob: https://s3-us-west-2.amazonaws.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://vercel.live https://vercel.com",
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "font-src 'self' data: https://vercel.live https://assets.vercel.com",
  "frame-src 'self' https://vercel.live",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "manifest-src 'self'"
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Report-Only: observe + tune; does NOT enforce, so it can't break the site.
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly }
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Tree-shake heavy barrel packages so each route ships only the icons and
  // motion primitives it actually uses — smaller JS, faster on mobile/low-end.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  // Production deploy: the site is served at the ROOT of its Vercel origin
  // https://raindrops-greenery-nyc.vercel.app, so basePath stays empty. The env
  // override is kept only as an escape hatch for a future sub-path host —
  // leave NEXT_PUBLIC_BASE_PATH UNSET in Vercel (setting it would prefix
  // every route while canonicals / sitemap / JSON-LD still point at the bare
  // subdomain, breaking links).
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allowed quality levels for next/image. The hero (the LCP element) sits
    // behind an 0.78–0.94 dark gradient + film grain + Ken Burns drift, so a
    // q50 AVIF is visually identical to q75 there while cutting ~40–60% of the
    // LCP byte cost. Product cards stay at the default 75. (Next 16 requires
    // every non-default quality used in <Image quality=…> to be listed here.)
    qualities: [50, 60, 75],
    // Long edge cache — Dutchie product images don't change; once Next.js
    // optimizes one, keep it for a year.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Tighter device + image sizes so we don't generate unused 3840px
    // variants of small product cards.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Only one upstream host actually serves <Image> sources: every product
    // photo in data/products.json is an s3-us-west-2.amazonaws.com/dutchie-images
    // URL. The previously-listed raindropsgreenery.dispensary.shop /
    // storage.googleapis.com / origin.dispensary.shop hosts had no remaining
    // next/image references, so they're dropped to keep the allow-list tight.
    remotePatterns: [
      // V8 — Dutchie product image CDN
      {
        protocol: 'https',
        hostname: 's3-us-west-2.amazonaws.com',
        pathname: '/dutchie-images/**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
