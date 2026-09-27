import type { Map as MaplibreMap } from 'maplibre-gl';
import type { MapI18n } from './i18n';

export type GeoJSONCollection = {
  type: string;
  features: any[];
};

export type MapContext = {
  map: MaplibreMap;
  i18n: MapI18n;
  COLORS: { dc: string; rm: string; ep: string };
  connectionsData: GeoJSONCollection | null;
  dataCentersData: GeoJSONCollection | null;
  rawMaterialsData: GeoJSONCollection | null;
  energyPlantsData: GeoJSONCollection | null;
  tooltip: HTMLElement;
  detailSidebar: HTMLElement;
  detailTitle: HTMLElement;
  detailType: HTMLElement;
  detailBody: HTMLElement;
  // bound by attach* modules
  resetHighlights: () => void;
  closeDetailSidebar: () => void;
  openPointDetail: (properties: any, featureType: string, options?: any) => void;
  openConnectionDetail: (properties: any, options?: any) => void;
  showSitePreview: (e: any, properties: any, featureType: string) => void;
  showConnectionPreview: (e: any, mapProps: any) => void;
  hideTooltip: () => void;
  positionTooltip: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  applyFilters: () => void;
  getCountryName: (code: string) => string;
  getSubtypeLabel: (subtype: string) => string;
  getRelationshipLabel: (type: string) => string;
  findConnections: (featureId: string) => any;
  highlightConnections: (featureId: string) => void;
  findSiteById: (siteId: string) => any;
  collectRelatedCoordinates: (featureId: string) => any[];
  frameSelection: (featureId: string) => void;
  resolveSiteProperties: (mapProps: any, featureType: string) => any;
  resolveConnectionProperties: (mapProps: any) => any;
  highlightConnectionEdge: (props: any) => void;
  frameConnection: (props: any) => void;
};
