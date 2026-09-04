import { landingPrisma } from '@/lib/db/landing-prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch a specific template
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const template = await landingPrisma.landingPageTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PUT - Update template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const { name, description, thumbnail, customText, htmlContent, userId, userRole } = await req.json()

    // Only OWNER can update templates
    if (userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owners can update templates' },
        { status: 403 }
      )
    }

    // Verify ownership
    const template = await landingPrisma.landingPageTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (template.createdBy !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own templates' },
        { status: 403 }
      )
    }

    const updated = await landingPrisma.landingPageTemplate.update({
      where: { id },
      data: {
        name,
        description,
        thumbnail,
        customText,
        htmlContent,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[DELETE API] Starting DELETE request')
  
  try {
    const { id: templateId } = await params
    console.log('[DELETE API] Template ID:', templateId)
    
    const userRole = req.headers.get('x-user-role')
    console.log('[DELETE API] User Role:', userRole)

    if (userRole !== 'OWNER') {
      console.log('[DELETE API] Access denied - not owner')
      return NextResponse.json(
        { error: 'Only owners can delete templates' },
        { status: 403 }
      )
    }

    if (!templateId) {
      console.log('[DELETE API] No template ID provided')
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    console.log('[DELETE API] Attempting to find template:', templateId)
    const template = await landingPrisma.landingPageTemplate.findUnique({
      where: { id: templateId },
    })
    console.log('[DELETE API] Template found:', template?.name)

    if (!template) {
      console.log('[DELETE API] Template not found')
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    console.log('[DELETE API] Updating template to mark as inactive')
    const updateResult = await landingPrisma.landingPageTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    })
    console.log('[DELETE API] Template updated successfully:', updateResult.name)

    return NextResponse.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    console.error('[DELETE API] Exception caught:', error)
    if (error instanceof Error) {
      console.error('[DELETE API] Error message:', error.message)
      console.error('[DELETE API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Failed to delete template', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
