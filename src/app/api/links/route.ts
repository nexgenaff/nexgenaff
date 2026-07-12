import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import crypto from 'crypto'

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

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      include: {
        customDomain: true,
        publicDashboard: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(links, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch links' },
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
    const { accountName, slug, customDomainId, offerGroupName } = body

    if (customDomainId) {
      const attachedDomain = await prisma.customDomain.findUnique({
        where: { id: customDomainId },
      })

      if (!attachedDomain || attachedDomain.userId !== user.id) {
        return NextResponse.json(
          { error: 'Selected custom domain does not exist or is not owned by your account' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (!attachedDomain.verified || !attachedDomain.isActive) {
        return NextResponse.json(
          { error: 'Only verified and active custom domains can be attached to a link' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }
    }

    if (!accountName || !slug) {
      return NextResponse.json(
        { error: 'Account name and slug required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const existing = await prisma.linkAccount.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const publicId = crypto.randomBytes(16).toString('hex')

    const link = await prisma.linkAccount.create({
      data: {
        accountName,
        slug,
        customDomainId: customDomainId || null,
        offerGroupName: typeof offerGroupName === 'string' ? offerGroupName.trim() || null : null,
        userId: user.id,
        publicDashboard: {
          create: { publicId },
        },
      },
      include: {
        customDomain: true,
        publicDashboard: true,
      },
    })

    return NextResponse.json(link, { 
      status: 201, 
      headers: getCorsHeaders(origin) 
    })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'Failed to create link' },
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