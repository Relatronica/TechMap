import { readFile, writeFile } from 'node:fs/promises';
import {
  EU_ISO3,
  toIso2,
  isDuplicate,
  confidenceRank,
  inferCountryFromCoords
} from './lib/geo-utils.mjs';

const PUBLIC_DIR = new URL('../../public/data/', import.meta.url);
const CURATED_DIR = new URL('../../data/curated/', import.meta.url);
const CANDIDATES_DIR = new URL('../../data/candidates/', import.meta.url);
const TODAY = new Date().toISOString().slice(0, 10);

const ENERGY_EU_MIN_MW = Number(process.env.ENERGY_EU_MIN_MW || 100);

async function readJson(url) {
  const raw = await readFile(url, 'utf8');
  return JSON.parse(raw);
}

function nextId(prefix, features) {
  let max = 0;
  for (const f of features) {
    const id = String(f.properties?.id || '');
    const m = id.match(new RegExp(`^${prefix}_(\\d+)$`));
    if (m) max = Math.max(max, Number(m[1]));
  }
  return (n) => `${prefix}_${String(max + n).padStart(3, '0')}`;
}

function pickCapacityMw(props) {
  const fromImpact = props.impact?.capacity_mw;
  if (typeof fromImpact === 'number' && Number.isFinite(fromImpact)) return fromImpact;
  const cap = String(props.capacity || '');
  const m = cap.match(/([\d.,]+)\s*MW/i);
  if (m) return Number(m[1].replace(',', '.'));
  return null;
}

function mergeLists(curated, candidates, options) {
  const { filterCandidate, idPrefix, kmThreshold = 2.5 } = options;
  const kept = [...curated.features];
  const allocId = nextId(idPrefix, kept);
  let imported = 0;
  let skippedDup = 0;
  let skippedFilter = 0;

  for (const cand of candidates.features) {
    if (!filterCandidate(cand)) {
      skippedFilter += 1;
      continue;
    }

    const dupIdx = kept.findIndex((existing) =>
      isDuplicate(existing, cand, kmThreshold)
    );

    if (dupIdx >= 0) {
      const existing = kept[dupIdx];
      if (confidenceRank(cand.properties.confidence) > confidenceRank(existing.properties.confidence)) {
        kept[dupIdx] = {
          ...cand,
          properties: {
            ...cand.properties,
            id: existing.properties.id,
            description_it: existing.properties.description_it || cand.properties.description_it,
            sources: [
              ...(existing.properties.sources || []),
              ...(cand.properties.sources || [])
            ].filter(
              (s, i, arr) =>
                arr.findIndex((x) => x.title === s.title && x.url === s.url) === i
            )
          }
        };
      }
      skippedDup += 1;
      continue;
    }

    imported += 1;
    kept.push({
      ...cand,
      properties: {
        ...cand.properties,
        id: allocId(imported)
      }
    });
  }

  return {
    collection: { type: 'FeatureCollection', features: kept },
    stats: { total: kept.length, curated: curated.features.length, imported, skippedDup, skippedFilter }
  };
}

const EU_ISO2 = new Set([...EU_ISO3].map((c) => toIso2(c)));

function isInEuExtent(lon, lat) {
  return lat >= 34.5 && lat <= 72.5 && lon >= -25 && lon <= 45;
}

function filterEnergyCandidate(feature) {
  const props = feature.properties || {};
  const iso3 = String(props.country_iso3 || props.country || '').toUpperCase();
  const iso2 = toIso2(iso3);
  props.country = iso2;

  if (!EU_ISO2.has(iso2)) return false;
  if (iso2 === 'IT') return true;

  const mw = pickCapacityMw(props);
  return mw !== null && mw >= ENERGY_EU_MIN_MW;
}

function filterDatacenterCandidate(feature) {
  const props = feature.properties || {};
  let iso2 = toIso2(props.country);
  const [lon, lat] = feature.geometry.coordinates;

  if (iso2 === 'XX') {
    iso2 = inferCountryFromCoords(lon, lat);
  }
  props.country = iso2;

  if (EU_ISO2.has(iso2)) return true;
  return iso2 === 'XX' && isInEuExtent(lon, lat);
}

