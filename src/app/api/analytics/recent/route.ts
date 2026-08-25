import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';
import { getUserFromToken, getTokenFromCookie, getOwnerUserId } from '@/lib/auth';
import { getCorsHeaders } from '@/config/cors';
import { getLinkAccountVisibilityWhereClause } from '@/lib/utils/link-account-access';

const RECENT_CLICKS_LIMIT = 20;

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || null;

  try {
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

    // Local test users follow the same data paths as real users — do not
    // short-circuit with an empty result so managers/owners see actual data.

    const ownerUserId = await getOwnerUserId();
    const linkWhere = getLinkAccountVisibilityWhereClause(user, ownerUserId) as Prisma.LinkAccountWhereInput;

    const links = await prisma.linkAccount.findMany({
      where: linkWhere,
      select: { id: true },
    });

    const linkIds = links.map((link) => link.id);

    if (linkIds.length === 0) {
      return NextResponse.json([], { headers: getCorsHeaders(origin) });
    }

    const clicks = await prisma.click.findMany({
      where: { linkAccountId: { in: linkIds }, isBot: false },
      orderBy: { createdAt: 'desc' },
      take: RECENT_CLICKS_LIMIT,
      select: {
        id: true,
        country: true,
        browser: true,
        createdAt: true,
        isUnique: true,
        isBot: true,
      },
    });

    return NextResponse.json(clicks, { headers: getCorsHeaders(origin) });
  } catch (error) {
    console.error('Error fetching recent clicks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent clicks' },
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