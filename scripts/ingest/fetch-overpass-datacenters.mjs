import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';

const OVERPASS_URL =
  process.env.OVERPASS_URL || 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';
const OUTPUT_PATH = new URL('../../data/sources/osm_datacenters_overpass.json', import.meta.url);
const timeoutMs = Number(process.env.OVERPASS_TIMEOUT_MS || 90000);

/** Regional bboxes: south,west,north,east — kept small for reliability. */
const DEFAULT_TILES = [
  { name: 'it-nw', bbox: '43.5,6.5,47.5,11.0' },
  { name: 'it-ne', bbox: '43.5,11.0,47.5,14.5' },
  { name: 'it-sw', bbox: '36.5,6.5,43.5,11.0' },
  { name: 'it-se', bbox: '36.5,11.0,43.5,18.5' },
  { name: 'it-islands', bbox: '35.5,8.0,41.5,16.0' },
  { name: 'de', bbox: '47.0,5.5,55.5,15.5' },
  { name: 'fr', bbox: '41.0,-5.5,51.5,10.0' },
  { name: 'nl-be', bbox: '50.0,2.5,54.0,7.5' },
  { name: 'ie', bbox: '51.0,-11.0,55.5,-5.0' },
  { name: 'gb-sw', bbox: '49.8,-6.5,52.0,0.0' },
  { name: 'gb-se', bbox: '50.5,0.0,52.0,2.0' },
  { name: 'gb-lon', bbox: '51.2,-0.8,51.8,0.4' },
  { name: 'gb-mid', bbox: '52.6,-6.5,55.2,0.5' },
  { name: 'gb-n', bbox: '55.2,-8.0,61.0,0.0' },
  { name: 'nordics', bbox: '55.0,4.0,71.0,32.0' },
  { name: 'es-pt', bbox: '36.0,-10.0,44.0,4.5' }
];

function buildQuery(bbox) {
  return `
[out:json][timeout:90];
(
  node["telecom"="data_center"](${bbox});
  way["telecom"="data_center"](${bbox});
  relation["telecom"="data_center"](${bbox});
);
out center tags;
`;
}

async function fetchTile(bbox, name) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Substrato data pipeline (https://substrato.eu; contact: relatronica.com)'
      },
      signal: controller.signal,
      body: `data=${encodeURIComponent(buildQuery(bbox))}`
    });

    if (!res.ok) {
      throw new Error(`${name}: HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const count = Array.isArray(data.elements) ? data.elements.length : 0;
    console.log(`  ${name}: ${count} elements`);
    return data.elements || [];
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(new URL('../../data/sources/', import.meta.url), { recursive: true });

  const tilesEnv = process.env.OVERPASS_TILES;
  const tiles = tilesEnv
    ? tilesEnv.split(';').map((part, i) => {
        const [name, bbox] = part.split('=');
        return { name: name || `tile-${i}`, bbox };
      })
    : DEFAULT_TILES;

  const allElements = [];
  const seenIds = new Set();

  try {
    await access(OUTPUT_PATH);
    const existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'));
    for (const el of existing.elements || []) {
      const key = `${el.type}/${el.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allElements.push(el);
      }
    }
    if (allElements.length) {
      console.log(`Loaded ${allElements.length} existing elements (merge mode)`);
    }
  } catch {
    /* no prior dump */
  }

  for (const tile of tiles) {
    try {
      const elements = await fetchTile(tile.bbox, tile.name);
      for (const el of elements) {
        const key = `${el.type}/${el.id}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          allElements.push(el);
        }
      }
    } catch (err) {
      console.warn(`  ${tile.name}: skipped —`, err instanceof Error ? err.message : err);
    }
    await sleep(Number(process.env.OVERPASS_PAUSE_MS || 2500));
  }

  const payload = {
    version: 0.6,
    generator: 'Substrato fetch-overpass-datacenters.mjs',
    elements: allElements
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Saved ${allElements.length} unique OSM elements → ${OUTPUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
