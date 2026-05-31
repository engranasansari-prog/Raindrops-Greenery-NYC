import type { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog-posts';
import { business } from '@/lib/site-data';

/**
 * XML sitemap — Google + Bing crawl index.
 *
 * Priority/changefreq tuned for crawl budget:
 *   • Home, Menu, Deals  — top-tier, daily refresh
 *   • Delivery, Quiz, Blog index, FAQ — frequent
 *   • Static pages (About, Contact) — monthly
 *   • Legal — yearly, low priority
 *   • Blog posts — monthly, sorted by publishedAt for accurate lastmod
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = business.baseUrl;
  const now = new Date();

  // Each entry's `images` lets Google index our hero / OG / dispensary
  // photos for image search — extra discovery surface for branded queries.
  const dispensaryImg = `${baseUrl}/assets/DISPENSARYIMAGE.jpg`;
  const flowerImg = `${baseUrl}/assets/flower.avif`;
  const heroImg = `${baseUrl}/assets/heroPhoto.jpg`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0, images: [dispensaryImg, heroImg] },
    { url: `${baseUrl}/menu`, lastModified: now, changeFrequency: 'daily', priority: 0.95, images: [flowerImg] },
    { url: `${baseUrl}/deals`, lastModified: now, changeFrequency: 'daily', priority: 0.9, images: [flowerImg] },
    { url: `${baseUrl}/delivery`, lastModified: now, changeFrequency: 'weekly', priority: 0.9, images: [dispensaryImg] },
    { url: `${baseUrl}/tax-free-weed-delivery-nyc`, lastModified: now, changeFrequency: 'weekly', priority: 0.85, images: [dispensaryImg] },
    { url: `${baseUrl}/quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7, images: [dispensaryImg] },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/accessibility`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 }
  ];

  const blogRoutes: MetadataRoute.Sitemap = getBlogPosts()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
      images: post.coverImage ? [`${baseUrl}${post.coverImage}`] : []
    }));

  return [...staticRoutes, ...blogRoutes];
}
