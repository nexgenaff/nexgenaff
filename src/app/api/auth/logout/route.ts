import { NextResponse } from 'next/server'
import { getCorsHeaders } from '@/config/cors'

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || null
  const response = NextResponse.json(
    { success: true },
    { headers: getCorsHeaders(origin) }
  )
  response.cookies.delete('auth-token')
  return response
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}