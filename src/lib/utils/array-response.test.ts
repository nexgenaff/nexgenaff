import test from 'node:test'
import assert from 'node:assert/strict'
import { coerceArray } from './array-response'

test('coerceArray returns array values unchanged', () => {
  assert.deepEqual(coerceArray([1, 2, 3]), [1, 2, 3])
})

test('coerceArray returns an empty array for non-array values', () => {
  assert.deepEqual(coerceArray({ error: 'Failed to fetch links' }), [])
  assert.deepEqual(coerceArray(null), [])
})
