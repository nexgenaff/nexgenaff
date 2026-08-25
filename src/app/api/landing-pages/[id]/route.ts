import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookie, getUserFromToken, isOwner } from '@/lib/auth'

const prisma = new PrismaClient()

// GET specific landing page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')
    const { id } = await params
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
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

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing page' },
      { status: 500 }
    )
  }
}

// PUT update landing page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')
    const { id } = await params
    const updates = await req.json()

    const landingPage = await prisma.landingPage.findUnique({
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

    const updated = await prisma.landingPage.update({
      where: { id },
      data: updates,
      include: { template: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json(
      { error: 'Failed to update landing page' },
      { status: 500 }
    )
  }
}

// DELETE landing page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')
    const token = getTokenFromCookie(req.headers.get('cookie') || '')
    const currentUser = token ? await getUserFromToken(token) : null
    const { id } = await params

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
    })

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // Owners can remove any landing page; other users can remove only their own.
    if (!currentUser || (!isOwner(currentUser) && landingPage.userId !== userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.landingPage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing page:', error)
    return NextResponse.json(
      { error: 'Failed to delete landing page' },
      { status: 500 }
    )
  }
}
