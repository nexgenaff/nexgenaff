import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Don't process if already in an internal route
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // Get the main domain from env (e.g., "weebly.pro" or "localhost:3000")
  const mainDomain = process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'localhost:3000'
  
  // Extract subdomain from host
  const parts = host.split('.')
  const mainParts = mainDomain.split(':')[0].split('.') // Remove port if exists
  
  // Check if current host has more parts than main domain (indicating a subdomain)
  if (parts.length > mainParts.length) {
    // Extract the subdomain(s) - everything before the main domain
    const subdomainParts = parts.slice(0, parts.length - mainParts.length)
    const subdomain = subdomainParts.join('.').toLowerCase()
    
    // Rewrite to the landing page route if not already there
    if (!pathname.startsWith('/lp/')) {
      const url = request.nextUrl.clone()
      url.pathname = `/lp/${subdomain}${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
