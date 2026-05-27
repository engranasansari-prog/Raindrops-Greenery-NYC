import HomePage from '@/components/HomePage';
import { getFeaturedDeals } from '@/lib/featured-deals';

// Server component — computes featured deals at build time so the client
// bundle never receives the full 100-product menu JSON. Cuts ~70KB of
// unused JS off the home page initial payload.
export default function Page() {
  const deals = getFeaturedDeals(3);
  return <HomePage deals={deals} />;
}
