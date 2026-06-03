import { headers, cookies } from 'next/headers';
import { DEFAULT_LOCALE, Locale, LOCALE_COOKIE, normalizeLocale } from './config';
import { translate } from './messages';

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  return normalizeLocale(
    headerStore.get('x-cv-makers-locale') ||
      cookieStore.get(LOCALE_COOKIE)?.value ||
      DEFAULT_LOCALE,
  );
}

export function getTranslator(locale: Locale) {
  return (key: string, params?: Parameters<typeof translate>[2]) => translate(locale, key, params);
}
