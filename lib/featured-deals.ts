// Slim featured-deal shape used by the home page client bundle.
// We do the heavy lifting (filtering, sorting) server-side in app/page.tsx so
// the client never receives the full 100-product menu JSON.

import {
  formatPrice,
  getBrandLabel,
  getDealLabel,
  getPotencyLabel,
  getPrimaryPotency,
  getProductDescription,
  getStrainTag,
  hasSale,
  isSticky,
  type StrainTag
} from './menu-utils';
import { menuProducts } from './menu';

export type FeaturedDeal = {
  id: string;
  name: string;
  brand: string;
  image: string | null;
  hrefId: string;
  /** Direct Dutchie product URL — used by the home "Order" CTA */
  orderUrl: string;
  strain: StrainTag;
  sticky: boolean;
  pctOff: number;
  thc: string | null;
  priceLabel: string;
  salePriceLabel: string;
  isSale: boolean;
  dealLabel: string | null;
  /** Short product description — mirrors the menu cards (clamped to 2 lines
   *  on the home teaser so the card stays punchy). Empty string if none. */
  description: string;
};

function calculatePercentOff(price: number, salePrice: number) {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/**
 * Returns N featured products, pre-formatted so the client component
 * receives a small JSON payload (no menu-utils logic shipped to the browser).
 *
 * Selection: real discounts first (highest % off), then — because the live
 * Dutchie dataset currently carries no markdowns (salePrice === price for
 * every item) — fall back to a curated "best of the menu" set so the home
 * "Tonight's drops" section is never empty. The curated picks are the
 * premium ✦ STICKY tier ($40+) ranked by THC potency, with a final fill of
 * the strongest remaining products. This guarantees exactly `limit` cards.
 */
export function getFeaturedDeals(limit = 3): FeaturedDeal[] {
  const onSale = menuProducts
    .filter(hasSale)
    .sort(
      (a, b) =>
        calculatePercentOff(b.price, b.salePrice) - calculatePercentOff(a.price, a.salePrice)
    );

  const selected = [...onSale];
  if (selected.length < limit) {
    const chosen = new Set(selected.map((p) => p.id));
    const curated = menuProducts
      .filter((p) => !chosen.has(p.id) && Boolean(p.image))
      // Premium tier first, then by raw THC potency — "picks moving fast."
      .sort((a, b) => {
        const stickyDelta = Number(isSticky(b)) - Number(isSticky(a));
        if (stickyDelta !== 0) return stickyDelta;
        return getPrimaryPotency(b) - getPrimaryPotency(a);
      });
    for (const product of curated) {
      if (selected.length >= limit) break;
      selected.push(product);
    }
  }

  return selected
    .slice(0, limit)
    .map((product) => {
      const potency = getPotencyLabel(product);
      const thcMatch = potency.match(/THC\s+([\d.]+)/i);
      return {
        id: product.id,
        name: product.name,
        brand: getBrandLabel(product),
        image: product.image,
        hrefId: encodeURIComponent(product.id),
        // orderUrl comes from the V8 adapter (lib/menu.ts) — direct Dutchie product link
        orderUrl: (product as typeof product & { orderUrl?: string }).orderUrl ?? '',
        strain: getStrainTag(product),
        sticky: isSticky(product),
        pctOff: calculatePercentOff(product.price, product.salePrice),
        thc: thcMatch ? thcMatch[1] : null,
        priceLabel: formatPrice(product.price),
        salePriceLabel: formatPrice(product.salePrice),
        isSale: product.salePrice < product.price,
        dealLabel: getDealLabel(product),
        description: getProductDescription(product)
      };
    });
}
