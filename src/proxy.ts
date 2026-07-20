import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookieValue } from '@/lib/utils/helpers'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  const publicPaths = ['/', '/login', '/stats']
  const isPublicPath = publicPaths.some(p => path.startsWith(p))

  const cookieHeader = request.headers.get('cookie') || ''
  const token = getCookieValue(cookieHeader, 'auth-token')

  const response = NextResponse.next()

  if (path.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  }

  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/login' && token) {
    const dashboardUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|api/auth).*)',
  ],
}