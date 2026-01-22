'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { THEME } from '@/lib/theme';
import Segmented from '@/components/ui/Segmented';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated';
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const isHome = pathname === '/';
  const isPricing = pathname === '/pricing';
  const isTokenCalc = pathname === '/token-calculator';
  const isAbout = pathname === '/about';
  const isDashboard = pathname === '/dashboard';
  const [currency, setCurrency] = useState<'GBP' | 'EUR' | 'USD'>('GBP');
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = (session?.user as any)?.tokenBalance;
    if (typeof t === 'number') setTokens(t);
  }, [session]);

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'tokens-updated' && typeof data.tokenBalance === 'number') {
          setTokens(data.tokenBalance);
        }
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
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
      if (saved === 'GBP' || saved === 'EUR' || saved === 'USD') setCurrency(saved);
    } catch {}
  }, []);

  const onCurrencyChange = (next: 'GBP'|'EUR'|'USD') => {
    setCurrency(next);
    try { localStorage.setItem('currency', next); } catch {}
    try { bcRef.current?.postMessage({ type: 'currency-updated', currency: next }); } catch {}
  };

  const closeHelp = () => setHelpOpen(false);
  const toggleHelp = () => setHelpOpen((v)=>!v);
  const onKeyDownHelp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Escape') setHelpOpen(false);
  };

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((v)=>!v);
  const toggleMobileHelp = () => setMobileHelpOpen((v)=>!v);

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

  if (pathname?.startsWith('/print-resume')) {
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
          <Link href="/" className={`flex items-center gap-2 font-semibold ${THEME.text}`} aria-label="Go to homepage">
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
            <a href={signedIn ? '/create-cv' : '/auth/signin?mode=login'} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 transition-colors">Create my CV</a>
            <a href={signedIn ? '/create-resume' : '/auth/signin?mode=login'} className="rounded-xl border border-[#E2E8F0] hover:bg-[#E2E8F0] px-3 py-2 transition-colors">Create my resume</a>
            {signedIn && (
              <a href="/dashboard" className={`rounded-xl px-3 py-2 transition-colors ${isDashboard ? 'bg-black/5' : 'hover:bg-black/5'}`}>Dashboard</a>
            )}
            <a href="/pricing" className={`rounded-xl px-3 py-2 transition-colors ${isPricing ? 'bg-black/5' : 'hover:bg-black/5'}`}>Top-Up</a>
            <a href="/token-calculator" className={`rounded-xl px-3 py-2 transition-colors ${isTokenCalc ? 'bg-black/5' : 'hover:bg-black/5'}`}>Token Calculator</a>
          </nav>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden md:block">
            <Segmented
              options={[{ label: 'GBP', value: 'GBP' }, { label: 'EUR', value: 'EUR' }, { label: 'USD', value: 'USD' }]}
              value={currency}
              onChange={(v)=>onCurrencyChange(v as 'GBP'|'EUR'|'USD')}
            />
          </div>
          {!signedIn ? (
            <>
              <Link
                href="/auth/signin?mode=login"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/signin?mode=signup"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-colors"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-slate-700">
                Tokens: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
              </div>
              <Link href="/pricing" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm transition-colors">Top-Up</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Burger button (mobile only) */}
        <div className="sm:hidden">
          <button
            aria-label="Open menu"
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
                  <div className="text-sm font-semibold">Menu</div>
                  <button aria-label="Close menu" onClick={closeMobile} className="rounded-xl p-2 hover:bg-slate-50">
                    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
                  <nav className="grid gap-1">
                    <Link href={signedIn ? '/create-cv' : '/auth/signin?mode=login'} className={`rounded-xl px-3 py-2 hover:bg-slate-50`} onClick={closeMobile}>Create my CV</Link>
                    <Link href={signedIn ? '/create-resume' : '/auth/signin?mode=login'} className={`rounded-xl px-3 py-2 hover:bg-slate-50`} onClick={closeMobile}>Create my resume</Link>
                    {signedIn && (
                      <Link href="/dashboard" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isDashboard ? 'bg-black/5' : ''}`} onClick={closeMobile}>Dashboard</Link>
                    )}
                    <Link href="/pricing" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isPricing ? 'bg-black/5' : ''}`} onClick={closeMobile}>Top-Up</Link>
                    <Link href="/token-calculator" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isTokenCalc ? 'bg-black/5' : ''}`} onClick={closeMobile}>Token Calculator</Link>
                  </nav>

                  <div className="mt-4">
                    <div className="mb-2 text-xs text-slate-500">Currency</div>
                    <Segmented
                      options={[{ label: 'GBP', value: 'GBP' }, { label: 'EUR', value: 'EUR' }, { label: 'USD', value: 'USD' }]}
                      value={currency}
                      onChange={(v)=>onCurrencyChange(v as 'GBP'|'EUR'|'USD')}
                    />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {!signedIn ? (
                      <>
                        <Link href="/auth/signin?mode=login" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Log in</Link>
                        <Link href="/auth/signin?mode=signup" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Sign up</Link>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-slate-700">
                          Tokens: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
                        </div>
                        <Link href="/pricing" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Top-Up</Link>
                        <button
                          onClick={() => { closeMobile(); signOut({ callbackUrl: '/' }); }}
                          className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm"
                        >
                          Sign out
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

