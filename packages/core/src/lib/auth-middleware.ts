import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Creates a Supabase client for middleware usage
 * Uses cookies for session management in server context
 */
function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Auth middleware configuration
 */
export interface AuthMiddlewareConfig {
  /** Routes that require authentication */
  protectedRoutes: string[];
  /** Routes that should redirect to dashboard if authenticated */
  authRoutes: string[];
  /** Route to redirect unauthenticated users */
  loginRoute: string;
  /** Route to redirect authenticated users from auth pages */
  dashboardRoute: string;
  /** Route for new users without business profile */
  onboardingRoute: string;
}

const defaultConfig: AuthMiddlewareConfig = {
  protectedRoutes: ['/dashboard', '/quotes', '/customers', '/services', '/settings', '/onboarding'],
  authRoutes: ['/login', '/signup'],
  loginRoute: '/',
  dashboardRoute: '/dashboard',
  onboardingRoute: '/onboarding',
};

/**
 * Creates auth middleware for Next.js
 * Handles route protection and redirects based on authentication state
 * Validates: Requirements 1.1, 1.3, 1.5
 */
export function createAuthMiddleware(config: Partial<AuthMiddlewareConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async function authMiddleware(request: NextRequest) {
    const { supabase, response } = createMiddlewareClient(request);
    const { pathname } = request.nextUrl;

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    // Check if route is protected
    const isProtectedRoute = finalConfig.protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Check if route is an auth route (login/signup)
    const isAuthRoute = finalConfig.authRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL(finalConfig.loginRoute, request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL(finalConfig.dashboardRoute, request.url));
    }

    return response;
  };
}

/**
 * Default auth middleware instance
 */
export const authMiddleware = createAuthMiddleware();

/**
 * Matcher config for Next.js middleware
 * Excludes static files and API routes from middleware processing
 */
export const authMiddlewareMatcher = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
