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
  assert.deepEqual(ids, ['manager-1', 'owner-999'])
  assert.equal(new Set(ids).size, ids.length)
})

test('owner selection stays pinned to the owner user id', () => {
  const ids = buildOfferSelectionUserIds('owner-999', 'OWNER', 'owner-999')
  assert.deepEqual(ids, ['owner-999'])
})

test('local ids fall back to the owner when that account is available', () => {
  const ids = buildOfferSelectionUserIds('local-manager', undefined, 'owner-999')
  assert.deepEqual(ids, ['local-manager', 'owner-999'])
})

test('selection falls back to the manager id when no owner record exists', async () => {
  const ids = await getOfferSelectionUserIds('manager-1')
  assert.deepEqual(ids, ['manager-1'])
})
