import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCorsHeaders } from '@/config/cors'
import { getTokenFromCookie, getUserFromToken, getOwnerUserId, isAdmin, isOwner } from '@/lib/auth'
import { getLinkAccountVisibilityWhereClause } from '@/lib/utils/link-account-access'
import { prisma } from '@/lib/db/prisma'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim() || 'admin'
const ADMIN_PASSWORD: string = (() => {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is required for security')
  }
  return password
})()

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

    if (action === 'update-click-rate') {
      if (user.role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Only the owner can update the USA click rate.' },
          { status: 403, headers: getCorsHeaders(origin) }
        )
      }

      const clickRate = Number(body?.clickRate)
      if (!Number.isFinite(clickRate) || clickRate < 0) {
        return NextResponse.json(
          { error: 'USA click rate must be a valid non-negative number.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      const updatedUsers = await prisma.user.updateMany({
        data: {
          clickRate,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json(
        {
          success: true,
          clickRate,
          updatedUsers: updatedUsers.count,
          message: `USA click rate updated for all ${updatedUsers.count} user accounts.`,
        },
        { headers: getCorsHeaders(origin) }
      )
    }

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
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Demo accounts are not supported in production' },
            { status: 403, headers: getCorsHeaders(origin) }
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

    if (action === 'update-email') {
      const email = typeof body?.email === 'string' ? body.email.trim() : ''
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      if (user.id.startsWith('local-')) {
        return NextResponse.json(
          {
            success: true,
            message: 'Email update simulated for the local demo account.',
          },
          { headers: getCorsHeaders(origin) }
        )
      }

      const existing = await prisma.user.findFirst({ where: { email } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: 'That email address is already in use.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { email, updatedAt: new Date() },
      })

      return NextResponse.json(
        { success: true, message: 'Email updated successfully.' },
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
      const ownerUserId = await getOwnerUserId()
      const whereClause = getLinkAccountVisibilityWhereClause(user, ownerUserId)

      const linkAccounts = await prisma.linkAccount.findMany({ where: whereClause, select: { id: true } })
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
      const ownerUserId = await getOwnerUserId()
      const whereClause = getLinkAccountVisibilityWhereClause(user, ownerUserId)

      const linkAccounts = await prisma.linkAccount.findMany({ where: whereClause, select: { id: true } })
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
        prisma.linkAccount.deleteMany({ where: whereClause }),
        prisma.customDomain.deleteMany({ where: isOwner(user) ? {} : isAdmin(user) ? { userId: user.id } : { userId: user.id } }),
        prisma.offerVault.deleteMany({ where: isOwner(user) ? {} : isAdmin(user) ? { userId: user.id } : { userId: user.id } }),
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
