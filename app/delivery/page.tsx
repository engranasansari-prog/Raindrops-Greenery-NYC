import type { Metadata } from 'next';
import DeliveryPage from '@/components/DeliveryPage';

export const metadata: Metadata = {
  title: 'NYC Delivery',
  description:
    'Raindrops Greenery NY serves Manhattan, Brooklyn (Williamsburg, Greenpoint), and Queens (Long Island City) — tax-free, free same-day delivery, 21+.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Raindrops Greenery NY Delivery',
    description: 'Same-day delivery across Manhattan, Brooklyn, and Queens.',
    url: '/delivery',
    images: [{ url: '/assets/DISPENSARYIMAGE.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery NYC dispensary' }]
  }
};

export default function Page() {
  return <DeliveryPage />;
}
