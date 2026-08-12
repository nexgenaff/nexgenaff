type Offer = {
  id: string
  priority: number
  rotationMode: string
  offerUrl: string
  country: string
  isGlobal: boolean
  isContentLocker: boolean
  isActive: boolean
  createdAt: Date
  groupName: string | null
  usaSecretRedirectEnabled: boolean
}

const normalizeGroupName = (value?: string | null) => value?.trim() ?? ''

const selectRotatingOffer = (offers: Offer[]): Offer | null => {
  if (!offers.length) return null
  if (offers.length === 1) return offers[0]

  const randomPool = offers.filter((offer) => offer.rotationMode === 'RANDOM')
  if (randomPool.length > 0) {
    return randomPool[Math.floor(Math.random() * randomPool.length)]
  }

  return [...offers].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.createdAt.getTime() - b.createdAt.getTime()
  })[0]
}

const selectGroupOfferForUser = async (
  tx: { offerVault: { findMany: (args: { where: Record<string, unknown>; orderBy?: Array<{ priority: 'desc' } | { createdAt: 'asc' }> }) => Promise<Offer[]> } },
  userId: string,
  country: string,
  groupName: string
): Promise<Offer | null> => {
  const regionalGroupCandidates = await tx.offerVault.findMany({
    where: {
      userId,
      country,
      groupName,
      isActive: true,
      isGlobal: false,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  let offer = selectRotatingOffer(regionalGroupCandidates)

  if (!offer) {
    const globalGroupCandidates = await tx.offerVault.findMany({
      where: {
        userId,
        groupName,
        isActive: true,
        isGlobal: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })
    offer = selectRotatingOffer(globalGroupCandidates)
  }

  return offer
}

export const selectOffer = async (
  tx: { offerVault: { findMany: (args: { where: Record<string, unknown>; orderBy?: Array<{ priority: 'desc' } | { createdAt: 'asc' }> }) => Promise<Offer[]> } },
  userIds: string[],
  country: string,
  linkGroupName: string | null
): Promise<Offer | null> => {
  for (const userId of userIds) {
    let offer: Offer | null = null

    if (linkGroupName) {
      offer = await selectGroupOfferForUser(tx, userId, country, linkGroupName)
      if (offer) return offer
    }

    const countryCandidates = await tx.offerVault.findMany({
      where: {
        userId,
        country,
        isActive: true,
        isGlobal: false,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    let namedGroupCandidates = countryCandidates.filter((candidate) => normalizeGroupName(candidate.groupName))
    let directCountryCandidates = countryCandidates.filter((candidate) => !normalizeGroupName(candidate.groupName))

    offer = selectRotatingOffer(namedGroupCandidates.length ? namedGroupCandidates : directCountryCandidates)
    if (offer) return offer

    // Prefer GLOBAL offers as a fallback before considering other country-specific offers.
    const globalFallbackCandidates = await tx.offerVault.findMany({
      where: {
        userId,
        isActive: true,
        isGlobal: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    offer = selectRotatingOffer(globalFallbackCandidates)
    if (offer) return offer

    // No offer for this geo and no GLOBAL fallback available.
    // Do not fall back to unrelated country offers.
    return null
  }

  return null
}
