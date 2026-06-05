import type { Metadata } from 'next';
import DeliveryPage from '@/components/DeliveryPage';

export const metadata: Metadata = {
  title: 'Same-Day Weed Delivery NYC',
  description:
    'Same-day weed delivery and cannabis delivery across NYC — Manhattan plus Williamsburg, Greenpoint, and Long Island City. Tax-free, free over $25. 21+.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Same-Day Weed Delivery NYC — Raindrops Greenery',
    description: 'Same-day weed delivery — Manhattan, Williamsburg, Greenpoint, and Long Island City.',
    url: '/delivery'
    // No explicit `images`: falls back to app/opengraph-image.tsx's generated
    // 1200×630 branded card (the old DISPENSARYIMAGE entry declared 1200×800
    // but the real asset is smaller — a dimension mismatch crawlers flag).
  }
};

export default function Page() {
  return <DeliveryPage />;
}
