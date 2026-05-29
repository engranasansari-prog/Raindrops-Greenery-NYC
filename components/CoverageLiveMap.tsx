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
  // V15.1 — bumped from 0.32 default so the (now more saturated) brand green
  // reads as a clear delivery zone on the cream basemap instead of a faint wash.
  const base: maplibregl.ExpressionSpecification = active
    ? ([
        'case',
        ['==', ['get', 'clusterId'], active],
        0.6,
        0.14
      ] as unknown as maplibregl.ExpressionSpecification)
    : (0.42 as unknown as maplibregl.ExpressionSpecification);
  return [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    0.68,
    base
  ] as unknown as maplibregl.ExpressionSpecification;
}

function lineWidth(active: string | null): maplibregl.ExpressionSpecification {
  // Crisper borders (was 0.9 / 1.8) so each zone reads as cleanly cut.
  return [
    'case',
    ['==', ['get', 'clusterId'], active ?? ''],
    2.2,
    1.3
  ] as unknown as maplibregl.ExpressionSpecification;
}

// ── Live delivery couriers ────────────────────────────────────────────────
// Short, LAND-ONLY routes that stay WITHIN a single neighborhood. This is the
// hard lesson from the removed v12 dots: long straight lines between far points
// cut across the East River with no bridge and looked fake. Each path here
// follows the local street grid and never leaves its landmass, so the motion
// reads as believable local deliveries. Coordinates are [lng, lat].
const DELIVERY_ROUTES: Array<Array<[number, number]>> = [
  // Midtown — east along a cross-street, then a jog
  [[-73.9855, 40.758], [-73.982, 40.756], [-73.979, 40.7545], [-73.976, 40.756], [-73.974, 40.7585]],
  // Upper East Side — up an avenue
  [[-73.962, 40.7705], [-73.9585, 40.772], [-73.955, 40.7735], [-73.952, 40.7755]],
  // Greenwich Village / Soho — a short local loop
  [[-74.001, 40.73], [-73.9985, 40.7285], [-73.996, 40.727], [-73.999, 40.7255]],
  // Williamsburg (Brooklyn — entirely east of the river, no crossing)
  [[-73.958, 40.713], [-73.9545, 40.7145], [-73.951, 40.716], [-73.9475, 40.715]]
];

// Bike badge — deep-emerald disc, lime ring, cream Lucide "bike" glyph. Inlined
// as an SVG data URI so there's no asset to ship or 404.
const COURIER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>" +
  "<circle cx='24' cy='24' r='21' fill='#1B3328' stroke='#C8E66E' stroke-width='2.5'/>" +
  "<g transform='translate(11,12)' fill='none' stroke='#F0E8D2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
  "<circle cx='18.5' cy='17.5' r='3.5'/><circle cx='5.5' cy='17.5' r='3.5'/><circle cx='15' cy='5' r='1'/>" +
  "<path d='M12 17.5V14l-3-3 4-3 2 3h2'/></g></svg>";

function interpRoute(pts: Array<[number, number]>, t: number): [number, number] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
    total += segs[i];
  }
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] ? target / segs[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
}

function courierGeojson(progress: number[]) {
  return {
    type: 'FeatureCollection' as const,
    features: progress.map((t, i) => ({
      type: 'Feature' as const,
      properties: { id: i },
      geometry: { type: 'Point' as const, coordinates: interpRoute(DELIVERY_ROUTES[i], t) }
    }))
  };
}

function staticGeojson(kind: 'line' | 'dest') {
  return {
    type: 'FeatureCollection' as const,
    features: DELIVERY_ROUTES.map((r, i) => ({
      type: 'Feature' as const,
      properties: { id: i },
      geometry:
        kind === 'line'
          ? { type: 'LineString' as const, coordinates: r }
          : { type: 'Point' as const, coordinates: r[r.length - 1] }
    }))
  };
}

