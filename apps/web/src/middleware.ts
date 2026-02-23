import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Auth шаардлагагүй public path-ууд */
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

/** Auth-тэй хэрэглэгч орох боломжгүй path-ууд (login хуудас гэх мэт) */
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password'];

/**
 * Next.js Middleware — Route protection.
 * `ocp-auth` cookie-аар auth төлөв шалгана (UX optimization, security биш).
 * Бодит token validation client-side AuthProvider дээр хийгдэнэ.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('ocp-auth');
  const isAuthenticated = !!authCookie;

  // Auth-тэй хэрэглэгч login/register хуудас руу орвол dashboard руу redirect
  if (isAuthenticated && AUTH_ONLY_PATHS.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Public path-ууд чөлөөтэй нэвтрэх боломжтой
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Protected path-ууд — auth cookie шаардлагатай
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * _next/static, _next/image, favicon.ico, api зэрэг
     * системийн path-уудыг алгасна
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
