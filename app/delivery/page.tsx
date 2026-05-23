import type { Metadata } from 'next';
import DeliveryPage from '@/components/DeliveryPage';

export const metadata: Metadata = {
  title: 'NYC Delivery',
  description:
    'Raindrops Greenery NY delivery serves Manhattan, Brooklyn, and Queens with a focused 21+ ordering experience.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Raindrops Greenery NY Delivery',
    description: 'A focused New York delivery experience for Manhattan, Brooklyn, and Queens.',
    url: '/delivery',
    images: [{ url: '/assets/storefront.webp', width: 1200, height: 800, alt: 'Raindrops Greenery delivery' }]
  }
};

export default function Page() {
  return <DeliveryPage />;
}
