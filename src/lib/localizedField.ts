/**
 * Pick localized string fields (`base_it` / `base_en`) with fallback.
 * Prefer the active locale, then the other, then a bare `base` key.
 */
export function localizedText(
  record: Record<string, unknown> | null | undefined,
  base: string,
  locale: string | null | undefined
): string | undefined {
  if (!record) return undefined;
  const lang = locale === 'en' ? 'en' : 'it';
  const other = lang === 'en' ? 'it' : 'en';
  for (const key of [`${base}_${lang}`, `${base}_${other}`, base]) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

export function numberLocale(locale: string | null | undefined): string {
  return locale === 'en' ? 'en-GB' : 'it-IT';
}
