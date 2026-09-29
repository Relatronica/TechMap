import type { Map as MaplibreMap } from 'maplibre-gl';
import { LngLatBounds } from 'maplibre-gl';

const BOUNDARY_SOURCE = 'place-boundary';
const BOUNDARY_FILL = 'place-boundary-fill';
const BOUNDARY_LINE = 'place-boundary-line';

type AnyGeometry = {
  type: string;
  coordinates?: unknown;
  geometries?: AnyGeometry[];
};

type GeoJsonFeature = {
  type: 'Feature';
  properties?: Record<string, unknown>;
  geometry: AnyGeometry;
};

type RegionFeature = GeoJsonFeature & {
  properties: {
    name: string;
    aliases?: string[];
    istat?: string;
    iso?: string;
  };
};

let regionsCache: RegionFeature[] | null = null;
let regionsLoading: Promise<RegionFeature[] | null> | null = null;

function emptyFc(): { type: 'FeatureCollection'; features: GeoJsonFeature[] } {
  return { type: 'FeatureCollection', features: [] };
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function loadItalianRegions(): Promise<RegionFeature[] | null> {
  if (regionsCache) return regionsCache;
  if (regionsLoading) return regionsLoading;
  regionsLoading = fetch('/data/overlays/it_regions.geojson')
    .then(async (res) => {
      if (!res.ok) throw new Error('it_regions ' + res.status);
      const data = await res.json();
      regionsCache = Array.isArray(data?.features) ? data.features : [];
      return regionsCache;
    })
    .catch(() => {
      regionsCache = null;
      return null;
    })
    .finally(() => {
      regionsLoading = null;
    });
  return regionsLoading;
}

function ensureBoundaryLayers(map: MaplibreMap) {
  if (!map.getSource(BOUNDARY_SOURCE)) {
    map.addSource(BOUNDARY_SOURCE, {
      type: 'geojson',
      data: emptyFc() as never
    });
  }

  // Keep the highlight under site pins but above context overlays when possible
  const beforeId = map.getLayer('connections-powers')
    ? 'connections-powers'
    : map.getLayer('data-centers-layer')
      ? 'data-centers-layer'
      : undefined;

  if (!map.getLayer(BOUNDARY_FILL)) {
    map.addLayer(
      {
        id: BOUNDARY_FILL,
        type: 'fill',
        source: BOUNDARY_SOURCE,
        paint: {
          'fill-color': '#c9a45c',
          'fill-opacity': 0.12
        }
      },
      beforeId
    );
  }

  if (!map.getLayer(BOUNDARY_LINE)) {
    map.addLayer(
      {
        id: BOUNDARY_LINE,
        type: 'line',
        source: BOUNDARY_SOURCE,
        paint: {
          'line-color': '#c9a45c',
          'line-width': 2.2,
          'line-opacity': 0.9
        }
      },
      beforeId
    );
  }
}

function setBoundaryFeature(map: MaplibreMap, feature: GeoJsonFeature | null) {
  ensureBoundaryLayers(map);
  const source = map.getSource(BOUNDARY_SOURCE) as
    | { setData: (data: { type: 'FeatureCollection'; features: GeoJsonFeature[] }) => void }
    | undefined;
  if (!source?.setData) return;
  source.setData(
    feature
      ? { type: 'FeatureCollection', features: [feature] }
      : emptyFc()
  );
}

/** Clear the temporary place-boundary highlight (region outline). */
export function clearPlaceBoundary(map: MaplibreMap) {
  if (!map.getSource(BOUNDARY_SOURCE)) return;
  setBoundaryFeature(map, null);
}

function boundsFromGeometry(geometry: AnyGeometry): LngLatBounds | null {
  const bounds = new LngLatBounds();
  let any = false;

  const extend = (coords: unknown) => {
    if (!Array.isArray(coords) || coords.length === 0) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      bounds.extend([coords[0] as number, coords[1] as number]);
      any = true;
      return;
    }
    for (const c of coords) extend(c);
  };

  if (geometry.type === 'GeometryCollection' && geometry.geometries) {
    for (const g of geometry.geometries) {
      const nested = boundsFromGeometry(g);
      if (nested) {
        bounds.extend(nested.getSouthWest());
        bounds.extend(nested.getNorthEast());
        any = true;
      }
    }
  } else if (geometry.coordinates) {
    extend(geometry.coordinates);
  }

  return any ? bounds : null;
}

