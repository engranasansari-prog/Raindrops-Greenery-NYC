import type { Metadata } from 'next';
import DeliveryPage from '@/components/DeliveryPage';

export const metadata: Metadata = {
  title: 'Same-Day Weed Delivery NYC',
  description:
    'Same-day weed delivery across Manhattan plus Williamsburg, Greenpoint, and Long Island City. Tax-free under Shinnecock authority, free over $25, 21+.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Same-Day Weed Delivery NYC — Raindrops Greenery',
    description: 'Same-day weed delivery — Manhattan, Williamsburg, Greenpoint, and Long Island City.',
    url: '/delivery',
    images: [{ url: '/assets/DISPENSARYIMAGE.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery NYC dispensary' }]
  }
};

export default function Page() {
  return <DeliveryPage />;
}
