import axios from 'axios'

export interface GeoLocation {
  country_code: string
  country_name: string
  region: string
  city: string
  latitude: number
  longitude: number
  isp: string
  timezone: string
}

const COUNTRY_NAME_LOOKUP: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  BR: 'Brazil',
  RU: 'Russia',
  ZA: 'South Africa',
  ES: 'Spain',
  IT: 'Italy',
  MX: 'Mexico',
  KR: 'South Korea',
  NL: 'Netherlands',
  AE: 'United Arab Emirates',
  SG: 'Singapore',
  SE: 'Sweden',
  NZ: 'New Zealand',
  TR: 'Turkey',
  ID: 'Indonesia',
  PH: 'Philippines',
  BD: 'Bangladesh',
  UA: 'Ukraine',
  PL: 'Poland',
  AR: 'Argentina',
  CH: 'Switzerland',
  NG: 'Nigeria',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
}

const LOCAL_DEV_GEO_FALLBACK: GeoLocation = {
  country_code: 'US',
  country_name: 'United States',
  region: 'California',
  city: 'San Francisco',
  latitude: 37.7749,
  longitude: -122.4194,
  isp: 'Local Development',
  timezone: 'America/Los_Angeles',
}

function normalizeCountryCode(value?: string | null): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const normalized = raw.toUpperCase().replace(/[^A-Z]/g, '')
  return normalized || null
}

function normalizeClientIp(rawIp?: string | null): string {
  if (!rawIp) return 'unknown'

  const candidate = rawIp
    .split(',')[0]
    .trim()
    .replace(/\[|\]/g, '')
    .replace(/^"|"$/g, '')

  if (!candidate) return 'unknown'

  return candidate
}

function isLocalDevelopmentIp(ip: string): boolean {
  const normalized = normalizeClientIp(ip).toLowerCase()

  if (normalized === 'unknown' || normalized === 'localhost') return true
  if (normalized === '127.0.0.1' || normalized === '::1' || normalized === '::ffff:127.0.0.1' || normalized === '0:0:0:0:0:0:0:1') return true
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true

  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4Match) return false

  const [first, second] = ipv4Match.slice(1, 3).map(Number)
  if (Number.isNaN(first) || Number.isNaN(second)) return false

  return first === 10
    || first === 127
    || (first === 192 && second === 168)
    || (first === 169 && second === 254)
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 172 && second >= 16 && second <= 31)
}

function getCountryCodeFromHeaders(headers?: Headers): string | null {
  const headerNames = [
    'cf-ipcountry',
    'cf-country',
    'x-vercel-ip-country',
    'x-country-code',
    'x-country',
  ]

  for (const headerName of headerNames) {
    const value = headers?.get(headerName)
    const normalized = normalizeCountryCode(value)
    if (normalized) return normalized
  }

  return null
}

function getHeaderGeoLocation(headers?: Headers): GeoLocation | null {
  const countryCode = getCountryCodeFromHeaders(headers)
  if (!countryCode) return null

  const region = headers?.get('x-vercel-ip-country-region') || headers?.get('cf-region') || headers?.get('x-country-region') || 'Unknown'
  const city = headers?.get('x-vercel-ip-city') || headers?.get('cf-ipcity') || headers?.get('x-city') || 'Unknown'
  const isp = headers?.get('x-vercel-ip-isp') || headers?.get('x-isp') || 'Proxy Geo Header'
  const timezone = headers?.get('x-vercel-ip-timezone') || 'UTC'
  const latitude = parseFloat(headers?.get('x-vercel-ip-latitude') || '0') || 0
  const longitude = parseFloat(headers?.get('x-vercel-ip-longitude') || '0') || 0

  return {
    country_code: countryCode,
    country_name: COUNTRY_NAME_LOOKUP[countryCode] || countryCode,
    region,
    city,
    latitude,
    longitude,
    isp,
    timezone,
  }
}

