'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CENTROID_GEOJSON,
  CLUSTER_GEOJSON,
  MAP_BOUNDS,
  TILE_ATTRIBUTION,
  TILE_URL
} from '@/lib/coverage-geo';

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
      // Cluster polygon fills — soft green tint
      map.addSource('clusters', { type: 'geojson', data: CLUSTER_GEOJSON });
      map.addLayer({
        id: 'cluster-fill',
        type: 'fill',
        source: 'clusters',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], activeCluster ?? ''],
            0.58,
            0.34
          ]
        }
      });
      // Lime outlines (brand)
      map.addLayer({
        id: 'cluster-outline',
        type: 'line',
        source: 'clusters',
        paint: {
          'line-color': '#C8E66E',
          'line-width': [
            'case',
            ['==', ['get', 'id'], activeCluster ?? ''],
            2.6,
            1.4
          ],
          'line-opacity': 0.9
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
      // Neighborhood + ETA labels
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
          'text-color': '#F5F1E8',
          'text-halo-color': 'rgba(10,20,16,0.9)',
          'text-halo-width': 1.4
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
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) {
          onSelect(id);
          const f = CENTROID_GEOJSON.features.find((x) => x.properties.id === id);
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
      map.setPaintProperty('cluster-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], activeCluster ?? ''],
        0.58,
        0.34
      ]);
    }
    if (map.getLayer('cluster-outline')) {
      map.setPaintProperty('cluster-outline', 'line-width', [
        'case',
        ['==', ['get', 'id'], activeCluster ?? ''],
        2.6,
        1.4
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
    <div
      ref={containerRef}
      className="h-[480px] w-full overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/12 sm:h-[560px] lg:h-[620px]"
      aria-label="Live map of Raindrops Greenery NYC delivery coverage — Manhattan, LIC, Williamsburg, Greenpoint"
      role="application"
    />
  );
}
