// Wraps the generated Flowhub menu data so the UI only ever sees products
// that have a usable image. Counts are recomputed against the filtered list.

import { liveMenuProducts, liveMenuSource, type LiveMenuProduct } from './live-menu-products.generated';
import { productCategories } from './menu-utils';

function hasImage(product: LiveMenuProduct) {
  return Boolean(product.image && product.image.trim());
}

export const menuProducts: LiveMenuProduct[] = liveMenuProducts.filter(hasImage);

export const menuCounts: Record<(typeof productCategories)[number], number> = productCategories.reduce(
  (acc, category) => {
    acc[category] = menuProducts.filter((product) => product.category === category).length;
    return acc;
  },
  {} as Record<(typeof productCategories)[number], number>
);

export const menuSyncedAt = liveMenuSource.syncedAt;
export const menuSourceUrl = liveMenuSource.url;
export type { LiveMenuProduct };
