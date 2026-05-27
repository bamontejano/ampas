import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  // ─── Route protection ───────────────────────────────────────────────
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/ampa');

  if (!session && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // ─── Multi-tenancy: extract AMPA slug from subdomain ────────────────
  // e.g. "ceip-rosales.ampas.app" → slug = "ceip-rosales"
  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const isSubdomain =
    hostname !== rootDomain &&
    hostname.endsWith(`.${rootDomain.split(':')[0]}`);

  const response = NextResponse.next();

  if (isSubdomain) {
    const slug = hostname.split('.')[0];
    response.headers.set('x-ampa-slug', slug);
    response.cookies.set('ampa-slug', slug, {
      httpOnly: false, // Needs to be readable client-side
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });
  }

  return response;
}
