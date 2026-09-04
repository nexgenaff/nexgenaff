export function buildOfferGroupList(data: unknown): string[] {
  if (!Array.isArray(data)) {
    return []
  }

  return Array.from(
    new Set(
      data
        .map((offer) => (typeof offer === 'object' && offer !== null && 'groupName' in offer ? offer.groupName : null))
        .filter((value): value is string | null => value === null || typeof value === 'string')
        .map((value) => (typeof value === 'string' ? value.trim() : value))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b))
}
