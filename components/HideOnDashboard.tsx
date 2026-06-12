'use client';

import { usePathname } from 'next/navigation';

/**
 * Hides the marketing chrome (announcement bar, nav) on the internal
 * /dashboard routes. Children stay server-rendered — this only gates them.
 */
export default function HideOnDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard')) return null;
  return <>{children}</>;
}
