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
  // Design fabless — chip + freccia schema
  chip_design:
    'M7.5 8.5h9v7h-9zM10.5 10.5h3v3h-3zM9.5 5.5v3M12 5.5v3M14.5 5.5v3M9.5 15.5v3M12 15.5v3M14.5 15.5v3M4.5 10.5h3M4.5 12h3M4.5 13.5h3M16.5 10.5h3M16.5 12h3M16.5 13.5h3',
  // ODM / rack assembly — chassis
  server_assembly:
    'M5 5.5h14v13H5zM8 8.5h8v2H8zM8 12h8v2H8zM8 15.5h5v2H8zM15 8.5h1.5v2H15zM15 12h1.5v2H15z',
  // Battery materials / refining
  battery_materials:
    'M9 4.5h6v2H9zM7.5 6.5h9v13h-9zM10 10h4M10 13.5h4M10 17h4',
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
  chip_design: '#3D7A7A',
  server_assembly: '#5A7080',
  battery_materials: '#8A6B4A',
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
      'chip_design',
      'server_assembly',
      'battery_materials',
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

/** Ciclo di vita del sito — filtro proliferazione (pipeline vs operativi). */
export const SITE_STATUSES = [
  'operational',
  'under_construction',
  'planned',
  'decommissioned',
  'unknown'
] as const;

export type SiteStatusKey = (typeof SITE_STATUSES)[number];

/** Colori UI filtri / legenda status (non sostituiscono i colori per sottotipo). */
export const STATUS_COLORS: Record<SiteStatusKey, string> = {
  operational: '#2F6F9A',
  under_construction: '#D4892A',
  planned: '#4A7FA0',
  decommissioned: '#6A6560',
  unknown: '#9AA0A6'
};

/** Opacità relativa per status — leggera: lo stile icona porta il significato. */
export const STATUS_OPACITY_EXPR = [
  'match',
  ['coalesce', ['get', 'status'], 'unknown'],
  'planned',
  0.92,
  'under_construction',
  1,
  'decommissioned',
  0.7,
  'unknown',
  0.9,
  1
];

/** Opacità icona = confidence × status. */
export const SITE_ICON_OPACITY_EXPR = ['*', ICON_OPACITY_EXPR, STATUS_OPACITY_EXPR];

/** Expression: status del feature (null → unknown). */
export const STATUS_GET_EXPR = ['coalesce', ['get', 'status'], 'unknown'];

export const ICON_CANVAS_SIZE = 128;
/** Immagine 2× per retina: a icon-size 1 ≈ 64 CSS px. */
export const ICON_PIXEL_RATIO = 2;

/** Varianti canvas per ciclo di vita (mappa). */
export const ICON_STATUS_STYLES = ['solid', 'construction', 'planned', 'retired'] as const;
export type IconStatusStyle = (typeof ICON_STATUS_STYLES)[number];

