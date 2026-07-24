import { NextResponse, type NextRequest } from 'next/server';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { BotDetectionService } from '@/lib/services/bot-detection';
import { buildClickFingerprint, getClickDedupeWindowMs, isDuplicateClickEvent } from '@/lib/services/click-detection';
import { getGeoLocation } from '@/lib/services/geo/ip2location';
import { buildRedirectTargetUrl } from '@/lib/utils/redirect';
import { parseVisitorProfile } from '@/lib/utils/visitor-profile';

const BOT_FALLBACK_URL = 'https://weebly.pro';
const normalizeGroupName = (value?: string | null) => value?.trim() ?? '';

// ========== OFFER SELECTION ==========

const selectRotatingOffer = (
  offers: Array<{
    id: string;
    priority: number;
    rotationMode: string;
    offerUrl: string;
    country: string;
    isGlobal: boolean;
    isActive: boolean;
    usaSecretRedirectEnabled: boolean;
    createdAt: Date;
    groupName: string | null;
  }>
) => {
  if (!offers.length) return null;
  if (offers.length === 1) return offers[0];

  const randomPool = offers.filter((offer) => offer.rotationMode === 'RANDOM');
  if (randomPool.length > 0) {
    const randomIndex = randomInt(0, randomPool.length);
    return randomPool[randomIndex];
  }

  return [...offers].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.createdAt.getTime() - b.createdAt.getTime();
  })[0];
};

