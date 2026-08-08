import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie, isAdmin, isOwner, getOwnerUserId, getEffectiveOfferUserId } from '@/lib/auth'
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

    const queryWhere = isOwner(user)
      ? {} // owners see all offers
      : isAdmin(user)
        ? { userId: user.id } // admins see only their own offers
        : { userId: ownerUserId! } // managers see owner-provided offers

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
    // Tokens generated for local/dev use can contain `local-<name>` ids that
    // do not exist in the database. Creating offers with those would violate
    // the foreign key constraint. We map managers to the owner user when
    // appropriate and create or resolve a DB user for `local-` ids.
    const ownerUserId = await getOwnerUserId()
    let finalUserId: string = user.id

    if (typeof finalUserId === 'string' && finalUserId.startsWith('local-')) {
      const username = finalUserId.replace(/^local-/, '')
      const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } })
      if (existing?.id) {
        finalUserId = existing.id
      } else if (ownerUserId) {
        finalUserId = ownerUserId
      } else {
        const hashed = await bcrypt.hash(Math.random().toString(36).slice(2), 10)
        const created = await prisma.user.create({
          data: {
            username,
            email: `${username}@example.com`,
            password: hashed,
            role: 'ADMIN',
          },
        })
        finalUserId = created.id
      }
    } else {
      finalUserId = await getEffectiveOfferUserId(user.id)
    }

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