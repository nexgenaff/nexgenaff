import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

const normalizeSlug = (value: unknown) => {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/\s+/g, '-')
    : ''
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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

    const link = await prisma.linkAccount.findUnique({
      where: { id },
      include: {
        customDomain: true,
        publicDashboard: true,
      },
    })

    if (!link || link.userId !== user.id) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    return NextResponse.json(link, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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
    const accountName = typeof body.accountName === 'string' ? body.accountName.trim() : ''
    const slug = normalizeSlug(body.slug)
    const customDomainId = typeof body.customDomainId === 'string' && body.customDomainId.trim() ? body.customDomainId.trim() : null
    const offerGroupName = typeof body.offerGroupName === 'string' ? body.offerGroupName.trim() || null : null
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : true

    if (!accountName || !slug) {
      return NextResponse.json(
        { error: 'Account name and slug are required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const existingLink = await prisma.linkAccount.findUnique({
      where: { id },
    })

    if (!existingLink || existingLink.userId !== user.id) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

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

    const slugOwner = await prisma.linkAccount.findUnique({
      where: { slug },
    })

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const updatedLink = await prisma.linkAccount.update({
      where: { id },
      data: {
        accountName,
        slug,
        customDomainId,
        offerGroupName,
        isActive,
      },
      include: {
        customDomain: true,
        publicDashboard: true,
      },
    })

    return NextResponse.json(updatedLink, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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

    const link = await prisma.linkAccount.findUnique({
      where: { id },
    })

    if (!link || link.userId !== user.id) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    const body = await request.json()
    if (body.action !== 'reset') {
      return NextResponse.json(
        { error: 'Unsupported action' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.$transaction([
      prisma.click.deleteMany({ where: { linkAccountId: id } }),
      prisma.geoStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: id } }),
      prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: id } }),
      prisma.browserStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.oSStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.deviceStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.referrerStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.linkAccount.update({
        where: { id },
        data: {
          totalClicks: 0,
          uniqueClicks: 0,
          botClicks: 0,
        },
      }),
    ])

    return NextResponse.json(
      { success: true, message: 'Link statistics reset successfully' },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error resetting link:', error)
    return NextResponse.json(
      { error: 'Failed to reset link' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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

    const link = await prisma.linkAccount.findUnique({
      where: { id },
    })

    if (!link || link.userId !== user.id) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.$transaction([
      prisma.click.deleteMany({ where: { linkAccountId: id } }),
      prisma.geoStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: id } }),
      prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: id } }),
      prisma.browserStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.oSStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.deviceStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.referrerStat.deleteMany({ where: { linkAccountId: id } }),
      prisma.publicDashboard.deleteMany({ where: { linkAccountId: id } }),
      prisma.linkAccount.delete({ where: { id } }),
    ])

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Failed to delete link' },
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