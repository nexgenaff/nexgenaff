import test from 'node:test'
import assert from 'node:assert/strict'

import { getCountryFlag, getCountryLabel } from './country'

test('returns a flag emoji for known country codes', () => {
  assert.equal(getCountryFlag('US'), '🇺🇸')
  assert.equal(getCountryFlag('PH'), '🇵🇭')
})

test('returns a human label for known country codes', () => {
  assert.equal(getCountryLabel('US'), 'United States')
  assert.equal(getCountryLabel('PH'), 'Philippines')
})

test('supports human-readable country names as well as country codes', () => {
  assert.equal(getCountryFlag('United States'), '🇺🇸')
  assert.equal(getCountryFlag('Philippines'), '🇵🇭')
  assert.equal(getCountryLabel('United States'), 'United States')
  assert.equal(getCountryLabel('Philippines'), 'Philippines')
})

test('supports common country aliases and long-form names', () => {
  assert.equal(getCountryFlag('United States of America'), '🇺🇸')
  assert.equal(getCountryFlag('Republic of Korea'), '🇰🇷')
  assert.equal(getCountryFlag('Russian Federation'), '🇷🇺')
  assert.equal(getCountryLabel('United States of America'), 'United States')
  assert.equal(getCountryLabel('Republic of Korea'), 'South Korea')
})

test('recognizes Bangladesh country codes and labels', () => {
  assert.equal(getCountryFlag('BD'), '🇧🇩')
  assert.equal(getCountryLabel('BD'), 'Bangladesh')
  assert.equal(getCountryFlag('Bangladesh'), '🇧🇩')
  assert.equal(getCountryLabel('Bangladesh'), 'Bangladesh')
})

test('falls back safely for unknown country values', () => {
  assert.equal(getCountryFlag('UNKNOWN'), '🌍')
  assert.equal(getCountryLabel('UNKNOWN'), '')
})
