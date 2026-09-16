import { mkdir, writeFile } from 'node:fs/promises';

const WRI_CSV_URL =
  'https://raw.githubusercontent.com/wri/global-power-plant-database/master/output_database/global_power_plant_database.csv';
const OUTPUT_PATH = new URL('../../data/sources/wri_global_power_plants.csv', import.meta.url);

async function main() {
  await mkdir(new URL('../../data/sources/', import.meta.url), { recursive: true });
  const res = await fetch(WRI_CSV_URL);
  if (!res.ok) {
    throw new Error(`WRI fetch failed: ${res.status} ${res.statusText}`);
  }
  const csv = await res.text();
  await writeFile(OUTPUT_PATH, csv, 'utf8');
  console.log(`Saved WRI dataset to ${OUTPUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
