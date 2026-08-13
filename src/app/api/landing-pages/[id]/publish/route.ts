import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// POST publish/unpublish landing page
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    const { isPublished } = await req.json()

    const landingPage = await prisma.landingPage.findUnique({
      where: { id: params.id },
    })

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (landingPage.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updated = await prisma.landingPage.update({
      where: { id: params.id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { template: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error publishing landing page:', error)
    return NextResponse.json(
      { error: 'Failed to publish landing page' },
      { status: 500 }
    )
  }
}
