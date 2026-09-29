/**
 * Map-anchored label: site name + graphic scale (km rings / dB bar) below it.
 */
import type { ProximityInsight } from '../proximity';
import type { NoiseInsight } from '../noiseEstimates';
import type { MapContext } from './types';

export type SelectionLegendOptions = {
  name: string;
  lon: number;
  lat: number;
  proximity: ProximityInsight | null;
  noise: NoiseInsight | null;
};

export function attachSelectionLegend(ctx: MapContext) {
  const el = document.getElementById('selection-scale-legend');
  let anchor: { lon: number; lat: number } | null = null;
  let moveBound = false;

  function reposition() {
    if (!el || !anchor || el.hidden) return;
    const { x, y } = ctx.map.project([anchor.lon, anchor.lat]);
    el.style.transform = `translate(-50%, 0) translate(${Math.round(x)}px, ${Math.round(y + 44)}px)`;
  }

  function ensureMoveListener() {
    if (moveBound) return;
    moveBound = true;
    ctx.map.on('move', reposition);
    ctx.map.on('resize', reposition);
  }

  function hideSelectionLegend() {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '';
    el.style.transform = '';
    anchor = null;
  }

  function showSelectionLegend(options: SelectionLegendOptions) {
    if (!el) return;
    const { name, lon, lat, proximity, noise } = options;
    if ((!proximity && !noise) || !Number.isFinite(lon) || !Number.isFinite(lat)) {
      hideSelectionLegend();
      return;
    }

    const t = ctx.i18n.popup;
    const blocks: string[] = [];

    if (proximity?.ringsKm?.length) {
      const rings = [...proximity.ringsKm].sort((a, b) => a - b);
      const max = rings[rings.length - 1] || 1;
      const ringSpans = rings
        .map((km, i) => {
          const pct = Math.max(28, Math.round((km / max) * 100));
          return `<span class="scale-ring scale-ring-${i}" style="--ring-size:${pct}%" title="${km} km"></span>`;
        })
        .join('');
      const labels = rings
        .map((km) => `<span class="scale-ring-tick">${km}</span>`)
        .join('');
      blocks.push(`<div class="scale-legend-block is-distance">
        <span class="scale-legend-key">${escape(t.scale_legend_km || 'Distance')}</span>
        <div class="scale-legend-visual">
          <div class="scale-rings" aria-hidden="true">${ringSpans}</div>
          <div class="scale-ring-caption">
            <div class="scale-ring-ticks">${labels}</div>
            <span class="scale-legend-unit">km</span>
          </div>
        </div>
      </div>`);
    }

    if (noise?.contours?.length) {
      const contours = [...noise.contours].sort((a, b) => b.lpDba - a.lpDba);
      const segs = contours
        .map(
          (c) =>
            `<span class="scale-db-seg scale-db-${c.lpDba}" title="${c.lpDba} dB(A)">
              <span class="scale-db-num">${c.lpDba}</span>
            </span>`
        )
        .join('');
      blocks.push(`<div class="scale-legend-block is-noise">
        <span class="scale-legend-key">${escape(t.scale_legend_db || 'Noise')}</span>
        <div class="scale-legend-visual">
          <div class="scale-db-bar" aria-hidden="true">${segs}</div>
          <span class="scale-legend-unit">dB(A)</span>
        </div>
      </div>`);
    }

    el.innerHTML = `<div class="map-site-label-card">
      <div class="map-site-label-name">${escape(name)}</div>
      <div class="scale-legend-inner">${blocks.join('')}</div>
    </div>`;
    el.hidden = false;
    el.setAttribute('aria-hidden', 'false');
    anchor = { lon, lat };
    ensureMoveListener();
    reposition();
  }

  Object.assign(ctx, {
    showSelectionLegend,
    hideSelectionLegend
  });
}

function escape(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
