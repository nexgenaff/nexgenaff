import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { BotDetectionService } from '@/lib/services/bot-detection'
import { getGeoLocation } from '@/lib/services/geo/ip2location'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const referrer = headers.get('referer') || headers.get('referrer') || ''
    const origin = headers.get('origin') || ''

    const link = await prisma.linkAccount.findUnique({
      where: { slug },
      include: {
        customDomain: true,
      },
    })

    if (!link || !link.isActive) {
      return new NextResponse('Link not found', { status: 404 })
    }

    const botService = new BotDetectionService()
    const botResult = await botService.detect(userAgent, ip)

    if (botResult.isBot) {
      await prisma.click.create({
        data: {
          linkAccountId: link.id,
          ipAddress: ip,
          userAgent: userAgent,
          referrer: referrer || '',
          isBot: true,
          botScore: botResult.score,
          botReason: botResult.reasons.join(', '),
        },
      })

      await prisma.linkAccount.update({
        where: { id: link.id },
        data: { botClicks: { increment: 1 } },
      })

      const response = NextResponse.redirect('https://facebook.com', { status: 302 })
      response.headers.set('Referrer-Policy', 'no-referrer')
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      return response
    }

    const geo = await getGeoLocation(ip)
    const country = geo?.country_code || 'US'

    let offer = await prisma.offerVault.findFirst({
      where: {
        country: country,
        isActive: true,
        userId: link.userId,
      },
    })

    if (!offer) {
      offer = await prisma.offerVault.findFirst({
        where: {
          isGlobal: true,
          isActive: true,
          userId: link.userId,
        },
      })
    }

    if (!offer) {
      return new NextResponse('No offer found', { status: 404 })
    }

    const finalUrl = `${offer.offerUrl}${slug}`

    await prisma.click.create({
      data: {
        linkAccountId: link.id,
        ipAddress: ip,
        userAgent: userAgent,
        country: country,
        region: geo?.region || null,
        city: geo?.city || null,
        isp: geo?.isp || null,
        browser: 'Unknown',
        referrer: referrer || null,
        isUnique: true,
        isBot: false,
      },
    })

    await prisma.linkAccount.update({
      where: { id: link.id },
      data: {
        totalClicks: { increment: 1 },
        uniqueClicks: { increment: 1 },
      },
    })

    const response = NextResponse.redirect(finalUrl, { status: 302 })

    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')

    return response
  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse('Redirect failed', { status: 500 })
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  const response = new NextResponse(null, { status: 204 })
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Referer, Origin')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}