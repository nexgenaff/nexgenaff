interface BotDetectionResult {
  isBot: boolean
  score: number
  reasons: string[]
}

export class BotDetectionService {
  private static readonly requestFrequency: Map<string, number[]> = new Map()

  private readonly botPatterns: RegExp[] = [
    /googlebot/i, /bingbot/i, /yandex/i, /baidu/i,
    /duckduckbot/i, /slurp/i, /facebookexternalhit/i,
    /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegram/i,
    /slack/i, /discord/i, /ia_archiver/i, /seznam/i,
    /sogou/i, /exabot/i, /majestic/i, /rogerbot/i, /dotbot/i,
    /ahrefsbot/i, /semrushbot/i, /petalbot/i, /mj12bot/i,
    /sitebulb/i, /screamingfrog/i, /curl\//i, /wget\//i,
    /python-requests\//i
  ]

  private readonly headlessPatterns: RegExp[] = [
    /headlesschrome/i, /headless/i, /playwright/i, /puppeteer/i,
    /selenium/i, /webdriver/i, /phantom/i, /jsdom/i,
    /lighthouse/i
  ]

  async detect(userAgent: string, ip: string): Promise<BotDetectionResult> {
    const normalizedUserAgent = userAgent.toLowerCase()
    const reasons: string[] = []
    let score = 0

    for (const pattern of this.botPatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 50
        reasons.push('Known bot or crawler user-agent signature')
        break
      }
    }

    if (score === 0 && /(crawler|spider|scrape|archive)/i.test(userAgent)) {
      score += 40
      reasons.push('Crawler-like token detected in user-agent')
    }

    for (const pattern of this.headlessPatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 50
        reasons.push('Automation or headless browser detected')
        break
      }
    }

    const frequency = this.getRequestFrequency(ip)
    if (frequency > 20) {
      score += 25
      reasons.push(`High request frequency: ${frequency}/min`)
    }

    return {
      isBot: score >= 50,
      score: Math.min(score, 100),
      reasons,
    }
  }

  private getRequestFrequency(ip: string): number {
    const now = Date.now()
    const timestamps = BotDetectionService.requestFrequency.get(ip) || []
    const recent = timestamps.filter((timestamp) => now - timestamp < 60000)

    recent.push(now)
    BotDetectionService.requestFrequency.set(ip, recent)

    return recent.length
  }
}