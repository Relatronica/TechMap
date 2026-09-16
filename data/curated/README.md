# Record curati editorialmente

I GeoJSON in questa cartella sono la **fonte di verità** per i siti con descrizioni, impatto e fonti verificate a mano.

Lo script `npm run data:merge` unisce questi record con i candidati in `data/candidates/` e scrive l'output in `public/data/`.

Modifica i file qui, poi esegui `npm run data:merge` (o `npm run data:refresh` per l'intera pipeline).
