# Inventario data center — Lombardia

Snapshot editoriale (aggiornato 2026-09-27 dopo Wave 1–2). Non è un dataset servito dalla mappa:
traccia copertura vs candidati e il racconto proliferazione (operativi vs pipeline).

**Ambito:** regione Lombardia (cluster Milano + Lodigiano + Bergamasco + Pavese).  
**Fonti primarie da monitorare:**
- MIMIT — programmi di preminente interesse strategico nazionale ([grandi programmi](https://www.mimit.gov.it/it/caie/unita-di-missione/grandi-programmi-di-investimento))
- MASE — portale VIA (`va.mite.gov.it`)
- Regione Lombardia — [Procedimento Unico Centri Dati](https://www.regione.lombardia.it/ambiente-e-territorio/autorizzazione-ambientali/autorizzazione-integrata-ambientale-aia/procedimento-unico-centri-dati) (tabella “procedimenti in corso” ancora vuota al 2026-09-27; LR 11/2026 + dgr 6645/6646)

---

## 1. In mappa — Lombardia (25 pin curati)

| id | Nome | Comune | Status | Note |
| --- | --- | --- | --- | --- |
| dc_002 | Aruba IT3 | Ponte San Pietro (BG) | operational | |
| dc_003 | Google Cloud Region Milano | Milano | operational | Ospitato TIM; pin città |
| dc_004 | Microsoft Azure Italy North | Settala | operational | Cross-ref dc_024/032/033 |
| dc_005 | AWS Europe (Milano) Rho/Pero | Rho/Pero | operational | |
| dc_006 | Equinix ML5 | Settimo Milanese | operational | |
| dc_007 | Equinix ML2 | Milano Via Savona | operational | |
| dc_008 | Irideos Avalon Campus | Milano (Caldera) | operational | |
| dc_009 | STACK MIL01 | Siziano (PV) | operational | |
| dc_010 | TIM Noovle | Rozzano | operational | Capacity = rete nazionale |
| dc_021 | Data4 MIL01 | Cornaredo | operational | ≠ Vantage Cornaredo |
| dc_022 | Vantage MXP1 | Melegnano | under_construction | |
| dc_023 | Vantage MXP2 | Castelletto / Settimo M. | under_construction | ~32 MW IT |
| dc_024 | Microsoft Azure Noviglio | Noviglio | under_construction | |
| dc_025 | AWS Zibido San Giacomo | Zibido S.G. | planned | VIA |
| dc_026 | Equinix Cusago / Settimo (espansione) | Cusago | planned | |
| dc_027 | EdgeConneX Opera | Opera | planned | Split: +dc_037/038 |
| dc_031 | K2 Zibido / Lacchiarella | Lacchiarella | planned | |
| dc_032 | Microsoft San Bovio | Peschiera Borromeo | under_construction | **Wave 1** |
| dc_033 | Microsoft Bornasco | Bornasco (PV) | under_construction | **Wave 1** |
| dc_034 | Vantage MXP4 Tavazzano | Tavazzano / Montanaso | planned | **Wave 1** (pin su TTEP) |
| dc_035 | MIL05 Vignate | Vignate | planned | **Wave 1** VIA+ DM 411/2026 |
| dc_036 | Eni–Khazna AI Campus | Ferrera Erbognone | planned | **Wave 1** ~500 MW IT |
| dc_037 | EdgeConneX Pieve Emanuele | Pieve Emanuele | planned | **Wave 2** |
| dc_038 | EdgeConneX Bertonico | Bertonico (LO) | planned | **Wave 2** |
| dc_039 | Vantage Cornaredo | Cornaredo | planned | **Wave 2** (lotto da raffinare) |

### Debiti residui
- Coordinate approximate: dc_034 (TTEP), dc_037–039 (comune/frazione), dc_036 (sito GDC Eni esistente)
- Capacità a volte di programma, non di sito (EdgeConneX, alcuni Vantage)
- Equinix ML3/ML4/ML7x e Data4 Vittuone ancora fuori mappa

---

## 2. Watchlist (non in mappa)

| Nome | Note | Priorità |
| --- | --- | --- |
| Equinix ML3 (Basiglio), ML4, ML7x | Directory commerciali | Media |
| Data4 Vittuone / MIL02 | Solo menzione in dc_021 | Media |
| Cornaredo “DC12” (Equans / ETS) | Proponente finale unclear | Bassa |
| Core Stack / Green Arrow–Lazzari | Pipeline nazionale senza comuni LO | Watchlist |

---

## 3. Programmi strategici MIMIT — copertura

| Programma | Comuni | Copertura mappa |
| --- | --- | --- |
| Amazon Europe (Milan) | Rho/Pero, Zibido | dc_005 + dc_025 |
| Vantage (~8 mld) | Melegnano, Settimo, Cornaredo, Tavazzano | dc_022, 023, **039**, **034** |
| EdgeConneX Campus Italia | Opera, Pieve Emanuele, Bertonico | dc_027, **037**, **038** |
| Equinix per l’Italia | Settimo, Cusago | dc_006/007 + dc_026 |
| K2 Strategic | Zibido, Lacchiarella | dc_031 |
| Eni–Khazna | Ferrera Erbognone | **dc_036** |

---

## 4. Conteggio proliferazione (pin curati LO)

| Fascia | N |
| --- | ---: |
| operational | 10 |
| under_construction | 5 |
| planned | 10 |

Segnale geografico: ovest Milano (Cornaredo–Settimo–Cusago), sud-ovest (Noviglio–Zibido–Lacchiarella–Opera–Pieve), sud/est (Melegnano, Vignate), Lodigiano (Tavazzano, Bertonico), Pavese (Siziano, Bornasco, Ferrera Erbognone).

---

## 5. Prossimi passi

1. ~~UI: filtro/stile per `status`~~ (filtri Stato + silhouette pieno/cantiere/fantasma)
2. Raffinare coordinate dc_034 / 036 / 037–039 con atti/planimetrie
3. Hygiene Equinix IBX minori + Data4 Vittuone
4. Monitoraggio mensile: PU Regione + VIP MASE

---

## 6. Limiti

- Non esaustivo rispetto alle directory commerciali.
- Strategicità MIMIT ≠ VIA positiva ≠ permesso di costruire ≠ AIA.
- Wave 1–2 applicata il 2026-09-27 in `data_centers.geojson` → `npm run data:merge`.
