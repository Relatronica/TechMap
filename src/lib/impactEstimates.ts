/**
 * Fattori e helper per stime di impatto (comunicazione civica, non bilanci ufficiali).
 *
 * Fonti indicative:
 * - Intensità carbonica rete: ordine di grandezza EEA / ISPRA (kgCO₂/kWh)
 * - Consumo domestico elettrico: medie nazionali approximate
 * - Acqua DC: ordine di grandezza L/kWh per raffreddamento evaporativo tipico
 * - Capacity factor impianti: valori medi di settore
 *
 * Ogni stima in UI va etichettata come "Stima" e non come misura dichiarata.
 */

export type SiteKind = 'data_center' | 'energy_plant' | 'raw_material';

export const IMPACT_FACTORS = {
  hoursPerYear: 8760,
  /** Fattore di carico tipico IT load per campus DC (non idle). */
  dcLoadFactor: 0.65,
  /** Consumo elettrico domestico medio (MWh/anno per abitazione). */
  householdMwhYear: {
    IT: 2.7,
    DE: 3.1,
    FR: 5.5,
    ES: 3.5,
    NL: 3.0,
    IE: 4.2,
    SE: 7.0,
    FI: 8.0,
    DK: 3.5,
    GB: 3.5,
    DEFAULT: 3.5
  } as Record<string, number>,
  /** Intensità carbonica della rete elettrica (kg CO₂ / kWh). */
  gridKgPerKwh: {
    IT: 0.266,
    DE: 0.366,
    FR: 0.058,
    ES: 0.17,
    NL: 0.328,
    IE: 0.336,
    SE: 0.013,
    FI: 0.079,
    DK: 0.12,
    GB: 0.207,
    NO: 0.02,
    CH: 0.03,
    AT: 0.12,
    PL: 0.66,
    DEFAULT: 0.25
  } as Record<string, number>,
  /** Litri d'acqua per kWh IT tipici (raffreddamento evaporativo / ibrido). */
  waterLPerKwhDc: 1.8,
  /** Capacity factor medi per tipologia impianto. */
  energyCapacityFactor: {
    gas: 0.45,
    solar: 0.14,
    wind: 0.28,
    hydro: 0.4,
    nuclear: 0.85
  } as Record<string, number>,
  /** Emissioni operative tipiche (tCO₂ / MWh prodotto). */
  energyCo2TPerMwh: {
    gas: 0.35,
    solar: 0,
    wind: 0,
    hydro: 0,
    nuclear: 0
  } as Record<string, number>
} as const;

export interface ImpactInput {
  capacity_mw?: number | null;
  power_draw_mw_est?: number | null;
  pue?: number | null;
  water_use_m3_year?: number | null;
  land_ha?: number | null;
  co2_t_year_est?: number | null;
  energy_mix_note_it?: string;
}

export interface ImpactCardModel {
  id: string;
  value: number;
  unit: string;
  /** declared = presente nel dataset; estimated = derivato da fattori */
  origin: 'declared' | 'estimated';
  /** Equivalenza umana opzionale (es. famiglie) */
  equiv?: { value: number; kind: 'households' | 'pools' };
}

export interface ImpactModel {
  capacityMw: number | null;
  cards: ImpactCardModel[];
  energyMixNote?: string;
  disclaimerKey: 'impact_disclaimer';
}

function lookup(map: Record<string, number>, country?: string | null): number {
  const key = String(country || '').toUpperCase();
  return map[key] ?? map.DEFAULT;
}

