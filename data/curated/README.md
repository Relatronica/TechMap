# Record curati editorialmente

I GeoJSON in questa cartella sono la **fonte di verità** per i siti con descrizioni, impatto e fonti verificate a mano.

| File | Ruolo |
| --- | --- |
| `data_centers.geojson` | Campus e DC curati (merge con candidati OSM). Priorità Italia: cluster Milano, Trino Cavour, Bologna HPC, Sulcis, Roma |
| `energy_plants.geojson` | Impianti curati + nodi PPA (merge con WRI) |
| `raw_materials.geojson` | Estrazione, fab, design, battery materials (copia → public) |
| `connections_edges.json` | Archi di filiera **senza** geometria (fonte) |
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
`powers` senza PPA/offtake nominato → `inferred` o `likely`, mai `confirmed`.
Non collegare materie a filiere sbagliate (es. litio → fab semiconduttori).

Modifica i file qui, poi esegui la pipeline sopra.
