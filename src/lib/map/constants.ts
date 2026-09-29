/** Shared map paint/layout constants. */

export const COLORS = {
  dc: '#5A9BB8',
  rm: '#B87A4A',
  ep: '#5B8FA8',
  gn: '#4C6A78',
  labor: '#8B4A5C'
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
  'energy-plants-status-badges',
  'grid-nodes-status-badges'
];

export const POINT_LAYERS = [
  'data-centers-layer',
  'raw-materials-layer',
  'energy-plants-layer',
  'grid-nodes-layer'
];

export const CONNECTION_LAYER_IDS = [
  'connections-powers',
  'connections-supplies',
  'connections-manufactures',
  'connections-connects',
  'connections-trains'
] as const;

/** Opacity by link certainty — inferred lighter, but still readable on the basemap. */
export const CONNECTION_OPACITY_BY_CERTAINTY = [
  'match',
  ['coalesce', ['get', 'certainty'], 'likely'],
  'confirmed',
  0.92,
  'likely',
  0.68,
  'inferred',
  0.52,
  'disputed',
  0.55,
  0.65
] as const;

export const CONNECTION_WIDTH_BY_CERTAINTY = [
  'match',
  ['coalesce', ['get', 'certainty'], 'likely'],
  'confirmed',
  2.2,
  'likely',
  1.65,
  'inferred',
  1.45,
  'disputed',
  1.4,
  1.6
] as const;

/** Solid for confirmed connects; shorter dashes for inferred so they stay readable. */
export const CONNECTS_DASHARRAY_BY_CERTAINTY = [
  'match',
  ['coalesce', ['get', 'certainty'], 'likely'],
  'confirmed',
  ['literal', [1, 0]],
  'likely',
  ['literal', [2.2, 1.6]],
  'inferred',
  ['literal', [1.4, 1.6]],
  'disputed',
  ['literal', [1.5, 2]],
  ['literal', [2, 2]]
] as const;
