interface BotDetectionResult {
  isBot: boolean
  score: number
  reasons: string[]
}

export class BotDetectionService {
  private readonly botPatterns: RegExp[] = [
    /bot/i, /crawl/i, /spider/i, /scrape/i, /slurp/i,
    /googlebot/i, /bingbot/i, /yandex/i, /baidu/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /whatsapp/i, /telegram/i, /slack/i, /discord/i,
    /ia_archiver/i, /seznam/i, /sogou/i, /exabot/i,
    /majestic/i, /rogerbot/i, /dotbot/i
  ]

  private readonly headlessPatterns: RegExp[] = [
    /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
    /playwright/i, /webkit/i, /jsdom/i
  ]

  private requestFrequency: Map<string, number[]> = new Map()

  async detect(userAgent: string, ip: string): Promise<BotDetectionResult> {
    const reasons: string[] = []
    let score = 0

    for (const pattern of this.botPatterns) {
      if (pattern.test(userAgent)) {
        score += 30
        reasons.push('User-Agent matches bot pattern')
        break
      }
    }

    for (const pattern of this.headlessPatterns) {
      if (pattern.test(userAgent)) {
        score += 25
        reasons.push('Headless browser detected')
        break
      }
    }

    const frequency = this.getRequestFrequency(ip)
    if (frequency > 100) {
      score += 20
      reasons.push(`High request frequency: ${frequency}/min`)
    }

    return { isBot: score > 70, score, reasons }
  }

  private getRequestFrequency(ip: string): number {
    const now = Date.now()
    const timestamps = this.requestFrequency.get(ip) || []
    const recent = timestamps.filter(t => now - t < 60000)
    this.requestFrequency.set(ip, recent)
    return recent.length
  }
}