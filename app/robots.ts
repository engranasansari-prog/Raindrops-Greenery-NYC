import type { MetadataRoute } from 'next';
import { business } from '@/lib/site-data';

/**
 * robots.txt — crawl directives.
 *
 * Allow everything except admin + internal API. Sitemap URL is driven
 * from business.baseUrl so it always matches the deployed domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/']
      }
    ],
    sitemap: `${business.baseUrl}/sitemap.xml`,
    // host must be a bare hostname per the robots spec — no scheme, no path.
    // (business.baseUrl carries the /nyc-raindrops-greenery sub-path, which
    // crawlers discard, so we use the canonical domain instead.)
    host: business.domain
  };
}
