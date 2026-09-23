/**
 * Icone Substrato — path SVG stroke (viewBox 0 0 24 24), tratto unico.
 * Usate in mappa (canvas → MapLibre) e in UI (SVG inline).
 */
export const ICON_PATHS = {
  // Data center — forme ben distinte a piccola scala
  hyperscale:
    'M3 19h18M4 19V11h5v8M10 19V7h4v12M15 19v-6h5v6',
  colocation:
    'M6 3.5h12v17H6zM6 8h12M6 12.5h12M6 17h12',
  enterprise:
    'M8 20V5h8v15M11 20v-3.5h2V20M10 8h.01M14 8h.01M10 11.5h.01M14 11.5h.01M10 15h.01M14 15h.01',

  gas: 'M12 21c3.5 0 5.5-2.2 5.5-5.2 0-3.6-3.5-6.3-5.5-10.8-2 4.5-5.5 7.2-5.5 10.8C6.5 18.8 8.5 21 12 21z',
  // Pannello fotovoltaico (non sole: evita confusione col nucleare)
  solar:
    'M3.5 15.5l8.5-9 8.5 9H3.5zM5.5 15.5V19h13v-3.5M8 11.2l3.5-3.7 3.5 3.7M7 15.5l2.5-2.6M12 15.5l0-2.6M14.5 12.9l2.5 2.6',
  wind:
    'M12 21.5V12M12 12c2.2-3.2 5.2-4.2 8-3-1.2 3.2-4.2 4.4-8 3zM12 12c-2.2-3.2-5.2-4.2-8-3 1.2 3.2 4.2 4.4 8 3zM12 12c.2-3.8 1.8-7.2 4.5-9-2.8 1.2-4.3 4.8-4.5 9z',
  hydro:
    'M3.5 8c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0M3.5 12.5c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0M3.5 17c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0 3.7-1.6 5.5 0',
  // Torre di raffreddamento (silhouette tipica nucleare)
  nuclear:
    'M6.5 21h11M8 21V12c0-1.2.8-5.8 4-8.5 3.2 2.7 4 7.3 4 8.5v9M5.5 13h13',

  // Chip IC con pin vs fabbrica (assembly)
  semiconductor_fab:
    'M7.5 7.5h9v9h-9zM10 10h4v4h-4zM9.5 4.5v3M12 4.5v3M14.5 4.5v3M9.5 16.5v3M12 16.5v3M14.5 16.5v3M4.5 9.5h3M4.5 12h3M4.5 14.5h3M16.5 9.5h3M16.5 12h3M16.5 14.5h3',
  component_manufacturing:
    'M3 20h18M4 20V12l3.5-3.5L11 12l3.5-3.5L18 12v8M15.5 20v-5.5h4V20',
  lithium_mine:
    'M13.5 3.5L11 9h3.2L9.5 20.5M5.5 20.5h13M8 20.5l1.8-5.5M16.5 20.5l-1.2-3.8',
  cobalt_mine:
    'M12 3v3.5M9.5 6.5h5l1.2 3.2H8.3L9.5 6.5zM7.5 9.7L5.5 20.5h13L16.5 9.7M12 13v5',
  rare_earth_mine:
    'M3.5 18.5l4.2-8.2 2.8 4.2 2.6-6.5 7.4 10.5H3.5zM12 5.5l1.3-2.5 1.3 2.5'
} as const;

export type SubtypeKey = keyof typeof ICON_PATHS;

/** Colori semantici per sottotipo (mappa + legenda + filtri). */
export const SUBTYPE_COLORS: Record<SubtypeKey, string> = {
  // Data center — famiglia blu, intensità diversa
  hyperscale: '#2F6F9A',
  colocation: '#5A9BB8',
  enterprise: '#7A93A8',

  // Energia — significato naturale / industriale
  gas: '#6B5E55',
  solar: '#C9A45C',
  wind: '#5B8FA8',
  hydro: '#3D7A9C',
  nuclear: '#7A6B9A',

  // Materie prime — terra / metallo
  semiconductor_fab: '#4A8A8A',
  component_manufacturing: '#B87A4A',
  lithium_mine: '#8A9AA8',
  cobalt_mine: '#3F6F9E',
  rare_earth_mine: '#8B6B7A'
};

export function colorForSubtype(subtype: string, fallback = '#8a9199'): string {
  return (SUBTYPE_COLORS as Record<string, string>)[subtype] || fallback;
}

export const FILTER_GROUPS = {
  data_centers: {
    id: 'data_centers',
    layerId: 'data-centers-layer',
    colorVar: 'dc',
    color: '#5A9BB8',
    subtypes: ['hyperscale', 'colocation', 'enterprise'] as SubtypeKey[]
  },
  energy_plants: {
    id: 'energy_plants',
    layerId: 'energy-plants-layer',
    colorVar: 'ep',
    color: '#5B8FA8',
    subtypes: ['gas', 'solar', 'wind', 'hydro', 'nuclear'] as SubtypeKey[]
  },
  raw_materials: {
    id: 'raw_materials',
    layerId: 'raw-materials-layer',
    colorVar: 'rm',
    color: '#B87A4A',
    subtypes: [
      'semiconductor_fab',
      'component_manufacturing',
      'lithium_mine',
      'cobalt_mine',
      'rare_earth_mine'
    ] as SubtypeKey[]
  }
};

/** MapLibre paint: opacity by confidence (importati low restano leggibili ma distinti). */
export const ICON_OPACITY_EXPR = [
  'match',
  ['get', 'confidence'],
  'high',
  1,
  'medium',
  0.95,
  'low',
  0.72,
  0.85
];

export const ICON_SIZE = 0.54;
export const ICON_SIZE_HIGHLIGHT = 0.66;
export const ICON_SIZE_DIMMED = 0.4;

export const CONNECTION_TYPES = ['powers', 'supplies', 'manufactures_for'];

/** Overlay di contesto (off by default). */
export const CONTEXT_OVERLAYS = [
  {
    id: 'power_grid',
    labelKey: 'power_grid',
    hintKey: 'power_grid_hint',
    layerIds: ['overlay-power-lines'],
    color: '#7a5a2e',
    swatch: 'power',
    defaultOn: false
  },
  {
    id: 'water_stress',
    labelKey: 'water_stress',
    hintKey: 'water_stress_hint',
    layerIds: ['overlay-water-fill', 'overlay-water-outline'],
    color: '#c97a5a',
    swatch: 'water',
    defaultOn: false
  },
  {
    id: 'submarine_cables',
    labelKey: 'submarine_cables',
    hintKey: 'submarine_cables_hint',
    layerIds: ['overlay-cables-line', 'overlay-cable-landings'],
    color: '#3d6f8c',
    swatch: 'cable',
    defaultOn: false
  }
] as const;

/**
 * Canvas RGBA image for map.addImage — silhouette colorata senza bordo.
 * Tratto spesso + ombra soft (stile atlante, no outline bianco).
 */
export function createMapIconImage(pathD, color, size = 80) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: size, height: size, data: new Uint8ClampedArray(size * size * 4) };
  }

  const cx = size / 2;
  const cy = size / 2;
  const scale = (size * 0.64) / 24;
  const path = new Path2D(pathD);

  ctx.save();
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.shadowColor = 'rgba(15, 18, 22, 0.45)';
  ctx.shadowBlur = 2.2;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.fill(path);
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
