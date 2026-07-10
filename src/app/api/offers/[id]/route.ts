import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

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
    const { country, offerUrl, isActive, isGlobal } = body

    const offer = await prisma.offerVault.findUnique({
      where: { id: params.id },
    })

    if (!offer || offer.userId !== user.id) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    if (isGlobal) {
      await prisma.offerVault.updateMany({
        where: {
          userId: user.id,
          isGlobal: true,
          id: { not: params.id },
        },
        data: { isGlobal: false },
      })
    }

    const updated = await prisma.offerVault.update({
      where: { id: params.id },
      data: {
        country: country?.toUpperCase(),
        offerUrl,
        isActive,
        isGlobal,
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

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
      where: { id: params.id },
    })

    if (!offer || offer.userId !== user.id) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.offerVault.delete({
      where: { id: params.id },
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