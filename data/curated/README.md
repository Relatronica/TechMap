# Record curati editorialmente

I GeoJSON in questa cartella sono la **fonte di verità** per i siti con descrizioni, impatto e fonti verificate a mano.

| File | Ruolo |
| --- | --- |
| `data_centers.geojson` | Campus e DC curati (merge con candidati OSM). Priorità Italia: cluster Milano, Trino Cavour, Bologna HPC, Sulcis, Roma |
| `energy_plants.geojson` | Impianti curati + nodi PPA (merge con WRI) |
| `raw_materials.geojson` | Estrazione, fab, design, battery materials, **lavoro dati AI** (`ai_data_work`), lab modelli (`model_lab`) |
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
Cinque tipi: `powers` (contratto), `connects` (fisica di rete, inclusa immissione centrale→stazione), `supplies`, `manufactures_for`, `trains` (lavoro cognitivo labeling/moderazione verso lab o footprint).
`powers` senza PPA/offtake nominato → `inferred` o `likely`, mai `confirmed`.
`connects` confirmed solo con fascicolo (campus↔cabina/stazione) o adiacenza documentata (centrale→stazione).
`connects` inferred ammesso dal nodo di immissione verso campus dello stesso cluster (scheda: non è l'allaccio né un offtake).
`trains` confirmed solo con inchiesta o contratto che nomina cliente e hub di lavoro.
In mappa gli archi `inferred` sono più leggeri di `confirmed` / `likely`.
Non collegare materie a filiere sbagliate (es. litio → fab semiconduttori).

Modifica i file qui, poi esegui la pipeline sopra.
