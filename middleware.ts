import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'travel_agency_saas_super_secret_jwt_key_2026_secure'
);

const SUPER_ADMIN_EMAILS = [
  'mnuhbhatti333@gmail.com',
  'mnuhbhattii333@gmail.com',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, next internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/register-agency' ||
    pathname === '/super-admin/login' ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/verify')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('travel_saas_session')?.value;

  // Protect /super-admin/* (except /super-admin/login handled above)
  if (pathname.startsWith('/super-admin')) {
    if (!token) {
      const loginUrl = new URL('/super-admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const email = ((payload.email as string) || '').toLowerCase().trim();
      const role = payload.role as string;

      const isSuper =
        role === 'super_admin' ||
        SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);

      if (!isSuper) {
        const loginUrl = new URL('/super-admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/super-admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/super-admin/:path*'],
};
