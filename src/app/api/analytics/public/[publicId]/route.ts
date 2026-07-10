import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCorsHeaders } from '@/config/cors'

export async function GET(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const origin = request.headers.get('origin') || null
    
    const dashboard = await prisma.publicDashboard.findUnique({
      where: { publicId: params.publicId },
      include: {
        linkAccount: true,
      },
    })

    if (!dashboard || dashboard.isPrivate) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const country = url.searchParams.get('country') || ''
    const unique = url.searchParams.get('unique') || ''

    const where: any = {
      linkAccountId: dashboard.linkAccountId,
      isBot: false,
    }

    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { referrer: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (country) {
      where.country = country
    }

    if (unique === 'true') {
      where.isUnique = true
    } else if (unique === 'false') {
      where.isUnique = false
    }

    const clicks = await prisma.click.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        country: true,
        browser: true,
        deviceType: true,
        referrer: true,
        isUnique: true,
        isBot: true,
        createdAt: true,
        timestamp: true,
      },
    })

    const totalClicks = await prisma.click.count({ where })

    return NextResponse.json({
      totalClicks: dashboard.linkAccount.totalClicks,
      uniqueClicks: dashboard.linkAccount.uniqueClicks,
      clicks: clicks.map(c => ({
        id: c.id,
        ipAddress: c.ipAddress,
        country: c.country || 'Unknown',
        browser: c.browser || 'Unknown',
        deviceType: c.deviceType,
        referrer: c.referrer,
        isUnique: c.isUnique,
        isBot: c.isBot,
        createdAt: c.createdAt.toISOString(),
        timestamp: c.timestamp?.toISOString() || c.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: totalClicks,
        totalPages: Math.ceil(totalClicks / limit),
      },
    }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching public stats:', error)
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