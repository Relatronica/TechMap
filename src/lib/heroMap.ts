/**
 * Non-interactive MapLibre hero for the homepage.
 * Loads a slim /data/hero.geojson overlay (built by scripts/ingest/build-hero.mjs).
 */
import { Map as MaplibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {
  ICON_PATHS,
  FILTER_GROUPS,
  SUBTYPE_COLORS,
  ICON_SIZE,
  ICON_OPACITY_EXPR,
  createMapIconImage
} from './mapIcons';

setWorkerUrl(maplibreWorkerUrl);

const COLORS = { dc: '#5A9BB8', rm: '#B87A4A', ep: '#5B8FA8', conn: '#8a9199' };
const HERO_ICON_SIZE = 160;

function heroIconId(subtype: string) {
  return `hero-icon-${subtype}`;
}

function buildHeroIconMatch(subtypes: string[], fallback: string) {
  const expr: any[] = ['match', ['get', 'subtype']];
  subtypes.forEach((s) => {
    expr.push(s, heroIconId(s));
  });
  expr.push(heroIconId(fallback));
  return expr;
}

function emptyFC() {
  return { type: 'FeatureCollection', features: [] as any[] };
}

function splitHeroByLayer(fc: { features?: any[] }) {
  const out = {
    data_centers: emptyFC(),
    energy_plants: emptyFC(),
    raw_materials: emptyFC(),
    connections: emptyFC()
  };
  for (const f of fc.features || []) {
    const layer = f.properties?.layer as keyof typeof out;
    if (layer && out[layer]) out[layer].features.push(f);
  }
  return out;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export function initHeroMap() {
  const heroEl = document.getElementById('hero-map');
  if (!heroEl) return;

  const heroMap = new MaplibreMap({
    container: heroEl,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [12.5, 42.2],
    zoom: 5.1,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0
  });

  heroMap.once('idle', () => {
    heroEl.classList.add('is-ready');
  });

  heroMap.on('load', async () => {
    try {
      const hero = await fetchJson('/data/hero.geojson');
      const { data_centers: dc, energy_plants: ep, raw_materials: rm, connections: conn } =
        splitHeroByLayer(hero);

      (Object.keys(ICON_PATHS) as Array<keyof typeof ICON_PATHS>).forEach((subtype) => {
        const path = ICON_PATHS[subtype];
        const color = (SUBTYPE_COLORS as Record<string, string>)[subtype] || COLORS.conn;
        if (path && !heroMap.hasImage(heroIconId(subtype))) {
          heroMap.addImage(
            heroIconId(subtype),
            createMapIconImage(path, color, HERO_ICON_SIZE, 'solid'),
            { pixelRatio: 2 }
          );
        }
      });

      heroMap.addSource('hero-conn', { type: 'geojson', data: conn });
      heroMap.addSource('hero-dc', { type: 'geojson', data: dc });
      heroMap.addSource('hero-ep', { type: 'geojson', data: ep });
      heroMap.addSource('hero-rm', { type: 'geojson', data: rm });

      heroMap.addLayer({
        id: 'hero-conn-line',
        type: 'line',
        source: 'hero-conn',
        paint: {
          'line-color': COLORS.conn,
          'line-width': 1.1,
          'line-opacity': 0.45,
          'line-dasharray': [1.5, 1.5]
        }
      });

      const symbol = (
        id: string,
        source: string,
        group: { subtypes: string[] },
        fallback: string
      ) => {
        heroMap.addLayer({
          id,
          type: 'symbol',
          source,
          layout: {
            'icon-image': buildHeroIconMatch(group.subtypes, fallback) as any,
            'icon-size': ICON_SIZE * 0.92,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          },
          paint: {
            'icon-opacity': ICON_OPACITY_EXPR as any
          }
        });
      };

      symbol('hero-rm-pts', 'hero-rm', FILTER_GROUPS.raw_materials, 'lithium_mine');
      symbol('hero-ep-pts', 'hero-ep', FILTER_GROUPS.energy_plants, 'gas');
      symbol('hero-dc-pts', 'hero-dc', FILTER_GROUPS.data_centers, 'hyperscale');
    } catch (err) {
      console.error('Hero map data load failed', err);
      heroEl.classList.add('is-ready', 'is-map-error');
    }
  });

  window.addEventListener('resize', () => heroMap.resize());
}

initHeroMap();
