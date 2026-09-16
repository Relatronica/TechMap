# Data Intake Sources

Questo folder contiene i dump sorgente grezzi usati per arricchire la mappa.

## Fonti configurate

- **WRI Global Power Plant Database** (energia)
  - URL: https://datasets.wri.org/datasets/global-power-plant-database
  - Licenza: CC BY 4.0
  - File locale: `wri_global_power_plants.csv`

- **OpenStreetMap via Overpass** (data center)
  - URL: https://wiki.openstreetmap.org/wiki/Tag:telecom%3Ddata_center
  - Licenza: ODbL
  - File locale: `osm_datacenters_overpass.json`
  - Endpoint default: `maps.mail.ru` (mirror Overpass; override con `OVERPASS_URL`)
  - Scope default: tile EU + UK (IT, DE, FR, NL/BE, IE, GB, Nordics, ES/PT)
  - Tile singola: `OVERPASS_TILES="it-nw=43.5,6.5,47.5,11.0" npm run data:fetch:osm`

- **DataCentersExposed** (data center, campus-level)
  - URL: https://datacentersexposed.com/data/facilities.csv
  - Licenza: ODbL 1.0
  - File locale: `datacentersexposed_facilities.csv`

## Workflow

1. `npm run data:fetch:wri` — impianti energetici (WRI)
2. `npm run data:fetch:osm` — data center da OpenStreetMap (tile EU)
3. `npm run data:fetch:dc` — DataCentersExposed (US, opzionale)
4. `npm run data:normalize` — normalizza in `data/candidates/`
5. `npm run data:merge` — unisce candidati + record curati in `public/data/`

Tutto insieme: `npm run data:refresh`

L'output normalizzato va in `data/candidates/`; la mappa legge da `public/data/` incluso `dataset_meta.json` (fonti e licenze).

## Overlay di contesto

- **Rete elettrica**: tile live OpenInfraMap (`power_line`)
- **Stress idrico**: `public/data/overlays/water_stress_eu.geojson` (Aqueduct 4.0 × HydroBASINS L6)
- **Cavi sottomarini**: `public/data/overlays/submarine_cables.geojson` + `cable_landings.geojson`

Fetch bacini Aqueduct: `npm run data:fetch:aqueduct`  
Rigenera overlay locali: `npm run data:overlays`

Sorgenti grezze: `cables_raw.json`, `landing_raw.json`, `aqueduct40_eu_bws_basins.geojson`.
