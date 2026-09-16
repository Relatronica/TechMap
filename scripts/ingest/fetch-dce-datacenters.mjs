import { mkdir, writeFile } from 'node:fs/promises';

const DCE_CSV_URL = 'https://datacentersexposed.com/data/facilities.csv';
const OUTPUT_PATH = new URL('../../data/sources/datacentersexposed_facilities.csv', import.meta.url);

async function main() {
  await mkdir(new URL('../../data/sources/', import.meta.url), { recursive: true });
  const res = await fetch(DCE_CSV_URL);
  if (!res.ok) {
    throw new Error(`DataCentersExposed fetch failed: ${res.status} ${res.statusText}`);
  }
  const csv = await res.text();
  await writeFile(OUTPUT_PATH, csv, 'utf8');
  console.log(`Saved DataCentersExposed dataset to ${OUTPUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
