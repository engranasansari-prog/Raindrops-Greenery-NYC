// Slim featured-deal shape used by the home page client bundle.
// We do the heavy lifting (filtering, sorting) server-side in app/page.tsx so
// the client never receives the full 100-product menu JSON.

import {
  formatPrice,
  getBrandLabel,
  getDealLabel,
  getPotencyLabel,
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
  strain: StrainTag;
  sticky: boolean;
  pctOff: number;
  thc: string | null;
  priceLabel: string;
  salePriceLabel: string;
  isSale: boolean;
  dealLabel: string | null;
};

function calculatePercentOff(price: number, salePrice: number) {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/**
 * Returns the top N deals by % off, with everything pre-formatted so
 * the client component receives a small JSON payload (no menu-utils logic
 * shipped to the browser).
 */
export function getFeaturedDeals(limit = 3): FeaturedDeal[] {
  return menuProducts
    .filter(hasSale)
    .sort(
      (a, b) =>
        calculatePercentOff(b.price, b.salePrice) - calculatePercentOff(a.price, a.salePrice)
    )
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
        strain: getStrainTag(product),
        sticky: isSticky(product),
        pctOff: calculatePercentOff(product.price, product.salePrice),
        thc: thcMatch ? thcMatch[1] : null,
        priceLabel: formatPrice(product.price),
        salePriceLabel: formatPrice(product.salePrice),
        isSale: product.salePrice < product.price,
        dealLabel: getDealLabel(product)
      };
    });
}
