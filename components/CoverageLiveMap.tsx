'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CLUSTER_LABEL_GEOJSON,
  COVERAGE_MASK_GEOJSON,
  MAP_BOUNDS,
  TILE_ATTRIBUTION,
  TILE_URL,
  ZIP_FILL_GEOJSON,
  ZIP_LABEL_GEOJSON
} from '@/lib/coverage-geo';
import { ALL_ZIPS } from '@/lib/coverage';

/**
 * V16 — "Spotlight" precision pass on the V15 real-boundary map.
 *
 * What changed from V15:
 *  • Spotlight mask: a world polygon with the coverage cut out dims everything
 *    OUTSIDE the delivery area, and deepens while a cluster is selected.
 *  • Boundary glow under the white casing (back-lit-glass edges), cinematic
 *    staggered entrance, 350ms cross-fades on selection, a fine-pointer hover
 *    tooltip driven by direct DOM writes, marching-ants route dashes + halo
 *    breathing piggybacked on the existing courier rAF, and zoom-faded ZIP
 *    labels. All of it sits behind the same visibility/reduced-motion gates.
 *
 * What changed from V14 (V15):
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

// V16 — glow opacity mirrors fillOpacity's attention ladder (hover > active
// cluster > ambient) so the back-lit edge brightens exactly where the eye is.
function glowOpacity(active: string | null): maplibregl.ExpressionSpecification {
  return [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    0.5,
    ['==', ['get', 'clusterId'], active ?? ''],
    0.42,
    0.2
  ] as unknown as maplibregl.ExpressionSpecification;
}

// V16 — spotlight mask strength: the outside-world ink wash deepens while a
// cluster is selected so the spotlight visibly tightens around the choice.
function maskOpacity(active: string | null): number {
  return active ? 0.15 : 0.08;
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

// V16 — marching-ants frames for 'route-line': stepping line-dasharray through
// this cycle (~every 140ms, inside the EXISTING courier rAF) makes the dashes
// appear to flow toward the destination. dash+gap length stays constant (7) so
// the pattern slides instead of flickering.
const DASH_CYCLE: number[][] = [
  [0, 4, 3],
  [1, 4, 2],
  [2, 4, 1],
  [3, 4, 0]
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
  // V16 — hover tooltip nodes, written DIRECTLY from map mousemove. Refs (not
  // state) so a busy cursor never triggers a React render per frame.
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tipNameRef = useRef<HTMLSpanElement | null>(null);
  const tipMetaRef = useRef<HTMLSpanElement | null>(null);
  // V16 — entrance-stagger timers, cleared on unmount so a fast navigation
  // can't fire setPaintProperty against a removed map.
  const timersRef = useRef<number[]>([]);
  // V16 — latest activeCluster for the (load-time) entrance closure, so its
  // staggered targets always match what the activeCluster effect would set.
  const activeClusterRef = useRef<string | null>(activeCluster);
  // Keep onSelect fresh without re-binding the map click handler (which is
  // bound once at load). Fixes the stale-closure risk on /delivery.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // ── On-demand pause (WCAG 2.2.2 Pause, Stop, Hide) ────────────────────────
  // The couriers / marching-ants / pulse / halo loops are gated to only run
  // while on-screen + tab-visible, but a user must also be able to STOP the
  // motion on demand. `userPaused` is the source of truth the button toggles;
  // `syncRef` points at the load-time sync() so the button can re-run the
  // gate after flipping it. We keep both a ref (read inside the rAF gate, no
  // re-render) and React state (drives the button's aria-pressed + label).
  const userPausedRef = useRef(false);
  const [userPaused, setUserPaused] = useState(false);
  const syncRef = useRef<(() => void) | null>(null);
  // Only show the toggle once the courier loop has actually been wired up —
  // before that there's nothing to pause, and reduced-motion never animates.
  const [motionControllable, setMotionControllable] = useState(false);

  const toggleMotion = useCallback(() => {
    const next = !userPausedRef.current;
    userPausedRef.current = next;
    setUserPaused(next);
    // Re-evaluate the gate: pausing stops immediately; resuming only restarts
    // if the map is still in view + the tab is visible (sync() owns that AND).
    syncRef.current?.();
  }, []);

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
      // Cooperative gestures: on this mobile-heavy audience a one-finger drag on
      // the full-width map must SCROLL THE PAGE (two fingers pan/pinch the map),
      // and desktop wheel only zooms with ⌘/Ctrl held — otherwise the page
      // scrolls. MapLibre shows its own gesture overlay for both. This replaces
      // the old manual scrollZoom.disable()/wheel-listener dance, which did the
      // desktop half only and would now fight this flag.
      // NOTE: `touchZoomRotate` is intentionally NOT disabled here — the old
      // `touchZoomRotate: false` killed two-finger pinch, which is exactly the
      // gesture cooperative-gestures hands to the map on touch. We keep pinch
      // and disable only the ROTATE half below (flat coverage inset, no compass).
      cooperativeGestures: true
    });

    // Allow two-finger pinch-zoom but keep the map north-up (no twist).
    map.touchZoomRotate.disableRotation();

    // NavigationControl lives bottom-right so its top corner can't overlap the
    // "N ZIPs · Same-day" chip pinned top-left on very narrow (≤360px) phones.
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      // Hoisted up from the courier block (V16) — the entrance fades and the
      // hover tooltip below need these too, and matchMedia is cheap but not
      // free, so query once per load.
      const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer =
        typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

      // ── ZIP polygons (real ZCTA boundaries) ──────────────────────────
      map.addSource('zips', {
        type: 'geojson',
        data: ZIP_FILL_GEOJSON,
        generateId: true // enables feature-state hover
      });

      // Fill — brand sage gradient per cluster, dimmed/boosted by selection.
      // V16: every coverage layer starts at opacity 0 and is raised by the
      // staggered entrance below — no more polygons popping in fully formed.
      map.addLayer({
        id: 'zip-fill',
        type: 'fill',
        source: 'zips',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0 // entrance target: fillOpacity(active)
        }
      });

      // ── Spotlight mask (V16) ──────────────────────────────────────────
      // World polygon with the coverage punched out (lib/coverage-geo.ts):
      // a faint ink wash over everything OUTSIDE the delivery area so the
      // covered zones pop. beforeId slots it ABOVE the basemap raster but
      // BELOW 'zip-fill', so it never tints the zones themselves.
      map.addSource('coverage-mask', { type: 'geojson', data: COVERAGE_MASK_GEOJSON });
      map.addLayer(
        {
          id: 'coverage-mask',
          type: 'fill',
          source: 'coverage-mask',
          paint: {
            'fill-color': '#1B3328',
            'fill-opacity': 0 // entrance target: maskOpacity(active) — 0.08 idle / 0.15 selected
          }
        },
        'zip-fill'
      );

      // ── Boundary glow (V16) — UNDER the white casing ──────────────────
      // A blurred, brand-colored echo of the boundary that reads like
      // back-lit glass. Opacity follows attention (hover > active > ambient)
      // via glowOpacity; width scales with zoom so the halo stays soft.
      map.addLayer({
        id: 'zip-glow',
        type: 'line',
        source: 'zips',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-blur': 5,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 13, 9],
          'line-opacity': 0 // entrance target: glowOpacity(active)
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
          'line-opacity': 0 // entrance target: 0.7
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
          'line-opacity': 0 // entrance target: 0.9
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
          'text-halo-width': 1.6,
          // V16 — fade ZIP numbers in across the fly-in (zoom 13→13.4) so
          // they develop with the camera instead of popping at the minzoom
          // boundary. minzoom 13 stays as the cheap render gate.
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.4, 0.95]
        }
      });

      // ── Cinematic entrance + liquid transitions (V16) ──────────────────
      // All coverage layers above were added at opacity 0. Once the first
      // frame settles ('idle'), each fades up over 900ms in a short stagger —
      // mask first, then glow+fill, then the crisp casing/line — so the
      // coverage "develops" like a print instead of popping in. The targets
      // come from the same fillOpacity/glowOpacity/maskOpacity helpers the
      // activeCluster effect uses (via activeClusterRef), so the steady state
      // never fights that effect. Reduced motion: jump straight to finals.
      const entranceSteps: Array<{ layer: string; prop: string; target: unknown; delay: number }> = [
        { layer: 'coverage-mask', prop: 'fill-opacity', target: 0, delay: 0 },
        { layer: 'zip-glow', prop: 'line-opacity', target: 0, delay: 120 },
        { layer: 'zip-fill', prop: 'fill-opacity', target: 0, delay: 120 },
        { layer: 'zip-casing', prop: 'line-opacity', target: 0.7, delay: 240 },
        { layer: 'zip-line', prop: 'line-opacity', target: 0.9, delay: 240 }
      ];
      // Targets that depend on the live selection are resolved at fire time.
      const resolveTarget = (step: { layer: string; target: unknown }) => {
        const active = activeClusterRef.current;
        if (step.layer === 'coverage-mask') return maskOpacity(active);
        if (step.layer === 'zip-glow') return glowOpacity(active);
        if (step.layer === 'zip-fill') return fillOpacity(active);
        return step.target;
      };
      // Liquid selection: once steady, every activeCluster change cross-fades
      // (350ms) instead of stepping — dim/boost reads as one fluid move.
      const setLiquidTransitions = () => {
        const m = mapRef.current;
        if (!m) return;
        const t = { duration: 350, delay: 0 };
        if (m.getLayer('zip-fill')) m.setPaintProperty('zip-fill', 'fill-opacity-transition', t);
        if (m.getLayer('zip-line')) m.setPaintProperty('zip-line', 'line-width-transition', t);
        if (m.getLayer('zip-glow')) m.setPaintProperty('zip-glow', 'line-opacity-transition', t);
        if (m.getLayer('coverage-mask')) m.setPaintProperty('coverage-mask', 'fill-opacity-transition', t);
      };
      if (reduceMotion) {
        // Reduced motion: no entrance fade, no selection cross-fade — every
        // value lands instantly, exactly as the preference asks. Transitions
        // must be pinned to 0 explicitly (MapLibre's default is 300ms).
        const instant = { duration: 0, delay: 0 };
        for (const step of entranceSteps) {
          map.setPaintProperty(step.layer, `${step.prop}-transition`, instant);
          map.setPaintProperty(step.layer, step.prop, resolveTarget(step));
        }
        map.setPaintProperty('zip-line', 'line-width-transition', instant);
      } else {
        map.once('idle', () => {
          for (const step of entranceSteps) {
            timersRef.current.push(
              window.setTimeout(() => {
                const m = mapRef.current;
                if (!m || !m.getLayer(step.layer)) return;
                m.setPaintProperty(step.layer, `${step.prop}-transition`, { duration: 900, delay: 0 });
                m.setPaintProperty(step.layer, step.prop, resolveTarget(step));
              }, step.delay)
            );
          }
          // Hand the slow entrance transitions over to the 350ms selection
          // cross-fade once the last fade has fully landed (240ms + 900ms).
          timersRef.current.push(window.setTimeout(setLiquidTransitions, 1200));
        });
      }

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
        // V16 hover tooltip — fine pointers only, updated via REFS + direct
        // DOM writes (textContent / style.transform). Zero React state per
        // mousemove, so hovering across dense boundaries never re-renders.
        const tip = tooltipRef.current;
        if (finePointer && tip && f) {
          const p = f.properties as {
            clusterShortName?: string;
            etaMinutes?: number;
            zip?: string;
          };
          if (tipNameRef.current) tipNameRef.current.textContent = p.clusterShortName ?? '';
          if (tipMetaRef.current) tipMetaRef.current.textContent = `~${p.etaMinutes} min · ZIP ${p.zip}`;
          // Offset clear of the cursor; flip to the cursor's left near the
          // right edge so the pill never clips outside the rounded frame.
          const width = containerRef.current?.clientWidth ?? 0;
          const flip = e.point.x > width - 200;
          tip.style.transform = flip
            ? `translate(${e.point.x - 14}px, ${e.point.y + 14}px) translateX(-100%)`
            : `translate(${e.point.x + 14}px, ${e.point.y + 14}px)`;
          tip.style.opacity = '1';
        }
      });
      map.on('mouseleave', 'zip-fill', (e) => {
        e.target.getCanvas().style.cursor = '';
        setHover(null);
        // Hide the V16 tooltip (DOM write only — same no-state rule).
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
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
        // V16 living details — accumulated in THIS tick (never a second rAF)
        // so they inherit the exact same gating: off-screen, hidden tab, and
        // reduced-motion all stop them along with the couriers.
        let dashElapsed = 0;
        let dashStep = 0;
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
          // V16 marching ants — step the route dash pattern every ~140ms so
          // the dashes flow toward the destination (a 60fps step would strobe).
          dashElapsed += dt;
          if (dashElapsed >= 140) {
            dashElapsed = 0;
            dashStep = (dashStep + 1) % DASH_CYCLE.length;
            if (m.getLayer('route-line')) {
              m.setPaintProperty('route-line', 'line-dasharray', DASH_CYCLE[dashStep]);
            }
          }
          // V16 halo breathing — a gentle ±0.05 sine around 0.15 keeps the
          // cluster pins feeling alive without ever shouting.
          if (m.getLayer('cluster-halo')) {
            m.setPaintProperty('cluster-halo', 'circle-opacity', 0.15 + 0.05 * Math.sin(now / 900));
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

        // Only animate while the map is BOTH on-screen and the tab is visible —
        // AND the user hasn't pressed Pause. Without the on-screen gate the rAF
        // kept repainting the GL canvas every frame even while the visitor sat
        // at the top of the page or had scrolled past — pure wasted CPU/battery
        // (worst on mobile). The userPaused gate (WCAG 2.2.2) lets anyone stop
        // the motion on demand; resuming still respects in-view + tab-visible.
        let inView = false;
        let tabVisible = typeof document === 'undefined' || !document.hidden;
        const sync = () =>
          inView && tabVisible && !userPausedRef.current ? start() : stop();

        // Expose sync() so the on-screen Pause/Play button can re-run the gate
        // after toggling userPaused, and reveal the control now that there's a
        // live loop to pause.
        syncRef.current = sync;
        setMotionControllable(true);

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
      // V16 — kill pending entrance timers so they can't touch a removed map.
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
      if (visRef.current) document.removeEventListener('visibilitychange', visRef.current);
      visRef.current = null;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
      syncRef.current = null;
      map.remove();
      mapRef.current = null;
      ready.current = false;
      hoveredId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect activeCluster changes — repaint + fly.
  useEffect(() => {
    // Keep the ref current even before the map is ready: the V16 entrance
    // reads it at fire time so its targets always match this effect's.
    activeClusterRef.current = activeCluster;
    const map = mapRef.current;
    if (!map || !ready.current) return;

    if (map.getLayer('zip-fill')) {
      map.setPaintProperty('zip-fill', 'fill-opacity', fillOpacity(activeCluster));
    }
    if (map.getLayer('zip-line')) {
      map.setPaintProperty('zip-line', 'line-width', lineWidth(activeCluster));
    }
    // V16 — the glow tracks the selection and the spotlight mask deepens
    // (0.08 → 0.15) while a cluster is active. Both cross-fade through the
    // 350ms transitions set at load, so the change reads liquid, not stepped.
    if (map.getLayer('zip-glow')) {
      map.setPaintProperty('zip-glow', 'line-opacity', glowOpacity(activeCluster));
    }
    if (map.getLayer('coverage-mask')) {
      map.setPaintProperty('coverage-mask', 'fill-opacity', maskOpacity(activeCluster));
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
        // role="img" (not "application"): the map offers no keyboard way to
        // select a zone, so announcing it as an interactive application would
        // strand keyboard/AT users. The keyboard-operable summary cards beside
        // the map are the accessible path to every zone's detail; here we just
        // describe the visual as a labelled image.
        aria-label="Map of Raindrops Greenery NYC delivery coverage — Manhattan, Long Island City, Williamsburg, and Greenpoint, shown as real ZIP-code boundaries. Use the coverage cards beside the map to view each zone's delivery details."
        role="img"
      />
      {/* V16 hover tooltip — desktop (fine pointer) only; positioned and
          filled IMPERATIVELY from the map's mousemove via refs, never state.
          pointer-events-none so it can't steal the hover it follows; hidden
          from AT (the hover data duplicates the coverage cards beside the
          map). Starts parked off-canvas + transparent until the first hover. */}
      <div
        ref={tooltipRef}
        aria-hidden
        style={{ transform: 'translate(-9999px, -9999px)' }}
        className="pointer-events-none absolute left-0 top-0 z-20 hidden flex-col rounded-full border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink)]/85 px-3 py-1.5 opacity-0 backdrop-blur-md motion-safe:transition-opacity motion-safe:duration-150 pointer-fine:flex"
      >
        <span
          ref={tipNameRef}
          className="text-[13px] font-semibold leading-tight text-[color:var(--rd-paper)]"
        />
        <span ref={tipMetaRef} className="rd-eyebrow text-[color:var(--rd-glow)]" />
      </div>
      {/* Brand vignette — ties the generic basemap to the site without
          dimming labels. Pure decoration, never intercepts pointer events. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(27,51,40,0.18)]"
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
      {/* Pause / Play motion toggle (WCAG 2.2.2) — the couriers, marching-ants
          route dashes, destination pulse, and pin halos all loop indefinitely,
          so users must be able to stop them on demand. Mirrors the canonical
          HeroSlider control: a real <button>, aria-pressed, an aria-label that
          swaps Play/Pause, the global lime :focus-visible ring, and a ≥44px hit
          area. Sits top-right, clear of the top-left stat chip and the
          bottom-right zoom controls. Hidden until the loop is wired up (and
          never shown under reduced-motion, where nothing animates). */}
      {motionControllable && (
        <button
          type="button"
          onClick={toggleMotion}
          aria-pressed={userPaused}
          aria-label={userPaused ? 'Play map motion' : 'Pause map motion'}
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-ink)]/72 text-[color:var(--rd-glow)] backdrop-blur-md transition hover:border-[color:var(--rd-glow)]/55 hover:bg-[color:var(--rd-ink)]/85 sm:right-5 sm:top-5"
        >
          {userPaused ? (
            <Play className="h-4 w-4" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
        </button>
      )}
      {/* Responsive zoom hint — cooperative gestures change the interaction per
          device, so the prompt must too. Touch (coarse pointer) reads "Pinch to
          zoom"; mouse (fine pointer) reads "⌘ + scroll". Sits bottom-left, clear
          of the top-left stat chip and the bottom-right zoom controls. Pure
          chrome, hidden from AT (the container's role/aria-label cover intent). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 left-4 z-10 inline-flex items-center rounded-full border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink)]/72 px-3 py-1.5 backdrop-blur-md sm:left-5"
      >
        <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">
          <span className="hidden pointer-fine:inline">⌘ + scroll to zoom · tap a zone</span>
          <span className="pointer-fine:hidden">Pinch to zoom · tap a zone</span>
        </span>
      </div>
    </div>
  );
}
