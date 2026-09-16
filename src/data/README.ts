/**
 * Guida operativa al modello dati v0.2
 *
 * File correlati:
 * - src/data/types.ts
 * - src/data/schema.json
 * - public/data/*.geojson
 *
 * Priorità di compilazione (per record):
 * 1. id, name, type, subtype, operator, city, country, description_it
 * 2. sources[] + confidence + updated_at
 * 3. impact.capacity_mw (numero) — tenere capacity come etichetta display
 * 4. employment (anche solo note_it se i numeri mancano)
 * 5. connections.certainty + evidence_note_it (obbligatori per ogni nuovo legame)
 *
 * Regole:
 * - null = sconosciuto (non usare 0 come placeholder)
 * - powers senza PPA/documento → certainty: "inferred" o "likely", mai "confirmed"
 * - lavoro artigianale vs industriale: dichiararlo in employment.note_it e labor_risks
 * - site_category: extraction | manufacturing | infrastructure
 *
 * Esempi arricchiti nel dataset:
 * - dc_002 Aruba IT3
 * - ep_001 Turbigo
 * - rm_013 Mutanda
 * - conn_001 Turbigo → AWS Milano (inferred)
 */

export const DATA_MODEL_VERSION = '0.2';

export const COMPLETION_PRIORITY = [
  'identity',
  'provenance',
  'impact_mw',
  'employment',
  'connection_certainty'
] as const;
