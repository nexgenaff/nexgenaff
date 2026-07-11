import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

    // Debug helper: if ?debug=1 is present, return diagnostic info on failures
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    if (!token) {
      if (debug) {
        return NextResponse.json(
          { error: 'Unauthorized', details: { cookieHeader } },
          { status: 401, headers: getCorsHeaders(origin) }
        )
      }

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    let user = null
    try {
      user = await getUserFromToken(token)
    } catch (err: unknown) {
      console.error('getUserFromToken error:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      if (debug) {
        return NextResponse.json({ error: 'getUserFromToken failed', message: error.message, stack: error.stack }, { status: 500, headers: getCorsHeaders(origin) })
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    if (!user) {
      if (debug) {
        return NextResponse.json({ error: 'Unauthorized', details: { token } }, { status: 401, headers: getCorsHeaders(origin) })
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    // If token is a temporary in-memory user (local- prefix), avoid DB queries and return placeholder stats
    if (user.id && typeof user.id === 'string' && user.id.startsWith('local-')) {
      return NextResponse.json({
        totalClicks: 0,
        uniqueClicks: 0,
        botClicks: 0,
        totalLinks: 0,
      }, { headers: getCorsHeaders(origin) })
    }

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
    })

    const totalClicks = links.reduce((sum, link) => sum + (link.totalClicks || 0), 0)
    const uniqueClicks = links.reduce((sum, link) => sum + (link.uniqueClicks || 0), 0)
    const botClicks = links.reduce((sum, link) => sum + (link.botClicks || 0), 0)

    return NextResponse.json({
      totalClicks,
      uniqueClicks,
      botClicks,
      totalLinks: links.length,
    }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}