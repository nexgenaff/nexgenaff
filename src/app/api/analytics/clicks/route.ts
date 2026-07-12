import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

interface FilterParams {
  country?: string
  browser?: string
  deviceType?: string
  isUnique?: boolean
  isBot?: boolean
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

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

    const url = new URL(request.url)
    const params: FilterParams = {
      country: url.searchParams.get('country') || undefined,
      browser: url.searchParams.get('browser') || undefined,
      deviceType: url.searchParams.get('deviceType') || undefined,
      isUnique: url.searchParams.get('isUnique') === 'true' ? true : url.searchParams.get('isUnique') === 'false' ? false : undefined,
      isBot: url.searchParams.get('isBot') === 'true' ? true : url.searchParams.get('isBot') === 'false' ? false : undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      search: url.searchParams.get('search') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const linkIds = links.map(link => link.id)

    if (linkIds.length === 0) {
      return NextResponse.json({
        clicks: [],
        total: 0,
        page: params.page,
        totalPages: 0,
        filters: {
          countries: [],
          browsers: [],
          deviceTypes: [],
        },
      }, { headers: getCorsHeaders(origin) })
    }

    const where: any = {
      linkAccountId: { in: linkIds },
    }

    if (params.country) where.country = params.country
    if (params.browser) where.browser = params.browser
    if (params.deviceType) where.deviceType = params.deviceType
    if (params.isUnique !== undefined) where.isUnique = params.isUnique
    if (params.isBot !== undefined) where.isBot = params.isBot

    if (params.startDate || params.endDate) {
      where.createdAt = {}
      if (params.startDate) where.createdAt.gte = new Date(params.startDate)
      if (params.endDate) where.createdAt.lte = new Date(params.endDate + 'T23:59:59')
    }

    if (params.search) {
      where.OR = [
        { ipAddress: { contains: params.search, mode: 'insensitive' } },
        { country: { contains: params.search, mode: 'insensitive' } },
        { referrer: { contains: params.search, mode: 'insensitive' } },
        { browser: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const total = await prisma.click.count({ where })
    const page = params.page ?? 1
    const limit = params.limit ?? 20

    const clicks = await prisma.click.findMany({
      where,
      orderBy: {
        [params.sortBy || 'createdAt']: params.sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        country: true,
        region: true,
        city: true,
        referrer: true,
        browser: true,
        browserVersion: true,
        os: true,
        deviceType: true,
        isUnique: true,
        isBot: true,
        botScore: true,
        createdAt: true,
        linkAccountId: true,
        linkAccount: {
          select: {
            accountName: true,
            slug: true,
          },
        },
      },
    })

    const filterOptions = await prisma.$transaction([
      prisma.click.findMany({
        where: { linkAccountId: { in: linkIds } },
        distinct: ['country'],
        select: { country: true },
        orderBy: { country: 'asc' },
      }),
      prisma.click.findMany({
        where: { linkAccountId: { in: linkIds } },
        distinct: ['browser'],
        select: { browser: true },
        orderBy: { browser: 'asc' },
      }),
      prisma.click.findMany({
        where: { linkAccountId: { in: linkIds } },
        distinct: ['deviceType'],
        select: { deviceType: true },
        orderBy: { deviceType: 'asc' },
      }),
    ])

    return NextResponse.json({
      clicks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        countries: filterOptions[0].map(c => c.country).filter(Boolean),
        browsers: filterOptions[1].map(c => c.browser).filter(Boolean),
        deviceTypes: filterOptions[2].map(c => c.deviceType).filter(Boolean),
      },
    }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching clicks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clicks' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Click id required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const click = await prisma.click.findUnique({
      where: { id },
      include: {
        linkAccount: true,
      },
    })

    if (!click || click.linkAccount.userId !== user.id) {
      return NextResponse.json(
        { error: 'Click not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.$transaction([
      prisma.click.delete({
        where: { id },
      }),
      prisma.linkAccount.update({
        where: { id: click.linkAccountId },
        data: {
          totalClicks: { decrement: 1 },
          ...(click.isUnique ? { uniqueClicks: { decrement: 1 } } : {}),
          ...(click.isBot ? { botClicks: { decrement: 1 } } : {}),
        },
      }),
    ])

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error deleting click:', error)
    return NextResponse.json(
      { error: 'Failed to delete click' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  const response = new NextResponse(null, {
    status: 204,
  })

  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Origin')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}