/**
 * Prossimità ai centri abitati (MVP Lombardia).
 * Distances from site pin to municipality centroids (ISTAT 2021).
 */

export const PROXIMITY_RADII_KM = [1, 5, 10] as const;
export const PROXIMITY_SEARCH_KM = 15;
export const PROXIMITY_MAX_LINKS = 5;

/** Approximate Lombardia bbox (WGS84). */
export const LOMBARDIA_BBOX = {
  west: 8.48,
  south: 44.68,
  east: 11.55,
  north: 46.65
} as const;

export type SettlementProps = {
  id: string;
  name: string;
  population: number;
  province?: string;
  istat_code?: string;
};

export type SettlementFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: SettlementProps;
};

export type NearbySettlement = SettlementProps & {
  distanceKm: number;
  lon: number;
  lat: number;
  isHost?: boolean;
};

export type ProximityInsight = {
  origin: [number, number];
  /** Matched from site `city` field when possible. */
  host: NearbySettlement | null;
  /** Nearest municipal centroid excluding the host comune. */
  nearestOther: NearbySettlement | null;
  /** @deprecated Prefer nearestOther; kept as alias for nearest other (or absolute nearest if no host). */
  nearest: NearbySettlement | null;
  /** Host (if any) + nearest others for map links/labels. */
  nearby: NearbySettlement[];
  /** Count of municipal centroids within each radius (not in-radius population). */
  comuniWithin: { radiusKm: number; count: number }[];
  ringsKm: readonly number[];
};

export function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function isInLombardiaBbox(lon: number, lat: number): boolean {
  return (
    lon >= LOMBARDIA_BBOX.west &&
    lon <= LOMBARDIA_BBOX.east &&
    lat >= LOMBARDIA_BBOX.south &&
    lat <= LOMBARDIA_BBOX.north
  );
}

export function normalizePlaceName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Destination point at distanceKm along bearingRad (from north, clockwise). */
export function destinationPoint(
  lon: number,
  lat: number,
  distanceKm: number,
  bearingRad: number
): [number, number] {
  const R = 6371;
  const δ = distanceKm / R;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(bearingRad)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
  return [(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI];
}

export function circlePolygon(
  lon: number,
  lat: number,
  radiusKm: number,
  steps = 64
): GeoJSON.Polygon {
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    ring.push(destinationPoint(lon, lat, radiusKm, bearing));
  }
  return { type: 'Polygon', coordinates: [ring] };
}

