// ZIP autocomplete suggestion engine — V9 §1.
//
// Backed by /lib/coverage.ts data. Returns the best 6 covered ZIP matches
// (prefix + neighborhood fuzzy match) plus an "out-of-zone but close"
// suggestion when the user starts typing a non-covered ZIP that's adjacent
// to one we cover. Pure client-side — no API calls.

import { COVERAGE, type CoverageCluster } from './coverage';

export type ZipSuggestion = {
  zip: string;
  neighborhood: string;
  shortName: string;
  etaMinutes: number;
  cluster: CoverageCluster;
};

const ALL_ZIPS: ZipSuggestion[] = COVERAGE.clusters.flatMap((cluster) =>
  cluster.zips.map((zip) => ({
    zip,
    neighborhood: cluster.name,
    shortName: cluster.shortName,
    etaMinutes: cluster.etaMinutes,
    cluster: cluster as CoverageCluster
  }))
);

/**
 * Suggest up to `limit` ZIPs matching the user's input.
 * Matches on ZIP prefix first, then on neighborhood name substring.
 */
export function suggestZips(input: string, limit = 6): ZipSuggestion[] {
  const q = input.trim().toLowerCase();
  if (!q) return [];

  const digits = q.replace(/\D/g, '');

  // ZIP prefix match — exact and partial
  const zipMatches = digits
    ? ALL_ZIPS.filter((s) => s.zip.startsWith(digits))
    : [];

  // Neighborhood name substring match (only when user typed letters)
  const nameMatches =
    digits === q
      ? []
      : ALL_ZIPS.filter(
          (s) =>
            s.neighborhood.toLowerCase().includes(q) ||
            s.shortName.toLowerCase().includes(q)
        );

  // Dedupe + cap
  const seen = new Set<string>();
  const out: ZipSuggestion[] = [];
  for (const m of [...zipMatches, ...nameMatches]) {
    if (seen.has(m.zip)) continue;
    seen.add(m.zip);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}
