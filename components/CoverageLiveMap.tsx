'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CENTROID_GEOJSON,
  MAP_BOUNDS,
  TILE_ATTRIBUTION,
  TILE_URL,
  ZIP_FILL_GEOJSON,
  ZIP_LABEL_GEOJSON
} from '@/lib/coverage-geo';
import { DELIVERY_ROUTES, DRIVER_SPEEDS, TRAIL_LENGTH } from '@/lib/delivery-routes';

type DriverState = {
  routeIndex: number;
  segmentIndex: number;
  progress: number;
  speed: number;
  trail: Array<[number, number]>;
};

/** Build initial driver states staggered across each route so they
 *  don't all start from waypoint 0. */
function initialDriverStates(): DriverState[] {
  return DELIVERY_ROUTES.map((route, i) => ({
    routeIndex: i,
    segmentIndex: Math.floor(Math.random() * Math.max(1, route.waypoints.length - 1)),
    progress: Math.random(),
    speed: DRIVER_SPEEDS[i % DRIVER_SPEEDS.length],
    trail: []
  }));
}

/**
 * V9 — Single, clean interactive map (MapLibre GL JS, no API key).
 *
 * Design goals (per client review):
 *   • One map — no Illustrated / Live toggle. This IS the map.
 *   • Full preview of Manhattan + LIC + Williamsburg + Greenpoint
 *     visible on first paint via fitBounds.
 *   • Branded styling — dark Carto basemap + lime cluster strokes +
 *     subtle lime centroid markers + neighborhood + ETA labels.
 *   • Click any cluster → fly-to + parent callback opens detail panel.
 *
 * Lazy-loaded via next/dynamic from CoverageMap; only ships when the
 * coverage section actually scrolls into view.
 */

type Props = {
  activeCluster: string | null;
  onSelect: (clusterId: string | null) => void;
};

