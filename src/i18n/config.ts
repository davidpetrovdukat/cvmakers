export const LOCALES = ['en', 'tr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'cv-makers-locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'ENG',
  tr: 'TR',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromPath(pathname?: string | null): Locale | null {
  if (!pathname) return null;
  const first = pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : null;
}

export function stripLocaleFromPath(pathname?: string | null): string {
  if (!pathname) return '/';
  const parts = pathname.split('/');
  if (isLocale(parts[1])) {
    const stripped = '/' + parts.slice(2).join('/');
    return stripped === '/' ? '/' : stripped.replace(/\/+$/, '') || '/';
  }
  return pathname || '/';
}

export function localizePath(pathname: string, locale: Locale): string {
  const base = stripLocaleFromPath(pathname);
  return base === '/' ? `/${locale}` : `/${locale}${base}`;
}

export function normalizeLocale(value?: string | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
