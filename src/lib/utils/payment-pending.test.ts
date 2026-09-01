import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePendingAmount } from './payment-pending'

test('ignores live earnings when there is no unpaid invoice', () => {
  assert.equal(calculatePendingAmount([], 20), 0)
})

test('adds commission only to unpaid invoice totals', () => {
  const invoices = [
    { totalEarning: 100, isPaid: false },
    { totalEarning: 50, isPaid: true },
  ]

  assert.equal(calculatePendingAmount(invoices, 20), 120)
})
