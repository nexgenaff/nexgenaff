import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { BotDetectionService } from '@/lib/services/bot-detection'
import { buildClickFingerprint, getClickDedupeWindowMs } from '@/lib/services/click-detection'
import { getGeoLocation } from '@/lib/services/geo/ip2location'
import { buildRedirectTargetUrl } from '@/lib/utils/redirect'
import { parseVisitorProfile } from '@/lib/utils/visitor-profile'
import { getOfferSelectionUserIds, getOwnerUserId } from '@/lib/auth'
import { selectOffer as selectOfferFromVault } from '@/lib/utils/offer-selection'

const normalizeGroupName = (value?: string | null) => value?.trim() ?? ''

type Offer = {
  id: string
  priority: number
  rotationMode: string
  offerUrl: string
  country: string
  isGlobal: boolean
  isContentLocker: boolean
  isActive: boolean
  usaSecretRedirectEnabled: boolean
  createdAt: Date
  groupName: string | null
}

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

const selectRotatingOffer = (offers: Offer[]) => {
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
  userIds: string[],
  country: string,
  groupName: string,
) => {
  for (const userId of userIds) {
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

    const offer = selectRotatingOffer(regionalGroupCandidates)
    if (offer) return offer

    const globalGroupCandidates = await prisma.offerVault.findMany({
      where: {
        userId,
        groupName,
        isActive: true,
        OR: [
          { isGlobal: true },
          { isContentLocker: true },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    const globalOffer = selectRotatingOffer(globalGroupCandidates)
    if (globalOffer) return globalOffer
  }

  return null
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

      console.log(`[BOT BLOCKED] Slug: ${slug}, IP: ${ip}, Reason: ${botResult.reasons.join(' | ')}, Score: ${botResult.score}, Confidence: ${botResult.confidence}`)
      return new NextResponse('Bot detected', { status: 403 })
    }

    const geo = await getGeoLocation(ip, headers)
    const country = (geo?.country_code || '').toUpperCase()

    console.debug('[REDIRECT] geo lookup', {
      slug,
      ip,
      header_cf_ipcountry: headers.get('cf-ipcountry'),
      header_vercel_ip_country: headers.get('x-vercel-ip-country'),
      resolved_geo: geo,
      country,
    })

    const offerUserIds = await getOfferSelectionUserIds(link.userId)
    const ownerUserId = await getOwnerUserId()
    const fallbackOfferUserIds = Array.from(new Set([
      ...(ownerUserId && ownerUserId !== link.userId ? [ownerUserId] : []),
      ...offerUserIds,
    ]))

    const offer = await selectOfferFromVault(prisma as any, fallbackOfferUserIds, country, link.offerGroupName)

    console.debug('[REDIRECT] offer selection', {
      slug,
      offerUserIds: offerUserIds.slice(0, 10),
      fallbackOfferUserIds: fallbackOfferUserIds.slice(0, 10),
      selectedOfferId: offer?.id,
      selectedOfferCountry: offer?.country,
      selectedOfferUrl: offer?.offerUrl,
    })

    if (!offer) {
      return new NextResponse('No owner offer found', { status: 404 })
    }

    const finalUrl = offer.isContentLocker
      ? offer.offerUrl
      : buildRedirectTargetUrl(offer.offerUrl, slug)

    const SECRET_MODE_COOKIE = 'usa_secret_mode'
    const isUsaSecretMode = country === 'US' && offer.usaSecretRedirectEnabled === true
    const existingSecretCookie = request.cookies.get(SECRET_MODE_COOKIE)?.value === '1'
    const shouldEnterSecretMode = isUsaSecretMode && (existingSecretCookie || Math.random() < 0.5)

    if (shouldEnterSecretMode) {
      const response = NextResponse.redirect(finalUrl, { status: 302 })
      response.cookies.set(SECRET_MODE_COOKIE, '1', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      return response
    }

    const response = buildRedirectResponse(finalUrl, origin, 302)
    const loggingTask = prisma.$transaction(async (tx) => {
      await acquireDedupeLocks(tx, clickFingerprint, ip, userAgent)

      let isDuplicate = false

      if (userAgent) {
        const recentUserAgentClick = await tx.click.findFirst({
          where: {
            userAgent,
            createdAt: {
              gte: new Date(Date.now() - dedupeWindowMs),
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        if (recentUserAgentClick) {
          isDuplicate = true
        }
      }

      if (!isDuplicate && ip) {
        const ipMatchClick = await tx.click.findFirst({
          where: {
            ipAddress: ip,
          },
          orderBy: { createdAt: 'desc' },
        })

        if (ipMatchClick) {
          isDuplicate = true
        }
      }

      await tx.click.create({
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
          isUnique: !isDuplicate,
          isBot: false,
        },
      })

      await tx.linkAccount.update({
        where: { id: link.id },
        data: {
          totalClicks: { increment: 1 },
          ...(!isDuplicate ? { uniqueClicks: { increment: 1 } } : {}),
        },
      })

      return isDuplicate
    })

    const requestWithWaitUntil = request as Request & {
      waitUntil?: (promise: Promise<unknown>) => void
    }

    if (typeof requestWithWaitUntil.waitUntil === 'function') {
      requestWithWaitUntil.waitUntil(
        loggingTask.then((isDuplicate) => {
          if (isDuplicate) {
            console.debug('Duplicate click detected and stored for link', link.id)
          }
        }).catch((error) => {
          console.error('Click logging failed:', error)
        })
      )
    } else {
      const isDuplicateAfterLock = await loggingTask
      if (isDuplicateAfterLock) {
        console.debug('Duplicate click detected and stored for link', link.id)
      }
    }

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