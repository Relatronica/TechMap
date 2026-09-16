import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { toIso2 } from './lib/geo-utils.mjs';

const SOURCE_DIR = new URL('../../data/sources/', import.meta.url);
const OUTPUT_DIR = new URL('../../data/candidates/', import.meta.url);

function parseCsv(content) {
  const cleaned = content
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('#'))
    .join('\n');

  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cur);
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.map((r) =>
    Object.fromEntries(header.map((h, idx) => [h, r[idx] ?? '']))
  );
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeWriEnergy(rows) {
  const allowed = new Set(['gas', 'solar', 'wind', 'hydro', 'nuclear']);
  const mapFuel = {
    Gas: 'gas',
    Solar: 'solar',
    Wind: 'wind',
    Hydro: 'hydro',
    Nuclear: 'nuclear'
  };

  let idx = 1;
  return rows
    .map((r) => {
      const subtype = mapFuel[r.primary_fuel];
      if (!allowed.has(subtype)) return null;
      const lon = num(r.longitude);
      const lat = num(r.latitude);
      if (lon === null || lat === null) return null;
      const capacityMw = num(r.capacity_mw);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: `ep_wri_${String(idx++).padStart(5, '0')}`,
          name: r.name || 'Unnamed plant',
          type: 'energy_plant',
          subtype,
          operator: r.owner || r.source || 'Unknown',
          capacity: capacityMw ? `${capacityMw} MW` : '',
          description_it: `Record importato da WRI Global Power Plant Database (country_long: ${r.country_long || 'n/a'}).`,
          country: toIso2(r.country || 'XX'),
          country_iso3: (r.country || 'XXX').toUpperCase(),
          city: r.location || 'n/d',
          status: 'unknown',
          site_category: 'infrastructure',
          opened_year: num(r.commissioning_year),
          updated_at: new Date().toISOString().slice(0, 10),
          confidence: 'medium',
          import_source: 'wri_gppd',
          external_id: r.gppd_idnr || null,
          impact: {
            capacity_mw: capacityMw,
            power_draw_mw_est: null,
            pue: null,
            water_use_m3_year: null,
            land_ha: null,
            co2_t_year_est: null
          },
          sources: [
            {
              title: 'WRI Global Power Plant Database',
              url: 'https://datasets.wri.org/datasets/global-power-plant-database',
              accessed_at: new Date().toISOString().slice(0, 10)
            }
          ]
        }
      };
    })
    .filter(Boolean);
}

function normalizeOsmDatacenters(data) {
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  let idx = 1;
  return elements
    .map((el) => {
      const tags = el.tags || {};
      const lon = num(el.lon ?? el.center?.lon);
      const lat = num(el.lat ?? el.center?.lat);
      if (lon === null || lat === null) return null;

      const name = tags.name || tags['name:en'] || tags.ref;
      if (!name) return null;

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: `dc_osm_${String(idx++).padStart(5, '0')}`,
          name,
          type: 'data_center',
          subtype: 'colocation',
          operator: tags.operator || tags.owner || 'Unknown',
          description_it:
            'Record da OpenStreetMap (tag data_center). Da validare con almeno una seconda fonte.',
          country: toIso2(tags['addr:country'] || tags['ISO3166-1:alpha2'] || 'XX'),
          city: tags['addr:city'] || tags['addr:town'] || tags['addr:state'] || 'n/d',
          status: tags['disused:telecom'] ? 'decommissioned' : 'unknown',
          site_category: 'infrastructure',
          opened_year: null,
          updated_at: new Date().toISOString().slice(0, 10),
          confidence: 'low',
          import_source: 'osm_overpass',
          external_id: `osm/${el.type}/${el.id}`,
          sources: [
            {
              title: 'OpenStreetMap / Overpass',
              url: 'https://wiki.openstreetmap.org/wiki/Tag:telecom%3Ddata_center',
              accessed_at: new Date().toISOString().slice(0, 10),
              note: `osm_id=${el.id}`
            }
          ]
        }
      };
    })
    .filter(Boolean);
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
  }
  return '';
}

