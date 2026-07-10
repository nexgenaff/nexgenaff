import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    // If temporary local user, return empty clicks instead of querying DB
    if (user.id && typeof user.id === 'string' && user.id.startsWith('local-')) {
      return NextResponse.json([], { headers: getCorsHeaders(origin) })
    }

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const linkIds = links.map(link => link.id)

    if (linkIds.length === 0) {
      return NextResponse.json([], { headers: getCorsHeaders(origin) })
    }

    const clicks = await prisma.click.findMany({
      where: {
        linkAccountId: { in: linkIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        country: true,
        browser: true,
        createdAt: true,
        isUnique: true,
        isBot: true,
      },
    })

    return NextResponse.json(clicks, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching recent clicks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent clicks' },
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