import test from 'node:test'
import assert from 'node:assert/strict'
import { selectOffer } from './offer-selection'

test('falls back to an active offer when the country does not match', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true) {
          return [{
            id: 'owner-offer-1',
            offerUrl: 'https://owner.example/offer',
            priority: 100,
            rotationMode: 'PRIORITY',
            country: 'US',
            isGlobal: false,
            isContentLocker: false,
            isActive: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            groupName: 'smoke',
            usaSecretRedirectEnabled: false,
          }]
        }

        return []
      },
    },
  }

  const offer = await selectOffer(tx as any, ['owner-1'], 'CA', 'smoke')

  assert.ok(offer)
  assert.equal(offer.offerUrl, 'https://owner.example/offer')
})

test('uses an active grouped offer even when there is no country-specific match', async () => {
  const tx = {
    offerVault: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'US') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true && where.country === 'CA') {
          return []
        }

        if (where.userId === 'owner-1' && where.groupName === 'smoke' && where.isActive === true) {
          return [{
            id: 'owner-offer-2',
            offerUrl: 'https://owner.example/offer-2',
            priority: 90,
            rotationMode: 'PRIORITY',
            country: 'CA',
            isGlobal: false,
            isContentLocker: false,
            isActive: true,
            createdAt: new Date('2024-01-02T00:00:00.000Z'),
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
  assert.equal(offer.offerUrl, 'https://owner.example/offer-2')
})
