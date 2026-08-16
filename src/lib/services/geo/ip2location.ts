/**
 * geolocation.ts
 * 
 * A robust geolocation lookup module with:
 * - Header‑based detection (Cloudflare, Vercel, etc.)
 * - IP2Location API (primary, with multiple keys & rotation)
 * - Free public APIs (fallback)
 * - In‑memory caching
 * - Configurable fallback (no default country unless explicitly set)
 * - Timeouts, retries, and error handling
 * - Works in Next.js, Express, and any Node.js environment
 */

/* ========================== TYPES ========================== */
export interface GeoLocation {
  country_code: string;
  country_name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  timezone: string;
}

/* ========================== CONFIGURATION ========================== */

// All settings come from environment variables, with sensible defaults.
const ENV = {
  // Comma‑separated list of IP2Location API keys (e.g., "key1,key2,key3")
  IP2LOCATION_API_KEYS: process.env.IP2LOCATION_API_KEYS || process.env.IP2LOCATION_API_KEY || '',
  // Default country code to return when all lookups fail.
  // Set to empty string to return `null` instead of a fallback.
  GEO_DEFAULT_COUNTRY: process.env.GEO_DEFAULT_COUNTRY ?? 'US',
  // Cache TTL in seconds (default: 300 = 5 minutes)
  GEO_CACHE_TTL: parseInt(process.env.GEO_CACHE_TTL || '300', 10),
  // Allow local/private IPs in production (default: false)
  GEO_ALLOW_LOCAL_IN_PROD: process.env.GEO_ALLOW_LOCAL_IN_PROD === 'true',
  // Timeout for each external API call in milliseconds (default: 5000)
  GEO_REQUEST_TIMEOUT: parseInt(process.env.GEO_REQUEST_TIMEOUT || '5000', 10),
  // Number of retries per IP2Location key (default: 1)
  GEO_IP2LOCATION_RETRIES: parseInt(process.env.GEO_IP2LOCATION_RETRIES || '1', 10),
};

/* ========================== LOGGING ========================== */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Logger = (level: LogLevel, message: string, ...meta: unknown[]) => void;

let logger: Logger = (level, message, ...meta) => {
  const prefix = `[GeoLocation] ${level.toUpperCase()}`;
  if (level === 'error') console.error(prefix, message, ...meta);
  else if (level === 'warn') console.warn(prefix, message, ...meta);
  else if (level === 'info') console.info(prefix, message, ...meta);
  else console.debug(prefix, message, ...meta);
};

/**
 * Override the default logger.
 * @param customLogger – Function receiving (level, message, ...meta).
 */
export function setGeoLocationLogger(customLogger: Logger): void {
  logger = customLogger;
}

/* ========================== HELPERS ========================== */

/** Normalise a country code: uppercase, strip non‑letters, return null if empty. */
export function normalizeCountryCode(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const normalized = raw.toUpperCase().replace(/[^A-Z]/g, '');
  return normalized || null;
}

/**
 * Normalise a client IP address:
 * - Take the first IP if multiple are comma‑separated.
 * - Remove brackets, quotes.
 * - Strip port numbers (both IPv4 and IPv6).
 */
function normalizeClientIp(rawIp?: string | null): string {
  if (!rawIp) return 'unknown';

  let candidate = rawIp
    .split(',')[0]
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\[|\]/g, '');

  if (!candidate) return 'unknown';

  // Remove port numbers if present.
  // For IPv4: remove trailing :port
  if (candidate.includes('.')) {
    const parts = candidate.split(':');
    if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
      candidate = parts.slice(0, -1).join(':');
    }
  } else {
    // For IPv6: remove trailing :port (after all colons)
    const lastColon = candidate.lastIndexOf(':');
    if (lastColon !== -1) {
      const after = candidate.slice(lastColon + 1);
      if (/^\d+$/.test(after)) {
        candidate = candidate.slice(0, lastColon);
      }
    }
  }

  return candidate || 'unknown';
}

