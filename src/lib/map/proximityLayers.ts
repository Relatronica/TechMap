import { LngLatBounds, type GeoJSONSource } from 'maplibre-gl';
import {
  computeProximityInsight,
  insightToMapGeoJSON,
  type ProximityInsight,
  type SettlementFeature
} from '../proximity';
import { fetchJson } from './domUtils';
import type { MapContext } from './types';

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

const RING_LAYER = 'proximity-rings';
const LINK_LAYER = 'proximity-links';
const SETTLEMENT_LAYER = 'proximity-settlements';
const LABEL_LAYER = 'proximity-settlement-labels';

export const PROXIMITY_LAYER_IDS = [RING_LAYER, LINK_LAYER, SETTLEMENT_LAYER, LABEL_LAYER];

export async function attachProximityLayers(ctx: MapContext) {
  const data = await fetchJson('/data/overlays/lombardia_settlements.geojson', {
    optional: true
  });
  const settlements = (data?.features || []) as SettlementFeature[];
  ctx.lombardiaSettlements = settlements;

  ctx.map.addSource('proximity-rings', { type: 'geojson', data: EMPTY });
  ctx.map.addSource('proximity-links', { type: 'geojson', data: EMPTY });
  ctx.map.addSource('proximity-settlements', { type: 'geojson', data: EMPTY });

  const beforeId = ctx.map.getLayer('connections-powers')
    ? 'connections-powers'
    : ctx.map.getLayer('data-centers-layer')
      ? 'data-centers-layer'
      : undefined;

  ctx.map.addLayer(
    {
      id: RING_LAYER,
      type: 'line',
      source: 'proximity-rings',
      paint: {
        'line-color': '#5a7a88',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          0.8,
          12,
          1.4,
          15,
          1.8
        ],
        'line-opacity': 0.5,
        'line-dasharray': [2.2, 1.8]
      }
    },
    beforeId
  );

  ctx.map.addLayer(
    {
      id: LINK_LAYER,
      type: 'line',
      source: 'proximity-links',
      paint: {
        'line-color': '#6a8a7a',
        'line-width': [
          'case',
          ['==', ['get', 'is_host'], true],
          2,
          ['==', ['get', 'rank'], 1],
          1.8,
          1.1
        ],
        'line-opacity': [
          'case',
          ['==', ['get', 'is_host'], true],
          0.8,
          ['==', ['get', 'rank'], 1],
          0.75,
          0.45
        ]
      }
    },
    beforeId
  );

  ctx.map.addLayer(
    {
      id: SETTLEMENT_LAYER,
      type: 'circle',
      source: 'proximity-settlements',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          [
            'case',
            ['==', ['get', 'is_host'], true],
            5,
            ['==', ['get', 'rank'], 1],
            4.5,
            3
          ],
          13,
          [
            'case',
            ['==', ['get', 'is_host'], true],
            7.5,
            ['==', ['get', 'rank'], 1],
            7,
            5
          ]
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'is_host'], true],
          '#2f5a6e',
          ['==', ['get', 'rank'], 1],
          '#3d6a5c',
          '#5a7a6a'
        ],
        'circle-stroke-width': 1.2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    },
    beforeId
  );

  // Name only — distances live in the HTML scale legend / sidebar (UI typography).
  ctx.map.addLayer(
    {
      id: LABEL_LAYER,
      type: 'symbol',
      source: 'proximity-settlements',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        'text-max-width': 10,
        'text-optional': true,
        'text-padding': 2
      },
      paint: {
        'text-color': '#3d4a54',
        'text-halo-color': 'rgba(244, 246, 248, 0.95)',
        'text-halo-width': 1.5,
        'text-opacity': 0.92
      }
    },
    beforeId
  );

  function setSourceData(id: string, fc: GeoJSON.FeatureCollection) {
    const src = ctx.map.getSource(id) as GeoJSONSource | undefined;
    if (src) src.setData(fc);
  }

  function clearProximity() {
    setSourceData('proximity-rings', EMPTY);
    setSourceData('proximity-links', EMPTY);
    setSourceData('proximity-settlements', EMPTY);
  }

  function showProximityAt(
    lon: number,
    lat: number,
    options?: { city?: string | null }
  ): ProximityInsight | null {
    const insight = computeProximityInsight(lon, lat, ctx.lombardiaSettlements || [], {
      city: options?.city
    });
    if (!insight) {
      clearProximity();
      return null;
    }
    const geo = insightToMapGeoJSON(insight);
    setSourceData('proximity-rings', geo.rings);
    setSourceData('proximity-links', geo.links);
    setSourceData('proximity-settlements', geo.settlements);
    return insight;
  }

  function frameProximity(insight: ProximityInsight) {
    const [lon, lat] = insight.origin;
    const coords: [number, number][] = [[lon, lat]];
    insight.nearby.forEach((s) => coords.push([s.lon, s.lat]));
    const maxRing = insight.ringsKm[insight.ringsKm.length - 1] || 10;
    const padDeg = maxRing / 111;
    coords.push([lon - padDeg, lat - padDeg], [lon + padDeg, lat + padDeg]);

    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new LngLatBounds(coords[0], coords[0])
    );

    const isNarrow = window.matchMedia('(max-width: 1023px)').matches;
    const padding = isNarrow
      ? { top: 56, bottom: Math.round(window.innerHeight * 0.42), left: 36, right: 36 }
      : { top: 72, bottom: 72, left: 72, right: 420 };

    ctx.map.fitBounds(bounds, {
      padding,
      maxZoom: 12.5,
      duration: 700
    });
  }

  Object.assign(ctx, {
    clearProximity,
    showProximityAt,
    frameProximity
  });
}
