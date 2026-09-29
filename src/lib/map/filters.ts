import {
  FILTER_GROUPS,
  CONNECTION_TYPES,
  CONTEXT_OVERLAYS,
  SITE_STATUSES,
  STATUS_GET_EXPR,
  CORRIDOR_PRESETS
} from '../mapIcons';
import type { MapContext } from './types';
import { LngLatBounds } from 'maplibre-gl';

/** Filter chips, status filters, and context overlay toggles. */
export function wireFilters(ctx: MapContext) {
  // --- Filters ---
  const filterState = {
    data_centers: { subtypes: new Set(FILTER_GROUPS.data_centers.subtypes) },
    energy_plants: { subtypes: new Set(FILTER_GROUPS.energy_plants.subtypes) },
    grid_nodes: { subtypes: new Set(FILTER_GROUPS.grid_nodes.subtypes) },
    raw_materials: { subtypes: new Set(FILTER_GROUPS.raw_materials.subtypes) },
    connections: { types: new Set(CONNECTION_TYPES) },
    status: new Set(SITE_STATUSES)
  };

  /** When a corridor preset is on, only draw edges whose both ends are in this set. */
  let corridorSiteIds: Set<string> | null = null;

  const dataByGroup = {
    data_centers: () => ctx.dataCentersData,
    energy_plants: () => ctx.energyPlantsData,
    grid_nodes: () => ctx.gridNodesData,
    raw_materials: () => ctx.rawMaterialsData,
    connections: () => ctx.connectionsData
  };

  const connLayerByRel = {
    powers: 'connections-powers',
    supplies: 'connections-supplies',
    manufactures_for: 'connections-manufactures',
    connects: 'connections-connects',
    trains: 'connections-trains'
  };

  function featureStatus(props) {
    return props?.status || 'unknown';
  }

  function matchesStatus(props) {
    return filterState.status.has(featureStatus(props));
  }

  function siteLayerFilter(gid) {
    const subtypes = Array.from(filterState[gid].subtypes);
    const statuses = Array.from(filterState.status);
    const parts = [
      ['in', ['get', 'subtype'], ['literal', subtypes]],
      ['in', STATUS_GET_EXPR, ['literal', statuses]]
    ];
    // Corridor preset: show only documented corridor pins, not every site of those subtypes
    if (corridorSiteIds && corridorSiteIds.size > 0) {
      parts.push(['in', ['get', 'id'], ['literal', Array.from(corridorSiteIds)]]);
    }
    return ['all', ...parts];
  }

  function countVisible(groupId) {
    const data = dataByGroup[groupId]();
    if (!data) return 0;
    if (groupId === 'connections') {
      return data.features.filter((f) => {
        if (!filterState.connections.types.has(f.properties.relationship_type)) return false;
        if (!corridorSiteIds) return true;
        return (
          corridorSiteIds.has(f.properties.source_id) &&
          corridorSiteIds.has(f.properties.target_id)
        );
      }).length;
    }
    const state = filterState[groupId];
    return data.features.filter((f) => {
      if (!state.subtypes.has(f.properties.subtype) || !matchesStatus(f.properties)) return false;
      if (corridorSiteIds && corridorSiteIds.size > 0) {
        return corridorSiteIds.has(f.properties.id);
      }
      return true;
    }).length;
  }

  function countStatusVisible() {
    let n = 0;
    ['data_centers', 'energy_plants', 'grid_nodes', 'raw_materials'].forEach((gid) => {
      const data = dataByGroup[gid]();
      if (!data) return;
      const subtypes = filterState[gid].subtypes;
      n += data.features.filter(
        (f) => subtypes.has(f.properties.subtype) && matchesStatus(f.properties)
      ).length;
    });
    return n;
  }

  function syncGroupAllLabels() {
    document.querySelectorAll('.filter-group-all').forEach((btn) => {
      const gid = btn.getAttribute('data-group-all');
      const showLabel = btn.getAttribute('data-label-show') || 'Mostra';
      const hideLabel = btn.getAttribute('data-label-hide') || 'Nascondi';
      let anyOn = false;
      if (gid === 'connections') {
        anyOn = filterState.connections.types.size > 0;
      } else if (gid === 'status') {
        anyOn = filterState.status.size > 0;
      } else if (FILTER_GROUPS[gid]) {
        anyOn = filterState[gid].subtypes.size > 0;
      }
      btn.textContent = anyOn ? hideLabel : showLabel;
    });
  }

  function updateFilterCounts() {
    let total = 0;
    ['data_centers', 'energy_plants', 'grid_nodes', 'raw_materials', 'connections'].forEach((id) => {
      const n = countVisible(id);
      total += n;
      const el = document.querySelector(`[data-count-for="${id}"]`);
      if (el) el.textContent = String(n);
    });
    const statusCountEl = document.querySelector('[data-count-for="status"]');
    if (statusCountEl) statusCountEl.textContent = String(countStatusVisible());
    const summary = document.getElementById('filters-count');
    if (summary) {
      const label = summary.getAttribute('data-label') || 'Visibili';
      summary.textContent = `${label} ${total}`;
    }
    syncGroupAllLabels();
  }

  function applyFilters() {
    const statusOn = filterState.status.size > 0;
    const badgeLayerByGroup = {
      data_centers: 'data-centers-status-badges',
      energy_plants: 'energy-plants-status-badges',
      grid_nodes: 'grid-nodes-status-badges',
      raw_materials: 'raw-materials-status-badges'
    };
    Object.keys(FILTER_GROUPS).forEach((gid) => {
      const group = FILTER_GROUPS[gid];
      const state = filterState[gid];
      const visible = state.subtypes.size > 0 && statusOn;
      ctx.map.setLayoutProperty(group.layerId, 'visibility', visible ? 'visible' : 'none');
      if (visible) {
        ctx.map.setFilter(group.layerId, siteLayerFilter(gid));
      }
      const badgeId = badgeLayerByGroup[gid];
      if (badgeId && ctx.map.getLayer(badgeId)) {
        ctx.map.setLayoutProperty(badgeId, 'visibility', visible ? 'visible' : 'none');
        if (visible) {
          ctx.map.setFilter(badgeId, [
            'all',
            siteLayerFilter(gid),
            [
              'in',
              STATUS_GET_EXPR,
              [
                'literal',
                ['operational', 'under_construction', 'planned', 'decommissioned'].filter((s) =>
                  filterState.status.has(s)
                )
              ]
            ]
          ]);
        }
      }
    });

    CONNECTION_TYPES.forEach((rel) => {
      const layerId = connLayerByRel[rel];
      if (!ctx.map.getLayer(layerId)) return;
      const show = filterState.connections.types.has(rel);
      ctx.map.setLayoutProperty(layerId, 'visibility', show ? 'visible' : 'none');
      if (!show) return;
      // Corridor: hide dangling lines whose pins are filtered out
      if (corridorSiteIds && corridorSiteIds.size > 0) {
        const ids = Array.from(corridorSiteIds);
        ctx.map.setFilter(layerId, [
          'all',
          ['==', ['get', 'relationship_type'], rel],
          ['in', ['get', 'source_id'], ['literal', ids]],
          ['in', ['get', 'target_id'], ['literal', ids]]
        ]);
      } else {
        ctx.map.setFilter(layerId, ['==', ['get', 'relationship_type'], rel]);
      }
    });

    updateFilterCounts();
  }

  function syncChipUI() {
    document.querySelectorAll('.filter-chip[data-subtype]').forEach((btn) => {
      const group = btn.getAttribute('data-group');
      const subtype = btn.getAttribute('data-subtype');
      const on = filterState[group].subtypes.has(subtype);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('.filter-chip[data-rel]').forEach((btn) => {
      const rel = btn.getAttribute('data-rel');
      const on = filterState.connections.types.has(rel);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('.filter-chip[data-status]').forEach((btn) => {
      const status = btn.getAttribute('data-status');
      const on = filterState.status.has(status);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    syncGroupAllLabels();
  }

  function resetFilters() {
    Object.keys(FILTER_GROUPS).forEach((gid) => {
      filterState[gid].subtypes = new Set(FILTER_GROUPS[gid].subtypes);
    });
    filterState.connections.types = new Set(CONNECTION_TYPES);
    filterState.status = new Set(SITE_STATUSES);
    corridorSiteIds = null;
    syncChipUI();
    applyFilters();
    document.querySelectorAll('.corridor-preset').forEach((b) => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
  }

  function toggleGroupAll(gid) {
    if (gid === 'connections') {
      if (filterState.connections.types.size > 0) {
        filterState.connections.types.clear();
      } else {
        filterState.connections.types = new Set(CONNECTION_TYPES);
      }
    } else if (gid === 'status') {
      if (filterState.status.size > 0) {
        filterState.status.clear();
      } else {
        filterState.status = new Set(SITE_STATUSES);
      }
    } else if (FILTER_GROUPS[gid]) {
      if (filterState[gid].subtypes.size > 0) {
        filterState[gid].subtypes.clear();
      } else {
        filterState[gid].subtypes = new Set(FILTER_GROUPS[gid].subtypes);
      }
    } else {
      return;
    }
    corridorSiteIds = null;
    document.querySelectorAll('.corridor-preset').forEach((b) => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    syncChipUI();
    applyFilters();
  }

  document.querySelectorAll('.filter-chip[data-subtype]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group');
      const subtype = btn.getAttribute('data-subtype');
      const set = filterState[group].subtypes;
      if (set.has(subtype)) set.delete(subtype);
      else set.add(subtype);
      clearCorridorIfNeeded();
      syncChipUI();
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-chip[data-rel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rel = btn.getAttribute('data-rel');
      const set = filterState.connections.types;
      if (set.has(rel)) set.delete(rel);
      else set.add(rel);
      clearCorridorIfNeeded();
      syncChipUI();
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-chip[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      if (filterState.status.has(status)) filterState.status.delete(status);
      else filterState.status.add(status);
      clearCorridorIfNeeded();
      syncChipUI();
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-group-all').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleGroupAll(btn.getAttribute('data-group-all'));
    });
  });

  const resetBtn = document.getElementById('filters-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  function setOverlayVisibility(overlayId, on) {
    const def = CONTEXT_OVERLAYS.find((o) => o.id === overlayId);
    if (!def) return;
    def.layerIds.forEach((layerId) => {
      if (ctx.map.getLayer(layerId)) {
        ctx.map.setLayoutProperty(layerId, 'visibility', on ? 'visible' : 'none');
      }
    });
  }

  document.querySelectorAll('.filter-chip[data-overlay]').forEach((btn) => {
    const overlayId = btn.getAttribute('data-overlay');
    setOverlayVisibility(overlayId, btn.classList.contains('is-on'));
    btn.addEventListener('click', () => {
      const on = !btn.classList.contains('is-on');
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      setOverlayVisibility(overlayId, on);
    });
  });

  // Tooltip on overlay features
  ['overlay-cables-line', 'overlay-cable-landings', 'overlay-water-fill'].forEach((layerId) => {
    ctx.map.on('mouseenter', layerId, () => { ctx.map.getCanvas().style.cursor = 'pointer'; });
    ctx.map.on('mouseleave', layerId, () => { ctx.map.getCanvas().style.cursor = ''; ctx.hideTooltip(); });
    ctx.map.on('mousemove', layerId, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const p = f.properties || {};
        const text = p.name
        ? (p.bws_label
          ? `${p.region || p.name} — ${p.bws_label}`
          : p.name)
        : '';
      if (text) ctx.showTooltip(e, text);
    });
  });

  applyFilters();

  ctx.applyFilters = applyFilters;

  function allSiteFeatures() {
    return [
      ...(ctx.dataCentersData?.features || []).map((f) => ({ f, group: 'data_centers' })),
      ...(ctx.energyPlantsData?.features || []).map((f) => ({ f, group: 'energy_plants' })),
      ...(ctx.gridNodesData?.features || []).map((f) => ({ f, group: 'grid_nodes' })),
      ...(ctx.rawMaterialsData?.features || []).map((f) => ({ f, group: 'raw_materials' }))
    ];
  }

  function applyCorridorPreset(presetId: string) {
    const preset = CORRIDOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    (['data_centers', 'energy_plants', 'grid_nodes', 'raw_materials'] as const).forEach((gid) => {
      filterState[gid].subtypes = new Set(preset.subtypes[gid] || []);
    });
    filterState.connections.types = new Set(preset.connections);
    filterState.status = new Set(SITE_STATUSES);
    corridorSiteIds = new Set(preset.siteIds);
    syncChipUI();
    applyFilters();

    const wanted = corridorSiteIds;
    const coords: [number, number][] = [];
    allSiteFeatures().forEach(({ f }) => {
      if (wanted.has(f.properties?.id) && f.geometry?.coordinates) {
        coords.push(f.geometry.coordinates as [number, number]);
      }
    });
    if (coords.length && ctx.map) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new LngLatBounds(coords[0], coords[0])
      );
      ctx.map.fitBounds(bounds, { padding: 72, maxZoom: 5.5, duration: 900 });
    }

    document.querySelectorAll('.corridor-preset').forEach((btn) => {
      const on = btn.getAttribute('data-corridor') === presetId;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function clearCorridorIfNeeded() {
    if (!corridorSiteIds) return;
    corridorSiteIds = null;
    document.querySelectorAll('.corridor-preset').forEach((b) => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    applyFilters();
  }

  document.querySelectorAll('.corridor-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-corridor');
      if (!id) return;
      if (btn.classList.contains('is-on')) {
        resetFilters();
        document.querySelectorAll('.corridor-preset').forEach((b) => {
          b.classList.remove('is-on');
          b.setAttribute('aria-pressed', 'false');
        });
        return;
      }
      applyCorridorPreset(id);
    });
  });
}
