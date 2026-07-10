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

    const url = new URL(request.url)
    const country = url.searchParams.get('country') || undefined
    const browser = url.searchParams.get('browser') || undefined
    const deviceType = url.searchParams.get('deviceType') || undefined
    const isUnique = url.searchParams.get('isUnique') === 'true' ? true : url.searchParams.get('isUnique') === 'false' ? false : undefined
    const isBot = url.searchParams.get('isBot') === 'true' ? true : url.searchParams.get('isBot') === 'false' ? false : undefined
    const startDate = url.searchParams.get('startDate') || undefined
    const endDate = url.searchParams.get('endDate') || undefined
    const search = url.searchParams.get('search') || undefined

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const linkIds = links.map(link => link.id)

    const where: any = {
      linkAccountId: { in: linkIds },
    }

    if (country) where.country = country
    if (browser) where.browser = browser
    if (deviceType) where.deviceType = deviceType
    if (isUnique !== undefined) where.isUnique = isUnique
    if (isBot !== undefined) where.isBot = isBot

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { referrer: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
      ]
    }

    const clicks = await prisma.click.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
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
        linkAccount: {
          select: {
            accountName: true,
            slug: true,
          },
        },
      },
    })

    const headers = [
      'Date',
      'IP Address',
      'Country',
      'Region',
      'City',
      'Referrer',
      'Browser',
      'Browser Version',
      'OS',
      'Device Type',
      'Unique',
      'Bot',
      'Bot Score',
      'Link Account',
      'Slug',
    ]

    const rows = clicks.map((click) => [
      click.createdAt.toISOString(),
      click.ipAddress,
      click.country || '',
      click.region || '',
      click.city || '',
      click.referrer || '',
      click.browser || '',
      click.browserVersion || '',
      click.os || '',
      click.deviceType || '',
      click.isUnique ? 'Yes' : 'No',
      click.isBot ? 'Yes' : 'No',
      click.botScore || '',
      click.linkAccount.accountName,
      click.linkAccount.slug,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=clicks-${new Date().toISOString().split('T')[0]}.csv`,
        ...getCorsHeaders(origin),
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export clicks' },
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