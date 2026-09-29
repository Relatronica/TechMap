/**
 * Interactive MapLibre map for /mappa (ESM entry).
 */
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { COLORS } from './constants';
import { detectClientLocale, getMapI18n } from './i18n';
import { initPlaceSearch } from './placeSearch';
import { attachSelection } from './selection';
import { attachDetailSidebar } from './detailSidebar';
import { attachTooltips } from './tooltips';
import { setupLayers } from './layers';
import { wireInteractions } from './interactions';
import { wireFilters } from './filters';
import type { MapContext } from './types';

setWorkerUrl(maplibreWorkerUrl);

export function initMap() {
  const map = new MaplibreMap({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [11.0, 44.5],
    zoom: 5,
    minZoom: 2,
    maxZoom: 18,
    attributionControl: { compact: true }
  });

  function expandAttribution() {
    const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib');
    if (attrib) attrib.setAttribute('open', '');
  }
  map.on('load', expandAttribution);
  map.once('idle', expandAttribution);
  map.addControl(new NavigationControl({ showCompass: false }), 'bottom-left');

  initPlaceSearch(map);

  const tooltip = document.getElementById('map-tooltip');
  const detailSidebar = document.getElementById('detail-sidebar');
  const detailTitle = document.getElementById('detail-title');
  const detailType = document.getElementById('detail-type');
  const detailBody = document.getElementById('detail-body');
  if (!tooltip || !detailSidebar || !detailTitle || !detailType || !detailBody) {
    console.error('Map chrome elements missing');
    return;
  }

  const clientLocale = detectClientLocale();
  const ctx = {
    map,
    locale: clientLocale,
    i18n: getMapI18n(clientLocale),
    COLORS,
    connectionsData: null,
    dataCentersData: null,
    rawMaterialsData: null,
    energyPlantsData: null,
    gridNodesData: null,
    tooltip,
    detailSidebar,
    detailTitle,
    detailType,
    detailBody,
    resetHighlights: () => {},
    closeDetailSidebar: () => {},
    openPointDetail: () => {},
    openConnectionDetail: () => {},
    showSitePreview: () => {},
    showConnectionPreview: () => {},
    hideTooltip: () => {},
    positionTooltip: () => {},
    showTooltip: () => {},
    applyFilters: () => {},
    getCountryName: (c) => c,
    getSubtypeLabel: (s) => s,
    getRelationshipLabel: (t) => t,
    findConnections: () => ({ incoming: [], outgoing: [] }),
    highlightConnections: () => {},
    findSiteById: () => null,
    collectRelatedCoordinates: () => [],
    frameSelection: () => {},
    resolveSiteProperties: (p) => p,
    resolveConnectionProperties: (p) => p,
    highlightConnectionEdge: () => {},
    frameConnection: () => {}
  } as MapContext;

  attachSelection(ctx);
  attachDetailSidebar(ctx);
  attachTooltips(ctx);

  let booted = false;
  const bootLayers = async () => {
    if (booted) return;
    booted = true;
    try {
      await setupLayers(ctx);
      wireInteractions(ctx);
      wireFilters(ctx);
    } catch (err) {
      console.error('Map boot failed', err);
    }
  };

  map.on('load', bootLayers);
  if (map.isStyleLoaded()) void bootLayers();

}

initMap();