export function iconStyleForStatus(status: string | null | undefined): IconStatusStyle {
  switch (status) {
    case 'under_construction':
      return 'construction';
    case 'planned':
      return 'planned';
    case 'decommissioned':
      return 'retired';
    default:
      return 'solid';
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/**
 * Canvas RGBA image for map.addImage — silhouette atlante.
 * style: solid (operativo) | construction | planned (fantasma) | retired
 */
export function createMapIconImage(pathD, color, size = ICON_CANVAS_SIZE, style: IconStatusStyle = 'solid') {
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

  if (style === 'solid') {
    ctx.shadowColor = 'rgba(15, 18, 22, 0.45)';
    ctx.shadowBlur = 2.2;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.fill(path);
    ctx.stroke(path);
  } else if (style === 'construction') {
    // Ambra evidente: si legge subito contro i pieni blu operativi
    const warm = mixHex(color, STATUS_COLORS.under_construction, 0.78);
    ctx.shadowColor = 'rgba(140, 80, 20, 0.35)';
    ctx.shadowBlur = 2.8;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = mixHex(warm, '#F2C078', 0.18);
    ctx.globalAlpha = 0.78;
    ctx.fill(path);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = STATUS_COLORS.under_construction;
    ctx.lineWidth = 2.55;
    ctx.stroke(path);
  } else if (style === 'planned') {
    // Forma intatta (tratto pieno soft) + tratteggio fine sopra
    const ink = mixHex(color, STATUS_COLORS.planned, 0.35);
    ctx.shadowColor = 'rgba(15, 18, 22, 0.16)';
    ctx.shadowBlur = 1.1;
    ctx.shadowOffsetY = 0.35;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.55;
    ctx.globalAlpha = 0.34;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.7;
    // Tratteggio fine; a canvas 128× resta leggibile senza spezzare la sagoma
    ctx.setLineDash([0.85, 1.2]);
    ctx.stroke(path);
    ctx.setLineDash([]);
  } else {
    // retired
    const muted = mixHex(color, '#7a7e82', 0.72);
    ctx.shadowColor = 'rgba(15, 18, 22, 0.12)';
    ctx.shadowBlur = 1;
    ctx.strokeStyle = muted;
    ctx.lineWidth = 1.85;
    ctx.globalAlpha = 0.85;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  return {
    width: size,
    height: size,
    data: ctx.getImageData(0, 0, size, size).data
  };
}

export function iconImageId(subtype, style: IconStatusStyle = 'solid') {
  return style === 'solid' ? `icon-${subtype}` : `icon-${subtype}--${style}`;
}

export function statusBadgeImageId(status: string) {
  return `status-badge-${status}`;
}

/** Avanzamento ciclo di vita (0–1) per la barra nella card stato. */
export function statusProgress(status: string): number {
  switch (status) {
    case 'planned':
      return 0.28;
    case 'under_construction':
      return 0.62;
    case 'operational':
      return 1;
    case 'decommissioned':
      return 0;
    default:
      return 0;
  }
}

/**
 * Mini-card stato: pallino stato + etichetta + barra avanzamento.
 */
export function createStatusBadgeImage(
  status: string,
  label: string,
  accent: string,
  _pixelRatio = ICON_PIXEL_RATIO
) {
  const w = 240;
  const h = 88;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
  }

  const pad = 12;
  const radius = 12;
  const boxX = pad;
  const boxY = pad - 2;
  const boxW = w - pad * 2;
  const boxH = h - pad * 2;
  const dotR = 5;
  const dotX = boxX + 18;
  const textX = boxX + 32;

  const shadowLayers = [
    { dy: 3, blur: 2, alpha: 0.06 },
    { dy: 6, blur: 8, alpha: 0.1 },
    { dy: 10, blur: 16, alpha: 0.08 }
  ];
  shadowLayers.forEach(({ dy, blur, alpha }) => {
    ctx.save();
    ctx.shadowColor = `rgba(15, 18, 22, ${alpha})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = dy;
    ctx.fillStyle = 'rgba(252, 250, 246, 1)';
    roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.fill();
    ctx.restore();
  });

  ctx.fillStyle = 'rgba(252, 250, 246, 0.98)';
  ctx.strokeStyle = 'rgba(60, 64, 70, 0.12)';
  ctx.lineWidth = 1.25;
  roundRect(ctx, boxX, boxY, boxW, boxH, radius);
  ctx.fill();
  ctx.stroke();

  // Pallino stato (come chip sidebar)
  ctx.beginPath();
  ctx.arc(dotX, boxY + 26, dotR, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.fillStyle = mixHex(accent, '#2a3038', 0.22);
  ctx.font = `600 17px "Montserrat", "Helvetica Neue", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, textX, boxY + 26);

  const trackX = textX;
  const trackY = boxY + boxH - 22;
  const trackW = boxX + boxW - 16 - textX;
  const trackH = 6;
  const progress = statusProgress(status);

  ctx.fillStyle = 'rgba(60, 64, 70, 0.12)';
  roundRect(ctx, trackX, trackY, trackW, trackH, 3);
  ctx.fill();

  if (progress > 0.01) {
    ctx.fillStyle = accent;
    roundRect(ctx, trackX, trackY, Math.max(trackH, trackW * progress), trackH, 3);
    ctx.fill();
  } else if (status === 'decommissioned') {
    ctx.strokeStyle = mixHex(accent, '#8a8680', 0.2);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(trackX + 2, trackY + trackH / 2);
    ctx.lineTo(trackX + trackW - 2, trackY + trackH / 2);
    ctx.stroke();
  }

  return {
    width: w,
    height: h,
    data: ctx.getImageData(0, 0, w, h).data
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | { tl: number; tr: number; br: number; bl: number }
) {
  const radii =
    typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r;
  ctx.beginPath();
  ctx.moveTo(x + radii.tl, y);
  ctx.lineTo(x + w - radii.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii.tr);
  ctx.lineTo(x + w, y + h - radii.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii.br, y + h);
  ctx.lineTo(x + radii.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii.bl);
  ctx.lineTo(x, y + radii.tl);
  ctx.quadraticCurveTo(x, y, x + radii.tl, y);
  ctx.closePath();
}

/** MapLibre match expression: subtype → icon image id (uno stile). */
export function buildIconImageExpression(subtypes, fallback, style: IconStatusStyle = 'solid') {
  const expr = ['match', ['get', 'subtype']];
  subtypes.forEach((s) => {
    expr.push(s, iconImageId(s, style));
  });
  expr.push(typeof fallback === 'string' && fallback.startsWith('icon-')
    ? fallback
    : iconImageId(fallback, style));
  return expr;
}

/**
 * Match status → variante silhouette, poi subtype.
 * Usato soprattutto sui data center (proliferazione).
 */
export function buildStatusAwareIconExpression(subtypes, fallbackSubtype) {
  return [
    'match',
    STATUS_GET_EXPR,
    'under_construction',
    buildIconImageExpression(subtypes, fallbackSubtype, 'construction'),
    'planned',
    buildIconImageExpression(subtypes, fallbackSubtype, 'planned'),
    'decommissioned',
    buildIconImageExpression(subtypes, fallbackSubtype, 'retired'),
    buildIconImageExpression(subtypes, fallbackSubtype, 'solid')
  ];
}

/**
 * Scala schermo vs zoom: le icone crescono avvicinandosi
 * (prima restavano fisse e “sparivano” nel territorio).
 */
export const ICON_SIZE_BY_ZOOM = [
  'interpolate',
  ['linear'],
  ['zoom'],
  3,
  0.64,
  6,
  0.8,
  9,
  0.98,
  12,
  1.2,
  15,
  1.4
];

export const ICON_SIZE_HIGHLIGHT_BY_ZOOM = ['*', ICON_SIZE_BY_ZOOM, 1.28];
export const ICON_SIZE_RELATED_BY_ZOOM = ['*', ICON_SIZE_BY_ZOOM, 1.1];
export const ICON_SIZE_DIMMED_BY_ZOOM = ['*', ICON_SIZE_BY_ZOOM, 0.72];

/** Valori numerici di fallback (hero / mid-zoom ≈ z6–7). */
export const ICON_SIZE = 0.8;
export const ICON_SIZE_HIGHLIGHT = 1.02;
export const ICON_SIZE_RELATED = 0.88;
export const ICON_SIZE_DIMMED = 0.58;

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
