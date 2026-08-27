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

export async function POST(request: Request) {
  const params = await getBodyParams(request)
  const token = params.get('secret') || params.get('token')
  if (!token) return NextResponse.json({ error: 'Missing postback secret' }, { status: 400 })
  params.delete('secret')
  params.delete('token')
  return ingestPostback(request, token, params)
}