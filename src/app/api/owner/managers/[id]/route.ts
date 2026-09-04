import { NextResponse } from 'next/server'
import { getTokenFromCookie, getUserFromToken, isOwner } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getCorsHeaders } from '@/config/cors'

const validStatuses = ['PENDING', 'ACTIVE', 'DISABLED', 'REJECTED'] as const

async function requireOwner(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = getTokenFromCookie(cookieHeader)

  if (!token) {
    return null
  }

  const user = await getUserFromToken(token)
  if (!user || !isOwner(user)) {
    return null
  }

  return user
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin') || null
  const owner = await requireOwner(request)

  if (!owner) {
    return NextResponse.json(
      { error: 'Owner access required' },
      { status: 403, headers: getCorsHeaders(origin) }
    )
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const incomingStatus = typeof body?.status === 'string' ? body.status : ''

  if (!validStatuses.includes(incomingStatus as (typeof validStatuses)[number])) {
    return NextResponse.json(
      { error: 'Invalid status value' },
      { status: 400, headers: getCorsHeaders(origin) }
    )
  }

  const manager = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!manager || manager.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Manager account not found' },
      { status: 404, headers: getCorsHeaders(origin) }
    )
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status: incomingStatus as (typeof validStatuses)[number] },
  })

  return NextResponse.json(
    { manager: { id: updated.id, username: updated.username, status: updated.status } },
    { headers: getCorsHeaders(origin) }
  )
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin') || null
  const owner = await requireOwner(request)

  if (!owner) {
    return NextResponse.json(
      { error: 'Owner access required' },
      { status: 403, headers: getCorsHeaders(origin) }
    )
  }

  const { id } = await params
  const manager = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!manager || manager.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Manager account not found' },
      { status: 404, headers: getCorsHeaders(origin) }
    )
  }

  try {
    const linkAccounts = await prisma.linkAccount.findMany({
      where: { userId: id },
      select: { id: true },
    })
    const linkAccountIds = linkAccounts.map((linkAccount) => linkAccount.id)

    await prisma.$transaction([
      prisma.click.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.geoStat.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.browserStat.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.oSStat.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.deviceStat.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.referrerStat.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.publicDashboard.deleteMany({ where: { linkAccountId: { in: linkAccountIds } } }),
      prisma.linkAccount.deleteMany({ where: { id: { in: linkAccountIds } } }),
      prisma.customDomain.deleteMany({ where: { userId: id } }),
      prisma.offerVault.deleteMany({ where: { userId: id } }),
      prisma.landingPage.deleteMany({ where: { userId: id } }),
      prisma.landingPageTemplate.deleteMany({ where: { createdBy: id } }),
      prisma.user.delete({ where: { id } }),
    ])

    return NextResponse.json(
      { success: true, manager: { id, status: 'REJECTED' } },
      { headers: getCorsHeaders(origin) }
    )
  } catch (err) {
    console.error('Failed to remove manager:', err)
    return NextResponse.json(
      { error: 'Unable to delete manager. Please try again later.' },
      { status: 500, headers: getCorsHeaders(origin) }
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
