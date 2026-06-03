/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Tree-shake heavy barrel packages so each route ships only the icons and
  // motion primitives it actually uses — smaller JS, faster on mobile/low-end.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  // Production deploy: the site is served at the ROOT of the subdomain
  // https://nyc.raindropsgreenery.com, so basePath stays empty. The env
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raindropsgreenery.dispensary.shop'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: 'origin.dispensary.shop'
      },
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
