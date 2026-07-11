import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken, getTokenFromCookie } from '@/lib/auth'
import { getVerificationInstructions } from '@/lib/services/dns/verify'
import { getCorsHeaders } from '@/config/cors'
import { z } from 'zod'

const domainSchema = z.object({
  domain: z.string().min(1).max(255),
})

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    if (!token) {
      if (debug) {
        return NextResponse.json({ error: 'Unauthorized', details: { cookieHeader } }, { status: 401, headers: getCorsHeaders(origin) })
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    let user = null
    try {
      user = await getUserFromToken(token)
    } catch (err: unknown) {
      console.error('getUserFromToken error in /api/domains:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      if (debug) return NextResponse.json({ error: 'getUserFromToken failed', message: error.message, stack: error.stack }, { status: 500, headers: getCorsHeaders(origin) })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) })
    }

    if (!user) {
      if (debug) return NextResponse.json({ error: 'Unauthorized', details: { token } }, { status: 401, headers: getCorsHeaders(origin) })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const domainsWithInstructions = domains.map(d => ({
      ...d,
      verificationInstructions: getVerificationInstructions(d.domain, user.id),
    }))

    return NextResponse.json(domainsWithInstructions, { headers: getCorsHeaders(origin) })
  } catch (error: unknown) {
    console.error('Error fetching domains:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    if (request.url.includes('?debug=1')) {
      return NextResponse.json({ error: 'Failed to fetch domains', message: err.message, stack: err.stack }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || null
    const cookieHeader = request.headers.get('cookie') || ''
    const token = getTokenFromCookie(cookieHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      )
    }

    const body = await request.json()
    const validation = domainSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid domain', details: validation.error.errors },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const { domain } = validation.data

    const existing = await prisma.customDomain.findUnique({
      where: { domain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const newDomain = await prisma.customDomain.create({
      data: {
        domain,
        userId: user.id,
        verified: false,
        sslEnabled: false,
        isActive: true,
      },
    })

    const instructions = getVerificationInstructions(domain, user.id)

    return NextResponse.json({
      ...newDomain,
      verificationInstructions: instructions,
      message: 'Domain added. Please add the following DNS records to verify ownership.',
    }, { 
      status: 201, 
      headers: getCorsHeaders(origin) 
    })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json(
      { error: 'Failed to add domain' },
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