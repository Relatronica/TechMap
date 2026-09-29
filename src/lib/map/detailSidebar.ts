import { buildImpactModel } from '../impactEstimates';
import { localizedText, numberLocale } from '../localizedField';
import {
  ICON_SIZE_HIGHLIGHT_BY_ZOOM,
  ICON_SIZE_DIMMED_BY_ZOOM,
  SUBTYPE_COLORS
} from '../mapIcons';
import { POINT_LAYERS, STATUS_BADGE_LAYERS, CONNECTION_LAYER_IDS } from './constants';
import { escapeHtml, sanitizeUrl } from './domUtils';
import { clearPlaceBoundary } from './placeSearch';
import type { MapContext } from './types';

export function attachDetailSidebar(ctx: MapContext) {
  const numLocale = numberLocale(ctx.locale);

  function closeDetailSidebar() {
    ctx.detailSidebar.classList.remove('open');
    ctx.detailSidebar.classList.remove('is-pulse');
    document.body.classList.remove('detail-open');
    ctx.resetHighlights();
  }

  function formatNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    return typeof value === 'number' ? value.toLocaleString(numLocale) : String(value);
  }

  function formatCompactNumber(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString(numLocale, { maximumFractionDigits: 1 })}M`;
    if (abs >= 10_000) return `${Math.round(value).toLocaleString(numLocale)}`;
    if (abs >= 100) return Math.round(value).toLocaleString(numLocale);
    return value.toLocaleString(numLocale, { maximumFractionDigits: 2 });
  }

  const IMPACT_CARD_LABELS = {
    power: () => ctx.i18n.popup.impact_power,
    electricity: () => ctx.i18n.popup.impact_electricity,
    co2: () => ctx.i18n.popup.impact_co2,
    water: () => ctx.i18n.popup.impact_water,
    land: () => ctx.i18n.popup.impact_land,
    pue: () => ctx.i18n.popup.impact_pue
  };

  function buildImpactHtml(properties, featureType) {
    const impact = properties?.impact;
    const model = buildImpactModel({
          impact: impact || null,
          capacityLabel: properties?.capacity || null,
          country: properties?.country || null,
          siteKind: featureType,
          subtype: properties?.subtype || null
        });

    const hasCards = model && model.cards && model.cards.length > 0;
    const energyMixNote = localizedText(impact, 'energy_mix_note', ctx.locale);
    const hasNote = !!energyMixNote;
    if (!hasCards && !hasNote && !impact) return '';

    let html = `<div class="detail-section detail-impact"><h4>${ctx.i18n.popup.impact}</h4>`;

    if (!hasCards && !hasNote) {
      html += `<p class="detail-empty">${ctx.i18n.popup.impact_empty}</p>`;
      html += '</div>';
      return html;
    }

    if (hasCards) {
      html += `<div class="impact-cards">`;
      model.cards.forEach((card) => {
        const label = (IMPACT_CARD_LABELS[card.id] || (() => card.id))();
        const badge =
          card.origin === 'declared'
            ? ctx.i18n.popup.impact_badge_declared
            : ctx.i18n.popup.impact_badge_estimated;
        const badgeClass = card.origin === 'declared' ? 'is-declared' : 'is-estimated';
        let equiv = '';
        if (card.equiv && card.equiv.kind === 'households') {
          equiv = `<div class="impact-card-equiv">${ctx.i18n.popup.impact_equiv_households.replace(
            '{n}',
            formatCompactNumber(card.equiv.value)
          )}</div>`;
        }
        html += `<div class="impact-card impact-card-${card.id}">
          <div class="impact-card-top">
            <span class="impact-card-label">${label}</span>
            <span class="impact-card-badge ${badgeClass}">${badge}</span>
          </div>
          <div class="impact-card-value">${formatCompactNumber(card.value)}<span class="impact-card-unit">${card.unit}</span></div>
          ${equiv}
        </div>`;
      });
      html += `</div>`;
      if (model.cards.some((c) => c.origin === 'estimated')) {
        html += `<p class="impact-disclaimer">${ctx.i18n.popup.impact_disclaimer}</p>`;
      }
    }

    if (hasNote) {
      html += `<div class="detail-field">
        <div class="detail-field-label">${escapeHtml(ctx.i18n.popup.energy_mix)}</div>
        <div class="detail-field-value">${escapeHtml(energyMixNote)}</div>
      </div>`;
    }
    html += '</div>';
    return html;
  }

  function buildSourcesHtml(sources) {
    if (!Array.isArray(sources) || sources.length === 0) return '';
    let html = `<div class="detail-section">
      <h4>${escapeHtml(ctx.i18n.popup.sources)}</h4>
      <ul class="detail-sources">`;
    sources.forEach(src => {
      const safeTitle = escapeHtml(src.title || src.url || 'Fonte');
      const safeUrl = sanitizeUrl(src.url);
      const title = safeUrl
        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>`
        : safeTitle;
      const meta = [src.accessed_at, src.note].filter(Boolean).map(escapeHtml).join(' — ');
      html += `<li>${title}${meta ? `<span class="detail-source-meta">${meta}</span>` : ''}</li>`;
    });
    html += '</ul></div>';
    return html;
  }

  function laborTagLabel(code) {
    return (ctx.i18n.labor_tags && ctx.i18n.labor_tags[code]) || code;
  }

  function buildEmploymentHtml(properties) {
    const emp = properties.employment;
    const risks = properties.labor_risks;
    const community = localizedText(properties, 'community_impact', ctx.locale);
    if (!emp && !(risks && risks.length) && !community) return '';

    let html = '';

    if (emp || (Array.isArray(risks) && risks.length)) {
      html += `<div class="detail-section detail-employment"><h4>${ctx.i18n.popup.employment}</h4>`;
      if (ctx.i18n.popup.labor_contrast) {
        html += `<p class="detail-labor-contrast">${escapeHtml(ctx.i18n.popup.labor_contrast)}</p>`;
      }
      if (emp) {
        const rows = [
          [ctx.i18n.popup.jobs_direct, formatNumber(emp.direct)],
          [ctx.i18n.popup.jobs_indirect, formatNumber(emp.indirect_est)],
          [ctx.i18n.popup.jobs_contractors, formatNumber(emp.contractors_est)]
        ].filter(([, v]) => v !== null);
        rows.forEach(([label, value]) => {
          html += `<div class="detail-field">
            <div class="detail-field-label">${label}</div>
            <div class="detail-field-value">${value}</div>
          </div>`;
        });
        const empNote = localizedText(emp, 'note', ctx.locale);
        if (empNote) {
          html += `<p class="detail-note">${escapeHtml(empNote)}</p>`;
        }
        if (Array.isArray(emp.conditions_tags) && emp.conditions_tags.length) {
          html += `<div class="detail-field">
            <div class="detail-field-label">${escapeHtml(ctx.i18n.popup.labor_conditions || 'Condizioni')}</div>
            <div class="detail-tags">${emp.conditions_tags.map(t =>
              `<span class="detail-tag">${escapeHtml(laborTagLabel(t))}</span>`
            ).join('')}</div>
          </div>`;
        }
      }
      if (Array.isArray(risks) && risks.length) {
        html += `<div class="detail-field">
          <div class="detail-field-label">${escapeHtml(ctx.i18n.popup.labor_risks)}</div>
          <div class="detail-tags">${risks.map(t =>
            `<span class="detail-tag detail-tag-risk">${escapeHtml(laborTagLabel(t))}</span>`
          ).join('')}</div>
        </div>`;
      }
      html += '</div>';
    }

    if (community) {
      html += `<div class="detail-section detail-community">
        <h4>${escapeHtml(ctx.i18n.popup.community)}</h4>
        <p class="detail-community-body">${escapeHtml(community)}</p>
      </div>`;
    }

    return html;
  }

  // Build detail sidebar HTML for a point feature
  function buildPointDetail(properties, featureType) {
    const accentColor =
      (properties.subtype && SUBTYPE_COLORS[properties.subtype]) ||
      (featureType === 'data_center' ? ctx.COLORS.dc :
        featureType === 'raw_material' ? ctx.COLORS.rm :
        featureType === 'grid_node' ? ctx.COLORS.gn : ctx.COLORS.ep);
    const shapeClass = featureType === 'data_center' ? '' :
                       featureType === 'raw_material' ? 'shape-rm' :
                       featureType === 'grid_node' ? 'shape-gn' : 'shape-ep';
    const typeLabel = featureType === 'data_center' ? ctx.i18n.layers.data_centers :
                      featureType === 'raw_material' ? ctx.i18n.layers.raw_materials :
                      featureType === 'grid_node' ? ctx.i18n.layers.grid_nodes :
                      ctx.i18n.layers.energy_plants;

    const place = [properties.city, ctx.getCountryName(properties.country)].filter(Boolean).join(', ');
    let html = '';

    if (place) {
      html += `<p class="detail-place">${escapeHtml(place)}</p>`;
    }

    const description = localizedText(properties, 'description', ctx.locale);
    if (description) {
      html += `<p class="detail-description">${escapeHtml(description)}</p>`;
    }

    const facts = [];
    if (properties.operator) facts.push({ label: ctx.i18n.popup.operator, value: properties.operator });
    if (properties.subtype) facts.push({ label: ctx.i18n.popup.type, value: ctx.getSubtypeLabel(properties.subtype) });
    if (properties.status && ctx.i18n.status[properties.status]) {
      facts.push({ label: ctx.i18n.popup.status, value: ctx.i18n.status[properties.status] });
    }
    if (properties.capacity) facts.push({ label: ctx.i18n.popup.capacity, value: properties.capacity });

    if (facts.length) {
      html += `<div class="detail-facts">`;
      facts.forEach(({ label, value }) => {
        html += `<div class="detail-fact">
          <span class="detail-fact-label">${escapeHtml(label)}</span>
          <span class="detail-fact-value">${escapeHtml(value)}</span>
        </div>`;
      });
      html += `</div>`;
    }

    // Connections — early, actionable
    const { incoming, outgoing } = ctx.findConnections(properties.id);
    const connBlocks = [];

    function pushConnGroup(label, items, iconClass, pickOtherId) {
      if (!items.length) return;
      let block = `<div class="detail-conn-group">
        <div class="detail-field-label">${label}</div>`;
      items.forEach(c => {
        const otherId = pickOtherId(c.properties);
        const other = ctx.findSiteById(otherId);
        const name = otherId === c.properties.source_id
          ? c.properties.source_name
          : c.properties.target_name;
        if (other) {
          block += `<button type="button" class="detail-connection-item is-action"
            data-site-id="${escapeHtml(otherId)}"
            title="${escapeHtml(ctx.i18n.popup.open_connected)}">
            <span class="detail-connection-icon ${iconClass}"></span>
            <span class="detail-connection-label">${escapeHtml(name || otherId)}</span>
            <span class="detail-connection-go" aria-hidden="true">→</span>
          </button>`;
        } else {
          block += `<div class="detail-connection-item">
            <span class="detail-connection-icon ${iconClass}"></span>
            <span class="detail-connection-label">${escapeHtml(name || otherId)}</span>
          </div>`;
        }
      });
      block += '</div>';
      connBlocks.push(block);
    }

    if (featureType === 'data_center') {
      pushConnGroup(
        ctx.i18n.popup.connected_to,
        incoming.filter(c => c.properties.relationship_type === 'connects'),
        'is-connect',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.powered_by,
        incoming.filter(c => c.properties.relationship_type === 'powers'),
        'is-power',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.components_from,
        incoming.filter(c => c.properties.relationship_type === 'manufactures_for'),
        'is-mfg',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.supplies_from || ctx.i18n.popup.receives_from,
        incoming.filter(c => c.properties.relationship_type === 'supplies'),
        'is-supply',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.trained_by || 'Trained by',
        incoming.filter(c => c.properties.relationship_type === 'trains'),
        'is-train',
        p => p.source_id
      );
    } else if (featureType === 'raw_material') {
      pushConnGroup(
        ctx.i18n.popup.supplies_to,
        outgoing.filter(c => c.properties.relationship_type === 'supplies'),
        'is-supply',
        p => p.target_id
      );
      pushConnGroup(
        ctx.i18n.popup.manufactures_to || ctx.i18n.popup.supplies_to,
        outgoing.filter(c => c.properties.relationship_type === 'manufactures_for'),
        'is-mfg',
        p => p.target_id
      );
      pushConnGroup(
        ctx.i18n.popup.trains_to || 'Trains',
        outgoing.filter(c => c.properties.relationship_type === 'trains'),
        'is-train',
        p => p.target_id
      );
      pushConnGroup(
        ctx.i18n.popup.trained_by || 'Trained by',
        incoming.filter(c => c.properties.relationship_type === 'trains'),
        'is-train',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.receives_from,
        incoming.filter(c => c.properties.relationship_type !== 'trains'),
        'is-supply',
        p => p.source_id
      );
    } else if (featureType === 'energy_plant') {
      pushConnGroup(
        ctx.i18n.popup.connects_to,
        outgoing.filter(c => c.properties.relationship_type === 'connects'),
        'is-connect',
        p => p.target_id
      );
      pushConnGroup(
        ctx.i18n.popup.powers_to,
        outgoing.filter(c => c.properties.relationship_type === 'powers'),
        'is-power',
        p => p.target_id
      );
    } else if (featureType === 'grid_node') {
      pushConnGroup(
        ctx.i18n.popup.connected_to,
        incoming.filter(c => c.properties.relationship_type === 'connects'),
        'is-connect',
        p => p.source_id
      );
      pushConnGroup(
        ctx.i18n.popup.connects_to,
        outgoing.filter(c => c.properties.relationship_type === 'connects'),
        'is-connect',
        p => p.target_id
      );
    }

    if (connBlocks.length) {
      html += `<div class="detail-connections">
        <h4>${ctx.i18n.popup.connections}</h4>
        <p class="detail-connections-hint">${ctx.i18n.popup.connections_hint}</p>
        ${connBlocks.join('')}
      </div>`;
    }

    html += buildImpactHtml(properties, featureType);
    html += buildEmploymentHtml(properties);
    html += buildSourcesHtml(properties.sources);

    const metaBits = [];
    if (properties.confidence && ctx.i18n.confidence[properties.confidence]) {
      metaBits.push(
        `<span class="certainty-badge certainty-${escapeHtml(properties.confidence)}">${escapeHtml(ctx.i18n.confidence[properties.confidence])}</span>`
      );
    }
    if (properties.updated_at) {
      metaBits.push(`<span>${escapeHtml(ctx.i18n.popup.updated_at)} ${escapeHtml(properties.updated_at)}</span>`);
    }
    if (metaBits.length) {
      html += `<div class="detail-meta">${metaBits.join('')}</div>`;
    }

    return { html, accentColor, shapeClass, typeLabel };
  }

  // Open detail sidebar for a point feature
  function openPointDetail(properties, featureType, options = {}) {
    const resolved = ctx.resolveSiteProperties(properties, featureType);
    const { html, accentColor, shapeClass, typeLabel } = buildPointDetail(resolved, featureType);
    ctx.detailTitle.textContent = resolved.name;
    ctx.detailSidebar.style.setProperty('--accent', accentColor);
    if (ctx.detailType) {
      ctx.detailType.hidden = false;
      ctx.detailType.innerHTML = `<i class="${shapeClass}"></i>${typeLabel}`;
    }
    ctx.detailBody.innerHTML = html;
    ctx.detailSidebar.classList.add('open');
    ctx.detailSidebar.classList.remove('is-pulse');
    void ctx.detailSidebar.offsetWidth;
    ctx.detailSidebar.classList.add('is-pulse');
    document.body.classList.add('detail-open');
    document.body.classList.remove('filters-open');
    document.body.classList.remove('search-open');
    const filtersToggle = document.getElementById('filters-toggle');
    if (filtersToggle) filtersToggle.setAttribute('aria-expanded', 'false');
    const searchToggleBtn = document.getElementById('map-search-toggle');
    if (searchToggleBtn) searchToggleBtn.setAttribute('aria-expanded', 'false');
    ctx.highlightConnections(resolved.id);
    if (options.frame !== false) ctx.frameSelection(resolved.id);
    clearPlaceBoundary(ctx.map);
    window.SubstratoMapChrome?.dismissMapHint?.();
    ctx.hideTooltip();

    ctx.detailBody.querySelectorAll('[data-site-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const siteId = btn.getAttribute('data-site-id');
        const site = ctx.findSiteById(siteId);
        if (!site) return;
        openPointDetail(site.properties, site.featureType);
      });
    });
  }

  function connAccent(relType) {
    if (relType === 'powers') return ctx.COLORS.ep;
    if (relType === 'supplies') return ctx.COLORS.rm;
    if (relType === 'connects') return ctx.COLORS.gn;
    if (relType === 'trains') return ctx.COLORS.labor;
    return ctx.COLORS.dc;
  }

  function connIconClass(relType) {
    if (relType === 'powers') return 'is-power';
    if (relType === 'supplies') return 'is-supply';
    if (relType === 'connects') return 'is-connect';
    if (relType === 'trains') return 'is-train';
    return 'is-mfg';
  }

  function highlightConnectionEdge(props) {
    const pair = [props.source_id, props.target_id];
    const isThisEdge = props.id
      ? ['==', ['get', 'id'], props.id]
      : [
          'all',
          ['==', ['get', 'source_id'], props.source_id],
          ['==', ['get', 'target_id'], props.target_id]
        ];
    CONNECTION_LAYER_IDS.forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setPaintProperty(layerId, 'line-opacity', ['case', isThisEdge, 0.95, 0.08]);
      ctx.map.setPaintProperty(layerId, 'line-width', ['case', isThisEdge, 3.6, 0.7]);
    });
    POINT_LAYERS.forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setLayoutProperty(layerId, 'icon-size', [
        'case',
        ['in', ['get', 'id'], ['literal', pair]],
        ICON_SIZE_HIGHLIGHT_BY_ZOOM,
        ICON_SIZE_DIMMED_BY_ZOOM
      ]);
      ctx.map.setPaintProperty(layerId, 'icon-opacity', [
        'case',
        ['in', ['get', 'id'], ['literal', pair]],
        1,
        0.28
      ]);
    });
    STATUS_BADGE_LAYERS.forEach(layerId => {
      if (!ctx.map.getLayer(layerId)) return;
      ctx.map.setPaintProperty(layerId, 'icon-opacity', [
        'case',
        ['in', ['get', 'id'], ['literal', pair]],
        1,
        0.12
      ]);
    });
  }

  function frameConnection(props) {
    const coords = [];
    [props.source_id, props.target_id].forEach((id) => {
      const site = ctx.findSiteById(id);
      if (site?.feature?.geometry?.coordinates) {
        coords.push(site.feature.geometry.coordinates);
      }
    });
    if (coords.length === 0) return;

    const isNarrow = window.matchMedia('(max-width: 1023px)').matches;
    const padding = isNarrow
      ? { top: 56, bottom: Math.round(window.innerHeight * 0.4), left: 36, right: 36 }
      : { top: 72, bottom: 72, left: 72, right: 420 };

    if (coords.length === 1) {
      ctx.map.easeTo({ center: coords[0], duration: 650, padding });
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

  function buildConnectionDetail(props) {
    const relType = props.relationship_type;
    const accentColor = connAccent(relType);
    const iconClass = connIconClass(relType);
    const typeLabel = ctx.i18n.layers.connections;

    let html = '';

    if (props.certainty && ctx.i18n.certainty[props.certainty]) {
      html += `<div class="detail-facts">
        <div class="detail-fact">
          <span class="detail-fact-label">${ctx.i18n.popup.certainty}</span>
          <span class="detail-fact-value">
            <span class="certainty-badge certainty-${props.certainty}">${ctx.i18n.certainty[props.certainty]}</span>
          </span>
        </div>
      </div>`;
    }

    const description = localizedText(props, 'description', ctx.locale);
    if (description) {
      html += `<p class="detail-description">${escapeHtml(description)}</p>`;
    }

    const evidence = localizedText(props, 'evidence_note', ctx.locale);
    if (evidence) {
      html += `<div class="detail-section">
        <h4>${ctx.i18n.popup.evidence}</h4>
        <p class="detail-description detail-evidence">${escapeHtml(evidence)}</p>
      </div>`;
    }

    html += `<div class="detail-section detail-conn-endpoints">
      <h4>${ctx.i18n.popup.linked_sites}</h4>
      <p class="detail-connections-hint">${ctx.i18n.popup.connections_hint}</p>
      <button type="button" class="detail-connection-item is-action"
        data-site-id="${escapeHtml(props.source_id)}"
        title="${ctx.i18n.popup.open_connected}">
        <span class="detail-connection-icon ${iconClass}"></span>
        <span class="detail-connection-label">${escapeHtml(props.source_name || props.source_id)}</span>
        <span class="detail-connection-go" aria-hidden="true">→</span>
      </button>
      <button type="button" class="detail-connection-item is-action"
        data-site-id="${escapeHtml(props.target_id)}"
        title="${ctx.i18n.popup.open_connected}">
        <span class="detail-connection-icon ${iconClass}"></span>
        <span class="detail-connection-label">${escapeHtml(props.target_name || props.target_id)}</span>
        <span class="detail-connection-go" aria-hidden="true">→</span>
      </button>
    </div>`;

    html += buildSourcesHtml(props.sources);

    if (props.updated_at) {
      html += `<div class="detail-meta">
        <span>${ctx.i18n.popup.updated_at} ${escapeHtml(props.updated_at)}</span>
      </div>`;
    }

    return {
      html,
      accentColor,
      typeLabel,
      title: ctx.getRelationshipLabel(relType)
    };
  }

  function openConnectionDetail(properties, options = {}) {
    const props = ctx.resolveConnectionProperties(properties);
    const { html, accentColor, typeLabel, title } = buildConnectionDetail(props);

    ctx.detailTitle.textContent = title;
    ctx.detailSidebar.style.setProperty('--accent', accentColor);
    if (ctx.detailType) {
      ctx.detailType.hidden = false;
      ctx.detailType.innerHTML =
        `<span class="detail-type-conn-swatch" aria-hidden="true"></span>${typeLabel}`;
    }
    ctx.detailBody.innerHTML = html;
    ctx.detailSidebar.classList.add('open');
    ctx.detailSidebar.classList.remove('is-pulse');
    void ctx.detailSidebar.offsetWidth;
    ctx.detailSidebar.classList.add('is-pulse');
    document.body.classList.add('detail-open');
    document.body.classList.remove('filters-open');
    document.body.classList.remove('search-open');
    const filtersToggle = document.getElementById('filters-toggle');
    if (filtersToggle) filtersToggle.setAttribute('aria-expanded', 'false');
    const searchToggleBtn = document.getElementById('map-search-toggle');
    if (searchToggleBtn) searchToggleBtn.setAttribute('aria-expanded', 'false');

    ctx.highlightConnectionEdge(props);
    if (options.frame !== false) ctx.frameConnection(props);
    clearPlaceBoundary(ctx.map);
    window.SubstratoMapChrome?.dismissMapHint?.();
    ctx.hideTooltip();

    ctx.detailBody.querySelectorAll('[data-site-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const siteId = btn.getAttribute('data-site-id');
        const site = ctx.findSiteById(siteId);
        if (!site) return;
        openPointDetail(site.properties, site.featureType);
      });
    });
  }

  Object.assign(ctx, {
    closeDetailSidebar,
    openPointDetail,
    openConnectionDetail,
    highlightConnectionEdge,
    frameConnection
  });

  const detailClose = document.getElementById('detail-close');
  if (detailClose) detailClose.addEventListener('click', () => ctx.closeDetailSidebar());

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('detail-open')) {
      ctx.closeDetailSidebar();
      e.preventDefault();
    }
  });
}
