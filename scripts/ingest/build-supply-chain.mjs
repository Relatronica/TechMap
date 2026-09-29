/**
 * Costruisce raw_materials + connections curati e li copia in public/data.
 *
 * Input:
 *  - data/curated/raw_materials.geojson (siti)
 *  - data/curated/connections_edges.json (archi senza geometria)
 *  - data/curated/grid_nodes.geojson (cabine e stazioni)
 *  - data/curated/{data_centers,energy_plants,grid_nodes}.geojson (per coordinate estremi)
 *
 * Output:
 *  - data/curated/connections.geojson
 *  - public/data/raw_materials.geojson
 *  - public/data/grid_nodes.geojson
 *  - public/data/connections.geojson
 */
import { readFile, writeFile, copyFile } from 'node:fs/promises';

const ROOT = new URL('../../', import.meta.url);
const CURATED = new URL('data/curated/', ROOT);
const PUBLIC = new URL('public/data/', ROOT);
const TODAY = new Date().toISOString().slice(0, 10);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

function siteIndex(...collections) {
  const map = new Map();
  for (const fc of collections) {
    for (const f of fc.features || []) {
      const id = f.properties?.id;
      if (id) map.set(id, f);
    }
  }
  return map;
}

function lineFeature(edge, source, target) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [source.geometry.coordinates, target.geometry.coordinates]
    },
    properties: {
      id: edge.id,
      source_id: edge.source_id,
      target_id: edge.target_id,
      source_name: source.properties.name,
      target_name: target.properties.name,
      relationship_type: edge.relationship_type,
      description_it: edge.description_it,
      description_en: edge.description_en,
      certainty: edge.certainty,
      evidence_note_it: edge.evidence_note_it,
      evidence_note_en: edge.evidence_note_en,
      as_of: edge.as_of || null,
      updated_at: TODAY,
      sources: edge.sources || []
    }
  };
}

async function main() {
  const [rawMaterials, edgesDoc, dcCurated, epCurated, gridNodes] = await Promise.all([
    readJson(new URL('raw_materials.geojson', CURATED)),
    readJson(new URL('connections_edges.json', CURATED)),
    readJson(new URL('data_centers.geojson', CURATED)),
    readJson(new URL('energy_plants.geojson', CURATED)),
    readJson(new URL('grid_nodes.geojson', CURATED))
  ]);

  const sites = siteIndex(rawMaterials, dcCurated, epCurated, gridNodes);
  const missing = [];
  const features = [];

  for (const edge of edgesDoc.edges) {
    const source = sites.get(edge.source_id);
    const target = sites.get(edge.target_id);
    if (!source || !target) {
      missing.push(
        `${edge.id}: ${!source ? edge.source_id : ''} ${!target ? edge.target_id : ''}`.trim()
      );
      continue;
    }
    features.push(lineFeature(edge, source, target));
  }

  if (missing.length) {
    console.error('Missing site ids for edges:');
    for (const m of missing) console.error('  -', m);
    process.exit(1);
  }

  const connections = { type: 'FeatureCollection', features };

  await writeFile(
    new URL('connections.geojson', CURATED),
    JSON.stringify(connections, null, 2) + '\n'
  );
  await copyFile(
    new URL('raw_materials.geojson', CURATED),
    new URL('raw_materials.geojson', PUBLIC)
  );
  await copyFile(
    new URL('grid_nodes.geojson', CURATED),
    new URL('grid_nodes.geojson', PUBLIC)
  );
  await copyFile(
    new URL('connections.geojson', CURATED),
    new URL('connections.geojson', PUBLIC)
  );

  const byType = features.reduce((acc, f) => {
    const t = f.properties.relationship_type;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const byCert = features.reduce((acc, f) => {
    const c = f.properties.certainty;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  console.log(`Supply-chain build (${TODAY}):`);
  console.log(`  raw_materials: ${rawMaterials.features.length} sites → public/data/`);
  console.log(`  grid_nodes: ${gridNodes.features.length} sites → public/data/`);
  console.log(`  connections: ${features.length} edges → curated + public`);
  console.log(`  by type: ${JSON.stringify(byType)}`);
  console.log(`  by certainty: ${JSON.stringify(byCert)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
