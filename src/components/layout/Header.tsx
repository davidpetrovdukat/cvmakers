'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { THEME } from '@/lib/theme';
import Segmented from '@/components/ui/Segmented';
import { useSession, signOut } from 'next-auth/react';
import { CURRENCY_OPTIONS, Currency, isCurrency } from '@/lib/currency';
import { LOCALE_LABELS, LOCALES, Locale, getLocaleFromPath, localizePath, stripLocaleFromPath } from '@/i18n/config';
import { useI18n } from '@/i18n/LocaleProvider';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated';
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const normalizedPath = stripLocaleFromPath(pathname);
  const isPricing = normalizedPath === '/pricing';
  const isTokenCalc = normalizedPath === '/token-calculator';
  const isDashboard = normalizedPath === '/dashboard';
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeLocale = getLocaleFromPath(pathname) ?? locale;

  const href = useCallback((target: string) => localizePath(target, activeLocale), [activeLocale]);

  const refreshTokens = useCallback(async () => {
    if (status !== 'authenticated') {
      setTokens(null);
      return;
    }

    try {
      const response = await fetch('/api/me', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      const tokenBalance = payload?.user?.tokenBalance;
      if (typeof tokenBalance === 'number') {
        setTokens(tokenBalance);
      }
    } catch {}
  }, [status]);

  useEffect(() => {
    const t = (session?.user as any)?.tokenBalance;
    if (typeof t === 'number' && tokens === null) setTokens(t);
  }, [session, tokens]);

  useEffect(() => {
    refreshTokens();
  }, [pathname, refreshTokens]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const onFocus = () => {
      refreshTokens();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshTokens();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshTokens, status]);

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'tokens-updated' && typeof data.tokenBalance === 'number') {
          setTokens(data.tokenBalance);
        }
        if (data.type === 'currency-updated' && isCurrency(data.currency)) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  useEffect(() => {
    setMounted(true);
    // Read saved currency client-side to avoid SSR hydration mismatch
    try {
      const saved = localStorage.getItem('currency');
      if (isCurrency(saved)) setCurrency(saved);
    } catch {}
  }, []);

  const onCurrencyChange = (next: Currency) => {
    setCurrency(next);
    try { localStorage.setItem('currency', next); } catch {}
    try { bcRef.current?.postMessage({ type: 'currency-updated', currency: next }); } catch {}
  };

  const onLanguageChange = (next: string) => {
    const nextLocale = next as Locale;
    const query = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '';
    const target = `${localizePath(normalizedPath, nextLocale)}${query ? `?${query}` : ''}`;
    setLocale(nextLocale);
    try {
      localStorage.setItem('cv-makers-locale', nextLocale);
      document.cookie = `cv-makers-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    router.push(target);
  };

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((v)=>!v);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setMobileHelpOpen(false); }, [pathname]);

  // ESC to close mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!mounted) return;
    try {
      if (mobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } catch {}
    return () => { try { document.body.style.overflow = ''; } catch {} };
  }, [mobileOpen, mounted]);

  if (normalizedPath.startsWith('/print-resume')) {
    return null;
  }

  return (
    <motion.header 
      className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-[#E2E8F0]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={href('/')} className={`flex items-center gap-2 font-semibold ${THEME.text}`} aria-label="Go to homepage">
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="CV Makers logo"
                width={32}
                height={32}
                className="h-7 w-auto"
                priority
              />
            </motion.span>
          </Link>
          
          <nav className="hidden sm:flex items-center gap-2 text-sm relative">
            <a href={signedIn ? href('/create-cv') : href('/auth/signin?mode=login')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 transition-colors">{t('nav.createCv')}</a>
            <a href={signedIn ? href('/create-resume') : href('/auth/signin?mode=login')} className="rounded-xl border border-[#E2E8F0] hover:bg-[#E2E8F0] px-3 py-2 transition-colors">{t('nav.createResume')}</a>
            {signedIn && (
              <a href={href('/dashboard')} className={`rounded-xl px-3 py-2 transition-colors ${isDashboard ? 'bg-black/5' : 'hover:bg-black/5'}`}>{t('nav.dashboard')}</a>
            )}
            <a href={href('/pricing')} className={`rounded-xl px-3 py-2 transition-colors ${isPricing ? 'bg-black/5' : 'hover:bg-black/5'}`}>{t('nav.pricing')}</a>
            <a href={href('/token-calculator')} className={`rounded-xl px-3 py-2 transition-colors ${isTokenCalc ? 'bg-black/5' : 'hover:bg-black/5'}`}>{t('nav.tokenCalculator')}</a>
          </nav>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <Segmented
            options={LOCALES.map((item) => ({ label: LOCALE_LABELS[item], value: item }))}
            value={activeLocale}
            onChange={onLanguageChange}
          />
          <div className="hidden md:block">
            <Segmented
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(v)=>onCurrencyChange(v as Currency)}
            />
          </div>
          {!signedIn ? (
            <>
              <Link
                href={href('/auth/signin?mode=login')}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                href={href('/auth/signin?mode=signup')}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-colors"
              >
                {t('nav.signup')}
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-slate-700">
                {t('nav.tokens')}: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
              </div>
              <Link href={href('/pricing')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm transition-colors">{t('nav.pricing')}</Link>
              <button
                onClick={() => signOut({ callbackUrl: href('/') })}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm transition-colors"
              >
                {t('nav.signout')}
              </button>
            </div>
          )}
        </div>

        {/* Burger button (mobile only) */}
        <div className="sm:hidden">
          <button
            aria-label={t('common.openMenu')}
            className="rounded-xl border border-[#E2E8F0] bg-white p-2 text-slate-700 hover:bg-slate-50"
            onClick={toggleMobile}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </section>

      {/* Mobile menu overlay (portal to body to avoid stacking/transform issues) */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[100] bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobile}
              />
              <motion.aside
                className="fixed right-0 top-0 z-[101] h-full w-80 max-w-[90%] bg-white border-l border-[#E2E8F0] shadow-xl flex flex-col"
                role="dialog"
                aria-modal="true"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                  <div className="text-sm font-semibold">{t('common.menu')}</div>
                  <button aria-label={t('common.closeMenu')} onClick={closeMobile} className="rounded-xl p-2 hover:bg-slate-50">
                    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
                  <nav className="grid gap-1">
                    <Link href={signedIn ? href('/create-cv') : href('/auth/signin?mode=login')} className={`rounded-xl px-3 py-2 hover:bg-slate-50`} onClick={closeMobile}>{t('nav.createCv')}</Link>
                    <Link href={signedIn ? href('/create-resume') : href('/auth/signin?mode=login')} className={`rounded-xl px-3 py-2 hover:bg-slate-50`} onClick={closeMobile}>{t('nav.createResume')}</Link>
                    {signedIn && (
                      <Link href={href('/dashboard')} className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isDashboard ? 'bg-black/5' : ''}`} onClick={closeMobile}>{t('nav.dashboard')}</Link>
                    )}
                    <Link href={href('/pricing')} className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isPricing ? 'bg-black/5' : ''}`} onClick={closeMobile}>{t('nav.pricing')}</Link>
                    <Link href={href('/token-calculator')} className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isTokenCalc ? 'bg-black/5' : ''}`} onClick={closeMobile}>{t('nav.tokenCalculator')}</Link>
                  </nav>

                  <div className="mt-4">
                    <div className="mb-2 text-xs text-slate-500">{t('common.language')}</div>
                    <Segmented
                      options={LOCALES.map((item) => ({ label: LOCALE_LABELS[item], value: item }))}
                      value={activeLocale}
                      onChange={onLanguageChange}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-xs text-slate-500">{t('common.currency')}</div>
                    <Segmented
                      options={CURRENCY_OPTIONS}
                      value={currency}
                      onChange={(v)=>onCurrencyChange(v as Currency)}
                    />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {!signedIn ? (
                      <>
                        <Link href={href('/auth/signin?mode=login')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>{t('nav.login')}</Link>
                        <Link href={href('/auth/signin?mode=signup')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>{t('nav.signup')}</Link>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-slate-700">
                          {t('nav.tokens')}: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
                        </div>
                        <Link href={href('/pricing')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>{t('nav.pricing')}</Link>
                        <button
                          onClick={() => { closeMobile(); signOut({ callbackUrl: href('/') }); }}
                          className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm"
                        >
                          {t('nav.signout')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.header>
  );
}

