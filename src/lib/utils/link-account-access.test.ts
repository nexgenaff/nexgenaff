import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkAccountVisibilityWhereClause } from './link-account-access'

test('returns owner-wide visibility for managers so they can see shared link accounts', () => {
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
