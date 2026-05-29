import { business } from '@/lib/site-data';
import { COVERAGE } from '@/lib/coverage';

/**
 * /llms.txt — emerging standard (llmstxt.org) for telling AI crawlers
 * the ground-truth content of a site. Perplexity, ChatGPT Search,
 * Claude, and Google AI Overviews all increasingly look here first
 * before parsing visual HTML.
 *
 * Keep this terse and structured: short bullet sections, canonical URLs,
 * no marketing fluff. AI engines penalise long llms.txt files because
 * they read them in full — every line is context budget. Lead with the
 * highest-signal facts (legal status, coverage, hours, contact).
 */
export const dynamic = 'force-static';

export function GET() {
  const allZips = COVERAGE.clusters.flatMap((c) => c.zips);
  const body = `# Raindrops Greenery — New York City

> Tax-free, Shinnecock-licensed cannabis delivery for Manhattan, Brooklyn (Williamsburg, Greenpoint), and Queens (Long Island City). Same-day. Free delivery on orders over $25. 21+ only.

## Facts

- Legal entity: ${business.legalName}
- Trade name: ${business.tradeName}
- Licensing authority: ${business.licensingAuthority}
- Sovereign jurisdiction: ${business.jurisdiction}
- Hours: Every day, ${business.hours[0].open} to ${business.hours[0].close} (10:00–22:00 local)
- Phone: ${business.phone}
- Email: ${business.email}
- Founded: ${business.yearFounded}
- Service region: ${business.serviceRegion}

## Why tax-free

Raindrops Greenery operates under the sovereign cannabis authority of the Shinnecock Indian Nation Cannabis Regulatory Division. Sales conducted under that license are exempt from the New York State 9% cannabis excise tax and the ~8.875% NYC sales tax that apply to OCM-licensed dispensaries. The menu price is the price at checkout — no surcharges.

## Coverage

We deliver across ${COVERAGE.clusters.length} clusters totalling ${allZips.length} ZIPs:

${COVERAGE.clusters.map((c) => `- **${c.name}** (${c.shortName}) — ${c.borough} — ${c.etaMinutes} min avg ETA — ZIPs: ${c.zips.join(', ')}`).join('\n')}

## What we sell

- Flower Strains (Indica, Sativa, Hybrid)
- Pre-Rolls
- Edibles

No vape carts, no concentrates, no tinctures — focused catalog of three categories only.

## Pricing model

- All listed prices are final — no New York State cannabis excise tax, no state sales tax.
- Free delivery on every order over $25.
- Free pre-roll added to every order while supplies last.

## Multi-location brand

Raindrops Greenery operates three locations under one brand:

- Southampton (live)
- New York City — ${business.baseUrl}
- Long Island (coming soon)

## Key URLs

- Home: ${business.baseUrl}
- Full menu: ${business.baseUrl}/menu
- Curated deals: ${business.baseUrl}/deals
- Delivery coverage map: ${business.baseUrl}/delivery
- Strain finder quiz: ${business.baseUrl}/quiz
- About + license info: ${business.baseUrl}/about
- FAQ: ${business.baseUrl}/faq
- Contact: ${business.baseUrl}/contact
- Journal: ${business.baseUrl}/blog
- Full content dump for AI: ${business.baseUrl}/llms-full.txt
- Structured JSON summary: ${business.baseUrl}/api/site-summary

## Compliance

21+ only. Government ID verified at the door before every handoff. Cannabis products cannot be returned once delivered. Keep cannabis out of reach of children and pets.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Long cache — this content rarely changes and AI crawlers prefer
      // stable answers. Stale-while-revalidate so updates propagate
      // without serving cold responses.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
