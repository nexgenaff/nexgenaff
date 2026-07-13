import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCorsHeaders } from '@/config/cors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const { publicId } = await params
    
    const dashboard = await prisma.publicDashboard.findUnique({
      where: { publicId },
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
        { browserVersion: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { deviceType: { contains: search, mode: 'insensitive' } },
        { deviceBrand: { contains: search, mode: 'insensitive' } },
        { referrer: { contains: search, mode: 'insensitive' } },
        { userAgent: { contains: search, mode: 'insensitive' } },
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
        region: true,
        city: true,
        isp: true,
        browser: true,
        browserVersion: true,
        os: true,
        deviceType: true,
        deviceBrand: true,
        referrer: true,
        userAgent: true,
        isUnique: true,
        isBot: true,
        createdAt: true,
        timestamp: true,
      },
    })

    const totalClicks = await prisma.click.count({ where })

    const trendRows = await prisma.click.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        isUnique: true,
      },
    })

    const trendMap = {
      total: new Map<string, number>(),
      unique: new Map<string, number>(),
    }
    const trendDays: Array<{ key: string; label: string }> = []
    const today = new Date()

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - index)
      date.setHours(0, 0, 0, 0)

      const key = date.toISOString().slice(0, 10)
      trendDays.push({
        key,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      })
      trendMap.total.set(key, 0)
      trendMap.unique.set(key, 0)
    }

    trendRows.forEach((row) => {
      const createdAt = new Date(row.createdAt)
      const key = createdAt.toISOString().slice(0, 10)
      if (trendMap.total.has(key)) {
        trendMap.total.set(key, (trendMap.total.get(key) || 0) + 1)
      }
      if (row.isUnique && trendMap.unique.has(key)) {
        trendMap.unique.set(key, (trendMap.unique.get(key) || 0) + 1)
      }
    })

    const clickTrend = {
      labels: trendDays.map((day) => day.label),
      datasets: [
        {
          label: 'Total Clicks',
          data: trendDays.map((day) => trendMap.total.get(day.key) || 0),
          borderColor: '#22D3EE',
          backgroundColor: 'rgba(34, 211, 238, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Unique Clicks',
          data: trendDays.map((day) => trendMap.unique.get(day.key) || 0),
          borderColor: '#34D399',
          backgroundColor: 'rgba(52, 211, 153, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }

    const geoRows = await prisma.click.findMany({
      where,
      select: {
        country: true,
        isUnique: true,
      },
    })

    const geoBreakdown = new Map<string, { totalClicks: number; uniqueClicks: number }>()

    geoRows.forEach((row) => {
      const country = row.country || 'Unknown'
      const current = geoBreakdown.get(country) || { totalClicks: 0, uniqueClicks: 0 }
      current.totalClicks += 1
      if (row.isUnique) {
        current.uniqueClicks += 1
      }
      geoBreakdown.set(country, current)
    })

    const geoSummary = Array.from(geoBreakdown.entries())
      .map(([country, stats]) => ({
        country,
        totalClicks: stats.totalClicks,
        uniqueClicks: stats.uniqueClicks,
      }))
      .sort((a, b) => b.uniqueClicks - a.uniqueClicks || b.totalClicks - a.totalClicks)

    return NextResponse.json({
      totalClicks: dashboard.linkAccount.totalClicks,
      uniqueClicks: dashboard.linkAccount.uniqueClicks,
      geoSummary,
      clickTrend,
      clicks: clicks.map(c => ({
        id: c.id,
        ipAddress: c.ipAddress,
        country: c.country || 'Unknown',
        region: c.region || null,
        city: c.city || null,
        isp: c.isp || null,
        browser: c.browser || 'Unknown',
        browserVersion: c.browserVersion,
        os: c.os,
        deviceType: c.deviceType,
        deviceBrand: c.deviceBrand,
        referrer: c.referrer,
        userAgent: c.userAgent,
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