import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth';
import { getCorsHeaders } from '@/config/cors';

const MAX_EXPORT_ROWS = 100000; // Prevent memory exhaustion

// ========== CSV ESCAPING ==========
const escapeCsvField = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If field contains comma, double quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || null;
    const cookieHeader = request.headers.get('cookie') || '';
    const token = getTokenFromCookie(cookieHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    const url = new URL(request.url);
    const country = url.searchParams.get('country') || undefined;
    const browser = url.searchParams.get('browser') || undefined;
    const deviceType = url.searchParams.get('deviceType') || undefined;
    const isUnique =
      url.searchParams.get('isUnique') === 'true'
        ? true
        : url.searchParams.get('isUnique') === 'false'
        ? false
        : undefined;
    const isBot =
      url.searchParams.get('isBot') === 'true'
        ? true
        : url.searchParams.get('isBot') === 'false'
        ? false
        : undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const limit = Math.min(
      Number(url.searchParams.get('limit')) || MAX_EXPORT_ROWS,
      MAX_EXPORT_ROWS
    );

    // Get all link IDs for the user
    const links = await prisma.linkAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const linkIds = links.map((link) => link.id);

    // Build filter
    const where: any = {
      linkAccountId: { in: linkIds },
    };

    if (country) where.country = country;
    if (browser) where.browser = browser;
    if (deviceType) where.deviceType = deviceType;
    if (isUnique !== undefined) where.isUnique = isUnique;
    if (isBot !== undefined) where.isBot = isBot;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { referrer: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch clicks with limit
    const clicks = await prisma.click.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
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
        deviceBrand: true,
        userAgent: true,
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
    });

    // Build CSV headers
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
      'Device Brand',
      'User Agent',
      'Unique',
      'Bot',
      'Bot Score',
      'Link Account',
      'Slug',
    ];

    // Build rows with escaping
    const rows = clicks.map((click) => [
      escapeCsvField(click.createdAt.toISOString()),
      escapeCsvField(click.ipAddress),
      escapeCsvField(click.country),
      escapeCsvField(click.region),
      escapeCsvField(click.city),
      escapeCsvField(click.referrer),
      escapeCsvField(click.browser),
      escapeCsvField(click.browserVersion),
      escapeCsvField(click.os),
      escapeCsvField(click.deviceType),
      escapeCsvField(click.deviceBrand),
      escapeCsvField(click.userAgent),
      escapeCsvField(click.isUnique ? 'Yes' : 'No'),
      escapeCsvField(click.isBot ? 'Yes' : 'No'),
      escapeCsvField(click.botScore),
      escapeCsvField(click.linkAccount.accountName),
      escapeCsvField(click.linkAccount.slug),
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.map(escapeCsvField).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Optionally warn if limit was reached
    const truncated = clicks.length === limit ? ' (truncated)' : '';

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=clicks-${new Date().toISOString().split('T')[0]}${truncated}.csv`,
        ...getCorsHeaders(origin),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export clicks' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
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