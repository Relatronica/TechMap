import {
  ICON_PATHS,
  FILTER_GROUPS,
  SUBTYPE_COLORS,
  ICON_STATUS_STYLES,
  ICON_CANVAS_SIZE,
  ICON_PIXEL_RATIO,
  STATUS_BADGE_PIXEL_RATIO,
  STATUS_COLORS,
  STATUS_GET_EXPR,
  ICON_SIZE_BY_ZOOM,
  SITE_ICON_OPACITY_EXPR,
  createMapIconImage,
  iconImageId,
  createStatusBadgeImage,
  statusBadgeImageId,
  buildStatusBadgeIconMatch,
  buildStatusAwareIconExpression
} from '../mapIcons';
import {
  STATUS_BADGE_OPACITY_EXPR,
  STATUS_BADGE_SIZE_EXPR,
  STATUS_BADGE_TRANSLATE_EXPR,
  CONNECTION_OPACITY_BY_CERTAINTY,
  CONNECTION_WIDTH_BY_CERTAINTY,
  CONNECTS_DASHARRAY_BY_CERTAINTY
} from './constants';
import { fetchJson, showMapLoadError } from './domUtils';
import { attachProximityLayers } from './proximityLayers';
import { attachNoiseLayers } from './noiseLayers';
import type { MapContext } from './types';

