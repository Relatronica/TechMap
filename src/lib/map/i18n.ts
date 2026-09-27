/**
 * Map client i18n — catalog from locale (html[lang] / data-locale).
 */
import { getMessages, resolveLocale, type Locale } from '../../i18n';

export type MapI18n = ReturnType<typeof buildMapI18n>;

function buildMapI18n(locale: Locale) {
  const msg = getMessages(locale);
  return {
    layers: msg.layers,
    subtypes: msg.subtypes,
    relationships: msg.relationships,
    popup: msg.popup,
    confidence: msg.confidence,
    certainty: msg.certainty,
    labor_tags: msg.labor_tags,
    status: msg.status,
    countries: msg.countries,
    map: msg.map,
    controls: msg.controls
  };
}

export function getStatusShortLabels(locale: Locale = 'it') {
  const short = getMessages(locale).controls.status_short;
  return {
    operational: short.operational,
    under_construction: short.under_construction,
    planned: short.planned,
    decommissioned: short.decommissioned,
    unknown: short.unknown
  };
}

export function getMapI18n(locale: string | undefined | null = 'it') {
  return buildMapI18n(resolveLocale(locale));
}

/** Resolve locale from DOM (set by Layout). */
export function detectClientLocale(): Locale {
  if (typeof document === 'undefined') return 'it';
  const fromHtml = document.documentElement.getAttribute('lang');
  const fromMap = document.getElementById('map')?.getAttribute('data-locale');
  return resolveLocale(fromMap || fromHtml);
}

/** @deprecated Prefer getMapI18n(detectClientLocale()) — kept for gradual migration */
export const mapI18n = getMapI18n('it');
export const STATUS_SHORT_LABELS = getStatusShortLabels('it');
