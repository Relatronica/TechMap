import type { Map as MaplibreMap } from 'maplibre-gl';

/** Nominatim place search for the map chrome. */
export function initPlaceSearch(map: MaplibreMap) {
  const root = document.getElementById('map-search');
  const form = document.getElementById('map-search-form');
  const input = document.getElementById('map-search-input');
  const clearBtn = document.getElementById('map-search-clear');
  const resultsEl = document.getElementById('map-search-results');
  const statusEl = document.getElementById('map-search-status');
  if (!root || !form || !input || !clearBtn || !resultsEl || !statusEl) return;

  const msgSearching = root.dataset.msgSearching || 'Cerco…';
  const msgEmpty = root.dataset.msgEmpty || 'Nessun risultato';
  const msgError = root.dataset.msgError || 'Ricerca non disponibile';

  let debounceTimer = null;
  let abortCtrl = null;
  let activeIndex = -1;
  let currentResults = [];

  function setStatus(text) {
    if (!text) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = text;
  }

  function clearResults() {
    currentResults = [];
    activeIndex = -1;
    resultsEl.innerHTML = '';
    resultsEl.hidden = true;
  }

  function closeSearchUi() {
    clearResults();
    setStatus('');
  }

  function syncClearBtn() {
    clearBtn.hidden = input.value.trim().length === 0;
  }

  function labelForResult(item) {
    const addr = item.address || {};
    const name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state ||
      addr.region ||
      addr.country ||
      item.name ||
      (item.display_name || '').split(',')[0];
    const parts = [
      addr.state || addr.region,
      addr.country
    ].filter(Boolean);
    const unique = parts.filter((p) => p && p !== name);
    return {
      name: name || item.display_name,
      meta: unique.join(' · ')
    };
  }

  function goToResult(item) {
    if (!item) return;
    const bb = item.boundingbox;
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
    closeSearchUi();
    input.blur();
    document.body.classList.remove('search-open');
    const searchToggleBtn = document.getElementById('map-search-toggle');
    if (searchToggleBtn) searchToggleBtn.setAttribute('aria-expanded', 'false');
    return;
      }
    }
    const lon = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      map.flyTo({ center: [lon, lat], zoom: 10, duration: 1200 });
    }
    closeSearchUi();
    input.blur();
    document.body.classList.remove('search-open');
    const searchToggleBtn = document.getElementById('map-search-toggle');
    if (searchToggleBtn) searchToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function renderResults(items) {
    currentResults = items;
    activeIndex = items.length ? 0 : -1;
    resultsEl.innerHTML = '';
    if (!items.length) {
      resultsEl.hidden = true;
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
      btn.querySelector('.map-search-option-name').textContent = name;
      const metaEl = btn.querySelector('.map-search-option-meta');
      if (metaEl) metaEl.textContent = meta;
      btn.addEventListener('click', () => goToResult(item));
      li.appendChild(btn);
      resultsEl.appendChild(li);
    });
    resultsEl.hidden = false;
  }

  function setActiveOption(index) {
    const options = resultsEl.querySelectorAll('.map-search-option');
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((el, i) => el.classList.toggle('is-active', i === activeIndex));
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  async function runSearch(query) {
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
      if (err && err.name === 'AbortError') return;
      setStatus(msgError);
    }
  }

  function scheduleSearch() {
    const q = input.value.trim();
    syncClearBtn();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      if (abortCtrl) abortCtrl.abort();
      closeSearchUi();
      return;
    }
    debounceTimer = setTimeout(() => runSearch(q), 380);
  }

  input.addEventListener('input', scheduleSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveOption(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveOption(activeIndex - 1);
    } else if (e.key === 'Escape') {
      closeSearchUi();
      input.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        goToResult(currentResults[activeIndex]);
      } else if (input.value.trim().length >= 2) {
        runSearch(input.value.trim());
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && currentResults[activeIndex]) {
      goToResult(currentResults[activeIndex]);
    } else if (input.value.trim().length >= 2) {
      runSearch(input.value.trim());
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    syncClearBtn();
    closeSearchUi();
    input.focus();
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) closeSearchUi();
  });
}
