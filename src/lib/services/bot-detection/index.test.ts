import test from 'node:test'
import assert from 'node:assert/strict'

import { BotDetectionService } from './index'
import { parseVisitorProfile } from '@/lib/utils/visitor-profile'

const service = new BotDetectionService()

test('detects known crawler user agents as bots', async () => {
  const result = await service.detect(
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    '1.2.3.4'
  )

  assert.equal(result.isBot, true)
  assert.ok(result.score >= 50)
  assert.ok(result.reasons.some((reason) => reason.toLowerCase().includes('bot')))
})

test('detects headless automation as bot traffic', async () => {
  const result = await service.detect(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/126.0.0.0 Safari/537.36',
    '5.6.7.8'
  )

  assert.equal(result.isBot, true)
  assert.ok(result.score >= 50)
})

test('preserves real browser parsing for normal browsers', async () => {
  const profile = parseVisitorProfile(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  )

  assert.equal(profile.browser, 'Chrome')
  assert.equal(profile.os, 'Windows')
  assert.equal(profile.deviceType, 'Desktop')
})

test('marks crawler user agents as bot browser instead of unknown', () => {
  const profile = parseVisitorProfile(
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'
  )

  assert.equal(profile.browser, 'Bot')
})
