'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CLUSTER_LABEL_GEOJSON,
  MAP_BOUNDS,
  TILE_ATTRIBUTION,
  TILE_URL,
  ZIP_FILL_GEOJSON,
  ZIP_LABEL_GEOJSON
} from '@/lib/coverage-geo';
import { ALL_ZIPS } from '@/lib/coverage';

/**
 * V15 — Real-boundary coverage map (MapLibre GL JS, no API key).
 *
 * What changed from V14:
 *  • Polygons are now REAL US Census ZCTA boundaries for the 32 covered ZIPs
 *    (see lib/coverage-zip-boundaries.ts) — they follow streets and the
 *    waterfront, so the map reads as a precise coverage inset, not "squares."
 *  • Decluttered labels: the default view shows 7 CLUSTER labels (neighborhood
 *    + ETA). Individual ZIP numbers fade in only when you zoom into a
 *    neighborhood (minzoom gate) — clicking a cluster flies in and reveals
 *    them automatically. No more 32 numbers stacked on one view.
 *  • Premium finish: white casing under each colored boundary (a "cut from
 *    paper" inset look), soft cluster pin halos, feature-state hover glow,
 *    and a subtle brand vignette over the basemap.
 *
 * Lazy-loaded via next/dynamic from CoverageMap; only ships when the coverage
 * section scrolls into view.
 */

type Props = {
  activeCluster: string | null;
  onSelect: (clusterId: string | null) => void;
};

const FLY_ZOOM = 13.4;

// Fill opacity as a data-driven expression. `active` dims everything except
// the selected cluster so the choice reads instantly; hovered ZIPs always pop.
function fillOpacity(active: string | null): maplibregl.ExpressionSpecification {
  const base: maplibregl.ExpressionSpecification = active
    ? ([
        'case',
        ['==', ['get', 'clusterId'], active],
        0.58,
        0.12
      ] as unknown as maplibregl.ExpressionSpecification)
    : (0.32 as unknown as maplibregl.ExpressionSpecification);
  return [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    0.62,
    base
  ] as unknown as maplibregl.ExpressionSpecification;
}

function lineWidth(active: string | null): maplibregl.ExpressionSpecification {
  return [
    'case',
    ['==', ['get', 'clusterId'], active ?? ''],
    1.8,
    0.9
  ] as unknown as maplibregl.ExpressionSpecification;
}

