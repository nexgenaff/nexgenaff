import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOfferGroupList } from './offer-groups'

test('buildOfferGroupList returns unique sorted names from array payload', () => {
  assert.deepEqual(
    buildOfferGroupList([
      { groupName: 'Beta' },
      { groupName: 'Alpha' },
      { groupName: 'Alpha' },
      { groupName: null },
      { groupName: '  Gamma  ' },
    ]),
    ['Alpha', 'Beta', 'Gamma']
  )
})

test('buildOfferGroupList returns an empty list for non-array payloads', () => {
  assert.deepEqual(buildOfferGroupList({ error: 'Failed to fetch offers' }), [])
  assert.deepEqual(buildOfferGroupList(null), [])
})
