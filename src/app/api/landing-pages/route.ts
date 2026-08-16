import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

const prisma = new PrismaClient()

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
      where: { userId: user.id },
      include: { template: true },
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

    const { subdomain, trackingUrl, templateId, headline, description, imageUrl, buttonText } = await req.json()

    // Use transaction to prevent race condition on subdomain uniqueness
    const landingPage = await prisma.$transaction(async (tx) => {
      // Check if subdomain is already taken
      const existing = await tx.landingPage.findUnique({
        where: { subdomain },
      })

      if (existing) {
        throw new Error('Subdomain already taken')
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
      // Retry on race condition
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
