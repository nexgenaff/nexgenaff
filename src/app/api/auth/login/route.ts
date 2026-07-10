import { NextResponse } from 'next/server'
import { verifyCredentials, generateToken } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'

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

    const user = await verifyCredentials(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
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