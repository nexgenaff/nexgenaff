import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildVercelDomainUrl,
  getVercelProjectReference,
  buildVercelHeaders,
  buildVerificationInstructionsFromVercelRecords,
} from './domain'

test('prefers Vercel project id when configured', () => {
  const reference = getVercelProjectReference({
    VERCEL_PROJECT_ID: 'proj_123',
    VERCEL_PROJECT_NAME: 'nextgen-affiliates-pro',
  })

  assert.equal(reference, 'proj_123')
})

test('builds the add-domain API URL with optional team query', () => {
  const url = buildVercelDomainUrl('proj_123', 'fast.prizenest.xyz', 'team_456')

  assert.equal(url, 'https://api.vercel.com/v10/projects/proj_123/domains?teamId=team_456')
})

test('builds bearer auth headers for Vercel API calls', () => {
  const headers = buildVercelHeaders('token-123')

  assert.equal(headers.Authorization, 'Bearer token-123')
  assert.equal(headers['Content-Type'], 'application/json')
})

test('maps authoritative Vercel verification records into DNS instructions', () => {
  const instructions = buildVerificationInstructionsFromVercelRecords(
    [
      { type: 'A', domain: 'example.com', value: '76.76.21.21' },
      { type: 'A', domain: 'example.com', value: '76.76.21.22' },
      { type: 'CNAME', domain: 'www.example.com', value: 'cname.vercel-dns.com' },
      { type: 'TXT', domain: 'example.com', value: 'nextgen-verify-token' },
    ],
    'example.com'
  )

  if (!instructions) {
    throw new Error('Expected Vercel instructions to be generated')
  }

  assert.deepEqual(instructions.a, [
    { host: '@', value: '76.76.21.21' },
    { host: '@', value: '76.76.21.22' },
  ])
  assert.deepEqual(instructions.cname, [
    { host: 'www', value: 'cname.vercel-dns.com' },
  ])
  assert.deepEqual(instructions.txt, [
    { host: '@', value: 'nextgen-verify-token' },
  ])
})
