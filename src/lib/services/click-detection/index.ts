export interface ClickFingerprintInput {
  linkId: string
  ipAddress?: string | null
  userAgent?: string | null
  browser?: string | null
  os?: string | null
  deviceType?: string | null
}

export interface DuplicateClickContext {
  clickSignature?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  lastClickSignature?: string | null
  lastIpAddress?: string | null
  lastUserAgent?: string | null
}

export const CLICK_DEDUPE_WINDOW_MS = 10 * 60 * 1000

export function buildClickFingerprint({
  linkId,
  ipAddress,
  userAgent,
  browser,
  os,
  deviceType,
}: ClickFingerprintInput): string {
  const normalizedIp = (ipAddress || 'unknown').trim().toLowerCase()
  const normalizedUserAgent = (userAgent || '').trim().replace(/\s+/g, ' ')
  const normalizedBrowser = (browser || '').trim().toLowerCase()
  const normalizedOs = (os || '').trim().toLowerCase()
  const normalizedDeviceType = (deviceType || '').trim().toLowerCase()

  return [
    `link:${linkId}`,
    `ip:${normalizedIp}`,
    `ua:${normalizedUserAgent}`,
    `browser:${normalizedBrowser}`,
    `os:${normalizedOs}`,
    `device:${normalizedDeviceType}`,
  ].join('|')
}

export function isDuplicateVisit(lastSeenAt: Date, now: Date, windowMs = CLICK_DEDUPE_WINDOW_MS): boolean {
  const delta = now.getTime() - lastSeenAt.getTime()
  return Number.isFinite(delta) && delta >= 0 && delta <= windowMs
}

const normalizeMatchValue = (value?: string | null) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase()

export function isDuplicateClickEvent(
  lastSeenAt: Date,
  now: Date,
  context: DuplicateClickContext,
  windowMs = CLICK_DEDUPE_WINDOW_MS,
): boolean {
  if (!isDuplicateVisit(lastSeenAt, now, windowMs)) {
    return false
  }

  const sameClickSignature = Boolean(
    context.clickSignature &&
      context.lastClickSignature &&
      normalizeMatchValue(context.clickSignature) === normalizeMatchValue(context.lastClickSignature),
  )

  const sameIpAddress = Boolean(
    context.ipAddress &&
      context.lastIpAddress &&
      normalizeMatchValue(context.ipAddress) === normalizeMatchValue(context.lastIpAddress),
  )

  const sameUserAgent = Boolean(
    context.userAgent &&
      context.lastUserAgent &&
      normalizeMatchValue(context.userAgent) === normalizeMatchValue(context.lastUserAgent),
  )

  return sameClickSignature || sameIpAddress || sameUserAgent
}

export function isUniqueVisit(lastSeenAt: Date, now: Date, windowMs = CLICK_DEDUPE_WINDOW_MS): boolean {
  return !isDuplicateVisit(lastSeenAt, now, windowMs)
}

export const CLICK_DEDUPE_WINDOW = CLICK_DEDUPE_WINDOW_MS
