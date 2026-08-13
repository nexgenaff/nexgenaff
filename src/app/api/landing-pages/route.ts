import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET all landing pages for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const landingPages = await prisma.landingPage.findMany({
      where: { userId },
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(landingPages)
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
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const { subdomain, trackingUrl, templateId, headline, description, imageUrl, buttonText } = await req.json()

    // Check if subdomain is already taken
    const existing = await prisma.landingPage.findUnique({
      where: { subdomain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      )
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        subdomain,
        trackingUrl,
        templateId,
        userId,
        headline: headline || undefined,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        buttonText: buttonText || 'Get Started',
        isPublished: true,
        publishedAt: new Date().toISOString(),
      },
      include: { template: true },
    })

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error('Error creating landing page:', error)
    return NextResponse.json(
      { error: 'Failed to create landing page' },
      { status: 500 }
    )
  }
}
