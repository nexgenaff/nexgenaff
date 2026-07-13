import test from 'node:test'
import assert from 'node:assert/strict'
import { getGeoLocation } from './ip2location'

test('uses a stable local dev geolocation fallback instead of returning an unknown country', async () => {
  delete process.env.IP2LOCATION_API_KEY

  const geo = await getGeoLocation('127.0.0.1', new Headers())

  assert.equal(geo?.country_code, 'US')
  assert.equal(geo?.country_name, 'United States')
  assert.equal(geo?.city, 'San Francisco')
})