export default function CoverageLiveMap({ activeCluster, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Initialize the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [TILE_URL],
            tileSize: 256,
            attribution: TILE_ATTRIBUTION
          }
        },
        layers: [{ id: 'carto-dark', type: 'raster', source: 'carto-dark' }]
      },
      // Use bounds instead of fixed center/zoom so the entire delivery
      // footprint is visible on first paint regardless of viewport size.
      bounds: MAP_BOUNDS,
      fitBoundsOptions: { padding: { top: 28, right: 24, bottom: 40, left: 24 } },
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
      // No rotation — the orientation is fixed so neighborhoods stay
      // in their familiar positions.
      dragRotate: false,
      touchZoomRotate: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.scrollZoom.disable(); // don't hijack page scroll on desktop
    // ⌘ / ctrl + scroll re-enables zoom — feels native
    map.on('wheel', (e) => {
      if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        e.originalEvent.preventDefault();
        map.scrollZoom.enable();
        window.setTimeout(() => map.scrollZoom.disable(), 600);
      }
    });

    map.on('load', () => {
      // V11 — Per-ZIP polygon fills replacing the old 7 cluster blobs.
      // Each of the 32 covered ZIPs gets its own polygon colored by its
      // cluster's brand tint. Reads as a real ZIP-code coverage map
      // instead of generic neighborhood shading. Opacity is the same
      // 0.22 default → 0.50 active (when the parent cluster is selected)
      // that we tuned for the cluster blobs.
      map.addSource('zips', { type: 'geojson', data: ZIP_FILL_GEOJSON });
      map.addLayer({
        id: 'cluster-fill',
        type: 'fill',
        source: 'zips',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['==', ['get', 'clusterId'], activeCluster ?? ''],
            0.50,
            0.22
          ]
        }
      });
      // Lime outlines per ZIP — slightly thinner than the old cluster
      // outline since each ZIP polygon is smaller. Active cluster's ZIPs
      // get the heavier line.
      map.addLayer({
        id: 'cluster-outline',
        type: 'line',
        source: 'zips',
        paint: {
          'line-color': '#C8E66E',
          'line-width': [
            'case',
            ['==', ['get', 'clusterId'], activeCluster ?? ''],
            2.2,
            1.1
          ],
          'line-opacity': 0.85
        }
      });

      // Centroid markers — lime ring + dot
      map.addSource('centroids', { type: 'geojson', data: CENTROID_GEOJSON });
      map.addLayer({
        id: 'centroid-ring',
        type: 'circle',
        source: 'centroids',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], activeCluster ?? ''],
            16,
            11
          ],
          'circle-color': 'rgba(200,230,110,0.18)',
          'circle-stroke-color': '#C8E66E',
          'circle-stroke-width': 1.5
        }
      });
      map.addLayer({
        id: 'centroid-dot',
        type: 'circle',
        source: 'centroids',
        paint: {
          'circle-radius': 4,
          'circle-color': '#C8E66E'
        }
      });
      // Borough labels — large, dim, set well below the cluster pins so
      // they orient the viewer ("oh, that's Manhattan") without competing
      // with the neighborhood pin labels. Rendered first (bottom of the
      // stack visually) and at a tracked uppercase mono treatment so they
      // read as a geographic anchor, not interactive content. This is the
      // "I can't see Manhattan" fix — the dark basemap with no built-in
      // labels needs our own borough markers to be legible.
      map.addSource('boroughs', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { name: 'MANHATTAN' }, geometry: { type: 'Point', coordinates: [-73.998, 40.785] } },
            { type: 'Feature', properties: { name: 'BROOKLYN' }, geometry: { type: 'Point', coordinates: [-73.944, 40.708] } },
            { type: 'Feature', properties: { name: 'QUEENS' }, geometry: { type: 'Point', coordinates: [-73.870, 40.755] } },
            { type: 'Feature', properties: { name: 'NEW JERSEY' }, geometry: { type: 'Point', coordinates: [-74.060, 40.738] } }
          ]
        }
      });
      map.addLayer({
        id: 'borough-label',
        type: 'symbol',
        source: 'boroughs',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['literal', ['Open Sans Bold', 'Arial Unicode MS Bold']],
          'text-size': 16,
          'text-letter-spacing': 0.22,
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': 'rgba(240, 232, 210, 0.42)',
          'text-halo-color': 'rgba(19, 36, 29, 0.85)',
          'text-halo-width': 1.6
        }
      });

      // Per-ZIP labels — small lime mono text at each ZIP's centroid.
      // Zoom-gated via the layout filter so labels only appear when
      // the customer has zoomed in close enough to see neighborhoods
      // clearly (≥ zoom 11.5). At wider zooms they auto-hide so the
      // map doesn't feel cluttered.
      map.addSource('zip-labels', { type: 'geojson', data: ZIP_LABEL_GEOJSON });
      map.addLayer({
        id: 'zip-label',
        type: 'symbol',
        source: 'zip-labels',
        minzoom: 11.5,
        layout: {
          'text-field': ['get', 'zip'],
          'text-font': ['literal', ['Open Sans Semibold', 'Arial Unicode MS Bold']],
          'text-size': 11,
          'text-letter-spacing': 0.08,
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': 'rgba(200, 230, 110, 0.70)',
          'text-halo-color': 'rgba(19, 36, 29, 0.88)',
          'text-halo-width': 1.3
        }
      });

      // Neighborhood + ETA labels for each cluster pin.
      map.addLayer({
        id: 'centroid-label',
        type: 'symbol',
        source: 'centroids',
        layout: {
          'text-field': [
            'format',
            ['get', 'shortName'],
            { 'font-scale': 1.0, 'text-font': ['literal', ['Open Sans Semibold', 'Arial Unicode MS Bold']] },
            '\n',
            {},
            ['concat', '~', ['get', 'etaMinutes'], ' min'],
            { 'font-scale': 0.85 }
          ],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-size': 12
        },
        paint: {
          'text-color': '#F0E8D2',
          'text-halo-color': 'rgba(19,36,29,0.92)',
          'text-halo-width': 1.6
        }
      });

      // V11 — Live driver dots animating along predefined NYC routes.
      // Two layers per driver: a "trail" of the last N positions in
      // decreasing opacity (motion blur) + the active "dot" with pulse
      // glow. Sources are empty FeatureCollections at init; the RAF
      // loop below sets the data each frame.
      map.addSource('driver-trail', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addSource('driver-dot',   { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      // Trails — small lime dots fading back, painted UNDER the active dot.
      map.addLayer({
        id: 'driver-trail',
        type: 'circle',
        source: 'driver-trail',
        paint: {
          'circle-radius': 2.5,
          'circle-color': '#C8E66E',
          'circle-opacity': ['get', 'opacity'],
          'circle-blur': 0.3
        }
      });
      // Glow halo behind the active dot — slight pulse via paint.
      map.addLayer({
        id: 'driver-glow',
        type: 'circle',
        source: 'driver-dot',
        paint: {
          'circle-radius': 10,
          'circle-color': 'rgba(200, 230, 110, 0.18)',
          'circle-blur': 0.7
        }
      });
      // The active driver dot itself — bright lime, sharp.
      map.addLayer({
        id: 'driver-dot',
        type: 'circle',
        source: 'driver-dot',
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#C8E66E',
          'circle-stroke-color': 'rgba(19, 36, 29, 0.85)',
          'circle-stroke-width': 1.4
        }
      });

      // Animation loop — interpolates each driver between waypoints,
      // keeps a short trail, updates both GeoJSON sources every frame.
      // Respects prefers-reduced-motion: if reduced motion is set,
      // we render a single static frame and skip the RAF loop.
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const drivers = initialDriverStates();
      const trailSrc = map.getSource('driver-trail') as maplibregl.GeoJSONSource;
      const dotSrc = map.getSource('driver-dot') as maplibregl.GeoJSONSource;

      const step = () => {
        const dotFeatures: GeoJSON.Feature[] = [];
        const trailFeatures: GeoJSON.Feature[] = [];

        drivers.forEach((d, i) => {
          const route = DELIVERY_ROUTES[d.routeIndex];
          const a = route.waypoints[d.segmentIndex];
          const b = route.waypoints[d.segmentIndex + 1] ?? route.waypoints[0];
          const lng = a[0] + (b[0] - a[0]) * d.progress;
          const lat = a[1] + (b[1] - a[1]) * d.progress;

          // Push current position into the trail buffer (oldest drops off).
          d.trail.push([lng, lat]);
          if (d.trail.length > TRAIL_LENGTH) d.trail.shift();

          // Emit the active dot feature.
          dotFeatures.push({
            type: 'Feature',
            properties: { id: i },
            geometry: { type: 'Point', coordinates: [lng, lat] }
          });

          // Emit the trail features (skip the most recent — that IS the
          // dot — so the trail starts visually behind the dot).
          d.trail.slice(0, -1).forEach((pos, t) => {
            // Older positions are fainter. Opacity decays from 0.35 → 0.05.
            const opacity = 0.05 + (t / TRAIL_LENGTH) * 0.30;
            trailFeatures.push({
              type: 'Feature',
              properties: { opacity },
              geometry: { type: 'Point', coordinates: pos }
            });
          });

          // Advance progress; wrap to next segment / next route as needed.
          if (!reducedMotion) {
            d.progress += d.speed;
            if (d.progress >= 1) {
              d.progress = 0;
              d.segmentIndex += 1;
              if (d.segmentIndex >= route.waypoints.length - 1) {
                // Restart at the beginning of the route for a smooth loop.
                d.segmentIndex = 0;
                d.trail = [];
              }
            }
          }
        });

        dotSrc.setData({ type: 'FeatureCollection', features: dotFeatures });
        trailSrc.setData({ type: 'FeatureCollection', features: trailFeatures });

        if (!reducedMotion) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      step();

      // Interactions — pointer cursor + click handler
      const cursor = (e: maplibregl.MapMouseEvent) => {
        e.target.getCanvas().style.cursor = 'pointer';
      };
      const unCursor = (e: maplibregl.MapMouseEvent) => {
        e.target.getCanvas().style.cursor = '';
      };
      map.on('mouseenter', 'cluster-fill', cursor);
      map.on('mouseleave', 'cluster-fill', unCursor);
      map.on('mouseenter', 'centroid-ring', cursor);
      map.on('mouseleave', 'centroid-ring', unCursor);

      const handleClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        // Each layer reports a different property shape:
        //   • cluster-fill (per-ZIP) → properties.clusterId
        //   • centroid-ring + centroid-dot (per-cluster pin) → properties.id
        // Resolve to a single clusterId then trigger the standard
        // select-and-fly behavior.
        const props = e.features?.[0]?.properties ?? {};
        const clusterId = (props.clusterId ?? props.id) as string | undefined;
        if (clusterId) {
          onSelect(clusterId);
          const f = CENTROID_GEOJSON.features.find((x) => x.properties.id === clusterId);
          if (f) {
            map.flyTo({ center: f.geometry.coordinates, zoom: 12.6, speed: 0.8 });
          }
        }
      };
      map.on('click', 'cluster-fill', handleClick);
      map.on('click', 'centroid-ring', handleClick);

      ready.current = true;
    });

    mapRef.current = map;
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      ready.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect activeCluster changes — update paint expressions + fly-to
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready.current) return;

    if (map.getLayer('cluster-fill')) {
      // V11 — the fill layer now reads from the per-ZIP source; key on
      // `clusterId` not `id`. Active cluster's ZIPs pop at 0.50; the
      // rest stay at the calm 0.22 default so the basemap reads through.
      map.setPaintProperty('cluster-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'clusterId'], activeCluster ?? ''],
        0.50,
        0.22
      ]);
    }
    if (map.getLayer('cluster-outline')) {
      map.setPaintProperty('cluster-outline', 'line-width', [
        'case',
        ['==', ['get', 'clusterId'], activeCluster ?? ''],
        2.2,
        1.1
      ]);
    }
    if (map.getLayer('centroid-ring')) {
      map.setPaintProperty('centroid-ring', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], activeCluster ?? ''],
        16,
        11
      ]);
    }

    if (activeCluster) {
      const f = CENTROID_GEOJSON.features.find((x) => x.properties.id === activeCluster);
      if (f) {
        map.flyTo({ center: f.geometry.coordinates, zoom: 12.6, speed: 0.8, curve: 1.4 });
      }
    } else {
      // Fly back to the full coverage view when nothing is selected
      map.fitBounds(MAP_BOUNDS, {
        padding: { top: 28, right: 24, bottom: 40, left: 24 },
        duration: 900
      });
    }
  }, [activeCluster]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[480px] w-full overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/12 sm:h-[560px] lg:h-[620px]"
        aria-label="Live map of Raindrops Greenery NYC delivery coverage — Manhattan, LIC, Williamsburg, Greenpoint"
        role="application"
      />
      {/*
        Subtle "drops in motion" counter — positioned over the top-left
        corner of the map. Uses the same eyebrow treatment as the rest
        of the dark sections so it feels like part of the design system
        not a tacked-on widget. Pure decoration — the count is fixed at
        the number of animated routes (5), matching DELIVERY_ROUTES.
        When real driver telemetry is wired up, this will pull from
        live state.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-ink)]/72 px-3 py-1.5 backdrop-blur-md sm:left-5 sm:top-5"
      >
        <span className="rd-pulse" aria-hidden />
        <span className="rd-eyebrow text-[color:var(--rd-glow)]">
          {DELIVERY_ROUTES.length} drops in motion
        </span>
      </div>
    </div>
  );
}