const selectGroupOffer = async (
  tx: any,
  userId: string,
  country: string,
  groupName: string
) => {
  const regionalGroupCandidates = await tx.offerVault.findMany({
    where: {
      userId,
      country,
      groupName,
      isActive: true,
      isGlobal: false,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  let offer = selectRotatingOffer(regionalGroupCandidates);

  if (!offer) {
    const globalGroupCandidates = await tx.offerVault.findMany({
      where: {
        userId,
        groupName,
        isActive: true,
        isGlobal: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    offer = selectRotatingOffer(globalGroupCandidates);
  }

  return offer;
};

const selectOffer = async (
  tx: any,
  userId: string,
  country: string,
  linkGroupName: string | null
) => {
  let offer = null;

  // 1. Group-specific offer
  if (linkGroupName) {
    offer = await selectGroupOffer(tx, userId, country, linkGroupName);
    if (offer) return offer;
  }

  // 2. Country-specific offers
  const countryCandidates = await tx.offerVault.findMany({
    where: {
      userId,
      country,
      isActive: true,
      isGlobal: false,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  const namedGroupCandidates = countryCandidates.filter((c: any) => normalizeGroupName(c.groupName));
  const directCountryCandidates = countryCandidates.filter((c: any) => !normalizeGroupName(c.groupName));

  offer = selectRotatingOffer(
    namedGroupCandidates.length ? namedGroupCandidates : directCountryCandidates
  );
  if (offer) return offer;

  // 3. Global fallback
  const globalCandidates = await tx.offerVault.findMany({
    where: {
      userId,
      isGlobal: true,
      isActive: true,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  offer = selectRotatingOffer(globalCandidates);
  return offer;
};

// ========== HELPERS ==========

const getClientIp = (headers: Headers): string => {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('true-client-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
};

const normalizeDedupeValue = (value?: string | null) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const buildDedupeLockKeys = (clickSignature: string, ipAddress: string, userAgent: string) => {
  return [clickSignature, ipAddress, userAgent]
    .map(normalizeDedupeValue)
    .filter((value) => value !== '' && value !== 'unknown')
    .reduce<string[]>((acc, value) => (acc.includes(value) ? acc : [...acc, value]), [])
    .sort();
};

const acquireDedupeLocks = async (tx: any, clickSignature: string, ipAddress: string, userAgent: string) => {
  const keys = buildDedupeLockKeys(clickSignature, ipAddress, userAgent);
  for (const key of keys) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }
};

const logBotClick = async (
  tx: any,
  linkId: string,
  clickFingerprint: string,
  ip: string,
  userAgent: string,
  referrer: string,
  visitorProfile: any,
  botResult: any
) => {
  await tx.click.create({
    data: {
      linkAccountId: linkId,
      clickSignature: clickFingerprint,
      ipAddress: ip,
      userAgent,
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
  });

  await tx.linkAccount.update({
    where: { id: linkId },
    data: { botClicks: { increment: 1 } },
  });
};

const buildRedirectResponse = (
  url: string,
  origin?: string | null,
  status: 302 | 307 = 302
): NextResponse => {
  const response = NextResponse.redirect(url, { status });
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};

// ========== MAIN HANDLER ==========

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const headers = request.headers;
    const ip = getClientIp(headers);
    const userAgent = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || '';
    const origin = headers.get('origin') || '';
    const visitorProfile = parseVisitorProfile(userAgent);

    // ────────────────────────────────────────────────────────────────
    // 1. Validate the link
    // ────────────────────────────────────────────────────────────────
    const link = await prisma.linkAccount.findUnique({
      where: { slug },
      include: { customDomain: true },
    });

    if (!link || !link.isActive) {
      return new NextResponse('Link not found', { status: 404 });
    }

    // ────────────────────────────────────────────────────────────────
    // 2. Build fingerprint (used for deduplication)
    // ────────────────────────────────────────────────────────────────
    const clickFingerprint = buildClickFingerprint({
      linkId: link.id,
      ipAddress: ip,
      userAgent,
      browser: visitorProfile.browser,
      os: visitorProfile.os,
      deviceType: visitorProfile.deviceType,
    });

    // ────────────────────────────────────────────────────────────────
    // 3. Bot detection (run before geo lookup to save costs)
    // ────────────────────────────────────────────────────────────────
    const botService = new BotDetectionService();
    
    // Convert headers to object for bot detection analysis
    const headersObj: Record<string, string | null> = {
      'user-agent': userAgent,
      'accept': headers.get('accept'),
      'accept-language': headers.get('accept-language'),
      'accept-encoding': headers.get('accept-encoding'),
      'cache-control': headers.get('cache-control'),
      'referer': referrer,
    };
    
    const botResult = await botService.detect(userAgent, ip, headersObj);

    if (botResult.isBot) {
      // Log bot click in a transaction
      await prisma.$transaction(async (tx) => {
        await logBotClick(
          tx,
          link.id,
          clickFingerprint,
          ip,
          userAgent,
          referrer,
          visitorProfile,
          botResult
        );
      });

      // Use environment variable for safe redirect URL
      const safeRedirectUrl = process.env.BOT_SAFE_REDIRECT_URL || BOT_FALLBACK_URL;
      console.log(`[BOT BLOCKED] Slug: ${slug}, IP: ${ip}, Reason: ${botResult.reasons.join(' | ')}, Score: ${botResult.score}, Confidence: ${botResult.confidence}`);
      
      const response = buildRedirectResponse(safeRedirectUrl, origin, 307);
      response.headers.set('X-Bot-Detection-Score', botResult.score.toString());
      response.headers.set('X-Bot-Detection-Reason', botResult.reasons.join('; '));
      response.headers.set('X-Bot-Confidence', botResult.confidence);
      
      return response;
    }

    // ────────────────────────────────────────────────────────────────
    // 4. Geo lookup (only after bot check)
    // ────────────────────────────────────────────────────────────────
    const geo = await getGeoLocation(ip, headers);
    const country = (geo?.country_code || '').toUpperCase();

    const dedupeWindowMs = getClickDedupeWindowMs();

    // ────────────────────────────────────────────────────────────────
    // 6. Main transaction: offer selection + click logging + dedupe
    // ────────────────────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      await acquireDedupeLocks(tx, clickFingerprint, ip, userAgent);

      // ── 6a. Re-check duplicate under lock ──
      const existing = await tx.click.findFirst({
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
      });

      const isDuplicate = existing
        ? isDuplicateClickEvent(
            new Date(existing.createdAt),
            new Date(),
            {
              clickSignature: clickFingerprint,
              ipAddress: ip,
              userAgent,
              lastClickSignature: existing.clickSignature,
              lastIpAddress: existing.ipAddress,
              lastUserAgent: existing.userAgent,
            },
            dedupeWindowMs,
          )
        : false;

      // ── 6b. Select the offer ──
      const offer = await selectOffer(tx, link.userId, country, link.offerGroupName);
      if (!offer) {
        throw new Error('No offer available for this request');
      }

      // ── 6c. Handle USA Secret Redirect Mode ──
      const isUsaSecretMode = country === 'US' && offer.usaSecretRedirectEnabled === true;
      const isSecretRedirect = isUsaSecretMode && randomInt(0, 2) === 0;

      if (isSecretRedirect) {
        // Secret mode: no click logged
        return {
          offer,
          shouldRedirect: true,
          isSecret: true,
          isDuplicate: false,
        };
      }

      // ── 6d. Log click if not duplicate ──
      await tx.click.create({
        data: {
          linkAccountId: link.id,
          clickSignature: clickFingerprint,
          ipAddress: ip,
          userAgent,
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
      });

      await tx.linkAccount.update({
        where: { id: link.id },
        data: {
          totalClicks: { increment: 1 },
          ...(isDuplicate ? {} : { uniqueClicks: { increment: 1 } }),
        },
      });

      if (isDuplicate) {
        console.debug('Duplicate click detected and stored for link', link.id);
      }

      return {
        offer,
        shouldRedirect: true,
        isSecret: false,
        isDuplicate,
      };
    });

    // ────────────────────────────────────────────────────────────────
    // 7. Build and return redirect response
    // ────────────────────────────────────────────────────────────────
    const finalUrl = buildRedirectTargetUrl(result.offer.offerUrl, slug);
    return buildRedirectResponse(finalUrl, origin, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    // In case of error, log but still redirect to fallback
    return buildRedirectResponse(BOT_FALLBACK_URL, null, 307);
  }
}

// ────────────────────────────────────────────────────────────────
// 8. CORS preflight
// ────────────────────────────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Referer, Origin'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}