import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { generateToken } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || null

  try {
    const body = await request.json()
    const username = typeof body?.username === 'string' ? body.username.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password.trim() : ''
    const turnstileToken = typeof body?.turnstileToken === 'string' ? body.turnstileToken.trim() : ''

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Please complete the security check before signing up' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }

      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: origin || '',
        }),
      })

      const verification = await verifyResponse.json() as { success?: boolean; 'error-codes'?: string[] }
      if (!verification.success) {
        return NextResponse.json(
          { error: 'Security check verification failed. Please try again.' },
          { status: 400, headers: getCorsHeaders(origin) }
        )
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'MANAGER',
      },
    })

    const token = generateToken(user.id)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      { headers: getCorsHeaders(origin) }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
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
