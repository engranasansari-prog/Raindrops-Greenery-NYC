import type { Metadata } from 'next';
import DashboardLogin from '@/components/DashboardLogin';

export const metadata: Metadata = {
  title: 'Owner Login — Raindrops Greenery',
  robots: { index: false, follow: false }
};

export default function DashboardLoginPage() {
  return <DashboardLogin />;
}
