import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkAccountUserId, getLinkAccountVisibilityWhereClause } from './link-account-access'

test('shows managers both their own link accounts and the shared owner set', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: { in: ['manager-1', 'owner-999'] } })
})

test('owners see their own and manager-owned links, excluding admin-owned links', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'owner-1', role: 'OWNER', username: 'owner' },
    'owner-999'
  )

  assert.deepEqual(whereClause, {
    OR: [
      { userId: 'owner-999' },
      { user: { role: 'MANAGER' } },
    ],
  })
})

test('keeps admins scoped to their own links', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'admin-1', role: 'ADMIN', username: 'admin' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: 'admin-1' })
})

test('uses the shared owner id for manager visibility checks when present', () => {
  const userId = getLinkAccountUserId(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.equal(userId, 'owner-999')
})

test('manager dashboards stay isolated from each other while including the shared owner set', () => {
  const managerAWhere = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager-a' },
    'owner-999'
  )

  const managerBWhere = getLinkAccountVisibilityWhereClause(
    { id: 'manager-2', role: 'MANAGER', username: 'manager-b' },
    'owner-999'
  )

  assert.deepEqual(managerAWhere, { userId: { in: ['manager-1', 'owner-999'] } })
  assert.deepEqual(managerBWhere, { userId: { in: ['manager-2', 'owner-999'] } })
  assert.notDeepEqual(managerAWhere, managerBWhere)
})
