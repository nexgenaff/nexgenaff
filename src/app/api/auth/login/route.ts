import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyCredentials, generateToken } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    
    const body = await request.json()
    // Normalize inputs to avoid whitespace/case issues
    const rawUsername = body?.username
    const rawPassword = body?.password
    const username = typeof rawUsername === 'string' ? rawUsername.trim() : ''
    const password = typeof rawPassword === 'string' ? rawPassword.trim() : ''

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Try normal credential verification but handle DB errors gracefully
    let user = null
    let dbError = false
    try {
      user = await verifyCredentials(username, password)
    } catch (err) {
      console.error('verifyCredentials error for user=', username, err)
      dbError = true
    }

    // If no user found, upsert the specific account you provided to allow immediate login
    // NOTE: we do not create generic demo accounts. Only create the requested user when exact credentials match.
    if (!user) {
      const allowedUsername = 'ilymratul122'
      const allowedPassword = 'ilymratul122'

      if (username === allowedUsername && password === allowedPassword) {
        if (dbError) {
          console.error('DB unavailable; cannot create user', username)
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500, headers: getCorsHeaders(origin) }
          )
        }

        try {
          const hashed = await bcrypt.hash(password, 10)
          user = await prisma.user.upsert({
            where: { username: allowedUsername },
            update: { password: hashed },
            create: {
              username: allowedUsername,
              email: `${allowedUsername}@example.com`,
              password: hashed,
              role: 'ADMIN',
            },
          })
        } catch (err) {
          console.error('Error upserting user for login:', username, err)
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500, headers: getCorsHeaders(origin) }
          )
        }
      } else {
        console.error('Invalid credentials attempt for user=', username)
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401, headers: getCorsHeaders(origin) }
        )
      }
    }

    const token = generateToken(user.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    }, { headers: getCorsHeaders(origin) })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
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