// Approximate cluster polygons in real lat/lng for the MapLibre live map.
// These are NOT precise neighborhood boundaries — they're carefully tuned
// to feel right on a real map view of NYC. The illustrated SVG remains the
// authoritative "branded" representation; this is the "advanced tech demo".

import type { CoverageCluster } from './coverage';
import { COVERAGE } from './coverage';

// Polygon points are [lng, lat] arrays — GeoJSON convention.
type Ring = Array<[number, number]>;

const CLUSTER_RINGS: Record<CoverageCluster['id'], Ring> = {
  // UES + UWS: roughly 80th-100th streets, both sides of Central Park
  'ues-uws': [
    [-73.991, 40.776],
    [-73.949, 40.792],
    [-73.939, 40.812],
    [-73.961, 40.804],
    [-73.985, 40.798],
    [-73.993, 40.787],
    [-73.991, 40.776]
  ],
  // Midtown: 30s through high 50s
  midtown: [
    [-74.005, 40.748],
    [-73.969, 40.760],
    [-73.965, 40.776],
    [-73.992, 40.770],
    [-74.012, 40.756],
    [-74.005, 40.748]
  ],
  // Chelsea/Flatiron/Gramercy/EV: roughly 14th - 30th
  'chelsea-flatiron-ev': [
    [-74.012, 40.731],
    [-73.974, 40.728],
    [-73.972, 40.750],
    [-74.008, 40.752],
    [-74.012, 40.731]
  ],
  // GV/Soho/Tribeca/Lower Manhattan: Houston down to Canal area
  'gv-soho-tribeca': [
    [-74.018, 40.715],
    [-73.992, 40.722],
    [-73.988, 40.732],
    [-74.014, 40.728],
    [-74.018, 40.715]
  ],
  // FiDi/Battery: tip of Manhattan
  'fidi-battery': [
    [-74.017, 40.700],
    [-74.001, 40.704],
    [-74.005, 40.715],
    [-74.020, 40.712],
    [-74.017, 40.700]
  ],
  // South Street (Seaport)
  'south-street': [
    [-74.005, 40.706],
    [-73.999, 40.704],
    [-73.998, 40.711],
    [-74.005, 40.713],
    [-74.005, 40.706]
  ],
  // East River: LIC, Williamsburg, Greenpoint
  'east-river': [
    [-73.962, 40.748],
    [-73.929, 40.752],
    [-73.929, 40.738],
    [-73.946, 40.718],
    [-73.963, 40.719],
    [-73.962, 40.748]
  ]
};

// Cluster center marker — for raindrop pins on the live map
const CLUSTER_CENTROIDS: Record<CoverageCluster['id'], [number, number]> = {
  'ues-uws': [-73.965, 40.792],
  midtown: [-73.985, 40.758],
  'chelsea-flatiron-ev': [-73.993, 40.741],
  'gv-soho-tribeca': [-74.002, 40.723],
  'fidi-battery': [-74.013, 40.707],
  'south-street': [-74.001, 40.708],
  'east-river': [-73.948, 40.733]
};

// Roughly center the map on Manhattan + East River for default view
export const MAP_CENTER: [number, number] = [-73.97, 40.745];
export const MAP_ZOOM = 11.2;

/**
 * Bounding box that contains every covered cluster polygon, with
 * generous padding so the map shows Manhattan + LIC + Williamsburg +
 * Greenpoint without anything clipped. Used with map.fitBounds() for
 * the initial view so the customer immediately understands the whole
 * delivery footprint.
 */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-74.025, 40.695], // SW corner — below Battery Park
  [-73.92, 40.815]   // NE corner — above the Upper East/West sides + east of Greenpoint
];

// Brand tints per cluster — match the SVG colors so both maps feel
// like the same brand voice.
const CLUSTER_COLORS: Record<CoverageCluster['id'], string> = {
  'ues-uws': '#4A7A5C',
  midtown: '#5B8C6E',
  'chelsea-flatiron-ev': '#6BA180',
  'gv-soho-tribeca': '#7DB591',
  'fidi-battery': '#8FC8A3',
  'south-street': '#A0DBB5',
  'east-river': '#7FA8B0'
};

export type ClusterFeature = {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    shortName: string;
    etaMinutes: number;
    zips: string;
    color: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: Ring[];
  };
};

export type CentroidFeature = {
  type: 'Feature';
  properties: {
    id: string;
    shortName: string;
    etaMinutes: number;
    color: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export const CLUSTER_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: COVERAGE.clusters.map<ClusterFeature>((c) => ({
    type: 'Feature',
    properties: {
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      etaMinutes: c.etaMinutes,
      zips: c.zips.join(', '),
      color: CLUSTER_COLORS[c.id]
    },
    geometry: {
      type: 'Polygon',
      coordinates: [CLUSTER_RINGS[c.id]]
    }
  }))
};

export const CENTROID_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: COVERAGE.clusters.map<CentroidFeature>((c) => ({
    type: 'Feature',
    properties: {
      id: c.id,
      shortName: c.shortName,
      etaMinutes: c.etaMinutes,
      color: CLUSTER_COLORS[c.id]
    },
    geometry: {
      type: 'Point',
      coordinates: CLUSTER_CENTROIDS[c.id]
    }
  }))
};

// Tile source — Carto's Dark Matter basemap with labels disabled, so we
// can render our own typography on top in the brand voice.
// Previously this used `dark_all` which baked in OSM labels in a muted
// gray that competed with the polygon overlays. With 7 cluster polygons
// stacked on Manhattan at 30%+ opacity, the underlying neighborhood and
// landmark labels were unreadable — the client correctly read this as
// "I can't see Manhattan." We use `dark_nolabels` and overlay our own
// stronger, brand-colored labels in CoverageLiveMap.
// No API key required.
export const TILE_URL =
  'https://basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}@2x.png';
export const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>';
