import type { Map as MaplibreMap } from 'maplibre-gl';
import type { Locale } from '../../i18n';
import type { MapI18n } from './i18n';
import type { ProximityInsight, SettlementFeature } from '../proximity';
import type { NoiseInsight, NoiseInput } from '../noiseEstimates';

export type GeoJSONCollection = {
  type: string;
  features: any[];
};

export type MapContext = {
  map: MaplibreMap;
  locale: Locale;
  i18n: MapI18n;
  COLORS: { dc: string; rm: string; ep: string; gn: string; labor: string };
  connectionsData: GeoJSONCollection | null;
  dataCentersData: GeoJSONCollection | null;
  rawMaterialsData: GeoJSONCollection | null;
  energyPlantsData: GeoJSONCollection | null;
  gridNodesData: GeoJSONCollection | null;
  lombardiaSettlements?: SettlementFeature[];
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
  clearProximity: () => void;
  showProximityAt: (lon: number, lat: number, options?: { city?: string | null }) => ProximityInsight | null;
  frameProximity: (insight: ProximityInsight) => void;
  clearNoise: () => void;
  showNoiseAt: (
    lon: number,
    lat: number,
    options?: {
      noise?: NoiseInput | null;
      subtype?: string | null;
      capacityMw?: number | null;
      force?: boolean;
    }
  ) => NoiseInsight | null;
  frameNoise: (insight: NoiseInsight, extraCoords?: [number, number][]) => void;
  showSelectionLegend: (options: {
    name: string;
    lon: number;
    lat: number;
    proximity: ProximityInsight | null;
    noise: NoiseInsight | null;
  }) => void;
  hideSelectionLegend: () => void;
};
