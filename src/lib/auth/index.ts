import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { OWNER_USERNAME, OWNER_PASSWORD } from '@/lib/constants'
import type { UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY || '86400')

export function isAdmin(user: { role?: UserRole } | null | undefined): boolean {
  return Boolean(user && user.role === 'ADMIN')
}

export function isManager(user: { role?: UserRole } | null | undefined): boolean {
  return Boolean(user && user.role === 'MANAGER')
}

export function isOwner(user: { role?: UserRole; username?: string } | null | undefined): boolean {
  if (!user) return false
  if (user.role === 'OWNER') return true
  // Fallback: if the user's username matches the configured OWNER_USERNAME,
  // treat them as owner even if the DB role is inconsistent (helps recover
  // from enum-mismatch fallbacks that created the account as ADMIN).
  if (typeof user.username === 'string' && OWNER_USERNAME && user.username === OWNER_USERNAME) {
    return true
  }
  return false
}

export function isAdminOrOwner(user: { role?: UserRole; username?: string } | null | undefined): boolean {
  return isAdmin(user) || isOwner(user)
}

let ownerRoleNormalizationFailed = false

async function createOwnerUser(): Promise<string | null> {
  if (!OWNER_USERNAME || !OWNER_PASSWORD) {
    return null
  }

  const hashed = await bcrypt.hash(OWNER_PASSWORD, 10)
  try {
    const owner = await prisma.user.create({
      data: {
        username: OWNER_USERNAME,
        email: `${OWNER_USERNAME}@example.com`,
        password: hashed,
        role: 'OWNER',
      },
    })
    return owner.id
  } catch (err) {
    // Some deployments may have an older DB enum that doesn't include
    // the `OWNER` value. Fall back to creating the account as `ADMIN`
    // to avoid blocking startup. Log the original error for diagnostics.
    console.error('Failed to create owner user with role OWNER, retrying as ADMIN:', err)
    try {
      const ownerAsAdmin = await prisma.user.create({
        data: {
          username: OWNER_USERNAME,
          email: `${OWNER_USERNAME}@example.com`,
          password: hashed,
          role: 'ADMIN',
        },
      })
      return ownerAsAdmin.id
    } catch (err2) {
      console.error('Failed to create owner user as ADMIN too:', err2)
      return null
    }
  }
}

export async function getOwnerUserId(): Promise<string | null> {
  if (!OWNER_USERNAME) {
    return null
  }

  const owner = await prisma.user.findUnique({
    where: { username: OWNER_USERNAME },
    select: { id: true, role: true },
  })

  if (owner?.id) {
    // If the configured owner account exists, return its id. Some databases
    // may not support the OWNER enum value, so do not attempt to normalize
    // the role at runtime. The app already treats the configured owner
    // username as owner via `isOwner()` fallback.
    return owner.id
  }

  return await createOwnerUser()
}

export async function getEffectiveOfferUserId(userId: string): Promise<string> {
  const ownerUserId = await getOwnerUserId()
  if (!ownerUserId) {
    return userId
  }

  if (userId === ownerUserId) {
    return ownerUserId
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role === 'MANAGER') {
    return ownerUserId
  }

  return userId
}

export async function verifyCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  return user
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  )
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { userId: string }
  } catch {
    return null
  }
}

type AuthUser = {
  id: string
  username: string
  role: UserRole
  email?: string
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  // Support temporary in-memory tokens with userId prefixed by 'local-'. If
  // the corresponding user already exists in the database, return the DB
  // user so writes use a proper FK-backed id.
  if (decoded.userId && decoded.userId.startsWith('local-')) {
    const username = decoded.userId.replace(/^local-/, '')
    const existing = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })

    if (existing) {
      return existing as AuthUser
    }

    const role = username === OWNER_USERNAME ? 'OWNER' : 'ADMIN'
    return { id: decoded.userId, username, role }
  }

  return (await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  })) as AuthUser | null
}

export function getTokenFromCookie(cookieHeader: string): string | null {
  if (!cookieHeader) return null

  const cookiePairs = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)

  for (const cookie of cookiePairs) {
    const separatorIndex = cookie.indexOf('=')
    if (separatorIndex === -1) continue

    const name = cookie.slice(0, separatorIndex).trim()
    const value = cookie.slice(separatorIndex + 1).trim()

    if (name === 'auth-token') {
      return decodeURIComponent(value)
    }
  }

  return null
}