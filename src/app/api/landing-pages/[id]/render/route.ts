import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { renderLandingPageHtml } from '@/lib/utils/landing-page-render'

const prisma = new PrismaClient()

// GET rendered HTML for a landing page
// Replaces all variables with actual values
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')

    const landingPage = await prisma.landingPage.findUnique({
      where: { id: params.id },
      include: { template: true },
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

    // Render HTML with variables replaced
    const renderedHtml = renderLandingPageHtml(landingPage.template?.htmlContent || '', {
      headline: landingPage.headline || '',
      description: landingPage.description || '',
      imageUrl: landingPage.imageUrl || '',
      buttonText: landingPage.buttonText || '',
      linkUrl: landingPage.trackingUrl || '',
    })

    return NextResponse.json({
      id: landingPage.id,
      subdomain: landingPage.subdomain,
      htmlContent: renderedHtml,
      originalHtml: landingPage.template?.htmlContent,
    })
  } catch (error) {
    console.error('Error rendering landing page:', error)
    return NextResponse.json(
      { error: 'Failed to render landing page' },
      { status: 500 }
    )
  }
}
