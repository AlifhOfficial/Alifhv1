import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Site password protection cookie name
const SITE_ACCESS_COOKIE = "site-access-granted";

// Routes that bypass site password protection
const BYPASS_SITE_PASSWORD = [
  '/staging-login',      // The password entry page
  '/api/',               // All API routes (mobile app, webhooks, etc.)
  '/api/staging-auth',   // The password verification endpoint
  '/status',             // Public status page
  '/_next/',             // Next.js assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Check if site password protection is enabled and handle access
 * Returns NextResponse if access denied, or null if access granted/not required
 */
function checkSitePassword(request: NextRequest): NextResponse | null {
  // Skip protection in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  
  const sitePassword = process.env.SITE_PASSWORD;
  
  // No password set = no protection
  if (!sitePassword) {
    return null;
  }
  
  const { pathname } = request.nextUrl;
  
  // Allow bypass routes
  if (BYPASS_SITE_PASSWORD.some(route => pathname.startsWith(route))) {
    return null;
  }
  
  // Check for access cookie
  const accessCookie = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (accessCookie === 'true') {
    return null;
  }
  
  // Redirect to staging login page
  const loginUrl = new URL('/staging-login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Lightweight middleware proxy.
 * 
 * Auth is resolved server-side in layouts/route handlers via getSessionUser()
 * which uses unstable_cache (5min TTL) — no Redis dependency.
 * 
 * Middleware only handles:
 * 1. Subdomain routing (status.revvup.ae)
 * 2. Site password protection (staging)
 * 3. Cookie-existence check → redirect unauthenticated users from protected pages
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // ==========================================================================
  // Subdomain Routing: status.revvup.ae
  // ==========================================================================
  if (hostname.startsWith('status.')) {
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/status';
      return NextResponse.rewrite(url);
    }
    
    if (pathname.startsWith('/api/status')) {
      return NextResponse.next();
    }
    
    if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
      return NextResponse.next();
    }
    
    const url = request.nextUrl.clone();
    url.pathname = '/status';
    return NextResponse.redirect(url);
  }
  
  // ==========================================================================
  // Site password protection
  // ==========================================================================
  const sitePasswordResponse = checkSitePassword(request);
  if (sitePasswordResponse) {
    return sitePasswordResponse;
  }
  
  // ==========================================================================
  // Cookie-existence gate for protected page routes
  // Auth validation + role checks happen in server component layouts
  // ==========================================================================
  const isProtectedPage = 
    pathname.startsWith('/user-dashboard') ||
    pathname.startsWith('/admin-dashboard') ||
    pathname.startsWith('/partner-dashboard') ||
    pathname.startsWith('/staff-dashboard');

  if (isProtectedPage) {
    const sessionToken = 
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("auth", "signin");
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
