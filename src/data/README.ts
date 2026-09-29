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
 * 1. id, name, type, subtype, operator, city, country, description_it (+ description_en se disponibile)
 * 2. sources[] + confidence + updated_at
 * 3. impact.capacity_mw (numero) — tenere capacity come etichetta display
 *    Con MW presenti, il pannello dettaglio mostra card (elettricità/CO₂/acqua)
 *    con stime etichettate (src/lib/impactEstimates.ts).
 * 4. employment (anche solo note_it/note_en se i numeri mancano) + community_impact_it/_en
 *    Priorità: nodi dei corridoi documentati (contrasto DC ↔ fab ↔ miniera ↔ ODM)
 * 4b. noise (opzionale): lw_dba e/o backup_mwt + scenario — isolinee in mappa (MVP Lombardia)
 * 5. connections.certainty + evidence_note_it/_en (obbligatori per ogni nuovo legame)
 *
 * Locale UI: la mappa preferisce *_en su /en, altrimenti fallback a *_it (src/lib/localizedField.ts).
 *
 * Unità di lavoro = corridoio documentato (non densità di archi).
 * Fonte archi: data/curated/connections_edges.json → npm run data:supply-chain
 *
 * Regole:
 * - null = sconosciuto (non usare 0 come placeholder)
 * - powers = contratto energetico (PPA/CPPA/offtake). Senza documento nominato →
 *   certainty: "inferred" o "likely", mai "confirmed"
 * - connects = fisica di rete (cabina/stazione↔campus, oppure centrale→stazione
 *   di immissione attigua). confirmed solo con fascicolo o adiacenza documentata.
 *   connects inferred ammesso dal nodo di immissione verso campus dello stesso
 *   cluster di rete (scheda: non è l'allaccio né un offtake).
 * - supplies / manufactures_for solo se il materiale appartiene a quella filiera
 *   (niente litio→chip, cobalto→TSMC, miniera↔miniera come "fornitura")
 * - trains = lavoro cognitivo (labeling / moderazione / RLHF) verso lab o footprint
 *   dove il modello è addestrato o servito; confirmed solo con inchiesta/contratto
 *   che nomina cliente + sito/hub
 * - siti senza arco restano validi (progetti, contesto) — non inventare legami
 * - lavoro artigianale vs industriale: dichiararlo in employment.note_it e labor_risks
 * - site_category: extraction | manufacturing | infrastructure
 *   (ai_data_work → extraction: estrazione di lavoro cognitivo)
 *
 * Corridoi di riferimento (v0.3.9):
 * - Energia: Lule Älv → Meta; FI wind → Hamina; Lenalea → MS Dublin; Fågelås → AWS SE
 * - Silicio AI: ASML → TSMC → NVIDIA → Quanta (ODM) → hyperscale
 * - Metalli batterie: Mutanda/Kamoto → Umicore Kokkola; Greenbushes → Kwinana
 * - Lavoro cognitivo AI: Sama/Remotasks Nairobi → OpenAI / Meta
 */

export const DATA_MODEL_VERSION = '0.3';

export const COMPLETION_PRIORITY = [
  'identity',
  'provenance',
  'impact_mw',
  'employment',
  'connection_certainty'
] as const;
