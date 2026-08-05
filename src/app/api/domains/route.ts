import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserFromToken, getTokenFromCookie, getOwnerUserId, isOwner } from '@/lib/auth';
import { normalizeDomain, isSubdomain } from '@/lib/services/dns/verify';
import {
  addDomainToProject,
  buildVerificationInstructionsFromVercelRecords,
  isDomainVerified,
  verifyDomainOnVercel,
} from '@/lib/services/vercel/domain';
import { getCorsHeaders } from '@/config/cors';
import { z } from 'zod';

const domainSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .transform((value) => normalizeDomain(value)),
}).refine((result) => Boolean(result.domain), {
  message: 'Please enter a valid domain name',
  path: ['domain'],
}).refine((result) => isSubdomain(result.domain), {
  message: 'Only subdomains are supported for custom tracking domains. Use a host like track.example.com.',
  path: ['domain'],
});

// ========== HELPERS ==========

const getVercelConfig = () => ({
  VERCEL_TOKEN: process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN,
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN,
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
  VERCEL_PROJECT_NAME: process.env.VERCEL_PROJECT_NAME,
  VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
});

// ========== GET ==========

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

    const ownerUserId = await getOwnerUserId();
    const whereClause = user.role === 'MANAGER'
      ? { userId: { in: [user.id, ownerUserId].filter((id): id is string => Boolean(id)) } }
      : isOwner(user)
        ? { userId: ownerUserId ? ownerUserId : undefined }
        : { userId: user.id }

    const domains = await prisma.customDomain.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const vercelConfig = getVercelConfig();
    const domainsWithInstructions = await Promise.all(
      domains.map(async (domain) => {
        let verificationInstructions = null;
        let vercelVerification = null;

        try {
          vercelVerification = await verifyDomainOnVercel(domain.domain, vercelConfig);
          verificationInstructions =
            buildVerificationInstructionsFromVercelRecords(
              vercelVerification.verification,
              domain.domain
            );
        } catch {
          // Vercel verification data unavailable
        }

        const isVerified = isDomainVerified(
          { verified: domain.verified },
          vercelVerification,
          Boolean(domain.verified)
        );

        return {
          ...domain,
          verified: isVerified,
          verificationInstructions,
        };
      })
    );

    return NextResponse.json(domainsWithInstructions, {
      headers: {
        ...getCorsHeaders(origin),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

// ========== POST ==========

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

    const createUserId = user.id;

    const body = await request.json();
    const validation = domainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid domain', details: validation.error.errors },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const domain = validation.data.domain;

    const existing = await prisma.customDomain.findUnique({
      where: { domain },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // ─── Create domain record ───
    const newDomain = await prisma.customDomain.create({
      data: {
        domain,
        userId: user.id,
        verified: true,
        verifiedAt: new Date(),
        sslEnabled: false,
        isActive: true,
      },
    });

    const vercelConfig = getVercelConfig();

    // ─── Add domain to Vercel project ───
    const vercelBinding = await addDomainToProject(domain, vercelConfig);

    // ─── Verify domain on Vercel ───
    const vercelVerification = await verifyDomainOnVercel(domain, vercelConfig);

    // ─── Build instructions ───
    const instructions =
      buildVerificationInstructionsFromVercelRecords(
        vercelVerification.verification ?? vercelBinding.verification,
        domain
      ) ?? null;

    return NextResponse.json(
      {
        ...newDomain,
        verificationInstructions: instructions,
        vercelBinding,
        vercelVerification,
        message: 'Domain added. Please add the following DNS records to verify ownership.',
      },
      {
        status: 201,
        headers: {
          ...getCorsHeaders(origin),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

// ========== OPTIONS ==========

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}