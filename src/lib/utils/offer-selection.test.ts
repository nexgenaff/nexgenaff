import test from 'node:test'
import assert from 'node:assert/strict'
import { selectOffer } from './offer-selection'

test('falls back to a group GLOBAL offer when the country does not match', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'DE') {
          return []
        }

        if (
          where.userId === 'owner-1' &&
          where.groupName === 'smoke' &&
          where.isActive === true &&
          Array.isArray(where.OR) &&
          where.OR.some((condition: any) => condition.isGlobal === true || condition.isContentLocker === true)
        ) {
          return [{
            id: 'owner-offer-global',
            offerUrl: 'https://owner.example/global-offer',
            priority: 100,
            rotationMode: 'PRIORITY',
            country: 'GLOBAL',
            isGlobal: true,
            isContentLocker: false,
            isActive: true,
            createdAt: new Date('2024-01-04T00:00:00.000Z'),
            groupName: 'smoke',
            usaSecretRedirectEnabled: false,
          }]
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'DE', 'smoke')

  assert.ok(offer)
  assert.equal(offer.offerUrl, 'https://owner.example/global-offer')
})

test('does not fall back to an unrelated country-specific group offer without a global fallback', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return [
            {
              id: 'owner-offer-2',
              offerUrl: 'https://owner.example/offer-2',
              priority: 90,
              rotationMode: 'PRIORITY',
              country: 'US',
              isGlobal: false,
              isContentLocker: false,
              isActive: true,
              createdAt: new Date('2024-01-02T00:00:00.000Z'),
              groupName: 'smoke',
              usaSecretRedirectEnabled: false,
            },
          ]
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'DE') {
          return []
        }

        if (
          where.userId === 'owner-1' &&
          where.groupName === 'smoke' &&
          where.isActive === true &&
          Array.isArray(where.OR) &&
          where.OR.some((condition: any) => condition.isGlobal === true || condition.isContentLocker === true)
        ) {
          return []
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'DE', 'smoke')

  assert.equal(offer, null)
})

test('falls back to global offer when the country does not match and a global offer exists', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'DE') {
          return []
        }

        if (
          where.userId === 'owner-1' &&
          where.groupName === 'smoke' &&
          where.isActive === true &&
          Array.isArray(where.OR) &&
          where.OR.some((condition: any) => condition.isGlobal === true || condition.isContentLocker === true)
        ) {
          return [{
            id: 'owner-offer-global',
            offerUrl: 'https://owner.example/global-offer',
            priority: 100,
            rotationMode: 'PRIORITY',
            country: 'GLOBAL',
            isGlobal: true,
            isContentLocker: false,
            isActive: true,
            createdAt: new Date('2024-01-04T00:00:00.000Z'),
            groupName: 'smoke',
            usaSecretRedirectEnabled: false,
          }]
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'DE', 'smoke')

  assert.ok(offer)
  assert.equal(offer.offerUrl, 'https://owner.example/global-offer')
})

test('falls back to a content-locker global offer when the country does not match', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'DE') {
          return []
        }

        if (
          where.userId === 'owner-1' &&
          where.groupName === 'smoke' &&
          where.isActive === true &&
          Array.isArray(where.OR) &&
          where.OR.some((condition: any) => condition.isGlobal === true || condition.isContentLocker === true)
        ) {
          return [{
            id: 'owner-offer-content-locker',
            offerUrl: 'https://owner.example/content-locker',
            priority: 100,
            rotationMode: 'PRIORITY',
            country: 'GLOBAL',
            isGlobal: false,
            isContentLocker: true,
            isActive: true,
            createdAt: new Date('2024-01-05T00:00:00.000Z'),
            groupName: 'smoke',
            usaSecretRedirectEnabled: false,
          }]
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'DE', 'smoke')

  assert.ok(offer)
  assert.equal(offer.offerUrl, 'https://owner.example/content-locker')
})

test('returns null when no geo-specific or global offers exist', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'DE') {
          return []
        }

        if (
          where.userId === 'owner-1' &&
          where.groupName === 'smoke' &&
          where.isActive === true &&
          Array.isArray(where.OR) &&
          where.OR.some((condition: any) => condition.isGlobal === true || condition.isContentLocker === true)
        ) {
          return []
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'DE', 'smoke')

  assert.equal(offer, null)
})
