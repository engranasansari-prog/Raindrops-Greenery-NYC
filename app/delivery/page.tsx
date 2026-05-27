import type { Metadata } from 'next';
import DeliveryPage from '@/components/DeliveryPage';

export const metadata: Metadata = {
  title: 'NYC Delivery',
  description:
    'Raindrops Greenery NY serves Manhattan + East River neighborhoods (LIC, Williamsburg, Greenpoint) — tax-free, free same-day delivery, 21+.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Raindrops Greenery NY Delivery',
    description: 'Same-day delivery across Manhattan + East River neighborhoods.',
    url: '/delivery',
    images: [{ url: '/assets/storefront.webp', width: 1200, height: 800, alt: 'Raindrops Greenery delivery' }]
  }
};

export default function Page() {
  return <DeliveryPage />;
}
