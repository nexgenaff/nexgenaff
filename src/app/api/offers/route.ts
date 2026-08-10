import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie, isAdmin, isOwner, getOwnerUserId, getOfferSelectionUserIds, resolveUserIdForRecord } from '@/lib/auth'
import bcrypt from 'bcryptjs'
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

    const ownerUserId = await getOwnerUserId()

    // Owner: full access. Admin: own offers only. Manager: owner-provided offers.
    // If no owner account exists, return an empty list for managers instead of erroring.
    if (!isOwner(user) && !isAdmin(user) && !ownerUserId) {
      return NextResponse.json([], { headers: getCorsHeaders(origin) })
    }

    let queryWhere: Record<string, unknown>
    if (isOwner(user)) {
      queryWhere = {} // owners see all offers
    } else if (isAdmin(user)) {
      queryWhere = { userId: user.id } // admins see only their own offers
    } else {
      const offerUserIds = await getOfferSelectionUserIds(user.id)
      queryWhere = { userId: { in: offerUserIds } }
    }

    const offers = await prisma.offerVault.findMany({
      where: queryWhere,
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

    if (!isOwner(user) && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403, headers: getCorsHeaders(origin) }
      )
    }

    const body = await request.json()
    const country = typeof body?.country === 'string' ? body.country.trim().toUpperCase() : ''
    const groupName = typeof body?.groupName === 'string' ? body.groupName.trim() : ''
    const offerUrl = typeof body?.offerUrl === 'string' ? body.offerUrl.trim() : ''
    const isGlobal = Boolean(body?.isGlobal)
    const isContentLocker = Boolean(body?.isContentLocker)
    const priorityValue = Number(body?.priority)
    const priority = Number.isFinite(priorityValue)
      ? Math.max(1, Math.min(999, priorityValue))
      : 100
    const usaSecretRedirectPercentageValue = Number(body?.usaSecretRedirectPercentage)
    const usaSecretRedirectPercentage = Number.isFinite(usaSecretRedirectPercentageValue)
      ? Math.max(1, Math.min(100, usaSecretRedirectPercentageValue))
      : 50
    const rotationMode = body?.rotationMode === 'RANDOM' ? 'RANDOM' : 'PRIORITY'
    const resolvedCountry = isGlobal || isContentLocker ? 'GLOBAL' : country
    const usaSecretRedirectEnabled = typeof body?.usaSecretRedirectEnabled === 'boolean'
      ? body.usaSecretRedirectEnabled
      : undefined

    if ((!resolvedCountry && !isGlobal && !isContentLocker) || !offerUrl) {
      return NextResponse.json(
        { error: 'Country and offer URL required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Resolve a database-backed userId for the offer.
    // Local/dev tokens may contain `local-<name>` ids that do not exist in the
    // database, and managers should resolve to the owner-backed account when
    // shared data is required. The shared logic lives in the auth helpers so
    // all write paths stay in sync.
    const ownerUserId = await getOwnerUserId()
    const finalUserId = await resolveUserIdForRecord(user, ownerUserId)

    const offerData: Record<string, unknown> = {
      country: resolvedCountry,
      groupName: groupName || null,
      offerUrl,
      isGlobal,
      isContentLocker,
      isActive: true,
      usaSecretRedirectPercentage,
      priority,
      rotationMode,
      userId: finalUserId,
    }

    if (typeof usaSecretRedirectEnabled === 'boolean') {
      offerData.usaSecretRedirectEnabled = usaSecretRedirectEnabled
    }

    try {
      let offer
      try {
        offer = await prisma.offerVault.create({ data: offerData as any })
      } catch (innerError) {
        const innerMessage = innerError instanceof Error ? innerError.message : String(innerError)
        if (innerMessage.includes('Unknown argument `usaSecretRedirectEnabled`')) {
          delete offerData.usaSecretRedirectEnabled
          offer = await prisma.offerVault.create({ data: offerData as any })
        } else {
          throw innerError
        }
      }

      return NextResponse.json(offer, {
        status: 201,
        headers: getCorsHeaders(origin)
      })
    } catch (dbError) {
      const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      console.error('Error creating offer in database:', dbErrorMessage, dbError)

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
              isContentLocker,
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

      const responseBody: Record<string, unknown> = { error: 'Failed to create offer' }
      if (process.env.NODE_ENV !== 'production') {
        responseBody.detail = dbErrorMessage
      }

      return NextResponse.json(
        responseBody,
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