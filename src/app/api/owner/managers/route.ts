import { NextResponse } from 'next/server'
import { getTokenFromCookie, getUserFromToken, isOwner } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getCorsHeaders } from '@/config/cors'

export async function GET(request: Request) {
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
  if (!user || !isOwner(user)) {
    return NextResponse.json(
      { error: 'Owner access required' },
      { status: 403, headers: getCorsHeaders(origin) }
    )
  }

  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      source: true,
      contractNumber: true,
      telegramUsername: true,
      bkashNumber: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
    },
  })

  return NextResponse.json({ managers }, { headers: getCorsHeaders(origin) })
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}
