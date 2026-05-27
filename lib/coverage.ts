/**
 * Coverage data — V4 brief §3. Single source of truth.
 *
 * 31 ZIPs across 7 clusters spanning Manhattan + East River neighborhoods
 * (LIC, Williamsburg, Greenpoint). Every coverage check, neighborhood card,
 * map polygon, and FAQ answer must derive from this file.
 *
 * Free delivery is unconditional — no minimum.
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
  area: 'Manhattan + East River',
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
      id: 'chelsea-flatiron-ev',
      name: 'Chelsea / Flatiron / Gramercy / East Village',
      shortName: 'Chelsea & EV',
      borough: 'Manhattan',
      etaMinutes: 35,
      zips: ['10003', '10009', '10010', '10011']
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
      id: 'east-river',
      name: 'East River Extensions — LIC / Williamsburg / Greenpoint',
      shortName: 'East River',
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
