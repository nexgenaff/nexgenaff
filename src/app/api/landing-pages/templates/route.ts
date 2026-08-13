import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all templates or specific templates
// POST create new template (OWNER only)
export async function GET(req: NextRequest) {
  try {
    console.log('[TEMPLATES API] Fetching templates...')
    const templates = await prisma.landingPageTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
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
    const { name, description, thumbnail, htmlContent, userId, userRole } = await req.json()

    // Only OWNER can create templates
    if (userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owners can create templates' },
        { status: 403 }
      )
    }

    const template = await prisma.landingPageTemplate.create({
      data: {
        name,
        description,
        thumbnail,
        htmlContent,
        createdBy: userId,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
