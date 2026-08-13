export function getLandingPageSubdomainFromHost(hostHeader?: string | null): string | null {
  if (!hostHeader) return null

  const host = hostHeader.split(':')[0].toLowerCase().trim()
  if (!host) return null

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .split(':')[0]
    .toLowerCase()

  const rootDomain = appUrl.replace(/^www\./i, '')
  const knownHosts = new Set([
    'localhost',
    '127.0.0.1',
    rootDomain,
    `www.${rootDomain}`,
    `admin.${rootDomain}`,
    `app.${rootDomain}`,
    `api.${rootDomain}`,
  ])

  if (knownHosts.has(host)) return null

  if (host.endsWith('.localhost')) {
    const subdomain = host.replace(/\.localhost$/i, '')
    return subdomain && !['www', 'admin', 'app', 'api'].includes(subdomain) ? subdomain : null
  }

  if (host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.slice(0, -(rootDomain.length + 1))
    return subdomain && !['www', 'admin', 'app', 'api'].includes(subdomain) ? subdomain : null
  }

  return null
}
