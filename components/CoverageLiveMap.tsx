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
import { ALL_ZIPS } from '@/lib/coverage';

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

  // Initialize the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          // V14 — Carto Voyager basemap. Source/layer id kept as
          // `carto-base` (renamed from the legacy `carto-dark`) so future
          // greps land somewhere sensible.
          'carto-base': {
            type: 'raster',
            tiles: [TILE_URL],
            tileSize: 256,
            attribution: TILE_ATTRIBUTION
          }
        },
        layers: [{ id: 'carto-base', type: 'raster', source: 'carto-base' }]
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
      // V14 — Polygon fills are tuned down (0.22→0.16 default, 0.50→0.38
      // active) so the Voyager basemap reads clearly through them.
      // Polygons now feel like coverage hints, not blanket fills.
      map.addLayer({
        id: 'cluster-fill',
        type: 'fill',
        source: 'zips',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['==', ['get', 'clusterId'], activeCluster ?? ''],
            0.38,
            0.16
          ]
        }
      });
      // V14 — Polygon outlines use the brand sage rather than full lime
      // so they tie back to the cluster fill colors instead of stamping a
      // neon ring on a soft basemap. Widths also dropped (0.8 default,
      // 1.8 active) to feel finer against Voyager's typography.
      map.addLayer({
        id: 'cluster-outline',
        type: 'line',
        source: 'zips',
        paint: {
          'line-color': '#5B8C6E',
          'line-width': [
            'case',
            ['==', ['get', 'clusterId'], activeCluster ?? ''],
            1.8,
            0.8
          ],
          'line-opacity': 0.7
        }
      });

      // V14 — Centroid pins re-tuned for the light Voyager basemap.
      // Ring fill drops to a near-white tint so the lime stroke reads
      // crisp, dot picks up the brand-ink center for a tighter "drop pin"
      // silhouette against cream land.
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
          'circle-color': 'rgba(255,255,255,0.85)',
          'circle-stroke-color': '#4A7A5C',
          'circle-stroke-width': 2
        }
      });
      map.addLayer({
        id: 'centroid-dot',
        type: 'circle',
        source: 'centroids',
        paint: {
          'circle-radius': 4,
          'circle-color': '#13241D'
        }
      });
      // V14 — Custom borough labels removed. Voyager ships its own
      // typography for MANHATTAN / BROOKLYN / QUEENS / NEW JERSEY, so
      // stamping our own on top would have produced duplicate labels.
      // (Legacy borough source/layer lived here under the dark_nolabels
      // tileset — see git history if you need the coords.)

      // V14 — Per-ZIP labels are bumped a level higher (minzoom 11.5 →
      // 12) so they only show once the user has zoomed in past the
      // neighborhood view. Text shifts from lime-on-dark to deep ink
      // with a cream halo to read against Voyager's light land tiles.
      map.addSource('zip-labels', { type: 'geojson', data: ZIP_LABEL_GEOJSON });
      map.addLayer({
        id: 'zip-label',
        type: 'symbol',
        source: 'zip-labels',
        minzoom: 12,
        layout: {
          'text-field': ['get', 'zip'],
          'text-font': ['literal', ['Open Sans Semibold', 'Arial Unicode MS Bold']],
          'text-size': 11,
          'text-letter-spacing': 0.08,
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': 'rgba(19, 36, 29, 0.82)',
          'text-halo-color': 'rgba(240, 232, 210, 0.95)',
          'text-halo-width': 1.5
        }
      });

      // V14 — Neighborhood + ETA pin labels flip from cream-on-dark to
      // ink-on-cream so they pop against Voyager's land color.
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
          'text-color': '#13241D',
          'text-halo-color': 'rgba(240, 232, 210, 0.96)',
          'text-halo-width': 1.8
        }
      });

      // V13 — Live driver dots removed (May 2026).
      // The animated dots interpolated in straight lines between
      // waypoints, which meant they visibly crossed the East River
      // without a bridge underneath. That broke the "feels real"
      // illusion and signalled "this is fake animation" — net
      // negative on credibility. The RAF loop was also the single
      // highest-CPU thing on the page. Removed both. Road-snapped
      // drivers would need a paid Mapbox Directions API key OR a
      // self-hosted OSRM instance to do correctly; out of scope
      // for v1 launch.

      // V14 — Soft-glow outline tuned for the lighter basemap. The blur
      // is widened (6 → 8) and the color shifts from lime to the brand
      // sage so the feathered edge harmonizes with the cluster fills and
      // Voyager's cream/sage palette instead of stamping a neon halo on
      // a soft basemap.
      map.addLayer({
        id: 'zip-glow',
        type: 'line',
        source: 'zips',
        paint: {
          'line-color': '#5B8C6E',
          'line-width': 6,
          'line-opacity': 0.18,
          'line-blur': 8
        }
      });

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
      // V14 — Tuned to the lighter Voyager basemap: 0.16 default → 0.38
      // active so the brand fills tint the map without blanketing it.
      map.setPaintProperty('cluster-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'clusterId'], activeCluster ?? ''],
        0.38,
        0.16
      ]);
    }
    if (map.getLayer('cluster-outline')) {
      map.setPaintProperty('cluster-outline', 'line-width', [
        'case',
        ['==', ['get', 'clusterId'], activeCluster ?? ''],
        1.8,
        0.8
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
        Coverage stat eyebrow — static, accurate, on-brand chrome at the
        top-left of the map. Replaces the previous "5 drops in motion"
        copy that was tied to the (now-removed) animated driver dots.
        States a true fact about the service: 32 covered ZIPs delivered
        same-day. Pure decoration; coverage data already lives in the
        cluster cards + ZIP labels for screen readers.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-ink)]/72 px-3 py-1.5 backdrop-blur-md sm:left-5 sm:top-5"
      >
        <span className="rd-pulse" aria-hidden />
        <span className="rd-eyebrow text-[color:var(--rd-glow)]">
          {ALL_ZIPS.length} ZIPs · Same-day NYC
        </span>
      </div>
    </div>
  );
}
