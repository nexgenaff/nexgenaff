import type { DNSVerificationInstructions } from '@/lib/services/dns/verify'
import { normalizeDomain } from '@/lib/services/dns/verify'

export interface VercelDomainOptions {
  VERCEL_PROJECT_ID?: string
  VERCEL_PROJECT_NAME?: string
  VERCEL_TEAM_ID?: string
  VERCEL_TOKEN?: string
  VERCEL_API_TOKEN?: string
}

export interface VercelDomainApiResult {
  ok: boolean
  verified: boolean
  domain: string
  projectReference: string
  verification?: Array<{ type: string; domain: string; value: string; reason: string }>
  error?: string
}

export function getVercelProjectReference(options: VercelDomainOptions): string {
  return options.VERCEL_PROJECT_ID || options.VERCEL_PROJECT_NAME || ''
}

export function getVercelApiToken(options: VercelDomainOptions): string {
  return options.VERCEL_TOKEN || options.VERCEL_API_TOKEN || ''
}

export function buildVercelDomainUrl(projectReference: string, domain: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com/v9/projects/${projectReference}/domains`)
  if (teamId) url.searchParams.set('teamId', teamId)
  return url.toString()
}

export function buildVercelVerifyDomainUrl(projectReference: string, domain: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com/v9/projects/${projectReference}/domains/${encodeURIComponent(domain)}/verify`)
  if (teamId) url.searchParams.set('teamId', teamId)
  return url.toString()
}

export function buildVercelHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getParentDomain(domain: string): string {
  const labels = domain.split('.')
  if (labels.length <= 2) {
    return domain
  }

  return labels.slice(1).join('.')
}

function buildInstructionHost(normalizedDomain: string, recordDomain: string, recordType: string): string {
  const normalizedRecordDomain = normalizeDomain(recordDomain)

  if (!normalizedRecordDomain) {
    return '@'
  }

  if (normalizedRecordDomain === normalizedDomain) {
    if (recordType === 'CNAME') {
      return normalizedDomain.split('.')[0] || '@'
    }

    return '@'
  }

  const parentDomain = getParentDomain(normalizedDomain)
  const suffix = `.${parentDomain}`

  if (normalizedRecordDomain.endsWith(suffix)) {
    return normalizedRecordDomain.slice(0, -suffix.length) || '@'
  }

  return normalizedRecordDomain
}

function uniqueRecords(records: Array<{ host: string; value: string }>): Array<{ host: string; value: string }> {
  const seen = new Set<string>()

  return records.filter((record) => {
    const key = `${record.host}::${record.value}`
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function buildVerificationInstructionsFromVercelRecords(
  verification: Array<{ type?: string; domain?: string; value?: string }> = [],
  domain: string
): DNSVerificationInstructions | null {
  const normalizedDomain = normalizeDomain(domain)
  if (!normalizedDomain || verification.length === 0) {
    return null
  }

  const a: Array<{ host: string; value: string }> = []
  const cname: Array<{ host: string; value: string }> = []
  const txt: Array<{ host: string; value: string }> = []

  for (const record of verification) {
    const type = String(record.type || '').toUpperCase()
    const value = String(record.value || '').trim()
    const recordDomain = typeof record.domain === 'string' ? record.domain : ''

    if (!value || !recordDomain) {
      continue
    }

    const host = buildInstructionHost(normalizedDomain, recordDomain, type)

    if (type === 'A') {
      a.push({ host, value })
    } else if (type === 'CNAME') {
      cname.push({ host, value })
    } else if (type === 'TXT') {
      txt.push({ host, value })
    }
  }

  return {
    a: uniqueRecords(a),
    cname: uniqueRecords(cname),
    txt: uniqueRecords(txt),
  }
}

export async function addDomainToProject(
  domain: string,
  options: VercelDomainOptions = {}
): Promise<VercelDomainApiResult> {
  const projectReference = getVercelProjectReference(options)
  const token = getVercelApiToken(options)

  if (!projectReference || !token) {
    return {
      ok: false,
      verified: false,
      domain,
      projectReference,
      error: 'Vercel project binding is not configured. Set VERCEL_TOKEN and VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME.',
    }
  }

  try {
    const response = await fetch(buildVercelDomainUrl(projectReference, domain, options.VERCEL_TEAM_ID), {
      method: 'POST',
      cache: 'no-store',
      headers: buildVercelHeaders(token),
      body: JSON.stringify({ name: domain }),
    })

    const payload = await response.json().catch(() => null)
    const verification = Array.isArray(payload?.verification) ? payload.verification : []

    if (!response.ok) {
      return {
        ok: false,
        verified: false,
        domain,
        projectReference,
        verification,
        error: payload?.error?.message || payload?.message || 'Failed to add domain to the Vercel project.',
      }
    }

    return {
      ok: true,
      verified: Boolean(payload?.verified ?? false),
      domain: payload?.name || domain,
      projectReference,
      verification,
    }
  } catch (error) {
    return {
      ok: false,
      verified: false,
      domain,
      projectReference,
      error: error instanceof Error ? error.message : 'Failed to add domain to the Vercel project.',
    }
  }
}

export async function verifyDomainOnVercel(
  domain: string,
  options: VercelDomainOptions = {}
): Promise<VercelDomainApiResult> {
  const projectReference = getVercelProjectReference(options)
  const token = getVercelApiToken(options)

  if (!projectReference || !token) {
    return {
      ok: false,
      verified: false,
      domain,
      projectReference,
      error: 'Vercel project binding is not configured. Set VERCEL_TOKEN and VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME.',
    }
  }

  try {
    const response = await fetch(buildVercelVerifyDomainUrl(projectReference, domain, options.VERCEL_TEAM_ID), {
      method: 'POST',
      cache: 'no-store',
      headers: buildVercelHeaders(token),
    })

    const payload = await response.json().catch(() => null)
    const verification = Array.isArray(payload?.verification) ? payload.verification : []

    if (!response.ok) {
      return {
        ok: false,
        verified: false,
        domain,
        projectReference,
        verification,
        error: payload?.error?.message || payload?.message || 'Failed to verify domain on Vercel.',
      }
    }

    return {
      ok: true,
      verified: Boolean(payload?.verified ?? false),
      domain: payload?.name || domain,
      projectReference,
      verification,
    }
  } catch (error) {
    return {
      ok: false,
      verified: false,
      domain,
      projectReference,
      error: error instanceof Error ? error.message : 'Failed to verify domain on Vercel.',
    }
  }
}
