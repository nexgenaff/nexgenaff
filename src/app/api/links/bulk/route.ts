import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

const normalizeIds = (value: unknown) => {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
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
    const action = body.action
    const ids = normalizeIds(body.ids)

    if (!ids.length) {
      return NextResponse.json(
        { error: 'Select at least one link account' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const matchingLinks = await prisma.linkAccount.findMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
      select: { id: true },
    })

    if (matchingLinks.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more selected links were not found or are not owned by your account' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'reset') {
      await prisma.$transaction([
        prisma.click.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.geoStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.browserStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.oSStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.deviceStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.referrerStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.linkAccount.updateMany({
          where: { id: { in: ids } },
          data: {
            totalClicks: 0,
            uniqueClicks: 0,
            botClicks: 0,
          },
        }),
      ])

      return NextResponse.json(
        { success: true, resetCount: ids.length },
        { headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'delete') {
      await prisma.$transaction([
        prisma.click.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.geoStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.browserStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.oSStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.deviceStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.referrerStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.publicDashboard.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.linkAccount.deleteMany({ where: { id: { in: ids } } }),
      ])

      return NextResponse.json(
        { success: true, deletedCount: ids.length },
        { headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'update') {
      const updateData: {
        customDomainId?: string | null
        offerGroupName?: string | null
        isActive?: boolean
      } = {}

      if (typeof body.customDomainId === 'string' && body.customDomainId.trim()) {
        const attachedDomain = await prisma.customDomain.findUnique({
          where: { id: body.customDomainId },
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

        updateData.customDomainId = attachedDomain.id
      }

      if (typeof body.offerGroupName === 'string') {
        updateData.offerGroupName = body.offerGroupName.trim() || null
      }

      if (typeof body.isActive === 'boolean') {
        updateData.isActive = body.isActive
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'Choose at least one bulk update field' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      await prisma.$transaction(
        ids.map((id) =>
          prisma.linkAccount.update({
            where: { id },
            data: updateData,
          })
        )
      )

      return NextResponse.json(
        { success: true, updatedCount: ids.length },
        { headers: getCorsHeaders(origin) }
      )
    }

    return NextResponse.json(
      { error: 'Unsupported action' },
      { status: 400, headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error processing bulk link action:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk link action' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return NextResponse.json(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}
