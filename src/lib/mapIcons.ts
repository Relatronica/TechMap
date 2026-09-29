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

  // Nodo di rete — cabina/stazione, non una centrale
  substation:
    'M12 3v4M12 17v4M3 12h4M17 12h4M8 8h8v8H8z',

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
  // HBM — stacked memory dice
  hbm_memory:
    'M8 19V8h8v11M8 11h8M8 14h8M8 17h8M10 5.5h4v2.5h-4z',
  // Advanced packaging / CoWoS — die + interposer
  advanced_packaging:
    'M5 17h14v3H5zM7 12h4v4H7zM13 12h4v4h-4zM9 7h6v4H9z',
  // Battery materials / refining
  battery_materials:
    'M9 4.5h6v2H9zM7.5 6.5h9v13h-9zM10 10h4M10 13.5h4M10 17h4',
  // Cell gigafactory — stacked pouch/prism silhouette
  battery_cell:
    'M6 5h12v14H6zM8 7.5h8v2H8zM8 11h8v2H8zM8 14.5h8v2H8z',
  lithium_mine:
    'M13.5 3.5L11 9h3.2L9.5 20.5M5.5 20.5h13M8 20.5l1.8-5.5M16.5 20.5l-1.2-3.8',
  cobalt_mine:
    'M12 3v3.5M9.5 6.5h5l1.2 3.2H8.3L9.5 6.5zM7.5 9.7L5.5 20.5h13L16.5 9.7M12 13v5',
  // Nickel — mine silhouette + Ni cue
  nickel_mine:
    'M12 3v3.5M8.5 6.5h7l1.5 4H7L8.5 6.5zM6.5 10.5L5 20.5h14L17.5 10.5M9 14h6M10.5 17h3',
  // Natural graphite — layered flake
  graphite_mine:
    'M5 18.5h14M6.5 15.5h11M8 12.5h8M9.5 9.5h5M11 6.5h2M7 18.5l2-9M17 18.5l-2-9',
  rare_earth_mine:
    'M3.5 18.5l4.2-8.2 2.8 4.2 2.6-6.5 7.4 10.5H3.5zM12 5.5l1.3-2.5 1.3 2.5',
  // Lavoro cognitivo AI — persona + schermo (labeling / moderazione)
  ai_data_work:
    'M9 6.5c0-1.4 1.1-2.5 2.5-2.5S14 5.1 14 6.5 12.9 9 11.5 9 9 7.9 9 6.5zM6.5 19v-1.5c0-2 2-3.2 5-3.2s5 1.2 5 3.2V19M15 4h5.5v5.5H15zM16 5.5h3.5M16 7.5h2.5',
  // Lab modelli / HQ AI fabless
  model_lab:
    'M5 19V9l7-5 7 5v10M9 19v-5h6v5M10 11h.01M14 11h.01'
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
  substation: '#4C6A78',

  // Materie prime — terra / metallo
  semiconductor_fab: '#4A8A8A',
  component_manufacturing: '#B87A4A',
  chip_design: '#3D7A7A',
  server_assembly: '#5A7080',
  hbm_memory: '#2F6F8A',
  advanced_packaging: '#5A7A6A',
  battery_materials: '#8A6B4A',
  battery_cell: '#6B5A3A',
  lithium_mine: '#8A9AA8',
  cobalt_mine: '#3F6F9E',
  nickel_mine: '#5A7A6E',
  graphite_mine: '#6A6A6A',
  rare_earth_mine: '#8B6B7A',
  ai_data_work: '#8B4A5C',
  model_lab: '#4A5A8A'
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
  grid_nodes: {
    id: 'grid_nodes',
    layerId: 'grid-nodes-layer',
    colorVar: 'gn',
    color: '#4C6A78',
    subtypes: ['substation'] as SubtypeKey[]
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
      'hbm_memory',
      'advanced_packaging',
      'battery_materials',
      'battery_cell',
      'lithium_mine',
      'cobalt_mine',
      'nickel_mine',
      'graphite_mine',
      'rare_earth_mine',
      'ai_data_work',
      'model_lab'
    ] as SubtypeKey[]
  }
};

/**
 * Preset di filiera: isolano tipi + archi e inquadrano i siti del corridoio.
 * Unità = corridoio documentato (non densità).
 */
