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
        OR: [
          { isGlobal: true },
          { isContentLocker: true },
        ],
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
  // OPTIMIZATION: Batch all queries instead of looping through userIds
  // This reduces from 4+ queries per user to 3 total queries
  
  if (userIds.length === 0) return null

  // Query 1: Group-specific offers (if linkGroupName provided)
  let groupOffers: Offer[] = []
  if (linkGroupName) {
    groupOffers = await tx.offerVault.findMany({
      where: {
        userId: { in: userIds },
        groupName: linkGroupName,
        isActive: true,
        OR: [
          { country, isGlobal: false },
          { isGlobal: true },
          { isContentLocker: true },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    const offer = selectRotatingOffer(groupOffers)
    if (offer) return offer
  }

  // Query 2: Country-specific offers with or without groups
  const countryOffers = await tx.offerVault.findMany({
    where: {
      userId: { in: userIds },
      country,
      isActive: true,
      isGlobal: false,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  // Split by group presence
  const namedGroupOffers = countryOffers.filter((offer) => normalizeGroupName(offer.groupName))
  const directOffers = countryOffers.filter((offer) => !normalizeGroupName(offer.groupName))

  let offer = selectRotatingOffer(namedGroupOffers.length ? namedGroupOffers : directOffers)
  if (offer) return offer

  // Query 3: Global fallback offers
  const globalOffers = await tx.offerVault.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
      OR: [
        { isGlobal: true },
        { isContentLocker: true },
      ],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  return selectRotatingOffer(globalOffers)
}
