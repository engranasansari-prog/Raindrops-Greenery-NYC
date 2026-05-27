'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CENTROID_GEOJSON,
  CLUSTER_GEOJSON,
  MAP_CENTER,
  MAP_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL
} from '@/lib/coverage-geo';

/**
 * V9 §3 — Real interactive map (MapLibre GL JS).
 *
 * Branded NYC view styled in Raindrops palette:
 *   - Dark Carto raster tiles as the basemap
 *   - 7 cluster polygons drawn as semi-transparent green fills, each
 *     bordered in lime
 *   - Centroid pins with cluster shortName labels — animated lime ring
 *   - Hover highlight + click → fly-to + parent callback
 *
 * Lazy-loaded via next/dynamic so the ~250KB MapLibre bundle only ships
 * when a user actually toggles the live map view.
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
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.scrollZoom.disable(); // Don't hijack page scroll on desktop
    // ⌘ / ctrl + scroll re-enables zoom — feels native
    map.on('wheel', (e) => {
      if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        e.originalEvent.preventDefault();
        map.scrollZoom.enable();
        window.setTimeout(() => map.scrollZoom.disable(), 600);
      }
    });

    map.on('load', () => {
      // Cluster polygons
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
            0.55,
            0.32
          ]
        }
      });
      map.addLayer({
        id: 'cluster-outline',
        type: 'line',
        source: 'clusters',
        paint: {
          'line-color': '#C8E66E',
          'line-width': [
            'case',
            ['==', ['get', 'id'], activeCluster ?? ''],
            2.4,
            1.2
          ],
          'line-opacity': 0.85
        }
      });

      // Centroid pins
      map.addSource('centroids', { type: 'geojson', data: CENTROID_GEOJSON });
      map.addLayer({
        id: 'centroid-ring',
        type: 'circle',
        source: 'centroids',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], activeCluster ?? ''],
            14,
            10
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
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-size': 12
        },
        paint: {
          'text-color': '#F5F1E8',
          'text-halo-color': 'rgba(10,20,16,0.85)',
          'text-halo-width': 1.4
        }
      });

      // Interactions
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
        0.55,
        0.32
      ]);
    }
    if (map.getLayer('cluster-outline')) {
      map.setPaintProperty('cluster-outline', 'line-width', [
        'case',
        ['==', ['get', 'id'], activeCluster ?? ''],
        2.4,
        1.2
      ]);
    }
    if (map.getLayer('centroid-ring')) {
      map.setPaintProperty('centroid-ring', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], activeCluster ?? ''],
        14,
        10
      ]);
    }

    if (activeCluster) {
      const f = CENTROID_GEOJSON.features.find((x) => x.properties.id === activeCluster);
      if (f) {
        map.flyTo({ center: f.geometry.coordinates, zoom: 12.6, speed: 0.8, curve: 1.4 });
      }
    } else {
      map.flyTo({ center: MAP_CENTER, zoom: MAP_ZOOM, speed: 0.6 });
    }
  }, [activeCluster]);

  return (
    <div
      ref={containerRef}
      className="h-[480px] w-full overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/12 sm:h-[540px] lg:h-[600px]"
      aria-label="Live map of Raindrops Greenery NYC delivery coverage"
      role="application"
    />
  );
}
