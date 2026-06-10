// GeoJSON builders for the MapLibre coverage map (V15, May 2026).
//
// V15 is the "real boundaries" rebuild. The map now reads from
// `coverage-zip-boundaries.ts` — actual US Census ZCTA polygons for the 33
// covered NYC ZIPs — instead of the hand-drawn approximations that the client
// (rightly) read as "confusing squares." Shapes follow real streets and the
// waterfront, so the map looks like a precise coverage inset, not a doodle.
//
// Decluttering strategy (the other half of the client note):
//   • Default view shows 7 CLUSTER labels (neighborhood + ETA), not 33 ZIP
//     numbers. That alone removes the "crowded with zip codes" feeling.
//   • Individual ZIP numbers fade in only when the customer zooms into a
//     neighborhood (handled in CoverageLiveMap via a minzoom gate).
//
// No API key required.

import type { CoverageCluster } from './coverage';
import { COVERAGE } from './coverage';
import {
  ZIP_BOUNDARIES,
  CLUSTER_CENTROIDS,
  COVERAGE_BOUNDS
} from './coverage-zip-boundaries';

type Ring = Array<[number, number]>;

// Brand tints per cluster — a deliberate deep→light EMERALD gradient so the
// seven neighborhoods read as one family while staying distinguishable. V15.1
// saturated these up from the previous muted sage: on Voyager's cream land the
// old tints sat too close to the basemap and the coverage area didn't pop. The
// East River zone leans teal to read as the cross-water outlier.
const CLUSTER_COLORS: Record<CoverageCluster['id'], string> = {
  'ues-uws': '#1F7A4D',
  midtown: '#2A8F5B',
  'chelsea-flatiron-ev': '#36A368',
  'gv-soho-tribeca': '#45B677',
  'fidi-battery': '#57C888',
  'south-street': '#6FD89C',
  'east-river': '#2E9A66'
};

export { CLUSTER_COLORS };

const CLUSTER_BY_ID = Object.fromEntries(COVERAGE.clusters.map((c) => [c.id, c]));

// ── Per-ZIP fill features ────────────────────────────────────────────────
// MultiPolygon so split ZIPs (e.g. a ZIP straddling a waterway) render every
// landmass. Each ring from the boundary data becomes its own polygon part.
export type ZipFillFeature = {
  type: 'Feature';
  properties: {
    zip: string;
    clusterId: string;
    clusterShortName: string;
    etaMinutes: number;
    color: string;
  };
  geometry: { type: 'MultiPolygon'; coordinates: Ring[][] };
};

export const ZIP_FILL_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: ZIP_BOUNDARIES.map<ZipFillFeature>((z) => {
    const cluster = CLUSTER_BY_ID[z.clusterId];
    return {
      type: 'Feature',
      properties: {
        zip: z.zip,
        clusterId: z.clusterId,
        clusterShortName: cluster.shortName,
        etaMinutes: cluster.etaMinutes,
        color: CLUSTER_COLORS[z.clusterId as CoverageCluster['id']]
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: z.rings.map((ring) => [ring])
      }
    };
  })
};

// ── Spotlight mask (V16) ─────────────────────────────────────────────────
// One world-sized polygon with every coverage polygon punched out as a hole.
// Rendered as a faint ink fill UNDER the ZIP fills, it dims everything
// OUTSIDE the delivery area so the covered zones visibly pop — without
// touching the basemap inside the boundary. Holes only need each part's
// OUTER ring (part[0]); the boundary data has no inner-ring islands.
export const COVERAGE_MASK_GEOJSON: {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: { type: 'Polygon'; coordinates: Ring[] };
} = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      // Outer ring — the whole world (Web-Mercator-safe ±85 latitude).
      [
        [-180, -85],
        [180, -85],
        [180, 85],
        [-180, 85],
        [-180, -85]
      ],
      // Holes — the outer ring of every polygon part of every covered ZIP.
      ...ZIP_FILL_GEOJSON.features.flatMap((f) =>
        f.geometry.coordinates.map((part) => part[0])
      )
    ]
  }
};

// ── Per-ZIP label anchors (Census interior points) ───────────────────────
export type ZipLabelFeature = {
  type: 'Feature';
  properties: { zip: string; clusterId: string };
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export const ZIP_LABEL_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: ZIP_BOUNDARIES.map<ZipLabelFeature>((z) => ({
    type: 'Feature',
    properties: { zip: z.zip, clusterId: z.clusterId },
    geometry: { type: 'Point', coordinates: z.centroid }
  }))
};

// ── Per-CLUSTER label anchors — the default, decluttered layer ────────────
export type ClusterLabelFeature = {
  type: 'Feature';
  properties: {
    id: string;
    shortName: string;
    name: string;
    etaMinutes: number;
    zipCount: number;
    color: string;
  };
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export const CLUSTER_LABEL_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: COVERAGE.clusters
    .filter((c) => CLUSTER_CENTROIDS[c.id])
    .map<ClusterLabelFeature>((c) => ({
      type: 'Feature',
      properties: {
        id: c.id,
        shortName: c.shortName,
        name: c.name,
        etaMinutes: c.etaMinutes,
        zipCount: c.zips.length,
        color: CLUSTER_COLORS[c.id]
      },
      geometry: { type: 'Point', coordinates: CLUSTER_CENTROIDS[c.id] }
    }))
};

// Tight real-geometry bounds for the initial fitBounds view.
export const MAP_BOUNDS: [[number, number], [number, number]] = COVERAGE_BOUNDS;

// Carto Voyager — soft cream land, sage parks, tinted water, crisp built-in
// borough/neighborhood typography. Premium reference basemap, no API key.
export const TILE_URL =
  'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';
export const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>';
