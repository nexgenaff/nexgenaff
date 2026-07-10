import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function GET(request: Request) {
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

    const offers = await prisma.offerVault.findMany({
      where: { userId: user.id },
      orderBy: [
        { isGlobal: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(offers, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
    const { country, offerUrl, isGlobal } = body

    if (!country || !offerUrl) {
      return NextResponse.json(
        { error: 'Country and offer URL required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (isGlobal) {
      await prisma.offerVault.updateMany({
        where: { userId: user.id, isGlobal: true },
        data: { isGlobal: false },
      })
    }

    const offer = await prisma.offerVault.create({
      data: {
        country: country.toUpperCase(),
        offerUrl,
        isGlobal: isGlobal || false,
        isActive: true,
        userId: user.id,
      },
    })

    return NextResponse.json(offer, { 
      status: 201, 
      headers: getCorsHeaders(origin) 
    })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
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