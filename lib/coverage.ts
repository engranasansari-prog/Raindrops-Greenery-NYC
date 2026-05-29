/**
 * Coverage data — V4 brief §3. Single source of truth.
 *
 * ZIPs across 7 clusters spanning Manhattan plus parts of Brooklyn
 * (Williamsburg, Greenpoint) and Queens (Long Island City). Every
 * coverage check, neighborhood card, map polygon, and FAQ answer
 * must derive from this file.
 *
 * Free delivery on orders over $25.
 */

export type CoverageCluster = {
  id: string;
  name: string;
  shortName: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens';
  etaMinutes: number;
  zips: readonly string[];
};

export const COVERAGE = {
  area: 'Manhattan + Williamsburg, Greenpoint & LIC',
  freeDelivery: true,
  clusters: [
    {
      id: 'ues-uws',
      name: 'Upper East Side / Upper West Side',
      shortName: 'UES / UWS',
      borough: 'Manhattan',
      etaMinutes: 50,
      zips: ['10024', '10025', '10028', '10128', '10021', '10075', '10065']
    },
    {
      id: 'midtown',
      name: 'Midtown',
      shortName: 'Midtown',
      borough: 'Manhattan',
      etaMinutes: 40,
      zips: ['10001', '10016', '10017', '10018', '10019', '10022', '10036']
    },
    {
      // Client correction (round 2): 10009 is East Village (not Chelsea),
      // confirmed. The cluster spans 5 East Side ZIPs (10003 EV/Gramercy,
      // 10009 EV, 10002 LES, 10010 Gramercy/Flatiron) and one West Side
      // outlier (10011 Chelsea). When a customer entered 10009 and saw
      // the previous shortName "East Village & Chelsea" they reasonably
      // assumed their ZIP related to Chelsea, which is geographically
      // wrong. Renamed the shortName to lead with the dominant East Side
      // character — "East Village & Flatiron" — Flatiron sits at the
      // geographic centroid of the four East Side ZIPs and accurately
      // represents the cluster's spine. Chelsea is preserved in the full
      // `name` since 10011 is genuinely in the cluster for delivery
      // logistics, but the shortName no longer implies the misleading
      // 10009↔Chelsea pairing. The internal cluster id `chelsea-flatiron-ev`
      // is kept stable to avoid breaking the polygon lookup in coverage-geo.ts.
      id: 'chelsea-flatiron-ev',
      name: 'East Village / Lower East Side / Gramercy / Chelsea',
      shortName: 'East Village & Flatiron',
      borough: 'Manhattan',
      etaMinutes: 35,
      zips: ['10003', '10009', '10002', '10010', '10011']
    },
    {
      id: 'gv-soho-tribeca',
      name: 'Greenwich Village / Soho / Tribeca / Lower Manhattan',
      shortName: 'GV / Soho / Tribeca',
      borough: 'Manhattan',
      etaMinutes: 35,
      zips: ['10012', '10013', '10014', '10007']
    },
    {
      id: 'fidi-battery',
      name: 'Financial District / Seaport / Battery Park',
      shortName: 'FiDi / Battery',
      borough: 'Manhattan',
      etaMinutes: 45,
      zips: ['10004', '10005', '10006', '10280', '10282']
    },
    {
      id: 'south-street',
      name: 'South Street Seaport',
      shortName: 'South Street',
      borough: 'Manhattan',
      etaMinutes: 40,
      zips: ['10038']
    },
    {
      // Internal id stays stable ('east-river') so polygon lookups in
      // lib/coverage-geo.ts keep matching. User-visible labels swap to
      // Brooklyn + Queens per client brand voice. Cluster spans both
      // boroughs: 11101 is Queens (LIC), 11211 + 11222 are Brooklyn.
      id: 'east-river',
      name: 'Brooklyn + Queens — LIC / Williamsburg / Greenpoint',
      shortName: 'Brooklyn + Queens',
      borough: 'Brooklyn',
      etaMinutes: 55,
      zips: ['11101', '11211', '11222']
    }
  ] as const satisfies readonly CoverageCluster[]
} as const;

export const ALL_ZIPS: string[] = COVERAGE.clusters.flatMap((cluster) => [...cluster.zips]);

export function findCluster(zip: string): CoverageCluster | undefined {
  const clean = zip.replace(/\D/g, '').slice(0, 5);
  return COVERAGE.clusters.find((cluster) => (cluster.zips as readonly string[]).includes(clean));
}

export function isCovered(zip: string): boolean {
  return Boolean(findCluster(zip));
}