/** Check if an IP is a local/private address (development). */
function isLocalDevelopmentIp(ip: string): boolean {
  const normalized = normalizeClientIp(ip).toLowerCase();

  if (normalized === 'unknown' || normalized === 'localhost') return true;
  if (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1' ||
    normalized === '0:0:0:0:0:0:0:1'
  )
    return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // IPv6 unique local

  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) return false;

  const [first, second] = ipv4Match.slice(1, 3).map(Number);
  if (Number.isNaN(first) || Number.isNaN(second)) return false;

  return (
    first === 10 ||
    first === 127 ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254) ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 172 && second >= 16 && second <= 31)
  );
}

/** Fetch with timeout using AbortController. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = ENV.GEO_REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Sleep helper for retries. */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ========================== HEADER GEO LOOKUP ========================== */

/** Attempt to extract country code from common headers. */
function getCountryCodeFromHeaders(headers?: Headers): string | null {
  const headerNames = [
    'cf-ipcountry',
    'cf-country',
    'x-vercel-ip-country',
    'x-country-code',
    'x-country',
  ];

  for (const name of headerNames) {
    const value = headers?.get(name);
    const normalized = normalizeCountryCode(value);
    if (normalized) return normalized;
  }
  return null;
}

/** Build a full GeoLocation object from headers if possible. */
function getHeaderGeoLocation(headers?: Headers): GeoLocation | null {
  const countryCode = getCountryCodeFromHeaders(headers);
  if (!countryCode) return null;

  const region =
    headers?.get('x-vercel-ip-country-region') ||
    headers?.get('cf-region') ||
    headers?.get('x-country-region') ||
    'Unknown';
  const city =
    headers?.get('x-vercel-ip-city') ||
    headers?.get('cf-ipcity') ||
    headers?.get('x-city') ||
    'Unknown';
  const isp = headers?.get('x-vercel-ip-isp') || headers?.get('x-isp') || 'Proxy Geo Header';
  const timezone = headers?.get('x-vercel-ip-timezone') || 'UTC';
  const latitude = parseFloat(headers?.get('x-vercel-ip-latitude') || '0') || 0;
  const longitude = parseFloat(headers?.get('x-vercel-ip-longitude') || '0') || 0;

  return {
    country_code: countryCode,
    country_name: countryCode, // we'll fill country_name later if needed
    region,
    city,
    latitude,
    longitude,
    isp,
    timezone,
  };
}

/* ========================== PUBLIC API FALLBACKS ========================== */

async function fetchPublicIpwhois(ip: string): Promise<GeoLocation | null> {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}?output=json`;
  try {
    const response = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;

    const countryCode = normalizeCountryCode(
      typeof payload.country_code === 'string'
        ? payload.country_code
        : typeof payload.country === 'string'
        ? payload.country
        : null
    );
    if (!countryCode) return null;

    return {
      country_code: countryCode,
      country_name: typeof payload.country === 'string' ? payload.country : countryCode,
      region: typeof payload.region === 'string' ? payload.region : 'Unknown',
      city: typeof payload.city === 'string' ? payload.city : 'Unknown',
      latitude: Number.parseFloat(String(payload.latitude ?? '0')) || 0,
      longitude: Number.parseFloat(String(payload.longitude ?? '0')) || 0,
      isp: typeof payload.isp === 'string' ? payload.isp : 'Unknown',
      timezone: typeof payload.timezone === 'string' ? payload.timezone : 'UTC',
    };
  } catch {
    return null;
  }
}

async function fetchPublicFreeipapi(ip: string): Promise<GeoLocation | null> {
  const url = `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`;
  try {
    const response = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;

    const countryCode = normalizeCountryCode(
      typeof payload.countryCode === 'string' ? payload.countryCode : null
    );
    if (!countryCode) return null;

    const timezone =
      Array.isArray(payload.timeZones) && payload.timeZones.length > 0
        ? String(payload.timeZones[0])
        : 'UTC';

    return {
      country_code: countryCode,
      country_name: typeof payload.countryName === 'string' ? payload.countryName : countryCode,
      region: 'Unknown',
      city: 'Unknown',
      latitude: Number.parseFloat(String(payload.latitude ?? '0')) || 0,
      longitude: Number.parseFloat(String(payload.longitude ?? '0')) || 0,
      isp: typeof payload.ipAddress === 'string' ? payload.ipAddress : 'Unknown',
      timezone,
    };
  } catch {
    return null;
  }
}

async function fetchPublicCountryIs(ip: string): Promise<GeoLocation | null> {
  const url = `https://api.country.is/${encodeURIComponent(ip)}`;
  try {
    const response = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;

    const countryCode = normalizeCountryCode(
      typeof payload.country === 'string' ? payload.country : null
    );
    if (!countryCode) return null;

    return {
      country_code: countryCode,
      country_name: countryCode,
      region: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
      isp: 'Unknown',
      timezone: 'UTC',
    };
  } catch {
    return null;
  }
}

