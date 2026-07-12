export interface VercelDomainOptions {
  VERCEL_PROJECT_ID?: string
  VERCEL_PROJECT_NAME?: string
  VERCEL_TEAM_ID?: string
  VERCEL_TOKEN?: string
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

export function buildVercelDomainUrl(projectReference: string, domain: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com/v10/projects/${projectReference}/domains`)
  if (teamId) url.searchParams.set('teamId', teamId)
  return url.toString()
}

export function buildVercelVerifyDomainUrl(projectReference: string, domain: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com/v10/projects/${projectReference}/domains/${encodeURIComponent(domain)}/verify`)
  if (teamId) url.searchParams.set('teamId', teamId)
  return url.toString()
}

export function buildVercelHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function addDomainToProject(
  domain: string,
  options: VercelDomainOptions = {}
): Promise<VercelDomainApiResult> {
  const projectReference = getVercelProjectReference(options)
  const token = options.VERCEL_TOKEN

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
      headers: buildVercelHeaders(token),
      body: JSON.stringify({ name: domain }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        ok: false,
        verified: false,
        domain,
        projectReference,
        error: payload?.error?.message || payload?.message || 'Failed to add domain to the Vercel project.',
      }
    }

    return {
      ok: true,
      verified: Boolean(payload?.verified ?? false),
      domain: payload?.name || domain,
      projectReference,
      verification: Array.isArray(payload?.verification) ? payload.verification : [],
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
  const token = options.VERCEL_TOKEN

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
      headers: buildVercelHeaders(token),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        ok: false,
        verified: false,
        domain,
        projectReference,
        error: payload?.error?.message || payload?.message || 'Failed to verify domain on Vercel.',
      }
    }

    return {
      ok: true,
      verified: Boolean(payload?.verified ?? false),
      domain: payload?.name || domain,
      projectReference,
      verification: Array.isArray(payload?.verification) ? payload.verification : [],
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
