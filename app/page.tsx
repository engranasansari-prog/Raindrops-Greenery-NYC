import HomePage from '@/components/HomePage';
import ValueProps from '@/components/home/ValueProps';
import { getFeaturedDeals } from '@/lib/featured-deals';

// Server component — computes featured deals at build time so the client bundle
// never receives the full 100-product menu JSON. The "Why Raindrops" ValueProps
// section is ALSO rendered here on the server and slotted into the (client)
// HomePage via its valuePropsSlot prop, keeping that static markup + its icon
// SVGs out of the home page's client hydration payload.
export default function Page() {
  const deals = getFeaturedDeals(3);
  return <HomePage deals={deals} valuePropsSlot={<ValueProps />} />;
}
