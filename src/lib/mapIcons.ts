/**
 * Icone TechMap — path SVG stroke (viewBox 0 0 24 24), tratto unico.
 * Usate in mappa (canvas → MapLibre) e in UI (SVG inline).
 */
export const ICON_PATHS = {
  hyperscale:
    'M4 20V9.5L12 4l8 5.5V20M9 20v-5h6v5M9.5 11h.01M12 11h.01M14.5 11h.01',
  colocation:
    'M5 4.5h14v4.5H5zM5 10h14v4H5zM5 15.5h14V20H5zM7.5 6.75h.01M7.5 12h.01M7.5 17.75h.01',
  enterprise:
    'M5 20V8l7-4 7 4v12M9.5 20v-4.5h5V20M10 10.5h.01M14 10.5h.01M12 10.5h.01',

  gas: 'M12 21c3.5 0 5.5-2.2 5.5-5.2 0-3.6-3.5-6.3-5.5-10.8-2 4.5-5.5 7.2-5.5 10.8C6.5 18.8 8.5 21 12 21z',
  solar:
    'M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M6.4 17.6l1.4-1.4M16.2 7.8l1.4-1.4M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  wind:
    'M12 21.5V12M12 12c2.2-3.2 5.2-4.2 8-3-1.2 3.2-4.2 4.4-8 3zM12 12c-2.2-3.2-5.2-4.2-8-3 1.2 3.2 4.2 4.4 8 3zM12 12c.2-3.8 1.8-7.2 4.5-9-2.8 1.2-4.3 4.8-4.5 9z',
  hydro:
    'M3.5 8c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0M3.5 12.5c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0M3.5 17c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0',
  nuclear:
    'M12 12m-1.8 0a1.8 1.8 0 103.6 0 1.8 1.8 0 10-3.6 0M12 4.8v2.2M12 17v2.2M6.2 8.2l1.8 1.1M16 14.7l1.8 1.1M6.2 15.8l1.8-1.1M16 9.3l1.8-1.1',

  semiconductor_fab:
    'M8 8h8v8H8zM10.5 10.5h3v3h-3zM9.5 4.5v3M14.5 4.5v3M9.5 16.5v3M14.5 16.5v3M4.5 9.5h3M4.5 14.5h3M16.5 9.5h3M16.5 14.5h3',
  component_manufacturing:
    'M12 3.5l2.2 2.2L12 7.9 9.8 5.7 12 3.5zM12 16.1l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zM3.5 12l2.2-2.2L7.9 12l-2.2 2.2L3.5 12zM16.1 12l2.2-2.2 2.2 2.2-2.2 2.2-2.2-2.2zM12 8.2v7.6M8.2 12h7.6',
  lithium_mine:
    'M13.5 3.5L11 9h3.2L9.5 20.5M5.5 20.5h13M8 20.5l1.8-5.5M16.5 20.5l-1.2-3.8',
  cobalt_mine:
    'M12 3v3.5M9.5 6.5h5l1.2 3.2H8.3L9.5 6.5zM7.5 9.7L5.5 20.5h13L16.5 9.7M12 13v5',
  rare_earth_mine:
    'M3.5 18.5l4.2-8.2 2.8 4.2 2.6-6.5 7.4 10.5H3.5zM12 5.5l1.3-2.5 1.3 2.5'
};

export const FILTER_GROUPS = {
  data_centers: {
    id: 'data_centers',
    layerId: 'data-centers-layer',
    colorVar: 'dc',
    color: '#1a5f82',
    subtypes: ['hyperscale', 'colocation', 'enterprise']
  },
  energy_plants: {
    id: 'energy_plants',
    layerId: 'energy-plants-layer',
    colorVar: 'ep',
    color: '#1f6b55',
    subtypes: ['gas', 'solar', 'wind', 'hydro', 'nuclear']
  },
  raw_materials: {
    id: 'raw_materials',
    layerId: 'raw-materials-layer',
    colorVar: 'rm',
    color: '#b04a2c',
    subtypes: [
      'semiconductor_fab',
      'component_manufacturing',
      'lithium_mine',
      'cobalt_mine',
      'rare_earth_mine'
    ]
  }
};

export const CONNECTION_TYPES = ['powers', 'supplies', 'manufactures_for'];

/** Canvas RGBA image for map.addImage */
export function createMapIconImage(pathD, color, size = 72) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.stroke();

  const scale = (size * 0.4) / 24;
  ctx.save();
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);
  const path = new Path2D(pathD);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.85;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();

  return {
    width: size,
    height: size,
    data: ctx.getImageData(0, 0, size, size).data
  };
}

export function iconImageId(subtype) {
  return `icon-${subtype}`;
}

/** MapLibre match expression: subtype → icon image id */
export function buildIconImageExpression(subtypes, fallback) {
  const expr = ['match', ['get', 'subtype']];
  subtypes.forEach((s) => {
    expr.push(s, iconImageId(s));
  });
  expr.push(fallback);
  return expr;
}
