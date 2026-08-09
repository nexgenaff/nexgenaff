import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkAccountUserId, getLinkAccountVisibilityWhereClause } from './link-account-access'

test('keeps managers on the shared owner-backed visibility scope', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: 'owner-999' })
})

test('keeps owners on the unrestricted view', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'owner-1', role: 'OWNER', username: 'owner' },
    'owner-999'
  )

  assert.deepEqual(whereClause, {})
})

test('keeps admins scoped to their own links', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'admin-1', role: 'ADMIN', username: 'admin' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: 'admin-1' })
})

test('uses the shared owner id for manager-owned link accounts', () => {
  const userId = getLinkAccountUserId(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.equal(userId, 'owner-999')
})
