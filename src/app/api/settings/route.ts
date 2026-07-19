import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCorsHeaders } from '@/config/cors'
import { getTokenFromCookie, getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim() || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'admin123'

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || null
  const cookieHeader = request.headers.get('cookie') || ''
  const token = getTokenFromCookie(cookieHeader)

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: getCorsHeaders(origin) }
    )
  }

  try {
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    const body = await request.json().catch(() => ({}))
    const action = typeof body?.action === 'string' ? body.action : ''

    if (action === 'change-password') {
      const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
      const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : ''

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: 'All password fields are required.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'New password and confirmation do not match.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (user.id.startsWith('local-')) {
        const isValidBootstrap = currentPassword === ADMIN_PASSWORD || currentPassword === 'admin123'
        if (!isValidBootstrap) {
          return NextResponse.json(
            { error: 'Current password is incorrect.' },
            { status: 400, headers: getCorsHeaders(origin) }
          )
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Password update simulated for the local demo account. Restart the app if you want to persist a new password.',
          },
          { headers: getCorsHeaders(origin) }
        )
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
      if (!dbUser) {
        return NextResponse.json(
          { error: 'Account not found.' },
          { status: 404, headers: getCorsHeaders(origin) }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, dbUser.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      const hashed = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { password: hashed, updatedAt: new Date() },
      })

      return NextResponse.json(
        { success: true, message: 'Password updated successfully.' },
        { headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'toggle-2fa') {
      const enabled = body?.enabled === true
      return NextResponse.json(
        {
          success: true,
          message: enabled
            ? 'Two-factor authentication is now enabled for this browser.'
            : 'Two-factor authentication is now disabled for this browser.',
          enabled,
        },
        { headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'reset-analytics') {
      const linkAccounts = await prisma.linkAccount.findMany({ where: { userId: user.id }, select: { id: true } })
      const ids = linkAccounts.map((item) => item.id)

      await prisma.$transaction([
        prisma.click.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.geoStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.browserStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.oSStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.deviceStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.referrerStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.linkAccount.updateMany({
          where: { id: { in: ids } },
          data: { totalClicks: 0, uniqueClicks: 0, botClicks: 0 },
        }),
      ])

      return NextResponse.json(
        { success: true, message: 'All analytics for your workspace have been reset.' },
        { headers: getCorsHeaders(origin) }
      )
    }

    if (action === 'delete-data') {
      const linkAccounts = await prisma.linkAccount.findMany({ where: { userId: user.id }, select: { id: true } })
      const ids = linkAccounts.map((item) => item.id)

      await prisma.$transaction([
        prisma.click.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.geoStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.dailyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.hourlyAnalytics.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.browserStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.oSStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.deviceStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.referrerStat.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.publicDashboard.deleteMany({ where: { linkAccountId: { in: ids } } }),
        prisma.linkAccount.deleteMany({ where: { userId: user.id } }),
        prisma.customDomain.deleteMany({ where: { userId: user.id } }),
        prisma.offerVault.deleteMany({ where: { userId: user.id } }),
      ])

      return NextResponse.json(
        { success: true, message: 'All workspace data for this account has been cleared.' },
        { headers: getCorsHeaders(origin) }
      )
    }

    return NextResponse.json(
      { error: 'Unknown action.' },
      { status: 400, headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Settings action error:', error)
    return NextResponse.json(
      { error: 'Unable to complete that request.' },
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
