import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Pt = { type: 'Feature'; geometry: { type: string; coordinates: number[] }; properties: Record<string, unknown> };
type Ln = {
  type: 'Feature';
  geometry: { type: string; coordinates: number[][] };
  properties: Record<string, unknown>;
};
type FC<T> = { features: T[] };

const W = 1200;
const H = 800;
/** Europe-ish frame for the hero atlas */
const BBOX = { minLon: -12, maxLon: 36, minLat: 34, maxLat: 62 };

const COLORS = {
  dc: '#6EB0C9',
  rm: '#C98A58',
  ep: '#6FA3B8',
  conn: '#A8B0B8'
} as const;

function load<T>(name: string): FC<T> {
  return JSON.parse(readFileSync(join(process.cwd(), 'public/data', name), 'utf8')) as FC<T>;
}

function inBbox(lon: number, lat: number) {
  return lon >= BBOX.minLon && lon <= BBOX.maxLon && lat >= BBOX.minLat && lat <= BBOX.maxLat;
}

/** Web-mercator-ish Y, linear X — enough for a decorative Europe frame */
function project(lon: number, lat: number): [number, number] {
  const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * W;
  const merc = (φ: number) => Math.log(Math.tan(Math.PI / 4 + (φ * Math.PI) / 360));
  const yMin = merc(BBOX.minLat);
  const yMax = merc(BBOX.maxLat);
  const y = ((yMax - merc(lat)) / (yMax - yMin)) * H;
  return [x, y];
}

function sample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const out: T[] = [];
  const step = items.length / max;
  for (let i = 0; i < max; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

export type HeroAtlas = {
  width: number;
  height: number;
  colors: typeof COLORS;
  points: { x: number; y: number; kind: 'dc' | 'ep' | 'rm' }[];
  lines: { x1: number; y1: number; x2: number; y2: number }[];
};

/** Lightweight decorative atlas for the homepage hero (build-time). */
export function getHeroAtlas(): HeroAtlas {
  const dc = load<Pt>('data_centers.geojson');
  const ep = load<Pt>('energy_plants.geojson');
  const rm = load<Pt>('raw_materials.geojson');
  const conn = load<Ln>('connections.geojson');

  const byId = new Map<string, [number, number]>();

  const collect = (features: Pt[], kind: 'dc' | 'ep' | 'rm', max: number) => {
    const candidates: { id: string; x: number; y: number; kind: 'dc' | 'ep' | 'rm' }[] = [];
    for (const f of features) {
      if (f.geometry?.type !== 'Point') continue;
      const [lon, lat] = f.geometry.coordinates;
      if (!inBbox(lon, lat)) continue;
      const [x, y] = project(lon, lat);
      candidates.push({ id: String(f.properties.id || ''), x, y, kind });
    }
    const picked = sample(candidates, max);
    for (const p of picked) {
      if (p.id) byId.set(p.id, [p.x, p.y]);
    }
    return picked.map(({ x, y, kind: k }) => ({ x, y, kind: k }));
  };

  const points = [
    ...collect(dc.features, 'dc', 180),
    ...collect(ep.features, 'ep', 120),
    ...collect(rm.features, 'rm', 80)
  ];

  const lines: HeroAtlas['lines'] = [];
  for (const f of conn.features) {
    const sid = String(f.properties.source_id || '');
    const tid = String(f.properties.target_id || '');
    const a = byId.get(sid);
    const b = byId.get(tid);
    if (!a || !b) continue;
    lines.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
  }

  return {
    width: W,
    height: H,
    colors: COLORS,
    points,
    lines: sample(lines, 90)
  };
}
