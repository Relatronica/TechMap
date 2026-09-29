# Inventario data center — Lombardia

Snapshot editoriale (aggiornato 2026-09-29 dopo Wave 3). Non è un dataset servito dalla mappa:
traccia copertura vs candidati e il racconto proliferazione (operativi vs pipeline).

**Ambito:** regione Lombardia (cluster Milano + Lodigiano + Bergamasco + Pavese).  
**Fonti primarie da monitorare:**
- MIMIT — programmi di preminente interesse strategico nazionale ([grandi programmi](https://www.mimit.gov.it/it/caie/unita-di-missione/grandi-programmi-di-investimento))
- MASE — portale VIA (`va.mite.gov.it`)
- Regione Lombardia — [Procedimento Unico Centri Dati](https://www.regione.lombardia.it/ambiente-e-territorio/autorizzazione-ambientali/autorizzazione-integrata-ambientale-aia/procedimento-unico-centri-dati) (tabella “procedimenti in corso” ancora vuota al 2026-09-27; LR 11/2026 + dgr 6645/6646)

---

## 1. In mappa — Lombardia (34 pin curati)

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
| dc_021 | Data4 MIL01 | Cornaredo | operational | ≠ Vantage Cornaredo; ≠ MIL02 |
| dc_022 | Vantage MXP1 | Melegnano | under_construction | ≠ Hscale MXP1 |
| dc_023 | Vantage MXP2 | Castelletto / Settimo M. | under_construction | ≠ Hscale MXP2 |
| dc_024 | Microsoft Azure Noviglio | Noviglio | under_construction | |
| dc_025 | AWS Zibido San Giacomo | Zibido S.G. | planned | VIA |
| dc_026 | Equinix Cusago / Settimo (espansione) | Cusago | planned | |
| dc_027 | EdgeConneX Opera | Opera | planned | Split: +dc_037/038 |
| dc_031 | K2 Zibido / Lacchiarella | Lacchiarella | planned | |
| dc_032 | Microsoft San Bovio | Peschiera Borromeo | under_construction | |
| dc_033 | Microsoft Bornasco | Bornasco (PV) | under_construction | |
| dc_034 | Vantage MXP4 Tavazzano | Tavazzano / Montanaso | planned | Pin allineato TTEP (ep_018) |
| dc_035 | MIL05 Vignate | Vignate | planned | VIA+ DM 411/2026 |
| dc_036 | Eni–Khazna AI Campus | Ferrera Erbognone | planned | ~500 MW IT |
| dc_037 | EdgeConneX Pieve Emanuele | Pieve Emanuele | planned | Pin Fizzonasco |
| dc_038 | EdgeConneX Bertonico | Bertonico (LO) | planned | |
| dc_039 | Vantage Cornaredo | Cornaredo | planned | ≠ Data4 MIL01 |
| dc_040 | Microsoft MIL03 | Settimo Milanese | under_construction | |
| dc_041 | Apto Lacchiarella | Lacchiarella | planned | |
| dc_042 | Equinix ML7 / ML8 | Castelletto | under_construction | |
| dc_044 | Hscale MXP1 | Arluno | planned | **Wave 3** ≠ Vantage MXP1 |
| dc_045 | Hscale MXP2 | Settimo (NO MI) | planned | **Wave 3** ≠ Vantage MXP2; pin comunale |
| dc_046 | CyrusOne MIL1 | Segrate | under_construction | **Wave 3** |
| dc_048 | Equinix ML3 | Basiglio | operational | **Wave 3** |
| dc_049 | Equinix ML4 | Milano (Cascia) | operational | **Wave 3** |
| dc_050 | Data4 MIL02 | Vittuone | under_construction | **Wave 3** |

### Naming collision MXP*

| Codice | Vantage | Hscale |
| --- | --- | --- |
| MXP1 | Melegnano (`dc_022`) | Arluno (`dc_044`) |
| MXP2 | Castelletto / Settimo (`dc_023`) | Settimo NO MI (`dc_045`) |

### Debiti residui
- Coordinate approximate: dc_045 (comune Settimo), dc_036 (sito GDC Eni), dc_037–039 (frazione/comune), dc_050 (strada Pascoli)
- Capacità a volte di programma, non di sito (EdgeConneX, alcuni Vantage, Hscale MXP2 pin)
- SE di allaccio Hscale / CyrusOne non nominate in fonti aperte → nessun arco `connects` in Wave 3

---

## 2. Watchlist (non in mappa)

| Nome | Note | Priorità |
| --- | --- | --- |
| Cornaredo “DC12” (Equans / ETS) | Proponente finale unclear | Bassa |
| Core Stack / Green Arrow–Lazzari | Pipeline nazionale senza comuni LO | Watchlist |
| NTT / Compass / CloudHQ wholesale MI | Directory commerciali | Media |
| CyrusOne MIL2 | Annunciato secondo sito MI | Watchlist |

---

## 3. Programmi strategici MIMIT — copertura

| Programma | Comuni | Copertura mappa |
| --- | --- | --- |
| Amazon Europe (Milan) | Rho/Pero, Zibido | dc_005 + dc_025 |
| Vantage (~8 mld) | Melegnano, Settimo, Cornaredo, Tavazzano | dc_022, 023, **039**, **034** |
| EdgeConneX Campus Italia | Opera, Pieve Emanuele, Bertonico | dc_027, **037**, **038** |
| Equinix per l’Italia | Settimo, Cusago, Basiglio, Milano | dc_006/007 + dc_026 + **048** + **049** + dc_042 |
| K2 Strategic | Zibido, Lacchiarella | dc_031 |
| Eni–Khazna | Ferrera Erbognone | **dc_036** |
| Hscale (~250 MW) | Arluno, Settimo NO | **dc_044** + **dc_045** |
| CyrusOne MIL1 | Segrate | **dc_046** |
| Data4 Vittuone | Vittuone | **dc_050** |

---

## 4. Conteggio proliferazione (pin curati LO)

| Fascia | N |
| --- | ---: |
| operational | 12 |
| under_construction | 9 |
| planned | 13 |

Segnale geografico: ovest Milano (Cornaredo–Settimo–Cusago–Arluno–Vittuone), sud-ovest (Noviglio–Zibido–Lacchiarella–Opera–Pieve), sud/est (Melegnano, Vignate, Segrate), Lodigiano (Tavazzano, Bertonico), Pavese (Siziano, Bornasco, Ferrera Erbognone), Basiglio (ML3).

---

## 5. Fuori Lombardia — Wave 3 + Wave 4

### Wave 3
| id | Nome | Note |
| --- | --- | --- |
| dc_047 | Equinix GN1 Genova | PPA Neoen; arco `conn_058` powers likely |
| dc_051 | Rai Way Pomezia / Santa Palomba | Hyperscale ~35 MW; prep area set 2026 |

### Wave 4 — secondo polo Roma / Lazio
| id | Nome | Status | Note |
| --- | --- | --- | --- |
| dc_052 | Retelit RMLET Letteratura | operational | EUR |
| dc_053 | Retelit Cornelia | operational | ~0,3 MW |
| dc_054 | Retelit Perrier | operational | |
| dc_055 | TIM Noovle Acilia | operational | TIER IV Uptime |
| dc_056 | TIM Noovle Oriolo Romano | operational | |
| dc_057 | Seeweb Frosinone | operational | |

### Wave 4 — Torino / Nord-Est / rete Retelit
| id | Nome | Status | Note |
| --- | --- | --- | --- |
| dc_058 | CSI Piemonte Torino | operational | PA / TIA-942 R3 |
| dc_059 | Naquadria Piacenza | operational | dark fiber → Caldera |
| dc_060 | Planetel Edge Padova | under_construction | RFS ott 2026 |
| dc_061 | Retelit Trento | operational | |
| dc_062 | Retelit Bolzano | operational | |

Archi `inferred` esistenti **non** rimossi in Wave 3–4. Nessun nuovo arco filiera in Wave 4 (manca evidence STMG/PPA sito-sito).

---

## 6. Prossimi passi

1. Raffinare lotto Hscale MXP2 e Data4 Vittuone con atti/VIA
2. SE nominate Hscale / CyrusOne → eventuali `connects`
3. Monitoraggio mensile: PU Regione + VIP MASE
4. ~~Wave 5: eolico oltre WRI; Sparkle/Retelit; MIX/NaMeX~~ (2026-09-29)
5. Wave 6 (fuori scope): filtro OSM low-confidence; edge MIX Roma; Retelit Settimo ex-BT / Bisceglie

---

## 7. Limiti

- Non esaustivo rispetto alle directory commerciali.
- Strategicità MIMIT ≠ VIA positiva ≠ permesso di costruire ≠ AIA.
- Wave 3–5 applicate il 2026-09-29 in curated → `npm run data:merge`.

### Wave 5 — snapshot
| Ambito | ID | Note |
| --- | --- | --- |
| Eolico | ep_021–025 | Troia, Mazara, Camporeale ERG, Castiglione, Schiavi; ep_012 aggiornato come portfolio |
| Sparkle / Retelit | dc_063–065 | Sicily Hub, Genova; Corsico Retelit; deal MEF+Retelit in closing |
| IX | dc_066–067 | MIX Caldera + NaMeX Tizii; `conn_059` MIX↔Avalon confirmed |
