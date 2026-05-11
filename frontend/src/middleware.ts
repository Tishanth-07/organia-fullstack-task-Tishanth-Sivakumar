import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Global Middleware
 * Handles route protection and authentication-based redirection.
 */

// ── Configuration: Route Definitions ─────────────────────────────────────────

/**
 * Paths that require a valid authentication token.
 * Accessing these without a token will trigger a redirect.
 */
const PROTECTED_ROUTES = ['/dashboard', '/tasks']

/**
 * Main Middleware Handler
 * Intercepts requests to validate authentication state before rendering.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Check if the current path is within the protected scope
  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))

  // ── Logic: Authentication Guard ────────────────────────────────────────────
  
  if (isProtected && !token) {
    /**
     * UNAUTHORIZED ACCESS ATTEMPT:
     * User is trying to access a restricted page without a session token.
     * We redirect them to the home/landing page to prompt authentication.
     */
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ── Logic: Authorized Passthrough ──────────────────────────────────────────
  
  /**
   * Access granted. Either the route is public, or a token is present.
   */
  return NextResponse.next()
}

// ── Configuration: Matcher ───────────────────────────────────────────────────

/**
 * Specifies which routes should trigger this middleware.
 * Includes both specific paths and wildcards for nested routes.
 */
export const config = {
  matcher: [
    '/', 
    '/dashboard/:path*', 
    '/tasks/:path*', 
    '/auth/:path*'
  ],
}