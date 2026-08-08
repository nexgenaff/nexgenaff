import { prisma } from '@/lib/db/prisma'
import { generateToken } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI?.trim()

export function buildGoogleUsername(email?: string | null, fallback = 'google-user'): string {
  if (!email) return fallback

  const normalized = email.trim().toLowerCase()
  const localPart = normalized.split('@')[0] ?? ''
  return localPart.replace(/[^a-z0-9._-]+/g, '').trim() || fallback
}

export function normalizeGoogleRedirectPath(redirect: string | null | undefined, fallback = '/admin/dashboard'): string {
  if (typeof redirect !== 'string' || !redirect.trim()) return fallback

  const trimmed = redirect.trim()
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//')) return fallback

  return trimmed
}

export function getGoogleOAuthConfig() {
  return {
    clientId: GOOGLE_CLIENT_ID || '',
    clientSecret: GOOGLE_CLIENT_SECRET || '',
    redirectUri: GOOGLE_REDIRECT_URI || '',
  }
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID || '',
    client_secret: GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google token exchange failed: ${errorText}`)
  }

  return response.json() as Promise<{ access_token?: string }>
}

export async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google userinfo request failed: ${errorText}`)
  }

  return response.json() as Promise<{ email?: string; name?: string }>
}

export async function upsertGoogleUser(email: string, name?: string | null) {
  const normalizedEmail = email.trim().toLowerCase()
  const baseUsername = buildGoogleUsername(normalizedEmail, name?.trim() || 'google-user')

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, username: true, email: true, role: true },
  })

  if (existingByEmail) {
    return existingByEmail
  }

  let username = baseUsername
  let suffix = 1
  while (true) {
    const existingByUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!existingByUsername) {
      break
    }

    username = `${baseUsername}${suffix}`
    suffix += 1
  }

  return prisma.user.create({
    data: {
      username,
      email: normalizedEmail,
      password: '__google_oauth__',
      role: 'MANAGER',
    },
  })
}

export async function createGoogleAuthResponse(user: { id: string; username: string; role: string }) {
  const token = generateToken(user.id)
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }
}