/** Comune / città — non deve attivare l’overlay regione via state nell’indirizzo. */
function isLocalityResult(item: Record<string, unknown>) {
  const addresstype = String(item.addresstype || '');
  const cls = String(item.class || '');
  const type = String(item.type || '');
  if (cls === 'place') {
    return ['city', 'town', 'village', 'hamlet', 'suburb', 'municipality', 'locality'].includes(
      type
    );
  }
  return ['city', 'town', 'village', 'hamlet', 'municipality', 'locality'].includes(addresstype);
}

function isRegionLevelResult(item: Record<string, unknown>) {
  const addresstype = String(item.addresstype || '');
  return addresstype === 'state' || addresstype === 'region';
}

function isItalianAdminResult(item: Record<string, unknown>) {
  const address = (item.address || {}) as Record<string, string>;
  const countryCode = (address.country_code || '').toLowerCase();
  if (countryCode && countryCode !== 'it') return false;

  const addresstype = String(item.addresstype || '');
  const cls = String(item.class || '');
  const type = String(item.type || '');
  if (isLocalityResult(item)) return false;
  if (cls === 'boundary' || type === 'administrative') return true;
  return ['state', 'region', 'province', 'county'].includes(addresstype);
}

function matchItalianRegion(
  item: Record<string, unknown>,
  regions: RegionFeature[]
): RegionFeature | null {
  if (isLocalityResult(item)) return null;
  if (!isItalianAdminResult(item) && !isRegionLevelResult(item)) {
    const address = (item.address || {}) as Record<string, string>;
    const countryCode = (address.country_code || '').toLowerCase();
    if (countryCode && countryCode !== 'it') return null;
    // Solo risultati il cui nome principale è una regione (es. "Lombardia" da Nominatim)
    const primary = normalizeName(
      String(item.name || (typeof item.display_name === 'string' ? item.display_name.split(',')[0] : ''))
    );
    if (!primary) return null;
    for (const region of regions) {
      const names = [region.properties.name, ...(region.properties.aliases || [])].map(
        normalizeName
      );
      if (names.includes(primary) || names.some((n) => primary === n || primary.includes(n))) {
        return region;
      }
    }
    return null;
  }

  const address = (item.address || {}) as Record<string, string>;
  const candidates = [
    item.name,
    ...(isRegionLevelResult(item) ? [address.state, address.region] : []),
    ...(String(item.addresstype) === 'province' || String(item.addresstype) === 'county'
      ? [address.province]
      : []),
    typeof item.display_name === 'string' ? item.display_name.split(',')[0] : null
  ]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map(normalizeName);

  if (!candidates.length) return null;

  for (const region of regions) {
    const names = [region.properties.name, ...(region.properties.aliases || [])].map(
      normalizeName
    );
    if (candidates.some((c) => names.includes(c))) return region;
  }

  // Partial: "Lombardia, Italia" style already covered; also "Regione Lombardia"
  for (const region of regions) {
    const names = [region.properties.name, ...(region.properties.aliases || [])].map(
      normalizeName
    );
    if (candidates.some((c) => names.some((n) => c === n || c.includes(n) || n.includes(c)))) {
      return region;
    }
  }

  return null;
}

