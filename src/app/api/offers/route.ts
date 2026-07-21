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

    const offers = await prisma.offerVault.findMany({
      where: { userId: user.id },
      orderBy: [
        { isGlobal: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(offers, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const country = typeof body?.country === 'string' ? body.country.trim().toUpperCase() : ''
    const groupName = typeof body?.groupName === 'string' ? body.groupName.trim() : ''
    const offerUrl = typeof body?.offerUrl === 'string' ? body.offerUrl.trim() : ''
    const isGlobal = Boolean(body?.isGlobal)
    const priorityValue = Number(body?.priority)
    const priority = Number.isFinite(priorityValue)
      ? Math.max(1, Math.min(999, priorityValue))
      : 100
    const rotationMode = body?.rotationMode === 'RANDOM' ? 'RANDOM' : 'PRIORITY'
    const resolvedCountry = isGlobal ? 'GLOBAL' : country

    if ((!resolvedCountry && !isGlobal) || !offerUrl) {
      return NextResponse.json(
        { error: 'Country and offer URL required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    try {
      const offer = await prisma.offerVault.create({
        data: {
          country: resolvedCountry,
          groupName: groupName || null,
          offerUrl,
          isGlobal,
          isActive: true,
          usaSecretRedirectEnabled: Boolean(body?.usaSecretRedirectEnabled),
          priority,
          rotationMode,
          userId: user.id,
        },
      })

      return NextResponse.json(offer, {
        status: 201,
        headers: getCorsHeaders(origin)
      })
    } catch (dbError) {
      console.error('Error creating offer in database:', dbError)

      if (!process.env.DATABASE_URL) {
        return NextResponse.json(
          {
            success: true,
            message: 'Offer payload accepted in local mode; database is not configured, so the record was not persisted.',
            offer: {
              id: `local-${Date.now()}`,
              country: resolvedCountry,
              groupName: groupName || null,
              offerUrl,
              isActive: true,
              isGlobal,
              priority,
              rotationMode,
              userId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          { status: 201, headers: getCorsHeaders(origin) }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500, headers: getCorsHeaders(origin) }
      )
    }
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500, headers: getCorsHeaders(origin) }
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