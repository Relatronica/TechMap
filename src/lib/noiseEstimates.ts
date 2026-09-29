/**
 * Stima rumore ambientale da data center (comunicazione civica, non relazione acustica).
 *
 * Modello: sorgente puntiforme a terra, campo semi-sferico:
 *   Lp ≈ Lw − 20·log10(r) − 8    (r in metri)
 * Isolinee inverse: r = 10^((Lw − Lp − 8) / 20)
 *
 * Lw di default = ordine di grandezza per scenario «prova gruppi di emergenza»
 * (non esercizio continuo HVAC). Sempre etichettare come Stima salvo dato dichiarato.
 */

import { destinationPoint, circlePolygon, isInLombardiaBbox } from './proximity';

export type NoiseScenario = 'emergency_test' | 'hvac_cooling' | 'mixed';
export type NoiseOrigin = 'declared' | 'estimated';

export type NoiseInput = {
  /** Livello di potenza sonora LwA (dB(A)) al sito / banco gruppi. */
  lw_dba?: number | null;
  scenario?: NoiseScenario | null;
  origin?: NoiseOrigin | null;
  note_it?: string;
  note_en?: string;
  /** Potenza termica backup dichiarata (MWt), se nota — scala la stima. */
  backup_mwt?: number | null;
};

export type NoiseContour = {
  lpDba: number;
  radiusM: number;
  radiusKm: number;
};

export type NoiseInsight = {
  origin: [number, number];
  lwDba: number;
  scenario: NoiseScenario;
  dataOrigin: NoiseOrigin;
  contours: NoiseContour[];
  /** Distanza a cui Lp scende a 55 dB(A) di notte (riferimento civico tipico). */
  distanceTo55m: number;
  note_it?: string;
  note_en?: string;
};

/** Contours shown on map (loud → quieter). */
export const NOISE_CONTOUR_DBA = [65, 55, 50, 45] as const;

const SPREAD_OFFSET_DB = 8; // hemispherical + ground

export function radiusMetersForLp(lwDba: number, lpDba: number): number {
  const exponent = (lwDba - lpDba - SPREAD_OFFSET_DB) / 20;
  const r = 10 ** exponent;
  // Clamp absurd extremes from extreme Lw
  return Math.min(Math.max(r, 15), 8000);
}

export function estimateLwDba(options: {
  subtype?: string | null;
  capacityMw?: number | null;
  backupMwt?: number | null;
}): number {
  const { subtype, capacityMw, backupMwt } = options;
  if (typeof backupMwt === 'number' && backupMwt > 0) {
    // Banco gruppi: scala lenta con MWt (ordine di grandezza, non somma energetica).
    return Math.min(122, Math.round(104 + 7 * Math.log10(Math.max(backupMwt, 8))));
  }
  if (subtype === 'hyperscale') {
    if (typeof capacityMw === 'number' && capacityMw >= 200) return 116;
    if (typeof capacityMw === 'number' && capacityMw >= 80) return 114;
    if (typeof capacityMw === 'number' && capacityMw >= 30) return 112;
    return 110;
  }
  if (subtype === 'colocation') {
    if (typeof capacityMw === 'number' && capacityMw >= 20) return 106;
    return 102;
  }
  return 100; // enterprise / unknown
}

export function resolveNoiseInput(
  noise: NoiseInput | null | undefined,
  site: { subtype?: string | null; capacityMw?: number | null }
): { lwDba: number; scenario: NoiseScenario; dataOrigin: NoiseOrigin; note_it?: string; note_en?: string } {
  const backup = typeof noise?.backup_mwt === 'number' ? noise.backup_mwt : null;
  if (typeof noise?.lw_dba === 'number' && noise.lw_dba > 0) {
    return {
      lwDba: noise.lw_dba,
      scenario: noise.scenario || 'emergency_test',
      dataOrigin: noise.origin || 'declared',
      note_it: noise.note_it,
      note_en: noise.note_en
    };
  }
  return {
    lwDba: estimateLwDba({
      subtype: site.subtype,
      capacityMw: site.capacityMw,
      backupMwt: backup
    }),
    scenario: noise?.scenario || 'emergency_test',
    dataOrigin: 'estimated',
    note_it: noise?.note_it,
    note_en: noise?.note_en
  };
}

