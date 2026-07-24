import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth';
import { getCorsHeaders } from '@/config/cors';
import { buildAccountGeoReport } from '@/lib/utils/report-data';

type Period = 'week' | 'month' | 'year';

interface DateRange {
  startDate: Date;
  endDate: Date;
  labels: string[];
  bucketCount: number;
}

interface ClickRecord {
  linkAccountId: string;
  country: string | null;
  browser: string | null;
  deviceType: string | null;
  referrer: string | null;
  createdAt: Date;
  isUnique: boolean;
  isBot: boolean;
}

// ========== HELPERS ==========

const getDateRange = (period: Period): DateRange => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  let startDate = new Date(now);
  let bucketCount = 7;
  let labels: string[] = [];

  if (period === 'month') {
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    bucketCount = 30;
    labels = Array.from({ length: bucketCount }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    bucketCount = 12;
    labels = Array.from({ length: bucketCount }, (_, i) => {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      return d.toLocaleDateString('en-US', { month: 'short' });
    });
  } else {
    // week
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    bucketCount = 7;
    labels = Array.from({ length: bucketCount }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }

  return { startDate, endDate, labels, bucketCount };
};

const getBucketIndex = (clickDate: Date, startDate: Date, period: Period, bucketCount: number): number => {
  if (period === 'year') {
    const diffMonths = (clickDate.getFullYear() - startDate.getFullYear()) * 12 +
      (clickDate.getMonth() - startDate.getMonth());
    return Math.min(bucketCount - 1, Math.max(0, diffMonths));
  }
  const diffMs = clickDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  return Math.min(bucketCount - 1, Math.max(0, diffDays));
};

const aggregateClicks = (clicks: ClickRecord[], period: Period, dateRange: DateRange) => {
  const { startDate, bucketCount } = dateRange;
  const trendValues = Array(bucketCount).fill(0);
  const uniqueTrendValues = Array(bucketCount).fill(0);
  const geoMap = new Map<string, { clicks: number; uniqueClicks: number }>();
  const geoSeriesMap = new Map<string, number[]>();
  const referrerMap = new Map<string, { clicks: number; uniqueClicks: number }>();
  const browserMap = new Map<string, { clicks: number; uniqueClicks: number }>();
  const deviceMap = new Map<string, { clicks: number; uniqueClicks: number }>();

  clicks.forEach((click) => {
    const clickDate = new Date(click.createdAt);
    const bucketIndex = getBucketIndex(clickDate, startDate, period, bucketCount);

    trendValues[bucketIndex] += 1;
    if (click.isUnique) uniqueTrendValues[bucketIndex] += 1;

    const country = (click.country || '').trim();
    if (country) {
      const current = geoMap.get(country) || { clicks: 0, uniqueClicks: 0 };
      current.clicks += 1;
      if (click.isUnique) current.uniqueClicks += 1;
      geoMap.set(country, current);

      const series = geoSeriesMap.get(country) || Array(bucketCount).fill(0);
      series[bucketIndex] += 1;
      geoSeriesMap.set(country, series);
    }

    const referrer = (click.referrer || 'Direct').trim() || 'Direct';
    const rCurrent = referrerMap.get(referrer) || { clicks: 0, uniqueClicks: 0 };
    rCurrent.clicks += 1;
    if (click.isUnique) rCurrent.uniqueClicks += 1;
    referrerMap.set(referrer, rCurrent);

    const browser = (click.browser || 'Unknown').trim() || 'Unknown';
    const bCurrent = browserMap.get(browser) || { clicks: 0, uniqueClicks: 0 };
    bCurrent.clicks += 1;
    if (click.isUnique) bCurrent.uniqueClicks += 1;
    browserMap.set(browser, bCurrent);

    const device = (click.deviceType || 'Unknown').trim() || 'Unknown';
    const dCurrent = deviceMap.get(device) || { clicks: 0, uniqueClicks: 0 };
    dCurrent.clicks += 1;
    if (click.isUnique) dCurrent.uniqueClicks += 1;
    deviceMap.set(device, dCurrent);
  });

  return {
    trendValues,
    uniqueTrendValues,
    geoMap,
    geoSeriesMap,
    referrerMap,
    browserMap,
    deviceMap,
  };
};

const buildHourlyData = async (linkIds: string[], dateRange: DateRange) => {
  const now = new Date();
  const hourlyStart = new Date(now);
  hourlyStart.setHours(0, 0, 0, 0);

  const hourlyClicks = linkIds.length
    ? await prisma.click.findMany({
        where: {
          linkAccountId: { in: linkIds },
          createdAt: {
            gte: hourlyStart,
            lte: dateRange.endDate,
          },
        },
        select: { createdAt: true, isUnique: true },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  const hourlyTrend = Array(24).fill(0);
  const hourlyUnique = Array(24).fill(0);
  hourlyClicks.forEach((click) => {
    const hour = new Date(click.createdAt).getHours();
    hourlyTrend[hour] += 1;
    if (click.isUnique) hourlyUnique[hour] += 1;
  });

  return { hourlyTrend, hourlyUnique };
};

// ========== MAIN HANDLER ==========

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || null;
  const cookieHeader = request.headers.get('cookie') || '';
  const token = getTokenFromCookie(cookieHeader);

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: getCorsHeaders(origin) }
    );
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    // If using a local test user, return mock data
    if (user.id && typeof user.id === 'string' && user.id.startsWith('local-')) {
      return NextResponse.json(
        {
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
          accountGeoReport: { labels: [], datasets: [], accountBreakdown: [] },
        },
        { headers: getCorsHeaders(origin) }
      );
    }

    const url = new URL(request.url);
    const period = (url.searchParams.get('period') || 'week') as Period;
    const dateRange = getDateRange(period);

    // Get user's links
    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true, accountName: true },
    });

    const linkIds = links.map((l) => l.id);
    const linkAccounts = links.map((l) => ({ id: l.id, accountName: l.accountName }));

    // Early exit if no links
    if (linkIds.length === 0) {
      return NextResponse.json(
        {
          totalClicks: 0,
          uniqueClicks: 0,
          botClicks: 0,
          totalLinks: 0,
          geoData: [],
          chartData: { labels: dateRange.labels, datasets: [] },
          hourlyChartData: {
            labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
            datasets: [
              {
                label: 'Hourly Clicks',
                data: Array(24).fill(0),
                borderColor: '#0EA5E9',
                backgroundColor: 'rgba(14, 165, 233, 0.18)',
                fill: true,
                tension: 0.35,
                pointRadius: 2,
              },
              {
                label: 'Hourly Unique',
                data: Array(24).fill(0),
                borderColor: '#A855F7',
                backgroundColor: 'rgba(168, 85, 247, 0.14)',
                fill: true,
                tension: 0.35,
                pointRadius: 2,
              },
            ],
          },
          accountGeoReport: { labels: [], datasets: [], accountBreakdown: [] },
        },
        { headers: getCorsHeaders(origin) }
      );
    }

    // Fetch all clicks in the period
    const clicks = await prisma.click.findMany({
      where: {
        linkAccountId: { in: linkIds },
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: {
        linkAccountId: true,
        country: true,
        browser: true,
        deviceType: true,
        referrer: true,
        createdAt: true,
        isUnique: true,
        isBot: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate
    const aggregated = aggregateClicks(clicks, period, dateRange);

    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter((c) => c.isUnique).length;
    const botClicks = clicks.filter((c) => c.isBot).length;

    const countryBreakdown = Array.from(aggregated.geoMap.entries())
      .map(([country, values]) => ({ country, ...values }))
      .sort((a, b) => b.clicks - a.clicks);

    const referrerBreakdown = Array.from(aggregated.referrerMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4);

    const browserBreakdown = Array.from(aggregated.browserMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4);

    const deviceBreakdown = Array.from(aggregated.deviceMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4);

    // Top 5 countries for geoData
    const geoData = countryBreakdown.slice(0, 5);

    // Highlighted countries (top 3 for chart)
    const highlightedCountries = countryBreakdown.slice(0, 3);
    const countryColors = ['#38BDF8', '#F59E0B', '#F472B6'];
    const geoDatasets = highlightedCountries.map((countryItem, index) => ({
      label: countryItem.country,
      data: aggregated.geoSeriesMap.get(countryItem.country) || Array(dateRange.bucketCount).fill(0),
      borderColor: countryColors[index % countryColors.length],
      backgroundColor: `${countryColors[index % countryColors.length]}22`,
      fill: false,
      tension: 0.35,
      pointRadius: 2,
    }));

    // Build chart data
    const chartData = {
      labels: dateRange.labels,
      datasets: [
        {
          label: 'Clicks',
          data: aggregated.trendValues,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Unique Visitors',
          data: aggregated.uniqueTrendValues,
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        ...geoDatasets,
      ],
    };

    // Hourly data
    const hourlyData = await buildHourlyData(linkIds, dateRange);
    const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const hourlyChartData = {
      labels: hourlyLabels,
      datasets: [
        {
          label: 'Hourly Clicks',
          data: hourlyData.hourlyTrend,
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 233, 0.18)',
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: 'Hourly Unique',
          data: hourlyData.hourlyUnique,
          borderColor: '#A855F7',
          backgroundColor: 'rgba(168, 85, 247, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    };

    // Account geo report
    const accountGeoReport = buildAccountGeoReport(clicks, linkAccounts);

    return NextResponse.json(
      {
        totalClicks,
        uniqueClicks,
        botClicks,
        totalLinks: links.length,
        countryBreakdown,
        geoData,
        referrerBreakdown,
        browserBreakdown,
        deviceBreakdown,
        chartData,
        hourlyChartData,
        accountGeoReport,
      },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}