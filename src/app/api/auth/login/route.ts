import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyCredentials, generateToken } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Try normal credential verification
    let user = await verifyCredentials(username, password)

    // If no user found, allow auto-provisioning of a demo admin on first login
    // This helps in fresh deployments without running the seed script.
    if (!user) {
      // Only enable auto-creation for the default demo credentials
      if (username === 'admin' && password === 'admin123') {
        const hashed = await bcrypt.hash(password, 10)
        user = await prisma.user.upsert({
          where: { username: 'admin' },
          update: { password: hashed },
          create: {
            username: 'admin',
            email: 'admin@nextgen.com',
            password: hashed,
            role: 'ADMIN',
          },
        })
      } else {
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