function cityNameCandidates(city: string): string[] {
  const full = normalizePlaceName(city);
  const parts = String(city)
    .split(/[/|,–—]+/)
    .map((p) => normalizePlaceName(p))
    .filter((p) => p.length >= 2);
  const out: string[] = [];
  if (full) out.push(full);
  for (const p of parts) {
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

function toNearby(
  f: SettlementFeature,
  lon: number,
  lat: number,
  extra?: { isHost?: boolean }
): NearbySettlement {
  const [slon, slat] = f.geometry.coordinates;
  return {
    ...f.properties,
    distanceKm: haversineKm(lon, lat, slon, slat),
    lon: slon,
    lat: slat,
    ...extra
  };
}

/** Match site city label to a Lombardia comune (search all, not only nearby). */
export function findHostSettlement(
  city: string | null | undefined,
  settlements: SettlementFeature[],
  lon: number,
  lat: number
): NearbySettlement | null {
  if (!city || !settlements?.length) return null;
  const candidates = cityNameCandidates(city);
  if (!candidates.length) return null;

  let best: SettlementFeature | null = null;
  let bestDist = Infinity;

  for (const f of settlements) {
    const n = normalizePlaceName(f.properties.name);
    let matched = false;
    for (const cand of candidates) {
      if (n === cand) {
        matched = true;
        break;
      }
      // Allow "settimo milanese" vs city "Settimo M." only on exact; soft contains for longer tokens
      if (cand.length >= 5 && (n.includes(cand) || cand.includes(n))) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;
    const [slon, slat] = f.geometry.coordinates;
    const d = haversineKm(lon, lat, slon, slat);
    // Prefer exact name equality, then closer centroid
    const exact = candidates.some((c) => c === n);
    if (!best) {
      best = f;
      bestDist = d;
      continue;
    }
    const bestExact = candidates.some((c) => c === normalizePlaceName(best.properties.name));
    if (exact && !bestExact) {
      best = f;
      bestDist = d;
    } else if (exact === bestExact && d < bestDist) {
      best = f;
      bestDist = d;
    }
  }

  return best ? toNearby(best, lon, lat, { isHost: true }) : null;
}

function formatDistanceLabel(km: number): string {
  if (km < 10) return (Math.round(km * 10) / 10).toString().replace(/\.0$/, '');
  return String(Math.round(km));
}

export function computeProximityInsight(
  lon: number,
  lat: number,
  settlements: SettlementFeature[],
  options?: {
    city?: string | null;
    searchKm?: number;
    radiiKm?: readonly number[];
    maxLinks?: number;
  }
): ProximityInsight | null {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (!isInLombardiaBbox(lon, lat)) return null;
  if (!settlements?.length) return null;

  const searchKm = options?.searchKm ?? PROXIMITY_SEARCH_KM;
  const radiiKm = options?.radiiKm ?? PROXIMITY_RADII_KM;
  const maxLinks = options?.maxLinks ?? PROXIMITY_MAX_LINKS;

  const host = findHostSettlement(options?.city, settlements, lon, lat);
  const hostId = host?.id || null;

  const ranked: NearbySettlement[] = [];
  for (const f of settlements) {
    if (hostId && f.properties.id === hostId) continue;
    const near = toNearby(f, lon, lat);
    if (near.distanceKm > searchKm) continue;
    ranked.push(near);
  }
  ranked.sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestOther = ranked[0] || null;
  const nearest = nearestOther || host;

  // For radius counts, include host centroid if within radius
  const forCounts: NearbySettlement[] = host ? [host, ...ranked] : ranked;
  const comuniWithin = radiiKm.map((radiusKm) => ({
    radiusKm,
    count: forCounts.filter((s) => s.distanceKm <= radiusKm).length
  }));

  const othersForMap = ranked.slice(0, host ? Math.max(0, maxLinks - 1) : maxLinks);
  const nearby = host ? [host, ...othersForMap] : othersForMap;

  return {
    origin: [lon, lat],
    host,
    nearestOther,
    nearest,
    nearby,
    comuniWithin,
    ringsKm: radiiKm
  };
}

export function insightToMapGeoJSON(insight: ProximityInsight): {
  rings: GeoJSON.FeatureCollection;
  ringLabels: GeoJSON.FeatureCollection;
  links: GeoJSON.FeatureCollection;
  settlements: GeoJSON.FeatureCollection;
} {
  const [lon, lat] = insight.origin;
  /** East-northeast on each ring so labels sit on the arc, not on the pin. */
  const labelBearing = (55 * Math.PI) / 180;

  const rings: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.ringsKm.map((radiusKm) => ({
      type: 'Feature',
      geometry: circlePolygon(lon, lat, radiusKm),
      properties: { radius_km: radiusKm }
    }))
  };

  const ringLabels: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.ringsKm.map((radiusKm) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: destinationPoint(lon, lat, radiusKm, labelBearing)
      },
      properties: {
        radius_km: radiusKm,
        label: `${radiusKm} km`
      }
    }))
  };

  const links: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.nearby.map((s, i) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [lon, lat],
          [s.lon, s.lat]
        ]
      },
      properties: {
        rank: i + 1,
        is_host: !!s.isHost,
        name: s.name,
        distance_km: Math.round(s.distanceKm * 10) / 10,
        population: s.population
      }
    }))
  };

  const settlements: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: insight.nearby.map((s, i) => {
      const distLabel = formatDistanceLabel(s.distanceKm);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
        properties: {
          rank: i + 1,
          is_host: !!s.isHost,
          name: s.name,
          population: s.population,
          distance_km: Math.round(s.distanceKm * 10) / 10,
          label: `${s.name} · ${distLabel} km`,
          province: s.province || ''
        }
      };
    })
  };

  return { rings, ringLabels, links, settlements };
}
