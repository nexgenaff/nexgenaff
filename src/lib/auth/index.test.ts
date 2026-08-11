import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOfferSelectionUserIds, getEffectiveOwnerBackedUserId, getOfferSelectionUserIds } from './index'

test('managers resolve to the owner-backed user id for offers and domains', () => {
  const resolved = getEffectiveOwnerBackedUserId(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.equal(resolved, 'owner-999')
})

test('owners keep using the owner-backed user id', () => {
  const resolved = getEffectiveOwnerBackedUserId(
    { id: 'owner-1', role: 'OWNER', username: 'owner' },
    'owner-999'
  )

  assert.equal(resolved, 'owner-999')
})

test('admins and regular users stay on their own user id', () => {
  assert.equal(
    getEffectiveOwnerBackedUserId({ id: 'admin-1', role: 'ADMIN', username: 'admin' }, 'owner-999'),
    'admin-1'
  )
  assert.equal(
    getEffectiveOwnerBackedUserId({ id: 'user-1', role: 'ADMIN', username: 'user' }, 'owner-999'),
    'user-1'
  )
})

test('manager selection ids include the owner-backed user when it exists', () => {
  const ids = buildOfferSelectionUserIds('manager-1', 'MANAGER', 'owner-999')
  assert.deepEqual(ids, ['owner-999', 'manager-1'])
  assert.equal(new Set(ids).size, ids.length)
})

test('owner selection stays pinned to the owner user id', () => {
  const ids = buildOfferSelectionUserIds('owner-999', 'OWNER', 'owner-999')
  assert.deepEqual(ids, ['owner-999'])
})

test('local ids fall back to the owner when that account is available', () => {
  const ids = buildOfferSelectionUserIds('local-manager', undefined, 'owner-999')
  assert.deepEqual(ids, ['owner-999', 'local-manager'])
})

test('selection falls back to the manager id when no owner record exists', async () => {
  const ids = await getOfferSelectionUserIds('manager-1')
  assert.deepEqual(ids, ['manager-1'])
})

test('manager redirect prefers the owner offer when the manager has no offers', async () => {
  const managerUserId = 'manager-1'
  const ownerUserId = 'owner-999'

  type TxShape = {
    offerVault: {
      findMany: (args: { where: { userId: string; country?: string; isActive?: boolean; isGlobal?: boolean } }) => Promise<Array<{
        id: string
        offerUrl: string
        priority: number
        rotationMode: string
        country: string
        isGlobal: boolean
        isContentLocker: boolean
        isActive: boolean
        createdAt: Date
        groupName: string | null
        usaSecretRedirectEnabled: boolean
      }>>
    }
  }

  const tx: TxShape = {
    offerVault: {
      findMany: async ({ where }) => {
        if (where.userId === managerUserId) return []
        if (where.userId === ownerUserId && where.country === 'US' && where.isActive === true) {
          return [{
            id: 'owner-offer-1',
            offerUrl: 'https://owner.example/offer',
            priority: 100,
            rotationMode: 'RANDOM',
            country: 'US',
            isGlobal: false,
            isContentLocker: false,
            isActive: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            groupName: null,
            usaSecretRedirectEnabled: false,
          }]
        }
        return []
      },
    },
  }

  const selectOfferForUser = async (
    tx: TxShape,
    userId: string,
    country: string,
    _linkGroupName: string | null
  ) => {
    const candidates = await tx.offerVault.findMany({
      where: {
        userId,
        country,
        isActive: true,
        isGlobal: false,
      },
    })

    return candidates[0] ?? null
  }

  const selectOffer = async (tx: TxShape, userIds: string[], country: string, linkGroupName: string | null) => {
    for (const userId of userIds) {
      const offer = await selectOfferForUser(tx, userId, country, linkGroupName)
      if (offer) return offer
    }
    return null
  }

  const fallbackOfferUserIds = ['manager-1', 'owner-999']
  const offer = await selectOffer(tx, fallbackOfferUserIds, 'US', null)

  assert.ok(offer)
  assert.equal(offer.offerUrl, 'https://owner.example/offer')
})
