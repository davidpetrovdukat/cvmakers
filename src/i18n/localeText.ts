import { DEFAULT_LOCALE, Locale } from './config';

export function pickLocale<T>(locale: Locale, map: Record<Locale, T>): T {
  return map[locale] ?? map[DEFAULT_LOCALE];
}
