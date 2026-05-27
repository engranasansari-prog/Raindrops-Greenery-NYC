// Sample delivery feed for the live "Just delivered" toast widget.
// Carefully chosen to feel realistic and rotate across all 7 clusters.
// Times in minutes — match the coverage ETAs (35–50 min range).

import { COVERAGE } from './coverage';

export type LiveOrderEvent = {
  neighborhood: string;
  /** Short headline displayed in the toast (no PII) */
  headline: string;
  minutesAgo: number;
  /** Delivery time in minutes (the headline minutes ago is independent) */
  deliveredInMin: number;
};

// Build a deterministic loop from coverage clusters so visitors who watch
// for a minute see every neighborhood — feels like the company is alive.
export function buildSampleFeed(): LiveOrderEvent[] {
  const events: LiveOrderEvent[] = [];
  COVERAGE.clusters.forEach((c, i) => {
    // Two events per cluster with a little variation
    events.push({
      neighborhood: c.shortName,
      headline: `Just delivered to ${c.shortName}`,
      minutesAgo: 1 + i,
      deliveredInMin: Math.max(28, c.etaMinutes - 3 - (i % 4))
    });
    events.push({
      neighborhood: c.shortName,
      headline: `On the way · ${c.shortName}`,
      minutesAgo: 0,
      deliveredInMin: c.etaMinutes
    });
  });
  // Stagger the order so we don't show two from same cluster back-to-back
  return events.sort((a, b) => a.minutesAgo - b.minutesAgo);
}
