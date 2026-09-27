/**
 * Build a slim GeoJSON for the homepage hero MapLibre overlay.
 * Filters to Europe bbox, strips properties, samples density.
 */
import { readFile, writeFile } from 'node:fs/promises';

const PUBLIC_DIR = new URL('../../public/data/', import.meta.url);
const BBOX = { minLon: -12, maxLon: 36, minLat: 34, maxLat: 62 };
const CAPS = { data_centers: 180, energy_plants: 120, raw_materials: 80, connections: 90 };

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, PUBLIC_DIR), 'utf8'));
}

function inBbox(lon, lat) {
  return lon >= BBOX.minLon && lon <= BBOX.maxLon && lat >= BBOX.minLat && lat <= BBOX.maxLat;
}

function sample(items, max) {
  if (items.length <= max) return items;
  const out = [];
  const step = items.length / max;
  for (let i = 0; i < max; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

function slimPoint(f, layer) {
  const [lon, lat] = f.geometry?.coordinates || [];
  if (f.geometry?.type !== 'Point' || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (!inBbox(lon, lat)) return null;
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      id: f.properties?.id ?? null,
      subtype: f.properties?.subtype ?? null,
      layer
    }
  };
}

function slimLine(f) {
  if (f.geometry?.type !== 'LineString') return null;
  const coords = f.geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const mid = coords[Math.floor(coords.length / 2)];
  if (!inBbox(mid[0], mid[1])) return null;
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: {
      id: f.properties?.id ?? null,
      layer: 'connections'
    }
  };
}

async function main() {
  const [dc, ep, rm, conn] = await Promise.all([
    readJson('data_centers.geojson'),
    readJson('energy_plants.geojson'),
    readJson('raw_materials.geojson'),
    readJson('connections.geojson')
  ]);

  const points = [
    ...sample(
      (dc.features || []).map((f) => slimPoint(f, 'data_centers')).filter(Boolean),
      CAPS.data_centers
    ),
    ...sample(
      (ep.features || []).map((f) => slimPoint(f, 'energy_plants')).filter(Boolean),
      CAPS.energy_plants
    ),
    ...sample(
      (rm.features || []).map((f) => slimPoint(f, 'raw_materials')).filter(Boolean),
      CAPS.raw_materials
    )
  ];

  const lines = sample(
    (conn.features || []).map(slimLine).filter(Boolean),
    CAPS.connections
  );

  const out = {
    type: 'FeatureCollection',
    features: [...lines, ...points]
  };

  const dest = new URL('hero.geojson', PUBLIC_DIR);
  const json = JSON.stringify(out);
  await writeFile(dest, json);
  const kb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(
    `Hero GeoJSON: ${out.features.length} features (${lines.length} lines, ${points.length} points) → ${kb} KB`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
