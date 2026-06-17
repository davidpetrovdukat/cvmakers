import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, getLocaleFromPath, LOCALE_COOKIE, localizePath, stripLocaleFromPath } from './i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/print') ||
    pathname.startsWith('/print-resume') ||
    pathname.startsWith('/s/') ||
    pathname === '/favicon.ico' ||
    pathname === '/site.webmanifest' ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  if (!pathLocale) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, DEFAULT_LOCALE);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-cv-makers-locale', pathLocale);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocaleFromPath(pathname);
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.cookies.set(LOCALE_COOKIE, pathLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
