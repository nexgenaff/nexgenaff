import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

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

    const domain = await prisma.customDomain.findUnique({
      where: { id: params.id },
    })

    if (!domain || domain.userId !== user.id) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    const linksUsingDomain = await prisma.linkAccount.count({
      where: { customDomainId: domain.id },
    })

    if (linksUsingDomain > 0) {
      return NextResponse.json(
        { error: `Cannot delete domain. It is used by ${linksUsingDomain} link(s).` },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    await prisma.customDomain.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { error: 'Failed to delete domain' },
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