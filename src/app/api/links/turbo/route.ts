import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie, getOwnerUserId, isAdmin, isOwner } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import crypto from 'crypto'

const normalizeBaseName = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, '')
}

const getTrackingUrl = (origin: string, slug: string, customDomain?: string | null) => {
  if (customDomain) {
    return `https://${customDomain}/${slug}`
  }

  return `${origin.replace(/\/$/, '')}/${slug}`
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

    const ownerUserId = await getOwnerUserId()
    
    let body: any = {}
    try {
      const text = await request.text()
      body = text ? JSON.parse(text) : {}
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }
    
    const baseName = normalizeBaseName(body.baseName)
    const start = Number(body.start)
    const end = Number(body.end)
    const customDomainId = typeof body.customDomainId === 'string' ? body.customDomainId : ''
    const offerGroupName = typeof body.offerGroupName === 'string' ? body.offerGroupName.trim() || null : null

    if (!baseName) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end) {
      return NextResponse.json(
        { error: 'Number range must be valid and start must be less than or equal to end' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (end - start + 1 > 500) {
      return NextResponse.json(
        { error: 'You can create up to 500 links in one turbo batch' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (customDomainId) {
      const attachedDomain = await prisma.customDomain.findUnique({
        where: { id: customDomainId },
      })

      const canUseCustomDomain = isOwner(user)
        ? true
        : isAdmin(user)
          ? attachedDomain?.userId === user.id
          : attachedDomain?.userId === ownerUserId

      if (!attachedDomain || !canUseCustomDomain) {
        return NextResponse.json(
          { error: 'Selected custom domain does not exist or is not owned by your account or the shared owner account' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (!attachedDomain.isActive) {
        return NextResponse.json(
          { error: 'Only active custom domains can be attached to a link' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }
    }

    const generatedItems: Array<{ accountName: string; slug: string }> = []
    const seenSlugs = new Set<string>()

    for (let number = start; number <= end; number += 1) {
      const accountName = `${baseName}${number}`
      const slug = accountName.toLowerCase()

      if (seenSlugs.has(slug)) {
        return NextResponse.json(
          { error: `Duplicate slug generated for ${accountName}` },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      seenSlugs.add(slug)
      generatedItems.push({ accountName, slug })
    }

    const existingSlugs = await prisma.linkAccount.findMany({
      where: { slug: { in: generatedItems.map((item) => item.slug) } },
      select: { slug: true },
    })

    const existingSlugSet = new Set(existingSlugs.map((item) => item.slug))
    const duplicateSlug = generatedItems.find((item) => existingSlugSet.has(item.slug))

    if (duplicateSlug) {
      return NextResponse.json(
        { error: `Slug ${duplicateSlug.slug} already exists` },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    let finalUserId: string = user.id
    if (typeof finalUserId === 'string' && finalUserId.startsWith('local-')) {
      const username = finalUserId.replace(/^local-/, '')
      const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } })
      if (existing?.id) {
        finalUserId = existing.id
      } else if (isOwner(user) && ownerUserId) {
        finalUserId = ownerUserId
      }
    }

    const baseUrl = (origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const createdLinks = [] as any[]

    for (const item of generatedItems) {
      const publicId = crypto.randomBytes(16).toString('hex')
      const link = await prisma.linkAccount.create({
        data: {
          accountName: item.accountName,
          slug: item.slug,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
          userId: finalUserId,
          publicDashboard: {
            create: { publicId },
          },
        },
        include: {
          customDomain: true,
          publicDashboard: true,
        },
      })

      createdLinks.push({
        id: link.id,
        accountName: link.accountName,
        slug: link.slug,
        trackingUrl: getTrackingUrl(baseUrl, link.slug, link.customDomain?.domain ?? null),
        publicStatsUrl: `${baseUrl}/stats/${link.publicDashboard?.publicId}`,
        customDomain: link.customDomain?.domain ?? null,
      })
    }

    return NextResponse.json(
      {
        createdCount: createdLinks.length,
        createdLinks,
      },
      { status: 201, headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error creating turbo links:', error)
    return NextResponse.json(
      { error: 'Failed to create turbo links' },
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
