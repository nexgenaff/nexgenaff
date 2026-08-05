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

async function createOwnerUser(): Promise<string | null> {
  if (!OWNER_PASSWORD) {
    return null
  }

  const hashed = await bcrypt.hash(OWNER_PASSWORD, 10)
  try {
    const owner = await prisma.user.create({
      data: {
        username: OWNER_USERNAME,
        email: `${OWNER_USERNAME}@example.com`,
        password: hashed,
        role: 'ADMIN',
      },
    })
    return owner.id
  } catch (err) {
    console.error('Failed to create owner user:', err)
    return null
  }
}

export async function getOwnerUserId(): Promise<string | null> {
  const owner = await prisma.user.findUnique({
    where: { username: OWNER_USERNAME },
    select: { id: true },
  })

  if (owner?.id) {
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

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  // Support temporary in-memory tokens with userId prefixed by 'local-'
  if (decoded.userId && decoded.userId.startsWith('local-')) {
    const username = decoded.userId.replace(/^local-/, '')
    return { id: decoded.userId, username, role: 'ADMIN' }
  }

  return await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  })
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