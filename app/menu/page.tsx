import type { Metadata } from 'next';
import Script from 'next/script';
import MenuExplorer from '@/components/MenuExplorer';
import { menuProducts } from '@/lib/menu';
import { formatPrice, getBrandLabel, inferProfile } from '@/lib/menu-utils';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Browse Raindrops Greenery NY Flower, Pre-Rolls, and Edibles with filters for price, potency, size, brand, effect, deals, and availability.',
  alternates: { canonical: '/menu' },
  openGraph: {
    title: 'Raindrops Greenery NY Delivery Menu',
    description: 'Filter the Raindrops NY Flower, Pre-Rolls, and Edibles menu by category, price, potency, and effect.',
    url: '/menu',
    images: [{ url: '/assets/flower.avif', width: 1200, height: 800, alt: 'Raindrops Greenery menu products' }]
  }
};

type MenuSearchParams = { category?: string; product?: string; deals?: string; effect?: string };

/**
 * Build Product schema for the menu catalog (brief §6 / Phase 5.2).
 * Limited to the top 30 products with images to keep page weight reasonable —
 * Google indexes the first ~10-15 anyway.
 */
function buildProductSchema() {
  const items = menuProducts.slice(0, 30).map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: product.name,
      image: product.image ?? undefined,
      brand: { '@type': 'Brand', name: getBrandLabel(product) },
      category: product.category,
      description: product.description?.trim() || `${inferProfile(product)} ${product.category.toLowerCase()} from ${getBrandLabel(product)}.`,
      offers: {
        '@type': 'Offer',
        price: (product.salePrice / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}`
      }
    }
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Raindrops Greenery NY menu',
    description: 'Curated cannabis menu for adult-use NYC delivery — Flower, Pre-Rolls, and Edibles.',
    numberOfItems: items.length,
    itemListElement: items
  };
}

export default async function MenuPage({ searchParams }: { searchParams?: Promise<MenuSearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const productSchema = buildProductSchema();
  return (
    <>
      <Script id="ld-menu-products" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <MenuExplorer
        initialCategory={params.category}
        initialProductId={params.product}
        initialDealsOnly={params.deals === '1' || params.deals === 'true'}
        initialEffect={params.effect}
      />
    </>
  );
}

