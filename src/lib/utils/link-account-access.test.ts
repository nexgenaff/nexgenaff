import test from 'node:test'
import assert from 'node:assert/strict'
import { getLinkAccountVisibilityWhereClause } from './link-account-access'

test('keeps managers scoped to their own link accounts', () => {
  const whereClause = getLinkAccountVisibilityWhereClause(
    { id: 'manager-1', role: 'MANAGER', username: 'manager' },
    'owner-999'
  )

  assert.deepEqual(whereClause, { userId: 'manager-1' })
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
