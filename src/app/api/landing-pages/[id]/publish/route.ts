import { NextRequest, NextResponse } from 'next/server'
import { landingPrisma } from '@/lib/db/landing-prisma'

// POST publish/unpublish landing page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')
    const { isPublished } = await req.json()
    const { id } = await params

    const landingPage = await landingPrisma.landingPage.findUnique({
      where: { id },
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

    const updated = await landingPrisma.landingPage.update({
      where: { id },
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
