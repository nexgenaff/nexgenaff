import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    if (!token) {
      if (debug) {
        return NextResponse.json(
          { error: 'Unauthorized', details: { cookieHeader } },
          { status: 401, headers: getCorsHeaders(origin) }
        )
      }

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    let user = null
    try {
      user = await getUserFromToken(token)
    } catch (err: unknown) {
      console.error('getUserFromToken error:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      if (debug) {
        return NextResponse.json({ error: 'getUserFromToken failed', message: error.message, stack: error.stack }, { status: 500, headers: getCorsHeaders(origin) })
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    if (!user) {
      if (debug) {
        return NextResponse.json({ error: 'Unauthorized', details: { token } }, { status: 401, headers: getCorsHeaders(origin) })
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    if (user.id && typeof user.id === 'string' && user.id.startsWith('local-')) {
      return NextResponse.json({
        totalClicks: 0,
        uniqueClicks: 0,
        botClicks: 0,
        totalLinks: 0,
        geoData: [],
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Clicks',
              data: [0, 0, 0, 0, 0, 0, 0],
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.14)',
              fill: true,
              tension: 0.35,
              pointRadius: 3,
            },
          ],
        },
      }, { headers: getCorsHeaders(origin) })
    }

    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const linkIds = links.map(link => link.id)

    const requestedPeriod = url.searchParams.get('period') || 'week'
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    let startDate = new Date(now)
    let labels: string[] = []
    let bucketCount = 7

    if (requestedPeriod === 'month') {
      startDate.setDate(startDate.getDate() - 29)
      startDate.setHours(0, 0, 0, 0)
      bucketCount = 30
      labels = Array.from({ length: bucketCount }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    } else if (requestedPeriod === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      startDate.setHours(0, 0, 0, 0)
      bucketCount = 12
      labels = Array.from({ length: bucketCount }, (_, index) => {
        const date = new Date(startDate)
        date.setMonth(startDate.getMonth() + index)
        return date.toLocaleDateString('en-US', { month: 'short' })
      })
    } else {
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
      labels = Array.from({ length: bucketCount }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }

    const clicks = linkIds.length
      ? await prisma.click.findMany({
          where: {
            linkAccountId: { in: linkIds },
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            country: true,
            browser: true,
            deviceType: true,
            referrer: true,
            createdAt: true,
            isUnique: true,
            isBot: true,
          },
          orderBy: { createdAt: 'asc' },
        })
      : []

    const totalClicks = clicks.length
    const uniqueClicks = clicks.filter((click) => click.isUnique).length
    const botClicks = clicks.filter((click) => click.isBot).length

    const trendValues = Array.from({ length: bucketCount }, () => 0)
    const uniqueTrendValues = Array.from({ length: bucketCount }, () => 0)
    const geoMap = new Map<string, { clicks: number; uniqueClicks: number }>()
    const geoSeriesMap = new Map<string, number[]>()
    const referrerMap = new Map<string, { clicks: number; uniqueClicks: number }>()
    const browserMap = new Map<string, { clicks: number; uniqueClicks: number }>()
    const deviceMap = new Map<string, { clicks: number; uniqueClicks: number }>()

    clicks.forEach((click) => {
      const clickDate = new Date(click.createdAt)
      let bucketIndex = 0

      if (requestedPeriod === 'month') {
        bucketIndex = Math.min(bucketCount - 1, Math.max(0, Math.floor((clickDate.getTime() - startDate.getTime()) / 86400000)))
      } else if (requestedPeriod === 'year') {
        bucketIndex = Math.min(
          bucketCount - 1,
          Math.max(0, (clickDate.getFullYear() - startDate.getFullYear()) * 12 + (clickDate.getMonth() - startDate.getMonth()))
        )
      } else {
        bucketIndex = Math.min(bucketCount - 1, Math.max(0, Math.floor((clickDate.getTime() - startDate.getTime()) / 86400000)))
      }

      trendValues[bucketIndex] += 1
      if (click.isUnique) uniqueTrendValues[bucketIndex] += 1

      const country = (click.country || '').trim()
      if (!country) return

      const current = geoMap.get(country) || { clicks: 0, uniqueClicks: 0 }
      current.clicks += 1
      if (click.isUnique) current.uniqueClicks += 1
      geoMap.set(country, current)

      const countrySeries = geoSeriesMap.get(country) || Array.from({ length: bucketCount }, () => 0)
      countrySeries[bucketIndex] += 1
      geoSeriesMap.set(country, countrySeries)

      const referrer = (click.referrer || 'Direct').trim() || 'Direct'
      const referrerCurrent = referrerMap.get(referrer) || { clicks: 0, uniqueClicks: 0 }
      referrerCurrent.clicks += 1
      if (click.isUnique) referrerCurrent.uniqueClicks += 1
      referrerMap.set(referrer, referrerCurrent)

      const browser = (click.browser || 'Unknown').trim() || 'Unknown'
      const browserCurrent = browserMap.get(browser) || { clicks: 0, uniqueClicks: 0 }
      browserCurrent.clicks += 1
      if (click.isUnique) browserCurrent.uniqueClicks += 1
      browserMap.set(browser, browserCurrent)

      const device = (click.deviceType || 'Unknown').trim() || 'Unknown'
      const deviceCurrent = deviceMap.get(device) || { clicks: 0, uniqueClicks: 0 }
      deviceCurrent.clicks += 1
      if (click.isUnique) deviceCurrent.uniqueClicks += 1
      deviceMap.set(device, deviceCurrent)
    })

    const countryBreakdown = Array.from(geoMap.entries())
      .map(([country, values]) => ({ country, ...values }))
      .sort((a, b) => b.clicks - a.clicks)

    const referrerBreakdown = Array.from(referrerMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4)

    const browserBreakdown = Array.from(browserMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4)

    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4)

    const geoData = countryBreakdown.slice(0, 5)
    const highlightedCountries = countryBreakdown.slice(0, 3)
    const countryColors = ['#38BDF8', '#F59E0B', '#F472B6']

    const geoDatasets = highlightedCountries.map((countryItem, index) => ({
      label: countryItem.country,
      data: geoSeriesMap.get(countryItem.country) || Array.from({ length: bucketCount }, () => 0),
      borderColor: countryColors[index % countryColors.length],
      backgroundColor: `${countryColors[index % countryColors.length]}22`,
      fill: false,
      tension: 0.35,
      pointRadius: 2,
    }))

    const hourlyLabels = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)
    const hourlyTrendValues = Array.from({ length: 24 }, () => 0)
    const hourlyUniqueValues = Array.from({ length: 24 }, () => 0)
    const hourlyStart = new Date(now)
    hourlyStart.setHours(0, 0, 0, 0)
    const hourlyClicks = linkIds.length
      ? await prisma.click.findMany({
          where: {
            linkAccountId: { in: linkIds },
            createdAt: {
              gte: hourlyStart,
              lte: endDate,
            },
          },
          select: {
            createdAt: true,
            isUnique: true,
          },
          orderBy: { createdAt: 'asc' },
        })
      : []

    hourlyClicks.forEach((click) => {
      const clickDate = new Date(click.createdAt)
      const hourIndex = clickDate.getHours()
      hourlyTrendValues[hourIndex] += 1
      if (click.isUnique) hourlyUniqueValues[hourIndex] += 1
    })

    return NextResponse.json({
      totalClicks,
      uniqueClicks,
      botClicks,
      totalLinks: links.length,
      countryBreakdown,
      geoData,
      referrerBreakdown,
      browserBreakdown,
      deviceBreakdown,
      chartData: {
        labels,
        datasets: [
          {
            label: 'Clicks',
            data: trendValues,
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.14)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
          {
            label: 'Unique Visitors',
            data: uniqueTrendValues,
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
          ...geoDatasets,
        ],
      },
      hourlyChartData: {
        labels: hourlyLabels,
        datasets: [
          {
            label: 'Hourly Clicks',
            data: hourlyTrendValues,
            borderColor: '#0EA5E9',
            backgroundColor: 'rgba(14, 165, 233, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: 'Hourly Unique',
            data: hourlyUniqueValues,
            borderColor: '#A855F7',
            backgroundColor: 'rgba(168, 85, 247, 0.14)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
    }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Dashboard stats error:', error)
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