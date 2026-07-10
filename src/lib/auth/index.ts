import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY || '86400')

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

  const token = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1]

  return token || null
}