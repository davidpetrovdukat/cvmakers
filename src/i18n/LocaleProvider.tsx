'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Locale, LOCALE_COOKIE, getLocaleFromPath, normalizeLocale } from './config';
import { translate } from './messages';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translate;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: translate,
});

export default function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale | string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeLocale, setActiveLocale] = useState<Locale>(() => normalizeLocale(locale));

  useEffect(() => {
    const pathLocale = getLocaleFromPath(pathname);
    if (pathLocale && pathLocale !== activeLocale) {
      setActiveLocale(pathLocale);
    }
  }, [pathname, activeLocale]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_COOKIE, activeLocale);
      document.cookie = `${LOCALE_COOKIE}=${activeLocale}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [activeLocale]);

  const value = useMemo(
    () => ({
      locale: activeLocale,
      setLocale: setActiveLocale,
      t: translate,
    }),
    [activeLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext).locale;
}

export function useI18n() {
  const { locale, setLocale } = useContext(LocaleContext);
  return {
    locale,
    setLocale,
    t: (key: string, params?: Parameters<typeof translate>[2]) => translate(locale, key, params),
  };
}