export function computeNoiseInsight(
  lon: number,
  lat: number,
  options: {
    noise?: NoiseInput | null;
    subtype?: string | null;
    capacityMw?: number | null;
    /** If false, skip bbox gate (curated noise anywhere). Default: Lombardia-only for estimates. */
    force?: boolean;
  }
): NoiseInsight | null {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;

  const hasCuratedLw =
    typeof options.noise?.lw_dba === 'number' && (options.noise.lw_dba as number) > 0;
  const hasBackup =
    typeof options.noise?.backup_mwt === 'number' && (options.noise.backup_mwt as number) > 0;

  if (!options.force && !hasCuratedLw && !isInLombardiaBbox(lon, lat)) {
    return null;
  }
  // Still require Lombardia for pure heuristic unless curated
  if (!hasCuratedLw && !hasBackup && !isInLombardiaBbox(lon, lat) && !options.force) {
    return null;
  }

  const resolved = resolveNoiseInput(options.noise, {
    subtype: options.subtype,
    capacityMw: options.capacityMw
  });

  const contours: NoiseContour[] = NOISE_CONTOUR_DBA.map((lpDba) => {
    const radiusM = radiusMetersForLp(resolved.lwDba, lpDba);
    return {
      lpDba,
      radiusM,
      radiusKm: radiusM / 1000
    };
  });

  const distanceTo55m = radiusMetersForLp(resolved.lwDba, 55);

  return {
    origin: [lon, lat],
    lwDba: resolved.lwDba,
    scenario: resolved.scenario,
    dataOrigin: resolved.dataOrigin,
    contours,
    distanceTo55m,
    note_it: resolved.note_it,
    note_en: resolved.note_en
  };
}

function annulusPolygon(
  lon: number,
  lat: number,
  outerKm: number,
  innerKm: number,
  steps = 72
): GeoJSON.Polygon {
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    outer.push(destinationPoint(lon, lat, outerKm, bearing));
  }
  for (let i = steps; i >= 0; i--) {
    const bearing = (i / steps) * 2 * Math.PI;
    inner.push(destinationPoint(lon, lat, Math.max(innerKm, 0.01), bearing));
  }
  return { type: 'Polygon', coordinates: [outer, inner] };
}

export function noiseInsightToMapGeoJSON(insight: NoiseInsight): {
  bands: GeoJSON.FeatureCollection;
  outlines: GeoJSON.FeatureCollection;
  labels: GeoJSON.FeatureCollection;
} {
  const [lon, lat] = insight.origin;
  /** Opposite side from proximity ring labels (~55°) so they don't collide. */
  const labelBearing = (210 * Math.PI) / 180;

  // Quiet (large r) → loud (small r): outer annuli first
  const sorted = [...insight.contours].sort((a, b) => a.lpDba - b.lpDba);

  const bandFeatures: GeoJSON.Feature[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const outer = sorted[i];
    const next = sorted[i + 1];
    const geometry = next
      ? annulusPolygon(lon, lat, outer.radiusKm, next.radiusKm, 72)
      : circlePolygon(lon, lat, outer.radiusKm, 72);
    bandFeatures.push({
      type: 'Feature',
      geometry,
      properties: {
        lp_dba: outer.lpDba,
        radius_km: Math.round(outer.radiusKm * 100) / 100,
        band_index: i
      }
    });
  }

  const outlines: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.contours.map((c) => ({
      type: 'Feature',
      geometry: circlePolygon(lon, lat, c.radiusKm, 72),
      properties: {
        lp_dba: c.lpDba,
        radius_km: Math.round(c.radiusKm * 100) / 100,
        label: `${c.lpDba} dB(A)`
      }
    }))
  };

  const labels: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.contours.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: destinationPoint(lon, lat, c.radiusKm, labelBearing)
      },
      properties: {
        lp_dba: c.lpDba,
        label: `${c.lpDba} dB`
      }
    }))
  };

  return {
    bands: { type: 'FeatureCollection', features: bandFeatures },
    outlines,
    labels
  };
}
