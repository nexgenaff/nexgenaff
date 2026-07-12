export interface VisitorProfile {
  browser: string | null
  browserVersion: string | null
  os: string | null
  deviceType: string | null
}

const BROWSER_PATTERNS = [
  { name: 'Brave', pattern: /Brave\/(\d+(?:\.\d+)*)/i },
  { name: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+(?:\.\d+)*)/i },
  { name: 'Opera', pattern: /OPR\/(\d+(?:\.\d+)*)/i },
  { name: 'Chrome', pattern: /Chrome\/(\d+(?:\.\d+)*)/i },
  { name: 'Firefox', pattern: /Firefox\/(\d+(?:\.\d+)*)/i },
  { name: 'Safari', pattern: /Version\/(\d+(?:\.\d+)*)\s+Safari/i },
]

const OS_PATTERNS = [
  { name: 'Windows', pattern: /Windows NT (?:\d+\.\d+)/i },
  { name: 'macOS', pattern: /Mac OS X/i },
  { name: 'iOS', pattern: /(iPhone|iPad|iPod)/i },
  { name: 'Android', pattern: /Android/i },
  { name: 'Linux', pattern: /Linux/i },
]

const DEVICE_PATTERNS = [
  { name: 'Tablet', pattern: /iPad|Tablet/i },
  { name: 'Mobile', pattern: /iPhone|Android|Mobile/i },
  { name: 'Desktop', pattern: /Windows|Macintosh|Linux|X11/i },
]

function getBrowserProfile(userAgent: string) {
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

export function parseVisitorProfile(userAgent: string): VisitorProfile {
  const normalized = userAgent.trim()
  if (!normalized) {
    return {
      browser: null,
      browserVersion: null,
      os: null,
      deviceType: null,
    }
  }

  const browser = getBrowserProfile(normalized)
  const os = getOsProfile(normalized)
  const deviceType = getDeviceProfile(normalized)

  return {
    browser: browser.browser,
    browserVersion: browser.browserVersion,
    os,
    deviceType,
  }
}
