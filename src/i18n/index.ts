/**
 * Locale helpers for Substrato (static Astro i18n).
 * Default locale (it) has no URL prefix; en lives under /en/...
 */
import it from './it.json';
import en from './en.json';

export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'it';

export type Messages = typeof it;

const catalogs: Record<Locale, Messages> = {
  it,
  en: en as Messages
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'it' || value === 'en';
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getMessages(locale: string | undefined | null): Messages {
  return catalogs[resolveLocale(locale)];
}

/** Absolute path for a logical site path in the given locale. */
export function localePath(path: string, locale: Locale = defaultLocale): string {
  let clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
  if (locale === defaultLocale) return clean;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

/**
 * Strip locale prefix from a pathname and return the logical path
 * (always starting with /).
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (pathname.startsWith('/en/')) {
    const rest = pathname.slice(3);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname || '/';
}

/** Same page in another locale. */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localePath(stripLocalePrefix(pathname), target);
}

export function ogLocale(locale: Locale): string {
  return locale === 'en' ? 'en_US' : 'it_IT';
}
