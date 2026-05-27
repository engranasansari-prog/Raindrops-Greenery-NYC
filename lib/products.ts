// /lib/products.ts
// Auto-generated from Dutchie storefront. To regenerate:
//   python3 scripts/migrate-products.py
// Source: https://dutchie.com/stores/raindrops-greenery-retail
// Exported: 2026-05-27T03:25:07.744Z

export type Category = 'Flower' | 'Pre-Rolls' | 'Edibles';
export type StrainType =
  | 'Indica'
  | 'Sativa'
  | 'Hybrid'
  | 'Indica-Hybrid'
  | 'Sativa-Hybrid'
  | null;

export interface Variant {
  label: string;   // '3.5g', '7g', 'Default'
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  strainType: StrainType;
  brand: string;
  description: string;
  image: string;
  orderUrl: string;       // direct Dutchie product URL
  basePrice: number | null;
  variants: Variant[];
  thc: {
    value: number | null;
    unit: '%' | 'mg' | null;
    display: string | null;
  };
  cbd: {
    value: number | null;
    unit: string | null;
  };
  isSticky: boolean;      // 30%+ Flower, 32%+ Pre-Rolls, 500mg+ Edibles
  tags: string[];
}

import productsJson from '@/data/products.json';

export const PRODUCTS: Product[] = productsJson.products as Product[];

export const PRODUCT_META = productsJson.meta;

// Lookup helpers
export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
export const PRODUCTS_BY_CATEGORY = {
  Flower:      PRODUCTS.filter(p => p.category === 'Flower'),
  'Pre-Rolls': PRODUCTS.filter(p => p.category === 'Pre-Rolls'),
  Edibles:     PRODUCTS.filter(p => p.category === 'Edibles'),
} as const;

// Featured selections — use these for the homepage carousel
export const FEATURED_PRODUCTS = [
  ...PRODUCTS.filter(p => p.isSticky).slice(0, 2),                    // 2 sticky
  ...PRODUCTS.filter(p => p.category === 'Edibles').slice(0, 1),      // 1 edible
].slice(0, 3);
