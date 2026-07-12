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
  UA: 'Ukraine',
  PL: 'Poland',
  AR: 'Argentina',
  CH: 'Switzerland',
  NG: 'Nigeria',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
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

export async function getGeoLocation(ip: string, headers?: Headers): Promise<GeoLocation | null> {
  try {
    const apiKey = process.env.IP2LOCATION_API_KEY
    const normalizedIp = normalizeClientIp(ip)
    const headerGeo = getHeaderGeoLocation(headers)

    if (headerGeo) {
      return headerGeo
    }

    if (!apiKey) {
      console.warn('IP2LOCATION_API_KEY not set; using deterministic fallback geo')
      return getFallbackLocation(normalizedIp)
    }

    if (normalizedIp === '127.0.0.1' || normalizedIp === 'localhost' || normalizedIp === '::1' || normalizedIp === 'unknown' || normalizedIp === '::ffff:127.0.0.1' || normalizedIp === '0:0:0:0:0:0:0:1') {
      return {
        country_code: 'US',
        country_name: 'United States',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Local Development',
        timezone: 'America/Los_Angeles',
      }
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
    return getFallbackLocation(normalizeClientIp(ip))
  }
}

function getFallbackLocation(ip: string): GeoLocation {
  return {
    country_code: 'UNKNOWN',
    country_name: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    latitude: 0,
    longitude: 0,
    isp: ip === 'unknown' ? 'Unknown' : ip,
    timezone: 'UTC',
  }
}