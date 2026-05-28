import type { MetadataRoute } from 'next';

/**
 * PWA manifest — generated (not a static public/manifest.json) so that
 * start_url, scope, and icon paths automatically pick up the deployment
 * base path. On the sub-path deploy (NEXT_PUBLIC_BASE_PATH=/nyc-raindrops-greenery)
 * a static manifest would point the PWA at the apex (wrong app); deriving
 * from the same env var next.config uses for basePath keeps them in lockstep.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Raindrops Greenery NY',
    short_name: 'Raindrops NY',
    description:
      'Premium 21+ cannabis delivery for Manhattan, Brooklyn (Williamsburg, Greenpoint), and Queens (Long Island City).',
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: 'standalone',
    background_color: '#F0E8D2',
    theme_color: '#13241D',
    orientation: 'portrait',
    icons: [
      { src: `${BASE}/assets/logo.jpg`, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
      { src: `${BASE}/assets/logo.jpg`, sizes: '512x512', type: 'image/jpeg', purpose: 'any' }
    ]
  };
}
