import { NextResponse, type NextRequest } from 'next/server'
import { randomInt } from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { BotDetectionService } from '@/lib/services/bot-detection'
import { buildClickFingerprint, getClickDedupeWindowMs, isDuplicateClickEvent } from '@/lib/services/click-detection'
import { getGeoLocation } from '@/lib/services/geo/ip2location'
import { buildRedirectTargetUrl } from '@/lib/utils/redirect'
import { parseVisitorProfile } from '@/lib/utils/visitor-profile'

const normalizeGroupName = (value?: string | null) => value?.trim() ?? ''
const BOT_FALLBACK_URL = process.env.BOT_FALLBACK_URL || 'https://weebly.pro'

const getClientIp = (headers: Headers): string => {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('true-client-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

const buildRedirectResponse = (
  url: string,
  origin?: string | null,
  status: 302 | 307 = 302,
) => {
  const response = NextResponse.redirect(url, { status })
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  return response
}

const selectRotatingOffer = (offers: Array<{ id: string; priority: number; rotationMode: string; offerUrl: string; country: string; isGlobal: boolean; isActive: boolean; usaSecretRedirectEnabled: boolean; createdAt: Date; groupName: string | null }>) => {
  if (!offers.length) return null
  if (offers.length === 1) return offers[0]

  const randomPool = offers.filter((offer) => offer.rotationMode === 'RANDOM')
  if (randomPool.length > 0) {
    return randomPool[Math.floor(Math.random() * randomPool.length)]
  }

  return [...offers].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.createdAt.getTime() - b.createdAt.getTime()
  })[0]
}

const normalizeDedupeValue = (value?: string | null) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase()

const buildDedupeLockKeys = (clickSignature: string, ipAddress: string, userAgent: string) => {
  return [clickSignature, ipAddress, userAgent]
    .map(normalizeDedupeValue)
    .filter((value) => value !== '' && value !== 'unknown')
    .reduce<string[]>((acc, value) => (acc.includes(value) ? acc : [...acc, value]), [])
    .sort()
}

const acquireDedupeLocks = async (tx: any, clickSignature: string, ipAddress: string, userAgent: string) => {
  const keys = buildDedupeLockKeys(clickSignature, ipAddress, userAgent)
  for (const key of keys) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
  }
}

