import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAccountGeoReport } from './report-data'

test('buildAccountGeoReport aggregates unique clicks by account and country', () => {
  const result = buildAccountGeoReport(
    [
      { linkAccountId: 'acct-1', country: 'US', isUnique: true },
      { linkAccountId: 'acct-1', country: 'US', isUnique: true },
      { linkAccountId: 'acct-1', country: 'CA', isUnique: true },
      { linkAccountId: 'acct-2', country: 'GB', isUnique: true },
      { linkAccountId: 'acct-2', country: 'US', isUnique: false },
      { linkAccountId: 'acct-2', country: 'GB', isUnique: true },
      { linkAccountId: 'acct-2', country: 'DE', isUnique: true },
    ],
    [
      { id: 'acct-1', accountName: 'Northwind' },
      { id: 'acct-2', accountName: 'Acme' },
    ]
  )

  assert.deepEqual(result.labels, ['GB', 'US', 'CA', 'DE'])
  assert.deepEqual(result.datasets.map((dataset) => dataset.label), ['Northwind', 'Acme'])
  assert.deepEqual(result.datasets[0].data, [0, 2, 1, 0])
  assert.deepEqual(result.datasets[1].data, [2, 0, 0, 1])
  assert.deepEqual(result.accountBreakdown[0].countries.map((item) => item.country), ['US', 'CA'])
  assert.equal(result.accountBreakdown[0].totalUniqueClicks, 3)
})
