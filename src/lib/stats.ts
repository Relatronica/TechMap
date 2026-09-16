import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Feat = { properties: Record<string, unknown> };
type FC = { features: Feat[] };

function load(name: string): FC {
  return JSON.parse(
    readFileSync(join(process.cwd(), 'public/data', name), 'utf8')
  ) as FC;
}

/** Statistiche derivate dai GeoJSON (build-time). */
export function getDatasetStats() {
  const dc = load('data_centers.geojson');
  const ep = load('energy_plants.geojson');
  const rm = load('raw_materials.geojson');
  const conn = load('connections.geojson');

  const dataCenters = dc.features.length;
  const energyPlants = ep.features.length;
  const rawMaterials = rm.features.length;
  const connections = conn.features.length;
  const countries = new Set(
    [...dc.features, ...ep.features, ...rm.features].map((f) =>
      String(f.properties.country || '')
    )
  ).size;

  return {
    dataCenters,
    energyPlants,
    rawMaterials,
    connections,
    countries,
    sites: dataCenters + energyPlants + rawMaterials
  };
}
