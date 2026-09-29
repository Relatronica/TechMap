import type { MapContext } from './types';
import { CONNECTION_LAYER_IDS } from './constants';

/** Hover + click wiring for site pins and connections. */
export function wireInteractions(ctx: MapContext) {
  let lastSiteHoverId: string | number | null = null;
  let lastConnHoverId: string | number | null = null;

  // --- Interactivity ---

  const pointLayers = ['data-centers-layer', 'raw-materials-layer', 'energy-plants-layer', 'grid-nodes-layer'];
  const connectionLayers = [...CONNECTION_LAYER_IDS];
  const allInteractiveLayers = [...pointLayers, ...connectionLayers];
  const connLayerByRel = {
    powers: 'connections-powers',
    supplies: 'connections-supplies',
    manufactures_for: 'connections-manufactures',
    connects: 'connections-connects',
    trains: 'connections-trains'
  };

  // Cursor pointer on hover
  allInteractiveLayers.forEach(layerId => {
    ctx.map.on('mouseenter', layerId, () => {
      ctx.map.getCanvas().style.cursor = 'pointer';
    });
    ctx.map.on('mouseleave', layerId, () => {
      ctx.map.getCanvas().style.cursor = '';
      ctx.hideTooltip();
    });
  });

  // Hover preview for site pins
  const siteHoverLayers = [
    { layerId: 'data-centers-layer', featureType: 'data_center' },
    { layerId: 'raw-materials-layer', featureType: 'raw_material' },
    { layerId: 'energy-plants-layer', featureType: 'energy_plant' },
    { layerId: 'grid-nodes-layer', featureType: 'grid_node' }
  ];
  siteHoverLayers.forEach(({ layerId, featureType }) => {
    ctx.map.on('mousemove', layerId, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const fid = f.properties?.id ?? f.id;
      if (fid === lastSiteHoverId) {
        ctx.positionTooltip(e);
        return;
      }
      lastSiteHoverId = fid;
      ctx.showSitePreview(e, f.properties, featureType);
    });
    ctx.map.on('mouseleave', layerId, () => {
      ctx.hideTooltip();
    });
  });

  // Hover preview for connections
  connectionLayers.forEach(layerId => {
    ctx.map.on('mousemove', layerId, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const fid = f.properties?.id ?? f.id;
      if (fid === lastConnHoverId) {
        ctx.positionTooltip(e);
        return;
      }
      lastConnHoverId = fid;
      ctx.showConnectionPreview(e, f.properties);
    });
    ctx.map.on('mouseleave', layerId, () => {
      ctx.hideTooltip();
    });
  });

  // Click on data center points
  ctx.map.on('click', 'data-centers-layer', (e) => {
    if (e.features && e.features.length > 0) {
      const properties = e.features[0].properties;
      ctx.openPointDetail(properties, 'data_center');
      e.originalEvent.stopPropagation();
    }
  });

  // Click on raw material points
  ctx.map.on('click', 'raw-materials-layer', (e) => {
    if (e.features && e.features.length > 0) {
      const properties = e.features[0].properties;
      ctx.openPointDetail(properties, 'raw_material');
      e.originalEvent.stopPropagation();
    }
  });

  // Click on energy plant points
  ctx.map.on('click', 'energy-plants-layer', (e) => {
    if (e.features && e.features.length > 0) {
      const properties = e.features[0].properties;
      ctx.openPointDetail(properties, 'energy_plant');
      e.originalEvent.stopPropagation();
    }
  });

  ctx.map.on('click', 'grid-nodes-layer', (e) => {
    if (e.features && e.features.length > 0) {
      const properties = e.features[0].properties;
      ctx.openPointDetail(properties, 'grid_node');
      e.originalEvent.stopPropagation();
    }
  });

  // Click on connection lines
  connectionLayers.forEach(layerId => {
    ctx.map.on('click', layerId, (e) => {
      if (e.features && e.features.length > 0) {
        ctx.openConnectionDetail(e.features[0].properties);
        e.originalEvent.stopPropagation();
      }
    });
  });

  // Click on map background to close sidebar
  ctx.map.on('click', (e) => {
    // Check if click was on any interactive layer
    const features = ctx.map.queryRenderedFeatures(e.point, { layers: allInteractiveLayers });
    if (features.length === 0) {
      ctx.closeDetailSidebar();
    }
  });

  // Clear hover cache when leaving site layers
  ['data-centers-layer', 'raw-materials-layer', 'energy-plants-layer', 'grid-nodes-layer'].forEach((layerId) => {
    ctx.map.on('mouseleave', layerId, () => {
      lastSiteHoverId = null;
    });
  });
  CONNECTION_LAYER_IDS.forEach((layerId) => {
    ctx.map.on('mouseleave', layerId, () => {
      lastConnHoverId = null;
    });
  });
}
