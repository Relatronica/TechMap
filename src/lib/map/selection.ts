import {
  ICON_SIZE_BY_ZOOM,
  ICON_SIZE_HIGHLIGHT_BY_ZOOM,
  ICON_SIZE_RELATED_BY_ZOOM,
  ICON_SIZE_DIMMED_BY_ZOOM,
  SITE_ICON_OPACITY_EXPR
} from '../mapIcons';
import { LngLatBounds } from 'maplibre-gl';
import {
  POINT_LAYERS,
  STATUS_BADGE_LAYERS,
  STATUS_BADGE_OPACITY_EXPR
} from './constants';
import type { MapContext } from './types';

export function attachSelection(ctx: MapContext) {
  function resetHighlights() {
    ['connections-powers', 'connections-supplies', 'connections-manufactures'].forEach(layerId => {
      if (ctx.map.getLayer(layerId)) {
        ctx.map.setPaintProperty(layerId, 'line-opacity', 0.7);
        ctx.map.setPaintProperty(layerId, 'line-width', 1.6);
      }
    });
    POINT_LAYERS.forEach(layerId => {
      if (ctx.map.getLayer(layerId)) {
        ctx.map.setLayoutProperty(layerId, 'icon-size', ICON_SIZE_BY_ZOOM);
        ctx.map.setPaintProperty(layerId, 'icon-opacity', SITE_ICON_OPACITY_EXPR);
      }
    });
    STATUS_BADGE_LAYERS.forEach(layerId => {
      if (ctx.map.getLayer(layerId)) {
        ctx.map.setPaintProperty(layerId, 'icon-opacity', STATUS_BADGE_OPACITY_EXPR);
      }
    });
  }
  
  // Helper: get country name
  function getCountryName(code) {
    return ctx.i18n.countries[code] || code;
  }
  
  // Helper: get subtype label
  function getSubtypeLabel(subtype) {
    return ctx.i18n.subtypes[subtype] || subtype;
  }
  
  // Helper: get relationship label
  function getRelationshipLabel(type) {
    return ctx.i18n.relationships[type] || type;
  }
  
  // Helper: find connections for a feature
  function findConnections(featureId) {
    if (!ctx.connectionsData) return { incoming: [], outgoing: [] };
    const incoming = ctx.connectionsData.features.filter(f => f.properties.target_id === featureId);
    const outgoing = ctx.connectionsData.features.filter(f => f.properties.source_id === featureId);
    return { incoming, outgoing };
  }
  
  // Helper: highlight connections for a feature (direct edges only)
  function highlightConnections(featureId) {
    if (!ctx.connectionsData) return;
  
    const relatedIds = new Set([featureId]);
    ctx.connectionsData.features.forEach(conn => {
      const props = conn.properties;
      if (props.source_id === featureId || props.target_id === featureId) {
        relatedIds.add(props.source_id);
        relatedIds.add(props.target_id);
      }
    });
    const relatedList = Array.from(relatedIds);
    const isDirectEdge = [
      'any',
      ['==', ['get', 'source_id'], featureId],
      ['==', ['get', 'target_id'], featureId]
    ];
  
    ['connections-powers', 'connections-supplies', 'connections-manufactures'].forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setPaintProperty(layerId, 'line-opacity', ['case', isDirectEdge, 0.95, 0.1]);
      ctx.map.setPaintProperty(layerId, 'line-width', ['case', isDirectEdge, 3.4, 0.9]);
    });
  
    POINT_LAYERS.forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setLayoutProperty(layerId, 'icon-size', [
        'case',
        ['==', ['get', 'id'], featureId],
        ICON_SIZE_HIGHLIGHT_BY_ZOOM,
        ['in', ['get', 'id'], ['literal', relatedList]],
        ICON_SIZE_RELATED_BY_ZOOM,
        ICON_SIZE_DIMMED_BY_ZOOM
      ]);
      ctx.map.setPaintProperty(layerId, 'icon-opacity', [
        'case',
        ['==', ['get', 'id'], featureId],
        1,
        ['in', ['get', 'id'], ['literal', relatedList]],
        0.95,
        0.28
      ]);
    });
    STATUS_BADGE_LAYERS.forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setPaintProperty(layerId, 'icon-opacity', [
        'case',
        ['==', ['get', 'id'], featureId],
        1,
        ['in', ['get', 'id'], ['literal', relatedList]],
        0.9,
        0.12
      ]);
    });
  }
  
  function findSiteById(siteId) {
    const catalogs = [
      ['data_center', ctx.dataCentersData],
      ['raw_material', ctx.rawMaterialsData],
      ['energy_plant', ctx.energyPlantsData]
    ];
    for (const [featureType, collection] of catalogs) {
      if (!collection) continue;
      const match = collection.features.find(f => f.properties.id === siteId);
      if (match) {
        return { featureType, feature: match, properties: match.properties };
      }
    }
    return null;
  }
  
  function collectRelatedCoordinates(featureId) {
    const coords = [];
    const site = findSiteById(featureId);
    if (site?.feature?.geometry?.coordinates) {
      coords.push(site.feature.geometry.coordinates);
    }
    if (!ctx.connectionsData) return coords;
    ctx.connectionsData.features.forEach(conn => {
      const props = conn.properties;
      if (props.source_id !== featureId && props.target_id !== featureId) return;
      const otherId = props.source_id === featureId ? props.target_id : props.source_id;
      const other = findSiteById(otherId);
      if (other?.feature?.geometry?.coordinates) {
        coords.push(other.feature.geometry.coordinates);
      }
    });
    return coords;
  }
  
  function frameSelection(featureId) {
    const coords = collectRelatedCoordinates(featureId);
    if (coords.length === 0) return;
  
    const isNarrow = window.matchMedia('(max-width: 1023px)').matches;
    const padding = isNarrow
      ? { top: 56, bottom: Math.round(window.innerHeight * 0.4), left: 36, right: 36 }
      : { top: 72, bottom: 72, left: 72, right: 420 };
  
    if (coords.length === 1) {
      ctx.map.easeTo({
        center: coords[0],
        duration: 650,
        padding
      });
      return;
    }
  
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new LngLatBounds(coords[0], coords[0])
    );
    ctx.map.fitBounds(bounds, {
      padding,
      maxZoom: 7.5,
      duration: 750
    });
  }
  
  /** MapLibre stringifies nested props — prefer raw GeoJSON by id. */
  function resolveSiteProperties(mapProps, featureType) {
    const collections = {
      data_center: ctx.dataCentersData,
      raw_material: ctx.rawMaterialsData,
      energy_plant: ctx.energyPlantsData
    };
    const collection = collections[featureType];
    if (collection && mapProps?.id) {
      const match = collection.features.find(f => f.properties.id === mapProps.id);
      if (match) return match.properties;
    }
    return mapProps;
  }
  
  function resolveConnectionProperties(mapProps) {
    if (ctx.connectionsData && mapProps?.id) {
      const match = ctx.connectionsData.features.find(f => f.properties.id === mapProps.id);
      if (match) return match.properties;
    }
    return mapProps;
  }

  Object.assign(ctx, {
    resetHighlights,
    getCountryName,
    getSubtypeLabel,
    getRelationshipLabel,
    findConnections,
    highlightConnections,
    findSiteById,
    collectRelatedCoordinates,
    frameSelection,
    resolveSiteProperties,
    resolveConnectionProperties
  });
}
