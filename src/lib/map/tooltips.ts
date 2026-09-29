import { STATUS_COLORS, SUBTYPE_COLORS } from '../mapIcons';
import { escapeHtml } from './domUtils';
import type { MapContext } from './types';

export function attachTooltips(ctx: MapContext) {
  function positionTooltip(e) {
    const pad = 12;
    const x = e.point.x;
    const y = e.point.y;
    ctx.tooltip.style.left = x + 'px';
    ctx.tooltip.style.top = y + 'px';
    // Sopra il cursore di default; sotto se troppo vicino al bordo alto
    if (y < 96) {
      ctx.tooltip.style.transform = 'translate(-50%, 16px)';
    } else {
      ctx.tooltip.style.transform = 'translate(-50%, calc(-100% - 14px))';
    }
    // Evita overflow orizzontale grezzo
    requestAnimationFrame(() => {
      const rect = ctx.tooltip.getBoundingClientRect();
      const mapEl = document.getElementById('map');
      if (!mapEl) return;
      const mapRect = mapEl.getBoundingClientRect();
      let shift = 0;
      if (rect.left < mapRect.left + pad) shift = mapRect.left + pad - rect.left;
      else if (rect.right > mapRect.right - pad) shift = mapRect.right - pad - rect.right;
      if (shift) {
        ctx.tooltip.style.left = x + shift + 'px';
      }
    });
  }

  function showTooltip(e, text) {
    ctx.tooltip.classList.remove('is-site', 'is-conn', 'is-solid-line');
    ctx.tooltip.classList.add('is-plain');
    ctx.tooltip.textContent = text;
    positionTooltip(e);
    ctx.tooltip.classList.add('visible');
  }

  function showSitePreview(e, properties, featureType) {
    const statusKey = properties.status && STATUS_COLORS[properties.status]
      ? properties.status
      : 'unknown';
    const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.unknown;
    const statusText =
      ctx.i18n.controls.status_short[statusKey] ||
      ctx.i18n.status[statusKey] ||
      statusKey;
    const accent =
      (properties.subtype && SUBTYPE_COLORS[properties.subtype]) ||
      (featureType === 'data_center' ? ctx.COLORS.dc :
        featureType === 'raw_material' ? ctx.COLORS.rm :
        featureType === 'grid_node' ? ctx.COLORS.gn : ctx.COLORS.ep);
    const typeText = properties.subtype
      ? ctx.getSubtypeLabel(properties.subtype)
      : (featureType === 'data_center' ? ctx.i18n.layers.data_centers :
          featureType === 'raw_material' ? ctx.i18n.layers.raw_materials :
          featureType === 'grid_node' ? ctx.i18n.layers.grid_nodes :
          ctx.i18n.layers.energy_plants);
    const place = [properties.city, ctx.getCountryName(properties.country)]
      .filter(Boolean)
      .join(', ');
    const metaParts = [];
    if (properties.operator) metaParts.push(properties.operator);
    if (place) metaParts.push(place);
    const meta = metaParts.join(' · ');

    ctx.tooltip.classList.remove('is-plain', 'is-conn', 'is-solid-line');
    ctx.tooltip.classList.add('is-site');
    ctx.tooltip.style.setProperty('--tooltip-accent', accent);
    ctx.tooltip.innerHTML =
      `<p class="map-tooltip-title">${escapeHtml(properties.name || '')}</p>` +
      `<div class="map-tooltip-row">` +
        `<span class="map-tooltip-type">` +
          `<span class="map-tooltip-type-dot" aria-hidden="true"></span>` +
          `${escapeHtml(typeText)}` +
        `</span>` +
        `<span class="map-tooltip-status" style="--chip-color: ${statusColor};">` +
          `<span class="status-swatch status-${statusKey}" aria-hidden="true"></span>` +
          `${escapeHtml(statusText)}` +
        `</span>` +
      `</div>` +
      (meta ? `<p class="map-tooltip-meta">${escapeHtml(meta)}</p>` : '') +
      (properties.capacity
        ? `<p class="map-tooltip-cap">${escapeHtml(properties.capacity)}</p>`
        : '');

    positionTooltip(e);
    ctx.tooltip.classList.add('visible');
  }

  function showConnectionPreview(e, mapProps) {
    const props = ctx.resolveConnectionProperties(mapProps);
    const relType = props.relationship_type || '';
    const typeColor =
      relType === 'powers' ? ctx.COLORS.ep :
      relType === 'supplies' ? ctx.COLORS.rm :
      relType === 'connects' ? ctx.COLORS.gn :
      ctx.COLORS.dc;
    const typeLabel = ctx.getRelationshipLabel(relType);
    const certaintyKey = props.certainty;
    const certaintyLabel =
      certaintyKey && ctx.i18n.certainty[certaintyKey]
        ? ctx.i18n.certainty[certaintyKey]
        : '';

    ctx.tooltip.classList.remove('is-plain');
    ctx.tooltip.classList.add('is-site', 'is-conn');
    ctx.tooltip.style.setProperty('--tooltip-accent', typeColor);
    ctx.tooltip.innerHTML =
      `<div class="map-tooltip-route">` +
        `<span class="map-tooltip-route-from">${escapeHtml(props.source_name || '')}</span>` +
        `<span class="map-tooltip-route-arrow" aria-hidden="true">→</span>` +
        `<span class="map-tooltip-route-to">${escapeHtml(props.target_name || '')}</span>` +
      `</div>` +
      `<div class="map-tooltip-row">` +
        `<span class="map-tooltip-type" style="--tooltip-accent: ${typeColor};">` +
          `<span class="map-tooltip-conn-swatch" aria-hidden="true"></span>` +
          `${escapeHtml(typeLabel)}` +
        `</span>` +
        (certaintyLabel
          ? `<span class="certainty-badge certainty-${escapeHtml(certaintyKey)}">${escapeHtml(certaintyLabel)}</span>`
          : '') +
      `</div>`;

    positionTooltip(e);
    ctx.tooltip.classList.toggle(
      'is-solid-line',
      relType === 'connects' && props.certainty === 'confirmed'
    );
    ctx.tooltip.classList.add('visible');
  }

  function hideTooltip() {
    ctx.tooltip.classList.remove('visible', 'is-solid-line');
  }

  Object.assign(ctx, {
    positionTooltip,
    showTooltip,
    showSitePreview,
    showConnectionPreview,
    hideTooltip
  });
}
