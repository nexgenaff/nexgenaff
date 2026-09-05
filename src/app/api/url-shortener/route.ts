import { NextRequest, NextResponse } from 'next/server'
import { landingPrisma } from '@/lib/db/landing-prisma'
import { getTokenFromCookie, getUserFromToken, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const shortUrlSchema = z.object({
  subdomain: z
    .string()
    .trim()
    .min(3, 'Short name must be at least 3 characters')
    .max(63, 'Short name must be 63 characters or less')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i, 'Use only letters, numbers, and hyphens'),
  trackingUrl: z.string().trim().url('Destination must be a valid URL'),
})

export async function getShortenerAccess(req: NextRequest): Promise<{ userId: string; showAll: boolean } | null> {
  const token = getTokenFromCookie(req.headers.get('cookie') || '')
  if (!token) return null

  if (process.env.NODE_ENV === 'development') {
    const userId = verifyToken(token)?.userId
    return userId ? { userId, showAll: true } : null
  }

  const user = await getUserFromToken(token)
  if (!user) return null
  return { userId: user.id, showAll: user.role === 'MANAGER' || user.role === 'OWNER' }
}

export async function GET(req: NextRequest) {
  try {
    const access = await getShortenerAccess(req)
    if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shortUrls = await landingPrisma.landingPage.findMany({
      where: {
        ...(access.showAll ? {} : { userId: access.userId }),
        template: { name: 'URL Shortener' },
      },
      select: {
        id: true,
        subdomain: true,
        trackingUrl: true,
        userId: true,
        totalClicks: true,
        createdAt: true,
        template: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(shortUrls)
  } catch (error) {
    console.error('Error loading short URLs:', error)
    const message = error instanceof Error ? error.message : 'Failed to load short URLs'
    return NextResponse.json({
      error: process.env.NODE_ENV === 'development' ? message : 'Failed to load short URLs',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getShortenerAccess(req)
    if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = access.userId

    const result = shortUrlSchema.safeParse(await req.json())
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    const { subdomain, trackingUrl } = result.data
    const existing = await landingPrisma.landingPage.findUnique({ where: { subdomain } })
    if (existing) return NextResponse.json({ error: 'That short URL is already in use' }, { status: 409 })

    const template = await landingPrisma.landingPageTemplate.findFirst({
      where: { name: 'URL Shortener' },
    })
    const shortenerTemplate = template || await landingPrisma.landingPageTemplate.create({
      data: {
        name: 'URL Shortener',
        description: 'System template for tracked short URLs',
        htmlContent: '<!doctype html><html><body></body></html>',
        createdBy: userId,
      },
    })

    const page = await landingPrisma.landingPage.create({
      data: {
        subdomain,
        trackingUrl,
        templateId: shortenerTemplate.id,
        userId,
        buttonText: 'Open link',
        isPublished: true,
        publishedAt: new Date(),
      },
      select: { id: true, subdomain: true, trackingUrl: true, userId: true, totalClicks: true, createdAt: true },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating short URL:', error)
    const message = error instanceof Error ? error.message : 'Failed to create short URL'
    return NextResponse.json({
      error: process.env.NODE_ENV === 'development' ? message : 'Failed to create short URL',
    }, { status: 500 })
  }
}