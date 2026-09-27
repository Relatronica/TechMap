/**
 * Guida operativa al modello dati v0.3
 *
 * File correlati:
 * - src/data/types.ts
 * - src/data/schema.json
 * - data/curated/* (fonte di verità editoriale)
 * - public/data/*.geojson (output servito)
 *
 * Priorità di compilazione (per record):
 * 1. id, name, type, subtype, operator, city, country, description_it
 * 2. sources[] + confidence + updated_at
 * 3. impact.capacity_mw (numero) — tenere capacity come etichetta display
 *    Con MW presenti, il pannello dettaglio mostra card (elettricità/CO₂/acqua)
 *    con stime etichettate (src/lib/impactEstimates.ts).
 * 4. employment (anche solo note_it se i numeri mancano) + community_impact_it
 *    Priorità: nodi dei corridoi documentati (contrasto DC ↔ fab ↔ miniera ↔ ODM)
 * 5. connections.certainty + evidence_note_it (obbligatori per ogni nuovo legame)
 *
 * Unità di lavoro = corridoio documentato (non densità di archi).
 * Fonte archi: data/curated/connections_edges.json → npm run data:supply-chain
 *
 * Regole:
 * - null = sconosciuto (non usare 0 come placeholder)
 * - powers senza PPA/documento → certainty: "inferred" o "likely", mai "confirmed"
 * - supplies/manufactures_for solo se il materiale appartiene a quella filiera
 *   (niente litio→chip, cobalto→TSMC, miniera↔miniera come "fornitura")
 * - siti senza arco restano validi (progetti, contesto) — non inventare legami
 * - lavoro artigianale vs industriale: dichiararlo in employment.note_it e labor_risks
 * - site_category: extraction | manufacturing | infrastructure
 *
 * Corridoi di riferimento (v0.3.1):
 * - Energia: Lule Älv → Meta; FI wind → Hamina; Lenalea → MS Dublin; Fågelås → AWS SE
 * - Silicio AI: ASML → TSMC → NVIDIA → Quanta (ODM) → hyperscale
 * - Metalli batterie: Mutanda/Kamoto → Umicore Kokkola
 * - Potenza EU (inferred): ST Catania / Infineon → Aruba IT3
 */

export const DATA_MODEL_VERSION = '0.3';

export const COMPLETION_PRIORITY = [
  'identity',
  'provenance',
  'impact_mw',
  'employment',
  'connection_certainty'
] as const;