export const CORRIDOR_PRESETS = [
  {
    id: 'silicon_ai',
    icon: 'semiconductor_fab' as SubtypeKey,
    siteIds: [
      'rm_005',
      'rm_007',
      'rm_025',
      'rm_030',
      'rm_026',
      'rm_027',
      'rm_018',
      'rm_028',
      'rm_020',
      'rm_029',
      'dc_012',
      'dc_013'
    ],
    subtypes: {
      raw_materials: [
        'component_manufacturing',
        'semiconductor_fab',
        'hbm_memory',
        'advanced_packaging',
        'chip_design',
        'server_assembly'
      ] as SubtypeKey[],
      data_centers: ['hyperscale'] as SubtypeKey[],
      energy_plants: [] as SubtypeKey[],
      grid_nodes: [] as SubtypeKey[]
    },
    connections: ['supplies', 'manufactures_for'] as string[]
  },
  {
    id: 'cobalt_battery',
    icon: 'cobalt_mine' as SubtypeKey,
    siteIds: [
      'rm_013',
      'rm_014',
      'rm_019',
      'rm_031',
      'rm_032',
      'rm_035',
      'rm_034',
      'rm_011',
      'rm_024',
      'rm_012',
      'rm_033',
      'rm_036',
      'rm_037',
      'rm_038'
    ],
    subtypes: {
      raw_materials: [
        'cobalt_mine',
        'nickel_mine',
        'graphite_mine',
        'battery_materials',
        'battery_cell',
        'lithium_mine'
      ] as SubtypeKey[],
      data_centers: [] as SubtypeKey[],
      energy_plants: [] as SubtypeKey[],
      grid_nodes: [] as SubtypeKey[]
    },
    connections: ['supplies'] as string[]
  },
  {
    id: 'ai_labor',
    icon: 'ai_data_work' as SubtypeKey,
    siteIds: [
      'rm_021',
      'rm_022',
      'rm_041',
      'rm_042',
      'rm_040',
      'rm_043',
      'rm_023',
      'rm_044',
      'rm_039',
      'rm_045'
    ],
    subtypes: {
      raw_materials: ['ai_data_work', 'model_lab'] as SubtypeKey[],
      data_centers: [] as SubtypeKey[],
      energy_plants: [] as SubtypeKey[],
      grid_nodes: [] as SubtypeKey[]
    },
    connections: ['trains'] as string[]
  }
] as const;

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

