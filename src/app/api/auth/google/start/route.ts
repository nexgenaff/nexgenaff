import { NextResponse } from 'next/server'
import { buildGoogleAuthUrl, getGoogleOAuthConfig, normalizeGoogleRedirectPath } from '@/lib/auth/google'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirect = normalizeGoogleRedirectPath(searchParams.get('redirect'))
  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url')
  const { clientId, redirectUri } = getGoogleOAuthConfig()

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 })
  }

  const authUrl = buildGoogleAuthUrl(redirectUri, state)
  return NextResponse.redirect(authUrl)
}
