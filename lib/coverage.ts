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
  area: 'Manhattan + Brooklyn + Queens',
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
      // Client correction: 10009 is East Village (not Chelsea). Cluster
      // re-led with East Village to match local usage. 10002 added per
      // client request (Lower East Side, borders 10009/10003).
      id: 'chelsea-flatiron-ev',
      name: 'East Village / Lower East Side / Gramercy / Chelsea',
      shortName: 'East Village & Chelsea',
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
