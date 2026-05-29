import type { Metadata } from 'next';
import ContactPage from '@/components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact — NYC Weed Delivery',
  description:
    'Contact Raindrops Greenery NY about weed delivery, order support, or partnerships. Serving Manhattan, LIC, Williamsburg, and Greenpoint. 21+.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Raindrops Greenery',
    description: 'Reach Raindrops Greenery NY support, press, and business inquiries.',
    url: '/contact',
    images: [{ url: '/assets/DISPENSARYIMAGE.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery NYC dispensary' }]
  }
};

export default function Page() {
  return <ContactPage />;
}
