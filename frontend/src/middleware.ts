import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require a logged-in user
const PROTECTED = ['/dashboard', '/tasks']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    // If trying to access protected route without token, go to landing page
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/tasks/:path*', '/auth/:path*'],
}