/** Load GeoJSON, register icons, add sources and style layers. */
export async function setupLayers(ctx: MapContext) {
  try {
    // Fetch all GeoJSON data
    const [dc, rm, ep, gn, conn] = await Promise.all([
      fetchJson('/data/data_centers.geojson'),
      fetchJson('/data/raw_materials.geojson'),
      fetchJson('/data/energy_plants.geojson'),
      fetchJson('/data/grid_nodes.geojson'),
      fetchJson('/data/connections.geojson')
    ]);

    ctx.dataCentersData = dc;
    ctx.rawMaterialsData = rm;
    ctx.energyPlantsData = ep;
    ctx.gridNodesData = gn;
    ctx.connectionsData = conn;
  } catch (err) {
    console.error('Map data load failed', err);
    showMapLoadError(ctx.i18n.map?.load_error || 'Impossibile caricare i dati della mappa.');
    return;
  }

  // Assicura IBM Plex Sans prima di rasterizzare le card (canvas non ha CSS fallback)
  try {
    if (document.fonts?.load) {
      await Promise.race([
        document.fonts.load('600 22px "IBM Plex Sans Variable"'),
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);
    }
  } catch (_) {
    /* fallback Helvetica se il font non è ancora disponibile */
  }

  // Marker icons by subtype × status (pieno / cantiere / fantasma / disattivato)
  Object.values(FILTER_GROUPS).forEach((group) => {
    group.subtypes.forEach((subtype) => {
      const path = ICON_PATHS[subtype];
      if (!path) return;
      const color = SUBTYPE_COLORS[subtype] || group.color;
      ICON_STATUS_STYLES.forEach((style) => {
        const id = iconImageId(subtype, style);
        if (!ctx.map.hasImage(id)) {
          ctx.map.addImage(
            id,
            createMapIconImage(path, color, ICON_CANVAS_SIZE, style),
            { pixelRatio: ICON_PIXEL_RATIO }
          );
        }
      });
    });
  });

  // Chip stato: 4 texture uniche (una per status)
  ['operational', 'under_construction', 'planned', 'decommissioned'].forEach((status) => {
    const id = statusBadgeImageId(status);
    if (!ctx.map.hasImage(id)) {
      ctx.map.addImage(
        id,
        createStatusBadgeImage(
          status,
          ctx.i18n.controls.status_short[status],
          STATUS_COLORS[status]
        ),
        { pixelRatio: STATUS_BADGE_PIXEL_RATIO }
      );
    }
  });

  // Add sources
  ctx.map.addSource('data-centers', { type: 'geojson', data: ctx.dataCentersData });
  ctx.map.addSource('raw-materials', { type: 'geojson', data: ctx.rawMaterialsData });
  ctx.map.addSource('energy-plants', { type: 'geojson', data: ctx.energyPlantsData });
  ctx.map.addSource('grid-nodes', { type: 'geojson', data: ctx.gridNodesData });
  ctx.map.addSource('connections', { type: 'geojson', data: ctx.connectionsData });

  // Context overlays (below site layers)
  ctx.map.addSource('openinframap-power', {
    type: 'vector',
    tiles: ['https://openinframap.org/tiles/{z}/{x}/{y}.pbf'],
    maxzoom: 17,
    attribution: '© OpenStreetMap, OpenInfraMap'
  });

  const [cablesData, landingsData, waterData] = await Promise.all([
    fetchJson('/data/overlays/submarine_cables.geojson', { optional: true }),
    fetchJson('/data/overlays/cable_landings.geojson', { optional: true }),
    fetchJson('/data/overlays/water_stress_eu.geojson', { optional: true })
  ]);

  if (!cablesData || !landingsData || !waterData) {
    console.warn(ctx.i18n.map?.overlay_error || 'Overlay context unavailable');
  }

  ctx.map.addSource('overlay-cables', {
    type: 'geojson',
    data: cablesData || { type: 'FeatureCollection', features: [] }
  });
  ctx.map.addSource('overlay-landings', {
    type: 'geojson',
    data: landingsData || { type: 'FeatureCollection', features: [] }
  });
  ctx.map.addSource('overlay-water', {
    type: 'geojson',
    data: waterData || { type: 'FeatureCollection', features: [] }
  });

  ctx.map.addLayer({
    id: 'overlay-water-fill',
    type: 'fill',
    source: 'overlay-water',
    layout: { visibility: 'none' },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'bws_cat'],
        0, '#c8ddd4',
        1, '#e8d9a8',
        2, '#e0b07a',
        3, '#c97a5a',
        4, '#8f3d4a'
      ],
      'fill-opacity': 0.38
    }
  });

  ctx.map.addLayer({
    id: 'overlay-water-outline',
    type: 'line',
    source: 'overlay-water',
    layout: { visibility: 'none' },
    paint: {
      'line-color': '#6a5a4a',
      'line-width': 0.4,
      'line-opacity': 0.2
    }
  });

  ctx.map.addLayer({
    id: 'overlay-power-lines',
    type: 'line',
    source: 'openinframap-power',
    'source-layer': 'power_line',
    layout: {
      visibility: 'none',
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['to-number', ['get', 'voltage']], 0],
        0, '#b8a48a',
        110000, '#9a7a4a',
        220000, '#7a5a2e',
        400000, '#5a3a18'
      ],
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        4, 0.4,
        8, 1.1,
        12, 2.2
      ],
      'line-opacity': 0.75
    }
  });

  ctx.map.addLayer({
    id: 'overlay-cables-line',
    type: 'line',
    source: 'overlay-cables',
    layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#3d6f8c',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        3, 0.8,
        8, 1.6,
        12, 2.4
      ],
      'line-opacity': 0.7
    }
  });

  ctx.map.addLayer({
    id: 'overlay-cable-landings',
    type: 'circle',
    source: 'overlay-landings',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        3, 2.5,
        8, 4,
        12, 6
      ],
      'circle-color': '#3d6f8c',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85
    }
  });

  // Add connection line layers (below points) — certainty drives weight
  ctx.map.addLayer({
    id: 'connections-powers',
    type: 'line',
    source: 'connections',
    filter: ['==', ['get', 'relationship_type'], 'powers'],
    paint: {
      'line-color': ctx.COLORS.ep,
      'line-width': CONNECTION_WIDTH_BY_CERTAINTY,
      'line-dasharray': [2, 2.5],
      'line-opacity': CONNECTION_OPACITY_BY_CERTAINTY
    }
  });

  ctx.map.addLayer({
    id: 'connections-supplies',
    type: 'line',
    source: 'connections',
    filter: ['==', ['get', 'relationship_type'], 'supplies'],
    paint: {
      'line-color': ctx.COLORS.rm,
      'line-width': CONNECTION_WIDTH_BY_CERTAINTY,
      'line-dasharray': [1.5, 2.5],
      'line-opacity': CONNECTION_OPACITY_BY_CERTAINTY
    }
  });

  ctx.map.addLayer({
    id: 'connections-manufactures',
    type: 'line',
    source: 'connections',
    filter: ['==', ['get', 'relationship_type'], 'manufactures_for'],
    paint: {
      'line-color': ctx.COLORS.dc,
      'line-width': CONNECTION_WIDTH_BY_CERTAINTY,
      'line-dasharray': [4, 3],
      'line-opacity': CONNECTION_OPACITY_BY_CERTAINTY
    }
  });

  ctx.map.addLayer({
    id: 'connections-connects',
    type: 'line',
    source: 'connections',
    filter: ['==', ['get', 'relationship_type'], 'connects'],
    paint: {
      'line-color': ctx.COLORS.gn,
      'line-width': CONNECTION_WIDTH_BY_CERTAINTY,
      'line-dasharray': CONNECTS_DASHARRAY_BY_CERTAINTY,
      'line-opacity': CONNECTION_OPACITY_BY_CERTAINTY
    }
  });

  ctx.map.addLayer({
    id: 'connections-trains',
    type: 'line',
    source: 'connections',
    filter: ['==', ['get', 'relationship_type'], 'trains'],
    paint: {
      'line-color': ctx.COLORS.labor,
      'line-width': CONNECTION_WIDTH_BY_CERTAINTY,
      'line-dasharray': [1, 2.2, 4, 2.2],
      'line-opacity': CONNECTION_OPACITY_BY_CERTAINTY
    }
  });

  const pointLayerPaint = {
    'icon-opacity': SITE_ICON_OPACITY_EXPR
  };

  const pointLayerLayout = {
    'icon-size': ICON_SIZE_BY_ZOOM,
    'icon-allow-overlap': true,
    'icon-ignore-placement': true
  };

  const statusBadgeLayout = {
    'icon-image': buildStatusBadgeIconMatch(),
    'icon-size': STATUS_BADGE_SIZE_EXPR,
    'icon-anchor': 'top',
    'icon-offset': ['literal', [0, 0]],
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'icon-padding': 4
  };

  const statusBadgePaint = {
    'icon-opacity': STATUS_BADGE_OPACITY_EXPR,
    'icon-translate': STATUS_BADGE_TRANSLATE_EXPR,
    'icon-translate-anchor': 'viewport'
  };

  const statusBadgeFilterBase = [
    'in',
    STATUS_GET_EXPR,
    ['literal', ['operational', 'under_construction', 'planned', 'decommissioned']]
  ];

  // Card sotto i pin (prima delle icone, così il pin resta sopra)
  ctx.map.addLayer({
    id: 'data-centers-status-badges',
    type: 'symbol',
    source: 'data-centers',
    filter: statusBadgeFilterBase,
    layout: statusBadgeLayout,
    paint: statusBadgePaint
  });

  ctx.map.addLayer({
    id: 'raw-materials-status-badges',
    type: 'symbol',
    source: 'raw-materials',
    filter: statusBadgeFilterBase,
    layout: statusBadgeLayout,
    paint: statusBadgePaint
  });

  ctx.map.addLayer({
    id: 'energy-plants-status-badges',
    type: 'symbol',
    source: 'energy-plants',
    filter: statusBadgeFilterBase,
    layout: statusBadgeLayout,
    paint: statusBadgePaint
  });

  ctx.map.addLayer({
    id: 'grid-nodes-status-badges',
    type: 'symbol',
    source: 'grid-nodes',
    filter: statusBadgeFilterBase,
    layout: statusBadgeLayout,
    paint: statusBadgePaint
  });

  // Point layers — silhouette per sottotipo + variante di stato
  ctx.map.addLayer({
    id: 'data-centers-layer',
    type: 'symbol',
    source: 'data-centers',
    layout: {
      ...pointLayerLayout,
      'icon-image': buildStatusAwareIconExpression(
        FILTER_GROUPS.data_centers.subtypes,
        'hyperscale'
      )
    },
    paint: pointLayerPaint
  });

  ctx.map.addLayer({
    id: 'raw-materials-layer',
    type: 'symbol',
    source: 'raw-materials',
    layout: {
      ...pointLayerLayout,
      'icon-image': buildStatusAwareIconExpression(
        FILTER_GROUPS.raw_materials.subtypes,
        'lithium_mine'
      )
    },
    paint: pointLayerPaint
  });

  ctx.map.addLayer({
    id: 'energy-plants-layer',
    type: 'symbol',
    source: 'energy-plants',
    layout: {
      ...pointLayerLayout,
      'icon-image': buildStatusAwareIconExpression(
        FILTER_GROUPS.energy_plants.subtypes,
        'gas'
      )
    },
    paint: pointLayerPaint
  });

  ctx.map.addLayer({
    id: 'grid-nodes-layer',
    type: 'symbol',
    source: 'grid-nodes',
    layout: {
      ...pointLayerLayout,
      'icon-image': buildStatusAwareIconExpression(
        FILTER_GROUPS.grid_nodes.subtypes,
        'substation'
      )
    },
    paint: pointLayerPaint
  });

  await attachProximityLayers(ctx);
  attachNoiseLayers(ctx);
}
