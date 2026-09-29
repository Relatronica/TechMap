# Record curati editorialmente

I GeoJSON in questa cartella sono la **fonte di verità** per i siti con descrizioni, impatto e fonti verificate a mano.

| File | Ruolo |
| --- | --- |
| `data_centers.geojson` | Campus e DC curati (merge con candidati OSM). Priorità Italia: cluster Milano, secondo polo Roma/Lazio, **polo Torino (dc_058–075)**, **hyperscale Caselle/Grugliasco (dc_076–077)**, Trino Cavour, Bologna HPC, Sulcis |
| `energy_plants.geojson` | Impianti curati + nodi PPA (merge con WRI) |
| `raw_materials.geojson` | Estrazione, fab, **HBM**, **packaging CoWoS/OSAT**, design, ODM, **batterie (Co/Ni/Li → pCAM/CAM → celle; grafite→anodo; riciclo)**, **lavoro dati AI**, lab modelli |
| `connections_edges.json` | Archi di filiera **senza** geometria (fonte): powers, connects, supplies, manufactures_for, **trains** |
| `grid_nodes.geojson` | Cabine e stazioni nominate in un fascicolo (non centrali) |
| `connections.geojson` | LineString generate da `npm run data:supply-chain` |

### Pipeline

```bash
npm run data:merge          # DC + energia (curated ⊕ candidates) → public/data/
npm run data:supply-chain   # raw_materials + connections → public/data/
```

`npm run data:refresh` esegue entrambi (dopo fetch/normalize).

### Regola sulle connessioni

Unità di lavoro = **corridoio documentato**, non densità di frecce.
Ogni arco in `connections_edges.json` richiede `certainty` + `evidence_note_it`.
Cinque tipi: `powers` (contratto), `connects` (fisica di rete, inclusa immissione centrale→stazione), `supplies`, `manufactures_for`, `trains` (lavoro cognitivo labeling/moderazione verso **lab / HQ di committenza**, non verso un DC generico).
`powers` senza PPA/offtake nominato → `inferred` o `likely`, mai `confirmed`.
`connects` confirmed solo con fascicolo (campus↔cabina/stazione) o adiacenza documentata (centrale→stazione).
`connects` inferred ammesso dal nodo di immissione verso campus dello stesso cluster (scheda: non è l'allaccio né un offtake).
`trains` confirmed solo con inchiesta o contratto che nomina cliente e hub di lavoro.
Preset lavoro dati AI: hub KE + PH (Sama, Remotasks, Appen Imus) → Scale / Surge SF → OpenAI, Anthropic, Meta Menlo Park, Google MV. Appen Imus: pin Fairwork 2025 senza arco client-specific.
In mappa gli archi `inferred` sono più leggeri di `confirmed` / `likely`.
Non collegare materie a filiere sbagliate (es. litio → fab semiconduttori).
Spina Silicio AI: ASML → foundry → **HBM + CoWoS/OSAT** → design NVIDIA/AMD → ODM → campus. STM/Infineon/GF EU restano contesto industriale **senza** archi GPU.

Modifica i file qui, poi esegui la pipeline sopra.
