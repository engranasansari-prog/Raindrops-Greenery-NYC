// V8 — adapter from the real 44-product Dutchie dataset to the legacy
// LiveMenuProduct shape that MenuExplorer + featured-deals expect.
//
// This file used to wrap a generated 100-fake-product file. After V8 it
// reshapes the real /lib/products.ts data into the same legacy types so the
// rest of the UI keeps rendering without a full rewrite. A future V8.5 will
// retire the legacy shape entirely.

import { PRODUCTS, type Product } from './products';
import { productCategories } from './menu-utils';

export type LiveMenuProduct = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  category: (typeof productCategories)[number];
  brand: string;
  type: string | null;
  species: string | null;
  description: string;
  image: string | null;
  imageMobile: string | null;
  imageTablet: string | null;
  imageThumbnail: string | null;
  /** Primary weight label (first/entry-tier variant) — kept for filter chips,
   *  back-compat with featured-deals, and single-variant products. */
  weight: string | null;
  /** All prices stored in cents to match the legacy shape. */
  price: number;
  salePrice: number;
  /** ALL purchasable variants for this product, prices in cents. For flowers
   *  this is typically [3.5g, 7g]; for pre-rolls and edibles a single entry.
   *  Added Feb 2026 — the Dutchie dataset always had multi-size variants,
   *  but the original adapter only forwarded the first one which meant the
   *  whole UI rendered just 3.5g prices for every flower strain. */
  variants: Array<{ label: string; price: number }>;
  quantity: number;
  potencies: Array<{ name: string; value: string }>;
  deals: Array<{ name: string; description: string; discountType: string | null; discountAmount: number | null }>;
  sourceUrl: string;
  /** New in V8: direct Dutchie product URL kept so cards can deep-link. */
  orderUrl: string;
  isSticky: boolean;
  strainType: Product['strainType'];
};

function pickWeight(product: Product): string | null {
  // Client rule (V9): only 3.5g and 7g weights are surfaced. Pre-roll
  // "1.5g" labels are suppressed entirely — pre-rolls render without a
  // weight chip and the weight filter only offers 3.5g / 7g.
  const firstLabel = product.variants[0]?.label;
  if (!firstLabel || firstLabel === 'Default') return null;
  if (firstLabel === '1.5g') return null;
  return firstLabel;
}

/** Strip "1.5 Gram " from pre-roll product names per client request. */
function cleanName(name: string): string {
  return name.replace(/\s*1\.5\s*Gram\s*/i, ' ').replace(/\s{2,}/g, ' ').trim();
}

function buildPotencies(product: Product): LiveMenuProduct['potencies'] {
  // Legacy potency shape: { name: 'THC' | 'THC mg', value: '28' }
  // menu-utils.getPotencyLabel reads /mg/i on `name` to choose the unit.
  if (product.thc.value === null) return [];
  const isMg = product.thc.unit === 'mg';
  return [
    {
      name: isMg ? 'THC mg' : 'THC',
      value: String(product.thc.value)
    }
  ];
}

function adapt(product: Product): LiveMenuProduct {
  const priceCents = (product.basePrice ?? 0) * 100;
  // Species → lowercase token MenuExplorer's inferProfile() can pattern-match
  // (it looks for 'indica', 'sativa', 'hybrid'). For strainType "Indica-Hybrid"
  // we forward "indica dom hybrid" so the existing helper resolves it to
  // "Indica dominant hybrid".
  const species = (() => {
    switch (product.strainType) {
      case 'Indica':
        return 'Indica';
      case 'Sativa':
        return 'Sativa';
      case 'Hybrid':
        return 'Hybrid';
      case 'Indica-Hybrid':
        return 'Indica Dom Hybrid';
      case 'Sativa-Hybrid':
        return 'Sativa Dom Hybrid';
      default:
        return null;
    }
  })();

  // Forward every purchasable variant to the UI, in cents. Filter out
  // the legacy "Default" label (Dutchie's placeholder when a product
  // has no real variants) and the 1.5g pre-roll label that the client
  // asked us to suppress (V9 rule).
  const variants = product.variants
    .filter((v) => v.label !== 'Default' && v.label !== '1.5g')
    .map((v) => ({ label: v.label, price: v.price * 100 }));

  return {
    id: product.id,
    productId: product.id,
    variantId: product.id,
    name: cleanName(product.name),
    category: product.category,
    brand: product.brand,
    type: product.strainType,
    species,
    description: product.description,
    image: product.image || null,
    imageMobile: product.image || null,
    imageTablet: product.image || null,
    imageThumbnail: product.image || null,
    weight: pickWeight(product),
    price: priceCents,
    // No discounted pricing in the V8 dataset — salePrice mirrors price.
    salePrice: priceCents,
    variants,
    quantity: 1,
    potencies: buildPotencies(product),
    deals: [],
    sourceUrl: product.orderUrl,
    orderUrl: product.orderUrl,
    // Client rule (V9): STICKY badge = $40+ only. The migration JSON has
    // a baked-in isSticky from the old THC-based logic; we override here
    // so every consumer (cards, deals, menu) sees the same definition.
    isSticky: priceCents >= 4000,
    strainType: product.strainType
  };
}

export const menuProducts: LiveMenuProduct[] = PRODUCTS.filter((p) => Boolean(p.image)).map(adapt);

export const menuCounts: Record<(typeof productCategories)[number], number> = productCategories.reduce(
  (acc, category) => {
    acc[category] = menuProducts.filter((product) => product.category === category).length;
    return acc;
  },
  {} as Record<(typeof productCategories)[number], number>
);

// Kept for backward compat with anything that referenced the old sync timestamp.
export const menuSyncedAt: string = (() => {
  try {
    // PRODUCT_META lives in products.json — read directly to avoid coupling.
    // Fall back to "now" if unavailable.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const meta = require('../data/products.json').meta as { exportedAt?: string };
    return meta.exportedAt ?? new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
})();

export const menuSourceUrl = 'https://dutchie.com/stores/raindrops-greenery-retail';
