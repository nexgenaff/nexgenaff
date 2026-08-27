import { NextResponse } from 'next/server'
import { ingestPostback } from './[token]/route'

function getBodyParams(request: Request) {
  const contentType = request.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? request.json().then((body) => new URLSearchParams(Object.entries(body || {}).map(([key, value]) => [key, String(value)])))
    : request.text().then((body) => new URLSearchParams(body))
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const token = params.get('secret') || params.get('token')
  if (!token) return NextResponse.json({ error: 'Missing postback secret' }, { status: 400 })
  return ingestPostback(request, token)
}

export async function HEAD(request: Request) {
  const token = new URL(request.url).searchParams.get('secret') || new URL(request.url).searchParams.get('token')
  if (!token) return new NextResponse(null, { status: 400 })
  const config = await import('@/lib/db/prisma').then(({ prisma }) => prisma.postbackConfig.findFirst({ where: { token, isActive: true }, select: { id: true } }))
  return new NextResponse(null, { status: config ? 200 : 404 })
}

export async function POST(request: Request) {
  const params = await getBodyParams(request)
  const token = params.get('secret') || params.get('token')
  if (!token) return NextResponse.json({ error: 'Missing postback secret' }, { status: 400 })
  params.delete('secret')
  params.delete('token')
  return ingestPostback(request, token, params)
}