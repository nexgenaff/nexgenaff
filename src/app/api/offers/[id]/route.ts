import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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

    const body = await request.json()
    const { country, groupName, offerUrl, isActive, isGlobal, priority, rotationMode } = body

    const offer = await prisma.offerVault.findUnique({
      where: { id },
    })

    if (!offer || offer.userId !== user.id) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    const nextCountry = Boolean(isGlobal)
      ? 'GLOBAL'
      : typeof country === 'string'
        ? country.trim().toUpperCase()
        : offer.country

    const nextGroupName = typeof groupName === 'string' ? groupName.trim() || null : offer.groupName
    const nextOfferUrl = typeof offerUrl === 'string' ? offerUrl.trim() : offer.offerUrl
    const nextPriority = Number.isFinite(Number(priority))
      ? Math.max(1, Math.min(999, Number(priority)))
      : offer.priority
    const nextRotationMode = rotationMode === 'RANDOM' ? 'RANDOM' : 'PRIORITY'

    const updated = await prisma.offerVault.update({
      where: { id },
      data: {
        country: nextCountry,
        groupName: nextGroupName,
        offerUrl: nextOfferUrl,
        isActive,
        isGlobal,
        priority: nextPriority,
        rotationMode: nextRotationMode,
      },
    })

    return NextResponse.json(updated, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)
    const { id } = await params

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

    const offer = await prisma.offerVault.findUnique({
      where: { id },
    })

    if (!offer || offer.userId !== user.id) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.offerVault.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}