// Per-ZIP polygon shapes and centroids for the coverage map.
//
// V11 (May 2026) — replaces the previous 7 hand-drawn cluster polygons in
// coverage-geo.ts with 32 individual ZIP-code polygons. Each ZIP is shaped
// from NYC street-grid knowledge to approximate USPS boundaries. The
// boundaries aren't USPS-perfect (we don't pull from NYC OpenData at build
// time), but they're substantially more accurate than the previous cluster
// blobs and read as a real ZIP-code coverage map to the customer.
//
// Coordinates: [lng, lat] (GeoJSON convention).
// Each polygon is a closed ring — first point equals last point.

import type { CoverageCluster } from './coverage';

export type ZipShape = {
  zip: string;
  clusterId: CoverageCluster['id'];
  centroid: [number, number];
  polygon: Array<[number, number]>;
};

export const ZIP_SHAPES: ZipShape[] = [
  // ─── UES / UWS — 7 ZIPs ───────────────────────────────────────────
  {
    zip: '10024', // UWS — 79th to 91st, Central Park West to Riverside Park
    clusterId: 'ues-uws',
    centroid: [-73.975, 40.787],
    polygon: [
      [-73.985, 40.780], [-73.965, 40.781], [-73.959, 40.793],
      [-73.972, 40.798], [-73.985, 40.795], [-73.989, 40.788],
      [-73.985, 40.780]
    ]
  },
  {
    zip: '10025', // UWS — 91st to 110th, Central Park West to Riverside Park
    clusterId: 'ues-uws',
    centroid: [-73.968, 40.799],
    polygon: [
      [-73.972, 40.793], [-73.959, 40.793], [-73.951, 40.809],
      [-73.964, 40.812], [-73.975, 40.806], [-73.972, 40.793]
    ]
  },
  {
    zip: '10028', // UES — 79th to 86th, 5th Ave to East River
    clusterId: 'ues-uws',
    centroid: [-73.954, 40.776],
    polygon: [
      [-73.961, 40.772], [-73.946, 40.769], [-73.943, 40.781],
      [-73.957, 40.783], [-73.961, 40.772]
    ]
  },
  {
    zip: '10128', // UES — 86th to 96th, 5th Ave to East River
    clusterId: 'ues-uws',
    centroid: [-73.951, 40.783],
    polygon: [
      [-73.957, 40.781], [-73.943, 40.778], [-73.939, 40.789],
      [-73.953, 40.791], [-73.957, 40.781]
    ]
  },
  {
    zip: '10021', // UES — 62nd to 72nd, 5th Ave to East River
    clusterId: 'ues-uws',
    centroid: [-73.962, 40.766],
    polygon: [
      [-73.969, 40.762], [-73.954, 40.760], [-73.951, 40.771],
      [-73.965, 40.773], [-73.969, 40.762]
    ]
  },
  {
    zip: '10075', // UES — 76th to 86th cross-streets between Lex and East River
    clusterId: 'ues-uws',
    centroid: [-73.957, 40.773],
    polygon: [
      [-73.962, 40.770], [-73.950, 40.768], [-73.947, 40.776],
      [-73.960, 40.778], [-73.962, 40.770]
    ]
  },
  {
    zip: '10065', // UES — 60th to 70th between 5th Ave and East River
    clusterId: 'ues-uws',
    centroid: [-73.964, 40.764],
    polygon: [
      [-73.972, 40.760], [-73.958, 40.757], [-73.955, 40.768],
      [-73.969, 40.770], [-73.972, 40.760]
    ]
  },

  // ─── Midtown — 7 ZIPs ─────────────────────────────────────────────
  {
    zip: '10001', // Midtown West / Chelsea border — 28th to 42nd, 5th to 9th
    clusterId: 'midtown',
    centroid: [-73.997, 40.751],
    polygon: [
      [-74.005, 40.745], [-73.989, 40.748], [-73.987, 40.760],
      [-74.000, 40.758], [-74.007, 40.752], [-74.005, 40.745]
    ]
  },
  {
    zip: '10016', // Midtown East / Murray Hill — 30th to 42nd, 5th to FDR
    clusterId: 'midtown',
    centroid: [-73.978, 40.745],
    polygon: [
      [-73.987, 40.741], [-73.969, 40.743], [-73.966, 40.751],
      [-73.985, 40.754], [-73.989, 40.748], [-73.987, 40.741]
    ]
  },
  {
    zip: '10017', // Midtown East — 40th to 49th, 5th to 1st
    clusterId: 'midtown',
    centroid: [-73.973, 40.753],
    polygon: [
      [-73.982, 40.748], [-73.964, 40.751], [-73.961, 40.759],
      [-73.978, 40.760], [-73.982, 40.748]
    ]
  },
  {
    zip: '10018', // Garment District — 33rd to 42nd, 5th to 9th
    clusterId: 'midtown',
    centroid: [-73.991, 40.755],
    polygon: [
      [-74.000, 40.751], [-73.985, 40.753], [-73.984, 40.761],
      [-73.998, 40.759], [-74.000, 40.751]
    ]
  },
  {
    zip: '10019', // Hell's Kitchen / Midtown — 42nd to 59th, 6th to Hudson
    clusterId: 'midtown',
    centroid: [-73.985, 40.764],
    polygon: [
      [-74.000, 40.759], [-73.977, 40.762], [-73.973, 40.770],
      [-73.997, 40.773], [-74.004, 40.768], [-74.000, 40.759]
    ]
  },
  {
    zip: '10022', // Midtown East — 49th to 59th, 3rd to 5th
    clusterId: 'midtown',
    centroid: [-73.970, 40.759],
    polygon: [
      [-73.978, 40.755], [-73.961, 40.757], [-73.958, 40.765],
      [-73.974, 40.768], [-73.978, 40.755]
    ]
  },
  {
    zip: '10036', // Times Sq — 40th to 49th, 6th to 9th
    clusterId: 'midtown',
    centroid: [-73.988, 40.760],
    polygon: [
      [-73.997, 40.756], [-73.982, 40.758], [-73.980, 40.766],
      [-73.993, 40.766], [-73.997, 40.756]
    ]
  },

  // ─── East Village / LES / Gramercy / Chelsea — 5 ZIPs ──────────────
  {
    zip: '10003', // EV / Gramercy / Union Sq — 14th to Houston, 4th to Ave A
    clusterId: 'chelsea-flatiron-ev',
    centroid: [-73.989, 40.732],
    polygon: [
      [-73.996, 40.726], [-73.982, 40.726], [-73.978, 40.738],
      [-73.992, 40.740], [-73.996, 40.726]
    ]
  },
  {
    zip: '10009', // East Village / Alphabet City — 14th to Houston, Ave A to East River
    clusterId: 'chelsea-flatiron-ev',
    centroid: [-73.978, 40.726],
    polygon: [
      [-73.984, 40.722], [-73.972, 40.722], [-73.969, 40.731],
      [-73.982, 40.733], [-73.984, 40.722]
    ]
  },
  {
    zip: '10002', // Lower East Side — Houston south to E Broadway
    clusterId: 'chelsea-flatiron-ev',
    centroid: [-73.985, 40.717],
    polygon: [
      [-73.994, 40.713], [-73.978, 40.712], [-73.974, 40.722],
      [-73.987, 40.724], [-73.997, 40.720], [-73.994, 40.713]
    ]
  },
  {
    zip: '10010', // Gramercy / Flatiron — 14th to 30th, 1st to 3rd
    clusterId: 'chelsea-flatiron-ev',
    centroid: [-73.982, 40.738],
    polygon: [
      [-73.991, 40.732], [-73.974, 40.733], [-73.972, 40.744],
      [-73.985, 40.745], [-73.991, 40.732]
    ]
  },
  {
    zip: '10011', // Chelsea — 14th to 30th, 5th Ave to Hudson River
    clusterId: 'chelsea-flatiron-ev',
    centroid: [-74.000, 40.741],
    polygon: [
      [-74.010, 40.734], [-73.992, 40.737], [-73.989, 40.748],
      [-74.008, 40.750], [-74.012, 40.741], [-74.010, 40.734]
    ]
  },

  // ─── GV / Soho / Tribeca — 4 ZIPs ─────────────────────────────────
  {
    zip: '10012', // Soho / Nolita — Houston to Canal, Bowery to 6th
    clusterId: 'gv-soho-tribeca',
    centroid: [-73.998, 40.724],
    polygon: [
      [-74.005, 40.720], [-73.992, 40.719], [-73.989, 40.728],
      [-74.003, 40.731], [-74.005, 40.720]
    ]
  },
  {
    zip: '10013', // Tribeca / Soho — Canal to Chambers, Hudson to Bowery
    clusterId: 'gv-soho-tribeca',
    centroid: [-74.005, 40.719],
    polygon: [
      [-74.014, 40.713], [-73.998, 40.715], [-73.997, 40.722],
      [-74.012, 40.725], [-74.014, 40.713]
    ]
  },
  {
    zip: '10014', // West Village — Houston to 14th, 6th to Hudson
    clusterId: 'gv-soho-tribeca',
    centroid: [-74.005, 40.733],
    polygon: [
      [-74.013, 40.728], [-73.999, 40.729], [-73.996, 40.738],
      [-74.011, 40.740], [-74.013, 40.728]
    ]
  },
  {
    zip: '10007', // Tribeca — Canal to Worth, Hudson to Broadway
    clusterId: 'gv-soho-tribeca',
    centroid: [-74.009, 40.714],
    polygon: [
      [-74.016, 40.710], [-74.003, 40.710], [-74.001, 40.717],
      [-74.014, 40.719], [-74.016, 40.710]
    ]
  },

  // ─── FiDi / Battery — 5 ZIPs ──────────────────────────────────────
  {
    zip: '10004', // Battery Park / Bowling Green
    clusterId: 'fidi-battery',
    centroid: [-74.014, 40.703],
    polygon: [
      [-74.019, 40.699], [-74.007, 40.700], [-74.006, 40.708],
      [-74.018, 40.708], [-74.019, 40.699]
    ]
  },
  {
    zip: '10005', // Wall Street
    clusterId: 'fidi-battery',
    centroid: [-74.008, 40.707],
    polygon: [
      [-74.014, 40.704], [-74.003, 40.704], [-74.001, 40.710],
      [-74.011, 40.712], [-74.014, 40.704]
    ]
  },
  {
    zip: '10006', // World Trade Center
    clusterId: 'fidi-battery',
    centroid: [-74.013, 40.710],
    polygon: [
      [-74.018, 40.706], [-74.008, 40.706], [-74.008, 40.713],
      [-74.017, 40.714], [-74.018, 40.706]
    ]
  },
  {
    zip: '10280', // Battery Park City south
    clusterId: 'fidi-battery',
    centroid: [-74.017, 40.713],
    polygon: [
      [-74.022, 40.710], [-74.014, 40.711], [-74.014, 40.717],
      [-74.020, 40.717], [-74.022, 40.710]
    ]
  },
  {
    zip: '10282', // Battery Park City north
    clusterId: 'fidi-battery',
    centroid: [-74.014, 40.717],
    polygon: [
      [-74.019, 40.715], [-74.011, 40.715], [-74.011, 40.720],
      [-74.017, 40.721], [-74.019, 40.715]
    ]
  },

  // ─── South Street Seaport — 1 ZIP ─────────────────────────────────
  {
    zip: '10038',
    clusterId: 'south-street',
    centroid: [-74.002, 40.709],
    polygon: [
      [-74.007, 40.706], [-73.995, 40.706], [-73.995, 40.713],
      [-74.005, 40.713], [-74.007, 40.706]
    ]
  },

  // ─── East River Extensions (LIC + Williamsburg + Greenpoint) — 3 ZIPs ───
  {
    zip: '11101', // Long Island City — Queens Plaza / Vernon-Jackson
    clusterId: 'east-river',
    centroid: [-73.946, 40.747],
    polygon: [
      [-73.955, 40.740], [-73.939, 40.742], [-73.935, 40.753],
      [-73.949, 40.755], [-73.955, 40.740]
    ]
  },
  {
    zip: '11211', // Williamsburg — East River to Bushwick Ave
    clusterId: 'east-river',
    centroid: [-73.952, 40.713],
    polygon: [
      [-73.964, 40.706], [-73.939, 40.708], [-73.937, 40.722],
      [-73.951, 40.724], [-73.962, 40.715], [-73.964, 40.706]
    ]
  },
  {
    zip: '11222', // Greenpoint — Newtown Creek down to Williamsburg border
    clusterId: 'east-river',
    centroid: [-73.948, 40.728],
    polygon: [
      [-73.957, 40.722], [-73.941, 40.725], [-73.937, 40.736],
      [-73.949, 40.737], [-73.956, 40.732], [-73.957, 40.722]
    ]
  }
];

// Quick lookup helpers
export const ZIP_BY_CODE = Object.fromEntries(ZIP_SHAPES.map((z) => [z.zip, z]));