async function main() {
  const [energyCurated, dcCurated, energyCand, dcCand] = await Promise.all([
    readJson(new URL('energy_plants.geojson', CURATED_DIR)),
    readJson(new URL('data_centers.geojson', CURATED_DIR)),
    readJson(new URL('energy_plants_candidates.geojson', CANDIDATES_DIR)),
    readJson(new URL('data_centers_candidates.geojson', CANDIDATES_DIR))
  ]);

  const energy = mergeLists(energyCurated, energyCand, {
    filterCandidate: filterEnergyCandidate,
    idPrefix: 'ep',
    kmThreshold: 2.5
  });

  const datacenters = mergeLists(dcCurated, dcCand, {
    filterCandidate: filterDatacenterCandidate,
    idPrefix: 'dc',
    kmThreshold: 0.8
  });

  const meta = {
    updated_at: TODAY,
    generated_by: 'scripts/ingest/merge-curated.mjs',
    energy_eu_min_mw: ENERGY_EU_MIN_MW,
    layers: {
      energy_plants: energy.stats,
      data_centers: datacenters.stats
    },
    sources: [
      {
        id: 'wri_gppd',
        title: 'WRI Global Power Plant Database',
        url: 'https://datasets.wri.org/datasets/global-power-plant-database',
        license: 'CC BY 4.0',
        license_url: 'https://creativecommons.org/licenses/by/4.0/',
        used_for: ['energy_plants'],
        note_it: 'Impianti importati con confidence media; record curati editorialmente hanno priorità.'
      },
      {
        id: 'osm_overpass',
        title: 'OpenStreetMap (Overpass API)',
        url: 'https://www.openstreetmap.org/copyright',
        license: 'ODbL 1.0',
        license_url: 'https://opendatacommons.org/licenses/odbl/1-0/',
        used_for: ['data_centers'],
        note_it: 'Tag telecom=data_center; confidence bassa, da verificare con fonti aggiuntive.'
      },
      {
        id: 'dce',
        title: 'DataCentersExposed',
        url: 'https://datacentersexposed.com/',
        license: 'ODbL 1.0',
        license_url: 'https://opendatacommons.org/licenses/odbl/1-0/',
        used_for: [],
        note_it: 'Dataset US-only; non incluso nella mappa EU salvo record curati.'
      },
      {
        id: 'carto',
        title: 'CARTO Positron',
        url: 'https://carto.com/attributions/',
        license: 'Proprietary basemap',
        used_for: ['basemap'],
        note_it: 'Tile di base © OpenStreetMap contributors, © CARTO.'
      },
      {
        id: 'openinframap',
        title: 'Open Infrastructure Map (rete elettrica)',
        url: 'https://openinframap.org/about',
        license: 'ODbL 1.0',
        license_url: 'https://opendatacommons.org/licenses/odbl/1-0/',
        used_for: ['overlays'],
        note_it: 'Linee di trasmissione da OpenStreetMap via tile vettoriali OpenInfraMap.'
      },
      {
        id: 'wri_aqueduct',
        title: 'WRI Aqueduct 4.0 — stress idrico (bacini)',
        url: 'https://www.wri.org/aqueduct',
        license: 'CC BY 4.0',
        license_url: 'https://creativecommons.org/licenses/by/4.0/',
        used_for: ['overlays'],
        note_it:
          'Baseline water stress su sottobacini HydroBASINS L6 (non confini amministrativi). Mostra variazioni locali entro le regioni italiane.'
      },
      {
        id: 'telegeography_cables',
        title: 'Cavi sottomarini (estratto storico TeleGeography)',
        url: 'https://github.com/stevesong/open_undersea_cable_map',
        license: 'CC BY-NC-SA 3.0',
        license_url: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
        used_for: ['overlays'],
        note_it:
          'Dataset storico non commerciale; rotte e landing in Europa. Non aggiornato in tempo reale.'
      }
    ],
    overlays: {
      power_grid: 'OpenInfraMap vector tiles',
      water_stress: 'EU HydroBASINS L6 choropleth from Aqueduct 4.0 baseline water stress',
      submarine_cables: 'Europe-filtered historical TeleGeography GeoJSON'
    },
    methodology_it:
      'I record curati editorialmente (descrizioni, impatto, lavoro) restano in mappa. ' +
      'Gli import automatici integrano WRI (tutti gli impianti IT + EU ≥ ' +
      `${ENERGY_EU_MIN_MW} MW) e OSM per data center in area EU. Duplicati per prossimità/nome vengono accorpati. ` +
      'Gli overlay di contesto (rete, stress idrico, cavi) sono disattivati di default.'
  };

  await writeFile(
    new URL('energy_plants.geojson', PUBLIC_DIR),
    JSON.stringify(energy.collection, null, 2)
  );
  await writeFile(
    new URL('data_centers.geojson', PUBLIC_DIR),
    JSON.stringify(datacenters.collection, null, 2)
  );
  await writeFile(
    new URL('dataset_meta.json', PUBLIC_DIR),
    JSON.stringify(meta, null, 2)
  );

  console.log('Merge complete:');
  console.log(`  energy_plants: ${energy.stats.total} (${energy.stats.imported} imported, ${energy.stats.skippedDup} deduped)`);
  console.log(`  data_centers: ${datacenters.stats.total} (${datacenters.stats.imported} imported, ${datacenters.stats.skippedDup} deduped)`);
  console.log(`  dataset_meta.json updated (${TODAY})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
