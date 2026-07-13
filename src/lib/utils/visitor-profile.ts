export interface VisitorProfile {
  browser: string | null
  browserVersion: string | null
  os: string | null
  deviceType: string | null
  deviceBrand: string | null
  appName: string | null
  appVersion: string | null
}

const BOT_BROWSER_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandex/i, /baidu/i,
  /duckduckbot/i, /slurp/i, /facebookexternalhit/i,
  /twitterbot/i, /linkedinbot/i, /ahrefsbot/i,
  /semrushbot/i, /petalbot/i, /mj12bot/i,
  /rogerbot/i, /dotbot/i, /screamingfrog/i,
  /sitebulb/i, /curl\//i, /wget\//i,
  /python-requests\//i
]

const APP_PATTERNS = [
  { name: 'Facebook', pattern: /FBAN\//i },
  { name: 'Instagram', pattern: /Instagram/i },
  { name: 'TikTok', pattern: /TikTok/i },
  { name: 'Telegram', pattern: /Telegram/i },
  { name: 'WhatsApp', pattern: /WhatsApp/i },
]

const BROWSER_PATTERNS = [
  { name: 'Brave', pattern: /Brave\/(\d+(?:\.\d+)*)/i },
  { name: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+(?:\.\d+)*)/i },
  { name: 'Opera', pattern: /OPR\/(\d+(?:\.\d+)*)/i },
  { name: 'Chrome', pattern: /Chrome\/(\d+(?:\.\d+)*)/i },
  { name: 'Firefox', pattern: /Firefox\/(\d+(?:\.\d+)*)/i },
  { name: 'Safari', pattern: /Version\/(\d+(?:\.\d+)*)(?:[^\n]*?)Safari/i },
]

const OS_PATTERNS = [
  { name: 'iOS', pattern: /(iPhone|iPad|iPod)/i },
  { name: 'Android', pattern: /Android/i },
  { name: 'Windows', pattern: /Windows NT (?:\d+\.\d+)/i },
  { name: 'macOS', pattern: /Mac OS X/i },
  { name: 'Linux', pattern: /Linux/i },
]

const DEVICE_PATTERNS = [
  { name: 'Tablet', pattern: /iPad|Tablet/i },
  { name: 'Mobile', pattern: /iPhone|Android|Mobile/i },
  { name: 'Desktop', pattern: /Windows|Macintosh|Linux|X11/i },
]

const DEVICE_BRAND_PATTERNS = [
  { name: 'iPhone', pattern: /iPhone/i },
  { name: 'iPad', pattern: /iPad/i },
  { name: 'Pixel', pattern: /Pixel/i },
  { name: 'Samsung', pattern: /Samsung|SM-/i },
  { name: 'Huawei', pattern: /Huawei/i },
  { name: 'OnePlus', pattern: /OnePlus/i },
  { name: 'Nexus', pattern: /Nexus/i },
  { name: 'Xiaomi', pattern: /Xiaomi|Mi /i },
]

function getAppProfile(userAgent: string) {
  const app = APP_PATTERNS.find((candidate) => candidate.pattern.test(userAgent))
  if (!app) return { appName: null, appVersion: null }

  const versionMatch = userAgent.match(/(?:FBAV|Instagram|TikTok|Telegram|WhatsApp)\/?(\d+(?:\.\d+)*)/i)

  return {
    appName: app.name,
    appVersion: versionMatch?.[1] || null,
  }
}

function getBrowserProfile(userAgent: string) {
  if (BOT_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return {
      browser: 'Bot',
      browserVersion: null,
    }
  }

  const appProfile = getAppProfile(userAgent)
  if (appProfile.appName) {
    return {
      browser: appProfile.appName,
      browserVersion: appProfile.appVersion,
    }
  }

  for (const candidate of BROWSER_PATTERNS) {
    const match = userAgent.match(candidate.pattern)
    if (match) {
      return {
        browser: candidate.name,
        browserVersion: match[1] || null,
      }
    }
  }

  return {
    browser: userAgent.includes('Mozilla') ? 'Unknown Browser' : null,
    browserVersion: null,
  }
}

function getOsProfile(userAgent: string) {
  const match = OS_PATTERNS.find((candidate) => candidate.pattern.test(userAgent))
  if (match) {
    if (match.name === 'iOS') return 'iOS'
    if (match.name === 'Android') return 'Android'
    if (match.name === 'Windows') return 'Windows'
    if (match.name === 'macOS') return 'macOS'
    if (match.name === 'Linux') return 'Linux'
  }

  return null
}

function getDeviceProfile(userAgent: string) {
  const match = DEVICE_PATTERNS.find((candidate) => candidate.pattern.test(userAgent))
  if (match) {
    return match.name
  }

  return 'Desktop'
}

function getDeviceBrand(userAgent: string): string | null {
  const match = DEVICE_BRAND_PATTERNS.find((candidate) => candidate.pattern.test(userAgent))
  return match?.name || null
}

export function parseVisitorProfile(userAgent: string): VisitorProfile {
  const normalized = userAgent.trim()
  if (!normalized) {
    return {
      browser: null,
      browserVersion: null,
      os: null,
      deviceType: null,
      deviceBrand: null,
      appName: null,
      appVersion: null,
    }
  }

  const browser = getBrowserProfile(normalized)
  const os = getOsProfile(normalized)
  const deviceType = getDeviceProfile(normalized)
  const deviceBrand = getDeviceBrand(normalized)
  const appProfile = getAppProfile(normalized)

  return {
    browser: browser.browser,
    browserVersion: browser.browserVersion,
    os,
    deviceType,
    deviceBrand,
    appName: appProfile.appName,
    appVersion: appProfile.appVersion,
  }
}
