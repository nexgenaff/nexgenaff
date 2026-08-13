import test from 'node:test'
import assert from 'node:assert/strict'
import { getLandingPageSubdomainFromHost } from './landing-page-host'

test('detects localhost subdomains and strips the .localhost suffix', () => {
  assert.equal(getLandingPageSubdomainFromHost('demo-offer.localhost:3000'), 'demo-offer')
})

test('ignores the main app host so it does not redirect to a landing page', () => {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  assert.equal(getLandingPageSubdomainFromHost('localhost:3000'), null)
})

test('detects custom production subdomains for the app domain', () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://afficixo.com'
  assert.equal(getLandingPageSubdomainFromHost('summer-sale.afficixo.com'), 'summer-sale')
})