/** Canvas alto per anti-alias nitido; pixelRatio 3 → a icon-size 1 ≈ 64 CSS px. */
export const ICON_CANVAS_SIZE = 192;
/** 3× per display retina / HiDPI senza ingrandire il marker a schermo. */
export const ICON_PIXEL_RATIO = 3;
/** Chip stato a 2× (altezza tipica ~52 canvas → ~26 CSS). */
export const STATUS_BADGE_PIXEL_RATIO = 2;

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

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Ombra di contatto sotto la sagoma; la passata finale resta senza shadow (bordi netti). */
function paintIconDropShadow(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  lineWidth: number,
  opts: { drop?: number; dropY?: number } = {}
) {
  const drop = opts.drop ?? 0.42;
  const dropY = opts.dropY ?? 1.15;

  ctx.shadowColor = `rgba(15, 18, 22, ${drop})`;
  ctx.shadowBlur = 3.8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = dropY;
  ctx.strokeStyle = 'rgba(15, 18, 22, 0.22)';
  ctx.lineWidth = lineWidth + 0.35;
  ctx.stroke(path);

  clearShadow(ctx);
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

  // Bordo libero per alone/ombra; glyph un filo più grande per definizione a distanza
  const scale = (size * 0.68) / 24;
  const path = new Path2D(pathD);

  ctx.save();
  ctx.translate(size / 2 - 12 * scale, size / 2 - 12 * scale);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (style === 'solid') {
    const lw = 2.75;
    paintIconDropShadow(ctx, path, lw, { drop: 0.48, dropY: 1.2 });
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.fill(path);
    ctx.stroke(path);
  } else if (style === 'construction') {
    // Ambra evidente: si legge subito contro i pieni blu operativi
    const warm = mixHex(color, STATUS_COLORS.under_construction, 0.78);
    const lw = 2.65;
    paintIconDropShadow(ctx, path, lw, { drop: 0.4, dropY: 1.1 });
    ctx.fillStyle = mixHex(warm, '#F2C078', 0.18);
    ctx.globalAlpha = 0.82;
    ctx.fill(path);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = STATUS_COLORS.under_construction;
    ctx.lineWidth = lw;
    ctx.stroke(path);
  } else if (style === 'planned') {
    // Forma intatta (tratto pieno soft) + tratteggio fine sopra
    const ink = mixHex(color, STATUS_COLORS.planned, 0.35);
    const lw = 1.85;
    paintIconDropShadow(ctx, path, lw, { drop: 0.22, dropY: 0.7 });
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.65;
    ctx.globalAlpha = 0.38;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.85;
    // Tratteggio fine; a canvas 192× resta leggibile senza spezzare la sagoma
    ctx.setLineDash([0.9, 1.15]);
    ctx.stroke(path);
    ctx.setLineDash([]);
  } else {
    // retired
    const muted = mixHex(color, '#7a7e82', 0.72);
    const lw = 1.95;
    paintIconDropShadow(ctx, path, lw, { drop: 0.2, dropY: 0.65 });
    ctx.strokeStyle = muted;
    ctx.lineWidth = lw;
    ctx.globalAlpha = 0.88;
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

/** Badge stato: un'immagine per status (non per subtype). */
export function statusBadgeImageId(status: string) {
  return `status-badge-${status}`;
}

/** Match expression: status → badge image id. */
export function buildStatusBadgeIconMatch(
  statuses: readonly string[] = ['operational', 'under_construction', 'planned', 'decommissioned']
): any[] {
  const expr: any[] = ['match', STATUS_GET_EXPR];
  statuses.forEach((status) => {
    expr.push(status, statusBadgeImageId(status));
  });
  expr.push('');
  return expr;
}

/**
 * Chip stato sulla mappa — stesso linguaggio dei filter-chip:
 * superficie scura, radius stretto, pallino semantico, niente barra.
 */
export function createStatusBadgeImage(
  status: string,
  label: string,
  accent: string,
  _tintColor?: string,
  _pixelRatio = STATUS_BADGE_PIXEL_RATIO
) {
  const font = '500 22px "IBM Plex Sans Variable", "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';
  const measure = document.createElement('canvas').getContext('2d');
  let textW = label.length * 12;
  if (measure) {
    measure.font = font;
    textW = measure.measureText(label).width;
  }

  const outerPad = 10;
  const insetX = 14;
  const boxH = 52;
  const radius = 6;
  const dotR = 7;
  const gap = 10;
  const boxW = Math.ceil(insetX + dotR * 2 + gap + textW + insetX);
  const w = boxW + outerPad * 2;
  const h = boxH + outerPad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
  }

  const surface = '#161b22';
  const ink = '#eef0f3';
  // ~20% accento come .filter-chip.is-on
  const fill = mixHex(accent, surface, 0.82);
  const stroke = mixHex(accent, '#9aa3ad', 0.55);

  const boxX = outerPad;
  const boxY = outerPad;
  const midY = boxY + boxH / 2;
  const dotX = boxX + insetX + dotR;
  const textX = boxX + insetX + dotR * 2 + gap;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = fill;
  roundRect(ctx, boxX, boxY, boxW, boxH, radius);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = fill;
  roundRect(ctx, boxX, boxY, boxW, boxH, radius);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawStatusSwatch(ctx, status, accent, dotX, midY, dotR);

  ctx.fillStyle = ink;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, textX, midY + 0.5);

  return {
    width: w,
    height: h,
    data: ctx.getImageData(0, 0, w, h).data
  };
}

/** Pallino stato allineato a .status-swatch (filtri). */
function drawStatusSwatch(
  ctx: CanvasRenderingContext2D,
  status: string,
  accent: string,
  x: number,
  y: number,
  r: number
) {
  ctx.save();
  if (status === 'operational') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (status === 'under_construction') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.42;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (status === 'planned') {
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([2.2, 2.2]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (status === 'decommissioned') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([1.2, 2.4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
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

export const CONNECTION_TYPES = [
  'powers',
  'supplies',
  'manufactures_for',
  'connects',
  'trains'
];

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