async function fetchNominatimPolygon(
  item: Record<string, unknown>,
  signal?: AbortSignal
): Promise<GeoJsonFeature | null> {
  const osmType = String(item.osm_type || '');
  const osmId = item.osm_id;
  if (!osmType || osmId == null) return null;
  const prefix = osmType === 'relation' ? 'R' : osmType === 'way' ? 'W' : osmType === 'node' ? 'N' : '';
  if (!prefix) return null;

  const url = new URL('https://nominatim.openstreetmap.org/lookup');
  url.searchParams.set('osm_ids', `${prefix}${osmId}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('polygon_geojson', '1');

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.geojson) return null;
  return {
    type: 'Feature',
    properties: {
      name: row.display_name || item.name || '',
      source: 'nominatim'
    },
    geometry: row.geojson
  };
}

/** Nominatim place search for the map chrome. */
export function initPlaceSearch(map: MaplibreMap) {
  const root = document.getElementById('map-search');
  const form = document.getElementById('map-search-form');
  const input = document.getElementById('map-search-input') as HTMLInputElement | null;
  const clearBtn = document.getElementById('map-search-clear');
  const resultsEl = document.getElementById('map-search-results');
  const statusEl = document.getElementById('map-search-status');
  if (!root || !form || !input || !clearBtn || !resultsEl || !statusEl) return;

  const searchRoot = root;
  const searchForm = form;
  const searchInput = input;
  const searchClear = clearBtn;
  const searchResults = resultsEl;
  const searchStatus = statusEl;

  const msgSearching = searchRoot.dataset.msgSearching || 'Cerco…';
  const msgEmpty = searchRoot.dataset.msgEmpty || 'Nessun risultato';
  const msgError = searchRoot.dataset.msgError || 'Ricerca non disponibile';

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abortCtrl: AbortController | null = null;
  let boundaryAbort: AbortController | null = null;
  let activeIndex = -1;
  let currentResults: Record<string, unknown>[] = [];

  // Warm the regions file in the background (non-blocking)
  void loadItalianRegions();

  function setStatus(text: string) {
    if (!text) {
      searchStatus.hidden = true;
      searchStatus.textContent = '';
      return;
    }
    searchStatus.hidden = false;
    searchStatus.textContent = text;
  }

  function clearResults() {
    currentResults = [];
    activeIndex = -1;
    searchResults.innerHTML = '';
    searchResults.hidden = true;
  }

  function closeSearchUi() {
    clearResults();
    setStatus('');
  }

  function syncClearBtn() {
    searchClear.hidden = searchInput.value.trim().length === 0;
  }

  function finishNavigation() {
    closeSearchUi();
    searchInput.blur();
    document.body.classList.remove('search-open');
    const searchToggleBtn = document.getElementById('map-search-toggle');
    if (searchToggleBtn) searchToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function labelForResult(item: Record<string, unknown>) {
    const addr = (item.address || {}) as Record<string, string>;
    const name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state ||
      addr.region ||
      addr.country ||
      (item.name as string) ||
      String(item.display_name || '').split(',')[0];
    const parts = [addr.state || addr.region, addr.country].filter(Boolean);
    const unique = parts.filter((p) => p && p !== name);
    return {
      name: name || String(item.display_name || ''),
      meta: unique.join(' · ')
    };
  }

  function fitToBoundingBox(item: Record<string, unknown>) {
    const bb = item.boundingbox as string[] | undefined;
    if (bb && bb.length === 4) {
      const south = parseFloat(bb[0]);
      const north = parseFloat(bb[1]);
      const west = parseFloat(bb[2]);
      const east = parseFloat(bb[3]);
      if ([south, north, west, east].every(Number.isFinite)) {
        map.fitBounds(
          [
            [west, south],
            [east, north]
          ],
          { padding: { top: 56, bottom: 96, left: 56, right: 56 }, maxZoom: 12, duration: 1200 }
        );
        return true;
      }
    }
    const lon = parseFloat(String(item.lon));
    const lat = parseFloat(String(item.lat));
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      map.flyTo({ center: [lon, lat], zoom: 10, duration: 1200 });
      return true;
    }
    return false;
  }

  async function showBoundaryForResult(item: Record<string, unknown>): Promise<boolean> {
    if (boundaryAbort) boundaryAbort.abort();
    boundaryAbort = new AbortController();
    const signal = boundaryAbort.signal;

    const locality = isLocalityResult(item);

    const regions = await loadItalianRegions();
    if (signal.aborted) return false;

    if (regions && !locality) {
      const matched = matchItalianRegion(item, regions);
      if (matched) {
        setBoundaryFeature(map, matched);
        const bounds = boundsFromGeometry(matched.geometry);
        if (bounds) {
          map.fitBounds(bounds, {
            padding: { top: 56, bottom: 96, left: 56, right: 56 },
            maxZoom: 9,
            duration: 1200
          });
          return true;
        }
      }
    }

    // Comune / confini admin (province, confini OSM): poligono Nominatim se disponibile
    if (
      locality ||
      isItalianAdminResult(item) ||
      String(item.class) === 'boundary'
    ) {
      try {
        const poly = await fetchNominatimPolygon(item, signal);
        if (signal.aborted) return false;
        if (poly) {
          setBoundaryFeature(map, poly);
          const bounds = boundsFromGeometry(poly.geometry);
          if (bounds) {
            map.fitBounds(bounds, {
              padding: { top: 56, bottom: 96, left: 56, right: 56 },
              maxZoom: 11,
              duration: 1200
            });
            return true;
          }
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return false;
      }
    }

    clearPlaceBoundary(map);
    return false;
  }

  async function goToResult(item: Record<string, unknown> | undefined) {
    if (!item) return;
    const hadBoundary = await showBoundaryForResult(item);
    if (!hadBoundary) {
      fitToBoundingBox(item);
    }
    finishNavigation();
  }

  function renderResults(items: Record<string, unknown>[]) {
    currentResults = items;
    activeIndex = items.length ? 0 : -1;
    searchResults.innerHTML = '';
    if (!items.length) {
      searchResults.hidden = true;
      return;
    }
    items.forEach((item, index) => {
      const { name, meta } = labelForResult(item);
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-search-option' + (index === 0 ? ' is-active' : '');
      btn.dataset.index = String(index);
      btn.innerHTML =
        `<span class="map-search-option-name"></span>` +
        (meta ? `<span class="map-search-option-meta"></span>` : '');
      const nameEl = btn.querySelector('.map-search-option-name');
      if (nameEl) nameEl.textContent = name;
      const metaEl = btn.querySelector('.map-search-option-meta');
      if (metaEl) metaEl.textContent = meta;
      btn.addEventListener('click', () => {
        void goToResult(item);
      });
      li.appendChild(btn);
      searchResults.appendChild(li);
    });
    searchResults.hidden = false;
  }

  function setActiveOption(index: number) {
    const options = searchResults.querySelectorAll('.map-search-option');
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((el, i) => el.classList.toggle('is-active', i === activeIndex));
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  async function runSearch(query: string) {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    setStatus(msgSearching);
    clearResults();
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '6');
      url.searchParams.set('accept-language', 'it');
      // Preferenza Europa (viewbox) senza esclusione stretta
      url.searchParams.set('viewbox', '-12,72,45,34');
      url.searchParams.set('bounded', '0');

      const res = await fetch(url.toString(), {
        signal: abortCtrl.signal,
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('nominatim ' + res.status);
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      if (!items.length) {
        setStatus(msgEmpty);
        return;
      }
      setStatus('');
      renderResults(items);
    } catch (err) {
      if (err && (err as { name?: string }).name === 'AbortError') return;
      setStatus(msgError);
    }
  }

  function scheduleSearch() {
    const q = searchInput.value.trim();
    syncClearBtn();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      if (abortCtrl) abortCtrl.abort();
      closeSearchUi();
      return;
    }
    debounceTimer = setTimeout(() => {
      void runSearch(q);
    }, 380);
  }

  searchInput.addEventListener('input', scheduleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveOption(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveOption(activeIndex - 1);
    } else if (e.key === 'Escape') {
      closeSearchUi();
      searchInput.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        void goToResult(currentResults[activeIndex]);
      } else if (searchInput.value.trim().length >= 2) {
        void runSearch(searchInput.value.trim());
      }
    }
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && currentResults[activeIndex]) {
      void goToResult(currentResults[activeIndex]);
    } else if (searchInput.value.trim().length >= 2) {
      void runSearch(searchInput.value.trim());
    }
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    syncClearBtn();
    closeSearchUi();
    clearPlaceBoundary(map);
    searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!searchRoot.contains(e.target as Node)) closeSearchUi();
  });
}
