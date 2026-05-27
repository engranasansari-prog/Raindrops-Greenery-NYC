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
    host: business.baseUrl
  };
}
