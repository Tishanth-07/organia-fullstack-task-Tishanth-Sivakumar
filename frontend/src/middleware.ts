import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require a logged-in user
const PROTECTED = ['/dashboard', '/tasks']

// Routes only for guests (redirect logged-in users away)
const GUEST_ONLY = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY.includes(pathname) || GUEST_ONLY.some((p) => p !== '/' && pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/tasks/:path*', '/auth/:path*'],
}