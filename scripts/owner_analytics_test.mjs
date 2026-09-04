import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const fetch = global.fetch || (await import('node-fetch')).default
const base = 'http://localhost:3000'

async function ensureOwner(username, password) {
  // Ensure the Postgres enum includes OWNER (may be missing in older DBs)
  try {
    await prisma.$executeRawUnsafe("ALTER TYPE \"UserRole\" ADD VALUE 'OWNER'")
    console.log('Ensured enum value OWNER')
  } catch (err) {
    // ignore if it already exists or if running privileges are limited
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return existing
  const hashed = await bcrypt.hash(password, 10)
  return await prisma.user.create({ data: { username, email: `${username}@example.com`, password: hashed, role: 'OWNER' } })
}

function parseAuthTokenFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const match = /auth-token=([^;]+)/.exec(setCookie);
  return match ? decodeURIComponent(match[1]) : null;
}

async function login(username, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie')
  const token = parseAuthTokenFromSetCookie(setCookie) || null
  return { data, token }
}

async function getRecent(token) {
  const res = await fetch(`${base}/api/analytics/recent`, { headers: { Cookie: `auth-token=${token}` } })
  return { status: res.status, body: await res.text() }
}

async function getDashboard(token) {
  const res = await fetch(`${base}/api/analytics/dashboard?period=week`, { headers: { Cookie: `auth-token=${token}` } })
  return { status: res.status, body: await res.text() }
}

;(async ()=>{
  try {
    const username = 'owner1'
    const password = 'ownerpass'
    const owner = await ensureOwner(username, password)
    console.log('Owner ensured:', owner.id)
    const { data, token } = await login(username, password)
    console.log('Login as owner:', data, 'token present:', Boolean(token))
    if (!token) {
      console.error('No token; aborting')
      process.exit(1)
    }
    console.log('Calling recent analytics...')
    const recent = await getRecent(token)
    console.log('recent status', recent.status)
    console.log('recent body', recent.body)
    console.log('Calling dashboard analytics...')
    const dash = await getDashboard(token)
    console.log('dashboard status', dash.status)
    console.log('dashboard body', dash.body.slice(0,1000))
    process.exit(0)
  } catch (err) {
    console.error('Owner analytics test failed', err)
    process.exit(1)
  }
})()
