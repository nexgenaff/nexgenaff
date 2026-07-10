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

    const domains = await prisma.customDomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const domainsWithInstructions = domains.map(domain => ({
      ...domain,
      verificationInstructions: getVerificationInstructions(domain.domain, user.id),
    }))

    return NextResponse.json(domainsWithInstructions, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Error fetching domains:', error)
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