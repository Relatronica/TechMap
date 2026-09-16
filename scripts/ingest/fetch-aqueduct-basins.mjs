/**
 * Fetch WRI Aqueduct 4.0 baseline water stress at HydroBASINS L6
 * (Esri Living Atlas FeatureServer) for Europe, write a light GeoJSON
 * used by build-overlays.mjs.
 *
 * Features are hydrobasin × aquifer pieces (same BWS per basin). We keep all
 * pieces so the map has no coverage holes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SOURCE_DIR = fileURLToPath(new URL('../../data/sources/', import.meta.url));
const SERVICE =
  'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/aqueduct_water_risk/FeatureServer/1';

/** EU + neighbours relevant to the map extent. */
const EU_ISO3 = [
  'ITA', 'FRA', 'DEU', 'ESP', 'NLD', 'BEL', 'AUT', 'POL', 'SWE', 'FIN', 'DNK',
  'PRT', 'GRC', 'IRL', 'CZE', 'ROU', 'HUN', 'BGR', 'SVK', 'HRV', 'SVN', 'LTU',
  'LVA', 'EST', 'LUX', 'MLT', 'CYP', 'GBR', 'CHE', 'NOR', 'ISL', 'ALB', 'SRB',
  'BIH', 'MNE', 'MKD', 'XKX', 'AND', 'LIE', 'SMR', 'VAT', 'MDA', 'UKR'
];

const PAGE = 750;
/** ~1 km generalization on the server before download. */
const MAX_OFFSET = 0.01;

function simplifyRing(ring, decimals = 2) {
  const f = 10 ** decimals;
  const out = [];
  let prev = '';
  for (const pt of ring) {
    const lon = Math.round(pt[0] * f) / f;
    const lat = Math.round(pt[1] * f) / f;
    const key = `${lon},${lat}`;
    if (key === prev) continue;
    out.push([lon, lat]);
    prev = key;
  }
  if (out.length >= 4) {
    const a = out[0];
    const b = out[out.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) out.push([a[0], a[1]]);
  }
  return out.length >= 4 ? out : null;
}

function simplifyCoords(coords, decimals = 2) {
  if (typeof coords[0][0] === 'number') return simplifyRing(coords, decimals);
  const parts = [];
  for (const c of coords) {
    const s = simplifyCoords(c, decimals);
    if (s) parts.push(s);
  }
  return parts.length ? parts : null;
}

async function queryCountryPage(iso3, offset) {
  const params = new URLSearchParams({
    where: `gid_0='${iso3}'`,
    outFields: 'pfaf_id,gid_0,name_0,name_1,bws_score,bws_cat,bws_label',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: String(PAGE),
    resultOffset: String(offset),
    maxAllowableOffset: String(MAX_OFFSET),
    orderByFields: 'OBJECTID'
  });
  const res = await fetch(`${SERVICE}/query?${params}`);
  if (!res.ok) throw new Error(`Aqueduct query failed for ${iso3}: ${res.status}`);
  return res.json();
}

function ingestFeature(f, features) {
  const p = f.properties || {};
  const cat = Number(p.bws_cat);
  if (!Number.isFinite(cat) || cat < 0) return;
  const coords = simplifyCoords(f.geometry.coordinates, 2);
  if (!coords) return;
  features.push({
    type: 'Feature',
    geometry: { type: f.geometry.type, coordinates: coords },
    properties: {
      country_iso3: p.gid_0,
      region: p.name_1 || null,
      name: p.name_1 ? `${p.name_1}, ${p.name_0}` : p.name_0,
      bws_score: Number(p.bws_score),
      bws_cat: cat,
      bws_label: p.bws_label,
      pfaf_id: p.pfaf_id,
      type: 'water_stress'
    }
  });
}

async function fetchCountry(iso3, features) {
  let offset = 0;
  let raw = 0;
  const before = features.length;
  for (;;) {
    const page = await queryCountryPage(iso3, offset);
    const batch = page.features || [];
    raw += batch.length;
    for (const f of batch) ingestFeature(f, features);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return { raw, kept: features.length - before };
}

async function main() {
  await mkdir(SOURCE_DIR, { recursive: true });
  const features = [];
  let rawTotal = 0;

  for (const iso3 of EU_ISO3) {
    const { raw, kept } = await fetchCountry(iso3, features);
    rawTotal += raw;
    console.log(`${iso3}: ${raw} raw → ${kept} kept (total ${features.length})`);
  }

  const path = join(SOURCE_DIR, 'aqueduct40_eu_bws_basins.geojson');
  await writeFile(path, JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`Wrote ${features.length} basins (from ${rawTotal} raw) → ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
