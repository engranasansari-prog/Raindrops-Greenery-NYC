import type { Metadata } from 'next';
import MenuExplorer from '@/components/MenuExplorer';

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

export default async function MenuPage({ searchParams }: { searchParams?: Promise<MenuSearchParams> }) {
  const params = searchParams ? await searchParams : {};
  return (
    <MenuExplorer
      initialCategory={params.category}
      initialProductId={params.product}
      initialDealsOnly={params.deals === '1' || params.deals === 'true'}
      initialEffect={params.effect}
    />
  );
}
