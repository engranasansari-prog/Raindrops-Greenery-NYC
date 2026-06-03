import { business, faqs, testimonials, serviceAreas } from '@/lib/site-data';
import { COVERAGE } from '@/lib/coverage';
import { menuProducts } from '@/lib/menu';
import { getBlogPosts } from '@/lib/blog-posts';

/**
 * /api/site-summary — machine-readable knowledge endpoint for AI engines.
 *
 * Returns a single JSON document with everything an AI engine needs to
 * answer questions about Raindrops Greenery NYC: identity, license,
 * coverage, hours, pricing model, catalog inventory, FAQs, and editorial
 * content index. Cached at the edge for 24h.
 *
 * AI engines (Perplexity, ChatGPT Search, Claude with tools, Google AI
 * Overviews) increasingly fetch structured site-summary endpoints when
 * they exist — it's a higher-fidelity signal than scraping HTML.
 */
export const dynamic = 'force-static';

export function GET() {
  const allZips = COVERAGE.clusters.flatMap((c) => c.zips);
  const posts = getBlogPosts();

  // Catalog snapshot — top picks (sticky badge + $40+) plus inventory
  // breakdown. Don't dump every product (40+ items is too noisy for AI);
  // give the engine enough to answer "what do they sell" and "what's
  // your hottest product" without ballooning payload.
  const categoryCounts = menuProducts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const topPicks = menuProducts
    .filter((p) => p.isSticky)
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      category: p.category,
      price: (p.salePrice / 100).toFixed(2),
      currency: 'USD',
      url: `${business.baseUrl}/menu?product=${encodeURIComponent(p.id)}`
    }));

  const summary = {
    $schema: 'https://schema.org',
    generatedAt: new Date().toISOString(),
    canonical: business.baseUrl,
    brand: {
      legalName: business.legalName,
      tradeName: business.tradeName,
      tagline: business.tagline,
      yearFounded: business.yearFounded,
      website: business.baseUrl,
      parentBrand: {
        name: 'Raindrops Greenery',
        url: 'https://www.raindropsgreenery.com',
        locations: [
          { name: 'Southampton', status: 'live' },
          { name: 'New York City', status: 'live', url: business.baseUrl },
          { name: 'Long Island', status: 'coming-soon' }
        ]
      }
    },
    license: {
      authority: business.licensingAuthority,
      number: business.license,
      jurisdiction: business.jurisdiction,
      shortDescription: business.licensingShort,
      taxStatus: 'tax-free',
      taxExplanation:
        'Raindrops Greenery is a Tribally licensed dispensary; all products are produced, packaged, and sold on Native Sovereign Land. Pricing is tax-free — the listed price is the price at checkout.'
    },
    contact: {
      phone: business.phone,
      phoneTel: business.phoneHref,
      email: business.email,
      supportEmail: business.supportEmail,
      pressEmail: business.pressEmail
    },
    hours: {
      open: '10:00',
      close: '22:00',
      timezone: 'America/New_York',
      days: 'Every day'
    },
    coverage: {
      region: business.serviceRegion,
      cities: serviceAreas,
      clusterCount: COVERAGE.clusters.length,
      zipCount: allZips.length,
      clusters: COVERAGE.clusters.map((c) => ({
        name: c.name,
        shortName: c.shortName,
        borough: c.borough,
        etaMinutes: c.etaMinutes,
        zips: c.zips
      })),
      notCovered: [
        'Bronx',
        'Staten Island',
        'Rest of Brooklyn outside Williamsburg + Greenpoint',
        'Rest of Queens outside Long Island City',
        'Anywhere outside New York City'
      ]
    },
    pricing: {
      currency: 'USD',
      taxFree: true,
      freeDeliveryMinimum: 25,
      freeGift: 'Complimentary pre-roll with every order while supplies last',
      paymentAccepted: ['Cash', 'Debit Card']
    },
    catalog: {
      categories: ['Flower Strains', 'Pre-Rolls', 'Edibles'],
      excludedCategories: ['Vape carts', 'Concentrates', 'Tinctures'],
      strainTypes: ['Indica', 'Sativa', 'Hybrid', 'Indica-Hybrid', 'Sativa-Hybrid'],
      totalProducts: menuProducts.length,
      countByCategory: categoryCounts,
      topPicks
    },
    compliance: {
      minimumAge: 21,
      idVerified: 'Government photo ID verified at the door before every delivery',
      returns: 'Cannabis products cannot be returned once delivered',
      safety: 'Keep cannabis out of reach of children and pets. Do not drive or operate machinery after consuming.'
    },
    faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    testimonials: testimonials.map((t) => ({
      quote: t.quote,
      author: t.author,
      location: t.location
    })),
    journal: {
      url: `${business.baseUrl}/blog`,
      postCount: posts.length,
      posts: posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        publishedAt: p.publishedAt,
        readTime: p.readTime,
        url: `${business.baseUrl}/blog/${p.slug}`
      }))
    },
    keyUrls: {
      home: business.baseUrl,
      menu: `${business.baseUrl}/menu`,
      deals: `${business.baseUrl}/deals`,
      delivery: `${business.baseUrl}/delivery`,
      quiz: `${business.baseUrl}/quiz`,
      about: `${business.baseUrl}/about`,
      faq: `${business.baseUrl}/faq`,
      contact: `${business.baseUrl}/contact`,
      blog: `${business.baseUrl}/blog`,
      llmsTxt: `${business.baseUrl}/llms.txt`,
      llmsFullTxt: `${business.baseUrl}/llms-full.txt`,
      sitemap: `${business.baseUrl}/sitemap.xml`
    }
  };

  return Response.json(summary, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // CORS open — AI engines fetch this from various origins.
      'Access-Control-Allow-Origin': '*'
    }
  });
}