const selectGroupOffer = async (
  userId: string,
  country: string,
  groupName: string,
) => {
  const regionalGroupCandidates = await prisma.offerVault.findMany({
    where: {
      userId,
      country,
      groupName,
      isActive: true,
      isGlobal: false,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  })

  let offer = selectRotatingOffer(regionalGroupCandidates)

  if (!offer) {
    const globalGroupCandidates = await prisma.offerVault.findMany({
      where: {
        userId,
        groupName,
        isActive: true,
        isGlobal: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    offer = selectRotatingOffer(globalGroupCandidates)
  }

  return offer
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ip = getClientIp(headers)
    const referrer = headers.get('referer') || headers.get('referrer') || ''
    const origin = headers.get('origin') || ''
    const visitorProfile = parseVisitorProfile(userAgent)

    const link = await prisma.linkAccount.findUnique({
      where: { slug },
      include: {
        customDomain: true,
      },
    })

    if (!link || !link.isActive) {
      return new NextResponse('Link not found', { status: 404 })
    }

    const clickFingerprint = buildClickFingerprint({
      linkId: link.id,
      ipAddress: ip,
      userAgent,
      browser: visitorProfile.browser,
      os: visitorProfile.os,
      deviceType: visitorProfile.deviceType,
    })

    const dedupeWindowMs = getClickDedupeWindowMs()

    const botService = new BotDetectionService()
    
    // Convert headers to object for bot detection analysis
    const headersObj: Record<string, string | null> = {
      'user-agent': userAgent,
      'accept': headers.get('accept'),
      'accept-language': headers.get('accept-language'),
      'accept-encoding': headers.get('accept-encoding'),
      'cache-control': headers.get('cache-control'),
      'referer': referrer,
    }
    
    const botResult = await botService.detect(userAgent, ip, headersObj)

    if (botResult.isBot) {
      await prisma.$transaction(async (tx) => {
        await tx.click.create({
          data: {
            linkAccountId: link.id,
            clickSignature: clickFingerprint,
            ipAddress: ip,
            userAgent: userAgent,
            referrer: referrer || '',
            browser: visitorProfile.browser,
            browserVersion: visitorProfile.browserVersion,
            os: visitorProfile.os,
            deviceType: visitorProfile.deviceType,
            deviceBrand: visitorProfile.deviceBrand,
            isBot: true,
            botScore: botResult.score,
            botReason: botResult.reasons.join(', '),
          },
        })

        await tx.linkAccount.update({
          where: { id: link.id },
          data: { botClicks: { increment: 1 } },
        })
      })

      const safeRedirectUrl = process.env.BOT_SAFE_REDIRECT_URL || BOT_FALLBACK_URL
      console.log(`[BOT BLOCKED] Slug: ${slug}, IP: ${ip}, Reason: ${botResult.reasons.join(' | ')}, Score: ${botResult.score}, Confidence: ${botResult.confidence}`)

      const response = buildRedirectResponse(safeRedirectUrl, origin, 307)
      response.headers.set('X-Bot-Detection-Score', botResult.score.toString())
      response.headers.set('X-Bot-Detection-Reason', botResult.reasons.join('; '))
      response.headers.set('X-Bot-Confidence', botResult.confidence)
      return response
    }

    const geo = await getGeoLocation(ip, headers)
    const country = (geo?.country_code || '').toUpperCase()

    let offer = null

    if (link.offerGroupName) {
      offer = await selectGroupOffer(link.userId, country, link.offerGroupName)
    }

    if (!offer) {
      const countryCandidates = await prisma.offerVault.findMany({
        where: {
          userId: link.userId,
          country,
          isActive: true,
          isGlobal: false,
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
      })

      const namedGroupCandidates = countryCandidates.filter((candidate) => normalizeGroupName(candidate.groupName))
      const directCountryCandidates = countryCandidates.filter((candidate) => !normalizeGroupName(candidate.groupName))

      offer = selectRotatingOffer(namedGroupCandidates.length ? namedGroupCandidates : directCountryCandidates)
    }

    if (!offer) {
      const globalCandidates = await prisma.offerVault.findMany({
        where: {
          userId: link.userId,
          isGlobal: true,
          isActive: true,
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
      })

      offer = selectRotatingOffer(globalCandidates)
    }

    if (!offer) {
      return new NextResponse('No offer found', { status: 404 })
    }

    const finalUrl = buildRedirectTargetUrl(offer.offerUrl, slug)

    const isUsaSecretMode = country === 'US' && offer.usaSecretRedirectEnabled === true
    const isSecretRedirect = isUsaSecretMode && randomInt(0, 2) === 0

    if (isSecretRedirect) {
      const response = NextResponse.redirect(finalUrl, { status: 302 })
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      return response
    }

    await acquireDedupeLocks(prisma, clickFingerprint, ip, userAgent)

    const mostRecentClickAfterLock = await prisma.click.findFirst({
      where: {
        OR: [
          { clickSignature: clickFingerprint },
          ...(ip && ip !== 'unknown' ? [{ ipAddress: ip }] : []),
          ...(userAgent ? [{ userAgent }] : []),
        ],
        createdAt: {
          gte: new Date(Date.now() - dedupeWindowMs),
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, clickSignature: true, ipAddress: true, userAgent: true },
    })

    const isDuplicateAfterLock = mostRecentClickAfterLock
      ? isDuplicateClickEvent(
          new Date(mostRecentClickAfterLock.createdAt),
          new Date(),
          {
            clickSignature: clickFingerprint,
            ipAddress: ip,
            userAgent,
            lastClickSignature: mostRecentClickAfterLock.clickSignature,
            lastIpAddress: mostRecentClickAfterLock.ipAddress,
            lastUserAgent: mostRecentClickAfterLock.userAgent,
          },
          dedupeWindowMs,
        )
      : false

    await prisma.click.create({
      data: {
        linkAccountId: link.id,
        clickSignature: clickFingerprint,
        ipAddress: ip,
        userAgent: userAgent,
        country: country || null,
        region: geo?.region || null,
        city: geo?.city || null,
        isp: geo?.isp || null,
        browser: visitorProfile.browser,
        browserVersion: visitorProfile.browserVersion,
        os: visitorProfile.os,
        deviceType: visitorProfile.deviceType,
        deviceBrand: visitorProfile.deviceBrand,
        referrer: referrer || null,
        isUnique: !isDuplicateAfterLock,
        isBot: false,
      },
    })

    await prisma.linkAccount.update({
      where: { id: link.id },
      data: {
        totalClicks: { increment: 1 },
        ...(!isDuplicateAfterLock ? { uniqueClicks: { increment: 1 } } : {}),
      },
    })

    if (isDuplicateAfterLock) {
      console.debug('Duplicate click detected and stored for link', link.id)
    }

    return buildRedirectResponse(finalUrl, origin, 302)
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