import type { Metadata } from 'next';
import MenuExplorer from '@/components/MenuExplorer';
import { menuProducts } from '@/lib/menu';
import { getBrandLabel, inferProfile } from '@/lib/menu-utils';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Weed Delivery Menu NYC',
  description:
    'Order weed delivery in NYC — browse curated cannabis Flower Strains, Pre-Rolls, and Edibles by price, potency, size, and effect. Tax-free, free over $25.',
  alternates: { canonical: '/menu' },
  openGraph: {
    title: 'Raindrops Greenery NY Delivery Menu',
    description: 'Filter the Raindrops NY Flower, Pre-Rolls, and Edibles menu by category, price, potency, and effect.',
    url: '/menu'
    // No explicit `images`: falls back to app/opengraph-image.tsx's generated
    // 1200×630 branded card (the old flower.avif entry declared 1200×800 but
    // the real asset is smaller — a dimension mismatch crawlers flag).
  }
};

type MenuSearchParams = { category?: string; product?: string; deals?: string; effect?: string };

/**
 * Build Product ItemList JSON-LD for the menu catalog. Enriched with
 * productID, sku, mpn, and condition fields so Google + AI engines have
 * the maximum-resolution signal per product.
 *
 * Capped at 30 products with images to manage payload — Google's product
 * crawler indexes the first ~10-15 items in an ItemList anyway, and the
 * remaining products are discoverable via the menu UI + direct deep
 * links.
 */
function buildProductSchema() {
  const priceValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const items = menuProducts.slice(0, 30).map((product, index) => {
    // Multi-variant products (flowers with 3.5g + 7g) get an AggregateOffer
    // covering the price range; single-variant products keep a flat Offer.
    // This is the canonical schema.org pattern for sized goods (Google
    // explicitly recommends AggregateOffer when multiple SKU prices exist).
    const variantOffers = product.variants.map((v) => ({
      '@type': 'Offer',
      sku: `${product.id}__${v.label}`,
      name: `${product.name} (${v.label})`,
      price: (v.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}`,
      seller: { '@id': `${business.baseUrl}#business` },
      priceValidUntil
    }));

    const offers = product.variants.length > 1
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: (Math.min(...product.variants.map((v) => v.price)) / 100).toFixed(2),
          highPrice: (Math.max(...product.variants.map((v) => v.price)) / 100).toFixed(2),
          offerCount: product.variants.length,
          availability: 'https://schema.org/InStock',
          offers: variantOffers,
          seller: { '@id': `${business.baseUrl}#business` },
          priceValidUntil
        }
      : (variantOffers[0] ?? {
          '@type': 'Offer',
          price: (product.salePrice / 100).toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}`,
          seller: { '@id': `${business.baseUrl}#business` },
          priceValidUntil
        });

    return {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}#product`,
        name: product.name,
        image: product.image ?? undefined,
        brand: { '@type': 'Brand', name: getBrandLabel(product) },
        manufacturer: { '@type': 'Organization', name: getBrandLabel(product) },
        category: product.category,
        productID: product.id,
        sku: product.id,
        itemCondition: 'https://schema.org/NewCondition',
        description:
          product.description?.trim() ||
          `${inferProfile(product)} ${product.category.toLowerCase()} from ${getBrandLabel(product)}.`,
        offers
      }
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${business.baseUrl}/menu#menu-list`,
    name: 'Raindrops Greenery NY delivery menu',
    description:
      'Curated cannabis menu for tax-free 21+ NYC delivery — Flower Strains, Pre-Rolls, and Edibles. Free delivery on orders over $25, same-day across Manhattan + LIC + Williamsburg + Greenpoint.',
    numberOfItems: items.length,
    itemListElement: items
  };
}

export default async function MenuPage({ searchParams }: { searchParams?: Promise<MenuSearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const productSchema = buildProductSchema();
  return (
    <>
      {/* Plain <script> tag so the ItemList JSON-LD ships in the initial SSR
          HTML for Googlebot + AI engines → product rich results. The
          BreadcrumbList is emitted by the <Breadcrumbs> component inside
          <MenuExplorer> (Home › Menu), so it's intentionally not duplicated
          here. */}
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <MenuExplorer
        initialCategory={params.category}
        initialProductId={params.product}
        initialDealsOnly={params.deals === '1' || params.deals === 'true'}
        initialEffect={params.effect}
      />
    </>
  );
}