async function getPublicGeoLocation(ip: string): Promise<GeoLocation | null> {
  const candidates = [
    `https://ipwho.is/${encodeURIComponent(ip)}?output=json`,
    `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`,
    `https://api.country.is/${encodeURIComponent(ip)}`,
  ]

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        continue
      }

      const payload = await response.json() as Record<string, unknown>

      if (url.includes('ipwho.is')) {
        const countryCode = normalizeCountryCode(
          typeof payload.country_code === 'string' ? payload.country_code : typeof payload.country === 'string' ? payload.country : null
        )
        if (!countryCode) continue

        return {
          country_code: countryCode,
          country_name: typeof payload.country === 'string' ? payload.country : COUNTRY_NAME_LOOKUP[countryCode] || countryCode,
          region: typeof payload.region === 'string' ? payload.region : 'Unknown',
          city: typeof payload.city === 'string' ? payload.city : 'Unknown',
          latitude: Number.parseFloat(String(payload.latitude ?? '0')) || 0,
          longitude: Number.parseFloat(String(payload.longitude ?? '0')) || 0,
          isp: typeof payload.isp === 'string' ? payload.isp : 'Unknown',
          timezone: typeof payload.timezone === 'string' ? payload.timezone : 'UTC',
        }
      }

      if (url.includes('freeipapi')) {
        const countryCode = normalizeCountryCode(
          typeof payload.countryCode === 'string' ? payload.countryCode : null
        )
        if (!countryCode) continue

        return {
          country_code: countryCode,
          country_name: typeof payload.countryName === 'string' ? payload.countryName : COUNTRY_NAME_LOOKUP[countryCode] || countryCode,
          region: 'Unknown',
          city: 'Unknown',
          latitude: Number.parseFloat(String(payload.latitude ?? '0')) || 0,
          longitude: Number.parseFloat(String(payload.longitude ?? '0')) || 0,
          isp: typeof payload.ipAddress === 'string' ? payload.ipAddress : 'Unknown',
          timezone: Array.isArray(payload.timeZones) && payload.timeZones.length > 0 ? String(payload.timeZones[0]) : 'UTC',
        }
      }

      if (url.includes('api.country.is')) {
        const countryCode = normalizeCountryCode(typeof payload.country === 'string' ? payload.country : null)
        if (!countryCode) continue

        return {
          country_code: countryCode,
          country_name: COUNTRY_NAME_LOOKUP[countryCode] || countryCode,
          region: 'Unknown',
          city: 'Unknown',
          latitude: 0,
          longitude: 0,
          isp: 'Unknown',
          timezone: 'UTC',
        }
      }
    } catch {
      continue
    }
  }

  return null
}

export async function getGeoLocation(ip: string, headers?: Headers): Promise<GeoLocation | null> {
  try {
    const apiKey = process.env.IP2LOCATION_API_KEY
    const normalizedIp = normalizeClientIp(ip)
    const headerGeo = getHeaderGeoLocation(headers)

    if (headerGeo) {
      return headerGeo
    }

    if (isLocalDevelopmentIp(normalizedIp)) {
      return LOCAL_DEV_GEO_FALLBACK
    }

    if (!apiKey) {
      console.warn('IP2LOCATION_API_KEY not set; trying public geo fallback lookup')
      const publicGeo = await getPublicGeoLocation(normalizedIp)
      return publicGeo || getFallbackLocation(normalizedIp)
    }

    const response = await axios.get('https://api.ip2location.io/', {
      params: {
        key: apiKey,
        ip: normalizedIp,
        format: 'json',
      },
      timeout: 5000,
    })

    if (response.data && response.data.country_code) {
      return {
        country_code: response.data.country_code,
        country_name: response.data.country_name || COUNTRY_NAME_LOOKUP[response.data.country_code] || '',
        region: response.data.region_name || '',
        city: response.data.city_name || '',
        latitude: parseFloat(response.data.latitude) || 0,
        longitude: parseFloat(response.data.longitude) || 0,
        isp: response.data.isp || '',
        timezone: response.data.timezone || '',
      }
    }

    return getFallbackLocation(normalizedIp)
  } catch (error) {
    console.error('IP2Location error:', error)
    const normalizedIp = normalizeClientIp(ip)
    const publicGeo = await getPublicGeoLocation(normalizedIp)
    return publicGeo || getFallbackLocation(normalizedIp)
  }
}

function getFallbackLocation(ip: string): GeoLocation {
  return {
    country_code: '',
    country_name: '',
    region: '',
    city: '',
    latitude: 0,
    longitude: 0,
    isp: ip === 'unknown' ? '' : ip,
    timezone: 'UTC',
  }
}