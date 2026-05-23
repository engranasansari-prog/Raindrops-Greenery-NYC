import type { Metadata } from 'next';
import ContactPage from '@/components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Raindrops Greenery NY for delivery questions, order support, business inquiries, and press. Manhattan, Brooklyn, and Queens.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Raindrops Greenery',
    description: 'Reach Raindrops Greenery NY support, press, and business inquiries.',
    url: '/contact',
    images: [{ url: '/assets/storefront.webp', width: 1200, height: 800, alt: 'Contact Raindrops Greenery' }]
  }
};

export default function Page() {
  return <ContactPage />;
}
