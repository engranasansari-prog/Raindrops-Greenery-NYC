import type { MetadataRoute } from 'next';
import { business } from '@/lib/site-data';

/**
 * robots.txt — crawl directives.
 *
 * Allow everything except the internal write API. Sitemap URL is driven
 * from business.baseUrl so it always matches the deployed domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Block only the write/POST API routes. /api/site-summary is
        // an AI-friendly JSON facts endpoint that llms.txt points crawlers to,
        // so it MUST stay crawlable (this was previously blocked by '/api/').
        allow: ['/', '/api/site-summary'],
        disallow: ['/api/subscribe', '/api/chat']
      },
      // Explicitly welcome the major AI answer engines + crawlers so Raindrops
      // can be discovered and cited by ChatGPT, Perplexity, Claude, Gemini,
      // Microsoft Copilot, Apple Intelligence, and Google AI Overviews. They're
      // already covered by '*', but an explicit allowlist removes ambiguity and
      // future-proofs against accidental blocks.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Perplexity-User',
          'ClaudeBot',
          'anthropic-ai',
          'Claude-Web',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
          'CCBot',
          'cohere-ai'
        ],
        allow: '/'
      }
    ],
    sitemap: `${business.baseUrl}/sitemap.xml`,
    // host must be a bare hostname per the robots spec — no scheme, no path.
    // business.domain is the bare host (raindrops-greenery-nyc.vercel.app);
    // business.baseUrl carries the scheme, which the host field must omit.
    host: business.domain
  };
}
