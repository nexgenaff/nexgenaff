import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkAccountUserId, getLinkAccountVisibilityWhereClause } from './link-account-access'

test('keeps managers restricted to their own link accounts', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: 'manager-1' })
})

test('owners see their own and manager-owned links, excluding admin-owned links', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'owner-1', role: 'OWNER', username: 'owner' },
    'owner-999'
  )

  assert.deepEqual(whereClause, {
    OR: [
      { userId: 'owner-1' },
      { userId: 'owner-999' },
      { user: { role: 'MANAGER' } },
    ],
  })
})

test('owners see links created under their authenticated id when config uses another owner username', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'owner-1', role: 'OWNER', username: 'owner' },
    'configured-owner'
  )

  assert.deepEqual(whereClause, {
    OR: [
      { userId: 'owner-1' },
      { userId: 'configured-owner' },
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

test('uses the manager id for manager visibility checks', () => {
  const userId = getLinkAccountUserId(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.equal(userId, 'manager-1')
})

test('manager dashboards stay isolated from each other and the owner set', () => {
  const managerAWhere = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager-a' },
    'owner-999'
  )

  const managerBWhere = getLinkAccountVisibilityWhereClause(
    { id: 'manager-2', role: 'MANAGER', username: 'manager-b' },
    'owner-999'
  )

  assert.deepEqual(managerAWhere, { userId: 'manager-1' })
  assert.deepEqual(managerBWhere, { userId: 'manager-2' })
  assert.notDeepEqual(managerAWhere, managerBWhere)
})
