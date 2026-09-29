/**
 * Build Lombardia municipality centroids + population (ISTAT 2021)
 * from opendatasicilia/comuni-italiani (CC BY 4.0 / ISTAT attribution).
 *
 * Output: data/sources/lombardia_settlements.geojson
 * Then: npm run data:overlays
 */
import { mkdir, writeFile } from 'node:fs/promises';

const BASE =
  'https://raw.githubusercontent.com/opendatasicilia/comuni-italiani/main/dati';
const OUT_DIR = new URL('../../data/sources/', import.meta.url);
const MIN_POPULATION = 1000;
const REGION_CODE = '3'; // Lombardia

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i];
    });
    return row;
  });
}

function padIstat(code) {
  return String(code || '')
    .replace(/\D/g, '')
    .padStart(6, '0');
}

async function fetchText(name) {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch ${name}: HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const [comuniText, coordText, popText] = await Promise.all([
    fetchText('comuni.csv'),
    fetchText('coordinate.csv'),
    fetchText('ISTAT_popolazione_2021.csv')
  ]);

  const comuni = parseCsv(comuniText);
  const coords = parseCsv(coordText);
  const pop = parseCsv(popText);

  const coordBy = new Map(coords.map((r) => [padIstat(r.pro_com_t), r]));
  const popBy = new Map(pop.map((r) => [padIstat(r.pro_com_t), r]));

  const lombardia = comuni.filter(
    (r) => String(r.cod_reg) === REGION_CODE || String(r.cod_reg) === '03'
  );

  const features = [];
  let skippedNoCoord = 0;
  let skippedPop = 0;

  for (const c of lombardia) {
    const id = padIstat(c.pro_com_t);
    const co = coordBy.get(id);
    const po = popBy.get(id);
    if (!co) {
      skippedNoCoord += 1;
      continue;
    }
    const population = Number(po?.totale || 0);
    if (population < MIN_POPULATION) {
      skippedPop += 1;
      continue;
    }
    const lat = Number(co.lat);
    const lon = Number(co.long);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      skippedNoCoord += 1;
      continue;
    }
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        id: `it_${id}`,
        istat_code: id,
        name: c.comune,
        province: c.sigla,
        population,
        type: 'settlement'
      }
    });
  }

  features.sort((a, b) => b.properties.population - a.properties.population);

  const collection = {
    type: 'FeatureCollection',
    properties: {
      region: 'Lombardia',
      region_code: '03',
      min_population: MIN_POPULATION,
      population_year: 2021,
      source: 'opendatasicilia/comuni-italiani (ISTAT popolazione 2021 + centroidi)',
      source_url: 'https://github.com/opendatasicilia/comuni-italiani',
      license: 'CC BY 4.0 (ISTAT / Open Data Sicilia)'
    },
    features
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    new URL('lombardia_settlements.geojson', OUT_DIR),
    JSON.stringify(collection)
  );

  console.log(
    `Lombardia settlements: ${features.length} (min pop ${MIN_POPULATION}; skipped pop=${skippedPop}, no-coord=${skippedNoCoord})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
