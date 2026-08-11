import { NextResponse } from 'next/server'
import { createGoogleAuthResponse, exchangeGoogleCode, getGoogleUserInfo, findGoogleUserByEmail, normalizeGoogleRedirectPath } from '@/lib/auth/google'
import { getGoogleOAuthConfig } from '@/lib/auth/google'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  try {
    let redirectPath = '/admin/dashboard'
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'))
        if (typeof decoded.redirect === 'string' && decoded.redirect) {
          redirectPath = normalizeGoogleRedirectPath(decoded.redirect)
        }
      } catch {
        // ignore invalid state and fall back to the default path
      }
    }

    const { redirectUri } = getGoogleOAuthConfig()
    if (!redirectUri) {
      throw new Error('Google OAuth redirect URI is not configured')
    }

    const tokenResponse = await exchangeGoogleCode(code, redirectUri)
    const accessToken = tokenResponse.access_token
    if (!accessToken) {
      throw new Error('Google did not return an access token')
    }

    const googleUser = await getGoogleUserInfo(accessToken)
    const user = await findGoogleUserByEmail(googleUser.email || '')

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=google_account_not_found', request.url))
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/login?approval_pending=1', request.url))
    }

    const authResponse = await createGoogleAuthResponse(user)

    const response = NextResponse.redirect(new URL(`/login?success=google-authenticated&redirect=${encodeURIComponent(redirectPath)}`, request.url))
    response.cookies.set('auth-token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
  }
}
