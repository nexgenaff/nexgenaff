import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRedirectTargetUrl } from './redirect'

test('preserves an existing query-string placeholder while appending the slug', () => {
  assert.equal(
    buildRedirectTargetUrl('https://affiliate.com/?s1=', 'promo-123'),
    'https://affiliate.com/?s1=promo-123'
  )
})

test('appends the slug cleanly for path-style offer URLs', () => {
  assert.equal(
    buildRedirectTargetUrl('https://affiliate.com/', 'promo-123'),
    'https://affiliate.com/promo-123'
  )
})
