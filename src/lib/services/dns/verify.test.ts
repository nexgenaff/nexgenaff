import test from 'node:test'
import assert from 'node:assert/strict'

import { getVerificationInstructions, normalizeDomain } from './verify'

test('normalizes custom domains before generating DNS instructions', () => {
  assert.equal(normalizeDomain('https://Example.com/'), 'example.com')
})

test('generates Vercel-style DNS records for apex custom domains', () => {
  const instructions = getVerificationInstructions('Example.com', 'user-123')

  assert.ok(instructions.a.some((record) => record.host === '@' && record.value === '76.76.21.21'))
  assert.ok(instructions.a.some((record) => record.host === '@' && record.value === '76.76.21.22'))
  assert.ok(instructions.cname.some((record) => record.host === 'www' && record.value === 'cname.vercel-dns.com'))
  assert.ok(instructions.txt.some((record) => record.host === '@' && record.value.startsWith('nextgen-verify-')))
})

test('keeps TXT verification on the zone root for subdomains to avoid invalid CNAME+TXT collisions', () => {
  const instructions = getVerificationInstructions('fast.prizenest.xyz', 'user-123')

  assert.ok(instructions.cname.some((record) => record.host === 'fast' && record.value === 'cname.vercel-dns.com'))
  assert.ok(instructions.txt.some((record) => record.host === '@' && record.value.startsWith('nextgen-verify-')))
})