export default function CoverageLiveMap({ activeCluster, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const hoveredId = useRef<number | string | null>(null);
  const rafRef = useRef<number | null>(null);
  const visRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
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
          'line-width': 2.8,
          'line-opacity': 0.7
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

      // ── Live delivery couriers — the "deliveries in motion" layer ───────
      // Faint dashed route, a pulsing destination pin, and a bike badge that
      // rides the route. Routes are short + land-only (see DELIVERY_ROUTES).
      map.addSource('routes', { type: 'geojson', data: staticGeojson('line') });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'routes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#C8E66E', 'line-width': 2, 'line-opacity': 0.45, 'line-dasharray': [1.5, 1.5] }
      });

      map.addSource('destinations', { type: 'geojson', data: staticGeojson('dest') });
      map.addLayer({
        id: 'dest-pulse',
        type: 'circle',
        source: 'destinations',
        paint: { 'circle-radius': 7, 'circle-color': '#C8E66E', 'circle-opacity': 0.22 }
      });
      map.addLayer({
        id: 'dest-dot',
        type: 'circle',
        source: 'destinations',
        paint: { 'circle-radius': 3.5, 'circle-color': '#1B3328', 'circle-stroke-color': '#C8E66E', 'circle-stroke-width': 1.5 }
      });

      // Staggered start positions so the couriers aren't synchronized.
      const progress = DELIVERY_ROUTES.map((_, i) => i / DELIVERY_ROUTES.length);
      map.addSource('couriers', { type: 'geojson', data: courierGeojson(progress) });

      const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const img = new Image(48, 48);
      img.onload = () => {
        const m = mapRef.current;
        if (!m) return;
        if (!m.hasImage('courier')) m.addImage('courier', img, { pixelRatio: 2 });
        if (!m.getLayer('courier')) {
          m.addLayer({
            id: 'courier',
            type: 'symbol',
            source: 'couriers',
            layout: {
              'icon-image': 'courier',
              'icon-size': 0.62,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
        }
        if (reduceMotion) return; // honor reduced-motion: couriers sit still

        const SPEED = 1 / 14000; // a full local route every ~14s
        let last = performance.now();
        const tick = (now: number) => {
          const dt = now - last;
          last = now;
          for (let i = 0; i < progress.length; i++) {
            progress[i] += SPEED * dt;
            if (progress[i] > 1) progress[i] -= 1;
          }
          const src = m.getSource('couriers') as maplibregl.GeoJSONSource | undefined;
          if (src) src.setData(courierGeojson(progress));
          if (m.getLayer('dest-pulse')) {
            m.setPaintProperty('dest-pulse', 'circle-radius', 7 + 3 * Math.sin(now / 600));
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        const start = () => {
          if (rafRef.current == null) {
            last = performance.now();
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        const stop = () => {
          if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        };

        // Only animate while the map is BOTH on-screen and the tab is visible.
        // Without this, the rAF kept repainting the GL canvas every frame even
        // while the visitor sat at the top of the page or had scrolled past —
        // pure wasted CPU/battery (worst on mobile). Now the cost is zero
        // unless the customer is actually looking at the map.
        let inView = false;
        let tabVisible = typeof document === 'undefined' || !document.hidden;
        const sync = () => (inView && tabVisible ? start() : stop());

        const onVis = () => {
          tabVisible = !document.hidden;
          sync();
        };
        visRef.current = onVis;
        document.addEventListener('visibilitychange', onVis);

        if (containerRef.current && 'IntersectionObserver' in window) {
          observerRef.current = new IntersectionObserver(
            (entries) => {
              inView = entries.some((e) => e.isIntersecting);
              sync();
            },
            { threshold: 0.05 }
          );
          observerRef.current.observe(containerRef.current);
        } else {
          inView = true;
          sync();
        }
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(COURIER_SVG);

      ready.current = true;
    });

    mapRef.current = map;
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (visRef.current) document.removeEventListener('visibilitychange', visRef.current);
      visRef.current = null;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
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
