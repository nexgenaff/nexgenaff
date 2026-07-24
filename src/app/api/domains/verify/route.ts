import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth';
import { getVerificationInstructions, verifyDomain } from '@/lib/services/dns/verify';
import { buildVerificationInstructionsFromVercelRecords, verifyDomainOnVercel } from '@/lib/services/vercel/domain';
import { getCorsHeaders } from '@/config/cors';
import { z } from 'zod';

const verifySchema = z.object({
  domainId: z.string(),
});

export async function POST(request: Request) {
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

    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const domain = await prisma.customDomain.findUnique({
      where: { id: validation.data.domainId },
    });

    if (!domain || domain.userId !== user.id) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }

    // ─── Run DNS verification ───
    const dnsVerification = await verifyDomain(domain.domain, user.id);

    // ─── Run Vercel verification ───
    const vercelToken = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
    if (!vercelToken) {
      console.warn('Vercel token not configured – skipping Vercel verification.');
    }

    const vercelVerification = vercelToken
      ? await verifyDomainOnVercel(domain.domain, {
          VERCEL_TOKEN: vercelToken,
          VERCEL_API_TOKEN: vercelToken,
          VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
          VERCEL_PROJECT_NAME: process.env.VERCEL_PROJECT_NAME,
          VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
        })
      : null;

    const isVerified = dnsVerification.verified && Boolean(vercelVerification?.verified);

    // ─── Update domain status if verified ───
    if (isVerified) {
      await prisma.customDomain.update({
        where: { id: domain.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });
    }

    // ─── Build instructions ───
    const fallbackInstructions = getVerificationInstructions(domain.domain, user.id);
    const instructions =
      buildVerificationInstructionsFromVercelRecords(
        vercelVerification?.verification,
        domain.domain
      ) ?? fallbackInstructions;

    return NextResponse.json(
      {
        domainId: domain.id,
        domain: domain.domain,
        verified: isVerified,
        dnsVerification,
        vercelVerification,
        instructions,
      },
      {
        headers: {
          ...getCorsHeaders(origin),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
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