function normalizeDceDatacenters(rows) {
  let idx = 1;
  return rows
    .map((r) => {
      const lon = num(pick(r, ['longitude', 'lon', 'lng']));
      const lat = num(pick(r, ['latitude', 'lat']));
      if (lon === null || lat === null) return null;

      const name = pick(r, ['name', 'campus_name', 'facility_name']);
      if (!name) return null;

      const mw = num(pick(r, ['mw', 'capacity_mw', 'it_mw']));
      const statusRaw = String(pick(r, ['status', 'operating_status'])).toLowerCase();
      const status =
        statusRaw.includes('operat') ? 'operational' :
          statusRaw.includes('construct') ? 'under_construction' :
            statusRaw.includes('plan') ? 'planned' : 'unknown';

      const confidenceRaw = String(pick(r, ['confidence', 'confidence_grade'])).toLowerCase();
      const confidence = confidenceRaw.startsWith('a') || confidenceRaw.startsWith('b') ? 'high' :
        confidenceRaw.startsWith('c') ? 'medium' : 'low';

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: `dc_dce_${String(idx++).padStart(5, '0')}`,
          name,
          type: 'data_center',
          subtype: 'colocation',
          operator: pick(r, ['operator', 'ultimate_parent', 'owner']) || 'Unknown',
          capacity: mw ? `${mw} MW` : '',
          description_it:
            'Record importato da DataCentersExposed (campus-level).',
          country: toIso2(pick(r, ['country_code', 'country']) || 'US'),
          city: pick(r, ['city', 'locality', 'metro']) || 'n/d',
          status,
          site_category: 'infrastructure',
          opened_year: num(pick(r, ['opened_year', 'year_opened', 'year_operational'])),
          updated_at: new Date().toISOString().slice(0, 10),
          confidence,
          import_source: 'dce',
          external_id: pick(r, ['facility_id', 'id', 'campus_id']) || null,
          impact: {
            capacity_mw: mw,
            power_draw_mw_est: null,
            pue: null,
            water_use_m3_year: null,
            land_ha: null,
            co2_t_year_est: null
          },
          sources: [
            {
              title: 'DataCentersExposed facilities.csv',
              url: 'https://datacentersexposed.com/data/facilities.csv',
              accessed_at: new Date().toISOString().slice(0, 10),
              note: pick(r, ['source_url', 'source']) || undefined
            }
          ]
        }
      };
    })
    .filter(Boolean);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);

  const wriCsv = await readFile(new URL('wri_global_power_plants.csv', SOURCE_DIR), 'utf8');
  const wriRows = parseCsv(wriCsv);
  const energyCandidates = normalizeWriEnergy(wriRows);

  const dcCandidates = [];
  try {
    const dceCsv = await readFile(new URL('datacentersexposed_facilities.csv', SOURCE_DIR), 'utf8');
    dcCandidates.push(...normalizeDceDatacenters(parseCsv(dceCsv)));
  } catch (err) {
    console.warn('DCE source unavailable.', err instanceof Error ? err.message : '');
  }
  try {
    const osmJsonRaw = await readFile(new URL('osm_datacenters_overpass.json', SOURCE_DIR), 'utf8');
    const osmData = JSON.parse(osmJsonRaw);
    dcCandidates.push(...normalizeOsmDatacenters(osmData));
  } catch (osmErr) {
    console.warn(
      'OSM source unavailable.',
      osmErr instanceof Error ? osmErr.message : ''
    );
  }

  await writeFile(
    new URL('energy_plants_candidates.geojson', OUTPUT_DIR),
    JSON.stringify({ type: 'FeatureCollection', features: energyCandidates }, null, 2)
  );
  await writeFile(
    new URL('data_centers_candidates.geojson', OUTPUT_DIR),
    JSON.stringify({ type: 'FeatureCollection', features: dcCandidates }, null, 2)
  );
  await writeFile(
    new URL('ATTRIBUTION.md', OUTPUT_DIR),
    [
      `Generated: ${today}`,
      '',
      '- WRI Global Power Plant Database: https://datasets.wri.org/datasets/global-power-plant-database (CC BY 4.0).',
      '- DataCentersExposed facilities.csv: https://datacentersexposed.com/data/facilities.csv (ODbL).',
      '- OpenStreetMap data via Overpass API fallback: https://wiki.openstreetmap.org/wiki/Overpass_API (ODbL).',
      '',
      'Note: OSM-derived records are marked low confidence by default and require secondary-source verification.'
    ].join('\n'),
    'utf8'
  );

  console.log(`Wrote ${energyCandidates.length} energy candidates`);
  console.log(`Wrote ${dcCandidates.length} data-center candidates`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
