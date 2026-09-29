import { LngLatBounds, type GeoJSONSource } from 'maplibre-gl';
import {
  computeNoiseInsight,
  noiseInsightToMapGeoJSON,
  type NoiseInput,
  type NoiseInsight
} from '../noiseEstimates';
import type { MapContext } from './types';

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

const BAND_LAYER = 'noise-bands';
const OUTLINE_LAYER = 'noise-outlines';

export const NOISE_LAYER_IDS = [BAND_LAYER, OUTLINE_LAYER];

export function attachNoiseLayers(ctx: MapContext) {
  ctx.map.addSource('noise-bands', { type: 'geojson', data: EMPTY });
  ctx.map.addSource('noise-outlines', { type: 'geojson', data: EMPTY });

  const beforeId = ctx.map.getLayer('proximity-rings')
    ? 'proximity-rings'
    : ctx.map.getLayer('connections-powers')
      ? 'connections-powers'
      : ctx.map.getLayer('data-centers-layer')
        ? 'data-centers-layer'
        : undefined;

  ctx.map.addLayer(
    {
      id: BAND_LAYER,
      type: 'fill',
      source: 'noise-bands',
      paint: {
        'fill-color': [
          'match',
          ['get', 'lp_dba'],
          45,
          '#c4a574',
          50,
          '#b8885c',
          55,
          '#a56a48',
          65,
          '#8f4a38',
          '#a56a48'
        ],
        'fill-opacity': [
          'match',
          ['get', 'lp_dba'],
          45,
          0.1,
          50,
          0.16,
          55,
          0.22,
          65,
          0.3,
          0.14
        ]
      }
    },
    beforeId
  );

  ctx.map.addLayer(
    {
      id: OUTLINE_LAYER,
      type: 'line',
      source: 'noise-outlines',
      paint: {
        'line-color': [
          'match',
          ['get', 'lp_dba'],
          45,
          '#a88860',
          50,
          '#9a7048',
          55,
          '#8a5a3a',
          65,
          '#7a3e2c',
          '#8a5a3a'
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          0.7,
          13,
          1.4
        ],
        'line-opacity': 0.65
      }
    },
    beforeId
  );

  function setSourceData(id: string, fc: GeoJSON.FeatureCollection) {
    const src = ctx.map.getSource(id) as GeoJSONSource | undefined;
    if (src) src.setData(fc);
  }

  function clearNoise() {
    setSourceData('noise-bands', EMPTY);
    setSourceData('noise-outlines', EMPTY);
  }

  function showNoiseAt(
    lon: number,
    lat: number,
    options?: {
      noise?: NoiseInput | null;
      subtype?: string | null;
      capacityMw?: number | null;
      force?: boolean;
    }
  ): NoiseInsight | null {
    const insight = computeNoiseInsight(lon, lat, options || {});
    if (!insight) {
      clearNoise();
      return null;
    }
    const geo = noiseInsightToMapGeoJSON(insight);
    setSourceData('noise-bands', geo.bands);
    setSourceData('noise-outlines', geo.outlines);
    return insight;
  }

  function frameNoise(insight: NoiseInsight, extraCoords: [number, number][] = []) {
    const [lon, lat] = insight.origin;
    const maxKm = Math.max(...insight.contours.map((c) => c.radiusKm), 0.5);
    const padDeg = maxKm / 111;
    const coords: [number, number][] = [
      [lon, lat],
      [lon - padDeg, lat - padDeg],
      [lon + padDeg, lat + padDeg],
      ...extraCoords
    ];
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
      maxZoom: 13.2,
      duration: 700
    });
  }

  Object.assign(ctx, {
    clearNoise,
    showNoiseAt,
    frameNoise
  });
}
