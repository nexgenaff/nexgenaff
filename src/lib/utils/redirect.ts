export function buildRedirectTargetUrl(baseUrl: string, slug: string): string {
  const normalizedBase = baseUrl.trim()
  const normalizedSlug = slug.trim()

  if (!normalizedBase || !normalizedSlug) {
    return normalizedBase
  }

  const hasQuery = normalizedBase.includes('?')
  const hasTrailingSlash = normalizedBase.endsWith('/')

  if (hasQuery) {
    return `${normalizedBase}${normalizedSlug}`
  }

  if (hasTrailingSlash) {
    return `${normalizedBase}${normalizedSlug}`
  }

  return `${normalizedBase}/${normalizedSlug}`
}