/** Estrae MW da impact o dalla stringa capacity display. */
export function resolveCapacityMw(
  impact?: ImpactInput | null,
  capacityLabel?: string | null
): number | null {
  const fromImpact = impact?.capacity_mw ?? impact?.power_draw_mw_est;
  if (typeof fromImpact === 'number' && Number.isFinite(fromImpact) && fromImpact > 0) {
    return fromImpact;
  }
  const raw = String(capacityLabel || '');
  if (!raw || /n\/d|nazionale|mq|sqft|sq\s*ft/i.test(raw)) return null;
  const m = raw.match(/([\d]+(?:[.,]\d+)?)\s*\+?\s*MW/i);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function buildImpactModel(options: {
  impact?: ImpactInput | null;
  capacityLabel?: string | null;
  country?: string | null;
  siteKind: SiteKind;
  subtype?: string | null;
}): ImpactModel {
  const { impact, capacityLabel, country, siteKind, subtype } = options;
  const capacityMw = resolveCapacityMw(impact, capacityLabel);
  const drawMw =
    typeof impact?.power_draw_mw_est === 'number' && impact.power_draw_mw_est > 0
      ? impact.power_draw_mw_est
      : capacityMw;
  const cards: ImpactCardModel[] = [];

  if (capacityMw != null) {
    cards.push({
      id: 'power',
      value: capacityMw,
      unit: 'MW',
      origin: impact?.capacity_mw != null || impact?.power_draw_mw_est != null ? 'declared' : 'estimated'
    });
  }

  // Energia annua + equivalenza famiglie
  if (drawMw != null) {
    let mwhYear: number | null = null;
    let origin: 'declared' | 'estimated' = 'estimated';

    if (siteKind === 'data_center') {
      const pue = typeof impact?.pue === 'number' && impact.pue > 1 ? impact.pue : 1.4;
      mwhYear = drawMw * IMPACT_FACTORS.hoursPerYear * IMPACT_FACTORS.dcLoadFactor * pue;
    } else if (siteKind === 'energy_plant') {
      const cf =
        IMPACT_FACTORS.energyCapacityFactor[String(subtype || '')] ?? 0.4;
      mwhYear = drawMw * IMPACT_FACTORS.hoursPerYear * cf;
    }

    if (mwhYear != null && mwhYear > 0) {
      const households = mwhYear / lookup(IMPACT_FACTORS.householdMwhYear, country);
      cards.push({
        id: 'electricity',
        value: Math.round(mwhYear),
        unit: 'MWh/anno',
        origin,
        equiv: { value: Math.round(households), kind: 'households' }
      });

      // CO₂: dichiarata se presente, altrimenti stima
      if (typeof impact?.co2_t_year_est === 'number' && impact.co2_t_year_est >= 0) {
        cards.push({
          id: 'co2',
          value: Math.round(impact.co2_t_year_est),
          unit: 't/anno',
          origin: 'declared'
        });
      } else if (siteKind === 'data_center') {
        const kgPerKwh = lookup(IMPACT_FACTORS.gridKgPerKwh, country);
        // 1 MWh × (kg CO₂/kWh) = t CO₂
        cards.push({
          id: 'co2',
          value: Math.round(mwhYear * kgPerKwh),
          unit: 't/anno',
          origin: 'estimated'
        });
      } else if (siteKind === 'energy_plant') {
        const factor = IMPACT_FACTORS.energyCo2TPerMwh[String(subtype || '')];
        if (typeof factor === 'number') {
          cards.push({
            id: 'co2',
            value: Math.round(mwhYear * factor),
            unit: 't/anno',
            origin: 'estimated'
          });
        }
      }

      // Acqua: dichiarata o stima solo per DC
      if (typeof impact?.water_use_m3_year === 'number' && impact.water_use_m3_year >= 0) {
        cards.push({
          id: 'water',
          value: Math.round(impact.water_use_m3_year),
          unit: 'm³/anno',
          origin: 'declared'
        });
      } else if (siteKind === 'data_center') {
        // L/kWh → m³: mwh * 1000 kWh * L/kWh / 1000 = mwh * L/kWh
        const m3 = Math.round(mwhYear * IMPACT_FACTORS.waterLPerKwhDc);
        cards.push({
          id: 'water',
          value: m3,
          unit: 'm³/anno',
          origin: 'estimated'
        });
      }
    }
  } else {
    // Senza MW: mostra solo metriche dichiarate
    if (typeof impact?.water_use_m3_year === 'number') {
      cards.push({
        id: 'water',
        value: Math.round(impact.water_use_m3_year),
        unit: 'm³/anno',
        origin: 'declared'
      });
    }
    if (typeof impact?.co2_t_year_est === 'number') {
      cards.push({
        id: 'co2',
        value: Math.round(impact.co2_t_year_est),
        unit: 't/anno',
        origin: 'declared'
      });
    }
  }

  if (typeof impact?.land_ha === 'number' && impact.land_ha > 0) {
    cards.push({
      id: 'land',
      value: impact.land_ha,
      unit: 'ha',
      origin: 'declared'
    });
  }

  if (typeof impact?.pue === 'number' && impact.pue > 0) {
    cards.push({
      id: 'pue',
      value: impact.pue,
      unit: 'PUE',
      origin: 'declared'
    });
  }

  return {
    capacityMw,
    cards,
    energyMixNote: impact?.energy_mix_note_it,
    disclaimerKey: 'impact_disclaimer'
  };
}
