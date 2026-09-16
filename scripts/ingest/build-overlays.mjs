/**
 * Build map context overlays into public/data/overlays/
 * - submarine cables / landings (TeleGeography CC BY-NC-SA historical extract)
 * - EU water stress choropleth at HydroBASINS L6 (WRI Aqueduct 4.0 baseline)
 *
 * Power grid uses live OpenInfraMap vector tiles (no local file).
 *
 * Prerequisite for water: npm run data:fetch:aqueduct
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const SOURCE_DIR = new URL('../../data/sources/', import.meta.url);
const OUT_DIR = new URL('../../public/data/overlays/', import.meta.url);

const ISO3_TO_ISO2 = {
  ITA: 'IT', FRA: 'FR', DEU: 'DE', ESP: 'ES', NLD: 'NL', BEL: 'BE', AUT: 'AT',
  POL: 'PL', SWE: 'SE', FIN: 'FI', DNK: 'DK', PRT: 'PT', GRC: 'GR', IRL: 'IE',
  CZE: 'CZ', ROU: 'RO', HUN: 'HU', BGR: 'BG', SVK: 'SK', HRV: 'HR', SVN: 'SI',
  LTU: 'LT', LVA: 'LV', EST: 'EE', LUX: 'LU', MLT: 'MT', CYP: 'CY', GBR: 'GB',
  CHE: 'CH', NOR: 'NO', ISL: 'IS', ALB: 'AL', SRB: 'RS', BIH: 'BA', MNE: 'ME',
  MKD: 'MK', XKX: 'XK', AND: 'AD', LIE: 'LI', SMR: 'SM', VAT: 'VA', MDA: 'MD',
  UKR: 'UA'
};

function inEuropeExtent(coords) {
  const pts = [];
  const walk = (c) => {
    if (typeof c[0] === 'number') pts.push(c);
    else c.forEach(walk);
  };
  walk(coords);
  return pts.some(([lon, lat]) => lon >= -25 && lon <= 45 && lat >= 30 && lat <= 72);
}

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, SOURCE_DIR), 'utf8'));
}

async function buildCables() {
  const cables = await readJson('cables_raw.json');
  const landings = await readJson('landing_raw.json');

  const cableFeats = cables.features
    .filter((f) => inEuropeExtent(f.geometry.coordinates))
    .map((f) => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        id: f.properties.id,
        name: f.properties.name,
        type: 'submarine_cable',
        color: f.properties.color || '#5A9BB8'
      }
    }));

  const landFeats = landings.features
    .filter((f) => {
      const [lon, lat] = f.geometry.coordinates;
      return lon >= -25 && lon <= 45 && lat >= 30 && lat <= 72;
    })
    .map((f) => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        id: f.properties.id,
        name: f.properties.name,
        type: 'cable_landing',
        is_tbd: !!f.properties.is_tbd
      }
    }));

  await writeFile(
    new URL('submarine_cables.geojson', OUT_DIR),
    JSON.stringify({ type: 'FeatureCollection', features: cableFeats })
  );
  await writeFile(
    new URL('cable_landings.geojson', OUT_DIR),
    JSON.stringify({ type: 'FeatureCollection', features: landFeats })
  );
  return { cables: cableFeats.length, landings: landFeats.length };
}

async function buildWaterStress() {
  const path = new URL('aqueduct40_eu_bws_basins.geojson', SOURCE_DIR);
  try {
    await access(path);
  } catch {
    throw new Error(
      'Missing aqueduct40_eu_bws_basins.geojson — run: npm run data:fetch:aqueduct'
    );
  }

  const raw = JSON.parse(await readFile(path, 'utf8'));
  const waterFeats = (raw.features || []).map((f) => {
    const p = f.properties || {};
    const iso3 = p.country_iso3;
    return {
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        country: ISO3_TO_ISO2[iso3] || (iso3 ? iso3.slice(0, 2) : null),
        country_iso3: iso3,
        region: p.region,
        name: p.name,
        bws_score: p.bws_score,
        bws_cat: p.bws_cat,
        bws_label: p.bws_label,
        pfaf_id: p.pfaf_id,
        type: 'water_stress'
      }
    };
  });

  await writeFile(
    new URL('water_stress_eu.geojson', OUT_DIR),
    JSON.stringify({ type: 'FeatureCollection', features: waterFeats })
  );
  return { basins: waterFeats.length };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const cables = await buildCables();
  const water = await buildWaterStress();
  console.log(
    `Overlays: cables=${cables.cables}, landings=${cables.landings}, water_basins=${water.basins}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
