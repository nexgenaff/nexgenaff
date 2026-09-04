import { landingPrisma } from '@/lib/db/landing-prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all templates or specific templates
// POST create new template (OWNER only)
export async function GET(req: NextRequest) {
  try {
    console.log('[TEMPLATES API] Fetching templates...')
    const templates = await landingPrisma.landingPageTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        customText: true,
        htmlContent: true,
      },
    })

    console.log('[TEMPLATES API] Found', templates.length, 'templates')
    return NextResponse.json(templates)
  } catch (error) {
    console.error('[TEMPLATES API] Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, thumbnail, customText, htmlContent, userId, userRole } = await req.json()

    console.log('[TEMPLATES API] Creating template:', { name, userRole })

    // Only OWNER can create templates
    if (userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owners can create templates' },
        { status: 403 }
      )
    }

    const template = await landingPrisma.landingPageTemplate.create({
      data: {
        name,
        description,
        thumbnail,
        customText,
        htmlContent,
        createdBy: userId,
      },
    })

    console.log('[TEMPLATES API] Template created:', template.id)
    return NextResponse.json(template)
  } catch (error) {
    console.error('[TEMPLATES API] Error creating template:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create template',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
