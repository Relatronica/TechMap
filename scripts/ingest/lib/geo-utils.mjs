/** ISO 3166-1 alpha-3 → alpha-2 (EU focus + common map countries). */
export const ISO3_TO_ISO2 = {
  ITA: 'IT',
  DEU: 'DE',
  FRA: 'FR',
  ESP: 'ES',
  NLD: 'NL',
  BEL: 'BE',
  AUT: 'AT',
  POL: 'PL',
  SWE: 'SE',
  FIN: 'FI',
  DNK: 'DK',
  PRT: 'PT',
  GRC: 'GR',
  IRL: 'IE',
  CZE: 'CZ',
  ROU: 'RO',
  HUN: 'HU',
  BGR: 'BG',
  SVK: 'SK',
  HRV: 'HR',
  SVN: 'SI',
  LTU: 'LT',
  LVA: 'LV',
  EST: 'EE',
  LUX: 'LU',
  MLT: 'MT',
  CYP: 'CY',
  GBR: 'GB',
  NOR: 'NO',
  CHE: 'CH',
  USA: 'US',
  TWN: 'TW',
  AUS: 'AU',
  CHL: 'CL',
  COD: 'CD',
  CHN: 'CN',
  SRB: 'RS'
};

export const EU_ISO3 = new Set([
  'ITA', 'DEU', 'FRA', 'ESP', 'NLD', 'BEL', 'AUT', 'POL', 'SWE', 'FIN', 'DNK',
  'PRT', 'GRC', 'IRL', 'CZE', 'ROU', 'HUN', 'BGR', 'SVK', 'HRV', 'SVN', 'LTU',
  'LVA', 'EST', 'LUX', 'MLT', 'CYP', 'GBR', 'CHE', 'NOR'
]);

export function toIso2(code) {
  if (!code) return 'XX';
  const c = String(code).trim().toUpperCase();
  if (c.length === 2) return c;
  return ISO3_TO_ISO2[c] || c.slice(0, 2);
}

export function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function haversineKm(lon1, lat1, lon2, lat2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** True if two sites likely refer to the same facility. */
export function isDuplicate(a, b, kmThreshold = 2.5) {
  const [lonA, latA] = a.geometry.coordinates;
  const [lonB, latB] = b.geometry.coordinates;
  const dist = haversineKm(lonA, latA, lonB, latB);
  if (dist > kmThreshold) return false;

  const nameA = normalizeName(a.properties.name);
  const nameB = normalizeName(b.properties.name);
  if (nameA && nameB && (nameA.includes(nameB) || nameB.includes(nameA))) return true;

  const extA = a.properties.external_id;
  const extB = b.properties.external_id;
  if (extA && extB && extA === extB) return true;

  return dist <= 0.5;
}

export function confidenceRank(c) {
  return c === 'high' ? 3 : c === 'medium' ? 2 : c === 'low' ? 1 : 0;
}

/** Rough EU bboxes for OSM records missing addr:country (south, west, north, east).
 *  Order matters: more specific countries before broad neighbours (e.g. GB before FR). */
const COUNTRY_BBOXES = [
  { iso2: 'IT', south: 35.5, west: 6.5, north: 47.5, east: 18.5 },
  { iso2: 'GB', south: 49.8, west: -8.8, north: 61.0, east: 2.0 },
  { iso2: 'IE', south: 51.0, west: -11.0, north: 55.5, east: -5.5 },
  { iso2: 'FR', south: 41.0, west: -5.5, north: 51.2, east: 10.0 },
  { iso2: 'DE', south: 47.0, west: 5.5, north: 55.5, east: 15.5 },
  { iso2: 'ES', south: 36.0, west: -10.0, north: 44.0, east: 4.5 },
  { iso2: 'PT', south: 36.5, west: -10.0, north: 42.5, east: -6.0 },
  { iso2: 'NL', south: 50.5, west: 3.0, north: 53.7, east: 7.5 },
  { iso2: 'BE', south: 49.4, west: 2.5, north: 51.6, east: 6.5 },
  { iso2: 'SE', south: 55.0, west: 10.5, north: 69.5, east: 24.5 },
  { iso2: 'FI', south: 59.5, west: 19.0, north: 70.5, east: 32.0 },
  { iso2: 'NO', south: 57.5, west: 4.0, north: 71.5, east: 31.0 },
  { iso2: 'DK', south: 54.5, west: 8.0, north: 58.0, east: 15.5 },
  { iso2: 'PL', south: 49.0, west: 14.0, north: 55.0, east: 24.5 },
  { iso2: 'AT', south: 46.3, west: 9.5, north: 49.1, east: 17.5 },
  { iso2: 'CH', south: 45.7, west: 5.9, north: 47.9, east: 10.6 },
  { iso2: 'CZ', south: 48.5, west: 12.0, north: 51.2, east: 19.0 },
  { iso2: 'GR', south: 34.5, west: 19.0, north: 42.0, east: 29.5 }
];

export function inferCountryFromCoords(lon, lat) {
  for (const box of COUNTRY_BBOXES) {
    if (lat >= box.south && lat <= box.north && lon >= box.west && lon <= box.east) {
      return box.iso2;
    }
  }
  return 'XX';
}
