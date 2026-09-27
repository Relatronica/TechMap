/** Shared map paint/layout constants. */

export const COLORS = {
  dc: '#5A9BB8',
  rm: '#B87A4A',
  ep: '#5B8FA8'
} as const;

/** Card stato: compaiono solo da vicino. */
export const STATUS_BADGE_OPACITY_EXPR = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10.2,
  0,
  11.2,
  0.95,
  13,
  1
];

export const STATUS_BADGE_SIZE_EXPR = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  0.88,
  12,
  1,
  15,
  1.08
];

export const STATUS_BADGE_TRANSLATE_EXPR = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  ['literal', [0, 18]],
  12,
  ['literal', [0, 24]],
  15,
  ['literal', [0, 32]]
];

export const STATUS_BADGE_LAYERS = [
  'data-centers-status-badges',
  'raw-materials-status-badges',
  'energy-plants-status-badges'
];

export const POINT_LAYERS = [
  'data-centers-layer',
  'raw-materials-layer',
  'energy-plants-layer'
];
