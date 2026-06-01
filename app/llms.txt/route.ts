import { business } from '@/lib/site-data';
import { COVERAGE } from '@/lib/coverage';

/**
 * /llms.txt — the emerging llmstxt.org standard for telling AI crawlers the
 * ground-truth content of a site. Perplexity, ChatGPT Search, Claude, and
 * Google AI Overviews increasingly look here before parsing visual HTML.
 *
 * STRUCTURE (per the spec, which validators like Semrush check):
 *   1. A single H1 with the site name.
 *   2. A blockquote summary.
 *   3. Free-form detail (prose + lists, NO headings) — the facts an AI needs.
 *   4. H2 "file list" sections whose items are markdown links `[name](url)`,
 *      optionally `: note`. An `## Optional` section holds secondary URLs.
 *
 * Keep it terse — AI engines read it in full, so every line is context budget.
 */
export const dynamic = 'force-static';

export function GET() {
  const allZips = COVERAGE.clusters.flatMap((c) => c.zips);
  const coverageList = COVERAGE.clusters
    .map((c) => `- ${c.name} (${c.shortName}) — ${c.borough} — ${c.etaMinutes} min avg ETA — ZIPs: ${c.zips.join(', ')}`)
    .join('\n');

  const body = `# Raindrops Greenery — New York City

> Tax-free, Shinnecock-licensed cannabis delivery for Manhattan, Brooklyn (Williamsburg, Greenpoint), and Queens (Long Island City). Same-day. Free delivery on orders over $25. 21+ only.

Raindrops Greenery is a tax-free, same-day cannabis delivery service in New York City, operating under the sovereign cannabis license of the ${business.licensingAuthority}. Sales under that license are exempt from the New York State 9% cannabis excise tax and the ~8.875% NYC sales tax charged at OCM-licensed dispensaries — the menu price is the price at checkout, with no surcharges. We deliver a focused catalog of Flower Strains, Pre-Rolls, and Edibles (no vape carts, concentrates, or tinctures), every day from ${business.hours[0].open} to ${business.hours[0].close}, free on orders over $25, with a complimentary pre-roll in every order. 21+ only; a valid government ID is verified at the door before every handoff, and products cannot be returned once delivered.

**Business:** ${business.legalName} (trade name ${business.tradeName}), founded ${business.yearFounded}. Phone ${business.phone}. Email ${business.email}. Sovereign jurisdiction: ${business.jurisdiction}.

**Coverage:** ${COVERAGE.clusters.length} clusters / ${allZips.length} ZIPs across Manhattan plus Williamsburg, Greenpoint, and Long Island City:
${coverageList}

**Brand:** Raindrops Greenery operates three locations under one brand — Southampton (live), New York City (this site), and Long Island (coming soon).

## Key pages

- [Home](${business.baseUrl}): tax-free NYC weed delivery overview
- [Full menu](${business.baseUrl}/menu): Flower Strains, Pre-Rolls, and Edibles
- [Flower strains](${business.baseUrl}/menu/flower)
- [Pre-rolls](${business.baseUrl}/menu/pre-rolls)
- [Edibles](${business.baseUrl}/menu/edibles)
- [Deals](${business.baseUrl}/deals): affordable, tax-free value picks
- [Delivery areas + ZIP checker](${business.baseUrl}/delivery)
- [Tax-free explainer](${business.baseUrl}/tax-free-weed-delivery-nyc): how Shinnecock authority works
- [Strain finder quiz](${business.baseUrl}/quiz)
- [About + license info](${business.baseUrl}/about)
- [FAQ](${business.baseUrl}/faq)
- [Contact](${business.baseUrl}/contact)
- [Journal](${business.baseUrl}/blog)

## Neighborhood delivery guides

- [Weed delivery in Williamsburg](${business.baseUrl}/delivery/williamsburg)
- [Weed delivery in Greenpoint](${business.baseUrl}/delivery/greenpoint)
- [Weed delivery in Long Island City](${business.baseUrl}/delivery/long-island-city)
- [Weed delivery in Manhattan](${business.baseUrl}/delivery/manhattan)
- [Weed delivery on the Upper East Side](${business.baseUrl}/delivery/upper-east-side)
- [Weed delivery on the Upper West Side](${business.baseUrl}/delivery/upper-west-side)
- [Weed delivery in the East Village](${business.baseUrl}/delivery/east-village)
- [Weed delivery in Midtown](${business.baseUrl}/delivery/midtown)

## Optional

- [Full content dump for AI](${business.baseUrl}/llms-full.txt)
- [Structured JSON summary](${business.baseUrl}/api/site-summary)
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
