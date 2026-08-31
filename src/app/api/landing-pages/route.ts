import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, getTokenFromCookie, getOwnerUserId, isManager, isOwner } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import { z } from 'zod'

const prisma = new PrismaClient()

// Zod schema for landing page creation
const landingPageSchema = z.object({
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .max(63, 'Subdomain must be 63 characters or less')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i, 'Subdomain can only contain letters, numbers, and hyphens'),
  trackingUrl: z.string().url('Tracking URL must be a valid URL'),
  templateId: z.string().min(1, 'Template ID is required'),
  headline: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
  buttonText: z.string().optional(),
})

// GET all landing pages for user
export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') || null
    const cookieHeader = req.headers.get('cookie') || ''
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

    const landingPages = await prisma.landingPage.findMany({
      where: isOwner(user) ? undefined : { userId: user.id },
      include: {
        template: true,
        user: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(landingPages, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    )
  }
}

// POST create new landing page
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') || null
    const cookieHeader = req.headers.get('cookie') || ''
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

    // Parse and validate input
    const body = await req.json()
    const validationResult = landingPageSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const { subdomain, trackingUrl, templateId, headline, description, imageUrl, buttonText } = validationResult.data

    if (isManager(user)) {
      const trackingHostname = new URL(trackingUrl).hostname.toLowerCase().replace(/\.$/, '')
      const ownerUserId = await getOwnerUserId()
      const domainUserIds = [user.id, ...(ownerUserId ? [ownerUserId] : [])]
      const availableCustomDomain = await prisma.customDomain.findFirst({
        where: {
          userId: { in: domainUserIds },
          domain: {
            equals: trackingHostname,
            mode: 'insensitive',
          },
          verified: true,
          isActive: true,
        },
        select: { id: true },
      })

      if (!availableCustomDomain) {
        return NextResponse.json(
          { error: 'Tracking link domain must match your verified and active custom domain.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }
    }

    // Use transaction to prevent race condition on subdomain uniqueness
    const landingPage = await prisma.$transaction(async (tx) => {
      // Check if subdomain is already taken by another landing page
      const existing = await tx.landingPage.findUnique({
        where: { subdomain },
      })

      if (existing) {
        throw new Error('Subdomain already taken')
      }

      // Check if subdomain conflicts with custom domains
      const customDomainConflict = await tx.customDomain.findFirst({
        where: {
          domain: {
            contains: subdomain,
          },
        },
      })

      if (customDomainConflict) {
        throw new Error('Subdomain conflicts with existing custom domain')
      }

      return tx.landingPage.create({
        data: {
          subdomain,
          trackingUrl,
          templateId,
          userId: user.id,
          headline: headline || undefined,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          buttonText: buttonText || 'Get Started',
          isPublished: true,
          publishedAt: new Date().toISOString(),
        },
        include: { template: true },
      })
    }, {
      // SERIALIZABLE isolation prevents phantom reads and race conditions
      isolationLevel: 'Serializable' as const,
      maxWait: 5000,
      timeout: 10000,
    })

    return NextResponse.json(landingPage, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error creating landing page:', error)
    const message = error instanceof Error ? error.message : 'Failed to create landing page'
    const status = message === 'Subdomain already taken' ? 400 : 500
    return NextResponse.json(
      { error: message },
      { status, headers: getCorsHeaders(origin) }
    )
  }
}
