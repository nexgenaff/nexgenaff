import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { renderLandingPageHtml } from '@/lib/utils/landing-page-render'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> | { subdomain: string } }
) {
  try {
    // Handle both Promise and direct params (for compatibility with different Next.js versions)
    const resolvedParams = params instanceof Promise ? await params : params
    const subdomain = resolvedParams.subdomain.toLowerCase()

    // Find the landing page
    const landingPage = await prisma.landingPage.findUnique({
      where: { subdomain },
      include: { template: true },
    })

    if (!landingPage || !landingPage.isPublished) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // Increment click count
    await prisma.landingPage.update({
      where: { id: landingPage.id },
      data: { totalClicks: { increment: 1 } },
    })

    // Render HTML with variables replaced, including tracking link
    const renderedHtml = renderLandingPageHtml(landingPage.template?.htmlContent || '', {
      headline: landingPage.headline || '',
      description: landingPage.description || '',
      imageUrl: landingPage.imageUrl || '',
      buttonText: landingPage.buttonText || '',
      linkUrl: landingPage.trackingUrl || '',
    })

    // Return rendered HTML
    return new NextResponse(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error handling landing page:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