export default function CoverageLiveMap({ activeCluster, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const hoveredId = useRef<number | string | null>(null);
  // Keep onSelect fresh without re-binding the map click handler (which is
  // bound once at load). Fixes the stale-closure risk on /delivery.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-base': {
            type: 'raster',
            tiles: [TILE_URL],
            tileSize: 256,
            attribution: TILE_ATTRIBUTION
          }
        },
        layers: [{ id: 'carto-base', type: 'raster', source: 'carto-base' }]
      },
      bounds: MAP_BOUNDS,
      fitBoundsOptions: { padding: { top: 36, right: 28, bottom: 44, left: 28 } },
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
      dragRotate: false,
      touchZoomRotate: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.scrollZoom.disable();
    map.on('wheel', (e) => {
      if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        e.originalEvent.preventDefault();
        map.scrollZoom.enable();
        window.setTimeout(() => map.scrollZoom.disable(), 600);
      }
    });

    map.on('load', () => {
      // ── ZIP polygons (real ZCTA boundaries) ──────────────────────────
      map.addSource('zips', {
        type: 'geojson',
        data: ZIP_FILL_GEOJSON,
        generateId: true // enables feature-state hover
      });

      // Fill — brand sage gradient per cluster, dimmed/boosted by selection.
      map.addLayer({
        id: 'zip-fill',
        type: 'fill',
        source: 'zips',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': fillOpacity(activeCluster)
        }
      });

      // White casing UNDER the colored line — the premium "inset" halo that
      // makes each neighborhood read as cleanly cut from the map.
      map.addLayer({
        id: 'zip-casing',
        type: 'line',
        source: 'zips',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2.6,
          'line-opacity': 0.55
        }
      });

      // Colored boundary line on top of the casing.
      map.addLayer({
        id: 'zip-line',
        type: 'line',
        source: 'zips',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': lineWidth(activeCluster),
          'line-opacity': 0.9
        }
      });

      // ── Cluster pins (7) ─────────────────────────────────────────────
      map.addSource('cluster-labels', { type: 'geojson', data: CLUSTER_LABEL_GEOJSON });

      // Soft halo behind each pin.
      map.addLayer({
        id: 'cluster-halo',
        type: 'circle',
        source: 'cluster-labels',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 9, 13, 16],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.18,
          'circle-blur': 0.6
        }
      });
      // Pin: white fill, colored ring, ink center dot via a second layer.
      map.addLayer({
        id: 'cluster-pin',
        type: 'circle',
        source: 'cluster-labels',
        paint: {
          'circle-radius': 5.5,
          'circle-color': '#FFFFFF',
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-width': 2.5
        }
      });

      // ── Cluster labels — DEFAULT decluttered layer (7 names + ETA) ────
      // Visible when zoomed out; hands off to ZIP numbers past zoom 13.
      map.addLayer({
        id: 'cluster-label',
        type: 'symbol',
        source: 'cluster-labels',
        maxzoom: 13.2,
        layout: {
          'text-field': [
            'format',
            ['get', 'shortName'],
            { 'font-scale': 1.0, 'text-font': ['literal', ['Open Sans Bold', 'Arial Unicode MS Bold']] },
            '\n',
            {},
            ['concat', '~', ['get', 'etaMinutes'], ' min · ', ['to-string', ['get', 'zipCount']], ' ZIPs'],
            { 'font-scale': 0.82, 'text-font': ['literal', ['Open Sans Semibold', 'Arial Unicode MS Bold']] }
          ],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-size': 13,
          'text-allow-overlap': false,
          'text-optional': true
        },
        paint: {
          'text-color': '#16271F',
          'text-halo-color': 'rgba(255,255,255,0.96)',
          'text-halo-width': 2
        }
      });

      // ── ZIP number labels — appear only when zoomed in (≥13) ──────────
      map.addSource('zip-labels', { type: 'geojson', data: ZIP_LABEL_GEOJSON });
      map.addLayer({
        id: 'zip-label',
        type: 'symbol',
        source: 'zip-labels',
        minzoom: 13,
        layout: {
          'text-field': ['get', 'zip'],
          'text-font': ['literal', ['Open Sans Semibold', 'Arial Unicode MS Bold']],
          'text-size': 12,
          'text-letter-spacing': 0.04,
          'text-allow-overlap': false,
          'text-optional': true
        },
        paint: {
          'text-color': 'rgba(22,39,31,0.9)',
          'text-halo-color': 'rgba(255,255,255,0.95)',
          'text-halo-width': 1.6
        }
      });

      // ── Interactions ─────────────────────────────────────────────────
      const setHover = (id: number | string | null) => {
        if (hoveredId.current !== null) {
          map.setFeatureState({ source: 'zips', id: hoveredId.current }, { hover: false });
        }
        hoveredId.current = id;
        if (id !== null) {
          map.setFeatureState({ source: 'zips', id }, { hover: true });
        }
      };

      map.on('mousemove', 'zip-fill', (e) => {
        e.target.getCanvas().style.cursor = 'pointer';
        const f = e.features?.[0];
        if (f && f.id != null) setHover(f.id);
      });
      map.on('mouseleave', 'zip-fill', (e) => {
        e.target.getCanvas().style.cursor = '';
        setHover(null);
      });
      map.on('mouseenter', 'cluster-pin', (e) => {
        e.target.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'cluster-pin', (e) => {
        e.target.getCanvas().style.cursor = '';
      });

      const handleClick = (
        e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }
      ) => {
        const props = e.features?.[0]?.properties ?? {};
        const clusterId = (props.clusterId ?? props.id) as string | undefined;
        if (!clusterId) return;
        onSelectRef.current(clusterId);
        const f = CLUSTER_LABEL_GEOJSON.features.find((x) => x.properties.id === clusterId);
        if (f) {
          map.flyTo({ center: f.geometry.coordinates, zoom: FLY_ZOOM, speed: 0.8, curve: 1.4 });
        }
      };
      map.on('click', 'zip-fill', handleClick);
      map.on('click', 'cluster-pin', handleClick);

      ready.current = true;
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      ready.current = false;
      hoveredId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect activeCluster changes — repaint + fly.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready.current) return;

    if (map.getLayer('zip-fill')) {
      map.setPaintProperty('zip-fill', 'fill-opacity', fillOpacity(activeCluster));
    }
    if (map.getLayer('zip-line')) {
      map.setPaintProperty('zip-line', 'line-width', lineWidth(activeCluster));
    }

    if (activeCluster) {
      const f = CLUSTER_LABEL_GEOJSON.features.find((x) => x.properties.id === activeCluster);
      if (f) {
        map.flyTo({ center: f.geometry.coordinates, zoom: FLY_ZOOM, speed: 0.8, curve: 1.4 });
      }
    } else {
      map.fitBounds(MAP_BOUNDS, {
        padding: { top: 36, right: 28, bottom: 44, left: 28 },
        duration: 900
      });
    }
  }, [activeCluster]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[480px] w-full overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/12 sm:h-[560px] lg:h-[620px]"
        aria-label="Map of Raindrops Greenery NYC delivery coverage — Manhattan, Long Island City, Williamsburg, and Greenpoint, shown as real ZIP-code boundaries"
        role="application"
      />
      {/* Brand vignette — ties the generic basemap to the site without
          dimming labels. Pure decoration, never intercepts pointer events. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(19,36,29,0.18)]"
      />
      {/* Coverage stat eyebrow — true, on-brand chrome top-left. */}
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