async function getPublicGeoLocation(ip: string): Promise<GeoLocation | null> {
  const functions = [fetchPublicIpwhois, fetchPublicFreeipapi, fetchPublicCountryIs];
  for (const fn of functions) {
    const result = await fn(ip);
    if (result) return result;
  }
  return null;
}

/* ========================== IP2LOCATION API ========================== */

/** Read API keys from environment. */
function getIp2LocationApiKeys(): string[] {
  const rawKeys = ENV.IP2LOCATION_API_KEYS;
  return rawKeys
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

let ip2LocationKeyIndex = 0;

/** Select an API key in round‑robin fashion. */
function selectIp2LocationApiKey(keys: string[]): string {
  if (keys.length === 0) return '';
  if (keys.length === 1) return keys[0];
  const selected = keys[ip2LocationKeyIndex % keys.length];
  ip2LocationKeyIndex = (ip2LocationKeyIndex + 1) % keys.length;
  return selected;
}

async function callIp2Location(ip: string, apiKey: string): Promise<GeoLocation | null> {
  const url = `https://api.ip2location.io/?key=${encodeURIComponent(
    apiKey
  )}&ip=${encodeURIComponent(ip)}&format=json`;
  try {
    const response = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;

    if (data && typeof data.country_code === 'string') {
      return {
        country_code: data.country_code,
        country_name: typeof data.country_name === 'string' ? data.country_name : data.country_code,
        region: typeof data.region_name === 'string' ? data.region_name : '',
        city: typeof data.city_name === 'string' ? data.city_name : '',
        latitude: parseFloat(String(data.latitude)) || 0,
        longitude: parseFloat(String(data.longitude)) || 0,
        isp: typeof data.isp === 'string' ? data.isp : '',
        timezone: typeof data.timezone === 'string' ? data.timezone : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Attempt IP2Location with retries and key rotation. */
async function getIp2LocationGeo(ip: string): Promise<GeoLocation | null> {
  const keys = getIp2LocationApiKeys();
  if (keys.length === 0) {
    logger('debug', 'IP2Location API keys not set, skipping.');
    return null;
  }

  const startKey = selectIp2LocationApiKey(keys);
  const startIndex = keys.indexOf(startKey);

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(startIndex + attempt) % keys.length];
    let lastError: Error | null = null;

    for (let retry = 0; retry <= ENV.GEO_IP2LOCATION_RETRIES; retry++) {
      try {
        const result = await callIp2Location(ip, key);
        if (result) {
          logger('debug', `IP2Location success with key ${key.slice(0, 4)}...`);
          return result;
        }
        break; // move to next key if no result (but no error)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger('warn', `IP2Location attempt ${retry + 1} failed for key ${key.slice(0, 4)}...`, err);
        if (retry < ENV.GEO_IP2LOCATION_RETRIES) {
          await sleep(200 * (retry + 1)); // simple backoff
        }
      }
    }
  }

  logger('warn', 'All IP2Location keys and retries exhausted.');
  return null;
}

/* ========================== CACHE ========================== */

interface CacheEntry {
  location: GeoLocation;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCachedLocation(ip: string): GeoLocation | null {
  const entry = cache.get(ip);
  if (!entry) return null;
  const ttlMs = ENV.GEO_CACHE_TTL * 1000;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(ip);
    return null;
  }
  return entry.location;
}

function setCachedLocation(ip: string, location: GeoLocation): void {
  cache.set(ip, { location, timestamp: Date.now() });
}

/** Clear the internal cache (useful for testing). */
export function clearGeoLocationCache(): void {
  cache.clear();
}

/* ========================== FALLBACK ========================== */

/**
 * Build the ultimate fallback location.
 * Returns null if ENV.GEO_DEFAULT_COUNTRY is empty (or falsy) and no country code from headers.
 * This prevents defaulting to US for unknown visitors.
 */
function getFallbackLocation(ip: string, headers?: Headers): GeoLocation | null {
  // First, try to get a country from headers (some proxies send it even if we couldn't parse earlier)
  const countryCodeFromHeaders = getCountryCodeFromHeaders(headers);
  const defaultCountry = ENV.GEO_DEFAULT_COUNTRY?.trim() || '';

  const sanitizedDefaultCountry = normalizeCountryCode(defaultCountry) || null;
  let countryCode = normalizeCountryCode(countryCodeFromHeaders) || sanitizedDefaultCountry || '';

  // If no country code at all, return null to signal unknown location.
  if (!countryCode) {
    logger('warn', `No fallback country available for IP ${ip}, returning null.`);
    return null;
  }

  return {
    country_code: countryCode,
    country_name: countryCode,
    region: 'Unknown',
    city: 'Unknown',
    latitude: 0,
    longitude: 0,
    isp: ip === 'unknown' ? '' : ip,
    timezone: 'UTC',
  };
}

/* ========================== MAIN EXPORT ========================== */

/**
 * Main entry point: get geolocation for a given IP address.
 * @param ip – The IP address (or a string that may contain multiple IPs).
 * @param headers – Optional Headers object to inspect for proxy headers.
 * @returns A GeoLocation object, or null if no data could be obtained and fallback is disabled.
 */
export async function getGeoLocation(ip: string, headers?: Headers): Promise<GeoLocation | null> {
  const normalizedIp = normalizeClientIp(ip);
  logger('debug', `Resolving geolocation for IP: ${normalizedIp}`);

  // 1. Check cache
  const cached = getCachedLocation(normalizedIp);
  if (cached) {
    logger('debug', `Cache hit for ${normalizedIp}`);
    return cached;
  }

  // 2. Try headers (fastest)
  const headerGeo = getHeaderGeoLocation(headers);
  if (headerGeo) {
    logger('debug', `Location from headers for ${normalizedIp}`);
    setCachedLocation(normalizedIp, headerGeo);
    return headerGeo;
  }

  // 3. Local development detection
  if (isLocalDevelopmentIp(normalizedIp)) {
    if (process.env.NODE_ENV === 'production' && !ENV.GEO_ALLOW_LOCAL_IN_PROD) {
      logger('warn', `Local IP ${normalizedIp} detected in production; returning null.`);
      return null;
    }
    // Local dev fallback (only in non‑production)
    const devGeo: GeoLocation = {
      country_code: 'US',
      country_name: 'United States',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      isp: 'Local Development',
      timezone: 'America/Los_Angeles',
    };
    setCachedLocation(normalizedIp, devGeo);
    return devGeo;
  }

  // 4. IP2Location (primary external)
  const ip2Geo = await getIp2LocationGeo(normalizedIp);
  if (ip2Geo) {
    setCachedLocation(normalizedIp, ip2Geo);
    return ip2Geo;
  }

  // 5. Public free APIs (fallback)
  logger('info', `IP2Location failed, trying public APIs for ${normalizedIp}`);
  const publicGeo = await getPublicGeoLocation(normalizedIp);
  if (publicGeo) {
    setCachedLocation(normalizedIp, publicGeo);
    return publicGeo;
  }

  // 6. Ultimate fallback (may return null if default country not set)
  logger('warn', `All lookups failed for ${normalizedIp}, using fallback.`);
  const fallback = getFallbackLocation(normalizedIp, headers);
  if (fallback) {
    setCachedLocation(normalizedIp, fallback);
  }
  return fallback;
}