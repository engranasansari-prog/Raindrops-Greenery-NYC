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
  // Production deploy path: the site lives at
  // https://www.raindropsgreenery.com/nyc-raindrops-greenery
  // basePath makes every internal Next.js route render under that prefix
  // and ensures <Link>, next/image, and the asset pipeline all generate
  // correctly prefixed URLs. Use BASE_PATH env var so we can still run
  // local dev / preview without the prefix.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    formats: ['image/avif', 'image/webp'],
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
