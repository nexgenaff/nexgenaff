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

test('detects SEO analysis bots with high confidence', async () => {
  const result = await service.detect(
    'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
    '10.0.0.1'
  )

  assert.equal(result.isBot, true)
  assert.ok(result.score >= 60)
  assert.equal(result.confidence, 'medium')
})

test('detects social media preview bots', async () => {
  const result = await service.detect(
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    '10.0.0.2'
  )

  assert.equal(result.isBot, true)
  assert.ok(result.reasons.some((r) => r.includes('Social media')))
})

test('detects malicious security scanners immediately', async () => {
  const result = await service.detect(
    'sqlmap/1.6.5 (http://sqlmap.org)',
    '10.0.0.3'
  )

  assert.equal(result.isBot, true)
  assert.equal(result.score, 100)
  assert.equal(result.confidence, 'high')
  assert.ok(result.reasons.some((r) => r.includes('Malicious')))
})

test('detects HTTP clients and scripts', async () => {
  const result = await service.detect(
    'python-requests/2.31.0',
    '10.0.0.4'
  )

  assert.equal(result.isBot, true)
  assert.ok(result.score >= 45)
  assert.ok(result.reasons.some((r) => r.includes('HTTP client')))
})

test('analyzes suspicious header combinations', async () => {
  const result = await service.detect(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    '10.0.0.5',
    {
      'user-agent': 'Mozilla/5.0',
      'accept': null,
      'accept-language': null,
      'accept-encoding': null,
      'cache-control': 'no-cache',
      'referer': '',
    }
  )

  assert.ok(result.score > 0)
  assert.ok(result.reasons.length > 0)
})

test('marks normal browsers as not bots', async () => {
  const result = await service.detect(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    '10.0.0.6'
  )

  assert.equal(result.isBot, false)
  assert.ok(result.score < 50)
})

test('includes confidence level in detection result', async () => {
  const result1 = await service.detect('googlebot/2.1', '10.0.0.7')
  const result2 = await service.detect('some-app/1.0', '10.0.0.8')

  assert.ok(['low', 'medium', 'high'].includes(result1.confidence))
  assert.ok(['low', 'medium', 'high'].includes(result2.confidence))
})
